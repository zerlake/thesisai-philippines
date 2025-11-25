/**
 * Performance monitoring utilities for dashboard
 * Tracks widget load times, API calls, and memory usage
 */

interface PerformanceMetrics {
  widgetId: string;
  loadTime: number;
  renderTime: number;
  cacheHit: boolean;
  timestamp: number;
}

interface ApiMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class DashboardPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  /**
   * Record widget performance
   */
  recordWidgetMetric(
    widgetId: string,
    loadTime: number,
    renderTime: number,
    cacheHit: boolean = false
  ) {
    const metric: PerformanceMetrics = {
      widgetId,
      loadTime,
      renderTime,
      cacheHit,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow widgets
    if (loadTime > 3000) {
      console.warn(`Slow widget load: ${widgetId} (${loadTime}ms)`);
    }
  }

  /**
   * Record API call performance
   */
  recordApiMetric(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) {
    const metric: ApiMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    };

    this.apiMetrics.push(metric);
    if (this.apiMetrics.length > this.MAX_METRICS) {
      this.apiMetrics.shift();
    }

    // Log slow APIs
    if (duration > 5000) {
      console.warn(`Slow API call: ${method} ${endpoint} (${duration}ms)`);
    }
  }

  /**
   * Get average load time for a widget
   */
  getAverageLoadTime(widgetId: string): number {
    const widgetMetrics = this.metrics.filter(m => m.widgetId === widgetId);
    if (widgetMetrics.length === 0) return 0;
    const total = widgetMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    return total / widgetMetrics.length;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(widgetId?: string): number {
    const relevant = widgetId
      ? this.metrics.filter(m => m.widgetId === widgetId)
      : this.metrics;

    if (relevant.length === 0) return 0;
    const hits = relevant.filter(m => m.cacheHit).length;
    return hits / relevant.length;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      totalRequests: this.metrics.length,
      avgLoadTime: this.metrics.length > 0
        ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length
        : 0,
      cacheHitRate: this.getCacheHitRate(),
      slowestWidget: this.metrics.length > 0
        ? this.metrics.reduce((max, m) => m.loadTime > max.loadTime ? m : max).widgetId
        : undefined,
      avgApiTime: this.apiMetrics.length > 0
        ? this.apiMetrics.reduce((sum, m) => sum + m.duration, 0) / this.apiMetrics.length
        : 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanMs: number = 3600000) { // 1 hour
    const cutoff = Date.now() - olderThanMs;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = [];
    this.apiMetrics = [];
  }
}

export const performanceMonitor = new DashboardPerformanceMonitor();

/**
 * Hook helper to measure component performance
 */
export function measurePerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  return fn().then(result => ({
    result,
    duration: performance.now() - start
  }));
}

/**
 * Utility to wrap fetch calls with performance tracking
 */
export async function trackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const start = performance.now();
  const url = typeof input === 'string' ? input : input.toString();

  try {
    const response = await fetch(input, init);
    const duration = performance.now() - start;
    const method = init?.method || 'GET';

    performanceMonitor.recordApiMetric(url, method, duration, response.status);
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordApiMetric(url, init?.method || 'GET', duration, 0);
    throw error;
  }
}
