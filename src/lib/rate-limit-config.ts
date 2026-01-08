/**
 * Rate Limit Configuration
 * Defines plan-based quotas and feature-specific limits for ThesisAI
 */

// Feature types for tracking and rate limiting
export type FeatureType =
  | 'ai_completions'
  | 'pdf_analysis'
  | 'paper_search'
  | 'originality_checks'
  | 'core_ui'
  | 'messages'
  | 'auth_attempts';

// Plan types
export type PlanType = 'free' | 'pro' | 'pro_plus_advisor' | 'pro_complete';

// Rate limit time windows
export type TimeWindow = 'minute' | 'hour' | 'day' | 'month';

// Window durations in milliseconds
export const WINDOW_DURATIONS: Record<TimeWindow, number> = {
  minute: 60 * 1000,      // 1 minute
  hour: 60 * 60 * 1000,    // 1 hour
  day: 24 * 60 * 60 * 1000,  // 1 day
  month: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Plan-based quotas for each feature
export interface PlanLimits {
  // Daily quotas
  ai_completions_per_day?: number | null;
  pdf_analysis_per_day?: number | null;
  paper_search_per_day?: number | null;
  originality_checks_per_month?: number | null;

  // Per-minute quotas
  core_requests_per_15min?: number;
  messages_per_minute?: number;

  // Metadata
  unlimited?: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    ai_completions_per_day: 10,
    pdf_analysis_per_day: 3,
    paper_search_per_day: 20,
    originality_checks_per_month: 10,
    core_requests_per_15min: 1000,
    messages_per_minute: 60,
    unlimited: false,
  },
  pro: {
    ai_completions_per_day: 100,
    pdf_analysis_per_day: 20,
    paper_search_per_day: 200,
    originality_checks_per_month: null, // Unlimited
    core_requests_per_15min: 2000,
    messages_per_minute: 120,
    unlimited: false,
  },
  pro_plus_advisor: {
    ai_completions_per_day: 200,
    pdf_analysis_per_day: 50,
    paper_search_per_day: 500,
    originality_checks_per_month: null, // Unlimited
    core_requests_per_15min: 3000,
    messages_per_minute: 180,
    unlimited: false,
  },
  pro_complete: {
    ai_completions_per_day: null, // Unlimited
    pdf_analysis_per_day: null, // Unlimited
    paper_search_per_day: null, // Unlimited
    originality_checks_per_month: null, // Unlimited
    core_requests_per_15min: 5000,
    messages_per_minute: 300,
    unlimited: true,
  },
};

// Feature-specific default limits (fallback if not in plan)
export const FEATURE_DEFAULTS: Record<FeatureType, { perMinute?: number; perDay?: number; perMonth?: number }> = {
  ai_completions: {
    perDay: 10,
  },
  pdf_analysis: {
    perDay: 3,
  },
  paper_search: {
    perDay: 20,
  },
  originality_checks: {
    perMonth: 10,
  },
  core_ui: {
    perMinute: 100, // ~1 request every 0.6 seconds
  },
  messages: {
    perMinute: 60,
  },
  auth_attempts: {
    perMinute: 5, // 5 attempts per 15 minutes
  },
};

// Get plan limits for a given plan type
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// Get quota for a specific feature and plan
export function getFeatureQuota(
  plan: PlanType,
  feature: FeatureType,
  timeWindow: TimeWindow
): number | null {
  const limits = getPlanLimits(plan);

  // Check for unlimited plan
  if (limits.unlimited && (feature === 'ai_completions' || feature === 'pdf_analysis' || feature === 'paper_search')) {
    return null;
  }

  // Map feature to limit property
  const limitMap: Record<string, keyof PlanLimits> = {
    ai_completions: 'ai_completions_per_day',
    pdf_analysis: 'pdf_analysis_per_day',
    paper_search: 'paper_search_per_day',
    originality_checks: 'originality_checks_per_month',
    core_ui: 'core_requests_per_15min',
    messages: 'messages_per_minute',
    auth_attempts: undefined, // Auth has separate logic
  };

  const limitProperty = limitMap[feature];
  if (!limitProperty) {
    return FEATURE_DEFAULTS[feature]?.[timeWindow === 'month' ? 'perMonth' : timeWindow === 'day' ? 'perDay' : 'perMinute'] || null;
  }

  return (limits[limitProperty] as number) || null;
}

