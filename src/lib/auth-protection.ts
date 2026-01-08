/**
 * Auth Protection Module
 * Tracks failed login attempts by IP and email
 * Implements dual IP + email tracking with captcha requirements
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

/**
 * Auth failure check result
 */
export interface AuthFailureCheck {
  failureCount: number;
  isBlocked: boolean;
  blockedUntil: Date | null;
  captchaRequired: boolean;
  isNewDevice: boolean;
}

/**
 * Configurable auth limits from environment
 */
function getAuthConfig(): {
  maxAttempts: number;
  blockMinutes: number;
  captchaThreshold: number;
} {
  return {
    maxAttempts: parseInt(process.env.AUTH_FAILURE_MAX_ATTEMPTS || '5', 10),
    blockMinutes: parseInt(process.env.AUTH_FAILURE_BLOCK_MINUTES || '15', 10),
    captchaThreshold: parseInt(process.env.AUTH_FAILURE_CAPTCHA_THRESHOLD || '3', 10),
  };
}

/**
 * Check auth failure for given identifier
 * Tracks both IP and email separately
 * Returns combined result (block if either hits limit)
 */
export async function checkAuthFailure(params: {
  ipAddress: string;
  email?: string;
  deviceFingerprint?: string;
}): Promise<{
  ipCheck: AuthFailureCheck;
  emailCheck?: AuthFailureCheck;
  isBlocked: boolean;
  blockedUntil: Date | null;
}> {
  const { maxAttempts, blockMinutes } = getAuthConfig();

  // Check IP-based failures
  const ipCheck = await checkIdentifierFailure('ip', params.ipAddress, maxAttempts, blockMinutes);

  // Check email-based failures (if provided)
  let emailCheck: AuthFailureCheck | undefined;
  if (params.email) {
    emailCheck = await checkIdentifierFailure('email', params.email, maxAttempts, blockMinutes);
  }

  // Check for new device
  const isNewDevice = await checkNewDevice(params.deviceFingerprint, params.email);

  // Check if captcha required (3+ failures from new device)
  const { captchaThreshold } = getAuthConfig();
  const ipCaptchaRequired = ipCheck.captchaRequired || (ipCheck.failureCount >= captchaThreshold && isNewDevice);
  const emailCaptchaRequired = emailCheck?.captchaRequired || (emailCheck?.failureCount >= captchaThreshold && isNewDevice);

  // Combine results - blocked if either IP or email is blocked
  const isBlocked = ipCheck.isBlocked || emailCheck?.isBlocked || false;
  const blockedUntil = isBlocked
    ? new Date(Math.max(
        ipCheck.blockedUntil?.getTime() || 0,
        emailCheck?.blockedUntil?.getTime() || 0
      ))
    : null;

  return {
    ipCheck: {
      ...ipCheck,
      captchaRequired: ipCaptchaRequired,
      isNewDevice,
    },
    emailCheck: emailCheck ? {
      ...emailCheck,
      captchaRequired: emailCaptchaRequired,
      isNewDevice,
    } : undefined,
    isBlocked,
    blockedUntil,
  };
}

/**
 * Check auth failure for a specific identifier (IP or email)
 */
async function checkIdentifierFailure(
  identifierType: 'ip' | 'email',
  identifierValue: string,
  maxAttempts: number,
  blockMinutes: number
): Promise<AuthFailureCheck> {
  try {
    const { data, error } = await supabase.rpc('increment_auth_failure', {
      p_identifier_type: identifierType,
      p_identifier_value: identifierValue,
      p_ip_address: identifierType === 'ip' ? identifierValue : null,
    });

    if (error) {
      console.error('[AuthProtection] Failed to check auth failure:', error);
      return {
        failureCount: 0,
        isBlocked: false,
        blockedUntil: null,
        captchaRequired: false,
        isNewDevice: false,
      };
    }

    if (!data || data.length === 0) {
      return {
        failureCount: 0,
        isBlocked: false,
        blockedUntil: null,
        captchaRequired: false,
        isNewDevice: false,
      };
    }

    const result = data[0];
    return {
      failureCount: result.failure_count,
      isBlocked: result.is_blocked || false,
      blockedUntil: result.blocked_until ? new Date(result.blocked_until) : null,
      captchaRequired: result.captcha_required || false,
      isNewDevice: false,
    };
  } catch (error) {
    console.error('[AuthProtection] Identifier check error:', error);
    return {
      failureCount: 0,
      isBlocked: false,
      blockedUntil: null,
      captchaRequired: false,
      isNewDevice: false,
    };
  }
}

/**
 * Check if device is new (no successful login in last 30 days)
 */
