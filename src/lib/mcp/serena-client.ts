/**
 * Serena MCP Client
 * Handles communication with Serena MCP Server
 */

import { EventEmitter } from 'events';

export interface MCPMessage {
  type: 'request' | 'response' | 'notification';
  id?: string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

export interface SerenaContext {
  sessionId: string;
  userId?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface AgentRequest {
  task: string;
  context?: SerenaContext;
  params?: Record<string, unknown>;
  model?: string;
}

export interface AgentResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
  contextUpdated?: SerenaContext;
}

export class SerenaClient extends EventEmitter {
  private serverUrl: string;
  private sessionId: string;
  private context: SerenaContext;
  private requestId = 0;

  constructor(serverUrl: string = 'http://localhost:3000') {
    super();
    this.serverUrl = serverUrl;
    this.sessionId = this.generateSessionId();
    this.context = {
      sessionId: this.sessionId,
      conversationHistory: [],
      metadata: {},
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  async sendRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      const message: MCPMessage = {
        type: 'request',
        id: this.generateRequestId(),
        method: 'agent/execute',
        params: {
          task: request.task,
          context: this.context,
          params: request.params,
          model: request.model || 'default',
        },
      };

      const response = await this.postMessage(message);

      // Update conversation history
      this.context.conversationHistory.push({
        role: 'user',
        content: request.task,
        timestamp: Date.now(),
      });

      if (response.result) {
        this.context.conversationHistory.push({
          role: 'assistant',
          content: JSON.stringify(response.result),
          timestamp: Date.now(),
        });
      }

      return {
        success: !response.error,
        result: response.result,
        error: response.error?.message,
        executionTime: Date.now() - startTime,
        contextUpdated: this.context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async postMessage(message: MCPMessage): Promise<MCPMessage> {
    try {
      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to communicate with Serena: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async callTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Map tool names to their MCP servers
      const toolToServer: Record<string, string> = {
        'search_works_by_query': 'crossref',
        'get_work_metadata': 'crossref',
        'search_by_doi': 'crossref',
        'search_arxiv': 'arxiv',
        'download_arxiv': 'arxiv',
        'get_paper_metadata': 'arxiv',
        'search_openalex': 'openalex',
        'get_openalex_work': 'openalex',
        'search_by_openalex_id': 'openalex',
        'search_semantic_scholar': 'semantic_scholar',
        'get_paper_details': 'semantic_scholar',
        'get_author_info': 'semantic_scholar',
        'get_related_papers': 'crossref',
      };

      const serverId = toolToServer[toolName];
      if (!serverId) {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      // Dynamically import mcp-config to avoid circular dependencies
      const { getMCPServer } = await import('./mcp-config');
      const server = getMCPServer(serverId);
      
      if (!server) {
        throw new Error(`MCP Server ${serverId} not found`);
      }

      if (!server.enabled) {
        throw new Error(`MCP Server ${serverId} is disabled`);
      }

      const message: MCPMessage = {
        type: 'request',
        id: this.generateRequestId(),
        method: `tools/${toolName}`,
        params,
      };

      // Call the MCP server endpoint directly
      const response = await fetch(`${server.endpoint}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          params,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`[SerenaClient] Tool ${toolName} executed in ${Date.now() - startTime}ms`);
      
      return result;
    } catch (error) {
      console.error(`[SerenaClient] Tool call failed for ${toolName}:`, error);
      throw error;
    }
  }

  async executeWorkflow(
    steps: Array<{
      name: string;
      task: string;
      params?: Record<string, unknown>;
    }>
  ): Promise<AgentResponse[]> {
    const results: AgentResponse[] = [];

    for (const step of steps) {
      const result = await this.sendRequest({
        task: `${step.name}: ${step.task}`,
        params: step.params,
      });

      results.push(result);

      if (!result.success) {
        this.emit('error', {
          step: step.name,
          error: result.error,
        });
        break;
      }

      this.emit('step-complete', {
        step: step.name,
        result,
      });
    }

    return results;
  }

  getContext(): SerenaContext {
    return this.context;
  }

  setMetadata(key: string, value: unknown): void {
    this.context.metadata[key] = value;
  }

  clearHistory(): void {
    this.context.conversationHistory = [];
  }

  disconnect(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let serenaClient: SerenaClient | null = null;

export function getSerenaClient(serverUrl?: string): SerenaClient {
  if (!serenaClient) {
    serenaClient = new SerenaClient(serverUrl);
  }
  return serenaClient;
}

export function createSerenaClient(serverUrl?: string): SerenaClient {
  return new SerenaClient(serverUrl);
}
