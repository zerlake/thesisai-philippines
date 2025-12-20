# Security Audit - Action Items & Fixes

**Status:** Ready for Implementation  
**Priority:** Critical & High items require immediate attention

---

## 🔴 CRITICAL (Address within 24 hours)

### 1. Hardcoded Sentry DSN Exposure
**File:** `src/instrumentation-client.ts`  
**Action:**
```bash
# Remove hardcoded DSN
git rm --cached src/instrumentation-client.ts

# Add to .gitignore
echo "sentry.*.config.ts" >> .gitignore
```

**Code Fix:**
```typescript
// Before: Line 12 exposes DSN
const dsn = "https://d1e235fa48e5d919100103a13c0d2754@o4510045051748352.ingest.us.sentry.io/4510045132029952"

// After: Use environment variable
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
```

---

### 2. SQL Injection in Messages API
**File:** `src/app/api/messages/get/route.ts`  
**Lines:** 39, 53-55

**Vulnerable Code:**
```typescript
const queryUserId = params.get('userId') ?? '';
.or(`sender_id.eq.${queryUserId},recipient_id.eq.${queryUserId}`)
```

**Fix:**
```typescript
// Add UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!queryUserId.match(uuidRegex)) {
  return NextResponse.json(
    { error: 'Invalid user ID' },
    { status: 400 }
  );
}

// Use separate queries instead of .or() with interpolation
const [sent, received] = await Promise.all([
  supabase.from('messages').select('*').eq('sender_id', queryUserId),
  supabase.from('messages').select('*').eq('recipient_id', queryUserId),
]);

const messages = [...sent.data || [], ...received.data || []];
```

**Verification:**
```bash
# Test with attempted injection
curl "http://localhost:3000/api/messages/get?userId=invalid-uuid"
curl "http://localhost:3000/api/messages/get?userId=550e8400-e29b-41d4-a716-446655440000,sender_id.eq.*"
```

---

### 3. Exposed API Keys (OpenRouter & RevenueCat)
**Files:**
- `src/lib/openrouter-ai.ts` (Line 45)
- `src/lib/revenuecat.ts` (Line 9)

**Actions:**

#### A. OpenRouter API Key
```bash
# 1. Rotate key in OpenRouter dashboard
# 2. Create server-side wrapper API route
```

Create `src/app/api/ai/openrouter/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get API key from server-side env only
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Service misconfigured' },
      { status: 500 }
    );
  }

  const body = await request.json();
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await response.json());
}
```

Update `src/lib/openrouter-ai.ts`:
```typescript
// Remove: const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

// Instead call server API
export async function callOpenRouter(params: any) {
  const response = await fetch('/api/ai/openrouter', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}
```

#### B. RevenueCat API Key
```typescript
// Before: Hardcoded in src/lib/revenuecat.ts
const REVENUECAT_API_KEY = 'test_VwFWFtbcuwcFfKiaQsRVNbrCsVp';

// After: Use environment variable
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
if (!REVENUECAT_API_KEY) {
  throw new Error('REVENUECAT_API_KEY not configured');
}
```

**Checklist:**
- [ ] Rotate OpenRouter API key
- [ ] Rotate RevenueCat API key (marked as test key!)
- [ ] Create server-side wrapper for OpenRouter
- [ ] Update environment variables in .env.local
- [ ] Remove NEXT_PUBLIC_ prefix from both keys
- [ ] Test API calls work through server wrapper
- [ ] Deploy and monitor for errors

---

### 4. Anonymous Document Access
**File:** `supabase/migrations/50_allow_demo_documents.sql`  
**Action:**

Create migration: `supabase/migrations/60_remove_anonymous_access.sql`
```sql
-- Remove dangerous demo policies
DROP POLICY IF EXISTS "Demo allow insert unauthenticated" ON documents;
DROP POLICY IF EXISTS "Demo allow update unauthenticated" ON documents;
DROP POLICY IF EXISTS "Demo allow delete unauthenticated" ON documents;
DROP POLICY IF EXISTS "Demo allow select unauthenticated" ON documents;

-- Create demo user instead
INSERT INTO auth.users (
  id, email, email_confirmed_at, raw_user_meta_data
) VALUES (
  'a0000000-0000-0000-0000-000000000000',
  'demo@example.com',
  NOW(),
  '{}'
) ON CONFLICT DO NOTHING;

-- Allow demo user only
CREATE POLICY "Demo user read documents" ON documents
  FOR SELECT TO authenticated USING (
    user_id = 'a0000000-0000-0000-0000-000000000000'
    AND auth.jwt() ->> 'email' = 'demo@example.com'
  );

-- Audit: List who accessed documents with anon role
SELECT * FROM documents 
WHERE user_id = 'anon' OR user_id IS NULL;
```

