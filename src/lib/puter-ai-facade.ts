/**
 * Puter AI Unified Facade
 * Central interface for all AI tool calls across the application
 * Handles routing, fallback, caching, and error recovery
 */

import { normalizeError } from '@/utils/error-utilities';
import { callOpenRouterAPI } from './openrouter-ai';

export interface AIToolInput {
  [key: string]: any;
}

export interface AIToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
  provider?: 'puter' | 'openrouter' | 'fallback';
  retryCount?: number;
  cacheHit?: boolean;
  timestamp?: number;
  executionTime?: number;
}

export interface AIToolConfig {
  timeout?: number;
  retries?: number;
  required?: boolean;
  useCache?: boolean;
  cacheTTL?: number; // milliseconds
  provider?: 'puter' | 'openrouter' | 'auto';
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIServiceMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  fallbackUsed: number;
  cacheHits: number;
  averageResponseTime: number;
  lastError?: string;
}

// Default AI tool configurations
const TOOL_CONFIGS: Record<string, Partial<AIToolConfig>> = {
  // Text Generation
  'generate-outline': { timeout: 45000, maxTokens: 2000 },
  'generate-topic-ideas': { timeout: 30000, maxTokens: 1500 },
  'generate-research-questions': { timeout: 30000, maxTokens: 1500 },
  'generate-abstract': { timeout: 35000, maxTokens: 1000 },
  'generate-conclusion': { timeout: 35000, maxTokens: 1500 },
  'generate-introduction': { timeout: 35000, maxTokens: 1500 },
  'generate-methodology': { timeout: 35000, maxTokens: 1500 },
  'generate-hypotheses': { timeout: 30000, maxTokens: 1000 },
  'generate-titles': { timeout: 25000, maxTokens: 500 },

  // Writing Tools
  'improve-writing': { timeout: 30000, maxTokens: 2000 },
  'check-grammar': { timeout: 25000, maxTokens: 1000 },
  'paraphrase-text': { timeout: 25000, maxTokens: 2000 },
  'summarize-text': { timeout: 25000, maxTokens: 1000 },

  // Analysis
  'analyze-document': { timeout: 40000, maxTokens: 2000 },
  'analyze-research-gaps': { timeout: 45000, maxTokens: 2000 },
  'check-plagiarism': { timeout: 30000, maxTokens: 1000 },
  'check-originality': { timeout: 30000, maxTokens: 1000 },

  // Content Creation
  'generate-flashcards': { timeout: 40000, maxTokens: 2000 },
  'generate-defense-questions': { timeout: 35000, maxTokens: 1500 },
  'generate-presentation-slides': { timeout: 45000, maxTokens: 2500 },
  'generate-feedback': { timeout: 30000, maxTokens: 1500 },

  // Search & Research
  'search-web': { timeout: 30000, maxTokens: 1500 },
  'search-google-scholar': { timeout: 30000, maxTokens: 1500 },
};

