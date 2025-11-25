/**
 * Data Source Manager
 * Manages all widget data sources with caching, real-time updates, and fallbacks
 */

import { validateWidgetData, getMockWidgetData } from './widget-schemas';
import { dashboardErrorHandler, ApiError } from './api-error-handler';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  strategy: 'cache-first' | 'network-first' | 'network-only' | 'cache-only';
}

export interface DataSourceConfig {
  type: 'supabase' | 'api' | 'compute' | 'cache';
  endpoint?: string;
  cache?: CacheConfig;
  realtime?: boolean;
  timeout?: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  source: 'api' | 'cache' | 'mock' | 'realtime';
}

export interface WidgetData<T = unknown> {
  widgetId: string;
  data: T;
  lastUpdated: Date;
  source: 'api' | 'cache' | 'mock' | 'realtime';
  isValid: boolean;
  validationErrors?: string[];
}

export interface LoadingState {
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  progress: number; // 0-100
}

type SubscriptionCallback<T = unknown> = (data: WidgetData<T>) => void;
type Unsubscriber = () => void;

class DataSourceManager {
  private cache = new Map<string, CacheEntry>();
  private subscriptions = new Map<string, Set<SubscriptionCallback>>();
  private loadingState: LoadingState = { loading: {}, errors: {}, progress: 0 };
  private abortControllers = new Map<string, AbortController>();
  private defaultConfig: DataSourceConfig = {
    type: 'api',
    cache: {
      ttl: 5 * 60 * 1000, // 5 minutes default
      strategy: 'cache-first'
    },
    timeout: 10000 // 10 seconds default
  };

  private sourceConfigs: Record<string, DataSourceConfig> = {};

  constructor() {
    this.initializeConfigs();
  }

