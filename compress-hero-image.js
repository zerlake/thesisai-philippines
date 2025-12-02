#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compressHeroImage() {
  const inputPath = path.join(__dirname, 'public', 'hero-background.png');
  const outputWebP = path.join(__dirname, 'public', 'hero-background.webp');

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: ${inputPath} not found`);
    process.exit(1);
  }

  try {
    const inputStats = fs.statSync(inputPath);
    console.log(`📦 Compressing hero image...`);
    console.log(`   Original: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB`);

    // Convert to WebP with optimized settings
    await sharp(inputPath)
      .webp({ quality: 80, alphaQuality: 100 })
      .toFile(outputWebP);

    const outputStats = fs.statSync(outputWebP);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ WebP created: ${(outputStats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Savings: ${savings}%`);
    console.log(`\n💡 Image reference updated in hero-section.tsx to use '/hero-background.webp'`);
  } catch (error) {
    console.error('Error during compression:', error);
    process.exit(1);
  }
}

compressHeroImage();