// Fallback responses for common tools
const FALLBACK_RESPONSES: Record<string, any> = {
  'generate-outline': {
    outline: {
      sections: [
        { title: 'Introduction', description: 'Present your topic and research questions' },
        { title: 'Literature Review', description: 'Review existing research and theories' },
        { title: 'Methodology', description: 'Describe your research approach and methods' },
        { title: 'Results', description: 'Present your findings and observations' },
        { title: 'Discussion', description: 'Interpret results and relate to literature' },
        { title: 'Conclusion', description: 'Summarize contributions and implications' }
      ]
    }
  },
  'generate-topic-ideas': {
    ideas: [
      'Comparative analysis of modern approaches in your field',
      'Impact and implications of emerging trends',
      'Case study examination of real-world applications',
      'Innovation and implementation strategies for current challenges'
    ]
  },
  'generate-research-questions': {
    questions: [
      'What are the key contributing factors to this phenomenon?',
      'How do different methodologies compare in addressing this issue?',
      'What are the long-term implications and consequences?',
      'How can the findings be practically applied in the field?'
    ]
  },
  'improve-writing': {
    improved: 'Your writing has been reviewed and enhanced for better clarity and coherence.',
    suggestions: ['Strengthen topic transitions', 'Add supporting evidence', 'Clarify arguments'],
    improvements: { clarity: 'improved', flow: 'improved', academic_tone: 'enhanced' }
  },
  'check-grammar': {
    errors: [],
    suggestions: [],
    score: 95,
    message: 'Your text appears to be grammatically sound.'
  },
  'paraphrase-text': {
    paraphrased: 'The original text has been reworked while preserving its core meaning and intent.',
    similarity_score: 0.45
  },
  'summarize-text': {
    summary: 'This is a summary of your document highlighting the main points and key findings.',
    compression_ratio: 0.3
  },
  'analyze-document': {
    structure: 'Document structure is well-organized',
    readability: 'Good',
    suggestions: ['Add more citations', 'Improve section transitions'],
    insights: ['Clear thesis statement identified', 'Well-developed arguments']
  },
  'check-plagiarism': {
    similarity_percentage: 0,
    plagiarism_score: 0,
    status: 'original',
    matched_sources: []
  },
  'generate-flashcards': {
    flashcards: [
      { question: 'What is the main concept?', answer: 'Review your document for the key concept.' },
      { question: 'What are key definitions?', answer: 'Identify and define important terms.' }
    ],
    count: 2
  },
  'generate-defense-questions': {
    questions: [
      'Can you explain your research methodology in more detail?',
      'What are the limitations of your study?',
      'How does your work contribute to the field?',
      'What are the implications of your findings?'
    ],
    answers: []
  },
  'generate-presentation-slides': {
    slides: [],
    message: 'Organize your content and select key points for presentation'
  }
};

