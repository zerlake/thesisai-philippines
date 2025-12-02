/**
 * Puter with Intelligent Fallback
 * 
 * Provides fallback mechanisms when Puter is unavailable:
 * 1. Cache responses
 * 2. Use mock/sample data
 * 3. Log for retry
 */

import { getPuterConnection, PuterRequest, PuterResponse } from './puter-direct-connection';

export interface FallbackOptions {
  useMockData?: boolean;
  cacheResponses?: boolean;
  cacheTTL?: number; // milliseconds
  logFailures?: boolean;
  retryAttempts?: number;
}

interface CachedResponse {
  response: PuterResponse;
  timestamp: number;
  prompt: string;
}

class PuterWithFallback {
  private cache: Map<string, CachedResponse> = new Map();
  private options: FallbackOptions;
  private failureLog: Array<{ prompt: string; error: string; timestamp: number }> = [];

  constructor(options: FallbackOptions = {}) {
    this.options = {
      useMockData: true,
      cacheResponses: true,
      cacheTTL: 3600000, // 1 hour
      logFailures: true,
      retryAttempts: 3,
      ...options,
    };
  }

  /**
   * Generate with fallback support
   */
  async generate(input: PuterRequest): Promise<PuterResponse> {
    const cacheKey = this.getCacheKey(input);

    // Try cache first
    if (this.options.cacheResponses) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('[Puter Fallback] Returning cached response');
        return cached;
      }
    }

    // Try Puter
    const puter = getPuterConnection();
    try {
      const result = await puter.request(input);
      
      // Cache successful response
      if (this.options.cacheResponses) {
        this.saveToCache(cacheKey, result, input.prompt);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[Puter Fallback] Puter unavailable: ${errorMsg}`);

      // Log failure if enabled
      if (this.options.logFailures) {
        this.failureLog.push({
          prompt: input.prompt,
          error: errorMsg,
          timestamp: Date.now(),
        });
      }

      // Use mock data as fallback
      if (this.options.useMockData) {
        console.log('[Puter Fallback] Using mock data');
        return this.generateMockResponse(input);
      }

      throw error;
    }
  }

  /**
   * Stream with fallback support
   */
  async *stream(input: PuterRequest): AsyncGenerator<string, void, unknown> {
    const puter = getPuterConnection();
    
    try {
      let fullText = '';
      for await (const chunk of puter.stream(input)) {
        fullText += chunk;
        yield chunk;
      }
      
      // Cache the result
      if (this.options.cacheResponses) {
        const cacheKey = this.getCacheKey(input);
        const response: PuterResponse = {
          id: `puter_${Date.now()}`,
          text: fullText,
          timestamp: Date.now(),
        };
        this.saveToCache(cacheKey, response, input.prompt);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[Puter Fallback] Stream failed: ${errorMsg}`);

      if (this.options.logFailures) {
        this.failureLog.push({
          prompt: input.prompt,
          error: errorMsg,
          timestamp: Date.now(),
        });
      }

      // Stream mock response
      if (this.options.useMockData) {
        console.log('[Puter Fallback] Streaming mock data');
        const mock = this.generateMockResponse(input);
        const words = mock.text.split(' ');
        
        for (const word of words) {
          yield word + ' ';
          // Simulate streaming delay
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate mock response
   */
  private generateMockResponse(input: PuterRequest): PuterResponse {
    const mockResponses: Record<string, string> = {
      // Abstract/Summary generation
      'abstract': 'This study investigates the impact of emerging technologies on modern educational practices. Through a mixed-methods approach combining quantitative analysis and qualitative interviews, we examined factors influencing student engagement and learning outcomes. Findings suggest that technology integration, when coupled with pedagogical innovation, significantly enhances educational effectiveness.',
      
      // Questions
      'question': 'What are the key methodological considerations in your research design? How does your approach contribute to existing literature in this field? Can you elaborate on the limitations of your study and future research directions?',
      
      // Introduction
      'introduction': 'The rapid advancement of digital technologies has fundamentally transformed how we approach research and knowledge dissemination. In contemporary academic contexts, understanding the intersections between innovation, methodology, and practical application has become increasingly essential. This research explores these dimensions through a comprehensive examination of current practices and emerging trends.',
      
      // Methodology
      'methodology': 'This study employed a mixed-methods research design, integrating both quantitative and qualitative approaches. Data collection involved surveys administered to 500 participants, supplemented by 30 in-depth interviews. Analysis was conducted using SPSS for quantitative data and thematic coding for qualitative findings.',
      
      // Conclusion
      'conclusion': 'Our findings demonstrate the importance of integrated approaches in addressing complex research questions. The results suggest significant implications for policy and practice, particularly in how institutions adapt to rapidly changing environments. Further investigation is warranted to explore long-term effects and broader applicability.',
      
      // Default
      'default': 'This is a comprehensive response to your query. The analysis reveals important patterns and relationships that contribute meaningfully to our understanding of this topic. These findings have implications for theory, practice, and future research directions in this field.',
    };

    // Detect response type from prompt
    let responseType = 'default';
    const promptLower = input.prompt.toLowerCase();
    
    if (promptLower.includes('abstract')) responseType = 'abstract';
    else if (promptLower.includes('question')) responseType = 'question';
    else if (promptLower.includes('introduction')) responseType = 'introduction';
    else if (promptLower.includes('methodology')) responseType = 'methodology';
    else if (promptLower.includes('conclusion')) responseType = 'conclusion';

    const text = mockResponses[responseType] || mockResponses['default'];

    return {
      id: `fallback_${Date.now()}`,
      text: this.expandMockResponse(text, input.maxTokens || 2048),
      model: 'fallback-mock',
      usage: {
        promptTokens: input.prompt.split(' ').length,
        completionTokens: text.split(' ').length,
        totalTokens: input.prompt.split(' ').length + text.split(' ').length,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Expand mock response to match token count
   */
  private expandMockResponse(text: string, targetTokens: number): string {
    const sentences = text.split('. ').map(s => s + '.');
    let expanded = text;

    while (expanded.split(' ').length < targetTokens * 0.7) {
      expanded += ' ' + sentences[Math.floor(Math.random() * sentences.length)];
    }

    return expanded;
  }

  /**
   * Get cache key
   */
  private getCacheKey(input: PuterRequest): string {
    const normalized = input.prompt.toLowerCase().replace(/\s+/g, ' ').trim();
    return `${input.model || 'default'}:${normalized}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): PuterResponse | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > (this.options.cacheTTL || 3600000)) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  /**
   * Save to cache
   */
  private saveToCache(key: string, response: PuterResponse, prompt: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      prompt,
    });
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, { timestamp }]) => ({
        key,
        age: Date.now() - timestamp,
      })),
    };
  }

  /**
   * Get failure log
   */
  getFailureLog() {
    return this.failureLog;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear failure log
   */
  clearFailureLog(): void {
    this.failureLog = [];
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<FallbackOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Singleton instance
 */
let fallbackInstance: PuterWithFallback | null = null;

/**
 * Get fallback instance
 */
export function getPuterWithFallback(options?: FallbackOptions): PuterWithFallback {
  if (!fallbackInstance) {
    fallbackInstance = new PuterWithFallback(options);
  } else if (options) {
    fallbackInstance.updateOptions(options);
  }
  return fallbackInstance;
}

/**
 * Reset instance
 */
export function resetPuterFallback(): void {
  fallbackInstance = null;
}
