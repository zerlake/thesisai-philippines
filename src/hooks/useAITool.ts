/**
 * Simplified React Hook for AI Tools
 * Unified interface for calling any AI tool in the application
 * Handles loading, errors, caching, and fallback automatically
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { puterAIFacade, type AIToolInput, type AIToolConfig, type AIToolResponse } from '@/lib/puter-ai-facade';
import { normalizeError } from '@/utils/error-utilities';

interface UseAIToolOptions extends AIToolConfig {
  autoExecute?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for executing a single AI tool
 *
 * @example
 * const { data, loading, error, execute } = useAITool('generate-outline', { topic: 'AI' });
 * return <button onClick={() => execute()}>Generate</button>;
 */
export function useAITool(
  toolName: string,
  input?: AIToolInput,
  options: UseAIToolOptions = {}
) {
  const { supabase } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [cacheHit, setCacheHit] = useState(false);
  const [provider, setProvider] = useState<'puter' | 'openrouter' | 'fallback'>('puter');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const execute = useCallback(
    async (customInput?: AIToolInput) => {
      setLoading(true);
      setError(null);

      try {
        const response: AIToolResponse = await puterAIFacade.call(
          toolName,
          customInput || input || {},
          supabase,
          {
            timeout: options.timeout,
            retries: options.retries,
            required: options.required,
            useCache: options.useCache !== false,
            cacheTTL: options.cacheTTL,
            provider: options.provider,
            systemPrompt: options.systemPrompt,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          }
        );

        if (response.success && response.data) {
          setData(response.data);
          setFallback(response.fallback || false);
          setCacheHit(response.cacheHit || false);
          setProvider(response.provider || 'puter');
          setExecutionTime(response.executionTime || null);
          options.onSuccess?.(response.data);
        } else {
          const errorMsg = response.error || 'Unknown error';
          setError(errorMsg);
          options.onError?.(errorMsg);
        }

        return response;
      } catch (err) {
        const normalized = normalizeError(err, 'useAITool.execute');
        setError(normalized.message);
        options.onError?.(normalized.message);
      } finally {
        setLoading(false);
      }
    },
    [supabase, toolName, input, options]
  );

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (options.autoExecute && input) {
      execute();
    }
  }, [options.autoExecute, input, execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setFallback(false);
    setCacheHit(false);
    setProvider('puter');
    setExecutionTime(null);
  }, []);

  return {
    data,
    error,
    loading,
    fallback,
    cacheHit,
    provider,
    executionTime,
    execute,
    reset
  };
}

/**
 * Hook for batch execution of multiple AI tools
 *
 * @example
 * const { results, progress, loading, execute } = useAIToolsBatch([
 *   { toolName: 'check-grammar', input: { text } },
 *   { toolName: 'improve-writing', input: { text } }
 * ]);
 * return <button onClick={() => execute()}>Analyze ({progress.toFixed(0)}%)</button>;
 */
export function useAIToolsBatch(
  tools: Array<{
    toolName: string;
    input: AIToolInput;
    config?: AIToolConfig;
  }>,
  options: Omit<UseAIToolOptions, 'autoExecute'> & { autoExecute?: boolean; parallel?: boolean } = {}
) {
  const { supabase } = useAuth();
  const [results, setResults] = useState<AIToolResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalExecutionTime, setTotalExecutionTime] = useState<number | null>(null);

  const execute = useCallback(async () => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    const startTime = performance.now();

    try {
      const parallel = options.parallel !== false; // Default to parallel
      const batchResults = await puterAIFacade.callBatch(
        tools.map(tool => ({
          ...tool,
          config: {
            timeout: options.timeout,
            retries: options.retries,
            required: options.required,
            useCache: options.useCache !== false,
            ...tool.config,
          }
        })),
        supabase,
        parallel
      );

      setResults(batchResults);
      setProgress(100);
      setTotalExecutionTime(performance.now() - startTime);
      options.onSuccess?.(batchResults);

      return batchResults;
    } catch (err) {
      const normalized = normalizeError(err, 'useAIToolsBatch.execute');
      setError(normalized.message);
      options.onError?.(normalized.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, tools, options]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (options.autoExecute) {
      execute();
    }
  }, [options.autoExecute, execute]);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setProgress(0);
    setTotalExecutionTime(null);
  }, []);

  return {
    results,
    error,
    loading,
    progress,
    totalExecutionTime,
    execute,
    reset
  };
}

/**
 * Hook for accessing AI service metrics and cache management
 *
 * @example
 * const { metrics, clearCache, cacheStats } = useAIMetrics();
 * return <div>Calls: {metrics.totalCalls}</div>;
 */
export function useAIMetrics() {
  const [metrics, setMetrics] = useState(puterAIFacade.getMetrics());
  const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({
    size: 0,
    keys: []
  });

  const updateMetrics = useCallback(() => {
    setMetrics(puterAIFacade.getMetrics());
  }, []);

  const clearCache = useCallback((pattern?: string) => {
    puterAIFacade.clearCache(pattern);
    updateMetrics();
  }, [updateMetrics]);

  const resetMetrics = useCallback(() => {
    puterAIFacade.resetMetrics();
    updateMetrics();
  }, [updateMetrics]);

  // Update metrics on effect
  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    metrics,
    cacheStats,
    clearCache,
    resetMetrics,
    updateMetrics
  };
}

/**
 * Hook for checking AI service availability
 */
export function useAIAvailability() {
  const { supabase } = useAuth();
  const [available, setAvailable] = useState(true);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    if (!supabase) {
      setAvailable(false);
      return;
    }

    setChecking(true);
    try {
      const response = await puterAIFacade.call(
        'health-check',
        {},
        supabase,
        { timeout: 5000, retries: 1 }
      );
      setAvailable(response.success);
    } catch {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  }, [supabase]);

  // Check on mount
  useEffect(() => {
    check();
  }, [check]);

  return {
    available,
    checking,
    check
  };
}

/**
 * Custom hook combining AI tool with loading UI patterns
 */
export function useAIToolWithUI(
  toolName: string,
  input?: AIToolInput,
  options: UseAIToolOptions = {}
) {
  const tool = useAITool(toolName, input, options);
  const availability = useAIAvailability();

  return {
    ...tool,
    isOnlineMode: availability.available && !tool.fallback,
    isOfflineMode: !availability.available || tool.fallback,
    isHealthChecking: availability.checking,
  };
}

export default useAITool;