  /**
   * Initialize data source configurations
   */
  private initializeConfigs(): void {
    const configs: Record<string, DataSourceConfig> = {
      'research-progress': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/research-progress',
        cache: { ttl: 5 * 60 * 1000, strategy: 'cache-first' },
        realtime: false
      },
      'quick-stats': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/quick-stats',
        cache: { ttl: 3 * 60 * 1000, strategy: 'cache-first' }
      },
      'recent-papers': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/recent-papers',
        cache: { ttl: 10 * 60 * 1000, strategy: 'cache-first' }
      },
      'writing-goals': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/writing-goals',
        cache: { ttl: 5 * 60 * 1000, strategy: 'cache-first' }
      },
      'collaboration': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/collaboration',
        cache: { ttl: 2 * 60 * 1000, strategy: 'network-first' },
        realtime: true
      },
      'calendar': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/calendar',
        cache: { ttl: 10 * 60 * 1000, strategy: 'cache-first' }
      },
      'trends': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/trends',
        cache: { ttl: 15 * 60 * 1000, strategy: 'cache-first' }
      },
      'notes': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/notes',
        cache: { ttl: 5 * 60 * 1000, strategy: 'cache-first' }
      },
      'citations': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/citations',
        cache: { ttl: 30 * 60 * 1000, strategy: 'cache-first' }
      },
      'suggestions': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/suggestions',
        cache: { ttl: 10 * 60 * 1000, strategy: 'network-first' }
      },
      'time-tracker': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/time-tracker',
        cache: { ttl: 5 * 60 * 1000, strategy: 'cache-first' }
      },
      'custom': {
        type: 'api',
        endpoint: '/api/dashboard/widgets/custom',
        cache: { ttl: 5 * 60 * 1000, strategy: 'cache-first' }
      }
    };

    this.sourceConfigs = configs;
  }

  /**
   * Fetch widget data
   */
  async fetchWidgetData(
    widgetId: string,
    config?: Partial<DataSourceConfig>
  ): Promise<WidgetData> {
    const fullConfig = { ...this.sourceConfigs[widgetId], ...this.defaultConfig, ...config };

    this.setLoading(widgetId, true);

    try {
      // Check cache first if strategy is cache-first
      if (fullConfig.cache?.strategy === 'cache-first') {
        const cached = this.getCachedData(widgetId);
        if (cached) {
          this.setLoading(widgetId, false);
          return cached;
        }
      }

      // Fetch from API
      if (fullConfig.type === 'api' && fullConfig.endpoint) {
        const data = await this.fetchFromApi(widgetId, fullConfig);
        this.setLoading(widgetId, false);
        return data;
      }

      // Fallback to mock data
      const mockData = this.getFallbackData(widgetId);
      this.setLoading(widgetId, false);
      return mockData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.setError(widgetId, err);
      this.setLoading(widgetId, false);

      // Return fallback/mock data on error
      return this.getFallbackData(widgetId);
    }
  }

  /**
   * Fetch data from API
   */
  private async fetchFromApi(
    widgetId: string,
    config: DataSourceConfig
  ): Promise<WidgetData> {
    if (!config.endpoint) {
      throw new Error(`No endpoint configured for widget: ${widgetId}`);
    }

    const controller = new AbortController();
    this.abortControllers.set(widgetId, controller);

    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

    try {
      const response = await fetch(config.endpoint, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new ApiError(`API error: ${response.statusText}`, response.status);
      }

      const rawData = await response.json();

      // Validate data
      const validation = validateWidgetData(widgetId, rawData);

      if (!validation.valid) {
        console.warn(`Validation failed for ${widgetId}:`, validation.errors);
      }

      // Cache the data
      this.setCachedData(
        widgetId,
        validation.valid ? validation.data : rawData,
        config.cache?.ttl || this.defaultConfig.cache!.ttl
      );

      // Clear error if successful
      this.setError(widgetId, null);

      return {
        widgetId,
        data: validation.valid ? validation.data : rawData,
        lastUpdated: new Date(),
        source: 'api',
        isValid: validation.valid,
        validationErrors: validation.errors
      };
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(widgetId);
    }
  }

  /**
   * Batch fetch multiple widgets
   */
  async fetchMultiple(
    widgetIds: string[],
    configs?: Partial<DataSourceConfig>
  ): Promise<Record<string, WidgetData>> {
    const promises = widgetIds.map(id => this.fetchWidgetData(id, configs));
    const results = await Promise.all(promises);

    const data: Record<string, WidgetData> = {};
    widgetIds.forEach((id, index) => {
      data[id] = results[index];
    });

    return data;
  }

  /**
   * Subscribe to widget data updates
   */
  subscribeToWidget(
    widgetId: string,
    callback: SubscriptionCallback
  ): Unsubscriber {
    if (!this.subscriptions.has(widgetId)) {
      this.subscriptions.set(widgetId, new Set());
    }

    this.subscriptions.get(widgetId)!.add(callback);

    // Return unsubscriber
    return () => {
      const subs = this.subscriptions.get(widgetId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(widgetId);
        }
      }
    };
  }

  /**
   * Notify subscribers of data changes
   */
  private notifySubscribers(widgetId: string, data: WidgetData): void {
    const subs = this.subscriptions.get(widgetId);
    if (subs) {
      subs.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber error:', error);
        }
      });
    }
  }

  /**
   * Invalidate cache for widget
   */
  invalidateCache(widgetId?: string): void {
    if (widgetId) {
      this.cache.delete(widgetId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Cancel pending requests
   */
  cancelRequests(widgetId?: string): void {
    if (widgetId) {
      const controller = this.abortControllers.get(widgetId);
      if (controller) {
        controller.abort();
        this.abortControllers.delete(widgetId);
      }
    } else {
      this.abortControllers.forEach(controller => controller.abort());
      this.abortControllers.clear();
    }
  }

  /**
   * Get cached data
   */
  private getCachedData(widgetId: string): WidgetData | null {
    const entry = this.cache.get(widgetId);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(widgetId);
      return null;
    }

    return {
      widgetId,
      data: entry.data,
      lastUpdated: new Date(entry.timestamp),
      source: 'cache',
      isValid: true
    };
  }

  /**
   * Set cached data
   */
  private setCachedData(widgetId: string, data: unknown, ttl: number): void {
    this.cache.set(widgetId, {
      data,
      timestamp: Date.now(),
      ttl,
      source: 'cache'
    });
  }

  /**
   * Get fallback/mock data
   */
  private getFallbackData(widgetId: string): WidgetData {
    const mockData = getMockWidgetData(widgetId);
    const validation = validateWidgetData(widgetId, mockData);

    return {
      widgetId,
      data: validation.data || mockData,
      lastUpdated: new Date(),
      source: 'mock',
      isValid: validation.valid
    };
  }

  /**
   * Set loading state
   */
  private setLoading(widgetId: string, loading: boolean): void {
    this.loadingState.loading[widgetId] = loading;
    this.updateProgress();
  }

  /**
   * Set error state
   */
  private setError(widgetId: string, error: Error | null): void {
    this.loadingState.errors[widgetId] = error;
  }

  /**
   * Update progress
   */
  private updateProgress(): void {
    const total = Object.keys(this.loadingState.loading).length;
    if (total === 0) {
      this.loadingState.progress = 0;
      return;
    }

    const loaded = Object.values(this.loadingState.loading).filter(l => !l).length;
    this.loadingState.progress = Math.round((loaded / total) * 100);
  }

  /**
   * Get loading state
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxAge: Math.max(...entries.map(([_, e]) => now - e.timestamp), 0),
      entries: entries.map(([id, entry]) => ({
        widgetId: id,
        age: now - entry.timestamp,
        ttl: entry.ttl,
        size: JSON.stringify(entry.data).length
      }))
    };
  }

  /**
   * Clear all caches and state
   */
  clear(): void {
    this.cache.clear();
    this.cancelRequests();
    this.loadingState = { loading: {}, errors: {}, progress: 0 };
  }
}

// Export singleton instance
export const dataSourceManager = new DataSourceManager();

export type { WidgetData };
