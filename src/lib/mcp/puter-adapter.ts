/**
 * Puter.js Adapter
 * Handles integration with Puter.js model runtime
 */

import puterConfig, { type PuterConfig } from '../../../puter.config';

export interface PuterRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface PuterResponse {
  text: string;
  model: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  executionTime: number;
}

export class PuterAdapter {
  private config: PuterConfig;
  private endpoint: string;

  constructor(config?: PuterConfig) {
    this.config = config || puterConfig;
    this.endpoint = this.config.endpoints.local || 'http://localhost:8000';
  }

  async execute(request: PuterRequest): Promise<PuterResponse> {
    const startTime = Date.now();

    try {
      const payload = {
        model: request.model,
        prompt: request.prompt,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1024,
        system_prompt: request.systemPrompt,
      };

      const response = await this.executeWithRetry(payload);

      const text = String(response.text || response.response || '');
      const tokensUsed = response.tokens_used as { input?: number; output?: number } | undefined;

      return {
        text,
        model: request.model,
        tokensUsed: tokensUsed ? { input: tokensUsed.input || 0, output: tokensUsed.output || 0 } : undefined,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      throw new Error(
        `Puter execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async executeWithRetry(
    payload: Record<string, unknown>,
    attempt = 1
  ): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.config.retries) {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.executeWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeMultiple(
    requests: PuterRequest[]
  ): Promise<Map<string, PuterResponse>> {
    const results = new Map<string, PuterResponse>();

    for (const request of requests) {
      const key = `${request.model}_${Date.now()}_${Math.random()}`;
      const response = await this.execute(request);
      results.set(key, response);
    }

    return results;
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  getConfig(): PuterConfig {
    return this.config;
  }
}

// Singleton instance
let puterAdapter: PuterAdapter | null = null;

export function getPuterAdapter(config?: PuterConfig): PuterAdapter {
  if (!puterAdapter) {
    puterAdapter = new PuterAdapter(config);
  }
  return puterAdapter;
}

export function createPuterAdapter(config?: PuterConfig): PuterAdapter {
  return new PuterAdapter(config);
}
