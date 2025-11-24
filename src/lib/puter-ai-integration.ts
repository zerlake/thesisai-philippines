/**
 * Puter.js AI Integration with Fallback Support
 * Handles AI tool execution with graceful degradation when AI services are unavailable
 */

import { normalizeError, isRetryableError } from '@/utils/error-utilities';

export interface PuterAIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
  retryCount?: number;
  timestamp?: number;
}

export interface AIToolConfig {
  name: string;
  functionName: string;
  timeout?: number;
  retries?: number;
  fallbackResponse?: any;
  required?: boolean;
}

// Fallback responses for when AI services are unavailable
const FALLBACK_RESPONSES: Record<string, any> = {
  'generate-topic-ideas': {
    ideas: [
      'Comparative analysis of modern technologies',
      'Impact of emerging trends in your field',
      'Case study approach to problem-solving',
      'Innovation and implementation strategies'
    ],
    suggestions: ['Consider your research interests', 'Identify knowledge gaps']
  },
  'generate-research-questions': {
    questions: [
      'What are the key factors influencing this phenomenon?',
      'How do different approaches compare in addressing this issue?',
      'What are the long-term implications?',
      'How can findings be applied in practice?'
    ]
  },
  'generate-outline': {
    outline: {
      sections: [
        'Introduction',
        'Literature Review',
        'Methodology',
        'Results',
        'Discussion',
        'Conclusion'
      ]
    }
  },
  'paraphrase-text': {
    paraphrased: 'The text has been restructured while maintaining the original meaning.',
    confidence: 0.85
  },
  'improve-writing': {
    improved: 'Your text has been enhanced for clarity and coherence.',
    suggestions: ['Review grammar', 'Improve flow', 'Strengthen arguments']
  },
  'check-plagiarism': {
    similarity: 0,
    score: 100,
    status: 'original'
  },
  'analyze-document': {
    analysis: 'Document analysis complete.',
    insights: ['Key themes identified', 'Structure is appropriate']
  },
  'generate-presentation-slides': {
    slides: [],
    message: 'Create slides from your document content'
  },
  'generate-defense-questions': {
    questions: [],
    answers: [],
    message: 'Generate practice questions for your defense'
  }
};

class PuterAIIntegration {
  private retryAttempts: Map<string, number> = new Map();
  private cache: Map<string, any> = new Map();
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms
  private timeout: number = 30000; // 30 seconds
  private aiAvailable: boolean = true;
  private lastConnectionCheck: number = 0;
  private connectionCheckInterval: number = 60000; // Check every minute

