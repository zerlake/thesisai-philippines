/**
 * Feature Flags for Rate Limiting
 * Provides gradual rollout control and feature toggles
 */

/**
 * Check if rate limiting v2 is enabled
 */
export function isRateLimitV2Enabled(): boolean {
  return process.env.RATE_LIMIT_V2_ENABLED === 'true';
}

/**
 * Check if Redis is enabled
 */
export function isRedisEnabled(): boolean {
  return process.env.REDIS_ENABLED === 'true';
}

/**
 * Get rollout percentage (0-100)
 * Used for gradual deployment
 */
export function getRolloutPercentage(): number {
  const percentage = parseInt(process.env.RATE_LIMIT_ROLLOUT_PERCENTAGE || '0', 10);
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Check if shadow mode is enabled (log but don't enforce limits)
 */
export function isShadowMode(): boolean {
  return process.env.RATE_LIMIT_SHADOW_MODE === 'true';
}

/**
 * Check if debug mode is enabled (verbose logging)
 */
export function isDebugMode(): boolean {
  return process.env.RATE_LIMIT_DEBUG === 'true';
}

/**
 * Check if a user should be included in rollout
 * Uses consistent hashing for same result across requests
 */
export function shouldIncludeInRollout(userId: string | null): boolean {
  const rolloutPercentage = getRolloutPercentage();

  // 100% rollout means everyone is included
  if (rolloutPercentage >= 100) {
    return true;
  }

  // 0% rollout means no one is included
  if (rolloutPercentage <= 0) {
    return false;
  }

  // Use consistent hashing for deterministic results
  if (!userId) {
    // For unauthenticated requests, use random but consistent
    return Math.random() * 100 < rolloutPercentage;
  }

  // Create hash from user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  // Get value 0-99 from hash
  const userValue = Math.abs(hash) % 100;

  return userValue < rolloutPercentage;
}

/**
 * Check if rate limiting should be applied to this request
 * Considers feature flags and rollout percentage
 */
export function shouldApplyRateLimiting(userId: string | null): boolean {
  // Always apply if rate limiting v2 is disabled (fall back to v1)
  if (!isRateLimitV2Enabled()) {
    return false;
  }

  // Check rollout percentage
  return shouldIncludeInRollout(userId);
}

/**
 * Log feature flag state
 */
export function logFeatureFlagState(): void {
  const state = {
    rateLimitV2Enabled: isRateLimitV2Enabled(),
    redisEnabled: isRedisEnabled(),
    rolloutPercentage: getRolloutPercentage(),
    shadowMode: isShadowMode(),
    debugMode: isDebugMode(),
  };

  if (isDebugMode()) {
    console.log('[FeatureFlags] Current state:', JSON.stringify(state, null, 2));
  }
}

export default {
  isRateLimitV2Enabled,
  isRedisEnabled,
  getRolloutPercentage,
  isShadowMode,
  isDebugMode,
  shouldIncludeInRollout,
  shouldApplyRateLimiting,
  logFeatureFlagState,
};
