#!/usr/bin/env node

/**
 * Simple script to test wiki API locally
 * Run: node test-wiki-api.js
 */

const fs = require("fs");
const path = require("path");

const WIKI_DIR = path.join(process.cwd(), "docs", "wiki");

console.log("🔍 Testing Wiki API Setup\n");
console.log("Wiki directory:", WIKI_DIR);
console.log("Exists:", fs.existsSync(WIKI_DIR) ? "✅ Yes" : "❌ No");

if (!fs.existsSync(WIKI_DIR)) {
  console.error("\n❌ Wiki directory not found!");
  process.exit(1);
}

console.log("\n📂 Scanning wiki directory...\n");

try {
  const files = fs.readdirSync(WIKI_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  console.log(`Found ${files.length} files, ${mdFiles.length} are markdown:\n`);

  mdFiles.forEach((file) => {
    const filePath = path.join(WIKI_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const slug = file.replace(".md", "");

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, " ");

    // Extract description
    const lines = content.split("\n");
    const desc = lines.find(
      (l) =>
        l.trim() && !l.startsWith("#") && !l.startsWith("---")
    );

    console.log(`  📄 ${file}`);
    console.log(`     Slug: ${slug}`);
    console.log(`     Title: ${title}`);
    console.log(`     Description: ${desc ? desc.substring(0, 50) : "N/A"}...`);
    console.log();
  });

  console.log("✅ Wiki setup looks good!");
  console.log("\n🚀 Next steps:");
  console.log("  1. Run: pnpm dev");
  console.log("  2. Go to: http://localhost:3000/admin");
  console.log("  3. Click: Wiki card or tab");
  console.log("  4. Check browser console for any errors");
} catch (error) {
  console.error("❌ Error reading wiki directory:", error.message);
  process.exit(1);
}
