# Batch Error Handling Fixes

This document tracks fixes applied to catch blocks to properly handle unknown error types.

## Strategy

Instead of manually fixing each file, we follow this pattern:

### Pattern 1: Basic catch block with error access
```typescript
// BEFORE
catch (error) {
  throw new Error(error.message);
}

// AFTER - Use ensureError utility
import { ensureError } from '@/lib/errors';

catch (error) {
  const err = ensureError(error);
  throw new Error(err.message);
}
```

### Pattern 2: APIError/AppError construction
```typescript
// BEFORE
catch (error) {
  throw new APIError(
    error instanceof Error ? error.message : 'Unknown',
    { originalError: error }
  );
}

// AFTER
import { ensureError } from '@/lib/errors';

catch (error) {
  const err = ensureError(error);
  throw new APIError(
    err.message,
    { originalError: err }
  );
}
```

### Pattern 3: Logging/message extraction
```typescript
// BEFORE
catch (error) {
  console.error(error.message);
}

// AFTER
import { getErrorMessage } from '@/lib/error-normalizer';

catch (error) {
  console.error(getErrorMessage(error));
}
```

## Files Requiring Fixes

Priority 1 (Core files that block compilation):
- [ ] src/lib/api-client.ts (already done - line 134)
- [ ] src/lib/server-auth.ts (already done - line 127)
- [ ] src/lib/dashboard/api-error-handler.ts (already done - line 430)

Priority 2 (Frequently used files):
- [ ] src/hooks/use-api-call.ts (line 69 - already correct)
- [ ] src/hooks/use-async.ts (line 77 - already correct)
- [ ] src/lib/errors.ts (done)

Priority 3 (Component/Hook files):
- [ ] src/components/admin-dashboard.tsx
- [ ] src/components/research-question-generator.tsx
- [ ] src/lib/puter-ai-wrapper.ts
- [ ] src/lib/personalization/dashboard-customization.ts
- And others listed in findings

## Implementation Notes

1. The `ensureError()` utility function is now available from `@/lib/errors`
2. For simple message extraction, use `getErrorMessage()` from `@/lib/error-normalizer`
3. For status codes, use `getErrorStatus()` from `@/lib/error-normalizer`
4. All error-prone files should have proper error typing to satisfy TypeScript's strict mode

## Build Status

After completing Priority 1 and 2 fixes, run:
```bash
pnpm tsc --noEmit
```

If still failing, check the specific error message and apply Priority 3 fixes accordingly.
