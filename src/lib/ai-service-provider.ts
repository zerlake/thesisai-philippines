/**
 * AI Service Provider
 * 
 * Unified interface for multiple AI services with intelligent fallback chain:
 * 1. Puter (local/remote)
 * 2. OpenAI 
 * 3. Mock data (offline fallback)
 */

export interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  text: string;
  model: string;
  provider: 'puter' | 'openai' | 'mock';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;
}

export type AIProvider = 'puter' | 'openai' | 'mock';

export interface AIServiceConfig {
  primaryProvider?: AIProvider;
  fallbackProviders?: AIProvider[];
  providers: {
    puter?: {
      apiUrl: string;
      apiKey?: string;
      enabled: boolean;
    };
    openai?: {
      apiKey: string;
      model: string;
      enabled: boolean;
    };
    mock?: {
      enabled: boolean;
    };
  };
}

export class AIServiceProvider {
  private config: AIServiceConfig;
  private failureLog: Array<{ provider: AIProvider; error: string; timestamp: number }> = [];

  constructor(config: AIServiceConfig) {
    this.config = {
      primaryProvider: 'puter',
      fallbackProviders: ['openai', 'mock'],
      ...config,
    };
  }

  /**
   * Generate text using best available provider
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const providers = [
      this.config.primaryProvider,
      ...(this.config.fallbackProviders || []),
    ].filter(Boolean) as AIProvider[];

    let lastError: Error | null = null;

    for (const provider of providers) {
      if (!this.isProviderEnabled(provider)) continue;

      try {
        console.log(`[AI] Attempting ${provider}...`);
        const response = await this.generateWithProvider(provider, request);
        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`[AI] ${provider} failed: ${errorMsg}`);

        this.failureLog.push({
          provider,
          error: errorMsg,
          timestamp: Date.now(),
        });

        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error('No AI providers available');
  }

  /**
   * Generate with specific provider
   */
  private async generateWithProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    switch (provider) {
      case 'puter':
        return this.generateWithPuter(request);
      case 'openai':
        return this.generateWithOpenAI(request);
      case 'mock':
        return this.generateWithMock(request);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Generate with Puter
   */
  private async generateWithPuter(request: AIRequest): Promise<AIResponse> {
    if (!this.config.providers.puter?.enabled) {
      throw new Error('Puter not enabled');
    }

    const config = this.config.providers.puter;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.apiUrl}/v1/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: request.prompt,
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Puter API error ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id || `puter_${Date.now()}`,
      text: data.choices?.[0]?.text || data.text || '',
      model: data.model || 'puter-default',
      provider: 'puter',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate with OpenAI
   */
  private async generateWithOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!this.config.providers.openai?.enabled) {
      throw new Error('OpenAI not enabled');
    }

    const openaiConfig = this.config.providers.openai;

    if (!openaiConfig.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      text: data.choices?.[0]?.message?.content || '',
      model: data.model,
      provider: 'openai',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate with mock data
   */
  private generateWithMock(request: AIRequest): AIResponse {
    const mockText = this.generateMockResponse(request.prompt);

    return {
      id: `mock_${Date.now()}`,
      text: mockText,
      model: 'mock-fallback',
      provider: 'mock',
      usage: {
        promptTokens: request.prompt.split(' ').length,
        completionTokens: mockText.split(' ').length,
        totalTokens: request.prompt.split(' ').length + mockText.split(' ').length,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Generate mock response
   */
  private generateMockResponse(prompt: string): string {
    const responses: Record<string, string> = {
      abstract: 'This study investigates key phenomena using a mixed-methods approach. Results demonstrate significant findings with important implications for theory and practice.',
      question: 'What are the key findings of your research? How do your results contribute to existing literature? What are the limitations and future research directions?',
      introduction: 'The contemporary landscape presents challenges and opportunities that warrant investigation. This research examines these dimensions through a systematic approach.',
      methodology: 'This study employed quantitative and qualitative methods. Data collection involved surveys (n=500) and interviews (n=30), analyzed using SPSS and thematic coding.',
      conclusion: 'Findings reveal important patterns with implications for policy and practice. Further investigation is warranted to explore broader applicability.',
      default: 'This is a comprehensive response to your query based on current best practices and research methodologies in the field.',
    };

    const promptLower = prompt.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (promptLower.includes(key)) {
        return response;
      }
    }

    return responses.default;
  }

  /**
   * Check if provider is enabled
   */
  private isProviderEnabled(provider: AIProvider): boolean {
    switch (provider) {
      case 'puter':
        return this.config.providers.puter?.enabled ?? false;
      case 'openai':
        return this.config.providers.openai?.enabled ?? false;
      case 'mock':
        return this.config.providers.mock?.enabled ?? true;
      default:
        return false;
    }
  }

  /**
   * Get failure log
   */
  getFailureLog() {
    return this.failureLog;
  }

  /**
   * Clear failure log
   */
  clearFailureLog() {
    this.failureLog = [];
  }

  /**
   * Check provider availability
   */
  async checkProviderAvailability(provider: AIProvider): Promise<boolean> {
    try {
      const testResponse = await this.generateWithProvider(provider, {
        prompt: 'Test',
        maxTokens: 10,
      });
      return !!testResponse.text;
    } catch {
      return false;
    }
  }

  /**
   * Get provider status
   */
  async getProviderStatus(): Promise<Record<AIProvider, boolean>> {
    return {
      puter: await this.checkProviderAvailability('puter').catch(() => false),
      openai: await this.checkProviderAvailability('openai').catch(() => false),
      mock: await this.checkProviderAvailability('mock').catch(() => false),
    };
  }
}

/**
 * Singleton instance
 */
let instance: AIServiceProvider | null = null;

/**
 * Get or create AI service provider
 */
export function getAIServiceProvider(config?: AIServiceConfig): AIServiceProvider {
  if (!instance) {
    instance = new AIServiceProvider(
      config || {
        primaryProvider: 'puter',
        fallbackProviders: ['openai', 'mock'],
        providers: {
          puter: {
            apiUrl: process.env.NEXT_PUBLIC_PUTER_API_URL || 'http://localhost:8000',
            apiKey: process.env.PUTER_API_KEY,
            enabled: !!process.env.NEXT_PUBLIC_PUTER_API_URL,
          },
          openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-3.5-turbo',
            enabled: !!process.env.OPENAI_API_KEY,
          },
          mock: {
            enabled: true,
          },
        },
      }
    );
  }
  return instance;
}

/**
 * Reset instance
 */
export function resetAIServiceProvider() {
  instance = null;
}
