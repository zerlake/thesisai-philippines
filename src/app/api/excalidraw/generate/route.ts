import { NextRequest, NextResponse } from "next/server";
import { generateId } from "../elements/lib/utils";
import { generateDiagramWithMCP } from "@/lib/mcp/excalidraw-service";

// In-memory storage for elements (in production, use a database)
let elements: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Call the MCP service to generate elements based on the prompt
    const result = await generateDiagramWithMCP(prompt);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to generate diagram" },
        { status: 500 }
      );
    }

    const generatedElements = result.elements;

    // Add the generated elements to our storage
    for (const element of generatedElements) {
      if (!element.id) {
        element.id = generateId();
      }
      element.createdAt = new Date().toISOString();
      element.updatedAt = new Date().toISOString();
      elements.push(element);
    }

    return NextResponse.json({
      success: true,
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