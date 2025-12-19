import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { NextResponse } from "next/server";

const WIKI_DIR = join(process.cwd(), "docs", "wiki");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // SECURITY: Sanitize slug more strictly to prevent path traversal
    // Only allow alphanumeric, hyphens, and underscores
    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid wiki page slug" },
        { status: 400 }
      );
    }

    // Construct file path with .md extension
    const filePath = join(WIKI_DIR, `${slug}.md`);
    
    // SECURITY: Verify the resolved path is still within WIKI_DIR
    const resolvedPath = resolve(filePath);
    const resolvedWikiDir = resolve(WIKI_DIR);
    
    if (!resolvedPath.startsWith(resolvedWikiDir)) {
      return NextResponse.json(
        { error: "Invalid wiki page slug" },
        { status: 400 }
      );
    }

    // Read the markdown file
    const content = await readFile(filePath, "utf-8");

    return NextResponse.json({
      slug,
      content,
      title: slug.replace(/-/g, " "),
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Failed to read wiki file for slug ${resolvedParams.slug}:`, error);

    if (error instanceof Error && error.message.includes("ENOENT")) {
      return NextResponse.json(
        { error: "Wiki page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch wiki content" },
      { status: 500 }
    );
  }
}
