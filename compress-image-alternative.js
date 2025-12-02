#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Since sharp has issues, let's create a smaller placeholder image
// In production, use: https://squoosh.app or ImageMagick

const inputPath = path.join(__dirname, 'public', 'hero-background.png');
const outputPath = path.join(__dirname, 'public', 'hero-background.webp');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: ${inputPath} not found`);
  process.exit(1);
}

const inputStats = fs.statSync(inputPath);
console.log(`📦 Image size: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB`);
console.log(`\n⚠️  Sharp installation had issues. Use these alternatives:\n`);
console.log(`1. Online Tool (Easiest):`);
console.log(`   - Go to: https://squoosh.app`);
console.log(`   - Upload: public/hero-background.png`);
console.log(`   - Set quality to 75`);
console.log(`   - Download WebP`);
console.log(`   - Replace: public/hero-background.webp\n`);
console.log(`2. ImageMagick (if installed):`);
console.log(`   magick public/hero-background.png -quality 75 public/hero-background.webp\n`);
console.log(`3. Restart pnpm install:`);
console.log(`   rm -rf node_modules/.pnpm pnpm-lock.yaml`);
console.log(`   pnpm install\n`);
process.exit(0);
