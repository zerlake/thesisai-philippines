/**
 * Admin API: Rate Limiting Violations
 * GET /api/admin/rate-limiting/violations
 *
 * Provides paginated violation logs with filtering
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { getViolationSummary, getTopViolatingUsers } from '@/lib/rate-limit-db';

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
  const view = searchParams.get('view') || 'summary'; // 'summary' or 'users'
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();
  const featureName = searchParams.get('featureName') || undefined;
  const violationType = searchParams.get('violationType') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    if (view === 'summary') {
      // Get violation summary by feature and type
      const summary = await getViolationSummary({
        startDate,
        endDate,
        featureName,
        violationType,
        limit,
      });

      // Calculate aggregate statistics
      const totalViolations = summary.reduce((sum, s) => sum + s.violationCount, 0);
      const totalAffectedUsers = summary.reduce((sum, s) => sum + s.affectedUsers, 0);
      const mostViolatedFeature = summary.reduce((max, s) =>
        s.violationCount > (max?.violationCount || 0) ? s : max,
        null as any
      );

      return NextResponse.json({
        summary,
        aggregates: {
          totalViolations,
          totalAffectedUsers,
          mostViolatedFeature: mostViolatedFeature?.featureName || 'N/A',
          violationTypes: Array.from(
            new Set(summary.map(s => s.violationType))
          ).sort(),
          featuresAffected: summary.map(s => s.featureName).sort(),
        },
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          filters: {
            featureName,
            violationType,
          },
        },
      });
    } else if (view === 'users') {
      // Get top violating users
      const users = await getTopViolatingUsers({
        limit,
      });

      // Analyze violation patterns
      const violationsByFeature: Record<string, number> = {};
      const violationsByPlan: Record<string, number> = {};

      users.forEach(user => {
        // Count by feature (would need additional query for this)
        violationsByFeature['multiple'] = (violationsByFeature['multiple'] || 0) + 1;
      });

      return NextResponse.json({
        users,
        patterns: {
          violationsByFeature,
          violationsByPlan,
        },
        meta: {
          totalUsers: users.length,
          topViolator: users[0] || null,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid view parameter. Use "summary" or "users"' },
        { status: 400 }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Admin API] Violations error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch violations', details: msg },
      { status: 500 }
    );
  }
}
