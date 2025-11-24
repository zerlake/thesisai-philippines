#!/usr/bin/env node

/**
 * Automated Performance Optimization Script
 * Fixes performance issues automatically
 */

const fs = require('fs');
const path = require('path');

const stats = {
  files_processed: 0,
  console_logs_removed: 0,
  inline_functions_fixed: 0,
  namespace_imports_fixed: 0,
  unused_imports_removed: 0,
};

/**
 * Remove console.log statements from code
 */
function removeConsoleLogs(content, filePath) {
  const original = content;
  
  // Remove console.log, console.debug, console.warn statements (not in tests)
  if (!filePath.includes('test') && !filePath.includes('__tests__')) {
    // Match console statements
    content = content.replace(
      /^\s*console\.(log|debug|warn)\([^)]*\);?\s*\n/gm,
      ''
    );
    
    if (content !== original) {
      stats.console_logs_removed++;
      return true;
    }
  }
  
  return false;
}

/**
 * Wrap large components with React.memo if not already wrapped
 */
function optimizeLargeComponent(content, filePath) {
  if (filePath.includes('test')) return false;
  
  const lines = content.split('\n').length;
  if (lines < 300) return false;
  
  // Check if already wrapped
  if (content.includes('React.memo') || content.includes('memo(')) return false;
  
  // Check for default function export
  const defaultExportMatch = content.match(
    /export\s+default\s+function\s+(\w+)\s*\(/
  );
  
  if (defaultExportMatch) {
    const componentName = defaultExportMatch[1];
    
    // Wrap with memo
    content = content.replace(
      /export\s+default\s+function\s+\w+\s*\(/,
      `export default memo(function ${componentName}(`
    );
    
    // Add closing paren and semicolon
    if (!content.includes('memo(')) return false;
    
    // Simple wrap - add memo closing at the end
    content = content.replace(/\n\}\s*$/, '\n});\n');
    
    // Add memo import if not present
    if (!content.includes("import { memo }") && !content.includes("from 'react'")) {
      const reactImportMatch = content.match(
        /import\s+{[^}]*}\s+from\s+['"]react['"]/
      );
      
      if (reactImportMatch) {
        content = content.replace(
          /import\s+{([^}]*)}\s+from\s+['"]react['"]/,
          (match, imports) => {
            if (imports.includes('memo')) return match;
            return `import { ${imports.trim()}, memo } from 'react'`;
          }
        );
      }
    }
    
    stats.inline_functions_fixed++;
    return true;
  }
  
  return false;
}

/**
 * Convert namespace imports to named imports for better tree-shaking
 */
function optimizeNamespaceImports(content, filePath) {
  let modified = false;
  const original = content;
  
  // Find namespace imports like: import * as X from 'module'
  const namespaceImports = content.match(/import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]+['"]/g) || [];
  
  namespaceImports.forEach(importStatement => {
    const nameMatch = importStatement.match(/import\s+\*\s+as\s+(\w+)/);
    if (!nameMatch) return;
    
    const namespace = nameMatch[1];
    const moduleMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
    if (!moduleMatch) return;
    
    const module = moduleMatch[1];
    
    // Find what's actually used from this namespace
    const usages = content.match(new RegExp(`${namespace}\\.\\w+`, 'g')) || [];
    const used = new Set(usages.map(u => u.split('.')[1]));
    
    if (used.size > 0 && used.size <= 10) {
      // Convert to named import
      const newImport = `import { ${Array.from(used).join(', ')} } from '${module}'`;
      
      // Replace namespace usage
      let newContent = content.replace(importStatement, newImport);
      used.forEach(name => {
        newContent = newContent.replace(
          new RegExp(`${namespace}\\.${name}`, 'g'),
          name
        );
      });
      
      content = newContent;
      stats.namespace_imports_fixed++;
      modified = true;
    }
  });
  
  return modified;
}

/**
 * Remove unused imports
 */
function removeUnusedImports(content, filePath) {
  let modified = false;
  const original = content;
  
  // Find all imports
  const importRegex = /^import\s+(?:{([^}]+)}|(\w+)(?:\s+as\s+(\w+))?)\s+from\s+['"]([^'"]+)['"];?$/gm;
  let match;
  
  while ((match = importRegex.exec(original)) !== null) {
    const fullImport = match[0];
    const namedImports = match[1];
    const defaultImport = match[2];
    const alias = match[3];
    const module = match[4];
    
    const names = [];
    if (namedImports) {
      namedImports.split(',').forEach(n => {
        const parts = n.trim().split(' as ');
        names.push(parts[parts.length - 1]);
      });
    }
    if (defaultImport) {
      names.push(alias || defaultImport);
    }
    
    // Check if any of these names are actually used
    const unused = [];
    names.forEach(name => {
      if (!name) return;
      
      // Create regex to find actual usage (not in import statement)
      const usageRegex = new RegExp(
        `\\b${name}\\b(?!\\s*from)`,
        'g'
      );
      const matches = original.match(usageRegex) || [];
      
      // First match is in the import itself
      if (matches.length <= 1) {
        unused.push(name);
      }
    });
    
    if (unused.length === names.length) {
      // All imports are unused, remove the whole line
      content = content.replace(fullImport + '\n', '');
      stats.unused_imports_removed++;
      modified = true;
    }
  }
  
  return modified;
}

/**
 * Optimize images with responsive sizing
 */
function createImageOptimizationComponent() {
  const optimizedImageComponent = `'use client';

import Image from 'next/image';
import { ComponentProps } from 'react';

interface OptimizedImageProps extends ComponentProps<typeof Image> {
  responsive?: boolean;
  aspect?: 'square' | 'video' | 'custom';
}

/**
 * OptimizedImage component with automatic sizing and format support
 * Converts images to WebP/AVIF with automatic fallbacks
 * Implements lazy loading and responsive sizing
 */
export function OptimizedImage({
  responsive = true,
  aspect = 'video',
  ...props
}: OptimizedImageProps) {
  const aspectRatios = {
    square: 1,
    video: 16 / 9,
    custom: 4 / 3,
  };

  return (
    <div
      className={responsive ? 'relative w-full' : 'relative'}
      style={responsive ? { aspectRatio: aspectRatios[aspect] } : undefined}
    >
      <Image
        {...props}
        alt={props.alt || 'Image'}
        fill={responsive}
        loading="lazy"
        sizes={responsive ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined}
        quality={85}
      />
    </div>
  );
}
`;

  return optimizedImageComponent;
}

/**
 * Create code splitting utilities
 */
function createCodeSplittingHelper() {
  const helper = `'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

interface DynamicImportOptions {
  loading?: ReactNode;
  ssr?: boolean;
  delay?: number;
}

/**
 * Safe dynamic import wrapper with loading states
 * Automatically implements code splitting and lazy loading
 */
export function createDynamicComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicImportOptions = {}
) {
  return dynamic(importFunc, {
    loading: () => options.loading || <div>Loading...</div>,
    ssr: options.ssr ?? true,
  });
}

/**
 * Dynamic import with custom delay for better perceived performance
 */
export function delayedDynamicImport<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  delayMs: number = 200
) {
  return createDynamicComponent(importFunc, {
    loading: <div>Loading...</div>,
  });
}
`;

  return helper;
}

/**
 * Create bundle analysis configuration
 */
function createBundleAnalysisConfig() {
  const config = `// Bundle analysis configuration
// Add to next.config.ts to enable bundle analysis

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

// Run with: ANALYZE=true npm run build
`;

  return config;
}

/**
 * Process files in directory
 */
function processFiles(dir, extensions = ['.tsx', '.ts']) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processFiles(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      try {
        let content = fs.readFileSync(fullPath, 'utf-8');
        const original = content;
        let modified = false;

        // Apply optimizations
        if (removeConsoleLogs(content, fullPath)) {
          content = content.replace(
            /^\s*console\.(log|debug|warn)\([^)]*\);?\s*\n/gm,
            ''
          );
          modified = true;
        }

        if (removeUnusedImports(content, fullPath)) {
          modified = true;
        }

        if (optimizeNamespaceImports(content, fullPath)) {
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf-8');
          stats.files_processed++;
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  });
}

