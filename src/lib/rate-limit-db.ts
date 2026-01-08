/**
 * Rate Limit Database Access Layer
 * Provides Supabase database operations for rate limiting
 * Including violation logging, whitelist checking, and usage tracking
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create service role client for rate limit operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Log a rate limit violation to the database
 */
export async function logViolation(params: {
  userId?: string;
  identifierType: 'user_id' | 'ip' | 'email' | 'ip_user_pair';
  identifierValue: string;
  featureName: string;
  endpointPath?: string;
  violationType: 'daily_quota' | 'per_minute' | 'auth_failures';
  limitThreshold: number;
  actualCount: number;
  windowStart?: Date;
  windowEnd?: Date;
  ipAddress?: string;
  userAgent?: string;
  actionTaken?: 'logged' | 'blocked' | 'captcha_required';
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await supabase.from('rate_limit_violations').insert({
      user_id: params.userId,
      identifier_type: params.identifierType,
      identifier_value: params.identifierValue,
      feature_name: params.featureName,
      endpoint_path: params.endpointPath,
      violation_type: params.violationType,
      limit_threshold: params.limitThreshold,
      actual_count: params.actualCount,
      window_start: params.windowStart?.toISOString(),
      window_end: params.windowEnd?.toISOString(),
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      action_taken: params.actionTaken || 'logged',
      metadata: params.metadata || {},
    });

    if (error) {
      console.error('[RateLimitDB] Failed to log violation:', error);
    }
  } catch (error) {
    console.error('[RateLimitDB] Violation logging error:', error);
  }
}

/**
 * Check whitelist rules for rate limit adjustments
 */
export async function checkWhitelistRules(params: {
  userId: string;
  featureName: string;
  organizationId?: string;
}): Promise<{
  quotaMultiplier: number;
  isUnlimited: boolean;
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_rate_limit_adjustments', {
        p_user_id: params.userId,
        p_feature_name: params.featureName,
        p_organization_id: params.organizationId || null,
      });

    if (error) {
      console.error('[RateLimitDB] Failed to check whitelist:', error);
      return { quotaMultiplier: 1.0, isUnlimited: false };
    }

    if (data && data.length > 0) {
      return {
        quotaMultiplier: parseFloat(data[0].quota_multiplier),
        isUnlimited: data[0].is_unlimited,
      };
    }

    return { quotaMultiplier: 1.0, isUnlimited: false };
  } catch (error) {
    console.error('[RateLimitDB] Whitelist check error:', error);
    return { quotaMultiplier: 1.0, isUnlimited: false };
  }
}

/**
 * Get user plan limits from database
 */
export async function getUserPlanLimits(userId: string): Promise<{
  plan: string;
  ai_completions_per_day: number | null;
  pdf_analysis_per_day: number | null;
  paper_search_per_day: number | null;
  originality_checks_per_month: number | null;
  core_requests_per_15min: number | null;
} | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_plan_limits', {
        p_user_id: userId,
      });

    if (error) {
      console.error('[RateLimitDB] Failed to get user plan limits:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error('[RateLimitDB] User plan limits error:', error);
    return null;
  }
}

/**
 * Increment feature usage for a user
 */
export async function incrementFeatureUsage(params: {
  userId: string;
  featureName: string;
  planLimit?: number | null;
}): Promise<{
  totalUses: number;
  exceededLimit: boolean;
  planLimit: number | null;
  resetAt: Date;
}> {
  try {
    const { data, error } = await supabase
      .rpc('increment_feature_usage', {
        p_user_id: params.userId,
        p_feature_name: params.featureName,
        p_plan_limit: params.planLimit,
      });

    if (error) {
      console.error('[RateLimitDB] Failed to increment usage:', error);
      return {
        totalUses: 0,
        exceededLimit: false,
        planLimit: params.planLimit || null,
        resetAt: new Date(),
      };
    }

    if (data && data.length > 0) {
      return {
        totalUses: data[0].total_uses,
        exceededLimit: data[0].exceeded_limit,
        planLimit: data[0].plan_limit,
        resetAt: new Date(data[0].reset_at),
      };
    }

    return {
      totalUses: 0,
      exceededLimit: false,
      planLimit: params.planLimit || null,
      resetAt: new Date(),
    };
  } catch (error) {
    console.error('[RateLimitDB] Feature usage error:', error);
    return {
      totalUses: 0,
      exceededLimit: false,
      planLimit: params.planLimit || null,
      resetAt: new Date(),
    };
  }
}

/**
 * Get user usage stats for a feature
 */
