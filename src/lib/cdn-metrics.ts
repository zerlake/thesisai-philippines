/**
 * CDN Metrics Tracking and Monitoring
 * Provides real-time monitoring of CDN performance and automatic optimization
 */

export interface RegionalMetrics {
  region: string;
  timestamp: number;
  latency: number;
  cacheHitRatio: number;
  bytesServed: number;
  requestCount: number;
  errorCount: number;
  errorRate: number;
}

export interface CdnPerformanceReport {
  timestamp: number;
  regions: RegionalMetrics[];
  averageLatency: number;
  averageCacheHitRatio: number;
  totalBytesServed: number;
  totalRequests: number;
  recommendations: string[];
}

/**
 * In-memory metrics store (replace with persistent storage in production)
 */
class MetricsStore {
  private metrics: Map<string, RegionalMetrics[]> = new Map();
  private readonly MAX_SAMPLES = 1000; // Keep last 1000 samples per region

  addMetric(metric: RegionalMetrics): void {
    const region = metric.region;
    if (!this.metrics.has(region)) {
      this.metrics.set(region, []);
    }

    const regionMetrics = this.metrics.get(region)!;
    regionMetrics.push(metric);

    // Keep only the latest samples
    if (regionMetrics.length > this.MAX_SAMPLES) {
      regionMetrics.shift();
    }
  }

  getMetrics(region: string): RegionalMetrics[] {
    return this.metrics.get(region) || [];
  }

