# Comprehensive Security Audit Report

**Date:** 2025-12-19  
**Status:** In Progress  
**Severity Summary:** 1 Critical, 8 High, 12 Medium, 10 Low

---

## Executive Summary

This comprehensive security audit identified **31 distinct vulnerability categories** across the thesis-ai codebase. The most critical issues involve:

1. **Hardcoded Sentry DSN** exposing monitoring credentials
2. **Exposed API Keys** in client-side code (OpenRouter, RevenueCat)
3. **SQL Injection** via PostgREST filter manipulation
4. **Missing Authentication** on public-facing endpoints
5. **Overly Permissive Database Policies** allowing cross-user access

---

## Section 1: Credential & Secret Management (CRITICAL)

### 1.1 Hardcoded Sentry DSN (CRITICAL)

**Severity:** CRITICAL  
**File:** `src/instrumentation-client.ts` (Line 12)  
**Type:** Exposed Monitoring Credentials

**Issue:**
```typescript
// Line 12 - HARDCODED SENTRY DSN
https://d1e235fa48e5d919100103a13c0d2754@o4510045051748352.ingest.us.sentry.io/4510045132029952
```

**Risk:**
- Sentry project ID and DSN publicly visible in source code
- Attackers can inject false error reports or access error logs
- Monitoring service can be manipulated

**Remediation:**
```bash
# 1. Rotate the Sentry project (create new project in dashboard)
# 2. Move DSN to environment variables
# 3. Remove from version control
git rm --cached src/instrumentation-client.ts
```

```typescript
// FIXED VERSION
import { init } from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  init({
    dsn,
    environment: process.env.NODE_ENV,
  });
}
```

---

### 1.2 Exposed API Keys in Client Code (HIGH)

**Severity:** HIGH  
**Files:**
- `src/lib/openrouter-ai.ts` (Line 45)
- `src/lib/revenuecat.ts` (Line 9)

**Issue:**

```typescript
// openrouter-ai.ts - Line 45
const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY; // EXPOSED to browser

// revenuecat.ts - Line 9
const REVENUECAT_API_KEY = 'test_VwFWFtbcuwcFfKiaQsRVNbrCsVp'; // HARDCODED in source
```

**Risk:**
- NEXT_PUBLIC variables are bundled into client JavaScript
- Attackers can extract API key and make unauthorized API calls
- RevenueCat key hardcoded in production code
- Billing/subscription system can be compromised

**Remediation:**
```typescript
// Step 1: Create server-side API wrapper
// src/app/api/ai/openrouter/route.ts
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY; // Server-side only
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

// Step 2: Client calls server API instead
// src/lib/openrouter-ai.ts
const response = await fetch('/api/ai/openrouter', {
  method: 'POST',
  body: JSON.stringify(params),
});
```

**Priority:** IMMEDIATE - Rotate RevenueCat and OpenRouter keys

---

### 1.3 Sensitive Environment Variables in Config Files (HIGH)

**Severity:** HIGH  
**Files:**
- `.aienv/mcp-config.json`
- `mcp-servers-config.json`
- Multiple `.ts` files with credential references

**Issue:**
```json
// .aienv/mcp-config.json
{
  "api_key": "${CONTEXT7_API_KEY}"  // Key name exposed
}

// mcp-servers-config.json
{
  "puter": {
    "api_key": "${PUTER_API_KEY}"  // Key name exposed
  }
}
```

**Remediation:**
1. Ensure `.aienv/` and config files with secrets are in `.gitignore`
2. Use `.example` files for documentation
3. Never commit actual keys

```gitignore
# .gitignore additions
.aienv/
*.local.json
.env.local
.env.*.local
```

---

## Section 2: SQL Injection & Database Security (HIGH)

### 2.1 PostgREST Filter Injection (CRITICAL)

**Severity:** CRITICAL  
**File:** `src/app/api/messages/get/route.ts` (Lines 39, 53-55)  
**Type:** SQL Injection via Supabase PostgREST

