# Error Handling Quick Reference

## When to Use Each Utility

### `ensureError(error: unknown): Error`
**Use when:** You need to guarantee an Error type from a catch block

```typescript
import { ensureError } from '@/lib/errors';

try {
  await someAsyncOperation();
} catch (error) {
  const err = ensureError(error);
  console.error(err.message); // Safe - guaranteed Error
  throw new APIError('Failed', { originalError: err });
}
```

### `getErrorMessage(error: unknown, fallback?: string): string`
**Use when:** You need to safely extract a message string

```typescript
import { getErrorMessage } from '@/lib/error-normalizer';

try {
  // operation
} catch (error) {
  const message = getErrorMessage(error, 'Operation failed');
  toast.error(message); // Safe - returns string
}
```

### `getErrorStatus(error: unknown): number | undefined`
**Use when:** You need to check HTTP status codes

```typescript
import { getErrorStatus } from '@/lib/error-normalizer';

try {
  await fetch('/api/endpoint');
} catch (error) {
  const status = getErrorStatus(error);
  if (status === 401) {
    // Handle unauthorized
  }
}
```

### `isError(value: unknown): value is Error`
**Use when:** You need a type-safe way to check if something is an Error

```typescript
import { isError } from '@/lib/error-normalizer';

if (isError(value)) {
  // TypeScript knows value is Error here
  console.error(value.message);
}
```

### `hasErrorStatus(error: unknown, status: number): boolean`
**Use when:** You want a one-liner status check

```typescript
import { hasErrorStatus } from '@/lib/error-normalizer';

catch (error) {
  if (hasErrorStatus(error, 401)) {
    redirectToLogin();
  }
}
```

## Common Patterns

### Pattern 1: API Error with Unknown Error Type
```typescript
import { ensureError } from '@/lib/errors';
import { APIError } from '@/lib/errors';

catch (error) {
  const err = ensureError(error);
  throw new APIError(err.message || 'API call failed', {
    originalError: err,
    status: getErrorStatus(error)
  });
}
```

### Pattern 2: Logging Errors Safely
```typescript
import { getErrorMessage, getErrorStatus } from '@/lib/error-normalizer';

catch (error) {
  console.error({
    message: getErrorMessage(error),
    status: getErrorStatus(error),
    timestamp: new Date()
  });
}
```

### Pattern 3: User-Friendly Error Messages
```typescript
import { getErrorMessage } from '@/lib/error-normalizer';
import { normalizeError, getUserFriendlyMessage } from '@/utils/error-utilities';

catch (error) {
  const normalized = normalizeError(error);
  const userMessage = getUserFriendlyMessage(normalized);
  toast.error(userMessage);
}
```

### Pattern 4: Custom Error Classes
```typescript
import { ensureError } from '@/lib/errors';
import { AppError } from '@/lib/errors';

catch (error) {
  const err = ensureError(error);
  throw new AppError(
    'CustomError',
    err.message,
    { originalError: err }
  );
}
```

### Pattern 5: Multiple Error Handling
```typescript
import { ensureError, getErrorMessage } from '@/lib/errors';
import { getErrorStatus } from '@/lib/error-normalizer';

try {
  // operation
} catch (error) {
  const err = ensureError(error);
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);
  
  // Use all three safely
  if (status === 401) {
    // Handle auth
  } else {
    console.error(`Error: ${message}`);
  }
}
```

## DO's and DON'Ts

### ✅ DO
```typescript
// Good: Use ensureError for catch blocks
catch (error) {
  const err = ensureError(error);
  throw new Error(err.message);
}

// Good: Use getErrorMessage
catch (error) {
  console.error(getErrorMessage(error));
}

// Good: Type-safe error checking
catch (error) {
  if (isError(error)) {
    // TypeScript narrows to Error type
  }
}
```

### ❌ DON'T
```typescript
// Bad: Direct access without type guard
catch (error) {
  throw new Error(error.message); // error might not have .message
}

// Bad: Passing unknown to Error constructor
catch (error) {
  throw new APIError('msg', { originalError: error }); // ❌ Type error
}

// Bad: Assuming error is Error
catch (error) {
  console.error(error.stack); // error might not have .stack
}
```

## Summary Table

| Need | Utility | Returns | Safe |
|------|---------|---------|------|
| Convert to Error | `ensureError()` | `Error` | ✅ |
| Get message | `getErrorMessage()` | `string` | ✅ |
| Get status code | `getErrorStatus()` | `number \| undefined` | ✅ |
| Check if Error | `isError()` | `boolean` | ✅ (type guard) |
| Check status | `hasErrorStatus()` | `boolean` | ✅ |
| Full normalization | `normalizeError()` | `NormalizedError` | ✅ |
| User message | `getUserFriendlyMessage()` | `string` | ✅ |

## Import Examples

```typescript
// From main errors file
import { ensureError, APIError, AuthenticationError } from '@/lib/errors';

// From normalizer (more specific)
import { 
  ensureError, 
  getErrorMessage, 
  getErrorStatus, 
  isError, 
  hasErrorStatus,
  safeErrorHandler 
} from '@/lib/error-normalizer';

// From utilities (comprehensive)
import { 
  normalizeError, 
  getUserFriendlyMessage,
  isRetryableError,
  isAuthError,
  getErrorDetails 
} from '@/utils/error-utilities';
```

## Testing

When testing error scenarios:

```typescript
import { ensureError, getErrorMessage } from '@/lib/errors';

describe('Error handling', () => {
  it('handles string errors', () => {
    const err = ensureError('test error');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('test error');
  });
  
  it('handles Error objects', () => {
    const original = new Error('original');
    const err = ensureError(original);
    expect(err).toBe(original);
  });
  
  it('handles unknown values', () => {
    const err = ensureError({ some: 'object' });
    expect(err).toBeInstanceOf(Error);
    expect(typeof err.message).toBe('string');
  });
});
```