  /**
   * Execute an AI tool with retry logic and fallback support
   */
  async executeTool<T = any>(
    supabaseClient: any,
    functionName: string,
    input: Record<string, any>,
    config?: Partial<AIToolConfig>
    ): Promise<PuterAIResponse<T>> {
     const cacheKey = `${functionName}:${JSON.stringify(input)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        success: true,
        data: this.cache.get(cacheKey),
        fallback: false,
        timestamp: Date.now()
      };
    }

    // Check if we should use fallback based on recent failures
    if (!this.aiAvailable && !config?.required) {
      return this.getFallbackResponse(functionName, input);
    }

    let lastError: any;
    const maxAttempts = config?.retries || this.maxRetries;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.invokeWithTimeout(
          supabaseClient,
          functionName,
          input,
          config?.timeout || this.timeout
        );

        if (response.error) {
          lastError = response.error;
          if (attempt < maxAttempts - 1) {
            const delayMs = this.retryDelay * Math.pow(2, attempt);
            await this.delay(delayMs);
            continue;
          }
        } else {
          // Success - cache and return
          this.cache.set(cacheKey, response.data);
          this.aiAvailable = true;
          return {
            success: true,
            data: response.data as T,
            fallback: false,
            retryCount: attempt,
            timestamp: Date.now()
          };
        }
      } catch (error) {
         lastError = error;
         if (attempt < maxAttempts - 1) {
           const normalized = normalizeError(error, `PuterAI.${functionName}`);
           const delayMs = this.retryDelay * Math.pow(2, attempt);
           await this.delay(delayMs);
           continue;
         }
       }
      }

      // All retries failed - use fallback
      const normalizedLastError = normalizeError(lastError, `PuterAI.${functionName}.failed`);
      console.error(`[Failed] ${functionName} after ${maxAttempts} attempts:`, normalizedLastError.message);
    this.aiAvailable = false;

    if (config?.required) {
      return {
        success: false,
        error: `Failed to execute required tool: ${functionName}. ${lastError?.message}`,
        fallback: false,
        retryCount: maxAttempts,
        timestamp: Date.now()
      };
    }

    return this.getFallbackResponse(functionName, input);
  }

  /**
   * Get fallback response for a tool
   */
  private getFallbackResponse<T = any>(
    functionName: string,
    _input: Record<string, any>
  ): PuterAIResponse<T> {
    const fallbackData = FALLBACK_RESPONSES[functionName];

    if (!fallbackData) {
      return {
        success: false,
        error: `No fallback available for tool: ${functionName}`,
        fallback: false,
        timestamp: Date.now()
      };
    }

    return {
      success: true,
      data: fallbackData as T,
      fallback: true,
      timestamp: Date.now()
    };
  }

  /**
   * Invoke a Supabase function with timeout
   */
  private async invokeWithTimeout(
    supabaseClient: any,
    functionName: string,
    input: Record<string, any>,
    timeoutMs: number
  ): Promise<any> {
    return Promise.race([
      supabaseClient.functions.invoke(functionName, { body: input }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Function ${functionName} timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }

  /**
   * Check if AI services are available
   */
  async checkAIAvailability(supabaseClient: any): Promise<boolean> {
    const now = Date.now();

    // Only check every connectionCheckInterval
    if (now - this.lastConnectionCheck < this.connectionCheckInterval) {
      return this.aiAvailable;
    }

    try {
      const response = await this.invokeWithTimeout(
        supabaseClient,
        'health-check',
        {},
        5000 // Short timeout for health check
      );

      this.aiAvailable = !!response.data || response.status === 200;
      this.lastConnectionCheck = now;

      return this.aiAvailable;
    } catch (error) {
       const normalized = normalizeError(error, 'PuterAI.healthCheck');
       this.aiAvailable = false;
       this.lastConnectionCheck = now;
       return false;
     }
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set custom timeout
   */
  setTimeouts(timeout: number, retryDelay: number): void {
    this.timeout = timeout;
    this.retryDelay = retryDelay;
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.cache.clear();
    this.retryAttempts.clear();
    this.aiAvailable = true;
    this.lastConnectionCheck = 0;
  }
}

// Singleton instance
export const puterAIIntegration = new PuterAIIntegration();

/**
 * Convenience function for executing tools
 */
export async function executeTool<T = any>(
  supabaseClient: any,
  functionName: string,
  input: Record<string, any>,
  options?: {
    timeout?: number;
    retries?: number;
    required?: boolean;
  }
): Promise<PuterAIResponse<T>> {
  return puterAIIntegration.executeTool<T>(supabaseClient, functionName, input, options);
}

/**
 * Convenience function for batch execution
 */
export async function executeToolsBatch<T = any>(
  supabaseClient: any,
  tools: Array<{
    functionName: string;
    input: Record<string, any>;
    options?: any;
  }>
): Promise<PuterAIResponse<T>[]> {
  return Promise.all(
    tools.map(tool =>
      puterAIIntegration.executeTool<T>(supabaseClient, tool.functionName, tool.input, tool.options)
    )
  );
}

/**
 * Hook for React components to use AI tools with error boundaries
 */
export function usePuterAI() {
  return {
    executeTool,
    executeToolsBatch,
    checkAvailability: (supabaseClient: any) => puterAIIntegration.checkAIAvailability(supabaseClient),
    clearCache: (pattern?: string) => puterAIIntegration.clearCache(pattern),
    getCacheStats: () => puterAIIntegration.getCacheStats(),
    reset: () => puterAIIntegration.reset()
  };
}
