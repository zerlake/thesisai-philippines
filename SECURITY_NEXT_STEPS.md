# 🚀 Security Implementation - Next Steps

**Current Status**: Phase 1 (Critical) ✅ COMPLETE  
**Time Spent**: ~45 minutes  
**Next Phase**: Phase 2 (Foundational) - 4-5 hours

---

## Immediate Actions (Next 30 minutes)

### 1. Verify Build (5 min)
```bash
cd c:\Users\Projects\thesis-ai-fresh
pnpm build
```
**Expected**: Build succeeds with no errors related to security changes

### 2. Run Tests (10 min)
```bash
pnpm test -- --run
```
**Expected**: All tests pass (existing tests should not be affected)

### 3. Run Lint (5 min)
```bash
pnpm lint
```
**Expected**: No ESLint errors in new files

### 4. Quick Security Verification (10 min)
```bash
# Verify API key is removed
grep -r "NEXT_PUBLIC_INTERNAL_API_KEY" src/ || echo "✅ API key successfully removed"

# Check input validation exists
test -f src/lib/input-validator.ts && echo "✅ Input validator exists"

# Check rate limiter exists
test -f src/lib/rate-limiter.ts && echo "✅ Rate limiter exists"
```

---

## Phase 2: Foundational Security (4-5 hours)

When ready, implement:

### 2.1 JWT Validation Middleware (1-2 hours)
Create `src/lib/jwt-validator.ts`:
```typescript
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return { success: true, payload: verified.payload };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Usage in API routes:
const token = request.headers.get('authorization')?.split(' ')[1];
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { success, payload } = await verifyJWT(token);
```

### 2.2 Audit Logging (3 hours)
Create `src/lib/audit-logger.ts`:
```typescript
// Log all sensitive operations:
// - API calls with user ID
// - Failed auth attempts
// - Data access patterns
// - Admin actions

export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  details: Record<string, unknown>
) {
  // Insert into audit_log table
}
```

---

## Phase 3-4: Hardening (5-7 hours, OPTIONAL)

When Phase 2 is stable:

### 3.1 Field-Level Encryption (2-3 hours)
- Encrypt PII fields (emails, phone numbers)
- Use `crypto` module or bcrypt
- Document decryption keys

### 3.2 CSRF Protection (1 hour)
- Add CSRF token validation
- Use `csurf` package

### 3.3 Monitoring & Alerts (2 hours)
- Setup rate limit alerts
- Track failed auth attempts
- Monitor for injection patterns

---

## Files to Reference

| File | Purpose | Location |
|------|---------|----------|
| Security START HERE | Overall guide | `SECURITY_START_HERE.md` |
| Phase 1 Complete | What was done | `SECURITY_PHASE1_IMPLEMENTATION_COMPLETE.md` |
| Input Validator | Validation schemas | `src/lib/input-validator.ts` |
| Rate Limiter | Limiting utility | `src/lib/rate-limiter.ts` |
| Quick Reference | Copy-paste code | `SECURITY_QUICK_REFERENCE.md` |
| Implementation Plan | Full technical guide | `SECURITY_IMPLEMENTATION_PLAN.md` |

---

## API Routes Updated

### `/api/messages/send`
- ✅ Zod validation on all fields
- ✅ Rate limiting: 60/min per user
- ✅ UUID validation
- ✅ Message length limits (1-5000 chars)

### `/api/paper-search` (GET & POST)
- ✅ Zod validation on query
- ✅ Rate limiting: 100/min per user
- ✅ Max query length: 500 chars
- ✅ Result limits: 1-100 per request

---

## Database Status

### ✅ Properly Secured
- `auth.users` - RLS enabled (Phase 1)
- `dashboard_layouts` - RLS + policies
- `widget_data_cache` - RLS + policies
- `widget_settings` - RLS + policies
- `user_dashboard_preferences` - RLS + policies
- `dashboard_activity_log` - RLS + policies

### ⏳ TODO (Phase 2)
- Create `audit_log` table for logging
- Add audit policies if needed

---

## Deployment Checklist

Before deploying to production:

```
PHASE 1 (CRITICAL):
✅ Auth RLS enabled
✅ API key removed from client
✅ Dashboard RLS enabled
✅ Input validation on API routes
✅ Rate limiting implemented

BEFORE DEPLOY:
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm test` successfully
- [ ] Run `pnpm lint` successfully
- [ ] Test rate limiting manually (65 rapid requests should get 429s)
- [ ] Test input validation (invalid JSON should get 400s)
- [ ] Test cross-user access (should get 403)
- [ ] Deploy to staging
- [ ] Run end-to-end tests
- [ ] Deploy to production

PHASE 2 (OPTIONAL, CAN DO LATER):
- [ ] JWT middleware
- [ ] Audit logging
```

---

## Questions?

**If input validation fails**: Check `src/lib/input-validator.ts` for schema definitions

**If rate limiting not working**: Check `src/lib/rate-limiter.ts` - verify it's imported in routes

**If build fails**: Run `pnpm install` to ensure Zod is installed

**If tests fail**: Existing tests should still pass; check for imports of modified files

---

## Summary

✅ **What's Done**: 5 critical vulnerabilities fixed (Auth RLS, API key, validation, rate limiting)  
⏳ **What's Next**: Build verification → Tests → Phase 2 (JWT + Audit)  
🎯 **Timeline**: 30 min verification + 4-5 hours Phase 2 (optional)

**Ready to proceed?** Run the verification steps above.
