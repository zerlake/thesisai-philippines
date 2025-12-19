import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getPerformanceReport,
  getCdnHealthStatus,
  recordMetric,
  calculateLatencyPercentiles,
} from '@/lib/cdn-metrics';

/**
 * GET /api/metrics
 * Returns comprehensive CDN performance report
 * SECURITY: Requires authentication
 */
export async function GET(request: NextRequest) {
  // SECURITY: Verify authentication
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required' },
      { status: 401 }
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'json';

  const report = getPerformanceReport();
  const healthStatus = getCdnHealthStatus();

  const response = {
    timestamp: report.timestamp,
    health: healthStatus.status,
    performance: {
      averageLatency: report.averageLatency,
      averageCacheHitRatio: report.averageCacheHitRatio,
      totalBytesServed: report.totalBytesServed,
      totalRequests: report.totalRequests,
    },
    regions: report.regions.map(region => ({
      name: region.region,
      latency: region.latency,
      cacheHitRatio: region.cacheHitRatio,
      errorRate: region.errorRate,
      requestCount: region.requestCount,
      percentiles: calculateLatencyPercentiles(region.region),
    })),
    recommendations: report.recommendations,
    health_details: healthStatus.regions,
  };

  if (format === 'csv') {
    const csv = generateCsv(response);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=cdn-metrics.csv',
      },
    });
  }

  return NextResponse.json(response);
}

/**
 * POST /api/metrics
 * Record a new metric
 * SECURITY: Requires authentication, validates input
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { region, latency, cacheHit, bytesServed, error } = body;

    // SECURITY: Validate region parameter
    const validRegions = ['us-east', 'us-west', 'eu-west', 'asia-pacific', 'unknown'];
    if (!region || !validRegions.includes(region)) {
      return NextResponse.json(
        { error: 'Invalid region - must be one of: ' + validRegions.join(', ') },
        { status: 400 }
      );
    }

    // SECURITY: Validate latency is a positive number
    if (latency === undefined || typeof latency !== 'number' || latency < 0 || latency > 100000) {
      return NextResponse.json(
        { error: 'Invalid latency - must be a number between 0 and 100000' },
        { status: 400 }
      );
    }

    recordMetric(
      region,
      latency,
      cacheHit ?? false,
      bytesServed ?? 0,
      error ?? false
    );

    return NextResponse.json(
      { success: true, message: 'Metric recorded' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 400 }
    );
  }
}

/**
 * Generate CSV output from metrics
 */
function generateCsv(data: any): string {
  const lines: string[] = [];

  // Header
  lines.push('Metric,Value');
  lines.push(`Timestamp,${new Date(data.timestamp).toISOString()}`);
  lines.push(`Overall Health,${data.health}`);
  lines.push(`Average Latency (ms),${data.performance.averageLatency.toFixed(2)}`);
  lines.push(`Average Cache Hit Ratio,${(data.performance.averageCacheHitRatio * 100).toFixed(2)}%`);
  lines.push(`Total Bytes Served,${data.performance.totalBytesServed}`);
  lines.push(`Total Requests,${data.performance.totalRequests}`);
  lines.push('');

  // Regional metrics
  lines.push('Region,Latency (ms),Cache Hit Ratio,Error Rate,Request Count');
  data.regions.forEach((region: any) => {
    lines.push(
      `${region.name},${region.latency.toFixed(2)},${(region.cacheHitRatio * 100).toFixed(2)}%,${(region.errorRate * 100).toFixed(2)}%,${region.requestCount}`
    );
  });

  lines.push('');

  // Recommendations
  if (data.recommendations.length > 0) {
    lines.push('Recommendations');
    data.recommendations.forEach((rec: string) => {
      lines.push(`"${rec}"`);
    });
  }

  return lines.join('\n');
}

export const runtime = 'nodejs';