// Check if a feature should use plan-based limits
export function shouldUsePlanLimits(feature: FeatureType): boolean {
  return ['ai_completions', 'pdf_analysis', 'paper_search', 'originality_checks'].includes(feature);
}

// Get window duration in milliseconds
export function getWindowDuration(window: TimeWindow): number {
  return WINDOW_DURATIONS[window];
}

// Rate limit error codes
export const RATE_LIMIT_ERROR_CODES = {
  DAILY_QUOTA_EXCEEDED: 'RATE_LIMIT_DAILY_QUOTA_EXCEEDED',
  PER_MINUTE_EXCEEDED: 'RATE_LIMIT_PER_MINUTE_EXCEEDED',
  AUTH_BLOCKED: 'RATE_LIMIT_AUTH_BLOCKED',
  AUTH_CAPTCHA_REQUIRED: 'RATE_LIMIT_AUTH_CAPTCHA_REQUIRED',
} as const;

// Rate limit error messages
export const RATE_LIMIT_MESSAGES = {
  DAILY_QUOTA_EXCEEDED: (feature: string, resetAt: string) =>
    `You've reached your plan's daily ${feature} limit. Your quota resets at ${resetAt}.`,
  PER_MINUTE_EXCEEDED: (retryAfter: string) =>
    `Too many requests. Please wait ${retryAfter} before trying again.`,
  AUTH_BLOCKED: (blockedUntil: string) =>
    `Too many failed login attempts. Please try again after ${blockedUntil}.`,
  AUTH_CAPTCHA_REQUIRED: () =>
    `Please complete the captcha challenge to continue.`,
};

// Environment variable overrides
export function getEnvOverride(key: string, defaultValue: any): any {
  const envValue = process.env[key];
  if (envValue !== undefined) {
    if (typeof defaultValue === 'number') {
      return parseInt(envValue, 10);
    }
    return envValue;
  }
  return defaultValue;
}

// Get configurable limits from environment
export function getConfigurableLimits(): {
  authMaxAttempts: number;
  authBlockMinutes: number;
  authCaptchaThreshold: number;
} {
  return {
    authMaxAttempts: getEnvOverride('AUTH_FAILURE_MAX_ATTEMPTS', 5),
    authBlockMinutes: getEnvOverride('AUTH_FAILURE_BLOCK_MINUTES', 15),
    authCaptchaThreshold: getEnvOverride('AUTH_FAILURE_CAPTCHA_THRESHOLD', 3),
  };
}

// Get rollout percentage
export function getRolloutPercentage(): number {
  return getEnvOverride('RATE_LIMIT_ROLLOUT_PERCENTAGE', 0);
}

// Check if rate limiting is enabled
export function isRateLimitingEnabled(): boolean {
  return process.env.RATE_LIMIT_V2_ENABLED === 'true';
}

// Check if shadow mode is enabled (log but don't enforce)
export function isShadowMode(): boolean {
  return process.env.RATE_LIMIT_SHADOW_MODE === 'true';
}

// Check if debug mode is enabled
export function isDebugMode(): boolean {
  return process.env.RATE_LIMIT_DEBUG === 'true';
}

// Rate limit configuration interface for middleware
export interface RateLimitOptions {
  feature: FeatureType;
  planLimits?: boolean;
  perMinute?: number;
  perDay?: number;
  perMonth?: number;
  skipAuth?: boolean;
  identifierType?: 'user_id' | 'ip' | 'email' | 'ip_user_pair';
}

export default {
  PLAN_LIMITS,
  FEATURE_DEFAULTS,
  getPlanLimits,
  getFeatureQuota,
  shouldUsePlanLimits,
  getWindowDuration,
  RATE_LIMIT_ERROR_CODES,
  RATE_LIMIT_MESSAGES,
  getEnvOverride,
  getConfigurableLimits,
  getRolloutPercentage,
  isRateLimitingEnabled,
  isShadowMode,
  isDebugMode,
};