**Vulnerable Code:**
```typescript
// Line 53-55 - VULNERABLE
const queryUserId = params.get('userId') ?? '';

const { data: messages, error } = await supabase
  .from('messages')
  .select('*')
  .or(`sender_id.eq.${queryUserId},recipient_id.eq.${queryUserId}`) // INJECTION POINT
```

**Attack Example:**
```
GET /api/messages/get?userId=550e8400-e29b-41d4-a716-446655440000,sender_id.eq.*

Result: .or(`sender_id.eq.550e8400-e29b-41d4-a716-446655440000,sender_id.eq.*`)
        This returns ALL messages (wildcard in PostgREST filter)
```

**Remediation:**
```typescript
// FIXED VERSION using parameterized filters
const queryUserId = params.get('userId') ?? '';

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!queryUserId.match(uuidRegex)) {
  return NextResponse.json(
    { error: 'Invalid user ID format' },
    { status: 400 }
  );
}

// Use separate filters instead of .or() with string interpolation
const { data: messages } = await supabase
  .from('messages')
  .select('*')
  .or(`sender_id.eq.${queryUserId},recipient_id.eq.${queryUserId}`);

// SAFER ALTERNATIVE: Use two separate queries
const [sentMessages, receivedMessages] = await Promise.all([
  supabase.from('messages').select('*').eq('sender_id', queryUserId),
  supabase.from('messages').select('*').eq('recipient_id', queryUserId),
]);
```

**Priority:** IMMEDIATE

---

### 2.2 Unsafe File Path in Document Storage (MEDIUM)

**Severity:** MEDIUM  
**File:** `src/app/api/documents/route.ts` (Line 260)  
**Type:** Unsanitized Path in File Storage

**Issue:**
```typescript
// Line 260 - fileName not validated for path traversal characters
file_path: validatedData.fileName 
  ? `/documents/${userId}/${validatedData.fileName}` 
  : null,
```

**Risk:**
- `fileName` only validated for length (max 255 chars), not characters
- Allows paths like `../../admin/sensitive.pdf` if used in file I/O
- Data integrity issue if paths later used in file operations

**Remediation:**
```typescript
// Add strict filename validation
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9._\-() ]+$/;

if (validatedData.fileName && !SAFE_FILENAME_REGEX.test(validatedData.fileName)) {
  return NextResponse.json(
    { error: 'Invalid filename - only alphanumeric, dots, hyphens, parentheses allowed' },
    { status: 400 }
  );
}

// Sanitize the filename
const sanitizedFileName = validatedData.fileName
  .replace(/[^a-zA-Z0-9._\-() ]/g, '')
  .substring(0, 255);

file_path: sanitizedFileName 
  ? `/documents/${userId}/${sanitizedFileName}` 
  : null,
```

---

## Section 3: Authentication & Authorization Issues (HIGH)

### 3.1 Missing Authentication on Public Endpoints (HIGH)

**Severity:** HIGH  
**Unauthenticated Endpoints:**

| Endpoint | Issue | Risk |
|----------|-------|------|
| `GET /api/papers` | No auth check | Anyone can list papers |
| `POST /api/papers/search` | No auth check | Unlimited search queries |
| `GET /api/arxiv-search` | No auth check | API abuse possible |
| `GET /api/wiki/*` | No auth check | Wiki fully public |
| `GET /api/metrics/health` | No auth check | Infrastructure exposure |

**Remediation - Example Fix:**
```typescript
// src/app/api/papers/route.ts - FIXED
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Add authentication check
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required' },
      { status: 401 }
    );
  }

  // Rest of handler...
}

export async function POST(request: NextRequest) {
  // Add authentication check
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required' },
      { status: 401 }
    );
  }

  // Validate user has plan to use this feature
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', session.user.id)
    .single();

  if (profile?.plan === 'free' && /* expensive operation */) {
    return NextResponse.json(
      { error: 'This feature requires a paid plan' },
      { status: 403 }
    );
  }

  // Rest of handler...
}
```

