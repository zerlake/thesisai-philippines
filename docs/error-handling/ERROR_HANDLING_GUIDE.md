# Error Handling Guide

## Overview

This guide explains the unified error handling system implemented across the thesis-ai application. The system provides consistent error normalization, classification, and user-friendly messaging.

## Root Cause Analysis

The original issue was that errors were being logged as empty objects `{}` in several places:

1. **Puter SDK/API returns empty error objects** - When the Puter AI service encounters issues, it sometimes returns empty error objects instead of properly formatted errors
2. **Inconsistent error extraction** - Different parts of the code were handling errors differently, leading to lost error details
3. **Silent failures** - Empty error objects weren't being properly logged, making debugging difficult
4. **User-unfriendly messages** - Empty objects resulted in generic error messages that didn't explain what went wrong

## Solution Architecture

### Core Component: `error-utilities.ts`

The unified error handling system is built around a single source of truth: `/src/utils/error-utilities.ts`

**Key Features:**
- **Error Normalization**: Converts any error type into a consistent structure
- **Error Classification**: Automatically categorizes errors by type (Auth, Network, Timeout, Service, etc.)
- **User-Friendly Messages**: Provides appropriate messaging based on error type
- **Structured Logging**: Enables proper debugging and error tracking
- **Error Recovery Hints**: Identifies retryable errors for automatic retry logic

### Error Types

The system classifies errors into these types:

```typescript
enum ErrorType {
  EMPTY_OBJECT = 'EMPTY_OBJECT',        // Error is an empty object
  UNDEFINED = 'UNDEFINED',              // Error is null or undefined
  NETWORK = 'NETWORK',                  // Network/connection issues
  TIMEOUT = 'TIMEOUT',                  // Request timeout
  AUTH = 'AUTH',                        // Authentication/authorization
  VALIDATION = 'VALIDATION',            // Invalid input
  SERVICE = 'SERVICE',                  // Server/service error (5xx)
  NOT_FOUND = 'NOT_FOUND',              // Resource not found (404)
  CONFLICT = 'CONFLICT',                // Conflict (409)
  UNKNOWN = 'UNKNOWN',                  // Cannot determine type
}
```

### Normalized Error Structure

All errors are normalized into this structure:

```typescript
interface NormalizedError {
  message: string;           // Always populated error message
  code?: string;            // Error code (if available)
  statusCode?: number;      // HTTP status code
  type: ErrorType;          // Classified error type
  originalError: any;       // Original error for reference
  context?: Record<string, any>;  // Additional debugging context
  timestamp: number;        // When error occurred
}
```

## Usage Patterns

### 1. Basic Error Handling

**Before:**
```typescript
try {
  const result = await someFetch();
} catch (error: any) {
  const message = error?.message || 'Unknown error';
  console.error("Error:", message);
  toast.error(message);
}
```

**After:**
```typescript
import { handleError } from '@/utils/error-utilities';

try {
  const result = await someFetch();
} catch (error) {
  const { message } = handleError(error, 'MyComponent');
  toast.error(message);
}
```

### 2. Error Handling with Logging

**Before:**
```typescript
catch (error: any) {
  let errorMessage = 'Unknown error';
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  console.error(errorMessage, error);
}
```

**After:**
```typescript
import { handleError } from '@/utils/error-utilities';

catch (error) {
  const { message, normalized } = handleError(
    error, 
    'MyComponent',
    { additionalContext: 'for debugging' }
  );
  // message is user-friendly
  // normalized contains full error details
}
```

### 3. Retry Logic

**Before:**
```typescript
const shouldRetry = error?.message?.includes('timeout') || 
                    error?.message?.includes('503');
```

**After:**
```typescript
import { isRetryableError } from '@/utils/error-utilities';

const shouldRetry = isRetryableError(error);
```

### 4. Authentication Checks

**Before:**
```typescript
if (error?.message?.includes('unauthorized') || 
    error?.code === '401') {
  // Handle auth error
}
```

**After:**
```typescript
import { isAuthError } from '@/utils/error-utilities';

if (isAuthError(error)) {
  // Handle auth error
}
```

## Integration Points

### Files Updated

1. **`src/utils/error-utilities.ts`** (NEW)
   - Core error handling system
   - All classification logic
   - User-friendly message generation

