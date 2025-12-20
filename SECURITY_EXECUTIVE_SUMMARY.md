# ThesisAI Security: Executive Summary & Action Items

**Analysis Date**: December 20, 2025  
**Analyzed Files**: 60+ with secrets | 12 migrations | 15 API routes  
**Total Issues Found**: 9 (1 Critical, 3 High, 2 Medium-High, 3 Medium)

---

## CRITICAL ISSUE - IMMEDIATE ACTION REQUIRED

### 🔴 Database Auth Table Has RLS Disabled

**File**: `supabase/migrations/20251219152120_disable_rls_on_auth_users.sql`

**What It Does**:
```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

**Why This is Critical**:
- Any authenticated user can view/modify ALL user records
- Passwords hashes, emails, metadata exposed across users
- Single point of failure for entire auth system

**Impact**: 🔥 **PRODUCTION-BREAKING VULNERABILITY**

**Fix (5 minutes)**:
```bash
# Option 1: Delete the migration
rm supabase/migrations/20251219152120_disable_rls_on_auth_users.sql

# Option 2: Create corrective migration
cat > supabase/migrations/20251220000001_fix_auth_rls.sql << 'EOF'
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own auth" ON auth.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
EOF

# Apply
supabase migration up
```

**Status**: ⏳ **MUST FIX BEFORE PRODUCTION DEPLOYMENT**

---

## HIGH-SEVERITY ISSUES

### 1. 🔴 API Key Exposed in Client Code

**Files**: 19 (hooks, components)  
**Example**:
```typescript
// ❌ WRONG - Exposed in browser
const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
fetch('/api/notifications/send-email', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**Why This is Bad**: 
- Attackers can inspect `window.__ENV__` to find keys
- Can impersonate your app to spam emails
- No per-user rate limiting

**Impact**: 🔥 **API ABUSE, SPAM, POTENTIAL DOS**

**Fix (2-3 hours)**:
```typescript
// ✅ CORRECT - Session-based
fetch('/api/notifications/send-email', {
  method: 'POST',
  body: JSON.stringify({ recipients })
  // Session cookie handles auth, no exposed key
});

// API route validates session, not key
```

**Files to Update**:
- `src/hooks/useNotificationEmail.ts`
- `src/hooks/useStudentNotificationEmail.ts`
- `src/hooks/useAdvisorNotificationEmail.ts`
- `src/hooks/useCriticNotificationEmail.ts`
- `src/components/notification-bell.tsx`
- Plus 14 others

**Status**: ⏳ **MUST FIX BEFORE PRODUCTION**

---

### 2. 🟠 No Row-Level Security on Dashboard Tables

**Tables Affected** (5 total):
- `dashboard_layouts`
- `widget_data_cache`
- `widget_settings`
- `user_dashboard_preferences`
- `dashboard_activity_log`

**Current Risk**:
```sql
-- User B can see User A's dashboard config
SELECT * FROM dashboard_layouts 
WHERE user_id != auth.uid();  -- ❌ No RLS blocks this
```

**Impact**: 🔥 **DATA LEAKAGE - USERS SEE EACH OTHER'S CONFIGURATIONS**

**Fix (1 hour)**:
```sql
-- Create migration to enable RLS on all 5 tables
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own layouts" ON dashboard_layouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- ... repeat for other 4 tables
```

**Status**: ⏳ **HIGH PRIORITY - BEFORE PRODUCTION**

---

## MEDIUM-HIGH SEVERITY ISSUES

### 3. 🟡 No Input Validation on Public API Routes

**Endpoints at Risk**: 5+
- `/api/papers/search` - query parameter
- `/api/semantic-scholar-search`
- `/api/mendeley/search`
- `/api/messages/send`
- `/api/composio-mcp`

**Attack Example**:
```bash
# SQL Injection attempt
curl -X POST http://localhost:3000/api/papers/search \
  -d '{"query":"test; DROP TABLE users;--"}'

# XSS attempt
curl -d '{"message":"<script>alert(1)</script>"}'
```

**Impact**: 🔥 **SQL INJECTION, XSS, COMMAND INJECTION POSSIBLE**

**Current Implementation**: 0 routes with input validation

**Fix (2-3 hours)**:
```typescript
// src/lib/input-validator.ts
import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string()
    .min(1).max(500)
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Invalid characters')
});

// Apply to routes
const validated = searchSchema.parse(req.body);
```

**Status**: ⏳ **BEFORE PRODUCTION**

---

### 4. 🟡 No Rate Limiting

**Endpoints Affected**: All 15+ API routes

**Attack Scenario**:
```bash
# Attacker spams without limit
for i in {1..10000}; do
  curl http://localhost:3000/api/papers/search?q=test
done
# 10k requests in seconds, no protection
```

**Impact**: 🔥 **BRUTE FORCE ATTACKS, DENIAL OF SERVICE**

**Current Implementation**: 0 rate limiting

**Fix (2 hours)**:
```typescript
// src/lib/rate-limiter.ts
export async function rateLimit(key: string, max: number = 60) {
  // Simple in-memory or database-backed limiter
}

// Apply to routes
if (!await rateLimit(userId, 60)) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

**Status**: ⏳ **BEFORE PRODUCTION**

---

## MEDIUM SEVERITY ISSUES

### 5. 🟡 No JWT Token Validation in Some Routes

**Affected**: Varies by route  
**Risk**: Token hijacking, expired token acceptance

**Fix (1-2 hours)**:
```typescript
// src/lib/auth-middleware.ts
export async function verifyAuth(req: Request) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized', status: 401 };
  if (isExpired(session)) return { error: 'Token expired', status: 401 };
  return { session, userId: session.user.id };
}
```

---

### 6. 🟡 No Audit Logging

**Missing**: Audit trail for compliance  
**Required for**: FERPA (student data), academic integrity

**Fix (3 hours)**:
```sql
-- Create audit_logs table
-- Add triggers on sensitive tables
-- Log: who, what, when, why for all data changes
```

---

## LOWER PRIORITY ISSUES

### 7. 🔵 No Field-Level Encryption

**Why It's Lower**: Already using at-rest encryption  
**When Needed**: For SPII/PII (names, emails, phone)

**Fix**: `pgcrypto` extension + encryption functions (2-3 hours)

---

### 8. 🔵 Secrets in Edge Functions Not Fully Secured

**Improvement**: Move to Supabase Vault instead of env vars (1 hour)

---

### 9. 🔵 No CSRF Protection

**Why It's Lower**: Most endpoints use session cookies + CORS  
**Improvement**: Add CSRF token middleware (1 hour)

---

## IMPLEMENTATION TIMELINE

### Week 1: CRITICAL FIXES
| Task | Time | Files | Priority |
|------|------|-------|----------|
| Re-enable auth RLS | 15 min | 1 migration | 🔴 CRITICAL |
| Remove exposed API key | 2-3 hrs | 19 files | 🔴 CRITICAL |
| Add RLS to dashboard tables | 1 hr | 1 migration | 🔴 CRITICAL |
| Add input validation | 2-3 hrs | 5+ routes | 🔴 CRITICAL |
| Implement rate limiting | 2 hrs | 1 new file | 🟠 HIGH |
| **WEEK 1 TOTAL** | **8-10 hrs** | | |

### Week 2: FOUNDATIONAL
| Task | Time | Files | Priority |
|------|------|-------|----------|
| JWT validation middleware | 1-2 hrs | 1 new + refactor | 🟠 HIGH |
| Audit logging | 2-3 hrs | 1 migration + triggers | 🟡 MEDIUM |
| **WEEK 2 TOTAL** | **4-5 hrs** | | |

### Week 3-4: HARDENING
| Task | Time | Priority |
|------|------|----------|
| Field-level encryption | 2-3 hrs | 🔵 LOW |
| Secrets in Vault | 1 hr | 🔵 LOW |
| CSRF protection | 1 hr | 🔵 LOW |
| Monitoring & alerts | 2 hrs | 🔵 LOW |
| **TOTAL** | **13-17 hrs** | |

---

## TESTING CHECKLIST

**Before Each Change**:
- [ ] Backup database
- [ ] Backup .env.local
- [ ] Create feature branch

**After Each Phase**:
- [ ] Run: `pnpm test`
- [ ] Run: `pnpm build`
- [ ] Manual testing of affected features

**Before Production**:
- [ ] All 9 issues resolved
- [ ] Load testing (rate limits effective)
- [ ] Cross-user access denied (RLS tested)
- [ ] API key not in browser (DevTools check)
- [ ] Injection attempts rejected (OWASP testing)

---

## PRODUCTION READINESS CHECKLIST

Do NOT deploy to production until:

**CRITICAL (Must-Have)**:
- [ ] Auth RLS re-enabled
- [ ] `NEXT_PUBLIC_INTERNAL_API_KEY` removed from client
- [ ] Dashboard table RLS enabled
- [ ] Input validation on all API routes
- [ ] Rate limiting active

**HIGH (Should-Have)**:
- [ ] JWT validation consistent across routes
- [ ] Audit logging implemented
- [ ] Error messages don't leak info

**MEDIUM (Nice-to-Have)**:
- [ ] Field encryption on PII
- [ ] CSRF protection
- [ ] Monitoring alerts

---

## QUICK START: PHASE 1 (TODAY)

```bash
# 1. Check current vulnerabilities
grep "DISABLE ROW LEVEL SECURITY" supabase/migrations/*
grep "NEXT_PUBLIC_INTERNAL_API_KEY" src -r

# 2. Create auth RLS fix
cat > supabase/migrations/20251220000001_fix_auth_rls.sql << 'EOF'
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own auth" ON auth.users
  FOR SELECT TO authenticated USING (auth.uid() = id);
EOF

# 3. Apply migration
supabase migration up

# 4. Verify
psql -c "SELECT * FROM pg_policies WHERE tablename = 'users';"

# 5. Start refactoring API key usage (in parallel)
# Edit: src/hooks/useNotificationEmail.ts
# Remove: const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
# Test: npm run dev
```

---

## DETAILED GUIDES

For full implementation details, see:
- **`SECURITY_IMPLEMENTATION_PLAN.md`** - Step-by-step for all 4 phases
- **`SECURITY_DUPLICATE_AUDIT.md`** - Conflict resolution & existing code analysis

---

## SUPPORT & QUESTIONS

| Question | Answer |
|----------|--------|
| Where do I find RLS policies? | Supabase → Database → Policies |
| How do I test RLS works? | Create 2 auth users, verify cross-access denied |
| Can I deploy with these issues? | 🔴 **NO** - Will be hacked within hours |
| How long will fixes take? | 8-17 hours across 4 weeks |
| Do I need to refactor my code? | Yes, but non-breaking (session auth already works) |

---

## FINAL RECOMMENDATION

**Priority**: 🔴 **CRITICAL - SECURITY IS BLOCKING PRODUCTION**

**Action**:
1. **TODAY**: Fix auth RLS (15 min)
2. **THIS WEEK**: Remove exposed API keys (2-3 hrs)
3. **NEXT WEEK**: Add validation, rate limiting (4-5 hrs)
4. **COMPLETE**: Run full security audit before launch

**Estimated Impact**: 
- Prevents: Data breach, API abuse, SQL injection, XSS
- Cost to delay: Potential regulatory fines (FERPA), reputation damage, legal liability
- Cost to fix: ~17 hours of development time

**Status**: ⏳ **Ready to implement whenever you give the go-ahead**

---

*See SECURITY_IMPLEMENTATION_PLAN.md for detailed technical guide with code examples.*
