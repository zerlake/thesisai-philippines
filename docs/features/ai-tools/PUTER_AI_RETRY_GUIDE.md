# Puter AI Retry Logic and Error Handling Guide

## Overview
Implemented comprehensive error handling and exponential backoff retry logic for all Puter AI calls (summarize, improve, rewrite). This prevents transient failures from disrupting the user experience.

## Features

### 1. Automatic Retry with Exponential Backoff
- **Max Retries**: 3 attempts (1 initial + 2 retries)
- **Initial Delay**: 1000ms
- **Max Delay**: 10000ms
- **Backoff Multiplier**: 2x

**Example flow**:
```
Attempt 1: Fails → Wait 1000ms
Attempt 2: Fails → Wait 2000ms  
Attempt 3: Fails → Wait 4000ms
Attempt 4: Give up
```

### 2. Error Categorization
Errors are categorized into 4 types:

#### AUTH_ERROR
- Unauthorized, invalid token, authentication failure, permission denied
- **Retry?** NO - User must re-authenticate
- **Message**: "Authentication error with AI service. Please log out and back in..."

#### NETWORK_ERROR
- Network connection issues, ECONNREFUSED, connection timeouts
- **Retry?** YES - Wait and try again
- **Message**: "Network error connecting to AI service. Please check your internet..."

#### TIMEOUT_ERROR
- Request took too long (>30 seconds by default)
- **Retry?** YES - Service might be temporarily slow
- **Message**: "AI service is taking too long to respond..."

#### SERVICE_ERROR
- 500, 502, 503, service unavailable errors
- Also includes: "Cannot read properties of undefined" errors
- **Retry?** YES - Service is temporarily unavailable
- **Message**: "AI service is temporarily unavailable. Please try again..."

#### UNKNOWN_ERROR
- Any error not matching above categories
- **Retry?** NO - Unknown issue, don't retry
- **Message**: Pass through original error message

### 3. Detailed Logging
All retry attempts are logged with diagnostic information:

```
[Puter AI] Attempt 1/3 failed: {
  errorType: 'SERVICE_ERROR',
  message: 'Cannot read properties of undefined...',
  retriable: true
}
[Puter AI] Retrying in 1000ms...
[Puter AI] Attempt 2/3 failed: ...
[Puter AI] Succeeded on attempt 2/3
```

### 4. User-Friendly Error Messages
Instead of technical errors, users see:
- "Network error connecting to AI service"
- "AI service is temporarily unavailable"
- "AI service is taking too long to respond"
- "Authentication error - please re-login"

## Implementation Details

### Core Files

#### `src/utils/puter-ai-retry.ts`
New utility providing:
- `callPuterAIWithRetry()` - Wraps Puter AI calls with retry logic
- `categorizePuterError()` - Determines error type
- `shouldRetryPuterCall()` - Decides if retry is appropriate
- `getPuterErrorMessage()` - Returns user-friendly message
- `isPuterAIAvailable()` - Checks if Puter is ready

#### `src/components/puter-ai-tools.tsx`
Updated all three handlers:
- `handleImproveText()` - Fix Grammar button
- `handleSummarizeText()` - Summarize button
- `handleRewriteText()` - Rewrite dropdown options

Changes:
- Added attempt tracking
- Replaced direct `window.puter.ai.chat()` calls with `callPuterAIWithRetry()`
- Changed error logging from `console.error()` to `console.debug()`
- Use `getPuterErrorMessage()` for user messages
- Use `isPuterAIAvailable()` for availability check

## Configuration

### Default Retry Config
```typescript
const DEFAULT_CONFIG = {
  maxRetries: 3,        // Total of 4 attempts
  initialDelayMs: 1000, // Start with 1 second
  maxDelayMs: 10000,    // Cap at 10 seconds
  backoffMultiplier: 2, // Double each time
  timeoutMs: 30000,     // 30 second timeout per attempt
};
```

### Custom Config Example
```typescript
const result = await callPuterAIWithRetry(
  chatFn,
  {
    maxRetries: 5,      // More retries for important requests
    timeoutMs: 60000,   // Longer timeout for complex operations
    initialDelayMs: 2000,
  }
);
```

## Error Handling Flow

```
┌─ callPuterAIWithRetry() called
│
├─ Try API call with timeout wrapper
│  └─ If timeout: throw "timed out after XXXms"
│
└─ On error:
   ├─ Categorize error type
   ├─ Log attempt details
   ├─ Check if retriable
   │  ├─ No: Throw immediately
   │  └─ Yes: Continue
   ├─ Check if max retries exceeded
   │  ├─ Yes: Throw
   │  └─ No: Calculate backoff delay
   ├─ Wait for delay
   ├─ Call onRetry callback (optional)
   └─ Retry attempt
```

## Usage Example

### Basic Usage
```typescript
try {
  const result = await callPuterAIWithRetry(
    () => window.puter.ai.chat({ messages, temperature: 0.5 })
  );
  // Use result
} catch (error) {
  const message = getPuterErrorMessage(error);
  toast.error(message);
}
```

### With Retry Tracking
```typescript
let attemptCount = 0;

try {
  const result = await callPuterAIWithRetry(
    () => window.puter.ai.chat({ messages, temperature: 0.5 }),
    { maxRetries: 3 },
    (attempt) => {
      attemptCount = attempt;
      console.log(`Retrying... attempt ${attempt}`);
    }
  );
} catch (error) {
  const message = getPuterErrorMessage(error, attemptCount);
  toast.error(message);
}
```

## Testing Scenarios

### Test 1: Network Timeout
```
Expected: 3 attempts with increasing delays, then error
Console: "AI service is taking too long to respond"
```

### Test 2: Service Error (503)
```
Expected: 3 retries, eventual success or error
Console: "AI service is temporarily unavailable"
```

### Test 3: Auth Error
```
Expected: Immediate failure, no retries
Console: "Authentication error with AI service"
```

### Test 4: Success on 2nd Attempt
```
Expected: Fail once, retry succeeds
Console: "Succeeded on attempt 2/3"
```

## Monitoring and Debugging

### Console Logs
Enable `[Puter AI]` logs in DevTools console:
- `filter: "[Puter AI]"` to see only Puter retry logs
- All logs are `console.log()` or `console.debug()`
- Error details logged but not shown to user

### Metrics to Track
- Retry frequency: If users see retries often, Puter service might be unstable
- Auth failure rate: If auth errors increase, check Puter authentication
- Timeout patterns: If timeouts occur at specific times, check Puter load

### Error Message Distribution
- Count how often each message appears
- High "temporarily unavailable" → Puter service issues
- High "authentication error" → User auth problems
- High "taking too long" → Timeout config might need tuning

## Future Enhancements

1. **Circuit Breaker**: Disable Puter AI if error rate exceeds threshold
2. **Error Telemetry**: Send retry stats to Sentry/monitoring
3. **User Analytics**: Track which operations fail most often
4. **Adaptive Timeout**: Adjust timeout based on historical response times
5. **Request Queuing**: Queue requests during high load
6. **Cache Results**: Cache recently summarized/rewritten content

## Related Documentation
- `AUTH_FIX_SUMMARY.md` - Auth and Realtime error fixes
- `REALTIME_FIXES_COMPREHENSIVE.md` - All Realtime subscription fixes
- `src/utils/puter-ai-retry.ts` - Implementation details
