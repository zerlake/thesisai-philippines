import { NextRequest, NextResponse } from "next/server";
import { queryElementsWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for elements (in production, use a database)
let elements: any[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Build filters object from search parameters
  const filters: any = {};
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  try {
    // Try to query elements from MCP server first
    const mcpElements = await queryElementsWithMCP(filters);

    if (mcpElements.success) {
      return NextResponse.json({
        success: true,
        elements: mcpElements.elements,
        count: mcpElements.count || mcpElements.elements.length,
      });
    }
  } catch (error) {
    console.warn("MCP server query failed, using fallback:", error);
  }

  // Fallback to in-memory storage
  let results = elements;

  // Apply filters to in-memory elements
  searchParams.forEach((value, key) => {
    results = results.filter((el) => String(el[key]) === value);
  });

  return NextResponse.json({
    success: true,
    elements: results,
    count: results.length,
  });
}
