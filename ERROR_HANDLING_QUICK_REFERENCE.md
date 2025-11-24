# Error Handling Quick Reference

## One-Liner Usage

```typescript
// In a try-catch block
const { message } = handleError(error, 'ComponentName');
toast.error(message);
```

## Import Statements

```typescript
import { 
  handleError,              // Use this most of the time
  normalizeError,          // If you need the full error object
  isRetryableError,        // For retry logic
  isAuthError,             // For auth checks
  getUserFriendlyMessage,  // For custom messaging
} from '@/utils/error-utilities';
```

## Common Patterns

### Pattern 1: Simple Toast Error
```typescript
try {
  await operation();
} catch (error) {
  const { message } = handleError(error, 'OperationName');
  toast.error(message);
}
```

### Pattern 2: With Debugging Context
```typescript
try {
  await operation();
} catch (error) {
  const { message, normalized } = handleError(error, 'MyComponent', {
    userId: user?.id,
    action: 'fetching data',
  });
  // normalized contains full debugging info
  toast.error(message);
}
```

### Pattern 3: Conditional Retry
```typescript
try {
  await operation();
} catch (error) {
  if (isRetryableError(error)) {
    // Safe to retry
    await operation(); // With exponential backoff ideally
  } else {
    const { message } = handleError(error, 'Operation');
    toast.error(message);
  }
}
```

### Pattern 4: Auth Error Handling
```typescript
try {
  await operation();
} catch (error) {
  if (isAuthError(error)) {
    // Redirect to login
    router.push('/login');
  } else {
    const { message } = handleError(error, 'Operation');
    toast.error(message);
  }
}
```

### Pattern 5: Full Control
```typescript
try {
  await operation();
} catch (error) {
  const normalized = normalizeError(error, 'MyContext');
  
  // Handle by type
  switch (normalized.type) {
    case ErrorType.EMPTY_OBJECT:
    case ErrorType.SERVICE:
      // Retry after delay
      break;
    case ErrorType.AUTH:
      // Redirect to login
      break;
    default:
      // Show message to user
  }
  
  const userMessage = getUserFriendlyMessage(normalized);
  toast.error(userMessage);
}
```

## Error Types at a Glance

| Type | Retryable? | Common Cause |
|------|-----------|--------------|
| `EMPTY_OBJECT` | ✓ | SDK returned empty error |
| `NETWORK` | ✓ | Connection lost |
| `TIMEOUT` | ✓ | Request took too long |
| `SERVICE` | ✓ | Server error (5xx) |
| `AUTH` | ✗ | Not logged in / no permission |
| `VALIDATION` | ✗ | Bad input |
| `NOT_FOUND` | ✗ | Resource doesn't exist |
| `CONFLICT` | ✗ | Resource already exists |
| `UNDEFINED` | ✗ | Null/undefined error |
| `UNKNOWN` | ✗ | Can't determine |

## Retryable Errors

```typescript
// These return true from isRetryableError()
- ErrorType.TIMEOUT
- ErrorType.NETWORK
- ErrorType.SERVICE
- ErrorType.EMPTY_OBJECT
```

## Common Issues & Solutions

### Issue: Empty Error Object `{}`
**Cause**: Puter SDK or external API returns empty error object
**Solution**: System automatically handles with sensible default message
```typescript
const normalized = normalizeError({});
// normalized.type = ErrorType.EMPTY_OBJECT
// normalized.message = "An error occurred. Please try again..."
```

### Issue: Lost Error Details
**Cause**: Error properties not extracted properly
**Solution**: `normalizeError()` extracts from all common properties
```typescript
// All these work:
normalizeError({ message: 'error' });          // .message
normalizeError({ error: 'error' });            // .error
normalizeError({ detail: 'error' });           // .detail
normalizeError({ description: 'error' });      // .description
normalizeError(new Error('error'));            // Error instance
normalizeError('error string');                // String
```

### Issue: Inconsistent Error Handling
**Cause**: Different parts of code handle errors differently
**Solution**: Always use `handleError()` or `normalizeError()`
```typescript
// ❌ Don't do this
catch (error) {
  console.error(error?.message || 'Unknown');
}

// ✓ Do this
catch (error) {
  const { message } = handleError(error, 'ComponentName');
}
```

### Issue: User Seeing Technical Errors
**Cause**: Exposing raw error messages to users
**Solution**: Use `getUserFriendlyMessage()` which provides appropriate messaging
```typescript
// ❌ Wrong
toast.error(error?.message);

// ✓ Right
const { message } = handleError(error, 'FeatureName');
toast.error(message);
```

## Debugging Tips

### In Development
Errors are logged with full details:
```
[ComponentName] ERROR_TYPE
Message: User-friendly message
Code: Optional error code
Status: Optional HTTP status
Context: Additional debugging info
Original Error: Full original error
```

### Check Error Type
```typescript
const normalized = normalizeError(error);
console.log('Error type:', normalized.type);
console.log('Message:', normalized.message);
console.log('Context:', normalized.context);
```

### Should We Retry?
```typescript
if (isRetryableError(error)) {
  // Safe to retry
} else {
  // Don't retry, show error to user
}
```

## Performance Notes

- `normalizeError()` is fast (object property checks)
- `handleError()` includes logging (minor perf impact in dev)
- No external dependencies
- Works in browser and server contexts

## Files Using This System

- `/src/components/paraphrasing-tool.tsx`
- `/src/utils/supabase-error-handler.ts`
- `/src/utils/puter-ai-retry.ts`
- `/src/lib/puter-ai-integration.ts`
- `/src/hooks/use-puter-auth.ts`
- `/src/hooks/usePuterTool.ts`
- `/src/components/auth-provider.tsx`

## More Info

- Full guide: `/ERROR_HANDLING_GUIDE.md`
- Implementation summary: `/ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md`
- Source: `/src/utils/error-utilities.ts`

## Migration Checklist

When adding error handling to new code:

- [ ] Import `{ handleError }` from error-utilities
- [ ] Wrap catch blocks with `handleError()`
- [ ] Pass descriptive context name ('ComponentName')
- [ ] Include debugging context object if relevant
- [ ] Use returned `message` for user-facing errors
- [ ] Test with empty error objects: `{}`
- [ ] Verify retryable errors: `isRetryableError(error)`
- [ ] Check auth errors: `isAuthError(error)`
