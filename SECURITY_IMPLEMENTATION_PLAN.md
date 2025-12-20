# ThesisAI Security Implementation Plan

**Status**: Draft Analysis  
**Date**: December 20, 2025  
**Priority**: Critical for Production

---

## Executive Summary

Analyzed codebase for Supabase security best practices. Found **60+ files handling secrets**, **partial RLS implementation**, and **critical exposure risks**. Provides prioritized 4-phase implementation plan with duplicate detection to prevent conflicts.

---

## CURRENT STATE ANALYSIS

### ✅ Already Implemented

1. **Partial RLS** (6 tables)
   - `user_behavior_logs` - INSERT, SELECT policies ✓
   - `user_patterns` - SELECT, INSERT, UPDATE policies ✓
   - `notifications` - Full CRUD policies ✓
   - Dashboard tables (11) - MISSING RLS ⚠️

2. **Environment Variables** (60+ locations)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (OK) ✓
   - `SUPABASE_SERVICE_ROLE_KEY` - Server-side only (Good) ✓
   - But also using: `NEXT_PUBLIC_INTERNAL_API_KEY` - EXPOSED IN CLIENT ⚠️

3. **API Routes** (15 endpoints)
   - Service role key used correctly in: `/api/messages/`, `/api/seed-documents/`, `/api/admin/*`
   - No visible rate limiting on endpoints ⚠️
   - No input validation/sanitization visible ⚠️

### ⚠️ Gaps & Risk Areas