**Implementation:**
```bash
# Apply migration
supabase migration up

# Verify no more anon access
psql $SUPABASE_DATABASE_URL -c "
SELECT count(*) FROM documents 
WHERE user_id LIKE '%anon%' OR user_id IS NULL;
"
```

---

## 🟠 HIGH (Address within 1 week)

### 5. Missing Authentication on Public Endpoints
**Endpoints to Secure:**
- `GET /api/papers`
- `POST /api/papers/search`
- `GET /api/arxiv-search`
- `GET /api/wiki/*`
- `GET /api/metrics/health`

**Template Fix:**
```typescript
// For each endpoint, add this at start of handler
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Verify authentication
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required' },
      { status: 401 }
    );
  }

  // Optional: Check user plan/tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .single();

  // Rest of handler...
}
```

**Verification:**
```bash
# Should return 401 without auth
curl -X GET http://localhost:3000/api/papers

# Should work with valid session
curl -X GET http://localhost:3000/api/papers \
  -H "Cookie: auth_token=valid_jwt_token"
```

---

### 6. Weak x-user-id Header Authentication
**Affected Files:**
- `src/app/api/users/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/documents/route.ts`
- `src/app/api/ai-tools/route.ts`

**Root Fix:**
Create utility function in `src/lib/auth-utils.ts`:
```typescript
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return null;
  }

  // Verify x-user-id header matches (if present)
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && headerUserId !== session.user.id) {
    // Log security incident
    console.warn(`User ID mismatch: header=${headerUserId}, session=${session.user.id}`);
    return null;
  }

  return session.user.id;
}
```

**Apply to All Affected Routes:**
```typescript
// Before
const userId = request.headers.get('x-user-id');
if (!userId) return 401;

// After
const userId = await getAuthenticatedUserId(request);
if (!userId) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

---

### 7. Error Message Information Disclosure
**Pattern:** Replace direct `error.message` with generic messages

**Find and Replace:**
```bash
# Find all instances
grep -r "error.message\|error.code\|error.details" src/app/api/ src/lib/api/

# Example files to fix
- src/app/api/papers/route.ts (Lines 49-50, 111-112)
- src/app/api/users/route.ts (Lines 104, 170)
- src/app/api/workflows/route.ts (Line 162)
```

**Fix Template:**
```typescript
// Before
catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: `Operation failed: ${error.message}` },
    { status: 500 }
  );
}

// After
catch (error) {
  // Log full error server-side
  console.error('Operation failed:', {
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    // Don't log message or stack trace
    timestamp: new Date().toISOString(),
  });

  // Return generic message
  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again later.' },
    { status: 500 }
  );
}
```

**Verification:**
```bash
# Run API and verify errors don't expose details
curl -X POST http://localhost:3000/api/papers \
  -H "Content-Type: application/json" \
  -d '{"invalid":"payload"}'
# Should return generic error, not DB details
```

---

### 8. Overly Permissive Advisor/Critic RLS
**File:** `supabase/migrations/27_advisor_critic_rls_policies.sql`

**Create Fix Migration:**
```sql
-- File: supabase/migrations/61_fix_advisor_rls.sql
DROP POLICY IF EXISTS "Advisors can view their advisor requests" ON advisor_requests;

