# 🔐 Quick Reference: Phase 2 Security

**Add JWT + Audit to any endpoint in 10 minutes**

---

## Copy-Paste Template

```typescript
// src/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';

// Define validation schema
const yourSchema = z.object({
  // Add your fields here
});

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATE
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/your-endpoint',
        ipAddress: request.ip,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. RATE LIMIT (optional, for high-traffic endpoints)
    if (!checkRateLimit(auth.userId, 100, 60000)) {
      await logAuditEvent(AuditAction.API_RATE_LIMITED, {
        userId: auth.userId,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/your-endpoint',
        severity: AuditSeverity.WARNING,
        ipAddress: request.ip,
      });
      const { remaining, resetAt } = getRemainingRequests(auth.userId, 100, 60000);
      return NextResponse.json(
        { error: 'Too many requests', remaining, resetAt },
        { status: 429 }
      );
    }

    // 3. VALIDATE INPUT
    const body = await request.json();
    const validation = yourSchema.safeParse(body);
    if (!validation.success) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId: auth.userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'api_endpoint',
        details: { reason: validation.error.message },
        ipAddress: request.ip,
      });
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. DO YOUR BUSINESS LOGIC
    const result = await doSomething(data, auth.userId);

    // 5. LOG SUCCESS
    await logAuditEvent(AuditAction.DOCUMENT_CREATED, {  // Use appropriate action
      userId: auth.userId,
      resourceType: 'document',  // Change as needed
      resourceId: result.id,
      severity: AuditSeverity.INFO,
      details: { title: result.title },
      statusCode: 200,
    });

    return NextResponse.json(result);

  } catch (error) {
    const auth = await withAuth(request);
    
    // 6. LOG ERROR
    await logAuditEvent(AuditAction.API_ERROR, {
      userId: auth?.userId,
      severity: AuditSeverity.ERROR,
      resourceType: 'api_endpoint',
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: request.ip,
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Common Patterns (Copy-Paste)

### Check Authorization (User is Resource Owner)
```typescript
if (resource.userId !== auth.userId) {
  await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
    userId: auth.userId,
    severity: AuditSeverity.WARNING,
    details: { reason: 'User tried to access another users resource' },
  });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Check Role-Based Access
```typescript
if (user.role !== 'admin') {
  await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
    userId: auth.userId,
    severity: AuditSeverity.WARNING,
    details: { reason: 'Non-admin tried to access admin endpoint' },
  });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Log Sensitive Operations
```typescript
await logAuditEvent(AuditAction.DOCUMENT_DELETED, {
  userId: auth.userId,
  resourceType: 'document',
  resourceId: documentId,
  severity: AuditSeverity.INFO,
  details: { title: doc.title, size: doc.size },
});
```

### Batch Operations
```typescript
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

## Imports You Need

```typescript
// Authentication
import { withAuth } from '@/lib/jwt-validator';

// Rate Limiting
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';

// Audit Logging
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';

// Input Validation
import { z } from 'zod';

// Next.js
import { NextRequest, NextResponse } from 'next/server';
```

---

## Available Audit Actions

```typescript
// Pick the right action for your operation

// Authentication
AuditAction.AUTH_FAILED
AuditAction.AUTH_LOGIN
AuditAction.AUTH_LOGOUT

// Messages
AuditAction.MESSAGE_SENT
AuditAction.MESSAGE_RECEIVED
AuditAction.MESSAGE_DELETED

// Documents
AuditAction.DOCUMENT_CREATED
AuditAction.DOCUMENT_UPDATED
AuditAction.DOCUMENT_DELETED
AuditAction.DOCUMENT_SHARED
AuditAction.DOCUMENT_ACCESSED

// Users
AuditAction.USER_CREATED
AuditAction.USER_UPDATED
AuditAction.USER_DELETED

// API
AuditAction.API_CALL
AuditAction.API_ERROR
AuditAction.API_RATE_LIMITED

// Security
AuditAction.SECURITY_VALIDATION_FAILED
AuditAction.SECURITY_INJECTION_ATTEMPT
```

---

## Severity Levels

```typescript
AuditSeverity.INFO       // Normal operation
AuditSeverity.WARNING    // Unusual but allowed (failed attempt, rate limit)
AuditSeverity.ERROR      // Something failed (DB error, parsing)
AuditSeverity.CRITICAL   // Security incident
```

---

## Testing Your Integration

```bash
# Test 1: No auth (should get 401)
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 2: With auth (should get 200 or 400/422)
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Authorization: Bearer <valid-token>" \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}'

# Test 3: Check audit logs in console
# Look for: [AUDIT] document_created (info) - User: user-id
```

---

## Zod Validation Examples

```typescript
// Simple string with length limits
title: z.string().min(1).max(500)

// Email address
email: z.string().email()

// UUID
userId: z.string().uuid()

// Number with range
age: z.number().int().min(0).max(150)

// Optional field
description: z.string().optional()

// Enum
role: z.enum(['admin', 'user', 'guest'])

// Array
tags: z.array(z.string()).min(1).max(10)

// Complex object
settings: z.object({
  theme: z.enum(['light', 'dark']),
  notifications: z.boolean(),
})

// Conditional
// If you want advanced validation, use .refine()
```

---

## Rate Limit Rates

```typescript
// Messages: 60 per minute
checkRateLimit(auth.userId, 60, 60000)

// Search: 100 per minute
checkRateLimit(auth.userId, 100, 60000)

// Uploads: 10 per hour
checkRateLimit(auth.userId, 10, 3600000)

// Custom: X per Y milliseconds
checkRateLimit(auth.userId, X, Y)
```

---

## Debugging

### Check if Auth is Working
```typescript
const auth = await withAuth(request);
console.log('Auth:', auth); // Should be { userId: 'uuid' }
```

### Check Audit Logs
```typescript
import { getAuditLogs, getAuditStatistics } from '@/lib/audit-logger';

const logs = getAuditLogs({ limit: 20 });
console.log(logs);

const stats = getAuditStatistics();
console.log(stats);
```

### Check Rate Limit
```typescript
import { getRemainingRequests } from '@/lib/rate-limiter';

const { remaining, resetAt } = getRemainingRequests(userId);
console.log(`Remaining: ${remaining}, Reset: ${new Date(resetAt)}`);
```

---

## Checklist for Each Endpoint

- [ ] Add imports (jwt, audit, rate-limit, zod)
- [ ] Add auth check (withAuth)
- [ ] Add rate limit check (if needed)
- [ ] Add input validation (Zod schema)
- [ ] Add success audit log
- [ ] Add error audit log
- [ ] Test with curl (no auth → 401)
- [ ] Test with curl (invalid input → 400)
- [ ] Test with curl (valid → 200)
- [ ] Verify audit logs in console
- [ ] Commit and push

---

## Time Estimate

- Reading this guide: 5 min
- Copying template: 2 min
- Customizing for endpoint: 3 min
- Testing: 3 min
- **Total per endpoint**: 10-15 min

---

## Endpoints to Integrate Next

1. `/api/documents/save` - Document saving
2. `/api/documents/submit` - Document submission
3. `/api/dashboard/*` - Dashboard operations
4. `/api/notifications/*` - Notifications
5. `/api/learning/*` - Learning features

Use this template for each. Estimated 1-2 hours for 5 endpoints.

---

**Start**: Copy the template, change the action types and details, test with curl.