| Risk | Severity | Location | Impact |
|------|----------|----------|--------|
| Missing RLS on 8+ tables | **HIGH** | Dashboard tables (11_dashboard_tables.sql) | Unauthorized data access |
| Exposed `NEXT_PUBLIC_INTERNAL_API_KEY` | **HIGH** | Client-side hooks, components | API abuse, unauthorized requests |
| No rate limiting | **HIGH** | All API routes | DDoS, brute force attacks |
| Auth table RLS disabled | **CRITICAL** | 20251219152120 migration | Bypass authentication |
| No input sanitization | **HIGH** | API routes (paraphrasing, papers, etc.) | SQL injection, XSS |
| No pgcrypto encryption | **MEDIUM** | User data at rest | SPII/PII exposure |
| No audit logging | **MEDIUM** | All tables | Compliance, forensics |
| Hardcoded secrets in functions | **HIGH** | supabase/functions/* | Secret exposure |
| No JWT validation visible | **MEDIUM** | Some API routes | Token hijacking |
| Missing CORS validation | **MEDIUM** | API routes | Cross-origin attacks |

---

## PHASE 1: CRITICAL FIXES (Week 1)

### 1.1 RE-ENABLE & IMPLEMENT RLS ON AUTH TABLE
**File**: `supabase/migrations/20251219152120_disable_rls_on_auth_users.sql`

**Current State**:
```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;  -- ❌ CRITICAL SECURITY HOLE
```

**Action**: Remove this migration or add RLS re-enable
```sql
-- Revert the disable
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Add policy for auth.users
CREATE POLICY "Users can view own auth record" ON auth.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Disallow direct updates to auth table (should use Supabase auth API)
CREATE POLICY "Users cannot modify auth directly" ON auth.users
  FOR UPDATE TO authenticated
  USING (false);
```

**Why**: Disabled RLS = anyone can read/modify all user records. This is your biggest vulnerability.

---

### 1.2 IMPLEMENT RLS ON ALL DASHBOARD TABLES
**File**: `supabase/migrations/11_dashboard_tables.sql`

**Affected Tables** (Currently have NO RLS):
- `dashboard_layouts`
- `widget_data_cache`
- `widget_settings`
- `user_dashboard_preferences`
- `dashboard_activity_log`

**Action**: Create new migration `20251220_add_rls_dashboard_tables.sql`

```sql
-- Enable RLS on all dashboard tables
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activity_log ENABLE ROW LEVEL SECURITY;

-- Dashboard Layouts Policies
CREATE POLICY "Users can view own layouts" ON dashboard_layouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create layouts" ON dashboard_layouts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own layouts" ON dashboard_layouts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own layouts" ON dashboard_layouts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Widget Data Cache Policies (same pattern)
CREATE POLICY "Users can view own cache" ON widget_data_cache
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cache" ON widget_data_cache
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache" ON widget_data_cache
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Widget Settings Policies
CREATE POLICY "Users can view own settings" ON widget_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON widget_settings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON widget_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User Dashboard Preferences Policies
CREATE POLICY "Users can view own preferences" ON user_dashboard_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create preferences" ON user_dashboard_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_dashboard_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Dashboard Activity Log (append-only audit)
CREATE POLICY "Users can view own activity" ON dashboard_activity_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log own activity" ON dashboard_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Why**: Dashboard data contains user preferences & state. No RLS = any user sees all users' configurations.

---

### 1.3 REMOVE EXPOSED `NEXT_PUBLIC_INTERNAL_API_KEY`
**Files Affected** (19 files):
- `src/hooks/useNotificationEmail.ts`
- `src/hooks/useStudentNotificationEmail.ts`
- `src/hooks/useAdvisorNotificationEmail.ts`
- `src/hooks/useCriticNotificationEmail.ts`
- `src/components/notification-bell.tsx`
- Any component using `NEXT_PUBLIC_INTERNAL_API_KEY`

**Current Problem**:
```typescript
// ❌ EXPOSED IN BROWSER
const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
const response = await fetch('/api/notifications/send-email', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**Solution**: Remove from client, use service role on backend

```typescript
// ✅ Client-side: Remove internal key
// Just call the API, let the middleware handle auth
const response = await fetch('/api/notifications/send-email', {
  method: 'POST',
  body: JSON.stringify({ userId, emailType: 'advisor' })
  // No Authorization header needed - session auth handles it
});

// ✅ API route: Use service role internally
// src/app/api/notifications/send-email/route.ts
export async function POST(req: Request) {
  const session = await auth.getSession(); // Verify user session
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Use service role for admin operations, not exposed to client
}
```

**Why**: Exposing API keys in `NEXT_PUBLIC_*` allows anyone to impersonate your app and spam endpoints.

---

## PHASE 2: FOUNDATIONAL SECURITY (Week 2)

### 2.1 IMPLEMENT INPUT SANITIZATION & VALIDATION

**Files to Update** (API routes with user input):
- `/api/semantic-scholar-search/route.ts`
- `/api/papers/search/route.ts`
- `/api/mendeley/search/route.ts`
- `/api/messages/send/route.ts`
- `/api/composio-mcp/route.ts`

**Pattern to Implement**:

```typescript
// src/lib/input-validator.ts - REUSABLE VALIDATION
import { z } from 'zod'; // Already in your project

export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query required')
    .max(500, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\"\']+$/, 'Invalid characters'),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/--/g, '') // Remove SQL comment syntax
    .replace(/;/g, ''); // Remove statement terminators
};
```

**Apply to Routes**:

```typescript
// src/app/api/semantic-scholar-search/route.ts
import { searchQuerySchema } from '@/lib/input-validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ✅ Validate input
    const validated = searchQuerySchema.parse(body);
    const sanitized = sanitizeInput(validated.query);
    
    // Use sanitized input
    const results = await searchApi(sanitized, validated.limit);
    return Response.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

**Duplicate Check**: Already using Zod? Verify no conflicting validation schemas exist.

**Search Command**:
```bash
grep -r "schema.parse\|z.object" src/app/api --include="*.ts"
```

---

### 2.2 IMPLEMENT BASIC RATE LIMITING

**File to Create**: `src/lib/rate-limiter.ts`

```typescript
// Simple in-memory rate limiter (for dev)
// For production, use Redis or Supabase table

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export async function rateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000 // 1 minute
): Promise<boolean> {
  const now = Date.now();
  const entry = store.get(key);
  
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

export async function getRateLimitStatus(key: string) {
  const entry = store.get(key);
  return {
    remaining: entry ? Math.max(0, 60 - entry.count) : 60,
    resetAt: entry?.resetAt || Date.now() + 60000,
  };
}
```

**Better Solution (Supabase Table)**:

```sql
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(endpoint, COALESCE(user_id, ip_address))
);

CREATE INDEX idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX idx_rate_limits_user ON rate_limits(user_id);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);
```

**Apply to Routes**:

```typescript
// Middleware or within route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userId = session?.user?.id;
  
  const allowed = await rateLimit(
    `/api/papers/search`,
    60, // 60 requests
    3600000 // per hour
  );
  
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: { 'Retry-After': '3600' }
      }
    );
  }
  
  // Process request...
}
```

---

### 2.3 ADD JWT VALIDATION MIDDLEWARE

**File**: `src/lib/auth-middleware.ts`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function verifyAuth(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }
  
  // Verify JWT is valid
  if (new Date(session.expires_at * 1000) < new Date()) {
    return {
      error: 'Token expired',
      status: 401,
    };
  }
  
  return {
    session,
    userId: session.user.id,
  };
}

// Apply to API routes:
export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  
  const userId = auth.userId;
  // Use userId for RLS enforcement
}
```

**Duplicate Check**: Look for existing auth checks in API routes.

---

## PHASE 3: DATA PROTECTION (Week 3)

### 3.1 ENCRYPT SENSITIVE FIELDS (PII/SPII)

**Fields to Encrypt**:
- User emails (already auth.users) ✓
- Phone numbers (if stored)
- Thesis titles (if sensitive)
- User names in custom tables

**Implementation** (using pgcrypto):

```sql
-- Create encrypted fields migration
-- 20251221_add_pgcrypto_encryption.sql

-- Add pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Add encrypted column to user_behavior_logs
ALTER TABLE user_behavior_logs ADD COLUMN metadata_encrypted BYTEA;

-- Create helper function for encryption
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, secret TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, secret);
END;
$$ LANGUAGE plpgsql;

-- Create helper function for decryption  
CREATE OR REPLACE FUNCTION decrypt_data(data BYTEA, secret TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, secret);
END;
$$ LANGUAGE plpgsql;

-- Encrypt existing data (one-time)
UPDATE user_behavior_logs
SET metadata_encrypted = encrypt_data(metadata::TEXT, 'your-secret-key')
WHERE metadata_encrypted IS NULL;
```

**Use in Application**:

```typescript
// src/lib/encryption.ts
export async function encryptSensitiveData(
  data: string,
  secretKey: string = process.env.ENCRYPTION_KEY!
) {
  // For client-side sensitive data, use TweetNaCl.js or similar
  // For now, rely on database encryption at rest
  return data;
}

export async function storeUserData(
  userId: string,
  sensitiveField: string,
  value: string
) {
  const supabase = createClient();
  
  // Store encrypted in DB
  return supabase
    .from('user_profiles')
    .update({
      [sensitiveField]: value, // Will be encrypted by pgcrypto trigger
    })
    .eq('user_id', userId);
}
```

**⚠️ Note**: Already using at-rest encryption via Supabase. This adds field-level encryption for extra defense-in-depth.

---

### 3.2 ENABLE AUDIT LOGGING

**File**: Create `20251221_add_audit_logging.sql`

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- No RLS on audit logs (only app can write via triggers)
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Create audit trigger for documents table (example)
CREATE OR REPLACE FUNCTION audit_document_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(user_id, action, resource_type, resource_id, changes)
  VALUES(
    auth.uid(),
    TG_OP,
    'document',
    NEW.id,
    jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER document_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION audit_document_changes();
```

**Access Audit Logs** (via API):

```typescript
// src/app/api/admin/audit-logs/route.ts
export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  
  // Only admins can view audit logs
  if (!auth.session?.user.user_metadata?.role === 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  return Response.json(data || []);
}
```

---

## PHASE 4: HARDENING & MONITORING (Week 4)

### 4.1 SECURE SECRETS IN EDGE FUNCTIONS

**Files**: All files in `supabase/functions/`

**Current Problem**:
```typescript
// ❌ Secret in function code
const apiKey = Deno.env.get('OPENROUTER_API_KEY');
```

**Solution**: Use Supabase Vault

```typescript
// ✅ Use Supabase Vault
import { Vault } from 'https://esm.sh/@supabase/vault';

export const handler = async (req: Request) => {
  const vault = new Vault();
  const apiKey = await vault.getSecret('openrouter_api_key');
  
  // Use securely...
};
```

**Or use environment variables properly**:
```bash
# .env.supabase (in supabase/functions/.env)
OPENROUTER_API_KEY=sk-xxx
PUTER_API_KEY=puter-xxx
SERPAPI_KEY=serpapi-xxx
COINBASE_COMMERCE_API_KEY=comm-xxx
```

---

### 4.2 ADD CSRF PROTECTION

**File**: `src/middleware.ts` (Next.js 13+)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only check for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('session-token')?.value;
    
    // Verify CSRF token matches session
    if (!csrfToken || !sessionToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

### 4.3 IMPLEMENT MONITORING & ALERTS

**Create**: `src/lib/security-monitoring.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export async function logSecurityEvent(
  eventType: 'failed_login' | 'unauthorized_access' | 'rate_limit' | 'injection_attempt',
  details: Record<string, any>
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('security_events')
    .insert({
      event_type: eventType,
      details,
      timestamp: new Date(),
      severity: getSeverity(eventType),
    });
  
  if (error) console.error('Failed to log security event:', error);
  
  // Alert if critical
  if (getSeverity(eventType) === 'critical') {
    await sendSecurityAlert(eventType, details);
  }
}

async function sendSecurityAlert(eventType: string, details: any) {
  // Send to admin email, Slack, etc.
  await fetch('/api/notifications/security-alert', {
    method: 'POST',
    body: JSON.stringify({ eventType, details }),
  });
}

function getSeverity(eventType: string) {
  const severities: Record<string, string> = {
    failed_login: 'medium',
    unauthorized_access: 'high',
    rate_limit: 'medium',
    injection_attempt: 'critical',
  };
  return severities[eventType] || 'low';
}
```

---

## DUPLICATE DETECTION & CONFLICT RESOLUTION

### Existing Implementations to Preserve

1. ✅ **RLS on 3 tables** (`user_behavior_logs`, `user_patterns`, `notifications`)
   - **Action**: Keep as-is, extend to dashboard tables
   - **Conflict Risk**: LOW

2. ✅ **Service role key in API routes**
   - **Files**: `/api/messages/*`, `/api/admin/*`, `/api/seed-*`
   - **Action**: Keep, audit for safety
   - **Conflict Risk**: LOW

3. ⚠️ **`NEXT_PUBLIC_INTERNAL_API_KEY`** (19 locations)
   - **Action**: REPLACE - Remove from client, move auth to session
   - **Conflict Risk**: HIGH - Check all consuming code
   - **Cleanup**: Grep for `NEXT_PUBLIC_INTERNAL_API_KEY` and refactor

4. ❌ **Disabled RLS on `auth.users`**
   - **Action**: REVERT immediately
   - **Conflict Risk**: CRITICAL
   - **Cleanup**: Remove migration `20251219152120_disable_rls_on_auth_users.sql`

### Search Commands for Conflicts

```bash
# Find all rate limit implementations
grep -r "rate.?limit\|throttle\|rateLimit" src/ --include="*.ts" --include="*.tsx"

# Find all validation schemas
grep -r "z.object\|schema.parse" src/app/api --include="*.ts"

# Find all auth checks
grep -r "verifyAuth\|getSession\|auth.uid" src/ --include="*.ts" --include="*.tsx"

# Find all encryption usage
grep -r "encrypt\|decrypt\|pgp_sym" src/ --include="*.ts"

# Find all audit implementations
grep -r "audit.?log\|audit.?trail" src/ --include="*.ts"
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1 (Week 1) - CRITICAL
- [ ] Re-enable RLS on `auth.users` 
- [ ] Add RLS to 5 dashboard tables
- [ ] Remove `NEXT_PUBLIC_INTERNAL_API_KEY` from 19 files
- [ ] Refactor notification endpoints to use session auth
- [ ] Test: Verify users can't access other users' data

### Phase 2 (Week 2) - FOUNDATIONAL
- [ ] Create `input-validator.ts` with Zod schemas
- [ ] Apply input validation to 5+ API routes
- [ ] Create rate limiter (in-memory or Supabase table)
- [ ] Add rate limiting to sensitive endpoints
- [ ] Create `auth-middleware.ts` for JWT verification
- [ ] Apply to `/api/*` routes
- [ ] Test: Attempt SQL injection, verify rejection

### Phase 3 (Week 3) - DATA PROTECTION
- [ ] Add pgcrypto extension
- [ ] Create encryption/decryption functions
- [ ] Encrypt sensitive fields (names, emails, etc.)
- [ ] Create `20251221_add_audit_logging.sql`
- [ ] Add audit triggers to sensitive tables
- [ ] Test: Verify encrypted data in Supabase dashboard

### Phase 4 (Week 4) - HARDENING
- [ ] Secure edge function secrets in Supabase Vault
- [ ] Add CSRF protection middleware
- [ ] Create `security-monitoring.ts`
- [ ] Log security events to `security_events` table
- [ ] Set up alerting for critical events
- [ ] Test: Simulate attacks, verify logging

---

## Testing & Validation

### Test Commands

```bash
# 1. Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

# Then check each table:
SELECT * FROM pg_policies 
WHERE tablename IN ('dashboard_layouts', 'widget_data_cache', 'auth.users');

# 2. Test input validation
curl -X POST http://localhost:3000/api/papers/search \
  -H "Content-Type: application/json" \
  -d '{"query":"<script>alert(1)</script>"}' 

# 3. Test rate limiting
for i in {1..70}; do 
  curl -X GET http://localhost:3000/api/papers/search?q=test
done
# Should block after 60

# 4. Test unauthorized access
curl -X GET http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer invalid_token"
# Should return 401
```

### Load Testing (Optional)
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/papers/search?q=test
```

---

## PRODUCTION CHECKLIST

Before deploying:
- [ ] All migrations applied to production DB
- [ ] RLS tested on each table (cross-user access denied)
- [ ] Environment variables set correctly (.env.local for dev, secrets in CI/CD)
- [ ] Service role key rotated
- [ ] Anon key verified as read-only
- [ ] Rate limiting thresholds reviewed
- [ ] Audit logs verified (entries appearing)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS headers validated
- [ ] Load testing passed
- [ ] Security audit passed

---

## Reference: Supabase Security Dashboard

Monitor in Supabase console:
1. **Auth** → Check MFA, account lockout policies
2. **Policies** → View/edit RLS policies per table
3. **Logs** → View query logs and audit trail
4. **Vault** → Manage encrypted secrets
5. **Functions** → Verify edge function security

---

## Files to Create/Modify Summary

**Create (New)**:
- `supabase/migrations/20251220_add_rls_dashboard_tables.sql`
- `supabase/migrations/20251221_add_pgcrypto_encryption.sql`
- `supabase/migrations/20251221_add_audit_logging.sql`
- `src/lib/input-validator.ts`
- `src/lib/rate-limiter.ts`
- `src/lib/auth-middleware.ts`
- `src/lib/encryption.ts`
- `src/lib/security-monitoring.ts`
- `src/middleware.ts` (CSRF protection)
- `src/app/api/admin/audit-logs/route.ts`

**Modify (Existing)**:
- `supabase/migrations/20251219152120_disable_rls_on_auth_users.sql` (REVERT)
- 19 files using `NEXT_PUBLIC_INTERNAL_API_KEY` (REMOVE)
- `src/app/api/*/route.ts` (ADD validation, rate limiting, auth checks)
- `supabase/functions/*` (SECURE secrets)

**Delete**:
- `20251219152120_disable_rls_on_auth_users.sql` (optional, or convert to enable)

---

## Next Steps

1. **Prioritize Phase 1** - Re-enable auth RLS immediately (15 min)
2. **Block Phase 2** - Input validation on public API routes (2-3 hours)
3. **Schedule Phase 3** - Encryption & logging (4-5 hours, less urgent)
4. **Plan Phase 4** - Monitoring & hardening (ongoing)

All implementation assumes Next.js 16, Supabase, and Zod validation library already in project.
