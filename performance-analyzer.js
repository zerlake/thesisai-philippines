#!/usr/bin/env node

/**
 * Comprehensive Performance Analyzer
 * Identifies bottlenecks and generates optimization recommendations
 */

const fs = require('fs');
const path = require('path');

const analysis = {
  files: {
    large: [],
    unused_imports: [],
    large_dependencies: [],
  },
  metrics: {
    total_components: 0,
    total_utilities: 0,
    avg_file_size: 0,
    largest_files: [],
  },
  issues: [],
  recommendations: [],
};

// Scan source files
function scanSourceFiles() {
  const srcDir = path.join(__dirname, 'src');
  
  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        traverseDir(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;
        const size = stat.size;
        
        // Track file size
        if (lines > 500) {
          analysis.files.large.push({
            path: fullPath.replace(__dirname, ''),
            lines,
            size,
          });
        }
        
        // Track components vs utilities
        if (fullPath.includes('components')) {
          analysis.metrics.total_components++;
        } else if (fullPath.includes('lib') || fullPath.includes('utils')) {
          analysis.metrics.total_utilities++;
        }
        
        // Check for unused imports
        const unusedImports = findUnusedImports(content, fullPath);
        if (unusedImports.length > 0) {
          analysis.files.unused_imports.push({
            path: fullPath.replace(__dirname, ''),
            unused: unusedImports,
          });
        }
      }
    });
  }
  
  traverseDir(srcDir);
}

// Find unused imports in a file
function findUnusedImports(content, filePath) {
  const unused = [];
  const importRegex = /import\s+(?:{[^}]+}|[^\s]+)\s+from\s+['"][^'"]+['"]/g;
  const imports = content.match(importRegex) || [];
  
  imports.forEach(importStatement => {
    // Extract imported names
    const nameMatch = importStatement.match(/import\s+(?:{([^}]+)}|(\w+))/);
    if (!nameMatch) return;
    
    const importedNames = nameMatch[1]
      ? nameMatch[1].split(',').map(n => n.trim().split(' as ')[0])
      : [nameMatch[2]];
    
    // Check usage
    importedNames.forEach(name => {
      if (!name) return;
      // Simple regex check - may have false positives
      const usageRegex = new RegExp(`\\b${name}\\b(?!\\s*from)`, 'g');
      const matches = content.match(usageRegex) || [];
      
      // If only appears in import statement, it's unused
      if (matches.length === 1) {
        unused.push(name);
      }
    });
  });
  
  return unused;
}

// Analyze dependencies
function analyzeDependencies() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  // Flag potentially large or unused dependencies
  const largeLibraries = [
    'lodash',
    'moment',
    'chart.js',
    'd3',
    'jquery',
    'bootstrap',
  ];
  
  Object.keys(allDeps).forEach(dep => {
    if (largeLibraries.includes(dep)) {
      analysis.files.large_dependencies.push({
        name: dep,
        alternative: getAlternative(dep),
      });
    }
  });
}

// Get alternative for large dependencies
function getAlternative(dep) {
  const alternatives = {
    lodash: 'lodash-es (tree-shakeable) or native utilities',
    moment: 'date-fns or dayjs',
    'chart.js': 'recharts or visx',
    d3: 'visx or observable-plot',
    jquery: 'native DOM APIs',
    bootstrap: 'tailwindcss (already installed)',
  };
  return alternatives[dep] || 'Consider alternatives';
}

// Scan for performance anti-patterns
function findPerformanceIssues() {
  const srcDir = path.join(__dirname, 'src');
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanDir(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const fileName = fullPath.replace(__dirname, '');
        
        // Check for inline function definitions in render
        if (content.match(/onClick=\{.*=>/g)) {
          analysis.issues.push({
            type: 'inline-function',
            file: fileName,
            severity: 'medium',
            description: 'Inline functions in JSX can cause unnecessary re-renders',
          });
        }
        
        // Check for large imports
        if (content.match(/import \* as /g)) {
          analysis.issues.push({
            type: 'namespace-import',
            file: fileName,
            severity: 'medium',
            description: 'Namespace imports prevent tree-shaking',
          });
        }
        
        // Check for console.log in production code
        if (content.match(/console\.(log|debug)/g) && !file.includes('test')) {
          analysis.issues.push({
            type: 'console-logs',
            file: fileName,
            severity: 'low',
            description: 'Remove console.log statements from production code',
          });
        }
        
        // Check for missing React.memo or useMemo
        if (content.includes('export default function') && content.length > 3000) {
          analysis.issues.push({
            type: 'large-component',
            file: fileName,
            severity: 'medium',
            description: 'Large component should consider React.memo or useMemo',
          });
        }
      }
    });
  }
  
  scanDir(srcDir);
}

