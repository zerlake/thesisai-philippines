# Security Vulnerabilities Audit Report

## CRITICAL VULNERABILITIES (Fix Immediately)

### 1. Email Notification Endpoints - Unauthenticated Email Injection
**Files:** `src/app/api/notifications/send-*.ts` (all 4 files)
**Severity:** CRITICAL
**Issue:** API key verification is disabled (TODO comment at line 21-29)
- Any unauthenticated user can send emails
- Can spam users with arbitrary messages
- Can be used for phishing/social engineering attacks

**Fix Required:**
```typescript
// BEFORE: Commented out
// const apiKey = request.headers.get('x-api-key');
// if (apiKey !== process.env.INTERNAL_API_KEY) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }

// AFTER: Enabled
const apiKey = request.headers.get('x-api-key');
if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
  return NextResponse.json(
    { error: 'Unauthorized - API key required' },
    { status: 401 }
  );
}
```

### 2. Logs Endpoint - No Authentication for Sensitive Data Access
**File:** `src/app/api/logs/route.ts`
**Severity:** CRITICAL
**Issues:**
- GET: No authentication to read all system logs (security events, errors, user activity)
- POST: Any unauthenticated user can write arbitrary logs (log injection/manipulation)
- DELETE: No authentication to delete logs (evidence destruction)
- Logs contain user_id, IP address, stack traces - sensitive data

**Fix Required:**
- Add session verification to all methods
- Validate user can only access their own logs (or be admin)
- Add rate limiting on POST
- Add admin-only check on DELETE

### 3. Logs POST Endpoint - Log Injection
**File:** `src/app/api/logs/route.ts` (lines 4-38)
**Severity:** HIGH
**Issue:** No validation on log message format - attacker can inject:
```json
{
  "logs": [
    {
      "message": ""; DROP TABLE logs; --",
      "userId": "admin-user",
      "level": "critical"
    }
  ]
}
```
While RLS might protect, this allows log tampering and misinformation.

### 4. Admin Seed Endpoint - No Admin Verification
**File:** `src/app/api/admin/seed-demo-docs/route.ts`
**Severity:** CRITICAL
**Issue:** 
- Line 43: "no auth needed" comment
- No verification that caller is actually an admin
- Any user can seed documents for any userId
- Uses service role key without authorization check

**Fix Required:** Add admin role verification

### 5. Papers Unlock Endpoint - SSRF Vulnerability
**File:** `src/app/api/papers/unlock/route.ts`
**Severity:** HIGH
**Issue:**
- No user authentication required
- Can be abused to:
  - Make arbitrary HTTP requests to any domain (SSRF)
  - Probe internal network
  - DDoS attack vector against Sci-Hub or other sites
  - Extract content from any site and return it

**Example Attack:**
```bash
curl -X POST http://localhost:3000/api/papers/unlock \
  -H "Content-Type: application/json" \
  -d '{"doi": "10.1234/example.pdf"}' 
# Attacker can probe internal network or make attacks appear to come from your server
```

### 6. Messages GET Endpoint - Unvalidated Parameters
**File:** `src/app/api/messages/get/route.ts`
**Severity:** HIGH
**Issue:** Accepts unvalidated query parameters directly in database queries:
- `userId` - not verified
- `documentId` - not verified  
- `recipientId` - not verified
- No session verification
- No ownership checks

---

## HIGH SEVERITY VULNERABILITIES

### 7. Wiki Debug Endpoint - Information Disclosure
**File:** `src/app/api/wiki/debug/route.ts`
**Severity:** HIGH
**Issue:** Exposes internal filesystem paths

### 8. Wiki Slug Endpoint - Path Traversal (Partial)
**File:** `src/app/api/wiki/[slug]/route.ts`
**Severity:** MEDIUM
**Issue:** While it checks for ".." and "/", modern attacks might bypass:
```
../../secret-file
%2e%2e/secret-file
/absolute/path/file
```

### 9. Metrics Endpoint - No Authentication
**File:** `src/app/api/metrics/route.ts`
**Severity:** MEDIUM
**Issues:**
- POST: Any user can record arbitrary metrics
- GET: Exposes CDN performance data without authentication
- Can be abused for DoS (metric spam)

### 10. Document Save - Unauthenticated Fallback
**File:** `src/app/api/documents/save/route.ts`
**Severity:** MEDIUM
**Issue:** Falls back to demo user "demo-user-123456" when unauthenticated
- Allows unsecured document persistence
- Demo documents could persist and be accessed

### 11. Realtime Endpoint - Unauthenticated Access
**File:** `src/app/api/realtime/route.ts`
**Severity:** MEDIUM
**Issue:** Explicitly allows unauthenticated access to WebSocket endpoint info

### 12. AI Tools - Incomplete Permission Checks
**File:** `src/app/api/ai-tools/[toolId]/route.ts`
**Severity:** MEDIUM
**Issues:**
- Line 85: Comment states "check for admin privileges" but not implemented
- Line 349: `checkCollaborationAccess` returns hardcoded `true`
- Users might access restricted tools

### 13. Demo Login - No Validation
**File:** `src/app/api/auth/demo-login/route.ts`
**Severity:** MEDIUM
**Issue:** Creates users based on email patterns without proper validation
- Uses admin client without checking request authorization
- Could allow unauthorized user creation

### 14. Semantic Scholar & OpenAlex Search - No Rate Limiting
**File:** `src/app/api/semantic-scholar-search/route.ts`, `src/app/api/openalex-search/route.ts`
**Severity:** MEDIUM
**Issue:**
- No user authentication
- No upper bounds on `limit` parameter
- Could be abused for DoS
- No rate limiting

### 15. Thesis Feedback - Unvalidated Query Parameters
**File:** `src/app/api/thesis-feedback/route.ts`
**Severity:** MEDIUM
**Issue:** 
- `documentId`, `section`, `limit`, `offset` not validated
- No owner verification

### 16. Personalization Endpoints - Insufficient Scope Validation
**File:** `src/app/api/personalization/preferences/[section]/route.ts`
**Severity:** MEDIUM
**Issue:** `section` parameter not validated against allowed values

### 17. Dashboard Batch Operations - No Rate Limiting
**File:** `src/app/api/dashboard/widgets/batch/route.ts`
**Severity:** MEDIUM
**Issue:**
- Only limits to 50 widgets
- No per-user rate limits
- Could cause resource exhaustion

---

## SUMMARY OF FIXES NEEDED

1. ✅ DONE: `/api/documents/submit` - Added auth + ownership check
2. ✅ DONE: `/api/messages/send` - Added auth + sender verification  
3. ✅ DONE: `/api/seed-documents` - Added auth + scope check
4. **NEXT:** `/api/notifications/send-*` - Uncomment API key checks
5. **NEXT:** `/api/admin/seed-demo-docs` - Add admin role verification
6. **NEXT:** `/api/logs` - Add authentication to all methods
7. **NEXT:** `/api/papers/unlock` - Add authentication + rate limiting
8. **NEXT:** `/api/messages/get` - Add auth + validation
9. **TODO:** `/api/wiki` endpoints - Improve path traversal checks
10. **TODO:** `/api/metrics` - Add authentication
11. **TODO:** `/api/documents/save` - Remove demo fallback or protect it
12. **TODO:** `/api/realtime` - Add authentication
13. **TODO:** `/api/ai-tools` - Implement missing permission checks
14. **TODO:** `/api/auth/demo-login` - Add validation
15. **TODO:** Search endpoints - Add rate limiting
16. **TODO:** Query endpoints - Add validation
17. **TODO:** Personalization - Validate section parameter
18. **TODO:** Batch operations - Add rate limiting
