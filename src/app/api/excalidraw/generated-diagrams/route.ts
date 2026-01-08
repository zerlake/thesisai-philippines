import { NextRequest, NextResponse } from "next/server";
import { generateId } from "../elements/lib/utils";
import { generateDiagramWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for generated diagrams (in production, use a database)
let generatedDiagrams: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const { prompt, diagramId } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Generate a new diagram ID if not provided
    const id = diagramId || generateId();
    
    // Call the MCP service to generate elements based on the prompt
    const result = await generateDiagramWithMCP(prompt);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to generate diagram" },
        { status: 500 }
      );
    }

    const generatedElements = result.elements;

    // Store the generated diagram
    generatedDiagrams[id] = {
      id,
      elements: generatedElements,
      prompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      diagramId: id,
      elements: generatedElements,
      count: generatedElements.length,
    });
  } catch (error) {
    console.error("Error generating diagram:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate diagram" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const diagramId = searchParams.get("id");

  if (!diagramId) {
    // Return all diagrams (for debugging, in production you might want to restrict this)
    return NextResponse.json({
      success: true,
      diagrams: Object.values(generatedDiagrams),
      count: Object.keys(generatedDiagrams).length,
    });
  }

  const diagram = generatedDiagrams[diagramId];
  if (!diagram) {
    return NextResponse.json(
      { success: false, error: "Diagram not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    diagram,
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const diagramId = searchParams.get("id");

  if (!diagramId) {
    return NextResponse.json(
      { success: false, error: "Diagram ID is required" },
      { status: 400 }
    );
  }

  if (!generatedDiagrams[diagramId]) {
    return NextResponse.json(
      { success: false, error: "Diagram not found" },
      { status: 404 }
    );
  }

  delete generatedDiagrams[diagramId];
  
  return NextResponse.json({
    success: true,
    message: "Diagram deleted successfully",
  });
}