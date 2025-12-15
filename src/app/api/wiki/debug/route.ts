import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wikiDir = join(process.cwd(), "docs", "wiki");
    
    return NextResponse.json({
      wikiDir,
      cwd: process.cwd(),
      message: "Debug info"
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
    });
  }
}
