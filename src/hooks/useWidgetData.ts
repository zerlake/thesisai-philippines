/**
 * useWidgetData Hook
 * React hook for fetching widget data with loading/error states
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { dataSourceManager, WidgetData, DataSourceConfig } from '@/lib/dashboard/data-source-manager';

export interface UseWidgetDataOptions extends Partial<DataSourceConfig> {
  refetchInterval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: WidgetData) => void;
}

export interface UseWidgetDataResult<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  source: 'api' | 'cache' | 'mock' | 'realtime' | null;
}

/**
 * Hook for loading single widget data
 */
export function useWidgetData<T = unknown>(
  widgetId: string,
  options: UseWidgetDataOptions = {}
): UseWidgetDataResult<T> {
  const {
    refetchInterval,
    enabled = true,
    onError,
    onSuccess,
    ...dataSourceConfig
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<'api' | 'cache' | 'mock' | 'realtime' | null>(null);
  const [isStale, setIsStale] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    setIsLoading(true);
    try {
      const result = await dataSourceManager.fetchWidgetData(widgetId, dataSourceConfig);

      if (mountedRef.current) {
        setData(result.data as T);
        setLastUpdated(result.lastUpdated);
        setSource(result.source);
        setError(null);
        setIsStale(false);

        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
        setData(null);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [widgetId, enabled, dataSourceConfig, onError, onSuccess]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // Mark as stale after interval
  useEffect(() => {
    if (!lastUpdated) return;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsStale(true);
      }
    }, 1 * 60 * 1000); // 1 minute

    return () => clearTimeout(timer);
  }, [lastUpdated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Cancel pending requests
      dataSourceManager.cancelRequests(widgetId);
    };
  }, [widgetId]);

  return {
    data,
    isLoading,
    error,
    isStale,
    lastUpdated,
    source,
    refetch: fetchData
  };
}

/**
 * Hook for batch loading multiple widgets
 */
export function useWidgetsData<T extends Record<string, unknown> = Record<string, unknown>>(
  widgetIds: string[],
  options: UseWidgetDataOptions = {}
): {
  data: Record<string, unknown>;
  isLoading: boolean;
  isLoadingMap: Record<string, boolean>;
  errors: Record<string, Error | null>;
  errorMap: Record<string, string>;
  refetch: (widgetIds?: string[]) => Promise<void>;
  progress: number;
} {
  const {
    refetchInterval,
    enabled = true,
    onError,
    onSuccess,
    ...dataSourceConfig
  } = options;

  const [dataMap, setDataMap] = useState<Record<string, unknown>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, Error | null>>({});
  const [progress, setProgress] = useState(0);

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(
    async (ids: string[] = widgetIds) => {
      if (!enabled || !mountedRef.current) return;

      const initialLoading = ids.reduce(
        (acc, id) => ({
          ...acc,
          [id]: true
        }),
        {}
      );
      setLoadingMap(initialLoading);

      try {
        const results = await dataSourceManager.fetchMultiple(ids, dataSourceConfig);

        if (mountedRef.current) {
          const newData: Record<string, unknown> = {};
          const newErrors: Record<string, Error | null> = {};

          Object.entries(results).forEach(([id, result]) => {
            newData[id] = result.data;
            newErrors[id] = null;
            setLoadingMap(prev => ({
              ...prev,
              [id]: false
            }));
          });

          setDataMap(prev => ({
            ...prev,
            ...newData
          }));
          setErrorMap(newErrors);
          setProgress(100);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          ids.forEach(id => {
            setErrorMap(prev => ({
              ...prev,
              [id]: error
            }));
            setLoadingMap(prev => ({
              ...prev,
              [id]: false
            }));
          });
          onError?.(error);
        }
      }
    },
    [widgetIds, enabled, dataSourceConfig, onError]
  );

  // Initial fetch
  useEffect(() => {
    if (widgetIds.length > 0) {
      fetchData();
    }
  }, [widgetIds.length > 0 ? JSON.stringify(widgetIds) : '', fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled || widgetIds.length === 0) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData, widgetIds.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      widgetIds.forEach(id => {
        dataSourceManager.cancelRequests(id);
      });
    };
  }, [widgetIds]);

  const isLoading = Object.values(loadingMap).some(loading => loading);

  return {
    data: dataMap as T,
    isLoading,
    isLoadingMap: loadingMap,
    errors: errorMap,
    errorMap: Object.entries(errorMap).reduce(
      (acc, [id, error]) => ({
        ...acc,
        [id]: error?.message || ''
      }),
      {}
    ),
    refetch: (ids?: string[]) => fetchData(ids),
    progress
  };
}

/**
 * Hook for computed/derived data
 */
export function useComputedWidgetData<T = unknown>(
  widgetId: string,
  compute: (rawData: unknown) => T,
  options: UseWidgetDataOptions = {}
): UseWidgetDataResult<T> {
  const { data: rawData, ...rest } = useWidgetData(widgetId, options);

  const [computedData, setComputedData] = useState<T | null>(null);

  useEffect(() => {
    if (rawData === null || rawData === undefined) {
      setComputedData(null);
      return;
    }

    try {
      const result = compute(rawData);
      setComputedData(result);
    } catch (error) {
      console.error(`Computation error for ${widgetId}:`, error);
      setComputedData(null);
    }
  }, [rawData, compute, widgetId]);

  return {
    ...rest,
    data: computedData
  };
}

/**
 * Hook for polling data with backoff
 */
export function useWidgetDataWithPolling<T = unknown>(
  widgetId: string,
  options: UseWidgetDataOptions & {
    maxRetries?: number;
    backoffMultiplier?: number;
  } = {}
): UseWidgetDataResult<T> & {
  retryCount: number;
  isRetrying: boolean;
} {
  const { maxRetries = 3, backoffMultiplier = 2, ...dataOptions } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retriesRef = useRef(0);

  const result = useWidgetData<T>(widgetId, {
    ...dataOptions,
    refetchInterval: dataOptions.refetchInterval ? dataOptions.refetchInterval * Math.pow(backoffMultiplier, retryCount) : undefined,
    onError: (error) => {
      if (retriesRef.current < maxRetries) {
        retriesRef.current++;
        setRetryCount(retriesRef.current);
        setIsRetrying(true);

        // Reset retry after successful fetch
        const timer = setTimeout(() => {
          if (result.error === null) {
            retriesRef.current = 0;
            setRetryCount(0);
            setIsRetrying(false);
          }
        }, 1000);

        return () => clearTimeout(timer);
      }

      dataOptions.onError?.(error);
    }
  });

  return {
    ...result,
    retryCount,
    isRetrying
  };
}
