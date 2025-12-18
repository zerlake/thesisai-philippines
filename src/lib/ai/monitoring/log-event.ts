/**
 * AI Pipeline Event Logger
 * Phase 5: Real-time Monitoring & Analytics
 */

import { AIPipelineEvent } from './event-schema';

// Supabase client (assuming it's available in the environment)
declare global {
  var supabase: any;
}

export class AILogger {
  private static instance: AILogger;
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  /**
   * Log an event to the analytics table
   */
  async logEvent(event: AIPipelineEvent): Promise<void> {
    if (!this.enabled) return;

    try {
      // Add ID and timestamp if not provided
      const logEvent = {
        ...event,
        id: event.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: event.timestamp || Date.now()
      };

      // Log to Supabase analytics table
      if (typeof window !== 'undefined' && global.supabase) {
        const { error } = await global.supabase
          .from('ai_analytics')
          .insert([logEvent]);

        if (error) {
          console.error('Failed to log event to Supabase:', error);
        }
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[AI Monitor]', logEvent.module, logEvent.operation, logEvent.metadata);
      }
    } catch (error) {
      console.error('Error in AILogger.logEvent:', error);
    }
  }

  /**
   * Log performance event with duration
   */
  async logPerformance(
    module: AIPipelineEvent['module'],
    operation: string,
    duration: number,
    metadata: AIPipelineEvent['metadata'] = {},
    context: AIPipelineEvent['context'] = {}
  ): Promise<void> {
    await this.logEvent({
      id: `perf_${Date.now()}`,
      timestamp: Date.now(),
      module,
      operation,
      metadata: {
        ...metadata,
        duration
      },
      context
    });
  }

  /**
   * Log error event
   */
  async logError(
    module: AIPipelineEvent['module'],
    operation: string,
    error: Error | string,
    context: AIPipelineEvent['context'] = {},
    metadata: AIPipelineEvent['metadata'] = {}
  ): Promise<void> {
    await this.logEvent({
      id: `error_${Date.now()}`,
      timestamp: Date.now(),
      module,
      operation,
      metadata: {
        ...metadata,
        errorType: typeof error === 'string' ? error : error.constructor.name,
        errorMessage: typeof error === 'string' ? error : error.message
      },
      context
    });
  }

  /**
   * Log cache event
   */
  async logCacheEvent(
    operation: 'get' | 'set' | 'delete' | 'evict' | 'hit' | 'miss',
    cacheKey: string,
    metadata: AIPipelineEvent['metadata'] = {},
    context: AIPipelineEvent['context'] = {}
  ): Promise<void> {
    await this.logEvent({
      id: `cache_${Date.now()}`,
      timestamp: Date.now(),
      module: 'cache',
      operation,
      metadata: {
        ...metadata,
        cacheKey
      },
      context
    });
  }

  /**
   * Log provider routing event
   */
  async logProviderRoute(
    primaryProvider: string,
    fallbackUsed: boolean,
    operation: string,
    duration: number,
    metadata: AIPipelineEvent['metadata'] = {},
    context: AIPipelineEvent['context'] = {}
  ): Promise<void> {
    await this.logEvent({
      id: `provider_${Date.now()}`,
      timestamp: Date.now(),
      module: 'integration',
      operation,
      metadata: {
        ...metadata,
        provider: primaryProvider,
        fallbackUsed,
        duration
      },
      context
    });
  }

  /**
   * Disable logging (useful for tests)
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Enable logging (default state)
   */
  enable(): void {
    this.enabled = true;
  }
}

// Convenience function for easier access
export const logEvent = AILogger.getInstance().logEvent.bind(AILogger.getInstance());
export const logPerformance = AILogger.getInstance().logPerformance.bind(AILogger.getInstance());
export const logError = AILogger.getInstance().logError.bind(AILogger.getInstance());
export const logCacheEvent = AILogger.getInstance().logCacheEvent.bind(AILogger.getInstance());
export const logProviderRoute = AILogger.getInstance().logProviderRoute.bind(AILogger.getInstance());