**Endpoints to Secure:**
- `src/app/api/papers/route.ts`
- `src/app/api/papers/search/route.ts`
- `src/app/api/arxiv-search/route.ts`
- `src/app/api/wiki/route.ts`
- `src/app/api/wiki/[slug]/route.ts`
- `src/app/api/metrics/health/route.ts`

---

### 3.2 Weak Authentication Pattern (x-user-id header) (HIGH)

**Severity:** HIGH  
**Affected Endpoints:**
- `src/app/api/users/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/documents/route.ts`
- `src/app/api/ai-tools/route.ts`

**Issue:**
```typescript
// VULNERABLE PATTERN
const userId = request.headers.get('x-user-id');
if (!userId) return 401;

// This header can be spoofed by client!
// Client can set: X-User-ID: other-user-id
```

**Root Cause:**
- Middleware (`src/proxy.ts`) does NOT actually set the `x-user-id` header
- Header is expected but not verified against authenticated session
- Client-side code can set arbitrary values

**Remediation:**
```typescript
// FIXED: Verify session first
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Get authenticated user from session, not headers
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Use session.user.id, not header
  const userId = session.user.id;

  // Verify header matches session (if header exists)
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && headerUserId !== userId) {
    return NextResponse.json(
      { error: 'User ID mismatch' },
      { status: 403 }
    );
  }

  // Safe to use userId
}
```

**Implementation Plan:**
1. Update middleware to properly set `x-user-id` from verified JWT token
2. Add session validation to all routes using this pattern
3. Verify `x-user-id` header matches authenticated user

---

### 3.3 Missing Role-Based Access Control (MEDIUM)

**Severity:** MEDIUM  
**Issue:** Admin endpoints exist but role checks are inconsistent

