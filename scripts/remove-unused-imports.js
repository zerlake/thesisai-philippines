#!/usr/bin/env node

/**
 * Script to remove unused imports that can contribute to bundle size
 */
const fs = require('fs');
const path = require('path');

// Find all TypeScript and JavaScript files in the src directory
function getAllSourceFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      results = results.concat(getAllSourceFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      if (!item.includes('.d.ts') && !item.includes('node_modules')) {
        results.push(fullPath);
      }
    }
  });

  return results;
}

// Check if an import is used in the file
function isImportUsed(content, importName) {
  // Create a regex to find the import name, but not in import statements
  // This checks for usage of the variable elsewhere in the file
  const regex = new RegExp(`\\b${importName.trim()}\\b(?!\\s*from)(?!\\s*=\\s*import)`, 'g');
  const matches = content.match(regex);
  
  if (!matches) return false;
  
  // Count matches in actual code vs. matches in comments/strings
  // This is a simplified approach - in a real implementation you might want something more sophisticated
  return matches.length > 0;
}

// Remove unused imports from a file
function removeUnusedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Find all import statements
  const importRegex = /import\s+({[^}]+}|[\w*${}\s,]+)\s+from\s+['"][^'"]+['"];?/g;
  let match;
  
  const imports = [];
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      full: match[0],
      names: match[1],
      index: match.index,
      length: match[0].length
    });
  }
  
  // For named imports like { name1, name2 }
  const namedImportRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
  const namedImports = [];
  while ((match = namedImportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim()).map(n => n.split(' as ')[0].trim());
    namedImports.push({
      full: match[0],
      names: names,
      index: match.index,
      length: match[0].length
    });
  }
  
  // Find unused named imports
  const unusedImports = [];
  namedImports.forEach(imp => {
    imp.names.forEach(name => {
      if (!isImportUsed(content.replace(imp.full, ''), name)) {
        unusedImports.push({ name, importStatement: imp });
      }
    });
  });
  
  // Remove unused imports by reconstructing the content
  if (unusedImports.length > 0) {
    unusedImports.forEach(unused => {
      const importStatement = unused.importStatement;
      const names = importStatement.names.split(',');
      const remainingNames = names.filter(n => {
        const cleanName = n.trim().split(' as ')[0].trim();
        return !unusedImports.some(u => u.name === cleanName);
      });
      
      if (remainingNames.length === 0) {
        // Remove entire import statement
        content = content.replace(importStatement.full, '');
      } else {
        // Replace with remaining names
        const newImport = importStatement.full.replace(
          '{' + importStatement.names + '}',
          '{' + remainingNames.join(', ') + '}'
        );
        content = content.replace(importStatement.full, newImport);
      }
    });
    
    // Clean up extra whitespace and empty lines
    content = content.replace(/^\s*[\r\n]/gm, '');
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed unused imports in: ${filePath}`);
  }
  
  return originalContent !== content;
}

// Main execution
console.log('🔍 Cleaning up unused imports to improve bundle size...\n');

const sourceDir = path.join(__dirname, 'src');
const files = getAllSourceFiles(sourceDir);

let fixedFilesCount = 0;
files.forEach(file => {
  try {
    if (removeUnusedImports(file)) {
      fixedFilesCount++;
    }
  } catch (e) {
    console.error(`Error processing file ${file}:`, e.message);
  }
});

console.log(`\n✅ Done! Fixed ${fixedFilesCount} files with unused imports.`);
console.log('This should help reduce bundle size and improve TBT.');