export async function getUserUsageStats(params: {
  userId: string;
  featureName: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Array<{
  usageDate: string;
  totalUses: number;
  planLimit: number | null;
  exceededLimit: boolean;
}>> {
  try {
    let query = supabase
      .from('user_feature_usage_daily')
      .select('*')
      .eq('user_id', params.userId)
      .eq('feature_name', params.featureName)
      .order('usage_date', { ascending: false })
      .limit(30);

    if (params.startDate) {
      query = query.gte('usage_date', params.startDate.toISOString().split('T')[0]);
    }

    if (params.endDate) {
      query = query.lte('usage_date', params.endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[RateLimitDB] Failed to get usage stats:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      usageDate: record.usage_date,
      totalUses: record.total_uses,
      planLimit: record.plan_limit,
      exceededLimit: record.exceeded_limit,
    }));
  } catch (error) {
    console.error('[RateLimitDB] Usage stats error:', error);
    return [];
  }
}

/**
 * Get violation summary for admin dashboard
 */
export async function getViolationSummary(params: {
  startDate?: Date;
  endDate?: Date;
  featureName?: string;
  violationType?: string;
  limit?: number;
}): Promise<Array<{
  featureName: string;
  violationType: string;
  violationCount: number;
  affectedUsers: number;
  uniqueIdentifiers: number;
  maxExcess: number;
  firstSeen: string;
  lastSeen: string;
}>> {
  try {
    let query = supabase
      .from('rate_limit_violations_summary')
      .select('*');

    if (params.featureName) {
      query = query.eq('feature_name', params.featureName);
    }

    if (params.violationType) {
      query = query.eq('violation_type', params.violationType);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[RateLimitDB] Failed to get violation summary:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      featureName: record.feature_name,
      violationType: record.violation_type,
      violationCount: record.violation_count,
      affectedUsers: record.affected_users,
      uniqueIdentifiers: record.unique_identifiers,
      maxExcess: record.max_excess,
      firstSeen: record.first_seen,
      lastSeen: record.last_seen,
    }));
  } catch (error) {
    console.error('[RateLimitDB] Violation summary error:', error);
    return [];
  }
}

/**
 * Get hourly API metrics for monitoring
 */
export async function getHourlyMetrics(params: {
  startDate?: Date;
  endDate?: Date;
  endpointPath?: string;
  featureName?: string;
  limit?: number;
}): Promise<Array<{
  hourStart: string;
  endpointPath: string;
  featureName: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  status4xx: number;
  status5xx: number;
  avgResponseTimeMs: number;
  uniqueUsers: number;
  uniqueIps: number;
  maxRequestsPerUser: number;
}>> {
  try {
    let query = supabase
      .from('api_metrics_hourly')
      .select('*')
      .order('hour_start', { ascending: false });

    if (params.startDate) {
      query = query.gte('hour_start', params.startDate.toISOString());
    }

    if (params.endDate) {
      query = query.lte('hour_start', params.endDate.toISOString());
    }

    if (params.endpointPath) {
      query = query.eq('endpoint_path', params.endpointPath);
    }

    if (params.featureName) {
      query = query.eq('feature_name', params.featureName);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[RateLimitDB] Failed to get hourly metrics:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      hourStart: record.hour_start,
      endpointPath: record.endpoint_path,
      featureName: record.feature_name,
      totalRequests: record.total_requests,
      successfulRequests: record.successful_requests,
      rateLimitedRequests: record.rate_limited_requests,
      status4xx: record.status_4xx,
      status5xx: record.status_5xx,
      avgResponseTimeMs: parseFloat(record.avg_response_time_ms || 0),
      uniqueUsers: record.unique_users,
      uniqueIps: record.unique_ips,
      maxRequestsPerUser: record.max_requests_per_user,
    }));
  } catch (error) {
    console.error('[RateLimitDB] Hourly metrics error:', error);
    return [];
  }
}

/**
 * Get top violating users for admin dashboard
 */
export async function getTopViolatingUsers(params: {
  limit?: number;
}): Promise<Array<{
  userId: string;
  fullName: string | null;
  email: string | null;
  totalViolations: number;
  featuresViolated: number;
  lastViolation: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('top_violating_users')
      .select('*')
      .limit(params.limit || 50);

    if (error) {
      console.error('[RateLimitDB] Failed to get top violators:', error);
      return [];
    }

    return (data || []).map((record: any) => ({
      userId: record.user_id,
      fullName: record.full_name,
      email: record.email,
      totalViolations: record.total_violations,
      featuresViolated: record.features_violated,
      lastViolation: record.last_violation,
    }));
  } catch (error) {
    console.error('[RateLimitDB] Top violators error:', error);
    return [];
  }
}

export default {
  logViolation,
  checkWhitelistRules,
  getUserPlanLimits,
  incrementFeatureUsage,
  getUserUsageStats,
  getViolationSummary,
  getHourlyMetrics,
  getTopViolatingUsers,
};
