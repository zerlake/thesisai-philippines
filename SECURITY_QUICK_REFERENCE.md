# Security Implementation: Quick Reference Card

**Print This** - Keep open during implementation

---

## CRITICAL VULNERABILITIES (Fix Today)

### 1. Auth RLS Disabled
```bash
# CHECK
grep "DISABLE ROW LEVEL SECURITY" supabase/migrations/20251219152120*

# FIX
rm supabase/migrations/20251219152120_disable_rls_on_auth_users.sql
# OR create corrective migration that enables it
supabase migration up

# VERIFY
SELECT rowsecurity FROM pg_tables WHERE tablename = 'users';
-- Should show: true
```

### 2. Exposed API Key (19 files)
```bash
# FIND
grep -r "NEXT_PUBLIC_INTERNAL_API_KEY" src/

# FILES TO UPDATE
src/hooks/useNotificationEmail.ts
src/hooks/useStudentNotificationEmail.ts
src/hooks/useAdvisorNotificationEmail.ts
src/hooks/useCriticNotificationEmail.ts
src/components/notification-bell.tsx
# +14 more

# BEFORE
const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
fetch('/api/notifications/send-email', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});

# AFTER
fetch('/api/notifications/send-email', {
  method: 'POST',
  body: JSON.stringify({ recipients })
});

# REMOVE FROM .env.local
# NEXT_PUBLIC_INTERNAL_API_KEY=xxx  ← Delete this line
```

### 3. Dashboard Tables Missing RLS
```sql
-- CHECK
SELECT tablename FROM pg_tables 
WHERE tablename LIKE 'dashboard_%' OR tablename LIKE 'widget_%';

SELECT * FROM pg_policies 
WHERE tablename IN ('dashboard_layouts', 'widget_data_cache', 'widget_settings', 'user_dashboard_preferences', 'dashboard_activity_log');

-- Should show multiple policies per table
-- If empty, apply migration below

-- FIX: Create migration 20251220_add_rls_dashboard_tables.sql
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_layouts_users_select" ON dashboard_layouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts_users_insert" ON dashboard_layouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts_users_update" ON dashboard_layouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts_users_delete" ON dashboard_layouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Repeat for: widget_data_cache, widget_settings, user_dashboard_preferences, dashboard_activity_log
```

---

## PHASE 1 FILES (Week 1)

### Create These:
1. **`supabase/migrations/20251220_add_rls_dashboard_tables.sql`**
   - Enable RLS on 5 tables
   - Add SELECT, INSERT, UPDATE, DELETE policies

### Modify These:
1. **19 hook/component files** - Remove `NEXT_PUBLIC_INTERNAL_API_KEY`
2. **`.env.local`** - Remove INTERNAL_API_KEY line
3. **API routes** - Add input validation

### Delete This:
1. **`supabase/migrations/20251219152120_disable_rls_on_auth_users.sql`** (or convert)

---

## PHASE 2 FILES (Week 2)

### Create These:
1. **`src/lib/input-validator.ts`**
```typescript
import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Required')
    .max(500, 'Too long')
    .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\"\']+$/, 'Invalid chars'),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '').replace(/--/g, '');
}
```

2. **`src/lib/rate-limiter.ts`**
```typescript
// In-memory rate limiter
const store = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now();
  const entry = store.get(key);
  
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
```

