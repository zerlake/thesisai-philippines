import React, { useState, useCallback, useEffect, useRef } from 'react';
import { apiCall, FetchOptions, ApiResponse } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors'; // Assuming getErrorMessage is in src/lib/errors.ts

// Define the shape of the state returned by useApiCall
export interface UseApiCallState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  execute: (url: string, options?: FetchOptions<T>) => Promise<{ success: boolean; data?: T }>;
  reset: () => void;
  errorMessage: string | undefined;
}

// Options for useApiCall hook
export interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  autoErrorToast?: boolean;
  autoSuccessToast?: () => void;
}

/**
 * A hook for making API calls with automatic state management for loading, error, and data.
 *
 * @param options - Configuration options for the hook.
 * @returns The API call state and functions to execute and reset.
 */
export function useApiCall<T = unknown>(options: UseApiCallOptions = {}): UseApiCallState<T> {
  const { onSuccess, onError, autoErrorToast, autoSuccessToast } = options;

  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
  }>({
    data: undefined,
    loading: false,
    error: undefined,
  });

  const isMountedRef = useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (url: string, callOptions?: FetchOptions<T>): Promise<{ success: boolean; data?: T }> => {
      setState({ data: undefined, loading: true, error: undefined });
      try {
        const response = await apiCall<T>(url, callOptions);
        if (isMountedRef.current) {
          setState({
            data: response.data,
            loading: false,
            error: undefined,
          });
          onSuccess?.(response.data);
          autoSuccessToast?.();
        }
        return {
          success: response.success,
          data: response.data,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setState({
            data: undefined,
            loading: false,
            error,
          });
          onError?.(error);
          if (autoErrorToast) {
            try {
              const { toast } = require('sonner'); // Conditional import for sonner
              toast.error(getErrorMessage(error));
            } catch (importError) {
              console.error('API Error:', getErrorMessage(error));
            }
          }
        }
        throw error;
      }
    },
    [onSuccess, onError, autoErrorToast, autoSuccessToast]
  );

  const reset = useCallback(() => {
    setState({ data: undefined, loading: false, error: undefined });
  }, []);

  const errorMessage = state.error ? getErrorMessage(state.error) : undefined;

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    errorMessage,
  };
}

/**
 * Hook for API calls that provides both immediate execution and manual execution.
 * Combines the benefits of useAsync and useApiCall.
 *
 * @param url - API endpoint URL to call.
 * @param fetchOptions - Fetch options or hook options.
 * @param hookOptions - Configuration options for the hook.
 * @returns Hook state with data, loading, error, refetch.
 *
 * @example
 * const { data, loading, error, refetch } = useApiEffect<Data>(
 *   '/api/user-data',
 *   { immediate: true },
 *   {
 *     onSuccess: (data) => console.log('Loaded:', data),
 *     onError: (error) => console.error('Failed:', error)
 *   }
 * );
 *
 * return (
 *   <div>
 *     {loading && <Spinner />}
 *     {data && <Content data={data} />}
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 */
export function useApiEffect<T = unknown>(
  url: string,
  fetchOptions?: FetchOptions<T> & { immediate?: boolean },
  hookOptions?: UseApiCallOptions
): Omit<UseApiCallState<T>, 'execute'> & {
  refetch: () => Promise<{ success: boolean; data?: T }>;
} {
  const { immediate = true, ...apiOptions } = fetchOptions || {};
  const { execute, ...state } = useApiCall<T>(hookOptions);

  React.useEffect(() => {
    if (immediate) {
      execute(url, apiOptions).catch(err => {
        // Error is already handled by useApiCall
        console.error('Auto-execute failed:', err);
      });
    }
  }, [url, immediate, execute, apiOptions]);

  return {
    ...state,
    refetch: () => execute(url, apiOptions),
  };
}

/**
 * Hook for API calls with automatic retry logic on failure.
 * Extends useApiCall with built-in retry mechanism.
 *
 * @param options - Configuration options including retry count and delay.
 * @returns Hook state plus retry information.
 *
 * @example
 * const { execute, loading, error, retries, isRetrying } = useApiCallWithRetry<Data>({
 *   retryCount: 3,
 *   retryDelay: 2000,
 *   onError: (error) => {
 *     if (isRetrying) {
 *       // e.g., toast.loading('Retrying...');
 *     } else {
 *       // e.g., toast.error('Failed after all retries');
 *     }
 *   }
 * });
 *
 * const handleFetch = async () => {
 *   try {
 *     const result = await execute('/api/data', { timeout: 10_000 });
 *     if (result.success) {
 *       console.log('Success:', result.data);
 *     }
 *   } catch (err) {
 *     console.error('Failed:', err.message);
 *   }
 * };
 */
export function useApiCallWithRetry<T = unknown>(
  options: UseApiCallOptions & {
    retryCount?: number;
    retryDelay?: number;
  } = {}
): UseApiCallState<T> & {
  retries: number;
  isRetrying: boolean;
  attemptsRemaining: number;
} {
  const { retryCount = 3, retryDelay = 1000, ...apiCallOptions } = options;
  const [retries, setRetries] = React.useState(0);
  const attemptsRemainingRef = React.useRef(retryCount);

  const { execute: baseExecute, ...state } = useApiCall<T>({
    ...apiCallOptions,
    onError: (error) => {
      apiCallOptions.onError?.(error);
    },
  });

  const executeWithRetry = useCallback(
    async (url: string, fetchOptions?: FetchOptions<T>): Promise<{ success: boolean; data?: T }> => {
      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt <= retryCount) {
        try {
          const result = await baseExecute(url, fetchOptions);
          attemptsRemainingRef.current = retryCount;
          setRetries(0);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          attempt++;
          if (attempt <= retryCount) {
            const remaining = retryCount - attempt;
            attemptsRemainingRef.current = remaining;
            setRetries(attempt);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      if (lastError) {
        throw lastError;
      }
      throw new Error('Failed to execute API call');
    },
    [baseExecute, retryCount, retryDelay]
  );

  return {
    ...state,
    execute: executeWithRetry,
    retries,
    isRetrying: retries > 0,
    attemptsRemaining: attemptsRemainingRef.current,
  };
}
