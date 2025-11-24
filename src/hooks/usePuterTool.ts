/**
 * React Hook for using Puter AI Tools
 * Provides convenient access to AI functionality with error handling and caching
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { executeTool, type PuterAIResponse } from '@/lib/puter-ai-integration';
import { normalizeError } from '@/utils/error-utilities';

interface UsePuterToolOptions {
  timeout?: number;
  retries?: number;
  required?: boolean;
  autoExecute?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function usePuterTool(
  functionName: string,
  input?: Record<string, any>,
  options: UsePuterToolOptions = {}
) {
  const { supabase } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);

  const execute = useCallback(
    async (customInput?: Record<string, any>) => {
      if (!supabase) {
        setError('Supabase client not initialized');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: PuterAIResponse = await executeTool(
          supabase,
          functionName,
          customInput || input || {},
          {
            timeout: options.timeout,
            retries: options.retries,
            required: options.required
          }
        );

        if (response.success && response.data) {
          setData(response.data);
          setFallback(response.fallback || false);
          options.onSuccess?.(response.data);
        } else {
          const errorMsg = response.error || 'Unknown error';
          setError(errorMsg);
          options.onError?.(errorMsg);
        }

        return response;
        } catch (err) {
        const normalized = normalizeError(err, 'usePuterTool.execute');
        setError(normalized.message);
        options.onError?.(normalized.message);
        } finally {
        setLoading(false);
        }
        },
    [supabase, functionName, input, options]
  );

  useEffect(() => {
    if (options.autoExecute && input) {
      execute();
    }
  }, [options.autoExecute, input, execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setFallback(false);
  }, []);

  return {
    data,
    error,
    loading,
    fallback,
    execute,
    reset
  };
}

/**
 * Hook for batch execution of multiple tools
 */
export function usePuterToolsBatch(
  tools: Array<{
    functionName: string;
    input: Record<string, any>;
    options?: any;
  }>,
  options: Omit<UsePuterToolOptions, 'autoExecute'> & { autoExecute?: boolean } = {}
) {
  const { supabase } = useAuth();
  const [results, setResults] = useState<PuterAIResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(async () => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const batchResults: PuterAIResponse[] = [];

      for (let i = 0; i < tools.length; i++) {
        const tool = tools[i];
        const response: PuterAIResponse = await executeTool(
          supabase,
          tool.functionName,
          tool.input,
          tool.options
        );

        batchResults.push(response);
        setProgress(((i + 1) / tools.length) * 100);
      }

      setResults(batchResults);
      options.onSuccess?.(batchResults);

      return batchResults;
      } catch (err) {
      const normalized = normalizeError(err, 'usePuterToolsBatch.execute');
      setError(normalized.message);
      options.onError?.(normalized.message);
      } finally {
      setLoading(false);
      }
  }, [supabase, tools, options]);

  useEffect(() => {
    if (options.autoExecute) {
      execute();
    }
  }, [options.autoExecute, execute]);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    results,
    error,
    loading,
    progress,
    execute,
    reset
  };
}

/**
 * Hook for streaming responses from AI tools
 */
export function usePuterToolStream(
  functionName: string,
  input: Record<string, any>,
  options: UsePuterToolOptions = {}
) {
  const { supabase } = useAuth();
  const [chunks, setChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const execute = useCallback(async () => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    setLoading(true);
    setError(null);
    setChunks([]);
    setComplete(false);

    try {
      const response: PuterAIResponse = await executeTool(
        supabase,
        functionName,
        input,
        {
          timeout: options.timeout,
          retries: options.retries
        }
      );

      if (response.success && response.data) {
        // Convert data to string chunks (simulating streaming)
        const dataStr = JSON.stringify(response.data);
        const chunkSize = 100;
        const dataChunks = [];

        for (let i = 0; i < dataStr.length; i += chunkSize) {
          dataChunks.push(dataStr.substring(i, i + chunkSize));
        }

        setChunks(dataChunks);
        setComplete(true);
        options.onSuccess?.(response.data);
      } else {
        const errorMsg = response.error || 'Unknown error';
        setError(errorMsg);
        options.onError?.(errorMsg);
      }

      return response;
      } catch (err) {
      const normalized = normalizeError(err, 'usePuterToolStream.execute');
      setError(normalized.message);
      options.onError?.(normalized.message);
      } finally {
      setLoading(false);
      }
  }, [supabase, functionName, input, options]);

  return {
    chunks,
    content: chunks.join(''),
    error,
    loading,
    complete,
    execute
  };
}

/**
 * Hook for managing tool cache
 */
export function usePuterCache() {
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] });

  const updateStats = useCallback(() => {
    // This would need to be implemented in the integration module
    // For now, it's a placeholder
    setCacheStats({ size: 0, keys: [] });
  }, []);

  const clearCache = useCallback(() => {
     // Clear cache implementation
     updateStats();
   }, [updateStats]);

  return {
    cacheStats,
    clearCache,
    updateStats
  };
}
