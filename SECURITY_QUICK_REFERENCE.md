# Security Audit - Quick Reference Guide

**Companion to:** COMPREHENSIVE_SECURITY_AUDIT.md  
**For Implementation:** See SECURITY_AUDIT_ACTION_ITEMS.md

---

## 🔴 Critical Issues (Fix Today)

| Issue | File | Impact | Status |
|-------|------|--------|--------|
| Hardcoded Sentry DSN | `src/instrumentation-client.ts:12` | Monitoring credentials exposed | **UNFIXED** |
| SQL Injection | `src/app/api/messages/get/route.ts:53-55` | Attacker can access any user's messages | **UNFIXED** |
| Exposed API Keys | `src/lib/openrouter-ai.ts`, `src/lib/revenuecat.ts` | API compromise, billing fraud | **UNFIXED** |
| Anonymous DB Access | `supabase/migrations/50_allow_demo_documents.sql` | Anyone can delete/modify documents | **UNFIXED** |

**Quick Fix Commands:**
```bash
# 1. Rotate secrets
# - Regenerate Sentry DSN in Sentry dashboard
# - Regenerate OpenRouter API key
# - Regenerate RevenueCat API key

# 2. Remove from code
git rm --cached src/instrumentation-client.ts
echo "*.config.ts" >> .gitignore

# 3. Fix SQL injection
# Add UUID validation to messages API route

# 4. Remove anonymous access
# Create migration to drop demo RLS policies
```

---

## 🟠 High Priority Issues (Fix This Week)

| # | Category | Count | Files | Action |
|---|----------|-------|-------|--------|
| 5 | Missing Auth | 6+ | `papers/`, `arxiv-search/`, `wiki/` | Add session check |
| 6 | Weak Auth Header | 4+ | `users/`, `projects/`, `documents/` | Verify against session |
| 7 | No RBAC | 3+ | Admin endpoints | Add role checks |
| 8 | Broad RLS | 2 | Advisor/critic requests | Narrow access |
| 9 | SSRF Risk | 1 | `papers/unlock/` | Validate DOI/URL |
| 10 | Missing CORS | 6+ | Paper/wiki APIs | Add headers |
| 11 | Exposed API Key | 1 | `notifications/send-*` | Use session auth |
| 12 | Header Spoofing | 4+ | Various | Replace with session |

**Template Fix:**
```typescript
// Before
const userId = request.headers.get('x-user-id');

// After
const supabase = await createServerSupabaseClient();
const { data: { session } } = await supabase.auth.getSession();
if (!session) return 401;
const userId = session.user.id;
```

---

## 🟡 Medium Priority (Fix in 2 Weeks)

| Category | Count | Impact | Effort |
|----------|-------|--------|--------|
| Error Leakage | 18+ | Info disclosure | 2 hours |
| Unsafe JSON | 13+ | Crashes, logic errors | 3 hours |
| Input Validation | 6+ | Type confusion | 4 hours |
| Missing RLS | 2 tables | Cross-user access | 2 hours |
| Path Traversal | 2 | File access | 2 hours |
| Console Logging | 50+ | Log exposure | 3 hours |
| Dynamic Functions | 4+ | Unauth invocation | 2 hours |

---

## File Priority List

### 🔴 CRITICAL - Fix First
```
src/instrumentation-client.ts                  Hardcoded DSN
src/app/api/messages/get/route.ts             SQL injection
src/lib/openrouter-ai.ts                       Exposed API key
src/lib/revenuecat.ts                         Hardcoded key
supabase/migrations/50_allow_demo_documents.sql Unsafe RLS
```

### 🟠 HIGH - Fix Second
```
src/app/api/papers/route.ts                   No auth
src/app/api/users/route.ts                    Weak auth
src/app/api/documents/route.ts                Unsanitized filename
src/app/api/papers/unlock/route.ts            SSRF risk
src/app/api/arxiv-search/route.ts             No auth
src/app/api/wiki/[slug]/route.ts              Path traversal
src/app/api/wiki/route.ts                     No auth
supabase/migrations/27_advisor_critic_rls_policies.sql  Broad access
```

### 🟡 MEDIUM - Fix Third
```
src/app/api/papers/search/route.ts            Error leakage
src/app/api/notifications/send-*-email/route.ts  API key, error leakage
src/app/api/study-guides/route.ts             Error leakage
src/lib/realtime-server.ts                    Unsafe JSON
src/lib/puter-sdk.ts                         Unsafe JSON
src/lib/dashboard/realtime-state.ts           Prototype pollution
src/lib/ai/research-gap-analyzer.ts           Unsafe JSON
src/app/api/zotero/import/route.ts            Error leakage
```

---

## Implementation Checklist

### Day 1: Critical Fixes
- [ ] Remove Sentry DSN from code
- [ ] Move API keys to env variables
- [ ] Fix SQL injection with UUID validation
- [ ] Audit anonymous document access
- [ ] Rotate all exposed keys

### Day 2-3: High Priority Auth
- [ ] Add auth to `/api/papers`
- [ ] Add auth to `/api/papers/search`
- [ ] Add auth to `/api/arxiv-search`
- [ ] Add auth to `/api/wiki/*`
- [ ] Replace x-user-id with session verification in 4+ routes
- [ ] Add role checks to admin endpoints

