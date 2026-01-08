/**
 * Audit Logger
 * Logs all security-relevant events for compliance and debugging
 * Supports multiple backends (Supabase, console, file, etc.)
 */

export enum AuditAction {
  // Authentication events
  AUTH_LOGIN = 'auth_login',
  AUTH_LOGOUT = 'auth_logout',
  AUTH_FAILED = 'auth_failed',
  AUTH_SESSION_EXPIRED = 'auth_session_expired',
  
  // Message events
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_DELETED = 'message_deleted',
  
  // Document events
  DOCUMENT_CREATED = 'document_created',
  DOCUMENT_UPDATED = 'document_updated',
  DOCUMENT_DELETED = 'document_deleted',
  DOCUMENT_SHARED = 'document_shared',
  DOCUMENT_ACCESSED = 'document_accessed',
  
  // User events
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  
  // API events
  API_CALL = 'api_call',
  API_ERROR = 'api_error',
  API_RATE_LIMITED = 'api_rate_limited',
  RATE_LIMIT_VIOLATION = 'rate_limit_violation',

  // Security events
  SECURITY_VALIDATION_FAILED = 'security_validation_failed',
  SECURITY_INJECTION_ATTEMPT = 'security_injection_attempt',
  SECURITY_RLS_VIOLATION = 'security_rls_violation',
  
  // Data events
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',

  // Payout events
  PAYOUT_REQUESTED = 'payout_requested',
  PAYOUT_APPROVED = 'payout_approved',
  PAYOUT_REJECTED = 'payout_rejected',
  PAYOUT_PROCESSED = 'payout_processed',
  PAYOUT_CANCELLED = 'payout_cancelled',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditEvent {
  action: AuditAction;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  severity: AuditSeverity;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
  duration?: number; // milliseconds
  error?: string;
}

/**
 * In-memory audit log store
 * In production, this would write to a database
 */
const auditLogStore: AuditEvent[] = [];
const MAX_LOGS = 10000; // Prevent unbounded memory growth

/**
 * Log an audit event
 */
export async function logAuditEvent(
  action: AuditAction,
  options: {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
    statusCode?: number;
    duration?: number;
    error?: string;
  } = {}
): Promise<void> {
  const event: AuditEvent = {
    action,
    userId: options.userId,
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    severity: options.severity || AuditSeverity.INFO,
    timestamp: new Date(),
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: options.details,
    statusCode: options.statusCode,
    duration: options.duration,
    error: options.error,
  };

  // Log to console
  console.log(
    `[AUDIT] ${event.action} (${event.severity}) - User: ${event.userId || 'unknown'}`,
    event
  );

  // Store in memory
  auditLogStore.push(event);

  // Prevent unbounded growth
  if (auditLogStore.length > MAX_LOGS) {
    auditLogStore.shift();
  }

  // In production, write to Supabase
  await writeToSupabaseAuditLog(event);
}

/**
 * Write audit event to Supabase database
 */
async function writeToSupabaseAuditLog(event: AuditEvent): Promise<void> {
  try {
    // Dynamically import Supabase client to avoid SSR issues
    const { createClient } = await import('@supabase/supabase-js');

    // Get Supabase URL and service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('Supabase environment variables not set, skipping database audit log');
      return;
    }

    // Create client with service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      }
    });

    // Determine if this is a financial audit event
    const isFinancialAudit = [
      'payout_requested',
      'payout_approved',
      'payout_rejected',
      'payout_processed',
      'payout_cancelled',
      'referral_flagged',
      'user_role_changed',
      'fraud_confirmed'
    ].includes(event.action);

    if (isFinancialAudit) {
      // Insert into financial_audit_trail table
      const { error } = await supabase
        .from('financial_audit_trail')
        .insert({
          action: event.action,
          user_id: event.userId,
          target_user_id: event.details?.target_user_id || event.userId,
          resource_type: event.resourceType,
          resource_id: event.resourceId,
          severity: event.severity,
          details: event.details,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          created_at: event.timestamp.toISOString()
        });

      if (error) {
        console.error('Error writing financial audit log to Supabase:', error);
      }
    } else {
      // Insert into general audit_logs table
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          table_name: 'general',
          record_id: crypto.randomUUID ? crypto.randomUUID() : 'general-audit',
          action: event.action,
          old_values: null,
          new_values: {
            userId: event.userId,
            resourceType: event.resourceType,
            resourceId: event.resourceId,
            severity: event.severity,
            details: event.details,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent
          },
          changed_by: event.userId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          created_at: event.timestamp.toISOString()
        });

      if (error) {
        console.error('Error writing general audit log to Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error in writeToSupabaseAuditLog:', error);
  }
}

/**
 * Helper: Log authentication failure
 */
export async function logAuthFailure(
  reason: string,
  options: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<void> {
  await logAuditEvent(AuditAction.AUTH_FAILED, {
    ...options,
    severity: AuditSeverity.WARNING,
    details: { reason },
  });
}

/**
 * Helper: Log security validation failure
 */
export async function logValidationFailure(
  field: string,
  reason: string,
  options: {
    userId?: string;
    ipAddress?: string;
    resourceType?: string;
  } = {}
): Promise<void> {
  await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
    ...options,
    severity: AuditSeverity.WARNING,
    details: { field, reason },
  });
}