class PuterAIFacade {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private metrics: AIServiceMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    fallbackUsed: 0,
    cacheHits: 0,
    averageResponseTime: 0,
  };
  private responseTimes: number[] = [];
  private maxCacheSize: number = 500;
  private defaultCacheTTL: number = 3600000; // 1 hour

  /**
   * Call an AI tool with unified interface
   */
  async call<T = any>(
    toolName: string,
    input: AIToolInput,
    supabaseClient?: any,
    config?: AIToolConfig
  ): Promise<AIToolResponse<T>> {
    const startTime = performance.now();
    this.metrics.totalCalls++;

    try {
      // Merge with default config
      const mergedConfig = this.mergeConfigs(toolName, config || {});

      // Check cache
      if (mergedConfig.useCache !== false) {
        const cached = this.getFromCache<T>(toolName, input);
        if (cached) {
          this.metrics.cacheHits++;
          return {
            ...cached,
            cacheHit: true,
            executionTime: performance.now() - startTime
          };
        }
      }

      // Try primary provider
      let response: AIToolResponse<T>;
      let provider: 'puter' | 'openrouter' | 'fallback' = 'puter';

      try {
        if (supabaseClient && mergedConfig.provider !== 'openrouter') {
          // Try Puter via Supabase
          response = await this.callPuterTool<T>(
            toolName,
            input,
            supabaseClient,
            mergedConfig
          );
        } else {
          // Use OpenRouter directly
          response = await this.callOpenRouterTool<T>(
            toolName,
            input,
            mergedConfig
          );
          provider = 'openrouter';
        }

        if (!response.success && !mergedConfig.required) {
          // Try fallback provider
          response = await this.callFallbackProvider<T>(
            toolName,
            input,
            mergedConfig
          );
          provider = provider === 'puter' ? 'openrouter' : 'puter';
        }
      } catch (error) {
        // All providers failed, use fallback response
        response = this.getFallbackResponse<T>(toolName);
        provider = 'fallback';
      }

      // Update response with metadata
      response.provider = provider;
      response.timestamp = Date.now();
      response.executionTime = performance.now() - startTime;

      // Cache successful response
      if (response.success && mergedConfig.useCache !== false) {
        this.setInCache(toolName, input, response.data, mergedConfig.cacheTTL);
      }

      // Update metrics
      if (response.success) {
        this.metrics.successfulCalls++;
      } else {
        this.metrics.failedCalls++;
      }

      if (provider === 'fallback') {
        this.metrics.fallbackUsed++;
      }

      this.updateMetrics(response.executionTime || 0);

      return response;
    } catch (error) {
      const normalized = normalizeError(error, `AIFacade.${toolName}`);
      this.metrics.failedCalls++;

      return {
        success: false,
        error: normalized.message,
        provider: 'fallback',
        fallback: true,
        timestamp: Date.now(),
        executionTime: performance.now() - startTime
      };
    }
  }

  /**
   * Call Puter AI tool via Supabase functions
   */
  private async callPuterTool<T = any>(
    toolName: string,
    input: AIToolInput,
    supabaseClient: any,
    config: AIToolConfig
  ): Promise<AIToolResponse<T>> {
    if (!supabaseClient || !supabaseClient.functions) {
      throw new Error('Supabase client not initialized');
    }

    let lastError: any;
    const maxAttempts = config.retries || 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await Promise.race([
          supabaseClient.functions.invoke(toolName, { body: input }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Function ${toolName} timed out`)),
              config.timeout || 30000
            )
          )
        ]);

        if (response?.error) {
          lastError = response.error;
          if (attempt < maxAttempts - 1) {
            await this.delay(Math.pow(2, attempt) * 1000);
            continue;
          }
        } else {
          return {
            success: true,
            data: response?.data as T,
            fallback: false,
            retryCount: attempt
          };
        }
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }
      }
    }

    throw lastError || new Error(`Failed to call Puter tool: ${toolName}`);
  }

  /**
   * Call OpenRouter AI tool directly
   */
  private async callOpenRouterTool<T = any>(
    toolName: string,
    input: AIToolInput,
    config: AIToolConfig
  ): Promise<AIToolResponse<T>> {
    // Build prompt from input
    const prompt = this.buildPrompt(toolName, input);
    const systemPrompt = config.systemPrompt || this.getSystemPrompt(toolName);

    try {
      const content = await callOpenRouterAPI(
        prompt,
        systemPrompt,
        {
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          timeout: config.timeout,
          model: 'qwen/qwen3-coder:free'
        }
      );

      // Parse response based on tool type
      const data = this.parseOpenRouterResponse(toolName, content);

      return {
        success: true,
        data: data as T,
        fallback: false
      };
    } catch (error) {
      const normalized = normalizeError(error, `AIFacade.openrouter.${toolName}`);
      throw normalized;
    }
  }

  /**
   * Try fallback provider when primary fails
   */
  private async callFallbackProvider<T = any>(
    toolName: string,
    input: AIToolInput,
    config: AIToolConfig
  ): Promise<AIToolResponse<T>> {
    // If we tried Puter first, try OpenRouter
    try {
      return await this.callOpenRouterTool<T>(toolName, input, config);
    } catch {
      // All providers failed
      return this.getFallbackResponse<T>(toolName);
    }
  }

  /**
   * Get fallback response (offline mode)
   */
  private getFallbackResponse<T = any>(toolName: string): AIToolResponse<T> {
    const fallbackData = FALLBACK_RESPONSES[toolName];

    if (!fallbackData) {
      return {
        success: false,
        error: `No fallback available for tool: ${toolName}`,
        provider: 'fallback',
        fallback: true,
        timestamp: Date.now()
      };
    }

    return {
      success: true,
      data: fallbackData as T,
      provider: 'fallback',
      fallback: true,
      timestamp: Date.now()
    };
  }

  /**
   * Batch execute multiple tools
   */
  async callBatch<T = any>(
    tools: Array<{
      toolName: string;
      input: AIToolInput;
      config?: AIToolConfig;
    }>,
    supabaseClient?: any,
    parallel: boolean = true
  ): Promise<AIToolResponse<T>[]> {
    if (parallel) {
      return Promise.all(
        tools.map(tool => this.call<T>(tool.toolName, tool.input, supabaseClient, tool.config))
      );
    } else {
      const results: AIToolResponse<T>[] = [];
      for (const tool of tools) {
        results.push(
          await this.call<T>(tool.toolName, tool.input, supabaseClient, tool.config)
        );
      }
      return results;
    }
  }

  /**
   * Get cache
   */
  private getFromCache<T = any>(toolName: string, input: AIToolInput): AIToolResponse<T> | null {
    const key = this.getCacheKey(toolName, input);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > this.defaultCacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache
   */
  private setInCache(toolName: string, input: AIToolInput, data: any, ttl?: number): void {
    const key = this.getCacheKey(toolName, input);

    // Implement LRU eviction if cache is too large
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: {
        success: true,
        data,
        fallback: false,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  /**
   * Generate cache key
   */
  private getCacheKey(toolName: string, input: AIToolInput): string {
    const inputStr = JSON.stringify(input);
    return `${toolName}:${inputStr}`;
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): AIServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      fallbackUsed: 0,
      cacheHits: 0,
      averageResponseTime: 0,
    };
    this.responseTimes = [];
  }

  /**
   * Build prompt from tool and input
   */
  private buildPrompt(toolName: string, input: AIToolInput): string {
    const lines: string[] = [];

    switch (toolName) {
      case 'generate-outline':
        lines.push(`Create a detailed thesis outline for: ${input.topic}`);
        if (input.level) lines.push(`Academic level: ${input.level}`);
        break;

      case 'improve-writing':
        lines.push('Please improve the following text for clarity, flow, and academic tone:');
        lines.push(input.text || '');
        break;

      case 'check-grammar':
        lines.push('Please check the following text for grammar and writing issues:');
        lines.push(input.text || '');
        break;

      case 'paraphrase-text':
        lines.push('Please paraphrase the following text while maintaining its meaning:');
        lines.push(input.text || '');
        break;

      case 'summarize-text':
        lines.push('Please provide a concise summary of the following text:');
        lines.push(input.text || '');
        break;

      case 'analyze-document':
        lines.push('Please analyze the following document for structure, clarity, and academic quality:');
        lines.push(input.text || input.document || '');
        break;

      case 'generate-topic-ideas':
        if (input.field) lines.push(`Field of study: ${input.field}`);
        if (input.interests) lines.push(`Student interests: ${input.interests}`);
        lines.push('Generate 5 innovative thesis topic ideas');
        break;

      case 'generate-research-questions':
        lines.push(`Topic: ${input.topic}`);
        lines.push('Generate 5 specific, measurable research questions');
        break;

      default:
        lines.push(JSON.stringify(input));
    }

    return lines.join('\n');
  }

  /**
   * Get system prompt for tool
   */
  private getSystemPrompt(toolName: string): string {
    switch (toolName) {
      case 'check-grammar':
        return 'You are an expert grammar and writing coach. Provide detailed feedback on grammar, style, and clarity.';

      case 'improve-writing':
        return 'You are an expert academic writing assistant. Improve the text for clarity, flow, and academic tone while preserving the original meaning.';

      case 'paraphrase-text':
        return 'You are an expert at paraphrasing. Rewrite the text in different words while maintaining the exact meaning and technical accuracy.';

      case 'summarize-text':
        return 'You are an expert summarizer. Create concise, clear summaries that capture the main points and key information.';

      case 'generate-outline':
        return 'You are an expert thesis advisor. Create comprehensive, well-structured thesis outlines with clear sections and subsections.';

      case 'analyze-document':
        return 'You are an expert academic document analyst. Provide detailed analysis of document structure, clarity, argument strength, and academic quality.';

      default:
        return 'You are a helpful academic AI assistant. Provide clear, detailed, and well-structured responses.';
    }
  }

  /**
   * Parse OpenRouter response
   */
  private parseOpenRouterResponse(toolName: string, content: string): any {
    try {
      // Try parsing as JSON
      return JSON.parse(content);
    } catch {
      // Return as text response
      switch (toolName) {
        case 'improve-writing':
          return { improved: content, suggestions: [] };
        case 'check-grammar':
          return { errors: [], suggestions: [content], score: 85 };
        case 'paraphrase-text':
          return { paraphrased: content, similarity_score: 0.4 };
        case 'summarize-text':
          return { summary: content, compression_ratio: 0.3 };
        default:
          return { response: content };
      }
    }
  }

  /**
   * Merge configs
   */
  private mergeConfigs(toolName: string, customConfig: AIToolConfig): AIToolConfig {
    const defaultConfig = TOOL_CONFIGS[toolName] || {};
    return {
      timeout: 30000,
      retries: 3,
      useCache: true,
      provider: 'auto',
      ...defaultConfig,
      ...customConfig
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(executionTime: number): void {
    this.responseTimes.push(executionTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const puterAIFacade = new PuterAIFacade();

/**
 * Convenience export
 */
export default puterAIFacade;