3. **`src/lib/auth-middleware.ts`**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function verifyAuth(req: Request) {
  const supabase = createServerComponentClient({ 
    cookies: () => cookies() 
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  return { session, userId: session.user.id };
}
```

### Modify These:
1. **5+ API routes** - Apply input validation
```typescript
import { searchQuerySchema } from '@/lib/input-validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = searchQuerySchema.parse(body);
    // Use validated...
  } catch (error) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

2. **All API routes** - Apply rate limiting
```typescript
import { rateLimit } from '@/lib/rate-limiter';

if (!await rateLimit(userId, 60)) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

3. **All API routes** - Apply JWT validation
```typescript
import { verifyAuth } from '@/lib/auth-middleware';

const auth = await verifyAuth(req);
if (auth.error) {
  return Response.json({ error: auth.error }, { status: auth.status });
}
```

---

## PHASE 3 FILES (Week 3)

### Create:
1. **`supabase/migrations/20251221_add_pgcrypto_encryption.sql`**
2. **`supabase/migrations/20251221_add_audit_logging.sql`**

---

## PHASE 4 FILES (Week 4)

### Create:
1. **`src/lib/security-monitoring.ts`**
2. **`src/middleware.ts`** (CSRF protection)

---

## TESTING COMMANDS

### Check RLS Status
```bash
# Enable on table
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('dashboard_layouts', 'widget_data_cache', 'users');

# Count policies
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
GROUP BY tablename 
ORDER BY tablename;
```

### Check API Key Exposure
```bash
grep -r "NEXT_PUBLIC_INTERNAL_API_KEY" src/ --include="*.ts" --include="*.tsx"
# Should return 0 results after fix

grep "NEXT_PUBLIC_INTERNAL_API_KEY" .env.local
# Should return 0 or not found
```

### Test Input Validation
```bash
# SQL injection attempt - should be rejected
curl -X POST http://localhost:3000/api/papers/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test; DROP TABLE users;--"}'
# Expected: 400 Bad Request

# Normal request - should work
curl -X POST http://localhost:3000/api/papers/search \
  -H "Content-Type: application/json" \
  -d '{"query":"machine learning"}'
# Expected: 200 OK
```

### Test Rate Limiting
```bash
# Spam 70 requests
for i in {1..70}; do
  curl http://localhost:3000/api/papers/search?q=test
done
# Last 10 should return 429 Too Many Requests
```

### Test RLS (Cross-User Access)
```sql
-- As User A logged in
SELECT * FROM dashboard_layouts;
-- Should only return User A's layouts

-- Try to access User B's layout directly
SELECT * FROM dashboard_layouts WHERE user_id = 'user-b-id';
-- Should return 0 rows (RLS blocks it)
```

### Test Auth Requirement
```bash
# Without session
curl http://localhost:3000/api/admin/audit-logs
# Expected: 401 Unauthorized

# With session
curl -H "Cookie: auth=valid_session_token" \
  http://localhost:3000/api/admin/audit-logs
# Expected: 200 OK (if admin) or 403 Forbidden (if not)
```

---

## GIT WORKFLOW

```bash
# Create feature branch
git checkout -b security/phase-1-critical

# Commit each fix
git add supabase/migrations/20251220_add_rls_dashboard_tables.sql
git commit -m "security: enable RLS on dashboard tables"

git add src/hooks/
git commit -m "security: remove exposed API key, use session auth"

# Push when ready
git push origin security/phase-1-critical

# Create PR for review before merging to main
```

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Pre-deployment
[ ] pnpm lint
[ ] pnpm build
[ ] pnpm test

# 2. Database
[ ] supabase migration up
[ ] Verify RLS enabled: SELECT rowsecurity FROM pg_tables;
[ ] Verify policies: SELECT * FROM pg_policies;

# 3. Environment
[ ] SUPABASE_SERVICE_ROLE_KEY set in Vercel secrets
[ ] Remove NEXT_PUBLIC_INTERNAL_API_KEY from secrets
[ ] Verify no secrets in .env.local committed

# 4. Testing
[ ] Cross-user access test passed
[ ] Rate limiting test passed
[ ] Input validation test passed
[ ] API key not in browser (DevTools check)

# 5. Deploy
git merge --no-ff security/phase-1-critical
# Trigger CI/CD pipeline
```

---

## EMERGENCY: SECURITY INCIDENT

If hacked before fixes:

```bash
# 1. IMMEDIATE: Rotate all secrets
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Rotate in Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY        # Rotate in Supabase
INTERNAL_API_KEY                 # Disable this endpoint
OPENROUTER_API_KEY               # Rotate
RESEND_API_KEY                   # Rotate

# 2. Check audit logs
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

# 3. Disable affected account
UPDATE auth.users SET email_confirmed_at = NULL 
WHERE email = 'hacked@example.com';

# 4. Notify users
Send security advisory to all users

# 5. Enable all fixes immediately
Apply all Phase 1-4 migrations
```

---

## QUESTIONS DURING IMPLEMENTATION?

| Q | A |
|---|---|
| Do I need to migrate existing data? | No, RLS is prospective |
| Will this break existing users? | No, only enforces what should be |
| Can I test locally first? | Yes, create test users in dev DB |
| How do I rollback? | `supabase migration down` or restore from backup |
| Do I need to modify frontend? | Only remove API key usage, otherwise compatible |

---

## NEXT STEPS

1. **Right Now**: Read SECURITY_EXECUTIVE_SUMMARY.md
2. **Next 15 min**: Fix auth.users RLS (fastest win)
3. **Next 2-3 hrs**: Remove exposed API key
4. **Next 1 hr**: Add RLS to dashboard tables
5. **Next week**: Validation, rate limiting, JWT
6. **Deploy when**: All 9 issues resolved

**Estimated Timeline**: 13-17 hours over 4 weeks
**Status**: Ready to start whenever you say go

---

*Full guides: SECURITY_IMPLEMENTATION_PLAN.md (technical), SECURITY_DUPLICATE_AUDIT.md (conflicts)*
