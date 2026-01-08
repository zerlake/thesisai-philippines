/**
 * Admin API: Rate Limiting Metrics
 * GET /api/admin/rate-limiting/metrics
 *
 * Provides aggregated API metrics for monitoring
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { getHourlyMetrics } from '@/lib/rate-limit-db';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await withAuth(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check admin role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.userId)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24h
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();
  const endpointPath = searchParams.get('endpointPath') || undefined;
  const featureName = searchParams.get('featureName') || undefined;
  const limit = parseInt(searchParams.get('limit') || '168', 10); // Default: 7 days of hourly data

  try {
    const metrics = await getHourlyMetrics({
      startDate,
      endDate,
      endpointPath,
      featureName,
      limit,
    });

    // Calculate summary statistics
    const totalRequests = metrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const successfulRequests = metrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const rateLimitedRequests = metrics.reduce((sum, m) => sum + m.rateLimitedRequests, 0);
    const status4xx = metrics.reduce((sum, m) => sum + m.status4xx, 0);
    const status5xx = metrics.reduce((sum, m) => sum + m.status5xx, 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.avgResponseTimeMs, 0) / metrics.length || 0;
    const totalUniqueUsers = Math.max(...metrics.map(m => m.uniqueUsers), 0);
    const totalUniqueIps = Math.max(...metrics.map(m => m.uniqueIps), 0);

    const summary = {
      totalRequests,
      successfulRequests,
      rateLimitedRequests,
      status4xx,
      status5xx,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      rateLimitRate: totalRequests > 0 ? (rateLimitedRequests / totalRequests) * 100 : 0,
      errorRate: totalRequests > 0 ? ((status4xx + status5xx) / totalRequests) * 100 : 0,
      avgResponseTimeMs: Math.round(avgResponseTime * 100) / 100,
      totalUniqueUsers,
      totalUniqueIps,
      hourlyDataPoints: metrics.length,
    };

    return NextResponse.json({
      summary,
      metrics,
      meta: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        filters: {
          endpointPath,
          featureName,
        },
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Admin API] Metrics error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: msg },
      { status: 500 }
    );
  }
}
