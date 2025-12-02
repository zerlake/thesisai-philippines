/**
 * React Hook for AI Service Provider
 * 
 * Unified interface for multiple AI services with automatic fallback.
 */

import { useState, useCallback } from 'react';
import { getAIServiceProvider, AIRequest, AIResponse } from '@/lib/ai-service-provider';
import { toast } from 'sonner';

export interface UseAIServiceOptions {
  showToast?: boolean;
  onSuccess?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

export function useAIService(options: UseAIServiceOptions = {}) {
  const {
    showToast = true,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [lastProvider, setLastProvider] = useState<string>('');

  /**
   * Generate text using best available AI service
   */
  const generate = useCallback(
    async (prompt: string, model?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const aiService = getAIServiceProvider();
        const result = await aiService.generate({
          prompt,
          model,
          maxTokens: 2048,
          temperature: 0.7,
        });

        setResponse(result);
        setLastProvider(result.provider);

        if (onSuccess) onSuccess(result);

        if (showToast) {
          const providerLabel = result.provider.toUpperCase();
          toast.success(`Generated with ${providerLabel}`);
        }

        return result.text;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (onError) onError(error);

        if (showToast) {
          toast.error(`Generation failed: ${error.message}`);
        }

        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, onSuccess, onError]
  );

  /**
   * Check which providers are available
   */
  const checkProviders = useCallback(async () => {
    try {
      const aiService = getAIServiceProvider();
      const status = await aiService.getProviderStatus();
      return status;
    } catch (err) {
      console.error('Failed to check providers:', err);
      return {
        puter: false,
        openai: false,
        mock: true, // Mock always available
      };
    }
  }, []);

  /**
   * Get the last used provider
   */
  const getLastProvider = useCallback(() => {
    return lastProvider;
  }, [lastProvider]);

  /**
   * Clear response
   */
  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    response,
    lastProvider,

    // Methods
    generate,
    checkProviders,
    getLastProvider,
    clearResponse,
  };
}

/**
 * Simple hook for just generating
 */
export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');

  const generate = useCallback(async (prompt: string): Promise<string> => {
    setIsGenerating(true);

    try {
      const aiService = getAIServiceProvider();
      const response = await aiService.generate({
        prompt,
        maxTokens: 2048,
      });

      setResult(response.text);
      return response.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error: ${message}`);
      return '';
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    isGenerating,
    result,
  };
}
