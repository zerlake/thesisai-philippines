#!/usr/bin/env node

// Simple script to detect unused imports in TypeScript/JSX files
const fs = require('fs');
const path = require('path');

// Walk through all files in a directory recursively
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Check if an identifier is used in the content
function isIdentifierUsed(content, identifier) {
  // Check for usage in the code (not in comments or strings)
  // This is a simplified check - could be enhanced with AST parsing
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Skip lines that appear to be import statements
    if (line.trim().startsWith('import ') || line.trim().includes(' from ')) continue;
    
    // Skip commented lines
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
    
    // Check if identifier is used (with word boundaries to avoid partial matches)
    const regex = new RegExp(`\\b${identifier}\\b`, 'g');
    if (regex.test(line)) {
      return true;
    }
  }
  
  return false;
}

// Parse import statement and extract identifiers
function parseImports(content) {
  const importRegex = /import\s+({[^}]+}|[\w*{}]+\s*,?\s*[\w*{}]*)\s+from\s+['"][^'"]+['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importStatement = match[0];
    const destructuringPart = match[1];
    
    // Handle named imports: { Component, Button, Something }
    if (destructuringPart.includes('{') && destructuringPart.includes('}')) {
      const identifiers = destructuringPart
        .replace(/[\{\}]/g, '')
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)
        .map(id => {
          // Handle aliased imports: originalName as aliasName -> extract originalName
          const parts = id.split(/\s+as\s+/);
          return parts[0].trim();
        });
      
      identifiers.forEach(id => {
        if (id) {
          imports.push({
            identifier: id,
            statement: importStatement,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      });
    }
    // Handle default imports: Component
    else if (!destructuringPart.includes('{')) {
      const identifiers = destructuringPart
        .replace(/[{},*]/g, '')
        .split(',')
        .map(id => id.trim())
        .filter(id => id && !id.startsWith('as '))
        .map(id => {
          // Handle default import aliases
          if (id.includes(' as ')) {
            return id.split(' as ')[0].trim();
          }
          return id;
        });
      
      identifiers.forEach(id => {
        if (id) {
          imports.push({
            identifier: id,
            statement: importStatement,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      });
    }
  }
  
  return imports;
}

// Find unused imports in a file
function findUnusedImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = parseImports(content);
  const unused = [];
  
  for (const imp of imports) {
    if (!isIdentifierUsed(content, imp.identifier)) {
      unused.push(imp);
    }
  }
  
  return unused;
}

// Main function to scan the src directory
function scanForUnusedImports() {
  const results = [];
  
  walkDir('./src', (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      const unused = findUnusedImports(filePath);
      if (unused.length > 0) {
        results.push({
          file: filePath,
          unusedImports: unused
        });
      }
    }
  });
  
  return results;
}

// Run the scan
console.log('Scanning for unused imports...\n');

const results = scanForUnusedImports();

if (results.length === 0) {
  console.log('No unused imports found!');
} else {
  console.log(`Found ${results.length} files with unused imports:\n`);
  
  results.forEach(result => {
    console.log(`File: ${result.file}`);
    result.unusedImports.forEach(unused => {
      console.log(`  Line ${unused.line}: ${unused.identifier} (${unused.statement})`);
    });
    console.log('');
  });
  
  console.log(`\nTotal: ${results.reduce((sum, r) => sum + r.unusedImports.length, 0)} unused imports in ${results.length} files`);
}

module.exports = { scanForUnusedImports, findUnusedImports };