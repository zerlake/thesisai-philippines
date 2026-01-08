import { NextRequest, NextResponse } from "next/server";
import { generateId } from "./lib/utils";
import { createElementsWithMCP, queryElementsWithMCP, deleteElementsWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for elements (in production, use a database)
let elements: any[] = [];

export async function GET() {
  try {
    // Try to get elements from MCP server first
    const mcpElements = await queryElementsWithMCP({});

    if (mcpElements.success) {
      return NextResponse.json({ success: true, elements: mcpElements.elements });
    } else {
      // Fallback to in-memory storage
      return NextResponse.json({ success: true, elements });
    }
  } catch (error) {
    console.error("Error getting elements:", error);
    // Fallback to in-memory storage
    return NextResponse.json({ success: true, elements });
  }
}

export async function POST(request: NextRequest) {
  try {
    const element = await request.json();

    // Generate ID if not provided
    if (!element.id) {
      element.id = generateId();
    }

    // Add timestamps
    element.createdAt = element.createdAt || new Date().toISOString();
    element.updatedAt = new Date().toISOString();

    // Convert label to text if needed for Excalidraw
    if (element.label && !element.text && element.type !== "text") {
      // Keep label for Excalidraw compatibility
    }

    // Try to create element via MCP server first
    try {
      const result = await createElementsWithMCP([element]);
      if (result.success) {
        return NextResponse.json({
          success: true,
          element: result.elements ? result.elements[0] : element,
          count: result.count || 1,
        });
      }
    } catch (mcpError) {
      console.warn("MCP server create failed, using fallback:", mcpError);
    }

    // Fallback to in-memory storage
    elements.push(element);

    return NextResponse.json({
      success: true,
      element,
      count: elements.length,
    });
  } catch (error) {
    console.error("Error creating element:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create element" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Try to clear elements via MCP server first
    const allElementsResponse = await fetch('/api/excalidraw/elements');
    const allElements = await allElementsResponse.json();

    if (allElements.elements && allElements.elements.length > 0) {
      const ids = allElements.elements.map((el: any) => el.id);
      try {
        const result = await deleteElementsWithMCP(ids);
        if (result.success) {
          elements = [];
          return NextResponse.json({
            success: true,
            message: "All elements cleared via MCP server",
            deleted: result.deleted
          });
        }
      } catch (mcpError) {
        console.warn("MCP server delete failed, using fallback:", mcpError);
      }
    }
  } catch (error) {
    console.warn("Error during MCP clear attempt:", error);
  }

  // Fallback to in-memory clear
  elements = [];
  return NextResponse.json({ success: true, message: "All elements cleared" });
}
