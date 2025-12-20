# Security Implementation: Duplicate Audit & Conflict Resolution

**Date**: December 20, 2025  
**Purpose**: Identify conflicting/duplicate implementations before applying security fixes

---

## CRITICAL CONFLICTS FOUND

### 1. ❌ DISABLED RLS ON AUTH.USERS (SECURITY HOLE)

**File**: `supabase/migrations/20251219152120_disable_rls_on_auth_users.sql`  
**Current State**:
```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

**Problem**: 
- Any authenticated user can read/modify all auth records
- Passwords, emails, metadata exposed across users
- Single most critical vulnerability in system

**Resolution**: 
```bash
# Option A: Remove this migration entirely
rm supabase/migrations/20251219152120_disable_rls_on_auth_users.sql

# Option B: Convert to re-enable
# Change content to:
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auth record" ON auth.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
```

**Action Required**: IMMEDIATE (before any other security work)

---

### 2. ⚠️ EXPOSED API KEY IN CLIENT CODE (HIGH RISK)

**Affected Files** (19 total):

#### Hooks Layer
- `src/hooks/useNotificationEmail.ts`
- `src/hooks/useStudentNotificationEmail.ts`
- `src/hooks/useAdvisorNotificationEmail.ts`
- `src/hooks/useCriticNotificationEmail.ts`

#### Components Layer
- `src/components/notification-bell.tsx`
- And any component importing these hooks

**Current Pattern** (❌ WRONG):
```typescript
// src/hooks/useNotificationEmail.ts
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

export function useNotificationEmail() {
  const sendEmail = async (recipients: string[]) => {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INTERNAL_API_KEY}` // ❌ EXPOSED
      },
      body: JSON.stringify({ recipients })
    });
  };
  return { sendEmail };
}
```

**Why This is Wrong**:
- `NEXT_PUBLIC_*` variables are compiled into browser bundle
- Anyone can inspect `window.__ENV__.NEXT_PUBLIC_INTERNAL_API_KEY`
- Attackers can make direct API calls impersonating your app
- No rate limiting per user, just global key

**Correct Pattern** (✅ SESSION-BASED):

```typescript
// src/hooks/useNotificationEmail.ts
export function useNotificationEmail() {
  const sendEmail = async (recipients: string[]) => {
    // No API key needed - session auth handles it
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status}`);
    }
    
    return response.json();
  };
  
  return { sendEmail };
}

// src/app/api/notifications/send-email/route.ts
export async function POST(req: Request) {
  // Verify user session (no exposed key needed)
  const supabase = createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only authenticated users can send notifications
  const body = await req.json();
  const recipients = body.recipients || [session.user.email];
  
  // Send email using SUPABASE_SERVICE_ROLE_KEY (server-only secret)
  // Never exposed to client
  const response = await sendEmailViaResend(recipients);
  
  return Response.json(response);
}
```

**Migration Path**:

Step 1: Create safe wrapper in all hooks
```bash
# Search for all NEXT_PUBLIC_INTERNAL_API_KEY usages
grep -r "NEXT_PUBLIC_INTERNAL_API_KEY" src/ --include="*.ts" --include="*.tsx"

# Expected locations:
# - src/hooks/useNotificationEmail.ts (and variants)
# - src/hooks/useCriticNotificationEmail.ts
# - src/hooks/useAdvisorNotificationEmail.ts
# - src/hooks/useStudentNotificationEmail.ts
```

Step 2: Remove from all files
```typescript
// Before:
const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });

// After:
fetch(url, { /* session auth handles it */ });
```

Step 3: Remove from `.env.local`
```bash
# Don't expose this
# NEXT_PUBLIC_INTERNAL_API_KEY=xxxx

# Keep only on server (if needed)
INTERNAL_API_KEY=xxxx  # Not used if using session auth
```

**Action Required**: HIGH - Refactor 4 hook files + consuming components

---

### 3. ⚠️ MISSING RLS ON DASHBOARD TABLES (MEDIUM-HIGH RISK)

**Affected Tables**:
- `dashboard_layouts`
- `widget_data_cache`
- `widget_settings`
- `user_dashboard_preferences`
- `dashboard_activity_log`

**Current State**: NO RLS ENABLED

**Problem**:
```sql
-- User A can see User B's dashboard layouts
SELECT * FROM dashboard_layouts; -- No WHERE auth.uid() check
```

**Check Command**:
```bash
# List all tables WITHOUT RLS
SELECT tablename FROM pg_tables 
WHERE tablename NOT LIKE 'pg_%'
AND tablename NOT IN (
  SELECT tablename FROM pg_tables
  WHERE EXISTS (SELECT 1 FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename)
);
```

**Expected Output** (should be empty after fix):
```
 pg_policies table without RLS:
