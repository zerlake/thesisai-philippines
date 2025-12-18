/**
 * Intelligent Caching Layer
 * Phase 5: Advanced AI Features
 */

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
  evictions: number;
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
    maxSize: 0,
    evictions: 0
  };
  private updatePromises: Map<string, Promise<any>> = new Map();
  private dependencyMap: Map<string, Set<string>> = new Map();
  private recentHits: number[] = []; // Track recent hits for optimization
  private recentMisses: number[] = []; // Track recent misses for optimization

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({ 
      max: maxSize,
      // Add automatic pruning when size exceeds max
      dispose: () => {
        this.metrics.size = this.cache.size;
        this.metrics.evictions = (this.metrics.evictions || 0) + 1;
      }
    });
    this.metrics.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();
    
    if (entry) {
      // Check if entry is still fresh
      if (now < entry.expiresAt) {
        this.metrics.hits++;
        this.recentHits.push(now);
        this.updateHitRate();
        return entry.data as T;
      }
      
      // Check if entry is still valid for stale-while-revalidate
      if (entry.staleAt && now < entry.staleAt) {
        this.metrics.hits++; // Count as hit for metrics
        this.recentHits.push(now);
        this.updateHitRate();
        return entry.data as T;
      }
      
      // Entry expired, remove it
      this.cache.delete(key);
    }
    
    this.metrics.misses++;
    this.recentMisses.push(now);
    this.updateHitRate();
    return null;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const now = Date.now();
    const ttl = config.ttl || 5 * 60 * 1000; // Default 5 minutes
    const staleWhileRevalidate = config.staleWhileRevalidate || 1 * 60 * 1000; // Default 1 minute

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      staleAt: now + ttl + staleWhileRevalidate,
      source: 'api'
    };

    this.cache.set(key, entry);
    this.metrics.size = this.cache.size;
  }

  /**
   * Get or fetch with intelligent caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    // Check for ongoing updates to prevent duplicate requests
    if (this.updatePromises.has(key)) {
      return this.updatePromises.get(key) as Promise<T>;
    }

    const cached = this.get<T>(key);
    if (cached && config.strategy !== 'network-only') {
      // If stale-while-revalidate is enabled and we have stale data, revalidate in background
      if (config.staleWhileRevalidate) {
        const now = Date.now();
        const entry = this.cache.get(key);
        
        if (entry && entry.staleAt && now >= entry.expiresAt && now < entry.staleAt) {
          // Revalidate in background
          const promise = fetcher().then(data => {
            this.set(key, data, config);
            this.updatePromises.delete(key);
            return data;
          }).catch(error => {
            this.updatePromises.delete(key);
            console.error('Background revalidation failed:', error);
            // Return stale data even if revalidation fails
            return cached;
          });
          
          this.updatePromises.set(key, promise);
        }
      }
      
      return cached;
    }

    // Fetch new data
    const promise = fetcher()
      .then(data => {
        this.set(key, data, config);
        
        // Register dependencies
        if (config.dependencies) {
          this.registerDependencies(key, config.dependencies);
        }
        
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
   * Register dependencies for a key
   */
  private registerDependencies(key: string, dependencies: string[]): void {
    for (const dep of dependencies) {
      if (!this.dependencyMap.has(dep)) {
        this.dependencyMap.set(dep, new Set());
      }
      this.dependencyMap.get(dep)?.add(key);
    }
  }

  /**
   * Invalidate by dependency
   */
  invalidateDependency(dependency: string): void {
    const dependentKeys = this.dependencyMap.get(dependency);
    if (dependentKeys) {
      for (const key of dependentKeys) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.metrics.size = 0;
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.metrics.size = this.cache.size;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Auto-optimize cache parameters based on usage patterns
   */
  autoOptimize(): void {
    const now = Date.now();
    const totalAccesses = this.metrics.hits + this.metrics.misses;
    const currentHitRate = totalAccesses > 0 ? this.metrics.hits / totalAccesses : 0;

    // If hit rate is below threshold, consider adjusting cache parameters
    if (currentHitRate < 0.85) { // Below 85% hit rate
      console.info(`Cache hit rate is ${(currentHitRate * 100).toFixed(1)}%. Consider increasing cache size.`);
    }

    // Prune old access history to maintain efficiency
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    this.recentHits = this.recentHits.filter(time => time > fifteenMinutesAgo);
    this.recentMisses = this.recentMisses.filter(time => time > fifteenMinutesAgo);
  }
}

// Export singleton instance
export const intelligentCache = new IntelligentCache(500); // Increased size for better performance