2. **`src/utils/supabase-error-handler.ts`**
   - Now uses normalized errors
   - Improved error suppression
   - Better error type detection

3. **`src/utils/puter-ai-retry.ts`**
   - Handles empty error objects from Puter SDK
   - Consistent error classification
   - Better error messages in retry logic

4. **`src/lib/puter-ai-integration.ts`**
   - Uses normalized errors for logging
   - Consistent error handling in retry logic

5. **`src/components/paraphrasing-tool.tsx`**
   - Simplified error handling
   - Better error logging
   - Improved user messaging

6. **`src/hooks/use-puter-auth.ts`**
   - Consistent error handling for auth operations
   - Better logging

7. **`src/hooks/usePuterTool.ts`**
   - Uses normalized errors
   - Better error messages for users

8. **`src/components/auth-provider.tsx`**
   - Uses normalized errors
   - Better context for debugging

## Empty Object Handling

Special handling for empty error objects (common with Puter SDK):

```typescript
const error = {};  // Empty object from SDK

// normalizeError will detect this and:
// 1. Set type to ErrorType.EMPTY_OBJECT
// 2. Provide a default message explaining the issue
// 3. Log it properly for debugging

const normalized = normalizeError(error, 'MyContext');
// normalized.message = "An error occurred but no details were provided..."
// normalized.type = ErrorType.EMPTY_OBJECT
```

## Error Messages

### By Error Type

| Type | User Message | Action |
|------|--------------|--------|
| EMPTY_OBJECT | "An error occurred. Please try again or contact support..." | Retry or contact support |
| AUTH | "Authentication error. Please log out and back in..." | Re-authenticate |
| TIMEOUT | "Request took too long. Please try again." | Retry |
| NETWORK | "Network error. Check internet connection..." | Check connection, retry |
| SERVICE | "Service temporarily unavailable. Try again in a moment." | Retry with backoff |
| NOT_FOUND | "Requested resource not found." | Check input, handle 404 |
| VALIDATION | "Invalid input: {details}" | Fix input |
| UNKNOWN | Original error message | Investigate |

## Debugging

### Development Logging

In development mode, errors are logged with full context:

```
[ErrorContext] EMPTY_OBJECT
Message: ...
Code: ...
Status: ...
Context: { ... }
Original Error: ...
```

In production, errors are logged more tersely:

```
[ErrorContext] EMPTY_OBJECT: Error message
```

### Error Details for Tracking

Get safe error details for sending to logging services:

```typescript
import { getErrorDetails } from '@/utils/error-utilities';

const details = getErrorDetails(normalized);
// Safe to send to error tracking service
// Does not include full originalError object
```

## Best Practices

1. **Always normalize errors from external sources**
   ```typescript
   const normalized = normalizeError(apiError, 'FeatureName');
   ```

2. **Provide context when handling errors**
   ```typescript
   const { message } = handleError(error, 'ComponentName', {
     action: 'fetching data',
     resourceId: '123'
   });
   ```

3. **Use type-specific handlers**
   ```typescript
   if (isAuthError(error)) {
     // Redirect to login
   } else if (isRetryableError(error)) {
     // Retry with backoff
   }
   ```

4. **Log errors for debugging**
   ```typescript
   const { message, normalized } = handleError(error, 'MyFeature');
   // normalized.context will have debugging info
   ```

5. **Don't expose internal error details to users**
   ```typescript
   // Use getUserFriendlyMessage, not error.message
   const message = getUserFriendlyMessage(normalized);
   ```

## Testing Empty Objects

To test empty object handling:

```typescript
import { normalizeError, ErrorType } from '@/utils/error-utilities';

const emptyError = {};
const normalized = normalizeError(emptyError, 'TestContext');

expect(normalized.type).toBe(ErrorType.EMPTY_OBJECT);
expect(normalized.message).toBeTruthy();
expect(normalized.originalError).toBe(emptyError);
```

## Future Improvements

1. Add error tracking service integration
2. Implement error boundary component for React
3. Add error recovery suggestions
4. Implement error analytics dashboard
5. Add performance monitoring for errors

## Questions & Support

For questions about the error handling system, refer to:
- `/src/utils/error-utilities.ts` - Core implementation with detailed comments
- Test files (when created) for usage examples
- This guide for patterns and best practices
