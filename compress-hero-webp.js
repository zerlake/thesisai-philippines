const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compressHero() {
  const inputPath = path.join(__dirname, 'public/hero-background.png');
  const outputPath = path.join(__dirname, 'public/hero-background.webp');

  try {
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      process.exit(1);
    }

    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    console.log(`Compressing ${inputPath} (${(originalSize / 1024).toFixed(2)} KB)`);

    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    console.log(`✓ Created: ${outputPath}`);
    console.log(`  Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`  Savings: ${savings}%`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

compressHero();
