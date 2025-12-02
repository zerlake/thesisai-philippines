/**
 * React Hook for Puter with Fallback
 * 
 * Automatically falls back to mock data when Puter is unavailable.
 * Includes caching and intelligent error handling.
 */

import { useState, useCallback, useRef } from 'react';
import { getPuterWithFallback, FallbackOptions } from '@/lib/puter-with-fallback';
import { PuterRequest } from '@/lib/puter-direct-connection';
import { toast } from 'sonner';

export interface UsePuterWithFallbackOptions extends FallbackOptions {
  showToast?: boolean;
  showFallbackNotice?: boolean;
}

export function usePuterWithFallback(options: UsePuterWithFallbackOptions = {}) {
  const {
    showToast = true,
    showFallbackNotice = true,
    ...fallbackOptions
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<string>('');
  const [isFallback, setIsFallback] = useState(false);
  const [cacheHit, setCacheHit] = useState(false);
  const streamBufferRef = useRef<string>('');

  /**
   * Generate text (with fallback)
   */
  const generate = useCallback(
    async (prompt: string, model?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setIsFallback(false);
      setCacheHit(false);
      setResult('');

      try {
        const fallback = getPuterWithFallback(fallbackOptions);
        const response = await fallback.generate({
          prompt,
          model,
          maxTokens: 2048,
          temperature: 0.7,
        });

        // Check if it's a fallback response
        const isFallbackResponse = response.model === 'fallback-mock';
        setIsFallback(isFallbackResponse);

        // Check if it's from cache
        const cacheStats = fallback.getCacheStats();
        const isInCache = cacheStats.entries.some(e => 
          e.key.includes(prompt.toLowerCase().slice(0, 20))
        );
        setCacheHit(isInCache);

        setResult(response.text);

        if (showToast) {
          if (isFallbackResponse) {
            toast.warning('Using fallback (Puter unavailable)');
          } else if (isInCache) {
            toast.success('Result from cache');
          } else {
            toast.success('Generated successfully');
          }
        }

        return response.text;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (showToast) {
          toast.error(`Generation failed: ${error.message}`);
        }

        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [fallbackOptions, showToast]
  );

  /**
   * Stream response (with fallback)
   */
  const stream = useCallback(
    async (
      prompt: string,
      onChunk?: (chunk: string, fullText: string) => void,
      model?: string
    ): Promise<string> => {
      setIsStreaming(true);
      setError(null);
      setIsFallback(false);
      streamBufferRef.current = '';

      try {
        const fallback = getPuterWithFallback(fallbackOptions);
        let fullText = '';

        for await (const chunk of fallback.stream({
          prompt,
          model,
          maxTokens: 2048,
        })) {
          fullText += chunk;
          streamBufferRef.current = fullText;
          if (onChunk) {
            onChunk(chunk, fullText);
          }
        }

        setResult(fullText);

        if (showToast) {
          toast.success('Stream completed');
        }

        return fullText;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (showToast) {
          toast.error(`Stream failed: ${error.message}`);
        }

        return streamBufferRef.current;
      } finally {
        setIsStreaming(false);
      }
    },
    [fallbackOptions, showToast]
  );

  /**
   * Get cache info
   */
  const getCacheInfo = useCallback(() => {
    const fallback = getPuterWithFallback();
    return fallback.getCacheStats();
  }, []);

  /**
   * Get failure log
   */
  const getFailureLog = useCallback(() => {
    const fallback = getPuterWithFallback();
    return fallback.getFailureLog();
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    const fallback = getPuterWithFallback();
    fallback.clearCache();
  }, []);

  /**
   * Clear result
   */
  const clearResult = useCallback(() => {
    setResult('');
    streamBufferRef.current = '';
    setError(null);
    setIsFallback(false);
    setCacheHit(false);
  }, []);

  return {
    // State
    isLoading,
    isStreaming,
    error,
    result,
    isFallback,
    cacheHit,
    streamedText: streamBufferRef.current,

    // Methods
    generate,
    stream,
    getCacheInfo,
    getFailureLog,
    clearCache,
    clearResult,
  };
}

/**
 * Simple hook for generate-only use case
 */
export function usePuterGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (prompt: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const fallback = getPuterWithFallback({
        useMockData: true,
        cacheResponses: true,
      });

      const response = await fallback.generate({
        prompt,
        maxTokens: 2048,
      });

      setResult(response.text);
      return response.text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(`Error: ${error.message}`);
      return '';
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    isGenerating,
    result,
    error,
  };
}
