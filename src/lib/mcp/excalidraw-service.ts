/**
 * Excalidraw MCP Service
 * Handles communication with the Excalidraw MCP server for AI-powered diagram generation
 */

import { mcpConfig, getMCPServer } from './mcp-config';

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  verticalAlign?: string;
  points?: number[][];
}

interface GenerateDiagramResponse {
  success: boolean;
  elements: ExcalidrawElement[];
  message?: string;
}

interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  transport: 'local' | 'remote';
  enabled: boolean;
  tools: string[];
  timeout: number;
  retries: number;
}

/**
 * Generate diagram elements using the Excalidraw MCP server
 */
export async function generateDiagramWithMCP(prompt: string): Promise<GenerateDiagramResponse> {
  // Get the Excalidraw MCP server configuration
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return {
      success: false,
      elements: [],
      message: "Excalidraw MCP server is not configured or enabled"
    };
  }

  try {
    // Call the actual Excalidraw MCP server
    const response = await fetch(`${serverConfig.endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`MCP server request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      elements: data.elements || [],
      message: data.message,
    };
  } catch (error) {
    console.error('Error generating diagram with MCP:', error);
    return {
      success: false,
      elements: [],
      message: error instanceof Error ? error.message : 'MCP server unavailable'
    };
  }
}

// Helper function to generate mock elements based on the prompt
function generateMockElementsFromPrompt(prompt: string): any[] {
  // This simulates what the actual MCP server would return
  const lowerPrompt = prompt.toLowerCase();
  const elements: any[] = [];

  // Create a title element
  elements.push({
    type: "text",
    x: 400,
    y: 20,
    width: 200,
    height: 40,
    text: "AI-Generated Diagram",
    fontSize: 24,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
  });

  // Add elements based on keywords in the prompt
  if (lowerPrompt.includes("architecture") || lowerPrompt.includes("system")) {
    // Add architecture elements
    elements.push({
      type: "rectangle",
      x: 100,
      y: 80,
      width: 200,
      height: 100,
      strokeColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      strokeWidth: 2,
      roughness: 0,
      text: "Frontend",
    });

    elements.push({
      type: "rectangle",
      x: 400,
      y: 80,
      width: 200,
      height: 100,
      strokeColor: "#8b5cf6",
      backgroundColor: "#f5f3ff",
      strokeWidth: 2,
      roughness: 0,
      text: "Backend",
    });

    elements.push({
      type: "rectangle",
      x: 250,
      y: 220,
      width: 200,
      height: 100,
      strokeColor: "#10b981",
      backgroundColor: "#ecfdf5",
      strokeWidth: 2,
      roughness: 0,
      text: "Database",
    });

    // Add connecting arrows
    elements.push({
      type: "arrow",
      x: 300,
      y: 180,
      width: 100,
      height: 40,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [100, 40]],
    });

    elements.push({
      type: "arrow",
      x: 500,
      y: 180,
      width: -50,
      height: 40,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [-50, 40]],
    });
  } else if (lowerPrompt.includes("flow") || lowerPrompt.includes("process")) {
    // Add flowchart elements
    elements.push({
      type: "rectangle",
      x: 300,
      y: 100,
      width: 150,
      height: 50,
      strokeColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      strokeWidth: 2,
      roughness: 0,
      text: "Start",
    });

    elements.push({
      type: "diamond",
      x: 325,
      y: 180,
      width: 100,
      height: 50,
      strokeColor: "#f59e0b",
      backgroundColor: "#fffbeb",
      strokeWidth: 2,
      roughness: 0,
      text: "Decision",
    });

    elements.push({
      type: "rectangle",
      x: 200,
      y: 260,
      width: 100,
      height: 50,
      strokeColor: "#10b981",
      backgroundColor: "#ecfdf5",
      strokeWidth: 2,
      roughness: 0,
      text: "Yes",
    });

    elements.push({
      type: "rectangle",
      x: 400,
      y: 260,
      width: 100,
      height: 50,
      strokeColor: "#ef4444",
      backgroundColor: "#fef2f2",
      strokeWidth: 2,
      roughness: 0,
      text: "No",
    });

    // Add connecting arrows
    elements.push({
      type: "arrow",
      x: 375,
      y: 150,
      width: 0,
      height: 30,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [0, 30]],
    });

    elements.push({
      type: "arrow",
      x: 375,
      y: 230,
      width: 0,
      height: 30,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [-50, 30]],
    });

    elements.push({
      type: "arrow",
      x: 375,
      y: 230,
      width: 0,
      height: 30,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [50, 30]],
    });
  } else {
    // Default elements for other types of diagrams
    elements.push({
      type: "rectangle",
      x: 200,
      y: 100,
      width: 200,
      height: 100,
      strokeColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      strokeWidth: 2,
      roughness: 0,
      text: "Component 1",
    });

    elements.push({
      type: "ellipse",
      x: 500,
      y: 100,
      width: 150,
      height: 100,
      strokeColor: "#8b5cf6",
      backgroundColor: "#f5f3ff",
      strokeWidth: 2,
      roughness: 0,
      text: "Component 2",
    });

    elements.push({
      type: "diamond",
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      strokeColor: "#10b981",
      backgroundColor: "#ecfdf5",
      strokeWidth: 2,
      roughness: 0,
      text: "Process",
    });

    // Add connecting arrows
    elements.push({
      type: "arrow",
      x: 400,
      y: 200,
      width: 100,
      height: 50,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [100, 50]],
    });

    elements.push({
      type: "arrow",
      x: 450,
      y: 200,
      width: -50,
      height: 50,
      strokeColor: "#6b7280",
      strokeWidth: 2,
      points: [[0, 0], [-50, 50]],
    });
  }

  // Add a text element with the original prompt
  elements.push({
    type: "text",
    x: 50,
    y: 400,
    width: 600,
    height: 60,
    text: `Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}`,
    fontSize: 14,
    fontFamily: 2,
    textAlign: "left",
    verticalAlign: "top",
    strokeColor: "#6b7280",
    backgroundColor: "transparent",
  });

  return elements;
}

