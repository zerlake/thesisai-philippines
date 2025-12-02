#!/usr/bin/env node

/**
 * Landing Page Component Analysis
 * Identifies heavy components, large images, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

console.log('\n📊 Landing Page Component Analysis');
console.log('===================================\n');

// Check landing page structure
const landingPagePath = path.join('src', 'app', '(marketing)', 'page.tsx');

if (!fs.existsSync(landingPagePath)) {
  console.log('⚠️  Could not find landing page at:', landingPagePath);
  console.log('\nSearching for landing page files...\n');
  
  // Search for page files
  const findPages = (dir, pattern = /page\.(tsx|ts|jsx|js)$/) => {
    const results = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        results.push(...findPages(fullPath, pattern));
      } else if (pattern.test(file)) {
        results.push(fullPath);
      }
    });
    
    return results;
  };
  
  const pages = findPages('src');
  console.log('Found page files:');
  pages.forEach(p => console.log(`  • ${p}`));
  
  process.exit(0);
}

// Read the landing page
const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');

// Analyze imports
console.log('📝 Landing Page Analysis\n');
console.log('File:', landingPagePath);
console.log('Size:', (landingPageContent.length / 1024).toFixed(2), 'KB\n');

// Check for heavy imports
const imports = landingPageContent.match(/^import.*from ['"].*['"]/gm) || [];
console.log(`Imports Found: ${imports.length}\n`);

const heavyPatterns = [
  { pattern: /recharts/i, name: 'Recharts (charting library)' },
  { pattern: /framer-motion/i, name: 'Framer Motion (animations)' },
  { pattern: /three/i, name: 'Three.js (3D)' },
  { pattern: /@lottie-web/i, name: 'Lottie (animations)' },
  { pattern: /mapbox/i, name: 'Mapbox (maps)' },
  { pattern: /highlight\.js/i, name: 'Highlight.js (code highlighting)' }
];

console.log('Heavy Libraries Detected:');
let detectedHeavy = 0;
heavyPatterns.forEach(({ pattern, name }) => {
  if (pattern.test(landingPageContent)) {
    console.log(`  ⚠️  ${name}`);
    detectedHeavy++;
  }
});

if (detectedHeavy === 0) {
  console.log('  ✅ No obviously heavy libraries detected');
}

// Check for Image component usage
console.log('\n🖼️  Image Usage:');
const imageImports = landingPageContent.match(/from ['"]next\/image['"]/g) || [];
const nextImageUsage = landingPageContent.match(/<Image[^>]*>/g) || [];
const htmlImages = landingPageContent.match(/<img[^>]*>/g) || [];

console.log(`  • Next.js Image imports: ${imageImports.length}`);
console.log(`  • Image components used: ${nextImageUsage.length}`);
console.log(`  • HTML img tags: ${htmlImages.length}`);

if (htmlImages.length > 0) {
  console.log('\n  ⚠️  WARNING: HTML img tags found (should use Next.js Image)');
  htmlImages.slice(0, 3).forEach(img => {
    const srcMatch = img.match(/src=['"]([^'"]+)['"]/);
    if (srcMatch) {
      console.log(`     • ${srcMatch[1]}`);
    }
  });
}

// Check for layout issues
console.log('\n⚡ Layout & Performance Indicators:');

const hasUseClient = landingPageContent.includes("'use client'");
console.log(`  ${hasUseClient ? '⚠️ ' : '✅'} 'use client' directive: ${hasUseClient ? 'YES (check if needed)' : 'NO (good - server component)'}`);

const suspenseUsage = landingPageContent.match(/<Suspense/g) || [];
console.log(`  ${suspenseUsage.length > 0 ? '✅' : '⚠️ '} Suspense boundaries: ${suspenseUsage.length > 0 ? `YES (${suspenseUsage.length})` : 'NONE (consider adding)'}`);

const dynamicImports = landingPageContent.match(/dynamic\(\s*\(\)\s*=>\s*import/g) || [];
console.log(`  ${dynamicImports.length > 0 ? '✅' : '⚠️ '} Dynamic imports: ${dynamicImports.length > 0 ? `YES (${dynamicImports.length})` : 'NONE (consider lazy loading)'}`);

// Check component structure
console.log('\n🏗️  Component Structure:');

const componentExports = landingPageContent.match(/export\s+(default\s+)?function\s+\w+|export\s+(default\s+)?const\s+\w+\s*=/g) || [];
console.log(`  Components defined: ${componentExports.length}`);

// Check for inline styles (performance issue)
const inlineStyles = landingPageContent.match(/style\s*=\s*\{\{[^}]+\}\}/g) || [];
console.log(`  Inline styles: ${inlineStyles.length > 0 ? `⚠️  ${inlineStyles.length} found (use Tailwind instead)` : '✅ None found'}`);

// Recommendations
console.log('\n\n💡 Optimization Recommendations:\n');

const recs = [];

if (htmlImages.length > 0) {
  recs.push('1. Replace all <img> tags with Next.js <Image> component for automatic optimization');
}

if (hasUseClient && !landingPageContent.includes('interactive')) {
  recs.push('2. Consider if "use client" is necessary - use Server Components where possible');
}

if (dynamicImports.length === 0) {
  recs.push('3. Add dynamic imports for below-the-fold sections (lazy loading)');
}

if (suspenseUsage.length === 0) {
  recs.push('4. Implement Suspense boundaries for better loading states');
}

if (inlineStyles.length > 0) {
  recs.push('5. Move inline styles to Tailwind classes for better performance');
}

if (imports.length > 20) {
  recs.push('6. Consider splitting this page into smaller sub-components');
}

recs.forEach(rec => console.log(`  ${rec}`));

// Check public folder for unoptimized images
console.log('\n\n📷 Public Assets Analysis:\n');

const publicDir = 'public';
if (fs.existsSync(publicDir)) {
  const findImages = (dir, ext = /\.(png|jpg|jpeg|gif|webp|svg)$/i) => {
    const results = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        results.push(...findImages(fullPath, ext));
      } else if (ext.test(file)) {
        results.push({ path: fullPath, size: stat.size });
      }
    });
    
    return results;
  };
  
  const images = findImages(publicDir);
  console.log(`Images found in /public: ${images.length}\n`);
  
  // Show largest images
  const sorted = images.sort((a, b) => b.size - a.size);
  console.log('Largest images:');
  sorted.slice(0, 10).forEach(img => {
    const sizeMB = img.size / (1024 * 1024);
    const status = sizeMB > 0.5 ? '❌' : sizeMB > 0.1 ? '⚠️ ' : '✅';
    console.log(`  ${status} ${img.path}: ${img.size > 1024*1024 ? (sizeMB).toFixed(2) + 'MB' : (img.size / 1024).toFixed(2) + 'KB'}`);
  });
}

console.log('\n');