// Generate recommendations
function generateRecommendations() {
  // Bundle size recommendations
  if (analysis.files.large.length > 0) {
    analysis.recommendations.push({
      priority: 'high',
      category: 'Code Splitting',
      description: `${analysis.files.large.length} files are over 500 lines. Consider splitting them:`,
      files: analysis.files.large.slice(0, 5),
      action: 'Implement code splitting with dynamic imports',
    });
  }
  
  // Unused imports
  if (analysis.files.unused_imports.length > 0) {
    analysis.recommendations.push({
      priority: 'medium',
      category: 'Cleanup',
      description: `Found ${analysis.files.unused_imports.length} files with potentially unused imports`,
      action: 'Remove unused imports to reduce bundle size',
    });
  }
  
  // Large dependencies
  if (analysis.files.large_dependencies.length > 0) {
    analysis.recommendations.push({
      priority: 'high',
      category: 'Dependencies',
      description: 'Consider lighter alternatives for these libraries:',
      dependencies: analysis.files.large_dependencies,
      action: 'Replace with smaller alternatives or tree-shakeable versions',
    });
  }
  
  // Performance patterns
  if (analysis.issues.length > 0) {
    analysis.recommendations.push({
      priority: 'medium',
      category: 'Code Quality',
      description: `Found ${analysis.issues.length} potential performance issues`,
      count: analysis.issues.length,
      action: 'Fix anti-patterns to improve rendering performance',
    });
  }
}

// Print report
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Summary
  console.log('📊 CODEBASE METRICS');
  console.log('-'.repeat(80));
  console.log(`Total Components: ${analysis.metrics.total_components}`);
  console.log(`Total Utilities: ${analysis.metrics.total_utilities}`);
  console.log(`Large Files (>500 lines): ${analysis.files.large.length}`);
  console.log(`Files with Unused Imports: ${analysis.files.unused_imports.length}`);
  console.log(`Large Dependencies: ${analysis.files.large_dependencies.length}`);
  console.log(`Performance Issues Found: ${analysis.issues.length}\n`);
  
  // Top largest files
  if (analysis.files.large.length > 0) {
    console.log('🔴 LARGEST FILES (Code Splitting Candidates)');
    console.log('-'.repeat(80));
    analysis.files.large.slice(0, 5).forEach((file, i) => {
      console.log(`${i + 1}. ${file.path}`);
      console.log(`   Lines: ${file.lines} | Size: ${(file.size / 1024).toFixed(2)}KB`);
    });
    console.log();
  }
  
  // Large dependencies
  if (analysis.files.large_dependencies.length > 0) {
    console.log('📦 LARGE DEPENDENCIES');
    console.log('-'.repeat(80));
    analysis.files.large_dependencies.forEach(dep => {
      console.log(`❌ ${dep.name}`);
      console.log(`   → Consider: ${dep.alternative}`);
    });
    console.log();
  }
  
  // Performance issues
  if (analysis.issues.length > 0) {
    const byType = {};
    analysis.issues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });
    
    console.log('⚠️  PERFORMANCE ISSUES');
    console.log('-'.repeat(80));
    Object.entries(byType).forEach(([type, count]) => {
      const severity = analysis.issues.find(i => i.type === type).severity;
      console.log(`${type}: ${count} issues (${severity} severity)`);
    });
    console.log();
  }
  
  // Recommendations
  if (analysis.recommendations.length > 0) {
    console.log('✅ OPTIMIZATION RECOMMENDATIONS');
    console.log('-'.repeat(80));
    analysis.recommendations
      .sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      })
      .forEach(rec => {
        console.log(`[${rec.priority.toUpperCase()}] ${rec.category}: ${rec.description}`);
        console.log(`    Action: ${rec.action}\n`);
      });
  }
  
  console.log('='.repeat(80) + '\n');
}

// Export analysis as JSON
function exportAnalysis() {
  const reportPath = path.join(__dirname, 'PERFORMANCE_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`📄 Full analysis exported to: ${reportPath}\n`);
}

// Run analysis
console.log('🔍 Analyzing codebase for performance bottlenecks...\n');

scanSourceFiles();
analyzeDependencies();
findPerformanceIssues();
generateRecommendations();

printReport();
exportAnalysis();

module.exports = analysis;
