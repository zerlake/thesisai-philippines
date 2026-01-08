/**
 * Rate Limit Middleware
 * Provides middleware wrapper for applying rate limits to API routes
 * Supports plan-based quotas, standard headers, and structured error responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './jwt-validator';
import { checkRateLimitAdvanced, checkFeatureQuota } from './rate-limiter';
import {
  FEATURE_DEFAULTS,
  RATE_LIMIT_ERROR_CODES,
  RATE_LIMIT_MESSAGES,
  FeatureType,
  getFeatureQuota,
  isRateLimitingEnabled,
  isShadowMode,
  PlanType,
  RateLimitOptions,
  shouldUsePlanLimits,
} from './rate-limit-config';
import {
  checkWhitelistRules,
  incrementFeatureUsage,
  logViolation,
  getUserPlanLimits,
} from './rate-limit-db';
import { logRateLimitViolation } from './audit-logger';
import { getConnectionStatus } from './redis-client';

/**
 * Rate limit result interface for middleware
 */
export interface RateLimitMiddlewareResult {
  allowed: boolean;
  response?: NextResponse;
  headers: {
    'X-RateLimit-Limit'?: string;
    'X-RateLimit-Remaining'?: string;
    'X-RateLimit-Reset'?: string;
    'Retry-After'?: string;
  };
}

/**
 * Format reset time for header
 */
function formatResetTime(resetAt: number): string {
  return Math.ceil(resetAt / 1000).toString();
}

/**
 * Format retry-after time
 */
function formatRetryAfter(resetAt: number): string {
  const seconds = Math.ceil((resetAt - Date.now()) / 1000);
  return Math.max(0, seconds).toString();
}

/**
 * Apply rate limit middleware
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const result = await withRateLimit(req, {
 *       feature: 'ai_completions',
 *       planLimits: true,
 *     });
 *
 *     if (!result.allowed) {
 *       return result.response;
 *     }
 *
 *     // Your handler code
 *   }
 */
