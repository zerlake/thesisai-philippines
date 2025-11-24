import { useState, useCallback, useEffect } from "react";

export type LoadingPhase = "idle" | "skeleton" | "partial" | "complete";

export interface ProgressiveLoadConfig {
  skeletonDelay?: number; // Delay before showing skeleton (ms)
  partialDelay?: number; // Delay before showing partial content (ms)
  timeout?: number; // Max loading time (ms)
  retries?: number; // Number of retry attempts
}

/**
 * Hook for progressive loading with skeleton screens and lazy loading
 * Provides better perceived performance and UX
 */
export function useProgressiveLoad<T>(
  loadFn: () => Promise<T>,
  config?: ProgressiveLoadConfig
) {
  const [phase, setPhase] = useState<LoadingPhase>("idle");
  const [data, setData] = useState<T | null>(null);
  const [skeletonData, setSkeletonData] = useState<Partial<T> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const defaultConfig: Required<ProgressiveLoadConfig> = {
    skeletonDelay: 200,
    partialDelay: 800,
    timeout: 10000,
    retries: 3,
    ...config,
  };

  const load = useCallback(async () => {
    if (phase === "complete") return; // Already loaded

    try {
      setPhase("skeleton");
      setError(null);

      // Show skeleton after delay
      const skeletonTimer = setTimeout(() => {
        setSkeletonData(generateSkeleton());
        setPhase("partial");
      }, defaultConfig.skeletonDelay);

      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timeout")),
          defaultConfig.timeout
        )
      );

      // Race between load and timeout
      const result = await Promise.race([loadFn(), timeoutPromise]);

      clearTimeout(skeletonTimer);
      setData(result);
      setSkeletonData(null);
      setPhase("complete");
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setPhase("idle");

      // Auto-retry on specific errors
      if (
        shouldAutoRetry(error) &&
        retryCount < defaultConfig.retries
      ) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          load();
        }, delay);
      }
    }
  }, [phase, loadFn, retryCount, defaultConfig]);

  return {
    phase,
    data,
    skeletonData,
    error,
    isLoading: phase === "skeleton" || phase === "partial",
    isComplete: phase === "complete",
    load,
    retry: () => {
      setRetryCount(0);
      setError(null);
      setPhase("idle");
      load();
    },
  };
}

/**
 * Determine if error should trigger auto-retry
 */
function shouldAutoRetry(error: Error): boolean {
  const retryableMessages = [
    "timeout",
    "network",
    "ECONNREFUSED",
    "ENOTFOUND",
    "429", // Rate limit
  ];

  return retryableMessages.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Generate skeleton/placeholder data
 */
function generateSkeleton(): Partial<Record<string, any>> {
  return {
    isLoading: true,
    skeleton: true,
  };
}

/**
 * Hook for lazy loading components
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "50px", // Start loading 50px before entering viewport
      threshold: 0.01,
      ...options,
    });

    observer.observe(ref.current);

    return () => {
      ref.current && observer.unobserve(ref.current);
    };
  }, [ref, callback, options]);
}

/**
 * Hook for virtual scrolling (render only visible items)
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    handleScroll,
  };
}
