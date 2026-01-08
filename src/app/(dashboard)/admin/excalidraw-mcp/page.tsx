"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenLine, Save, Download, RefreshCw, Info, BookOpen, Network, Settings, CheckCircle2, XCircle, AlertCircle, Plug, Zap, Sparkles, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Dynamically import Excalidraw to avoid SSR issues
const ExcalidrawWrapper = dynamic(
  () => import("@/components/admin/excalidraw-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[700px] flex items-center justify-center bg-muted">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Excalidraw is loading...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait a moment</p>
        </div>
      </div>
    ),
  }
);

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ServerStatus {
  status: ConnectionStatus;
  lastChecked: Date | null;
  responseTime: number | null;
  error: string | null;
  canvasUrl: string;
}

export default function ExcalidrawMCPPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [serverUrl, setServerUrl] = useState("http://localhost:3001");
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: "disconnected",
    lastChecked: null,
    responseTime: null,
    error: null,
    canvasUrl: "http://localhost:3001",
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [useDocker, setUseDocker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showScript, setShowScript] = useState(false);
  const [isExcalidrawReady, setIsExcalidrawReady] = useState(false);
  const [excalidrawInitialized, setExcalidrawInitialized] = useState(false);
  const [pendingDiagram, setPendingDiagram] = useState<any>(null);

  // Check if Excalidraw API is ready to accept operations
  const isExcalidrawAPIReady = (): boolean => {
    if (!excalidrawAPI || !excalidrawInitialized) {
      return false;
    }

    try {
      // Check if required methods exist
      return typeof excalidrawAPI.updateScene === 'function' &&
             typeof excalidrawAPI.getSceneElements === 'function';
    } catch (error) {
      console.warn('Excalidraw API not ready:', error);
      return false;
    }
  };

  // Load a diagram to Excalidraw when it's ready
  const loadDiagramToExcalidraw = async (diagramElements: any[]) => {
    if (!excalidrawAPI) {
      return false;
    }

    // Ensure all elements have proper Excalidraw format
    const elementsWithIds = diagramElements.map((element: any) => ({
      ...element,
      id: element.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: element.version || 1,
      versionNonce: element.versionNonce || 0,
      isDeleted: element.isDeleted || false,
      updated: element.updated || Date.now(),
    }));

    // Load elements into Excalidraw
    if (excalidrawAPI && typeof excalidrawAPI.updateScene === 'function') {
      try {
        excalidrawAPI.updateScene({
          elements: elementsWithIds,
          appState: null, // Don't change app state, just update elements
        });
        return true;
      } catch (error) {
        console.error("Error updating Excalidraw scene:", error);
        return false;
      }
    } else {
      return false;
    }
  };

  // Effect to load pending diagram when Excalidraw becomes ready
  useEffect(() => {
    if (isExcalidrawReady && pendingDiagram) {
      loadDiagramToExcalidraw(pendingDiagram.elements)
        .then(success => {
          if (success) {
            toast.success("Pending diagram loaded successfully!");
            setPendingDiagram(null);
          }
        });
    }
  }, [isExcalidrawReady, pendingDiagram]);

  // Health check function
  const checkServerHealth = async (url: string): Promise<{ connected: boolean; responseTime?: number; error?: string }> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return { connected: true, responseTime };
      } else {
        return { connected: false, error: `Server returned status: ${response.status}` };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return { connected: false, error: "Connection timeout" };
        }
        return { connected: false, error: error.message };
      }
      return { connected: false, error: "Unknown error occurred" };
    }
  };

  // Test connection to Excalidraw MCP server
  const testConnection = async () => {
    setIsCheckingStatus(true);
    setServerStatus(prev => ({
      ...prev,
      status: "connecting",
      error: null,
    }));

    const testUrl = serverUrl.trim();

    const result = await checkServerHealth(testUrl);

    if (result.connected) {
      setServerStatus({
        status: "connected",
        lastChecked: new Date(),
        responseTime: result.responseTime || null,
        error: null,
        canvasUrl: testUrl,
      });
      toast.success(`Connected to Excalidraw MCP Server at ${testUrl}`, {
        description: `Response time: ${result.responseTime}ms`,
      });
    } else {
      setServerStatus({
        status: "error",
        lastChecked: new Date(),
        responseTime: result.responseTime || null,
        error: result.error || "Connection failed",
        canvasUrl: testUrl,
      });
      toast.error("Failed to connect to Excalidraw MCP Server", {
        description: result.error || "Connection failed",
      });
    }

    setIsCheckingStatus(false);
  };

  // Get status badge component
  const getStatusBadge = () => {
    switch (serverStatus.status) {
      case "connected":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "connecting":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Connecting...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Connected
          </Badge>
        );
    }
  };

  // Check status on component mount and URL change - but only if user manually clicks test
  // Removed automatic check to avoid errors when server is not running

  // Auto-check connection every 30 seconds if connected
  useEffect(() => {
    if (serverStatus.status === "connected") {
      const interval = setInterval(async () => {
        const result = await checkServerHealth(serverUrl.trim());
        if (result.connected) {
          setServerStatus(prev => ({
            ...prev,
            lastChecked: new Date(),
            responseTime: result.responseTime || null,
          }));
        } else {
          setServerStatus(prev => ({
            ...prev,
            status: "error",
            error: result.error || "Connection lost",
            lastChecked: new Date(),
          }));
          toast.error("Lost connection to Excalidraw MCP Server");
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [serverStatus.status, serverUrl]);

  // Predefined architecture diagram data
  const loadArchitectureDiagram = async () => {
    if (!excalidrawAPI) {
      toast.error("Excalidraw is not ready yet. Please wait a moment.");
      return;
    }

    // Wait for Excalidraw to be fully ready
    const isReady = await waitForExcalidrawReady();
    if (!isReady) {
      toast.error("Excalidraw is still initializing. Please try again in a moment.");
      return;
    }

    const elements = [
      // Title
      {
        type: "text",
        x: 400,
        y: 20,
        width: 200,
        height: 40,
        text: "Thesis AI Platform Architecture",
        fontSize: 24,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
      },
      // Frontend Layer
      {
        type: "rectangle",
        x: 100,
        y: 80,
        width: 800,
        height: 120,
        strokeColor: "#3b82f6",
        backgroundColor: "#eff6ff",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 450,
        y: 110,
        text: "Frontend Layer (Next.js 15+)",
        fontSize: 18,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 200,
        y: 140,
        text: "• React Components\n• Dashboard UI\n• User Interface",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },
      {
        type: "text",
        x: 600,
        y: 140,
        text: "• Auth Provider\n• State Management\n• Navigation",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      // API Layer
      {
        type: "rectangle",
        x: 100,
        y: 220,
        width: 800,
        height: 120,
        strokeColor: "#8b5cf6",
        backgroundColor: "#f5f3ff",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 450,
        y: 250,
        text: "API Layer (Next.js API Routes)",
        fontSize: 18,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 200,
        y: 280,
        text: "• REST Endpoints\n• Middleware\n• Rate Limiting",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },
      {
        type: "text",
        x: 600,
        y: 280,
        text: "• Authentication\n• Authorization\n• Validation",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      // AI/ML Layer
      {
        type: "rectangle",
        x: 100,
        y: 360,
        width: 800,
        height: 120,
        strokeColor: "#ec4899",
        backgroundColor: "#fdf2f8",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 450,
        y: 390,
        text: "AI & MCP Layer",
        fontSize: 18,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 200,
        y: 420,
        text: "• Claude AI Integration\n• OpenRouter API\n• Anthropic API",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },
      {
        type: "text",
        x: 600,
        y: 420,
        text: "• MCP Servers\n• Serena Server\n• Composio Playground",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      // Database Layer
      {
        type: "rectangle",
        x: 100,
        y: 500,
        width: 800,
        height: 120,
        strokeColor: "#10b981",
        backgroundColor: "#ecfdf5",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 450,
        y: 530,
        text: "Data Layer (Supabase)",
        fontSize: 18,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 200,
        y: 560,
        text: "• PostgreSQL Database\n• Auth Service\n• Storage",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },
      {
        type: "text",
        x: 600,
        y: 560,
        text: "• Row Level Security\n• Real-time Sync\n• Functions",
        fontSize: 14,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      // External Services
      {
        type: "rectangle",
        x: 100,
        y: 640,
        width: 250,
        height: 100,
        strokeColor: "#f59e0b",
        backgroundColor: "#fffbeb",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 225,
        y: 670,
        text: "External Services",
        fontSize: 16,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 150,
        y: 700,
        text: "• ArXiv\n• CrossRef\n• Semantic Scholar\n• OpenAlex",
        fontSize: 12,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      {
        type: "rectangle",
        x: 375,
        y: 640,
        width: 250,
        height: 100,
        strokeColor: "#f59e0b",
        backgroundColor: "#fffbeb",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 500,
        y: 670,
        text: "Infrastructure",
        fontSize: 16,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 425,
        y: 700,
        text: "• Vercel (Hosting)\n• Redis (Cache)\n• Supabase (DB)",
        fontSize: 12,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      {
        type: "rectangle",
        x: 650,
        y: 640,
        width: 250,
        height: 100,
        strokeColor: "#f59e0b",
        backgroundColor: "#fffbeb",
        strokeWidth: 2,
        roughness: 0,
      },
      {
        type: "text",
        x: 775,
        y: 670,
        text: "Monitoring & Security",
        fontSize: 16,
        fontFamily: 1,
        textAlign: "center",
        strokeColor: "#1e1e1e",
      },
      {
        type: "text",
        x: 700,
        y: 700,
        text: "• Rate Limiting\n• Audit Logs\n• Analytics",
        fontSize: 12,
        fontFamily: 2,
        strokeColor: "#4b5563",
      },

      // Connectors
      {
        type: "arrow",
        x: 500,
        y: 200,
        width: 0,
        height: 20,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        points: [[0, 0], [0, 20]],
      },
      {
        type: "arrow",
        x: 500,
        y: 340,
        width: 0,
        height: 20,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        points: [[0, 0], [0, 20]],
      },
      {
        type: "arrow",
        x: 500,
        y: 480,
        width: 0,
        height: 20,
        strokeColor: "#6b7280",
        strokeWidth: 2,
        points: [[0, 0], [0, 20]],
      },
    ];

    // Ensure all elements have unique IDs
    const elementsWithIds = elements.map((element: any) => ({
      ...element,
      id: element.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: element.version || 1,
      versionNonce: element.versionNonce || 0,
      isDeleted: element.isDeleted || false,
      updated: element.updated || Date.now(),
    }));

    // Load elements into Excalidraw
    if (excalidrawAPI && typeof excalidrawAPI.updateScene === 'function') {
      try {
        excalidrawAPI.updateScene({
          elements: elementsWithIds,
          appState: null, // Don't change app state, just update elements
        });
      } catch (error) {
        console.error("Error updating Excalidraw scene:", error);
        toast.error("Failed to load diagram. Please try again.");
      }
    } else {
      toast.error("Excalidraw is not ready yet. Please wait a moment.");
    }
  };

  // AI-powered diagram generation via MCP
  const generateWithAI = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for the diagram");
      return;
    }

    setIsGenerating(true);
    try {
      // Call our API route that will communicate with MCP server
      const response = await fetch("/api/excalidraw/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate diagram");
      }

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        // If Excalidraw is ready, load the diagram immediately
        if (excalidrawAPI && isExcalidrawReady) {
          // Ensure all elements have proper Excalidraw format
          const elementsWithIds = data.elements.map((element: any) => ({
            ...element,
            id: element.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            version: element.version || 1,
            versionNonce: element.versionNonce || 0,
            isDeleted: element.isDeleted || false,
            updated: element.updated || Date.now(),
          }));

          // Load generated elements into Excalidraw
          if (excalidrawAPI && typeof excalidrawAPI.updateScene === 'function') {
            try {
              excalidrawAPI.updateScene({
                elements: elementsWithIds,
                appState: null, // Don't change app state, just update elements
              });
              toast.success("Diagram generated and loaded successfully!");
            } catch (error) {
              console.error("Error updating Excalidraw scene:", error);
              toast.error("Diagram generated but failed to load. You can try loading it again.");
            }
          }
        } else {
          // If Excalidraw isn't ready, store the diagram for later loading
          setPendingDiagram({
            elements: data.elements,
            prompt: prompt
          });
          toast.success("Diagram generated successfully! It will load when Excalidraw is ready.");
        }
      } else {
        toast.error("No elements were generated. Please try a different prompt.");
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
      toast.error("Failed to generate diagram. Make sure MCP server is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear canvas
  const clearCanvas = async () => {
    if (!excalidrawAPI) {
      toast.error("Excalidraw is not ready yet. Please wait a moment.");
      return;
    }

    // Wait for Excalidraw to be fully ready
    const isReady = await waitForExcalidrawReady();
    if (!isReady) {
      toast.error("Excalidraw is still initializing. Please try again in a moment.");
      return;
    }

    try {
      // Clear elements API
      await fetch("/api/excalidraw/elements", { method: "DELETE" });

      // Update Excalidraw scene to empty
      if (excalidrawAPI && typeof excalidrawAPI.updateScene === 'function') {
        try {
          excalidrawAPI.updateScene({
            elements: [],
            appState: null, // Don't change app state, just update elements
          });
        } catch (error) {
          console.error("Error clearing Excalidraw scene:", error);
          toast.error("Failed to clear canvas. Please try again.");
        }
      } else {
        toast.error("Excalidraw is not ready yet. Please wait a moment.");
      }

      toast.success("Canvas cleared");
    } catch (error) {
      console.error("Error clearing canvas:", error);
      toast.error("Failed to clear canvas");
    }
  };

  // Generate PowerShell script for MCP server
  const generatePowerShellScript = () => {
    return `$# Excalidraw MCP Server Setup Script
$# Run this script to start the Excalidraw MCP server

# Navigate to the MCP server directory
Set-Location -Path ".\\mcp_excalidraw"

# Install dependencies if not already installed
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the Excalidraw MCP server
Write-Host "Starting Excalidraw MCP Server on port 3001..." -ForegroundColor Green
$env:PORT = "3001"
npm run dev

# If npm run dev fails, try building first
if ($LASTEXITCODE -ne 0) {
    Write-Host "Attempting to build first..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful, starting server..." -ForegroundColor Green
        npm start
    }
}

Write-Host "Excalidraw MCP Server setup complete!" -ForegroundColor Green
Read-Host "Press Enter to exit"
`;
  };

  // Copy script to clipboard
  const copyScriptToClipboard = async () => {
    try {
      const script = generatePowerShellScript();
      await navigator.clipboard.writeText(script);
      toast.success("PowerShell script copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy script:", error);
      toast.error("Failed to copy script to clipboard");
    }
  };

  const handleSave = async () => {
    if (!excalidrawAPI) {
      toast.error("Excalidraw is not ready yet. Please wait a moment.");
      return;
    }

    // Wait for Excalidraw to be fully ready
    const isReady = await waitForExcalidrawReady();
    if (!isReady) {
      toast.error("Excalidraw is still initializing. Please try again in a moment.");
      return;
    }

    setIsSaving(true);
    try {
      const data = await excalidrawAPI.saveToBlob();
      // In a real implementation, you'd save this to your backend
      console.log("Saved diagram:", data);
      setLastSaved(new Date());

      // Show success message
      alert("Architecture diagram saved successfully!");
    } catch (error) {
      console.error("Error saving diagram:", error);
      alert("Error saving diagram. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!excalidrawAPI) {
      toast.error("Excalidraw is not ready yet. Please wait a moment.");
      return;
    }

    // Wait for Excalidraw to be fully ready
    const isReady = await waitForExcalidrawReady();
    if (!isReady) {
      toast.error("Excalidraw is still initializing. Please try again in a moment.");
      return;
    }

    try {
      const blob = await excalidrawAPI.exportToBlob({
        mimeType: "image/png",
        quality: 1,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "architecture-diagram.png";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting diagram:", error);
      alert("Error exporting diagram. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <PenLine className="h-10 w-10 text-purple-600" />
              Excalidraw MCP Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Create and manage architecture diagrams using Excalidraw with MCP integration
            </p>
          </div>
          <div className="flex gap-2">
            {lastSaved && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            Architecture Diagram
          </TabsTrigger>
          <TabsTrigger value="ai-generation" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generation
          </TabsTrigger>
          <TabsTrigger value="mcp-integration" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            MCP Integration
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Architecture Diagram Editor</CardTitle>
                  <CardDescription>
                    Visualize and edit the Thesis AI platform architecture
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadArchitectureDiagram}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Load Architecture
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleExport}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden h-[700px]">
                <ExcalidrawWrapper
                  onChange={(api: any) => {
                    setExcalidrawAPI(api);
                    setExcalidrawInitialized(true);
                    // Don't set ready immediately, wait for API to be fully functional
                    setTimeout(() => {
                      if (api && typeof api.updateScene === 'function') {
                        setIsExcalidrawReady(true);
                      }
                    }, 500); // Small delay to ensure API is fully ready
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Load Architecture</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Load Architecture" to display the pre-built platform architecture diagram with all layers and components.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Edit & Customize</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the drawing tools to modify, add, or remove elements. Drag and drop to rearrange components.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Export & Share</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your diagram as PNG to share with your team or include in documentation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp-integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Server Integration</CardTitle>
              <CardDescription>
                Configure and connect to Excalidraw MCP server for AI-powered diagram generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plug className="h-5 w-5 text-purple-600" />
                    Server Connection
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium mb-1 block">Server URL</label>
                        <Input
                          type="text"
                          placeholder="http://localhost:3001"
                          value={serverUrl}
                          onChange={(e) => setServerUrl(e.target.value)}
                          disabled={isCheckingStatus}
                        />
                        {useDocker && (
                          <p className="text-xs text-muted-foreground">
                            Docker URL: {serverUrl.replace("http://localhost", "http://host.docker.internal")}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <div className="flex items-center gap-2">
                          {getStatusBadge()}
                          <Button
                            onClick={testConnection}
                            variant="outline"
                            size="sm"
                            disabled={isCheckingStatus}
                            className="flex items-center gap-2"
                          >
                            {isCheckingStatus ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Test Connection
                          </Button>
                        </div>
                      </div>
                    </div>

                    {serverStatus.error && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200">Connection Error</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{serverStatus.error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {serverStatus.status === "connected" && (
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-800 dark:text-green-200">Connected Successfully</h4>
                            <div className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                              <p>Server is responding at: {serverStatus.canvasUrl}</p>
                              <p>Response time: {serverStatus.responseTime}ms</p>
                              {serverStatus.lastChecked && (
                                <p>Last checked: {serverStatus.lastChecked.toLocaleTimeString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <div>
                          <h4 className="font-semibold">Docker Mode</h4>
                          <p className="text-xs text-muted-foreground">
                            Use host.docker.internal for Docker container networking
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={useDocker ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseDocker(!useDocker)}
                      >
                        {useDocker ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Available MCP Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">create_elements</h4>
                      <p className="text-sm text-muted-foreground">
                        Create new diagram elements (rectangles, text, arrows, etc.) with AI
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">update_elements</h4>
                      <p className="text-sm text-muted-foreground">
                        Modify existing elements in the diagram
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">delete_elements</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove elements from the canvas
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">query_elements</h4>
                      <p className="text-sm text-muted-foreground">
                        Search and retrieve diagram elements
                      </p>
                    </div>
                  </div>
                </div>

                {/* MCP Server Script Generator */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold">MCP Server Quick Setup</h3>
                    </div>
                    <Button
                      variant={showScript ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowScript(!showScript)}
                      className="flex items-center gap-2"
                    >
                      {showScript ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Hide Script
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Show PowerShell Script
                        </>
                      )}
                    </Button>
                  </div>

                  {showScript && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Copy and run this PowerShell script to quickly start the Excalidraw MCP server:
                        </p>
                        <div className="relative">
                          <pre className="bg-background p-4 rounded text-xs overflow-x-auto max-h-60">
                            {generatePowerShellScript()}
                          </pre>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={copyScriptToClipboard}
                          >
                            Copy Script
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={copyScriptToClipboard}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowScript(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Integration Guide
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">1. Setup MCP Server</h4>
                      <p className="text-muted-foreground">
                        Clone the Excalidraw MCP server repository and install dependencies:
                        <code className="block mt-1 px-2 py-1 bg-background rounded">
                          git clone https://github.com/yctimlin/mcp_excalidraw.git<br />
                          cd mcp_excalidraw<br />
                          npm install<br />
                          PORT=3001 npm run canvas
                        </code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Using port 3001 to avoid conflict with the dev server (port 3000)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">2. Configure Claude Desktop</h4>
                      <p className="text-muted-foreground">
                        Add to claude_desktop_config.json:
                        <code className="block mt-1 px-2 py-1 bg-background rounded">
                          {`{
  "mcpServers": {
    "excalidraw": {
      "command": "node",
      "args": ["/path/to/mcp_excalidraw/dist/index.js"],
      "env": {
        "EXPRESS_SERVER_URL": "http://localhost:3001"
      }
    }
  }
}`}
                        </code>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">3. Use AI to Generate Diagrams</h4>
                      <p className="text-muted-foreground">
                        Ask Claude to create diagrams using natural language. For example: "Create a flowchart showing the user authentication process"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-generation" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Powered Diagram Generation</CardTitle>
                  <CardDescription>
                    Describe your diagram and let AI generate it automatically
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear Canvas
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Generate Diagram with AI
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Diagram Description</label>
                      <Textarea
                        placeholder="Describe the diagram you want to create (e.g., 'Create a flowchart showing the user authentication process' or 'Draw a system architecture with frontend, backend, and database components')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={generateWithAI}
                        disabled={isGenerating || !prompt.trim()}
                        className="flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPrompt("")}
                        disabled={isGenerating}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Tips for Better Diagrams
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Architecture Diagrams</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Specify components like "frontend", "backend", "database"</li>
                        <li>Include relationships like "connects to", "communicates with"</li>
                        <li>Request specific technologies like "React frontend", "Node.js backend"</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Flowcharts</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Use action words like "start", "process", "decision", "end"</li>
                        <li>Specify decision points with "if/then" statements</li>
                        <li>Include arrows showing the flow direction</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Excalidraw Features</CardTitle>
              <CardDescription>
                Discover what you can do with Excalidraw in this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mb-4">
                    <PenLine className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Drawing Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Create rectangles, ellipses, diamonds, arrows, lines, and freehand drawings with ease.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Text & Labels</h3>
                  <p className="text-sm text-muted-foreground">
                    Add text annotations, labels, and descriptions to your diagrams for clarity.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mb-4">
                    <Network className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connectors</h3>
                  <p className="text-sm text-muted-foreground">
                    Link elements with arrows and lines to show relationships and flows.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg w-fit mb-4">
                    <Settings className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Custom Styling</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from various colors, stroke widths, and fill options for your elements.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg w-fit mb-4">
                    <Download className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Export Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Export diagrams as PNG, SVG, or Excalidraw JSON for sharing and collaboration.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg w-fit mb-4">
                    <RefreshCw className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    See changes instantly with the responsive canvas and undo/redo functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>
                Configure your Excalidraw dashboard preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Display Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Dark Mode Canvas</h4>
                        <p className="text-sm text-muted-foreground">
                          Use dark theme for the drawing canvas
                        </p>
                      </div>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Grid Background</h4>
                        <p className="text-sm text-muted-foreground">
                          Show grid pattern on canvas
                        </p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Snap to Grid</h4>
                        <p className="text-sm text-muted-foreground">
                          Align elements to grid for precise positioning
                        </p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Export Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Default Format</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>PNG</option>
                        <option>SVG</option>
                        <option>JSON</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Quality</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>High (1.0)</option>
                        <option>Medium (0.5)</option>
                        <option>Low (0.1)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Storage Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Auto-Save</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>Every 30 seconds</option>
                        <option>Every minute</option>
                        <option>Every 5 minutes</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Storage Location</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>Browser Local Storage</option>
                        <option>Supabase Database</option>
                        <option>File System (Download)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