/**
 * Create elements via MCP
 */
export async function createElementsWithMCP(elements: any[]): Promise<any> {
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return {
      success: false,
      error: "Excalidraw MCP server is not configured or enabled"
    };
  }

  try {
    const response = await fetch(`${serverConfig.endpoint}/elements/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ elements }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create elements: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating elements with MCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create elements via MCP server'
    };
  }
}

/**
 * Update elements via MCP
 */
export async function updateElementsWithMCP(updates: any[]): Promise<any> {
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return {
      success: false,
      error: "Excalidraw MCP server is not configured or enabled"
    };
  }

  try {
    const response = await fetch(`${serverConfig.endpoint}/elements/batch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ elements: updates }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update elements: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating elements with MCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update elements via MCP server'
    };
  }
}

/**
 * Delete elements via MCP
 */
export async function deleteElementsWithMCP(ids: string[]): Promise<any> {
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return {
      success: false,
      error: "Excalidraw MCP server is not configured or enabled"
    };
  }

  try {
    // For multiple IDs, we'll make individual delete requests
    const results = await Promise.allSettled(
      ids.map(id =>
        fetch(`${serverConfig.endpoint}/elements/${id}`, {
          method: 'DELETE',
        })
      )
    );

    const successfulDeletions = results.filter(result =>
      result.status === 'fulfilled' && result.value.ok
    ).length;

    return {
      success: true,
      deleted: successfulDeletions,
      message: `Successfully deleted ${successfulDeletions} of ${ids.length} elements`
    };
  } catch (error) {
    console.error('Error deleting elements with MCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete elements via MCP server'
    };
  }
}

/**
 * Query elements via MCP
 */
export async function queryElementsWithMCP(filters: any): Promise<any> {
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return {
      success: false,
      error: "Excalidraw MCP server is not configured or enabled"
    };
  }

  try {
    // Build query parameters from filters
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, String(filters[key]));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${serverConfig.endpoint}/elements/search?${queryString}` : `${serverConfig.endpoint}/elements/search`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to query elements: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying elements with MCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query elements via MCP server'
    };
  }
}

/**
 * Get available tools from the Excalidraw MCP server
 */
export async function getAvailableExcalidrawTools(): Promise<string[]> {
  const serverConfig = getMCPServer('excalidraw');

  if (!serverConfig || !serverConfig.enabled) {
    console.error('Excalidraw MCP server is not configured or enabled');
    return [];
  }

  try {
    const response = await fetch(`${serverConfig.endpoint}/tools`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get available tools: ${response.status}`);
    }

    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    console.error('Error getting available tools from MCP server:', error);
    return [];
  }
}