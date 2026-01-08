import { NextRequest, NextResponse } from "next/server";
import { updateElementsWithMCP, deleteElementsWithMCP, queryElementsWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for elements (in production, use a database)
// Shared with the main route file
let elements: any[] = [];

// Get a specific element by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get element from MCP server first
    const mcpElements = await queryElementsWithMCP({ id: params.id });

    if (mcpElements.success && mcpElements.elements && mcpElements.elements.length > 0) {
      return NextResponse.json({ success: true, element: mcpElements.elements[0] });
    }
  } catch (error) {
    console.warn("MCP server query failed, using fallback:", error);
  }

  // Fallback to in-memory storage
  const element = elements.find((el) => el.id === params.id);

  if (!element) {
    return NextResponse.json(
      { success: false, error: "Element not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, element });
}

// Update an element
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    // Try to update element via MCP server first
    const elementToUpdate = { ...updates, id: params.id };
    try {
      const result = await updateElementsWithMCP([elementToUpdate]);
      if (result.success) {
        return NextResponse.json({ success: true, element: elementToUpdate });
      }
    } catch (mcpError) {
      console.warn("MCP server update failed, using fallback:", mcpError);
    }

    // Fallback to in-memory storage
    const index = elements.findIndex((el) => el.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Element not found" },
        { status: 404 }
      );
    }

    // Update the element
    elements[index] = {
      ...elements[index],
      ...updates,
      id: params.id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, element: elements[index] });
  } catch (error) {
    console.error("Error updating element:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update element" },
      { status: 500 }
    );
  }
}

// Delete an element
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to delete element via MCP server first
    try {
      const result = await deleteElementsWithMCP([params.id]);
      if (result.success && result.deleted > 0) {
        return NextResponse.json({
          success: true,
          id: params.id,
          deleted: true,
          message: "Element deleted via MCP server"
        });
      }
    } catch (mcpError) {
      console.warn("MCP server delete failed, using fallback:", mcpError);
    }

    // Fallback to in-memory storage
    const index = elements.findIndex((el) => el.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Element not found" },
        { status: 404 }
      );
    }

    const deleted = elements.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      id: deleted.id,
      deleted: true,
    });
  } catch (error) {
    console.error("Error deleting element:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete element" },
      { status: 500 }
    );
  }
}