### Day 4-5: Error Handling & Validation
- [ ] Implement generic error responses (hide details)
- [ ] Create input validation schemas
- [ ] Fix SSRF in paper unlock
- [ ] Fix path traversal in wiki
- [ ] Add CORS headers

### Week 2: Database & Logging
- [ ] Enable RLS on ai_analytics table
- [ ] Enable RLS on workflows table
- [ ] Fix advisor/critic RLS policies
- [ ] Implement structured logging
- [ ] Remove 50+ console.log calls

### Week 3: Polish
- [ ] Whitelist dynamic function invocation
- [ ] Audit all external API calls
- [ ] Add rate limiting
- [ ] Setup security monitoring
- [ ] Run full test suite

---

## Testing Commands

```bash
# Test unauthenticated access (should fail)
curl http://localhost:3000/api/papers
# Expected: 401 Unauthorized

# Test SQL injection (should fail)
curl "http://localhost:3000/api/messages/get?userId=test,sender_id.eq.*"
# Expected: 400 Bad Request

# Test error handling (should be generic)
curl -X POST http://localhost:3000/api/papers \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
# Expected: Generic error, no DB details

# Test authentication with session
curl -H "Cookie: auth_token=VALID_JWT" http://localhost:3000/api/papers
# Expected: 200 OK with data

# Test path traversal (should fail)
curl http://localhost:3000/api/wiki/../../etc/passwd
# Expected: 400 Bad Request
```

---

## Quick Grep Commands

Find issues in your code:

```bash
# Find hardcoded secrets
grep -r "api.key\|API_KEY" src/ --exclude-dir=node_modules
grep -r "password\|PASSWORD" src/ --exclude-dir=node_modules
grep -r "token\|TOKEN" src/ --include="*.ts" | grep -v process.env

# Find error message exposures
grep -r "error.message\|error.code" src/app/api/
grep -r "console.error\|console.log" src/app/api/

# Find missing auth checks
grep -r "export async function GET\|export async function POST" src/app/api/ | \
  grep -v "session\|getAuthenticatedUser\|requireRole"

# Find unsafe JSON parsing
grep -r "JSON.parse" src/ | grep -v "try"
grep -r "JSON.parse" src/lib/

# Find SQL/query operations
grep -r "\.or\(\|\.raw\(" src/app/api/
grep -r "INSERT INTO\|UPDATE\|DELETE" src/
```

---

## Key Security Functions

### Create in `src/lib/auth-utils.ts`
```typescript
export async function getAuthenticatedUserId(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function requireRole(request: NextRequest, role: string) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return null;
  
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return profile?.role === role ? userId : null;
}
```

### Create in `src/lib/validation-schemas.ts`
```typescript
import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const paperSearchSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).optional(),
});
export const metricsSchema = z.object({
  region: z.enum(['us-east', 'us-west', 'eu-west', 'asia-pacific']),
  latency: z.number().min(0).max(100000),
});
```

---

## Monitoring Queries

### Check for SQL injection attempts
```sql
-- Monitor messages API for unusual patterns
SELECT * FROM audit_logs 
WHERE endpoint = '/api/messages/get' 
AND user_agent LIKE '%curl%' 
AND timestamp > NOW() - INTERVAL 1 HOUR;
```

### Check for auth failures
```sql
-- Monitor failed auth attempts
SELECT user_id, COUNT(*) as failures, MAX(timestamp) as last_attempt
FROM audit_logs
WHERE event_type = 'auth_failure'
AND timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### Check for document access anomalies
```sql
-- Monitor for bulk document access
SELECT user_id, COUNT(*) as access_count, MAX(timestamp)
FROM audit_logs
WHERE endpoint LIKE '/api/documents%'
AND timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY user_id
HAVING COUNT(*) > 50;
```

---

## Resources

**OWASP Top 10 2021:**
- A01: Broken Access Control
- A02: Cryptographic Failures  
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Authentication Failures
- A08: Data Integrity Failures
- A09: Logging & Monitoring
- A10: SSRF

**Common Weakness Enumeration (CWE):**
- CWE-639: Authentication Bypass
- CWE-306: Missing Auth Check
- CWE-89: SQL Injection
- CWE-22: Path Traversal
- CWE-400: Uncontrolled Resource Consumption
- CWE-20: Improper Input Validation

**Standards:**
- https://owasp.org/www-project-top-ten/
- https://cwe.mitre.org/top25/
- https://cheatsheetseries.owasp.org/

---

## Summary

**Documents Generated:**
1. ✅ COMPREHENSIVE_SECURITY_AUDIT.md (2500+ lines, all details)
2. ✅ SECURITY_AUDIT_ACTION_ITEMS.md (1200+ lines, step-by-step)
3. ✅ SECURITY_FIXES_SUMMARY.md (existing, 6 items fixed)
4. ✅ SECURITY_AUDIT_SUMMARY.txt (quick overview)
5. ✅ SECURITY_QUICK_REFERENCE.md (this file)

**What to Do:**
1. Read COMPREHENSIVE_SECURITY_AUDIT.md to understand issues
2. Use SECURITY_AUDIT_ACTION_ITEMS.md for implementation
3. Follow implementation timeline
4. Run tests and deploy to staging first
5. Monitor carefully after production deployment

**Next Step:** Create security-fixes branch and start with CRITICAL items
