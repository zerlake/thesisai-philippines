/**
 * Rate Limiter with Redis/In-Memory Backend
 * Tracks requests per identifier with sliding window algorithm
 * Supports plan-based quotas and feature-specific limits
 */

import { get, increment, del, getConnectionStatus } from './redis-client';
import {
  getPlanLimits,
  getFeatureQuota,
  FeatureType,
  getWindowDuration,
  PlanType,
  shouldUsePlanLimits,
} from './rate-limit-config';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number | null;
}

// Legacy in-memory store (fallback when Redis client is not initialized)
const limitStore = new Map<string, RateLimitRecord>();

/**
 * Check if a request should be rate-limited
 * @param userId User identifier (from session)
 * @param maxRequests Maximum requests allowed per window
 * @param windowMs Time window in milliseconds (default: 60 seconds)
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = limitStore.get(userId);

  if (!record || now > record.resetAt) {
    // New window or expired, create fresh record
    limitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

/**
 * Enhanced rate limit check with Redis backend
 * @param identifier User identifier (user_id, ip, email, etc.)
 * @param maxRequests Maximum requests allowed per window
 * @param windowSeconds Time window in seconds (not milliseconds)
 * @returns RateLimitResult with detailed information
 */
export async function checkRateLimitAdvanced(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const resetAt = now + (windowSeconds * 1000);

    // Try Redis first
    const status = getConnectionStatus();
    if (!status.usingFallback) {
      // Use Redis increment (atomic)
      const count = await increment(`rate_limit:${identifier}`, windowSeconds);

      const allowed = count <= maxRequests;
      const remaining = Math.max(0, maxRequests - count);

      return {
        allowed,
        remaining,
        resetAt,
        limit: maxRequests,
      };
    }

    // Fall back to in-memory
    const record = limitStore.get(identifier);

    if (!record || now > record.resetAt) {
      // New window or expired, create fresh record
      limitStore.set(identifier, {
        count: 1,
        resetAt,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
        limit: maxRequests,
      };
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
        limit: maxRequests,
      };
    }

    // Increment counter
    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetAt: record.resetAt,
      limit: maxRequests,
    };
  } catch (error) {
    console.error('[RateLimiter] Check error:', error);
    // On error, allow request to avoid blocking legitimate traffic
    return {
      allowed: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: Date.now(),
      limit: null,
    };
  }
}

/**
 * Get remaining requests for a user (legacy)
 */
export function getRemainingRequests(
  userId: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { remaining: number; resetAt: number } {
  const now = Date.now();
  const record = limitStore.get(userId);

  if (!record || now > record.resetAt) {
    return {
      remaining: maxRequests,
      resetAt: now + windowMs,
    };
  }

  return {
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Check feature-based quota with plan consideration
 * @param identifier User identifier
 * @param plan User's plan type
 * @param feature Feature being accessed
 * @returns RateLimitResult with detailed information
 */
export async function checkFeatureQuota(
  identifier: string,
  plan: PlanType,
  feature: FeatureType
): Promise<RateLimitResult> {
  try {
    // Check if feature should use plan limits
    if (!shouldUsePlanLimits(feature)) {
      // Use default limits
      const defaults = getFeatureQuota(plan, feature, 'day');
      if (!defaults) {
        return {
          allowed: true,
          remaining: Number.MAX_SAFE_INTEGER,
          resetAt: Date.now() + (24 * 60 * 60 * 1000),
          limit: null,
        };
      }

      return await checkRateLimitAdvanced(
        `feature:${feature}:${identifier}`,
        defaults,
        86400 // 1 day in seconds
      );
    }

    // Get plan-specific quota
    const quota = getFeatureQuota(plan, feature, 'day');
    if (quota === null) {
      // Unlimited
      return {
        allowed: true,
        remaining: Number.MAX_SAFE_INTEGER,
        resetAt: Date.now() + (24 * 60 * 60 * 1000),
        limit: null,
      };
    }

    return await checkRateLimitAdvanced(
      `feature:${feature}:${identifier}`,
      quota,
      86400 // 1 day in seconds
    );
  } catch (error) {
    console.error('[RateLimiter] Feature quota check error:', error);
    return {
      allowed: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: Date.now(),
      limit: null,
    };
  }
}

/**
 * Cleanup expired records (run periodically to prevent memory leaks)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of limitStore.entries()) {
    if (now > record.resetAt) {
      limitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

export default {
  checkRateLimit,
  checkRateLimitAdvanced,
  checkFeatureQuota,
  getRemainingRequests,
  cleanupRateLimitStore,
};
