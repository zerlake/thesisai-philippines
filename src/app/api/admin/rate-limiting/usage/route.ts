/**
 * Admin API: Rate Limiting Usage Statistics
 * GET /api/admin/rate-limiting/usage
 *
 * Provides per-user and feature usage analytics
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { getUserUsageStats } from '@/lib/rate-limit-db';
import { createClient } from '@supabase/supabase-js';

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
  const view = searchParams.get('view') || 'overview'; // 'overview', 'by-user', 'by-feature'
  const userId = searchParams.get('userId') || undefined;
  const featureName = searchParams.get('featureName') || undefined;
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : new Date();

  try {
    if (view === 'overview') {
      // Get overall usage statistics
      const { data: allUsage } = await supabase
        .from('user_feature_usage_daily')
        .select('*')
        .gte('usage_date', startDate.toISOString().split('T')[0])
        .lte('usage_date', endDate.toISOString().split('T')[0]);

      // Calculate summary statistics
      const totalUses = (allUsage || []).reduce((sum, u) => sum + (u.total_uses || 0), 0);
      const uniqueUsers = new Set((allUsage || []).map(u => u.user_id)).size;
      const uniqueDates = new Set((allUsage || []).map(u => u.usage_date)).size;
      const violations = (allUsage || []).filter(u => u.exceeded_limit).length;

      // Usage by feature
      const usageByFeature: Record<string, { total: number; users: number; violations: number }> = {};
      (allUsage || []).forEach(u => {
        const feature = u.feature_name;
        if (!usageByFeature[feature]) {
          usageByFeature[feature] = { total: 0, users: 0, violations: 0 };
        }
        usageByFeature[feature].total += u.total_uses || 0;
        usageByFeature[feature].users += 1;
        if (u.exceeded_limit) {
          usageByFeature[feature].violations += 1;
        }
      });

      // Usage by plan
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, plan');

      const planMap = new Map((profiles || []).map(p => [p.id, p.plan]));
      const usageByPlan: Record<string, number> = {};
      (allUsage || []).forEach(u => {
        const plan = planMap.get(u.user_id) || 'unknown';
        usageByPlan[plan] = (usageByPlan[plan] || 0) + (u.total_uses || 0);
      });

      return NextResponse.json({
        summary: {
          totalUses,
          uniqueUsers,
          uniqueDates,
          violations,
          violationRate: totalUses > 0 ? (violations / totalUses) * 100 : 0,
          avgUsesPerUser: uniqueUsers > 0 ? Math.round(totalUses / uniqueUsers) : 0,
        },
        usageByFeature,
        usageByPlan,
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

    } else if (view === 'by-user' && userId) {
      // Get usage for specific user
      const userStats = await getUserUsageStats({
        userId,
        featureName,
        startDate,
        endDate,
      });

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email, plan')
        .eq('id', userId)
        .single();

      const totalUses = userStats.reduce((sum, s) => sum + s.totalUses, 0);
      const planLimit = userStats[0]?.planLimit || null;

      return NextResponse.json({
        user: {
          id: userId,
          name: userProfile?.full_name || 'Unknown',
          email: userProfile?.email || 'Unknown',
          plan: userProfile?.plan || 'unknown',
        },
        summary: {
          totalUses,
          planLimit,
          utilizationRate: planLimit ? (totalUses / planLimit) * 100 : null,
          daysActive: userStats.length,
        },
        dailyUsage: userStats,
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          filters: {
            featureName,
          },
        },
      });

    } else if (view === 'by-feature' && featureName) {
      // Get usage for specific feature across all users
      const { data: featureUsage } = await supabase
        .from('user_feature_usage_daily')
        .select('*')
        .eq('feature_name', featureName)
        .gte('usage_date', startDate.toISOString().split('T')[0])
        .lte('usage_date', endDate.toISOString().split('T')[0])
        .order('usage_date', { ascending: false });

      const totalUses = (featureUsage || []).reduce((sum, u) => sum + (u.total_uses || 0), 0);
      const uniqueUsers = new Set((featureUsage || []).map(u => u.user_id)).size;
      const violations = (featureUsage || []).filter(u => u.exceeded_limit).length;

      // Top users by usage
      const usageByUser: Record<string, number> = {};
      (featureUsage || []).forEach(u => {
        usageByUser[u.user_id] = (usageByUser[u.user_id] || 0) + (u.total_uses || 0);
      });
      const topUserIds = Object.entries(usageByUser)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      const { data: topUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, plan')
        .in('id', topUserIds);

      return NextResponse.json({
        feature: {
          name: featureName,
          totalUses,
          uniqueUsers,
          violations,
          violationRate: totalUses > 0 ? (violations / totalUses) * 100 : 0,
          avgUsesPerUser: uniqueUsers > 0 ? Math.round(totalUses / uniqueUsers) : 0,
        },
        topUsers: topUserIds.map(id => ({
          ...topUsers?.find(u => u.id === id),
          totalUses: usageByUser[id],
        })),
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid parameters. For by-user view, provide userId. For by-feature view, provide featureName.' },
        { status: 400 }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Admin API] Usage error:', msg);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics', details: msg },
      { status: 500 }
    );
  }
}
