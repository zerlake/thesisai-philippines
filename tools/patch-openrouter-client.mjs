// tools/patch-openrouter-client.mjs

// WARNING: make a git commit before running. This edits files in-place.

import fs from "fs/promises";
import path from "path";

const functionsDir = "supabase/functions";
const sharedImport = `import { getOpenRouterClient } from "../_shared/openrouter.ts";\n`;

async function processFunction(fnDir) {
  const indexPath = path.join(functionsDir, fnDir, "index.ts");
  try {
    await fs.access(indexPath); // Check if the file exists
  } catch (error) {
    // If file doesn't exist, just return silently
    return;
  }

  try {
    let src = await fs.readFile(indexPath, "utf8");

    // Check if the file contains direct OpenAI initialization
    if (!src.includes("new OpenAI(") && !src.includes("new OpenAI({")) return;

    // Add import after first import block
    if (!src.includes(sharedImport.trim())) {
      src = src.replace(
        /(import[\s\S]*?;)\n/,
        `$1\n${sharedImport}`,
      );
    }

    // Remove existing new OpenAI(...) block and replace with shared client usage
    src = src.replace(
      /import OpenAI from "npm:openai @4.12.0";\n\nconst SITE_URL = ".*?";\nconst SITE_NAME = ".*?";\n\nconst openai = new OpenAI[\s\S]*?\);/,
      "const openai = getOpenRouterClient();",
    );

    const patchedPath = indexPath.replace(/\.ts$/, '.patched.ts');
    await fs.writeFile(patchedPath, src);
    console.log("Patched", indexPath, "->", patchedPath);
  } catch (err) {
    // file may not exist or other error
    console.error("Error patching file", indexPath, err);
  }
}

(async () => {
  const items = await fs.readdir(functionsDir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      await processFunction(item.name);
    }
  }
  console.log("Done. Review .patched.ts files and apply manually.");
})();