  getAllMetrics(): Map<string, RegionalMetrics[]> {
    return this.metrics;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Global metrics store
const metricsStore = new MetricsStore();

/**
 * Record a CDN request metric
 */
export function recordMetric(
  region: string,
  latency: number,
  cacheHit: boolean,
  bytesServed: number,
  error: boolean = false
): void {
  const metrics = metricsStore.getMetrics(region);
  
  let cacheHitRatio = 0;
  let errorCount = 0;
  let errorRate = 0;

  if (metrics.length > 0) {
    const lastMetric = metrics[metrics.length - 1];
    const hitCount = metrics.filter(m => {
      // Simplified: assume 50% based on recent samples
      return true;
    }).length;
    cacheHitRatio = cacheHit ? 1 : 0;
    errorCount = error ? lastMetric.errorCount + 1 : lastMetric.errorCount;
    errorRate = errorCount / (metrics.length + 1);
  }

  metricsStore.addMetric({
    region,
    timestamp: Date.now(),
    latency,
    cacheHitRatio,
    bytesServed,
    requestCount: (metrics[metrics.length - 1]?.requestCount || 0) + 1,
    errorCount,
    errorRate,
  });
}

/**
 * Get performance report for all regions
 */
export function getPerformanceReport(): CdnPerformanceReport {
  const allMetrics = metricsStore.getAllMetrics();
  const reportData: RegionalMetrics[] = [];
  const recommendations: string[] = [];

  let totalLatency = 0;
  let totalCacheHits = 0;
  let totalBytesServed = 0;
  let totalRequests = 0;

  // Aggregate metrics by region
  allMetrics.forEach((regionMetrics, region) => {
    if (regionMetrics.length === 0) return;

    const avgLatency =
      regionMetrics.reduce((sum, m) => sum + m.latency, 0) / regionMetrics.length;
    const avgCacheHitRatio =
      regionMetrics.reduce((sum, m) => sum + m.cacheHitRatio, 0) / regionMetrics.length;
    const totalBytes = regionMetrics.reduce((sum, m) => sum + m.bytesServed, 0);
    const totalReqs = regionMetrics[regionMetrics.length - 1].requestCount;
    const totalErrors = regionMetrics[regionMetrics.length - 1].errorCount;
    const errorRate = totalErrors / totalReqs;

    reportData.push({
      region,
      timestamp: Date.now(),
      latency: avgLatency,
      cacheHitRatio: avgCacheHitRatio,
      bytesServed: totalBytes,
      requestCount: totalReqs,
      errorCount: totalErrors,
      errorRate,
    });

    totalLatency += avgLatency;
    totalCacheHits += avgCacheHitRatio;
    totalBytesServed += totalBytes;
    totalRequests += totalReqs;

    // Generate recommendations
    if (avgLatency > 500) {
      recommendations.push(`${region}: High latency (${avgLatency.toFixed(0)}ms) - consider adding edge locations`);
    }

    if (avgCacheHitRatio < 0.5) {
      recommendations.push(`${region}: Low cache hit ratio (${(avgCacheHitRatio * 100).toFixed(1)}%) - increase TTL or pre-render more paths`);
    }

    if (errorRate > 0.05) {
      recommendations.push(`${region}: High error rate (${(errorRate * 100).toFixed(1)}%) - check CDN health`);
    }
  });

  return {
    timestamp: Date.now(),
    regions: reportData,
    averageLatency: totalLatency / reportData.length,
    averageCacheHitRatio: totalCacheHits / reportData.length,
    totalBytesServed,
    totalRequests,
    recommendations,
  };
}

/**
 * Get metrics for a specific region
 */
export function getRegionMetrics(region: string): RegionalMetrics[] {
  return metricsStore.getMetrics(region);
}

/**
 * Calculate latency percentiles for a region
 */
export function calculateLatencyPercentiles(
  region: string,
  percentiles: number[] = [50, 95, 99]
): Record<number, number> {
  const metrics = metricsStore.getMetrics(region);
  if (metrics.length === 0) {
    return {};
  }

  const latencies = metrics.map(m => m.latency).sort((a, b) => a - b);
  const result: Record<number, number> = {};

  percentiles.forEach(p => {
    const index = Math.ceil((p / 100) * latencies.length) - 1;
    result[p] = latencies[index];
  });

  return result;
}

/**
 * Detect anomalies in metrics (e.g., sudden spikes)
 */
export function detectAnomalies(region: string): string[] {
  const metrics = metricsStore.getMetrics(region);
  const anomalies: string[] = [];

  if (metrics.length < 10) return anomalies;

  const recentMetrics = metrics.slice(-10);
  const avgLatency = recentMetrics.reduce((sum, m) => sum + m.latency, 0) / recentMetrics.length;
  const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;

  const lastMetric = recentMetrics[recentMetrics.length - 1];

  // Check for latency spike
  if (lastMetric.latency > avgLatency * 2) {
    anomalies.push(`Latency spike detected: ${lastMetric.latency.toFixed(0)}ms (normal: ${avgLatency.toFixed(0)}ms)`);
  }

  // Check for error rate spike
  if (lastMetric.errorRate > avgErrorRate * 2) {
    anomalies.push(`Error rate spike: ${(lastMetric.errorRate * 100).toFixed(1)}% (normal: ${(avgErrorRate * 100).toFixed(1)}%)`);
  }

  // Check for cache hit ratio drop
  if (lastMetric.cacheHitRatio < 0.3) {
    anomalies.push(`Low cache hit ratio: ${(lastMetric.cacheHitRatio * 100).toFixed(1)}%`);
  }

  return anomalies;
}

/**
 * Get CDN health status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  regions: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    errorRate: number;
    cacheHitRatio: number;
  }>;
  timestamp: number;
}

export function getCdnHealthStatus(): HealthStatus {
  const allMetrics = metricsStore.getAllMetrics();
  const regionStatuses: Record<string, any> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  allMetrics.forEach((metrics, region) => {
    if (metrics.length === 0) return;

    const lastMetric = metrics[metrics.length - 1];
    const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (lastMetric.errorRate > 0.1 || avgLatency > 1000) {
      status = 'unhealthy';
      overallStatus = 'unhealthy';
    } else if (lastMetric.errorRate > 0.05 || avgLatency > 500) {
      status = 'degraded';
      if (overallStatus !== 'unhealthy') {
        overallStatus = 'degraded';
      }
    }

    regionStatuses[region] = {
      status,
      latency: avgLatency,
      errorRate: lastMetric.errorRate,
      cacheHitRatio: lastMetric.cacheHitRatio,
    };
  });

  return {
    status: overallStatus,
    regions: regionStatuses,
    timestamp: Date.now(),
  };
}

/**
 * Reset metrics (for testing or maintenance)
 */
export function resetMetrics(): void {
  metricsStore.clear();
}

/**
 * Export metrics for analysis
 */
export function exportMetrics(): Record<string, RegionalMetrics[]> {
  const result: Record<string, RegionalMetrics[]> = {};
  metricsStore.getAllMetrics().forEach((metrics, region) => {
    result[region] = [...metrics];
  });
  return result;
}