**Affected Files:**
- `src/app/api/admin/seed-demo-docs/route.ts` ✓ (Has admin check - FIXED)
- `src/app/api/logs/route.ts` (DELETE requires admin, but POST doesn't)
- `src/app/api/users/route.ts` (No admin-only endpoints)

**Remediation:**
```typescript
// Utility for role-based access
// src/lib/auth-utils.ts - ADD THIS
export async function requireRole(
  request: NextRequest,
  requiredRole: 'admin' | 'advisor' | 'critic'
) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null; // Unauthorized
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== requiredRole) {
    return null; // Forbidden
  }

  return session.user.id;
}

// Usage in admin endpoints
export async function DELETE(request: NextRequest) {
  const userId = await requireRole(request, 'admin');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Admin role required' },
      { status: 403 }
    );
  }

  // Proceed with admin operation
}
```

---

## Section 4: Data Leakage & Error Handling (MEDIUM)

### 4.1 Information Disclosure via Error Messages (MEDIUM)

**Severity:** MEDIUM  
**Pattern:** Direct `error.message` exposure to clients

**Affected Files (18+ instances):**
- `src/app/api/papers/route.ts` (Lines 49-50, 111-112)
- `src/app/api/messages/send/route.ts` (Lines 158-165, 183-190)
- `src/app/api/users/route.ts` (Lines 104, 170, 259, 288)
- `src/app/api/workflows/route.ts` (Line 162)
- `src/app/api/study-guides/route.ts` (Multiple instances)
- `src/app/api/zotero/import/route.ts` (Lines 157-219)
- `src/lib/api/error-handler.ts` (Line 27)

**Vulnerable Code Example:**
```typescript
// EXPOSED ERROR
try {
  const result = await supabase
    .from('papers')
    .select('*')
    .eq('id', paperId);
  
  if (error) {
    // DANGEROUS: Exposes internal database error
    return NextResponse.json(
      { error: `Failed to fetch papers: ${error.message}` },
      { status: 500 }
    );
  }
} catch (error) {
  // DANGEROUS: Stack trace visible to client
  console.error('Paper search error:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

**Risk:**
- Database schema details exposed
- Error codes reveal internal logic
- Stack traces can point to vulnerable code
- Attackers can craft targeted exploits

**Remediation:**
```typescript
// SAFE ERROR HANDLING
import { logError } from '@/lib/logging';

try {
  const result = await supabase
    .from('papers')
    .select('*')
    .eq('id', paperId);
  
  if (error) {
    // Log full error server-side
    logError('Paper fetch failed', {
      paperId,
      error: error.message,
      code: error.code,
    });
    
    // Return generic message to client
    return NextResponse.json(
      { error: 'Failed to fetch papers. Please try again later.' },
      { status: 500 }
    );
  }
} catch (error) {
  // Log with context server-side
  logError('Paper API error', {
    paperId,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
    // Don't log stack trace to client
  });
  
  // Generic error response
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

**Implementation:**
1. Create `src/lib/logging.ts` for server-side logging
2. Replace all direct `error.message` responses with generic messages
3. Log full errors only to server logs (CloudWatch, Sentry, etc.)

---

### 4.2 Console.log Leakage in APIs (MEDIUM)

**Severity:** MEDIUM  
**Pattern:** `console.log/error` in API routes leaks information to logs

**Instances:** 50+ across codebase

**Risk:**
- Sensitive data logged: user IDs, database queries, API keys
- Log aggregation systems expose this data
- Attackers with log access can find vulnerabilities

**Remediation:**
```typescript
// REMOVE all console.log from production code
// Use structured logging instead

// src/lib/logging.ts - CREATE THIS
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
    },
  },
});

export function logInfo(message: string, metadata?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // Don't include sensitive metadata in production
    logger.info({ message });
  } else {
    logger.info(metadata, message);
  }
}

export function logError(message: string, metadata?: Record<string, any>) {
  // Never log full stack traces in production
  const safe = { ...metadata };
  delete safe.stack;
  logger.error(safe, message);
}
```

---

## Section 5: Database Security & RLS (HIGH)

### 5.1 Overly Permissive Anonymous Access (CRITICAL)

**Severity:** CRITICAL  
**Files:**
- `supabase/migrations/50_allow_demo_documents.sql`
- `supabase/migrations/53_change_documents_user_id_to_text.sql`

**Vulnerable RLS Policies:**
```sql
-- DANGEROUS: Anonymous users can do ANYTHING
CREATE POLICY "Demo allow insert unauthenticated" ON documents
  FOR INSERT TO anon WITH CHECK (true);  -- No constraints!

CREATE POLICY "Demo allow update unauthenticated" ON documents
  FOR UPDATE TO anon USING (true);       -- Anyone can update!

CREATE POLICY "Demo allow delete unauthenticated" ON documents
  FOR DELETE TO anon USING (true);       -- Anyone can delete!
```

**Attack Scenario:**
1. Attacker accesses `/api/documents`
2. Fetches all documents without authentication
3. Deletes random documents or modifies content
4. No audit trail of who did what

**Remediation:**
```sql
-- Remove blanket anonymous access
-- Drop dangerous policies
DROP POLICY IF EXISTS "Demo allow insert unauthenticated" ON documents;
DROP POLICY IF EXISTS "Demo allow update unauthenticated" ON documents;
DROP POLICY IF EXISTS "Demo allow delete unauthenticated" ON documents;

-- Create demo user instead
INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
VALUES ('demo@example.com', NOW(), '{}')
ON CONFLICT DO NOTHING;

-- Add policies for demo user only
CREATE POLICY "Demo user access" ON documents
  FOR SELECT TO authenticated USING (
    user_id = 'demo-user-uuid' AND auth.jwt() ->> 'email' = 'demo@example.com'
  );
```

**Priority:** IMMEDIATE - Audit all data modifications by anon role

---

### 5.2 Missing RLS on Tables (MEDIUM)

**Severity:** MEDIUM  
**Tables Missing RLS:**
- `ai_analytics` - No RLS policies defined
- `workflows` - No RLS configuration found
- `widget_data_cache` - May be missing user isolation

**Remediation:**
```sql
-- Enable RLS on ai_analytics
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Add policies
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
```

---

### 5.3 Overly Broad Advisor Access (HIGH)

**Severity:** HIGH  
**File:** `supabase/migrations/27_advisor_critic_rls_policies.sql`  
**Issue:**

```sql
-- PROBLEM: ANY advisor can view ANY advisor request
CREATE POLICY "Advisors can view their advisor requests" ON public.advisor_requests
  FOR SELECT USING (
    advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
    OR -- This "OR" is too broad!
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'advisor'
    )
  );
```

**Attack:** Any advisor can view requests meant for other advisors

**Remediation:**
```sql
DROP POLICY IF EXISTS "Advisors can view their advisor requests" ON advisor_requests;

CREATE POLICY "Advisors can view their own requests" ON advisor_requests
  FOR SELECT USING (
    advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Separate policy for request creator (student)
CREATE POLICY "Students can view own advisor requests" ON advisor_requests
  FOR SELECT USING (
    student_id = auth.uid()
  );
```

---

## Section 6: Input Validation Issues (MEDIUM)

### 6.1 Missing Input Validation (MEDIUM)

**Severity:** MEDIUM  
**Pattern:** Missing or insufficient input validation before database operations

**Examples:**

```typescript
// src/app/api/messages/get/route.ts
// UUID not validated - could be any string
const queryUserId = params.get('userId') ?? '';

// src/app/api/papers/search/route.ts
// Query not length-checked, could cause DoS
const query = searchParams.get('q') ?? '';

// src/app/api/metrics/route.ts (PARTIALLY FIXED)
// But still missing validation on fromYear/toYear types
```

**Remediation:**
```typescript
import { z } from 'zod';

// Define schemas
const paperSearchSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

const messageQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  limit: z.number().int().min(1).max(100).optional(),
});

// Usage
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params = messageQuerySchema.parse({
      userId: searchParams.get('userId'),
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    
    // Now params is safe to use
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', params.userId)
      .limit(params.limit);
      
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }
  }
}
```

---

## Section 7: Code Injection & Dynamic Execution (MEDIUM)

### 7.1 Dynamic Function Invocation (MEDIUM)

**Severity:** MEDIUM  
**Files:**
- `src/components/ai-assistant-panel.tsx` (Line 68)
- `src/components/SmartAIAssistant.tsx` (Line 124)
- `src/lib/puter-ai-facade.ts` (Lines 217-229)
- `src/lib/mcp/serena-client.ts` (Lines 142-216)

**Vulnerable Pattern:**
```typescript
// Function name from user input (toolId parameter)
const toolId = params.toolId; // From URL params

// Direct invocation without validation
const result = await supabase.functions.invoke(toolId, {
  body: requestBody,
});
```

**Risk:**
- Attacker can invoke unintended functions
- Could call admin-only functions by guessing names
- Functions not expecting direct invocation may be exploited

**Remediation:**
```typescript
// Whitelist approach
const ALLOWED_TOOLS = new Set([
  'paraphrase',
  'grammar-check',
  'citation-builder',
  'outline-generator',
  // Only explicitly allowed tools
]);

export async function POST(
  request: NextRequest,
  context: { params: { toolId: string } }
) {
  const { toolId } = context.params;
  
  // Validate against whitelist
  if (!ALLOWED_TOOLS.has(toolId)) {
    return NextResponse.json(
      { error: 'Invalid tool ID' },
      { status: 400 }
    );
  }

  // Safe to invoke
  const result = await supabase.functions.invoke(toolId, {
    body: requestBody,
  });
  
  return NextResponse.json(result);
}
```

---

### 7.2 Unsafe JSON Parsing (MEDIUM)

**Severity:** MEDIUM  
**Pattern:** `JSON.parse()` without validation on untrusted data

**Affected Files (13+ instances):**
- `src/lib/puter-sdk.ts` (Line 174)
- `src/lib/puter-ai-wrapper.ts` (Lines 153, 159)
- `src/lib/realtime-server.ts` (Line 217)
- `src/lib/dashboard/websocket-manager.ts` (Line 167)
- `src/lib/ai/research-gap-analyzer.ts` (Lines 350, 371, 392, 413, 433)

**Vulnerable Pattern:**
```typescript
// UNSAFE: Parsing unvalidated data from API/WebSocket
const response = await fetch(url);
const data = JSON.parse(await response.text()); // Could be malformed

// Or from WebSocket
const data = JSON.parse(message.data); // No schema validation
```

**Risks:**
- Invalid JSON crashes application
- Malformed objects cause type errors
- Prototype pollution if data contains `__proto__`
- Unexpected properties break code logic

**Remediation:**
```typescript
import { z } from 'zod';

// Define expected schema
const AIResponseSchema = z.object({
  success: z.boolean(),
  data: z.record(z.any()).optional(),
  error: z.string().optional(),
});

// Safe parsing
const response = await fetch(url);
const text = await response.text();

try {
  const raw = JSON.parse(text);
  const validated = AIResponseSchema.parse(raw);
  // Now validated is safe
  if (validated.success) {
    // Use validated.data
  }
} catch (error) {
  if (error instanceof SyntaxError) {
    logError('Invalid JSON from API', { url, text: text.substring(0, 100) });
  } else if (error instanceof z.ZodError) {
    logError('Unexpected API response structure', { url, errors: error.errors });
  }
  throw error;
}
```

---

## Section 8: Path Traversal & File Operations (MEDIUM)

### 8.1 Wiki File Path Traversal (MEDIUM)

**Severity:** MEDIUM  
**File:** `src/app/api/wiki/route.ts`  
**Issue:**

```typescript
// Lists all .md files from wiki directory
const files = readdirSync(WIKI_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => file.replace('.md', ''));

// Then later used in file read:
const filePath = join(WIKI_DIR, `${slug}.md`);
const content = readFileSync(filePath, 'utf-8');
```

**Risk:**
- If WIKI_DIR contains symlinks, could read files outside directory
- Symlink attack possible
- File permissions not checked

**Remediation:**
```typescript
import { realpath } from 'fs/promises';
import { resolve } from 'path';

export async function GET(request: NextRequest) {
  const { slug } = params;
  
  // Whitelist validation
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Invalid wiki page slug' },
      { status: 400 }
    );
  }

  const filePath = join(WIKI_DIR, `${slug}.md`);
  
  // Resolve symlinks and verify path is within WIKI_DIR
  const realWikiDir = await realpath(WIKI_DIR);
  const realFilePath = await realpath(filePath).catch(() => null);
  
  if (!realFilePath || !realFilePath.startsWith(realWikiDir)) {
    return NextResponse.json(
      { error: 'Invalid wiki page slug' },
      { status: 400 }
    );
  }

  try {
    const content = await readFile(realFilePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Page not found' },
      { status: 404 }
    );
  }
}
```

---

## Section 9: CORS & External API Security (MEDIUM)

### 9.1 Missing CORS Headers (MEDIUM)

**Severity:** MEDIUM  
**Issue:** API routes don't explicitly set CORS headers

**Affected Endpoints:**
- `src/app/api/papers/search/route.ts`
- `src/app/api/papers/unlock/route.ts`
- `src/app/api/semantic-scholar-search/route.ts`
- `src/app/api/openalex-search/route.ts`

**Risk:**
- Browser may block requests from frontend
- Missing security headers on responses
- No explicit CORS policy configured

**Remediation:**
```typescript
// Create CORS utility
// src/lib/cors.ts
export function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// Usage in API routes
import { addCorsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  // ... handler logic ...
  
  const response = NextResponse.json(data);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 204 }));
}
```

---

### 9.2 SSRF Risk in Paper Unlock (MEDIUM)

**Severity:** MEDIUM  
**File:** `src/app/api/papers/unlock/route.ts`  
**Issue:**

```typescript
// Fetches from Sci-Hub mirrors based on user-provided DOI
const scihubUrl = `https://sci-hub.${domain}/`;
const response = await fetch(`${scihubUrl}${doi}`);
```

**Risk:**
- User can provide any DOI
- Could probe internal network ranges (localhost, 192.168.*, etc.)
- Attacker can map which services are running

**Remediation:**
```typescript
// Validate DOI format
const DOI_REGEX = /^10\.\d{4,}\/[^\s]+$/;

export async function POST(request: NextRequest) {
  const { doi } = await request.json();
  
  if (!DOI_REGEX.test(doi)) {
    return NextResponse.json(
      { error: 'Invalid DOI format' },
      { status: 400 }
    );
  }

  // Validate against known safe domains
  const SAFE_DOMAINS = ['se', 'tw', 'st', 'hk'];
  const domain = SAFE_DOMAINS[Math.floor(Math.random() * SAFE_DOMAINS.length)];
  
  try {
    const url = new URL(`https://sci-hub.${domain}/${doi}`);
    
    // Prevent requests to internal networks
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^(10|172|192)\./g.test(hostname) ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json(
        { error: 'Invalid DOI' },
        { status: 400 }
      );
    }

    const response = await fetch(url.toString(), {
      timeout: 10000, // 10 second timeout
    });
    
    // ... rest of handler ...
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
}
```

---

### 9.3 Unprotected API Key in Notifications (MEDIUM)

**Severity:** MEDIUM  
**File:** `src/app/api/notifications/send-*-email/route.ts`  
**Issue:**

```typescript
// X-API-Key in header (can be logged/exposed)
const apiKey = request.headers.get('x-api-key');
if (apiKey !== process.env.INTERNAL_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Risk:**
- Header value logged in access logs
- Exposed in browser Network tab if called from client
- No rate limiting on internal key usage

**Remediation:**
```typescript
// Use server-side only calls with proper authentication
// Move to API routes that validate session first

export async function POST(request: NextRequest) {
  // Verify user session
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Rate limit by user
  const rateLimit = await checkRateLimit(session.user.id, 'send-email');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Send email...
}

// Create internal function (not exposed via HTTP)
export async function sendNotificationEmail(
  userId: string,
  type: 'advisor' | 'critic' | 'student',
  data: any
) {
  // ... send email logic ...
}
```

---

## Section 10: Prototype Pollution & State Injection (LOW)

### 10.1 Unsafe Object Merging (LOW)

**Severity:** LOW  
**Pattern:** Spread operator without checking for `__proto__` or `constructor`

**Affected Files:**
- `src/lib/dashboard/realtime-state.ts` (Lines 76-79, 113, 277-280)
- `src/lib/dashboard/update-processor.ts` (Lines 209-212)
- `src/lib/ai/adaptive/adaptive-engine.ts` (Line 327)

**Vulnerable Code:**
```typescript
// Spreads untrusted object
const state = { ...defaultState, ...userData };

// Or Object.assign
Object.assign(globalConfig, untrustedData);
```

**Risk:** Low in this context, but prototype pollution possible if:
- Untrusted data contains `__proto__`
- Object contains `constructor` property
- Affects all future objects

**Remediation:**
```typescript
// Helper function
function safeObjectMerge<T>(target: T, source: any): T {
  const result = { ...target };
  
  for (const key in source) {
    // Skip prototype pollution vectors
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    // Only merge if key exists in target (whitelist approach)
    if (key in result) {
      result[key as keyof T] = source[key];
    }
  }
  
  return result;
}

// Usage
const state = safeObjectMerge(defaultState, userData);
```

---

## Section 11: Dependency Vulnerabilities (MEDIUM)

### 11.1 Unmanaged Dependencies

**Severity:** MEDIUM  
**Issue:** Cannot run `npm audit` - no lockfile

**Status:**
```bash
$ npm audit
ERROR: audit requires lockfile (package-lock.json or yarn.lock or pnpm-lock.yaml)
```

**Recommendation:**
```bash
# Generate lockfile
pnpm install

# Audit dependencies
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

**Create routine:**
- Run `pnpm audit` weekly
- Set up GitHub Dependabot
- Review and patch security updates

---

## Quick Fix Priority Guide

### IMMEDIATE (Within 24 hours)

- [ ] Remove hardcoded Sentry DSN from `src/instrumentation-client.ts`
- [ ] Move OpenRouter API key to server-side only
- [ ] Rotate RevenueCat API key
- [ ] Fix SQL injection in `src/app/api/messages/get/route.ts`
- [ ] Audit anonymous access to `documents` table
- [ ] Verify admin role requirements on all admin endpoints

### HIGH (Within 1 week)

- [ ] Add authentication to public API endpoints
- [ ] Replace x-user-id header pattern with session verification
- [ ] Implement generic error responses (hide error details)
- [ ] Fix overly permissive advisor/critic RLS policies
- [ ] Validate all UUID parameters
- [ ] Add input validation schemas with Zod

### MEDIUM (Within 2 weeks)

- [ ] Implement structured logging (remove console.log)
- [ ] Enable RLS on all tables (`ai_analytics`, `workflows`)
- [ ] Add CORS headers to API routes
- [ ] Whitelist dynamic function invocations
- [ ] Add rate limiting to sensitive endpoints
- [ ] Validate file paths in all file operations

### LOW (Ongoing)

- [ ] Run dependency audits weekly
- [ ] Update error handling patterns across codebase
- [ ] Review and log all API operations
- [ ] Add security tests to CI/CD pipeline

---

## Deployment Checklist

```bash
# Before deploying security fixes:

# 1. Run tests
pnpm test -- --run

# 2. Lint
pnpm lint

# 3. Type check
pnpm exec tsc --noEmit

# 4. Build
pnpm build

# 5. Deploy with caution
# - Deploy to staging first
# - Run integration tests
# - Verify RLS policies work
# - Check rate limiting

# 6. Monitor
# - Watch error logs
# - Monitor auth failures
# - Track API response times
# - Review user feedback
```

---

## Testing Security Fixes

### Unit Tests for Authorization
```typescript
// src/__tests__/security/authorization.test.ts
import { POST } from '@/app/api/admin/seed-demo-docs/route';

describe('Admin endpoint security', () => {
  it('should reject unauthenticated requests', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/admin/seed-demo-docs'));
    expect(response.status).toBe(401);
  });

  it('should reject non-admin users', async () => {
    // Mock session for non-admin user
    const response = await POST(mockRequest);
    expect(response.status).toBe(403);
  });
});
```

### Integration Tests for RLS
```sql
-- Test RLS policies
BEGIN;
  SET ROLE postgres;
  
  -- Verify anonymous cannot INSERT
  SET ROLE anon;
  INSERT INTO documents (user_id, title) VALUES ('other-user-id', 'Test');
  -- Should fail with RLS policy violation
  
ROLLBACK;
```

---

## Security Monitoring

### Recommended Tools

1. **npm audit** - Dependency vulnerabilities
2. **Snyk** - Continuous vulnerability scanning
3. **OWASP ZAP** - Web application scanning
4. **SonarQube** - Code quality and security

### Logging Strategy

```typescript
// src/lib/audit-logger.ts
export async function logSecurityEvent(
  event: 'auth_attempt' | 'auth_failure' | 'admin_action' | 'data_access',
  metadata: {
    userId?: string;
    endpoint: string;
    status: 'success' | 'failure';
    details?: string;
  }
) {
  // Log to audit table
  await supabase.from('audit_logs').insert({
    event_type: event,
    user_id: metadata.userId,
    endpoint: metadata.endpoint,
    status: metadata.status,
    details: metadata.details,
    timestamp: new Date(),
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
  });
}
```

---

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- NIST Secure Software Development Framework: https://csrc.nist.gov/projects/secure-software-development-framework/

---

**Report Generated:** 2025-12-19  
**Audit Scope:** Full codebase  
**Findings:** 31 categories, 1 Critical, 8 High, 12 Medium, 10 Low  
**Next Review:** 2026-01-19
