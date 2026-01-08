import { NextRequest, NextResponse } from "next/server";
import { generateId } from "../lib/utils";
import { createElementsWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for elements (in production, use a database)
let elements: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { elements: newElements } = await request.json();

    if (!Array.isArray(newElements)) {
      return NextResponse.json(
        { success: false, error: "Elements must be an array" },
        { status: 400 }
      );
    }

    // Process elements with IDs and timestamps
    const processedElements = newElements.map((el) => {
      return {
        ...el,
        id: el.id || generateId(),
        createdAt: el.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Try to create elements via MCP server first
    try {
      const result = await createElementsWithMCP(processedElements);
      if (result.success) {
        return NextResponse.json({
          success: true,
          elements: result.elements || processedElements,
          count: result.count || processedElements.length,
        });
      }
    } catch (mcpError) {
      console.warn("MCP server batch create failed, using fallback:", mcpError);
    }

    // Fallback to in-memory storage
    for (const element of processedElements) {
      elements.push(element);
    }

    return NextResponse.json({
      success: true,
      elements: processedElements,
      count: processedElements.length,
    });
  } catch (error) {
    console.error("Error creating elements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create elements" },
      { status: 500 }
    );
  }
}
