import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const WIKI_DIR = join(process.cwd(), "docs", "wiki");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Sanitize slug to prevent directory traversal
    if (!slug || slug.includes("..") || slug.includes("/")) {
      return NextResponse.json(
        { error: "Invalid wiki page slug" },
        { status: 400 }
      );
    }

    // Construct file path with .md extension
    const filePath = join(WIKI_DIR, `${slug}.md`);

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
