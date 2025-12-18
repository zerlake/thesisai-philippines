import { LRUCache } from 'lru-cache';

export interface CacheConfig {
  ttl?: number;                          // Time to live in ms
  staleWhileRevalidate?: number;         // Serve stale while updating
  revalidateOnFocus?: boolean;           // Refresh on tab focus
  dependencies?: string[];               // Invalidate on changes
  strategy?: 'cache-first' | 'network-first' | 'network-only' | 'cache-only';
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgRetrievalTime: number;
  size: number;
  maxSize: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  staleAt?: number;
  source: 'api' | 'cache' | 'mock';
}

export class IntelligentCache {
  private cache: LRUCache<string, CacheEntry<any>>;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    avgRetrievalTime: 0,
    size: 0,
    maxSize: 0
  };
  private updatePromises: Map<string, Promise<any>> = new Map();
  private dependencyMap: Map<string, Set<string>> = new Map();

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({ max: maxSize });
    this.metrics.maxSize = maxSize;
  }

  /**
   * Get or fetch value with intelligent caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Check cache
      const cached = this.cache.get(key);

      if (cached && config.strategy !== 'network-only') {
        const now = Date.now();

        // Return if fresh
        if (now < cached.expiresAt) {
          this.recordHit(startTime);
          return cached.data as T;
        }

        // Handle stale-while-revalidate
        if (
          config.staleWhileRevalidate &&
          cached.staleAt &&
          now < cached.staleAt
        ) {
          this.recordHit(startTime);
          // Revalidate in background
          this.updateInBackground(key, fetcher, config);
          return cached.data as T;
        }
      }

      // Fetch new data
      const data = await this.executeWithDedup(key, fetcher, config);

      // Store in cache
      this.setCached(key, data, config);

      // Register dependencies
      if (config.dependencies) {
        this.registerDependencies(key, config.dependencies);
      }

      this.recordMiss(startTime);
      return data;
    } catch (error) {
      // On error, return stale data if available
      const cached = this.cache.get(key);
      if (cached && config.strategy !== 'network-only') {
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Deduplicate concurrent requests
   */
  private async executeWithDedup<T>(
    key: string,
    fetcher: () => Promise<T>,
    _config: CacheConfig
  ): Promise<T> {
    // If request already in flight, return that promise
    const existing = this.updatePromises.get(key);
    if (existing) {
      return existing;
    }

    // Create new promise
    const promise = fetcher()
      .then(data => {
        this.updatePromises.delete(key);
        return data;
      })
      .catch(error => {
        this.updatePromises.delete(key);
        throw error;
      });

    this.updatePromises.set(key, promise);
    return promise;
  }

  /**
   * Revalidate cache entry in background
   */
  private async updateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.setCached(key, data, config);
    } catch (error) {
      // Silently fail background updates
      console.debug(`Background update failed for ${key}:`, error);
    }
  }

  /**
   * Store value in cache with TTL
   */
  private setCached<T>(key: string, data: T, config: CacheConfig): void {
    const now = Date.now();
    const ttl = config.ttl ?? 5 * 60 * 1000; // Default 5 minutes

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      staleAt: config.staleWhileRevalidate
        ? now + ttl + config.staleWhileRevalidate
        : undefined,
      source: 'api'
    };

    this.cache.set(key, entry);
    this.updateMetrics();
  }

  /**
   * Invalidate cache by pattern or dependency
   */
  async invalidate(pattern: string | RegExp): Promise<void> {
    const isRegex = pattern instanceof RegExp;

    for (const key of this.cache.keys()) {
      const matches = isRegex
        ? (pattern as RegExp).test(key)
        : key.includes(pattern as string);

      if (matches) {
        this.cache.delete(key);
      }
    }

    this.updateMetrics();
  }

  /**
   * Prefetch data into cache
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<void> {
    await this.getOrFetch(key, fetcher, config);
  }

  /**
   * Warm cache with multiple keys
   */
  async warmCache<T>(
    keys: Array<{ key: string; fetcher: () => Promise<T> }>,
    config: CacheConfig = {}
  ): Promise<void> {
    await Promise.all(
      keys.map(({ key, fetcher }) =>
        this.prefetch(key, fetcher, config).catch(() => {
          // Ignore prefetch errors
        })
      )
    );
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.updatePromises.clear();
    this.dependencyMap.clear();
    this.updateMetrics();
  }

  /**
   * Register dependency relationships
   */
  private registerDependencies(key: string, dependencies: string[]): void {
    dependencies.forEach(dep => {
      if (!this.dependencyMap.has(dep)) {
        this.dependencyMap.set(dep, new Set());
      }
      this.dependencyMap.get(dep)!.add(key);
    });
  }

  /**
   * Invalidate dependent keys
   */
  invalidateDependents(key: string): void {
    const dependents = this.dependencyMap.get(key);
    if (dependents) {
      dependents.forEach(dependent => {
        this.cache.delete(dependent);
      });
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Record cache hit
   */
  private recordHit(startTime: number): void {
    this.metrics.hits++;
    this.updateHitRate();
    this.recordTime(startTime);
  }

  /**
   * Record cache miss
   */
  private recordMiss(startTime: number): void {
    this.metrics.misses++;
    this.updateHitRate();
    this.recordTime(startTime);
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * Record retrieval time
   */
  private recordTime(startTime: number): void {
    const elapsed = performance.now() - startTime;
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.avgRetrievalTime =
      (this.metrics.avgRetrievalTime * (total - 1) + elapsed) / total;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.size = this.cache.size;
  }
}

// Singleton instance
export const intelligentCache = new IntelligentCache(200);
