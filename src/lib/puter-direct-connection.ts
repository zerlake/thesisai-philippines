/**
 * Direct Puter Connection
 * 
 * Provides direct connection to Puter services without relying on Puter AI SDK.
 * Implements fallback mechanisms and automatic reconnection.
 */

export interface PuterConnectionConfig {
  apiKey?: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface PuterRequest {
  model?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface PuterResponse {
  id: string;
  text: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;
}

export class PuterDirectConnection {
  private config: PuterConnectionConfig;
  private isConnected: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor(config: Partial<PuterConnectionConfig> = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || process.env.NEXT_PUBLIC_PUTER_API_URL || 'http://localhost:8000',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      apiKey: config.apiKey,
    };
  }

  /**
   * Check if Puter service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const now = Date.now();
      // Skip if checked recently
      if (now - this.lastHealthCheck < 5000) {
        return this.isConnected;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.apiBaseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      this.lastHealthCheck = now;
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.lastHealthCheck = Date.now();
      console.warn('[Puter] Health check failed:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Send request with retry logic
   */
  async request(input: PuterRequest): Promise<PuterResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        // Health check before request
        const isHealthy = await this.healthCheck();
        if (!isHealthy && attempt === 0) {
          console.warn('[Puter] Service unhealthy, attempting anyway...');
        }

        const response = await this._makeRequest(input);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retries - 1) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.warn(`[Puter] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Puter request failed after ${this.config.retries} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Make HTTP request to Puter API
   */
  private async _makeRequest(input: PuterRequest): Promise<PuterResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.config.apiBaseUrl}/v1/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: input.model || 'default',
          prompt: input.prompt,
          max_tokens: input.maxTokens || 2048,
          temperature: input.temperature ?? 0.7,
          top_p: input.topP ?? 0.9,
          stream: input.stream ?? false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Puter API error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        id: data.id || `puter_${Date.now()}`,
        text: data.choices?.[0]?.text || data.text || '',
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
        timestamp: Date.now(),
      };
    } catch (error) {
      if (error instanceof TypeError && error.name === 'AbortError') {
        throw new Error(`Puter request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Stream response from Puter
   */
  async *stream(input: PuterRequest): AsyncGenerator<string, void, unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.config.apiBaseUrl}/v1/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: input.model || 'default',
          prompt: input.prompt,
          max_tokens: input.maxTokens || 2048,
          temperature: input.temperature ?? 0.7,
          top_p: input.topP ?? 0.9,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Puter API error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.text) {
                  yield data.choices[0].text;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof TypeError && error.name === 'AbortError') {
        throw new Error(`Puter stream timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Check connection status
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Get current configuration
   */
  getConfig(): PuterConnectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PuterConnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Singleton instance
 */
let puterConnection: PuterDirectConnection | null = null;

/**
 * Get or create Puter connection
 */
export function getPuterConnection(config?: Partial<PuterConnectionConfig>): PuterDirectConnection {
  if (!puterConnection) {
    puterConnection = new PuterDirectConnection(config);
  } else if (config) {
    puterConnection.updateConfig(config);
  }
  return puterConnection;
}

/**
 * Reset connection (for testing)
 */
export function resetPuterConnection(): void {
  puterConnection = null;
}
