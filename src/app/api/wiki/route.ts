import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const WIKI_DIR = join(process.cwd(), "docs", "wiki");

export async function GET() {
  try {
    console.log("Wiki directory:", WIKI_DIR);
    
    // Use sync operations for reliability
    const files = readdirSync(WIKI_DIR);
    console.log("Files found:", files);
    
    const mdFiles = files.filter((file) => file.endsWith(".md"));
    console.log("MD files:", mdFiles);

    const pages = mdFiles.map((file) => {
      const slug = file.replace(".md", "");
      const filePath = join(WIKI_DIR, file);
      
      try {
        const content = readFileSync(filePath, "utf-8");

        // Extract first heading as title if available
        const firstHeadingMatch = content.match(/^#\s+(.+)$/m);
        const firstHeading = firstHeadingMatch ? firstHeadingMatch[1] : slug.replace(/-/g, " ");

        // Extract description from first paragraph
        const lines = content.split("\n");
        const firstParagraph = lines.find((line) => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---");
        });
        const description = firstParagraph ? firstParagraph.substring(0, 100) : "";

        console.log(`Processed ${file}:`, { title: firstHeading, slug, description });

        return {
          title: firstHeading,
          slug,
          description: description || "No description available",
        };
      } catch (error) {
        console.error(`Failed to read wiki file ${file}:`, error);
        return {
          title: slug.replace(/-/g, " "),
          slug,
          description: "Failed to load description",
        };
      }
    });

    console.log("Final pages:", pages);
    return NextResponse.json({ pages, count: pages.length });
  } catch (error) {
    console.error("Failed to read wiki directory:", error);
    return NextResponse.json(
      { 
        error: `Failed to list wiki pages: ${String(error)}`, 
        pages: [],
        wikiDir: WIKI_DIR
      },
      { status: 500 }
    );
  }
}