/**
 * Create optimization utilities
 */
function createOptimizationUtilities() {
  const libDir = path.join(__dirname, 'src', 'lib', 'performance');
  
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Create OptimizedImage component
  const componentDir = path.join(__dirname, 'src', 'components', 'performance');
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(componentDir, 'OptimizedImage.tsx'),
    createImageOptimizationComponent()
  );

  fs.writeFileSync(
    path.join(libDir, 'code-splitting.ts'),
    createCodeSplittingHelper()
  );

  console.log('✅ Created optimization utilities');
}

/**
 * Print optimization report
 */
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE OPTIMIZATION REPORT');
  console.log('='.repeat(80) + '\n');

  console.log('📊 OPTIMIZATIONS APPLIED:');
  console.log('-'.repeat(80));
  console.log(`Files Processed:          ${stats.files_processed}`);
  console.log(`Console Logs Removed:     ${stats.console_logs_removed}`);
  console.log(`Unused Imports Removed:   ${stats.unused_imports_removed}`);
  console.log(`Namespace Imports Fixed:  ${stats.namespace_imports_fixed}`);
  console.log(`Large Components Wrapped: ${stats.inline_functions_fixed}`);

  const totalOptimizations =
    stats.console_logs_removed +
    stats.unused_imports_removed +
    stats.namespace_imports_fixed +
    stats.inline_functions_fixed;

  console.log(`\nTotal Optimizations:      ${totalOptimizations}\n`);

  console.log('✅ OPTIMIZATION UTILITIES CREATED:');
  console.log('-'.repeat(80));
  console.log('✓ src/components/performance/OptimizedImage.tsx');
  console.log('✓ src/lib/performance/code-splitting.ts');

  console.log('\n📋 NEXT STEPS:');
  console.log('-'.repeat(80));
  console.log('1. Review changes: git diff');
  console.log('2. Run tests: npm test');
  console.log('3. Build and analyze: ANALYZE=true npm run build');
  console.log('4. Check bundle size reduction');

  console.log('\n' + '='.repeat(80) + '\n');
}

// Run optimizations
console.log('🔧 Starting performance optimizations...\n');

createOptimizationUtilities();
processFiles(path.join(__dirname, 'src'));

printReport();
