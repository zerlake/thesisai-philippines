/**
 * Simple in-memory rate limiter
 * Tracks requests per user ID within a time window
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

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
 * Get remaining requests for a user
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
  getRemainingRequests,
  cleanupRateLimitStore,
};
