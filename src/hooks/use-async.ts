import { useState, useCallback, useEffect, useRef } from 'react';

// Note: If you use toasts for notifications, you may need to install and import a toast library.
// e.g., `import { toast } from 'react-hot-toast';`

/**
 * Defines the shape of the state object returned by `useAsync`.
 */
export interface UseAsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Configuration options for the `useAsync` hook.
 */
export interface UseAsyncOptions<T> {
  immediate?: boolean; // Execute the async function immediately on mount.
  onSuccess?: (data: T) => void; // Callback for successful execution.
  onError?: (error: Error) => void; // Callback for errors.
}

/**
 * A generic React hook for handling asynchronous operations.
 * It manages loading, error, and data states, preventing common issues
 * like memory leaks from state updates on unmounted components.
 *
 * @param fn The asynchronous function to execute.
 * @param options Configuration options (`immediate`, `onSuccess`, `onError`).
 * @returns The async state and control functions (`execute`, `reset`).
 */
export function useAsync<T, Args extends any[] = []>(
  fn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncState<T> {
  const { immediate = false, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(immediate);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      setData(undefined);
      setError(undefined);
    }
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      if (!mountedRef.current) return;
      
      setIsLoading(true);
      setError(undefined);
      // We don't clear previous data, so it can be displayed while reloading.

      try {
        const result = await fn(...args);
        if (mountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const castError = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(castError);
          onError?.(castError);
        }
        return undefined; // Ensure a consistent return type on error
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [fn, onSuccess, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [execute, immediate]);

  return { data, error, isLoading, execute, reset };
}

/**
 * A hook that extends `useAsync` with automatic retry logic on failure,
 * implementing an exponential backoff strategy.
 *
 * @example
 * const { data, error, isLoading, retries, isRetrying } = useAsyncRetry(
 *   async (userId) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error('Failed to fetch user');
 *     return response.json();
 *   },
 *   3, // Retry up to 3 times
 *   {
 *     onError: (error) => {
 *       console.error(`Attempt failed: ${error.message}. Retrying...`);
 *       // e.g., toast.loading(`Retrying...`);
 *     }
 *   }
 * );
 *
 * @param fn The asynchronous function to execute and retry.
 * @param retryCount The number of times to retry on failure.
 * @param options `UseAsyncOptions` to pass to the underlying `useAsync` hook.
 * @returns The `useAsync` state plus `retries` and `isRetrying` properties.
 */
export function useAsyncRetry<T, Args extends any[] = []>(
  fn: (...args: Args) => Promise<T>,
  retryCount: number = 3,
  options: UseAsyncOptions<T> = {}
): UseAsyncState<T> & {
  retries: number;
  isRetrying: boolean;
} {
  const [retries, setRetries] = useState(retryCount);
  const retriesRef = useRef(retryCount);
  const { onError } = options;

  const wrappedFn = useCallback(
    async (...args: Args): Promise<T> => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await fn(...args);
          // On a successful attempt, reset retry count for the next manual execution
          if (attempt > 0) {
            retriesRef.current = retryCount;
            setRetries(retryCount);
          }
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < retryCount) {
            const remaining = retryCount - (attempt + 1);
            retriesRef.current = remaining;
            setRetries(remaining);
            
            // Notify the caller about the retry attempt
            onError?.(lastError);
            
            // Exponential backoff delay (e.g., 100ms, 200ms, 400ms...)
            await new Promise(resolve =>
              setTimeout(resolve, 100 * Math.pow(2, attempt))
            );
          }
        }
      }
      
      // If we exit the loop, all retries have failed.
      // Reset count for next manual `execute` call.
      retriesRef.current = retryCount;
      setRetries(retryCount);

      throw lastError!; // Throw the last captured error
    },
    [fn, retryCount, onError]
  );

  const state = useAsync(wrappedFn, options);

  return {
    ...state,
    retries: retriesRef.current,
    isRetrying: state.isLoading && retriesRef.current < retryCount,
  };
}