export async function withRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitMiddlewareResult> {
  const {
    feature,
    planLimits = false,
    perMinute,
    perDay,
    skipAuth = false,
    identifierType = 'user_id',
  } = options;

  // Check if rate limiting is enabled
  if (!isRateLimitingEnabled()) {
    return {
      allowed: true,
      headers: {},
    };
  }

  // Get user identifier
  let identifier: string;
  let plan: PlanType = 'free';
  let userId: string | null = null;

  if (!skipAuth) {
    const auth = await withAuth(request);
    if (auth) {
      identifier = auth.userId;
      userId = auth.userId;

      // Get user plan from database
      const planLimitsData = await getUserPlanLimits(auth.userId);
      if (planLimitsData) {
        plan = planLimitsData.plan as PlanType;
      }
    } else {
      // Use IP as identifier for unauthenticated requests
      identifier = request.ip || 'unknown';
    }
  } else {
    identifier = request.ip || 'unknown';
  }

  // Check whitelist rules
  const whitelist = await checkWhitelistRules({
    userId: userId || undefined,
    featureName: feature,
  });

  // Apply whitelist multiplier
  let effectiveLimit: number | null = null;
  if (planLimits && userId) {
    const quota = getFeatureQuota(plan, feature, 'day');
    if (quota !== null) {
      effectiveLimit = Math.floor(quota * whitelist.quotaMultiplier);
    }
  }

  // Check for unlimited access
  if (whitelist.isUnlimited) {
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': 'unlimited',
        'X-RateLimit-Remaining': 'unlimited',
      },
    };
  }

  // Apply plan-based limits if enabled
  if (planLimits && shouldUsePlanLimits(feature)) {
    const result = await checkFeatureQuota(identifier, plan, feature);

    const headers: RateLimitMiddlewareResult['headers'] = {
      'X-RateLimit-Limit': result.limit?.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': formatResetTime(result.resetAt),
    };

    // Increment usage tracking in database
    if (userId && result.allowed) {
      const usageResult = await incrementFeatureUsage({
        userId,
        featureName: feature,
        planLimit: effectiveLimit,
      });

      // Update remaining from database
      if (usageResult.planLimit !== null) {
        headers['X-RateLimit-Limit'] = usageResult.planLimit.toString();
        headers['X-RateLimit-Remaining'] = (usageResult.planLimit - usageResult.totalUses).toString();
        headers['X-RateLimit-Reset'] = new Date(usageResult.resetAt).toISOString();
      }
    }

    if (!result.allowed) {
      // Log violation
      await logRateLimitViolation({
        userId: userId || undefined,
        identifierType,
        identifierValue: identifier,
        featureName: feature,
        violationType: 'daily_quota',
        limitThreshold: result.limit || 0,
        actualCount: result.limit ? result.limit - result.remaining : 0,
        windowEnd: new Date(result.resetAt),
        ipAddress: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        actionTaken: isShadowMode() ? 'logged' : 'blocked',
        plan,
        quotaMultiplier: whitelist.quotaMultiplier,
      });

      // Log to database
      await logViolation({
        userId: userId || undefined,
        identifierType,
        identifierValue: identifier,
        featureName: feature,
        violationType: 'daily_quota',
        limitThreshold: result.limit || 0,
        actualCount: result.limit ? result.limit - result.remaining : 0,
        windowEnd: new Date(result.resetAt),
        ipAddress: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        actionTaken: isShadowMode() ? 'logged' : 'blocked',
      });

      // Create error response
      const errorMessage = RATE_LIMIT_MESSAGES.DAILY_QUOTA_EXCEEDED(
        feature,
        new Date(result.resetAt).toLocaleString()
      );

      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: errorMessage,
            code: RATE_LIMIT_ERROR_CODES.DAILY_QUOTA_EXCEEDED,
            feature,
            limit: result.limit,
            remaining: 0,
            resetAt: new Date(result.resetAt).toISOString(),
          },
          {
            status: 429,
            headers: {
              ...headers,
              'Retry-After': formatRetryAfter(result.resetAt),
              'Content-Type': 'application/json',
            },
          }
        ),
        headers: {
          ...headers,
          'Retry-After': formatRetryAfter(result.resetAt),
        },
      };
    }

    return {
      allowed: true,
      headers,
    };
  }

  // Apply per-minute limits
  const limit = perMinute || FEATURE_DEFAULTS[feature]?.perMinute || 100;
  const windowSeconds = 60;

  const result = await checkRateLimitAdvanced(identifier, limit, windowSeconds);

  const headers: RateLimitMiddlewareResult['headers'] = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': formatResetTime(result.resetAt),
  };

  if (!result.allowed) {
    // Log violation
    await logRateLimitViolation({
      userId: userId || undefined,
      identifierType,
      identifierValue: identifier,
      featureName: feature,
      violationType: 'per_minute',
      limitThreshold: result.limit || 0,
      actualCount: result.limit ? result.limit - result.remaining : 0,
      windowEnd: new Date(result.resetAt),
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
      actionTaken: isShadowMode() ? 'logged' : 'blocked',
      plan,
    });

    // Log to database
    await logViolation({
      userId: userId || undefined,
      identifierType,
      identifierValue: identifier,
      featureName: feature,
      violationType: 'per_minute',
      limitThreshold: result.limit || 0,
      actualCount: result.limit ? result.limit - result.remaining : 0,
      windowEnd: new Date(result.resetAt),
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
      actionTaken: isShadowMode() ? 'logged' : 'blocked',
    });

    const errorMessage = RATE_LIMIT_MESSAGES.PER_MINUTE_EXCEEDED(
      formatRetryAfter(result.resetAt) + ' seconds'
    );

    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: errorMessage,
          code: RATE_LIMIT_ERROR_CODES.PER_MINUTE_EXCEEDED,
          limit: result.limit,
          remaining: 0,
          resetAt: new Date(result.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': formatRetryAfter(result.resetAt),
            'Content-Type': 'application/json',
          },
        }
      ),
      headers: {
        ...headers,
        'Retry-After': formatRetryAfter(result.resetAt),
      },
    };
  }

  return {
    allowed: true,
    headers,
  };
}

/**
 * Higher-order function wrapper for easy use
 * Usage:
 *   const rateLimitedHandler = withRateLimitWrapper((req) => {
 *     // Your handler code
 *     return NextResponse.json({ success: true });
 *   }, {
 *     feature: 'ai_completions',
 *     planLimits: true,
 *   });
 *
 *   export async function POST(req: NextRequest) {
 *     return rateLimitedHandler(req);
 *   }
 */
export function withRateLimitWrapper<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: RateLimitOptions
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const result = await withRateLimit(request, options);

    if (!result.allowed && result.response) {
      return result.response;
    }

    // Call original handler with rate limit headers
    const response = await handler(request, ...args);

    // Add rate limit headers to successful response
    const newHeaders = new Headers(response.headers);
    Object.entries(result.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        newHeaders.set(key, value);
      }
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Get rate limit connection status for monitoring
 */
export function getRateLimitStatus(): {
  redisConnected: boolean;
  usingFallback: boolean;
  rateLimitingEnabled: boolean;
  shadowMode: boolean;
} {
  const redisStatus = getConnectionStatus();
  return {
    redisConnected: redisStatus.connected,
    usingFallback: redisStatus.usingFallback,
    rateLimitingEnabled: isRateLimitingEnabled(),
    shadowMode: isShadowMode(),
  };
}

export default {
  withRateLimit,
  withRateLimitWrapper,
  getRateLimitStatus,
};