-- Only show requests specifically assigned to this advisor
CREATE POLICY "Advisors can view assigned requests" ON advisor_requests
  FOR SELECT USING (
    advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Student can view own requests
CREATE POLICY "Students can view own requests" ON advisor_requests
  FOR SELECT USING (student_id = auth.uid());

-- Similarly for critic_requests
DROP POLICY IF EXISTS "Critics can view their critic requests" ON critic_requests;

CREATE POLICY "Critics can view assigned requests" ON critic_requests
  FOR SELECT USING (
    critic_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Test RLS
BEGIN;
  SET ROLE advisor_user_id;
  -- Should only see requests where advisor_email matches
  SELECT * FROM advisor_requests;
ROLLBACK;
```

---

## 🟡 MEDIUM (Address within 2 weeks)

### 9. Input Validation Schemas
**Create:** `src/lib/validation-schemas.ts`
```typescript
import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paperSearchSchema = z.object({
  q: z.string().min(1, 'Query required').max(500, 'Query too long'),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  fromYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  toYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
});

export const messageQuerySchema = z.object({
  userId: uuidSchema,
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export const documentSchema = z.object({
  fileName: z.string()
    .max(255)
    .regex(/^[a-zA-Z0-9._\-() ]+$/, 'Invalid filename'),
});

export const metricsSchema = z.object({
  region: z.enum(['us-east', 'us-west', 'eu-west', 'asia-pacific', 'unknown']),
  latency: z.number().min(0).max(100000),
  cacheHit: z.boolean().optional(),
  bytesServed: z.number().min(0).optional(),
  error: z.string().optional(),
});
```

**Apply to Routes:**
```typescript
// In each API route
import { paperSearchSchema } from '@/lib/validation-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = paperSearchSchema.parse(body);
    
    // Now params is safe
    const results = await searchPapers(params.q, params.limit);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }
    // ... handle other errors
  }
}
```

---

### 10. Enable RLS on All Tables
**Create Migration:** `supabase/migrations/62_enable_rls_all_tables.sql`
```sql
-- Enable RLS
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_analytics
CREATE POLICY "Users can view own analytics" ON ai_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics" ON ai_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics" ON ai_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for workflows
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own workflows" ON workflows
  FOR INSERT, UPDATE, DELETE USING (user_id = auth.uid());
```

---

### 11. Structured Logging
**Create:** `src/lib/logging.ts`
```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  endpoint?: string;
}

export class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): LogEntry {
    // In production, omit sensitive details
    if (!this.isDevelopment) {
      const safe = { ...entry };
      // Never log secrets, passwords, tokens
      delete (safe.context as any)?.password;
      delete (safe.context as any)?.token;
      delete (safe.context as any)?.apiKey;
      return safe;
    }
    return entry;
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    const entry = this.formatLog({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
    });
    console.log(JSON.stringify(entry));
  }

  error(message: string, context?: Record<string, any>, userId?: string) {
    const entry = this.formatLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
    });
    console.error(JSON.stringify(entry));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
    }));
  }
}

export const logger = new Logger();
```

**Replace console calls:**
```bash
# Find all console.log calls
grep -r "console\." src/app/api/ --include="*.ts"

# Replace with logger
# Before: console.log('error:', error)
# After: logger.error('Operation failed', { errorType: error?.name })
```

---

## 🟢 LOW (Ongoing)

### 12. Dynamic Function Whitelist
**Create:** `src/lib/function-registry.ts`
```typescript
const ALLOWED_FUNCTIONS = new Set([
  'paraphrase',
  'grammar-check',
  'citation-builder',
  'outline-generator',
  'topic-generator',
  'title-generator',
  // ... only explicitly allowed functions
]);

export function isAllowedFunction(functionName: string): boolean {
  return ALLOWED_FUNCTIONS.has(functionName);
}

export async function invokeAllowedFunction(
  functionName: string,
  payload: any
) {
  if (!isAllowedFunction(functionName)) {
    throw new Error(`Function not allowed: ${functionName}`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return supabase.functions.invoke(functionName, { body: payload });
}
```

---

### 13. Weekly Security Audit
**Add to CI/CD:**
```bash
# Create: .github/workflows/security-audit.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk scan
        run: |
          npm install -g snyk
          snyk auth ${{ secrets.SNYK_TOKEN }}
          snyk test
```

---

## Implementation Timeline

```
Week 1:
  Monday: CRITICAL fixes (Sentry DSN, API keys, SQL injection)
  Wednesday: HIGH fixes (auth on public endpoints, error handling)
  Friday: Testing and verification

Week 2-3:
  MEDIUM priority fixes (RLS, validation, logging)
  
Week 4+:
  LOW priority improvements
  Regular audits and monitoring
```

---

## Testing Checklist

```bash
# After each fix, run:

# 1. Unit tests
pnpm test -- --run

# 2. Lint
pnpm lint

# 3. Type check
pnpm exec tsc --noEmit

# 4. Build
pnpm build

# 5. Manual integration test
pnpm dev

# 6. Security test
curl -X GET http://localhost:3000/api/papers  # Should fail 401
curl -X GET http://localhost:3000/api/messages/get?userId=invalid-uuid  # Should fail 400
```

---

## Monitoring After Deployment

```bash
# Watch for security-related events
- Failed authentication attempts (should spike initially, then normalize)
- Rejected API requests (invalid parameters)
- Error rate changes (should stay similar)
- API latency (might increase from added validation)
```

---

**Next Steps:**
1. Create security-fixes branch
2. Implement CRITICAL items first
3. Test thoroughly in staging
4. Deploy with monitoring
5. Keep this document updated

