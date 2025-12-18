"use client";

import { useCallback, useState } from 'react';
import { orchestrator, ToolChainStep, ChainResult } from '@/lib/ai/orchestration/tool-orchestrator';
import { advancedRecoveryEngine, RecoveryStrategy } from '@/lib/ai/errors/advanced-recovery';
import { intelligentCache } from '@/lib/ai/cache/intelligent-cache';

interface UseEnhancedAIOptions {
  cacheTTL?: number;
  enableCaching?: boolean;
  enableErrorRecovery?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}

interface EnhancedAIMetrics {
  executionTime: number;
  cacheHit: boolean;
}

interface EnhancedAIResult<T> {
  execute: (
    toolChain: ToolChainStep[],
    input: any,
    context?: Record<string, any>
  ) => Promise<ChainResult | { error: Error; strategy: RecoveryStrategy }>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  metrics: EnhancedAIMetrics;
  clearCache: () => void;
}

export function useEnhancedAI<T = any>(
  options: UseEnhancedAIOptions = {}
): EnhancedAIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [metrics, setMetrics] = useState<EnhancedAIMetrics>({ executionTime: 0, cacheHit: false });

  const execute = useCallback(
    async (
      toolChain: ToolChainStep[],
      input: any,
      context?: Record<string, any>
    ): Promise<ChainResult | { error: Error; strategy: RecoveryStrategy }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Try cache first
        const cacheKey = `ai:${JSON.stringify({ input, context })}`.slice(0, 100);

        if (options.enableCaching) {
          const cached = await intelligentCache.getOrFetch(
            cacheKey,
            async () => {
              const result = await orchestrator.executeChain(toolChain, input);
              return result;
            },
            { ttl: options.cacheTTL ?? 5 * 60 * 1000 }
          );

          setData(cached.finalOutput as T);
          setMetrics({
            executionTime: cached.executionTime,
            cacheHit: true
          });

          options.onSuccess?.(cached.finalOutput);
          return cached;
        } else {
          const result = await orchestrator.executeChain(toolChain, input);

          setData(result.finalOutput as T);
          setMetrics({
            executionTime: result.executionTime,
            cacheHit: false
          });

          options.onSuccess?.(result.finalOutput);
          return result;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (options.enableErrorRecovery) {
          const strategy = await advancedRecoveryEngine.handleError(error, {
            tool: 'unknown',
            operation: 'generate',
            userContext: context,
            previousAttempts: 0
          });

          setError(error);
          options.onError?.(error);

          return { error, strategy };
        }

        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    execute,
    data,
    isLoading,
    error,
    metrics,
    clearCache: () => intelligentCache.clear()
  };
}

/**
 * Hook for executing a single AI tool with caching and error recovery
 */
export function useSingleAITool<T = any>(
  toolName: string,
  options: UseEnhancedAIOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (input: any, config?: Record<string, any>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const cacheKey = `tool:${toolName}:${JSON.stringify(input)}`.slice(0, 100);

        if (options.enableCaching) {
          const result = await intelligentCache.getOrFetch(
            cacheKey,
            async () => {
              const chainResult = await orchestrator.executeChain(
                [{
                  id: 'single-tool',
                  tool: toolName,
                  config: config || {}
                }],
                input
              );
              return chainResult.finalOutput;
            },
            { ttl: options.cacheTTL ?? 5 * 60 * 1000 }
          );

          setData(result as T);
          options.onSuccess?.(result);
          return result as T;
        } else {
          const chainResult = await orchestrator.executeChain(
            [{
              id: 'single-tool',
              tool: toolName,
              config: config || {}
            }],
            input
          );

          setData(chainResult.finalOutput as T);
          options.onSuccess?.(chainResult.finalOutput);
          return chainResult.finalOutput as T;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (options.enableErrorRecovery) {
          await advancedRecoveryEngine.handleError(error, {
            tool: toolName,
            operation: 'generate',
            previousAttempts: 0
          });
        }

        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toolName, options]
  );

  return {
    execute,
    data,
    isLoading,
    error,
    clearCache: () => intelligentCache.invalidate(`tool:${toolName}:`)
  };
}

/**
 * Hook for getting AI cache metrics
 */
export function useAICacheMetrics() {
  const [metrics, setMetrics] = useState(intelligentCache.getMetrics());

  const refresh = useCallback(() => {
    setMetrics(intelligentCache.getMetrics());
  }, []);

  return {
    metrics,
    refresh,
    clearCache: () => {
      intelligentCache.clear();
      refresh();
    }
  };
}

/**
 * Hook for getting AI error statistics
 */
export function useAIErrorStats() {
  const [stats, setStats] = useState(advancedRecoveryEngine.getStatistics());

  const refresh = useCallback(() => {
    setStats(advancedRecoveryEngine.getStatistics());
  }, []);

  return {
    stats,
    refresh,
    clearHistory: () => {
      advancedRecoveryEngine.clearHistory();
      refresh();
    }
  };
}
