"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Context7Docs } from "@/components/context7-docs";
import { ThesisContext7Docs } from "@/components/thesis-context7-docs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Cpu, Bot, Settings, RefreshCw } from "lucide-react";

export default function MCPServersPage() {
  const [composioStatus, setComposioStatus] = useState({
    status: 'disconnected' as 'disconnected' | 'connected' | 'connecting',
    server: 'composio-playground',
    model: 'qwen/qwen3-coder:free',
    lastChecked: new Date().toISOString(),
    error: null as string | null
  });

  const [serenaStatus, setSerenaStatus] = useState({
    status: 'disconnected' as 'disconnected' | 'connected' | 'connecting',
    server: 'Serena MCP Server',
    model: 'Puter AI',
    lastChecked: new Date().toISOString(),
    error: null as string | null
  });

  const [isCheckingComposioStatus, setIsCheckingComposioStatus] = useState(false);
  const [isCheckingSerenaStatus, setIsCheckingSerenaStatus] = useState(false);

  const connectToComposio = async () => {
    try {
      setComposioStatus(prev => ({ ...prev, status: 'connecting', error: null }));

      const response = await fetch('/api/composio-mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'connect' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Redirect to login if unauthorized
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Authentication expired. Redirecting to login.');
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.config) {
        setComposioStatus({
          status: 'connected',
          server: data.config.server || 'composio',
          model: data.config.model || 'qwen/qwen3-coder:free',
          lastChecked: new Date().toISOString(),
          error: null
        });
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Error connecting to Composio:', error);
      setComposioStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  };

  const checkComposioStatus = async () => {
    try {
      setIsCheckingComposioStatus(true);

      const response = await fetch('/api/composio-mcp', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComposioStatus({
        status: data.status || 'disconnected',
        server: data.server || 'composio-playground',
        model: data.model || 'qwen/qwen3-coder:free',
        lastChecked: data.lastChecked || new Date().toISOString(),
        error: null
      });
    } catch (error) {
      console.error('Error checking Composio status:', error);
      setComposioStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Status check failed'
      }));
    } finally {
      setIsCheckingComposioStatus(false);
    }
  };

  const connectToSerena = async () => {
    try {
      setSerenaStatus(prev => ({ ...prev, status: 'connecting', error: null }));

      const response = await fetch('/api/mcp/serena-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSerenaStatus({
          status: 'connected',
          server: data.server || 'Serena MCP Server',
          model: data.model || 'Puter AI',
          lastChecked: new Date().toISOString(),
          error: null
        });
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Error connecting to Serena:', error);
      setSerenaStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  };

  const checkSerenaStatus = async () => {
    try {
      setIsCheckingSerenaStatus(true);
      const response = await fetch('/api/mcp/serena-status', { method: 'GET' });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSerenaStatus({
        status: data.status || 'disconnected',
        server: data.server || 'Serena MCP Server',
        model: data.model || 'Puter AI',
        lastChecked: data.lastChecked || new Date().toISOString(),
        error: null
      });
    } catch (error) {
      console.error('Error checking Serena status:', error);
      setSerenaStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Status check failed'
      }));
    } finally {
      setIsCheckingSerenaStatus(false);
    }
  };

  // Check status on component mount
  useEffect(() => {
    checkComposioStatus();
    checkSerenaStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">MCP Servers</h1>
        <p className="text-xl text-muted-foreground">
          Manage Model Context Protocol servers for development and documentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Development Documentation</h2>
          <Context7Docs />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Academic Writing Documentation</h2>
          <ThesisContext7Docs />
        </div>
      </div>

      {/* Serena MCP Server Section */}
      <div className="mt-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Serena MCP Server
                  <Badge variant="outline">Production</Badge>
                </CardTitle>
                <CardDescription>
                  AI-powered model context protocol server for thesis analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={checkSerenaStatus}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isCheckingSerenaStatus}
              >
                {isCheckingSerenaStatus ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                onClick={connectToSerena}
                variant={serenaStatus.status === 'connected' ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {serenaStatus.status === 'connecting' ? 'Connecting...' :
                 serenaStatus.status === 'connected' ? 'Connected' : 'Connect'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4" />
                  Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connection status:
                  <span className={
                    serenaStatus.status === 'connected' ? 'text-green-500 ml-1' :
                    serenaStatus.status === 'connecting' ? 'text-yellow-500 ml-1' :
                    'text-red-500 ml-1'
                  }>
                    {serenaStatus.status.charAt(0).toUpperCase() + serenaStatus.status.slice(1)}
                  </span>
                </p>
                {serenaStatus.error && (
                  <p className="text-sm text-red-500 mt-1">{serenaStatus.error}</p>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4" />
                  Model
                </h3>
                <p className="text-sm text-muted-foreground">
                  {serenaStatus.model}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Server
                </h3>
                <p className="text-sm text-muted-foreground">
                  {serenaStatus.server}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Serena MCP Server provides orchestrated AI workflows for thesis analysis, research gap identification, and document processing. Currently using model: <code className="bg-background px-1 rounded">{serenaStatus.model}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composio Playground Section */}
      <div className="mt-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Composio Playground
                  <Badge variant="outline">MCP Server</Badge>
                </CardTitle>
                <CardDescription>
                  AI agent workflow tools via Model Context Protocol
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={checkComposioStatus}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isCheckingComposioStatus}
              >
                {isCheckingComposioStatus ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button 
                onClick={connectToComposio} 
                variant={composioStatus.status === 'connected' ? "default" : "outline"} 
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {composioStatus.status === 'connecting' ? 'Connecting...' : 
                 composioStatus.status === 'connected' ? 'Connected' : 'Connect'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4" />
                  Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connection status: 
                  <span className={
                    composioStatus.status === 'connected' ? 'text-green-500' : 
                    composioStatus.status === 'connecting' ? 'text-yellow-500' : 
                    'text-red-500'
                  }>
                    {composioStatus.status.charAt(0).toUpperCase() + composioStatus.status.slice(1)}
                  </span>
                </p>
                {composioStatus.error && (
                  <p className="text-sm text-red-500 mt-1">{composioStatus.error}</p>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4" />
                  Model
                </h3>
                <p className="text-sm text-muted-foreground">
                  {composioStatus.model}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Server
                </h3>
                <p className="text-sm text-muted-foreground">
                  {composioStatus.server}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Composio Playground is configured to use your OpenRouter API key from environment variables. 
                Currently using model: <code className="bg-background px-1 rounded">{composioStatus.model}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>About MCP Servers</CardTitle>
            <CardDescription>
              Model Context Protocol (MCP) servers provide real-time documentation and code examples for development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time access to library documentation and code examples
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Code Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Context-aware code suggestions and examples
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with various MCP-compatible tools and services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}