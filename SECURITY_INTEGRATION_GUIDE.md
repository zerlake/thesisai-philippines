# 🔐 Security Integration Guide

**How to add JWT auth + audit logging to any API endpoint**

---

## Quick Integration (5-10 minutes per endpoint)

### Step 1: Add Imports

At the top of your API route file:

```typescript
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
```

### Step 2: Add Auth Check

At the start of your handler:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate first
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/your-endpoint',
        ipAddress: request.ip,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Now use auth.userId for all operations
    // ...
  }
}
```

### Step 3: Add Audit Logging

On success and failure:

```typescript
// Log successful operation
await logAuditEvent(AuditAction.DOCUMENT_CREATED, {
  userId: auth.userId,
  resourceType: 'document',
  resourceId: documentId,
  severity: AuditSeverity.INFO,
  details: { title, size: contentLength },
  statusCode: 200,
});

// Log failures
await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
  userId: auth.userId,
  severity: AuditSeverity.WARNING,
  resourceType: 'document',
  details: { reason: 'Title too long' },
  ipAddress: request.ip,
});
```

---

## Audit Action Reference

Choose the right action for your operation:

### Authentication
```typescript
AuditAction.AUTH_LOGIN              // User logged in
AuditAction.AUTH_LOGOUT             // User logged out
AuditAction.AUTH_FAILED             // Login failed
AuditAction.AUTH_SESSION_EXPIRED    // Session expired
```

### Messages
```typescript
AuditAction.MESSAGE_SENT            // Message sent
AuditAction.MESSAGE_RECEIVED        // Message received
AuditAction.MESSAGE_DELETED         // Message deleted
```

### Documents
```typescript
AuditAction.DOCUMENT_CREATED        // Doc created
AuditAction.DOCUMENT_UPDATED        // Doc updated
AuditAction.DOCUMENT_DELETED        // Doc deleted
AuditAction.DOCUMENT_SHARED         // Doc shared
AuditAction.DOCUMENT_ACCESSED       // Doc viewed
```

### Users
```typescript
AuditAction.USER_CREATED            // New user
AuditAction.USER_UPDATED            // User info changed
AuditAction.USER_DELETED            // User deleted
AuditAction.USER_ROLE_CHANGED       // Role changed
```

### API
```typescript
AuditAction.API_CALL                // Any API call
AuditAction.API_ERROR               // API error
AuditAction.API_RATE_LIMITED        // Rate limit hit
```

### Security
```typescript
AuditAction.SECURITY_VALIDATION_FAILED   // Input validation failed
AuditAction.SECURITY_INJECTION_ATTEMPT   // Possible injection attack
AuditAction.SECURITY_RLS_VIOLATION       // RLS policy violation
```

### Data
```typescript
AuditAction.DATA_EXPORTED           // Data exported
AuditAction.DATA_IMPORTED           // Data imported
```

---

## Severity Levels

```typescript
AuditSeverity.INFO       // Normal operation (message sent, doc created)
AuditSeverity.WARNING    // Unusual but allowed (failed auth, rate limit)
AuditSeverity.ERROR      // Something failed (DB error, validation)
AuditSeverity.CRITICAL   // Security incident (injection attempt, RLS violation)
```

---

## Complete Integration Example

### Before (No Security)
```typescript
// src/api/documents/create.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  // Create document
  const doc = { id: '123', title, content };
  return NextResponse.json(doc);
}
```

### After (With Security)
```typescript
// src/api/documents/create.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';

const createDocSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/documents/create',
        ipAddress: request.ip,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limit
    if (!checkRateLimit(auth.userId, 100, 60000)) {
      await logAuditEvent(AuditAction.API_RATE_LIMITED, {
        userId: auth.userId,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/documents/create',
        severity: AuditSeverity.WARNING,
        ipAddress: request.ip,
      });
      const { remaining, resetAt } = getRemainingRequests(auth.userId, 100, 60000);
      return NextResponse.json(
        { error: 'Too many requests', remaining, resetAt },
        { status: 429 }
      );
    }

    // 3. Validate input
    const body = await request.json();
    const validation = createDocSchema.safeParse(body);
    if (!validation.success) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId: auth.userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        details: { reason: validation.error.message },
        ipAddress: request.ip,
      });
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, content } = validation.data;

    // 4. Create document
    const docId = '123';
    const doc = { id: docId, title, content, userId: auth.userId };

    // 5. Log success
    await logAuditEvent(AuditAction.DOCUMENT_CREATED, {
      userId: auth.userId,
      resourceType: 'document',
      resourceId: docId,
      severity: AuditSeverity.INFO,
      details: { title, size: content.length },
      statusCode: 200,
    });

    return NextResponse.json(doc);
  } catch (error) {
    const auth = await withAuth(request);
    await logAuditEvent(AuditAction.API_ERROR, {
      userId: auth?.userId,
      resourceType: 'api_endpoint',
      resourceId: 'POST /api/documents/create',
      severity: AuditSeverity.ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500,
      ipAddress: request.ip,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Integration Checklist

For each endpoint:

- [ ] Add `withAuth` import and call
- [ ] Check `if (!auth)` and return 401
- [ ] Add `checkRateLimit` call for public endpoints
- [ ] Validate input with Zod schema
- [ ] Log on success with appropriate action
- [ ] Log on failure with appropriate action
- [ ] Include userId in logs
- [ ] Include resourceType and resourceId
- [ ] Set appropriate severity level
- [ ] Test manually with curl
- [ ] Verify audit logs appear in console

---

## Testing Integration

### Test 1: No Auth (should get 401)
```bash
curl -X POST http://localhost:3000/api/documents/create \
  -H "Content-Type: application/json" \
  -d '{"title":"test","content":"test"}'

# Expected: 401 Unauthorized
```

### Test 2: Invalid Input (should get 400)
```bash
curl -X POST http://localhost:3000/api/documents/create \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"title":"","content":""}'

# Expected: 400 Bad Request with validation errors
```

### Test 3: Valid Request (should get 200)
```bash
curl -X POST http://localhost:3000/api/documents/create \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Document","content":"Some content here"}'

# Expected: 200 OK with document data
```

### Test 4: Check Audit Logs
Look for console output:
```
[AUDIT] document_created (info) - User: user-id-123
[AUDIT] security_validation_failed (warning) - User: user-id-456
[AUDIT] auth_failed (warning) - User: unknown
```

---

## Common Patterns

### Pattern 1: Owner Verification
```typescript
// Ensure user only modifies their own resources
if (doc.userId !== auth.userId) {
  await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
    userId: auth.userId,
    severity: AuditSeverity.WARNING,
    details: { reason: 'User tried to modify another users document' },
  });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Pattern 2: Role-Based Access
```typescript
// Check user role
const user = await getUser(auth.userId);
if (user.role !== 'admin') {
  await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
    userId: auth.userId,
    severity: AuditSeverity.WARNING,
    details: { reason: 'Non-admin tried to access admin endpoint' },
  });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Pattern 3: Batch Operations
```typescript
// Log each item in batch
for (const item of items) {
  await logAuditEvent(AuditAction.DOCUMENT_CREATED, {
    userId: auth.userId,
    resourceType: 'document',
    resourceId: item.id,
    severity: AuditSeverity.INFO,
    details: { title: item.title },
  });
}
```

---

## Endpoints to Integrate (Priority Order)

### CRITICAL (Do Now)
```
/api/messages/send                  ✅ DONE
/api/documents/save
/api/documents/submit
/api/documents/*
```

### HIGH (Do Next)
```
/api/dashboard/*
/api/notifications/*
/api/learning/*
/api/papers/*
```

### MEDIUM (Do Later)
```
/api/personalization/*
/api/workflows/*
/api/projects/*
```

### LOW (Optional)
```
/api/logs
/api/metrics
/api/health
```

---

## Debugging

### Check if JWT is working
```typescript
import { getAuthUserId, decodeToken } from '@/lib/jwt-validator';

const userId = await getAuthUserId(request);
console.log('User ID:', userId);

const token = extractTokenFromHeader(request.headers.get('authorization'));
const decoded = decodeToken(token);
console.log('Decoded:', decoded);
```

### Check audit logs
```typescript
import { getAuditLogs, getAuditStatistics } from '@/lib/audit-logger';

// Get recent logs
const logs = getAuditLogs({ limit: 20 });
console.log(logs);

// Get stats
const stats = getAuditStatistics();
console.log(stats);
```

### Check rate limiting
```typescript
import { getRemainingRequests } from '@/lib/rate-limiter';

const { remaining, resetAt } = getRemainingRequests(userId);
console.log(`Remaining: ${remaining}, Reset: ${resetAt}`);
```

---

## Summary

✅ **5 minutes**: Add imports  
✅ **3 minutes**: Add auth check  
✅ **2 minutes**: Add audit logging  
✅ **2 minutes**: Test endpoint  
✅ **Total per endpoint**: 10-15 minutes

**Quick Start**: Copy the "After" example above and customize for your endpoint.
