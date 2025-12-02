/**
 * React Hook for Direct Puter Connection
 * 
 * Provides a simple interface for making requests to Puter services
 * with built-in error handling, loading states, and streaming support.
 */

import { useState, useCallback, useRef } from 'react';
import {
  getPuterConnection,
  PuterRequest,
  PuterResponse,
  PuterConnectionConfig,
} from '@/lib/puter-direct-connection';
import { toast } from 'sonner';

export interface UsePuterDirectOptions {
  onSuccess?: (response: PuterResponse) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
  autoHealthCheck?: boolean;
}

export function usePuterDirect(options: UsePuterDirectOptions = {}) {
  const {
    onSuccess,
    onError,
    showToast = true,
    autoHealthCheck = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<PuterResponse | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const streamBufferRef = useRef<string>('');

  /**
   * Make a request to Puter
   */
  const request = useCallback(
    async (input: PuterRequest): Promise<PuterResponse | null> => {
      setIsLoading(true);
      setError(null);
      streamBufferRef.current = '';

      try {
        // Health check if enabled
        if (autoHealthCheck) {
          const healthy = await getPuterConnection().healthCheck();
          setIsHealthy(healthy);
          if (!healthy && showToast) {
            toast.warning('Puter service may be unavailable, attempting request anyway...');
          }
        }

        const puter = getPuterConnection();
        const result = await puter.request(input);

        setResponse(result);
        if (onSuccess) onSuccess(result);

        if (showToast) {
          toast.success('Request completed successfully');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (onError) onError(error);

        if (showToast) {
          toast.error(`Error: ${error.message}`);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, showToast, autoHealthCheck]
  );

  /**
   * Stream response from Puter
   */
  const streamRequest = useCallback(
    async (
      input: PuterRequest,
      onChunk?: (chunk: string, fullText: string) => void
    ): Promise<void> => {
      setIsStreaming(true);
      setError(null);
      streamBufferRef.current = '';

      try {
        // Health check if enabled
        if (autoHealthCheck) {
          const healthy = await getPuterConnection().healthCheck();
          setIsHealthy(healthy);
        }

        const puter = getPuterConnection();

        for await (const chunk of puter.stream(input)) {
          streamBufferRef.current += chunk;
          if (onChunk) {
            onChunk(chunk, streamBufferRef.current);
          }
        }

        if (showToast) {
          toast.success('Stream completed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (onError) onError(error);

        if (showToast) {
          toast.error(`Stream error: ${error.message}`);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [onSuccess, onError, showToast, autoHealthCheck]
  );

  /**
   * Check Puter service health
   */
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const puter = getPuterConnection();
      const healthy = await puter.healthCheck();
      setIsHealthy(healthy);
      return healthy;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsHealthy(false);
      return false;
    }
  }, []);

  /**
   * Update Puter configuration
   */
  const updateConfig = useCallback((config: Partial<PuterConnectionConfig>) => {
    const puter = getPuterConnection(config);
    setIsHealthy(false); // Reset health check after config update
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear response
   */
  const clearResponse = useCallback(() => {
    setResponse(null);
    streamBufferRef.current = '';
  }, []);

  return {
    // State
    isLoading,
    isStreaming,
    error,
    response,
    isHealthy,
    streamedText: streamBufferRef.current,

    // Methods
    request,
    streamRequest,
    checkHealth,
    updateConfig,
    clearError,
    clearResponse,
  };
}

/**
 * Simple hook for generate-and-forget requests
 */
export function usePuterGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (prompt: string, model?: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const puter = getPuterConnection();
      const response = await puter.request({
        prompt,
        model,
        maxTokens: 2048,
        temperature: 0.7,
      });

      setResult(response.text);
      return response.text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error(`Generation failed: ${error.message}`);
      throw error;
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
