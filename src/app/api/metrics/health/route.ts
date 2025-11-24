import { NextResponse } from 'next/server';
import { getCdnHealthStatus, detectAnomalies } from '@/lib/cdn-metrics';

/**
 * GET /api/metrics/health
 * Returns real-time CDN health status and anomaly detection
 */
export async function GET() {
  const health = getCdnHealthStatus();

  // Detect anomalies in each region
  const anomalies: Record<string, string[]> = {};
  Object.keys(health.regions).forEach(region => {
    const regionAnomalies = detectAnomalies(region);
    if (regionAnomalies.length > 0) {
      anomalies[region] = regionAnomalies;
    }
  });

  const statusCode =
    health.status === 'healthy'
      ? 200
      : health.status === 'degraded'
        ? 200
        : 503;

  return NextResponse.json(
    {
      status: health.status,
      timestamp: new Date(health.timestamp).toISOString(),
      regions: Object.entries(health.regions).map(([region, data]) => ({
        region,
        status: data.status,
        latency: `${data.latency.toFixed(2)}ms`,
        errorRate: `${(data.errorRate * 100).toFixed(2)}%`,
        cacheHitRatio: `${(data.cacheHitRatio * 100).toFixed(2)}%`,
        anomalies: anomalies[region] || [],
      })),
      message:
        health.status === 'healthy'
          ? 'All CDN regions operational'
          : health.status === 'degraded'
            ? 'Some CDN regions experiencing degraded performance'
            : 'CDN service degraded or unavailable',
    },
    { status: statusCode }
  );
}

export const runtime = 'nodejs';