async function checkNewDevice(
  deviceFingerprint: string | undefined,
  email: string | undefined
): Promise<boolean> {
  if (!deviceFingerprint || !email) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('auth_failure_tracking')
      .select('*')
      .eq('identifier_type', 'email')
      .eq('identifier_value', email)
      .eq('device_fingerprint', deviceFingerprint)
      .is('is_suspicious', false)
      .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    // If no recent successful login from this device, it's new
    return !error && (!data || data.length === 0);
  } catch (error) {
    console.error('[AuthProtection] Device check error:', error);
    return false;
  }
}

/**
 * Record successful login and reset failure counters
 */
export async function recordAuthSuccess(params: {
  ipAddress: string;
  email?: string;
  userId?: string;
  deviceFingerprint?: string;
}): Promise<void> {
  try {
    // Reset IP-based failures
    await supabase.rpc('reset_auth_failure', {
      p_identifier_type: 'ip',
      p_identifier_value: params.ipAddress,
    });

    // Reset email-based failures
    if (params.email) {
      await supabase.rpc('reset_auth_failure', {
        p_identifier_type: 'email',
        p_identifier_value: params.email,
      });
    }

    // Log successful login
    // You might want to log this to audit_logs
    console.log('[AuthProtection] Successful login:', {
      email: params.email,
      ipAddress: params.ipAddress,
      userId: params.userId,
    });
  } catch (error) {
    console.error('[AuthProtection] Failed to record auth success:', error);
  }
}

/**
 * Detect suspicious login patterns
 */
export async function detectSuspiciousPattern(params: {
  userId: string;
  ipAddress: string;
}): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];
  let isSuspicious = false;

  try {
    // Check for multiple recent IPs for same user
    const { data: ipData, error: ipError } = await supabase
      .from('auth_failure_tracking')
      .select('ip_address, COUNT(*) as count')
      .eq('identifier_type', 'ip_user_pair')
      .like('identifier_value', `${params.userId}%`)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .group('ip_address')
      .having('count', 'gt', '3');

    if (!ipError && ipData && ipData.length > 3) {
      reasons.push('User has more than 3 different IPs in last 24 hours');
      isSuspicious = true;
    }

    // Check for many accounts from same IP
    const { data: accountData, error: accountError } = await supabase
      .from('auth_failure_tracking')
      .select('COUNT(*) as count')
      .eq('identifier_type', 'ip')
      .eq('ip_address', params.ipAddress)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (!accountError && accountData && parseInt(accountData.count || '0') > 5) {
      reasons.push('More than 5 accounts from same IP in last 24 hours');
      isSuspicious = true;
    }

    // Check for 24/7 activity (attempts every hour for 48+ hours)
    const { data: patternData, error: patternError } = await supabase
      .from('auth_failure_tracking')
      .select('COUNT(*) as count')
      .eq('identifier_type', 'ip')
      .eq('ip_address', params.ipAddress)
      .gt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .single();

    if (!patternError && patternData && parseInt(patternData.count || '0') > 45) {
      reasons.push('Consistent activity pattern suggesting automation');
      isSuspicious = true;
    }

    return { isSuspicious, reasons };
  } catch (error) {
    console.error('[AuthProtection] Pattern detection error:', error);
    return { isSuspicious: false, reasons: [] };
  }
}

/**
 * Check if captcha should be shown based on recent failures
 */
export async function shouldRequireCaptcha(params: {
  ipAddress: string;
  email?: string;
}): Promise<boolean> {
  const check = await checkAuthFailure(params);

  // Require captcha if either IP or email check requires it
  return check.ipCheck.captchaRequired ||
         (check.emailCheck?.captchaRequired || false);
}

/**
 * Validate captcha token (placeholder for Cloudflare Turnstile)
 */
export async function validateCaptcha(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[AuthProtection] No CAPTCHA secret configured, bypassing validation');
    return true;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          response: token,
        }),
      }
    );

    const data = await response.json();

    return data.success === true;
  } catch (error) {
    console.error('[AuthProtection] Captcha validation error:', error);
    return false;
  }
}

/**
 * Get time remaining until block expires
 */
export function getBlockRemainingTime(blockedUntil: Date | null): string {
  if (!blockedUntil) {
    return '0 minutes';
  }

  const minutes = Math.max(0, Math.ceil((blockedUntil.getTime() - Date.now()) / (60 * 1000)));

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours === 1 ? '' : 's'}${mins > 0 ? ` ${mins} min${mins === 1 ? '' : 's'}` : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days === 1 ? '' : 's'}`;
  }
}

export default {
  checkAuthFailure,
  recordAuthSuccess,
  detectSuspiciousPattern,
  shouldRequireCaptcha,
  validateCaptcha,
  getBlockRemainingTime,
};
