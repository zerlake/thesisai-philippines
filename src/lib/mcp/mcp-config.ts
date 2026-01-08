/**
 * MCP Server Configuration
 * Defines endpoints and configuration for all MCP servers used by the application
 */

export interface MCPServerConfig {
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

export interface MCPConfig {
  servers: Record<string, MCPServerConfig>;
  defaultTimeout: number;
  defaultRetries: number;
}

/**
 * MCP Server Configurations
 * Each server can be enabled/disabled and configured with its own endpoint
 */
export const mcpConfig: MCPConfig = {
  defaultTimeout: 30000,
  defaultRetries: 3,
  servers: {
    // ArXiv Paper Search MCP Server
    arxiv: {
      id: 'arxiv',
      name: 'ArXiv Paper Search',
      description: 'Search and download papers from ArXiv',
      endpoint: process.env.ARXIV_MCP_ENDPOINT || 'http://localhost:3001',
      transport: 'remote',
      enabled: true,
      tools: ['search_arxiv', 'download_arxiv', 'get_paper_metadata'],
      timeout: 30000,
      retries: 3,
    },

    // CrossRef API MCP Server
    crossref: {
      id: 'crossref',
      name: 'CrossRef API',
      description: 'Search academic works metadata via CrossRef',
      endpoint: process.env.CROSSREF_MCP_ENDPOINT || 'http://localhost:3002',
      transport: 'remote',
      enabled: true,
      tools: ['search_works_by_query', 'get_work_metadata', 'search_by_doi'],
      timeout: 30000,
      retries: 3,
    },

    // OpenAlex MCP Server
    openalex: {
      id: 'openalex',
      name: 'OpenAlex',
      description: 'Search academic works via OpenAlex',
      endpoint: process.env.OPENALEX_MCP_ENDPOINT || 'http://localhost:3003',
      transport: 'remote',
      enabled: true,
      tools: [
        'search_openalex_works',
        'get_openalex_work_details',
        'search_by_openalex_id',
      ],
      timeout: 30000,
      retries: 3,
    },

    // Semantic Scholar MCP Server
    semantic_scholar: {
      id: 'semantic_scholar',
      name: 'Semantic Scholar',
      description: 'Search academic papers via Semantic Scholar',
      endpoint: process.env.SEMANTIC_SCHOLAR_MCP_ENDPOINT || 'http://localhost:3004',
      transport: 'remote',
      enabled: true,
      tools: [
        'search_semantic_scholar',
        'get_semantic_scholar_paper',
        'get_author_info',
      ],
      timeout: 30000,
      retries: 3,
    },

    // Serena MCP Server
    serena: {
      id: 'serena',
      name: 'Serena MCP Server',
      description: 'Custom MCP server integration',
      endpoint: process.env.SERENA_MCP_ENDPOINT || process.env.SERENA_URL || 'http://localhost:5000',
      transport: 'remote',
      enabled: true,
      tools: [],
      timeout: 30000,
      retries: 3,
    },

    // Excalidraw MCP Server
    excalidraw: {
      id: 'excalidraw',
      name: 'Excalidraw Diagram Generator',
      description: 'AI-powered diagram generation with Excalidraw',
      endpoint: process.env.EXCALIDRAW_MCP_ENDPOINT || 'http://localhost:3001',
      transport: 'remote',
      enabled: true,
      tools: [
        'generate_diagram_from_prompt',
        'create_elements',
        'update_elements',
        'delete_elements',
        'batch_create_elements',
        'query_elements'
      ],
      timeout: 30000,
      retries: 3,
    },

    // Local MCP Server (if running locally)
    local: {
      id: 'local',
      name: 'Local MCP Server',
      description: 'Local MCP server for development',
      endpoint: process.env.LOCAL_MCP_ENDPOINT || 'http://localhost:8000',
      transport: 'local',
      enabled: false,
      tools: [],
      timeout: 30000,
      retries: 3,
    },
  },
};

/**
 * Get active MCP server configurations
 */
export function getActiveMCPServers(): MCPServerConfig[] {
  return Object.values(mcpConfig.servers).filter((server) => server.enabled);
}

/**
 * Get MCP server by ID
 */
export function getMCPServer(serverId: string): MCPServerConfig | undefined {
  return mcpConfig.servers[serverId];
}

/**
 * Check if MCP server is available
 */
export async function checkMCPServerHealth(serverId: string): Promise<boolean> {
  const server = getMCPServer(serverId);
  if (!server || !server.enabled) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${server.endpoint}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error(`MCP Server ${serverId} health check failed:`, error);
    return false;
  }
}

/**
 * Get all available MCP tools across all servers
 */
export function getAllMCPTools(): Record<string, string[]> {
  const tools: Record<string, string[]> = {};

  for (const server of getActiveMCPServers()) {
    if (server.tools.length > 0) {
      tools[server.id] = server.tools;
    }
  }

  return tools;
}

/**
 * Build tool call parameters for a specific MCP server
 */
export function buildMCPToolCall(serverId: string, toolName: string, params: Record<string, any>) {
  const server = getMCPServer(serverId);
  if (!server) {
    throw new Error(`MCP Server ${serverId} not found`);
  }

  return {
    server: server.id,
    endpoint: server.endpoint,
    tool: toolName,
    params,
    timeout: server.timeout,
    retries: server.retries,
  };
}