/**
 * Helper: Log potential injection attempt
 */
export async function logInjectionAttempt(
  injectionType: string,
  pattern: string,
  options: {
    userId?: string;
    ipAddress?: string;
  } = {}
): Promise<void> {
  await logAuditEvent(AuditAction.SECURITY_INJECTION_ATTEMPT, {
    ...options,
    severity: AuditSeverity.CRITICAL,
    details: { injectionType, pattern },
  });
}

/**
 * Helper: Log rate limiting event
 */
export async function logRateLimited(
  userId: string,
  endpoint: string,
  options: {
    ipAddress?: string;
    limit?: number;
    windowMs?: number;
  } = {}
): Promise<void> {
  await logAuditEvent(AuditAction.API_RATE_LIMITED, {
    userId,
    severity: AuditSeverity.WARNING,
    resourceType: 'api_endpoint',
    resourceId: endpoint,
    ...options,
  });
}

/**
 * Helper: Log rate limit violation with detailed metadata
 */
export async function logRateLimitViolation(
  options: {
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
    plan?: string;
    quotaMultiplier?: number;
  }
): Promise<void> {
  await logAuditEvent(AuditAction.RATE_LIMIT_VIOLATION, {
    userId: options.userId,
    severity: AuditSeverity.WARNING,
    resourceType: 'rate_limit',
    resourceId: options.featureName,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: {
      identifierType: options.identifierType,
      identifierValue: options.identifierValue,
      endpointPath: options.endpointPath,
      violationType: options.violationType,
      limitThreshold: options.limitThreshold,
      actualCount: options.actualCount,
      windowStart: options.windowStart?.toISOString(),
      windowEnd: options.windowEnd?.toISOString(),
      actionTaken: options.actionTaken,
      plan: options.plan,
      quotaMultiplier: options.quotaMultiplier,
    },
  });
}

/**
 * Helper: Log API call with timing
 */
export async function logApiCall(
  method: string,
  endpoint: string,
  options: {
    userId?: string;
    statusCode: number;
    duration: number;
    ipAddress?: string;
    error?: string;
  }
): Promise<void> {
  const severity = options.statusCode >= 500 ? AuditSeverity.ERROR : AuditSeverity.INFO;
  
  await logAuditEvent(AuditAction.API_CALL, {
    userId: options.userId,
    resourceType: 'api_endpoint',
    resourceId: `${method} ${endpoint}`,
    severity,
    statusCode: options.statusCode,
    duration: options.duration,
    ipAddress: options.ipAddress,
    error: options.error,
  });
}

/**
 * Retrieve audit logs (with optional filtering)
 */
export function getAuditLogs(options: {
  action?: AuditAction;
  userId?: string;
  limit?: number;
  offset?: number;
} = {}): AuditEvent[] {
  let filtered = auditLogStore;

  if (options.action) {
    filtered = filtered.filter(log => log.action === options.action);
  }

  if (options.userId) {
    filtered = filtered.filter(log => log.userId === options.userId);
  }

  // Return in reverse order (newest first)
  filtered = filtered.reverse();

  const limit = options.limit || 100;
  const offset = options.offset || 0;

  return filtered.slice(offset, offset + limit);
}

/**
 * Get summary statistics
 */
export function getAuditStatistics(
  timeWindowMs: number = 60 * 60 * 1000 // 1 hour
): {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  failedAttempts: number;
} {
  const cutoff = new Date(Date.now() - timeWindowMs);
  const recentLogs = auditLogStore.filter(log => log.timestamp > cutoff);

  const eventsByAction: Record<string, number> = {};
  const eventsBySeverity: Record<string, number> = {};
  let failedAttempts = 0;

  recentLogs.forEach(log => {
    eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
    eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;

    if (log.severity === AuditSeverity.CRITICAL) {
      failedAttempts++;
    }
  });

  return {
    totalEvents: recentLogs.length,
    eventsByAction,
    eventsBySeverity,
    failedAttempts,
  };
}

/**
 * Clear old logs (cleanup function)
 * Run periodically to prevent unbounded growth
 */
export function cleanupAuditLogs(ageMs: number = 24 * 60 * 60 * 1000): number {
  const cutoff = new Date(Date.now() - ageMs);
  const initialLength = auditLogStore.length;

  const newStore = auditLogStore.filter(log => log.timestamp > cutoff);
  auditLogStore.length = 0;
  auditLogStore.push(...newStore);

  return initialLength - auditLogStore.length;
}

// Cleanup old logs every hour
setInterval(() => {
  const deleted = cleanupAuditLogs(7 * 24 * 60 * 60 * 1000); // Keep 7 days
  if (deleted > 0) {
    console.log(`[AUDIT] Cleaned up ${deleted} old audit logs`);
  }
}, 60 * 60 * 1000);

export default {
  logAuditEvent,
  logAuthFailure,
  logValidationFailure,
  logInjectionAttempt,
  logRateLimited,
  logRateLimitViolation,
  logApiCall,
  getAuditLogs,
  getAuditStatistics,
  cleanupAuditLogs,
};
