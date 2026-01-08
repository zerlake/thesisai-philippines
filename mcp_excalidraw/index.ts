/**
 * Excalidraw MCP Server
 * Provides AI-powered diagram generation capabilities via MCP protocol
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Define Excalidraw element types
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

// In-memory storage for elements
let elements: ExcalidrawElement[] = [];

// Mock AI service for diagram generation - in a real implementation, this would connect to an actual AI service
class MockAIService {
  static generateElementsFromPrompt(prompt: string): ExcalidrawElement[] {
    const lowerPrompt = prompt.toLowerCase();
    const generatedElements: ExcalidrawElement[] = [];

    // Create a title element
    generatedElements.push({
      id: uuidv4(),
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
      strokeWidth: 1,
      roughness: 1,
    });

    // Add elements based on keywords in the prompt
    if (lowerPrompt.includes("architecture") || lowerPrompt.includes("system")) {
      // Add architecture elements
      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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
      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 300,
        y: 180,
        width: 100,
        height: 40,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [100, 40]],
      });

      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 500,
        y: 180,
        width: -50,
        height: 40,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [-50, 40]],
      });
    } else if (lowerPrompt.includes("flow") || lowerPrompt.includes("process")) {
      // Add flowchart elements
      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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
      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 375,
        y: 150,
        width: 0,
        height: 30,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [0, 30]],
      });

      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 375,
        y: 230,
        width: 0,
        height: 30,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [-50, 30]],
      });

      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 375,
        y: 230,
        width: 0,
        height: 30,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [50, 30]],
      });
    } else {
      // Default elements for other types of diagrams
      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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

      generatedElements.push({
        id: uuidv4(),
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
      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 400,
        y: 200,
        width: 100,
        height: 50,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [100, 50]],
      });

      generatedElements.push({
        id: uuidv4(),
        type: "arrow",
        x: 450,
        y: 200,
        width: -50,
        height: 50,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        roughness: 0,
        points: [[0, 0], [-50, 50]],
      });
    }

    // Add a text element with the original prompt
    generatedElements.push({
      id: uuidv4(),
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
      strokeWidth: 1,
      roughness: 1,
    });

    return generatedElements;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    service: 'Excalidraw MCP Server',
    timestamp: new Date().toISOString()
  });
});

// Generate diagram from prompt endpoint
app.post('/generate', (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string'
      });
    }

    // Generate elements based on the prompt
    const elements = MockAIService.generateElementsFromPrompt(prompt);

    // Store elements in memory
    elements.forEach(el => {
      // Add to our in-memory store
      // In a real implementation, this would save to a database
    });

    res.json({
      success: true,
      elements,
      message: 'Diagram generated successfully',
      count: elements.length
    });
  } catch (error) {
    console.error('Error generating diagram:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate diagram',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// MCP Protocol endpoints for element management
app.get('/elements', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    elements,
    count: elements.length,
    message: 'Elements retrieved successfully'
  });
});

app.post('/elements', (req: Request, res: Response) => {
  const element = req.body;
  const newElement = {
    ...element,
    id: element.id || uuidv4(),
    createdAt: new Date().toISOString(),
  };
  elements.push(newElement);
  res.json({ 
    success: true, 
    element: newElement,
    message: 'Element created successfully'
  });
});

app.post('/elements/batch', (req: Request, res: Response) => {
  const { elements: newElements } = req.body;
  if (!Array.isArray(newElements)) {
    return res.status(400).json({
      success: false,
      error: 'Elements must be an array'
    });
  }
  
  const createdElements = newElements.map((el: any) => ({
    ...el,
    id: el.id || uuidv4(),
    createdAt: new Date().toISOString(),
  }));
  
  elements.push(...createdElements);
  res.json({ 
    success: true, 
    elements: createdElements,
    count: createdElements.length,
    message: 'Elements created successfully'
  });
});

app.get('/elements/:id', (req: Request, res: Response) => {
  const element = elements.find(el => el.id === req.params.id);
  if (!element) {
    return res.status(404).json({
      success: false,
      error: 'Element not found',
      id: req.params.id
    });
  }
  
  res.json({ 
    success: true, 
    element,
  });
});

app.put('/elements/:id', (req: Request, res: Response) => {
  const index = elements.findIndex(el => el.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Element not found',
      id: req.params.id
    });
  }
  
  elements[index] = {
    ...elements[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };
  
  res.json({ 
    success: true, 
    element: elements[index],
    message: 'Element updated successfully'
  });
});

app.delete('/elements/:id', (req: Request, res: Response) => {
  const index = elements.findIndex(el => el.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Element not found',
      id: req.params.id
    });
  }
  
  const deletedElement = elements.splice(index, 1)[0];
  res.json({ 
    success: true, 
    id: deletedElement.id,
    message: 'Element deleted successfully'
  });
});

// Tools endpoint
app.get('/tools', (req: Request, res: Response) => {
  res.json({ 
    success: true,
    tools: [
      'generate_diagram_from_prompt',
      'create_elements',
      'update_elements',
      'delete_elements',
      'batch_create_elements',
      'query_elements'
    ],
    message: 'Available tools for Excalidraw MCP server'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Excalidraw MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Generate endpoint: http://localhost:${PORT}/generate (POST)`);
  console.log(`Tools endpoint: http://localhost:${PORT}/tools (GET)`);
});

export default app;