- dashboard_layouts
- widget_data_cache
- widget_settings
- user_dashboard_preferences
- dashboard_activity_log
```

**Resolution**: Apply `20251220_add_rls_dashboard_tables.sql` (see main plan)

**Action Required**: HIGH - Create and apply migration

---

### 4. ✅ EXISTING RLS IMPLEMENTATION (KEEP AS-IS)

**Already Correctly Implemented**:

| Table | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|--------|--------|--------|--------|--------|
| `user_behavior_logs` | ✅ | ✅ | ✗ | ✗ | Good |
| `user_patterns` | ✅ | ✅ | ✅ | ✗ | Good |
| `notifications` | ✅ | ✅ | ✅ | ✅ | Good |

**Verify Commands**:
```bash
# Check user_behavior_logs policies
SELECT * FROM pg_policies WHERE tablename = 'user_behavior_logs';

# Test: As logged-in user
SELECT * FROM user_behavior_logs WHERE user_id != auth.uid();
-- Should return empty (RLS working)

SELECT * FROM user_behavior_logs WHERE user_id = auth.uid();
-- Should return own records (RLS working)
```

**Action Required**: NONE - These are correct, extend to other tables

---

### 5. ⚠️ NO RATE LIMITING IMPLEMENTED

**Current State**: Zero rate limiting on any API route

**Affected Endpoints**:
- `/api/papers/search` - could be abused for crawling
- `/api/semantic-scholar-search` - crawl academic DB
- `/api/mendeley/search` - crawl citation manager
- `/api/messages/send` - spam messages
- `/api/notifications/*` - spam emails

**Check if Implemented**:
```bash
grep -r "rateLimit\|throttle\|maxRequests\|window" src/app/api --include="*.ts"
# Should return empty initially
```

**Duplication Risk**: NONE (doesn't exist yet)

**Action Required**: MEDIUM - Implement rate limiter (new file, no conflicts)

---

### 6. ⚠️ NO INPUT VALIDATION ON API ROUTES

**Current State**: Minimal validation

**Affected Endpoints**:
```bash
# Check existing validation
grep -r "z.object\|schema.parse\|validate" src/app/api --include="*.ts" | wc -l
# If < 5 matches, validation is minimal
```

**High-Risk Routes** (user input):
- `/api/papers/search` - query parameter
- `/api/semantic-scholar-search` - query parameter
- `/api/mendeley/search` - query parameter
- `/api/messages/send` - message body
- `/api/composio-mcp` - command input

**Duplication Risk**: LOW (each route different)

**Action Required**: MEDIUM - Add Zod schemas to 5+ routes

---

### 7. ❌ HARDCODED SECRETS IN SUPABASE FUNCTIONS

**Location**: `supabase/functions/` (6+ functions)

**Examples**:
```typescript
// supabase/functions/generate-research-questions/index.ts
const apiKey = Deno.env.get('OPENROUTER_API_KEY'); // ✅ OK if in env
// But how is it set? Check supabase.json or CI/CD
```

**Check Current Setup**:
```bash
# Look for env var references
grep -r "Deno.env.get\|process.env" supabase/functions --include="*.ts" | head -20

# Check if secrets are in supabase.json
cat supabase/config.json | grep -i secret
```

**Duplication Risk**: MEDIUM - May have multiple implementations

**Action Required**: MEDIUM - Move to Supabase Vault or environment secrets

---

### 8. ❌ NO JWT VALIDATION IN API ROUTES

**Current State**: Some routes check session, others don't

**Check Coverage**:
```bash
# Find routes WITH auth checks
grep -r "getSession\|auth.uid\|verifyAuth" src/app/api --include="*.ts" | wc -l

# Find routes WITHOUT auth checks  
grep -l "export async function POST\|GET\|DELETE" src/app/api --include="*.ts" | wc -l

# Ideally these should match
```

**Duplication Risk**: HIGH - May have inconsistent patterns

**Action Required**: MEDIUM - Create centralized middleware, apply to all routes

---

## MIGRATION ORDER & DEPENDENCIES

```
Priority Order (Top = Do First):

1. ❌ AUTH.USERS RLS (CRITICAL)
   └─ Remove migration 20251219152120 OR convert to enable RLS
   └─ Blocks: Everything else depends on auth being secure

2. ⚠️ REMOVE INTERNAL_API_KEY (HIGH)
   └─ Update 19 files
   └─ Remove from .env
   └─ Blocks: Dashboard notifications until fixed

3. ⚠️ ADD RLS TO DASHBOARD TABLES (MEDIUM-HIGH)
   └─ Create migration 20251220_add_rls_dashboard_tables.sql
   └─ Test: Cross-user access denied
   └─ Depends on: Step 1 complete

4. ⚠️ INPUT VALIDATION (MEDIUM)
   └─ Create src/lib/input-validator.ts
   └─ Apply to 5+ routes
   └─ Depends on: Nothing specific

5. ⚠️ RATE LIMITING (MEDIUM)
   └─ Create src/lib/rate-limiter.ts
   └─ Apply to search/message routes
   └─ Depends on: Nothing specific

6. ⚠️ JWT VALIDATION MIDDLEWARE (MEDIUM)
   └─ Create src/lib/auth-middleware.ts
   └─ Refactor all API routes
   └─ Depends on: Step 1 complete

7. 🟨 ENCRYPTION (LOWER)
   └─ Create migration with pgcrypto
   └─ Encrypt sensitive fields
   └─ Depends on: Database backups done

8. 🟨 AUDIT LOGGING (LOWER)
   └─ Create audit_logs table
   └─ Add triggers
   └─ Depends on: Nothing specific

9. 🟨 MONITORING (LOWEST)
   └─ Create security-monitoring.ts
   └─ Set up alerts
   └─ Depends on: All above done
```

---

## CONFLICT RESOLUTION MATRIX

| Conflict | File | Current State | Action | Risk |
|----------|------|---------------|--------|------|
| RLS on auth.users | `20251219152120_*.sql` | DISABLED | REVERT | CRITICAL |
| NEXT_PUBLIC_INTERNAL_API_KEY | 19 files | EXPOSED | REMOVE | HIGH |
| Dashboard RLS | `11_dashboard_tables.sql` | MISSING | ADD | HIGH |
| Rate limiting | All API routes | NONE | ADD | MEDIUM |
| Input validation | API routes | MINIMAL | ENHANCE | MEDIUM |
| JWT validation | API routes | INCONSISTENT | STANDARDIZE | MEDIUM |
| Edge function secrets | `supabase/functions/` | ENV VAR | AUDIT | MEDIUM |
| Audit logging | Database | NONE | ADD | LOW |
| Encryption | User data | AT-REST ONLY | ADD FIELD-LEVEL | LOW |

---

## PRE-IMPLEMENTATION CHECKLIST

Before making any changes:

- [ ] Backup database
- [ ] Backup current .env.local
- [ ] Review all 19 files using INTERNAL_API_KEY
- [ ] List all API routes that need validation
- [ ] Check if any custom rate limiting exists
- [ ] Review all RLS policies currently in place
- [ ] Test local dev environment works
- [ ] Create feature branch: `security/phase-1-critical`

---

## VERIFICATION QUERIES

Run these in Supabase SQL Editor after each phase:

### Phase 1: Auth RLS
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
-- Should show: tablename="users", rowsecurity=true

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'users';
-- Should show at least 1 policy
```

### Phase 2: Dashboard RLS
```sql
-- Check all dashboard tables have RLS
SELECT tablename FROM pg_tables 
WHERE tablename LIKE 'dashboard_%'
OR tablename = 'widget_%'
ORDER BY tablename;

-- For each, verify:
SELECT * FROM pg_policies 
WHERE tablename IN ('dashboard_layouts', 'widget_data_cache', ...);
-- Should show 3-5 policies per table
```

### Phase 3: Audit Logging
```sql
-- Verify audit table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'audit_logs';

-- Check for recent entries
SELECT COUNT(*) FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## TESTING BEFORE/AFTER

### Before (Current State)
```bash
# User B can see User A's data (BAD)
curl -H "Authorization: Bearer user_b_token" \
  http://localhost:3000/api/user/a/dashboard
# Returns User A's dashboard data ❌

# Unauthenticated request with exposed key (BAD)
curl -H "Authorization: Bearer $NEXT_PUBLIC_INTERNAL_API_KEY" \
  http://localhost:3000/api/notifications/send-email
# Works, allows spam ❌
```

### After (Secure State)
```bash
# User B cannot see User A's data (GOOD)
curl -H "Authorization: Bearer user_b_token" \
  http://localhost:3000/api/user/a/dashboard
# Returns 403 Forbidden ✅

# Must be authenticated (GOOD)
curl http://localhost:3000/api/notifications/send-email
# Returns 401 Unauthorized ✅

# Rate limiting works (GOOD)
for i in {1..70}; do
  curl -H "Authorization: Bearer $token" \
    http://localhost:3000/api/papers/search
done
# 70th request returns 429 Too Many Requests ✅
```

---

## ROLLBACK PLAN

If something breaks:

```bash
# 1. Revert to last known good migration
supabase migration list
supabase migration down

# 2. Restore from backup
psql -h db.supabase.local -d postgres -f backup.sql

# 3. Undo file changes (git)
git checkout -- src/hooks/useNotificationEmail.ts
```

---

## Success Criteria

After all phases complete:

✅ No cross-user data access (RLS enforced)  
✅ No exposed API keys in client code  
✅ All API routes validate input  
✅ Rate limiting active on public routes  
✅ All requests logged for audit  
✅ Sensitive fields encrypted  
✅ 429 responses for rate limit violations  
✅ 401/403 for auth failures  
✅ SQL injection attempts rejected  
✅ XSS attempts sanitized  

---

## Next Step: Execute Phase 1

When ready, start with:
```bash
# 1. Check current state
grep "DISABLE ROW LEVEL SECURITY" supabase/migrations/*

# 2. Create fixed version
cat > supabase/migrations/20251220000001_fix_auth_users_rls.sql << 'EOF'
-- Re-enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Add policy for users to view their own record
CREATE POLICY "Users can view own auth record" ON auth.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
EOF

# 3. Apply migration
supabase migration up

# 4. Test it
psql -h localhost -d postgres -c "SELECT * FROM pg_policies WHERE tablename = 'users';"
```
