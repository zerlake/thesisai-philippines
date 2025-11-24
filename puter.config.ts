/**
 * Puter.js Configuration
 * Defines the AI model runtime for Serena MCP Server
 */

export interface PuterConfig {
  models: {
    default: string;
    available: string[];
  };
  endpoints: {
    local?: string;
    remote?: string;
  };
  timeout: number;
  retries: number;
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

const config: PuterConfig = {
  models: {
    default: 'local-llm',
    available: ['local-llm', 'qwen', 'context7'],
  },
  endpoints: {
    local: process.env.PUTER_LOCAL_ENDPOINT || 'http://localhost:8000',
    remote: process.env.PUTER_REMOTE_ENDPOINT || undefined,
  },
  timeout: 30000,
  retries: 3,
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
  },
};

export default config;
