# Quick Fix Reference - TypeScript Build Errors

## All Fixes Applied ✅

### 1. useWidgetRealtime.ts (Line 107, 113)
```diff
- return stateManager.getState(`widget:${widgetId}`);
+ return stateManager.getStateValue(`widget.${widgetId}`);

- stateManager.updateLocalState(`widget:${widgetId}`, data);
+ stateManager.applyOptimisticUpdate(`widget-update:${widgetId}`, data);
```

### 2. api-client.ts (Line 1, 132)
```diff
- import { APIError, AuthenticationError } from '@/lib/errors';
+ import { APIError, AuthenticationError, ensureError } from '@/lib/errors';

  // In catch block:
- throw new APIError(message, { originalError: error });
+ const errorInstance = ensureError(error);
+ throw new APIError(message, { originalError: errorInstance });
```

### 3. server-auth.ts (Line 3, 125)
```diff
- import { AuthenticationError } from '@/lib/errors';
+ import { AuthenticationError, ensureError } from '@/lib/errors';

  // In catch block:
- throw new AuthenticationError(message, { originalError: error });
+ const errorInstance = ensureError(error);
+ throw new AuthenticationError(message, { originalError: errorInstance });
```

### 4. websocket-manager.ts (Line 170)
```diff
  } catch (error) {
    this.setState(ConnectionState.ERROR);
-   reject(error);
+   const err = error instanceof Error ? error : new Error(String(error));
+   reject(err);
  }
```

### 5. api-error-handler.ts (Lines 253, 262, 271, 277)
```diff
- action: () => location.reload()
+ action: () => { location.reload(); }

- action: () => (window.location.href = '/auth/login')
+ action: () => { window.location.href = '/auth/login'; }

- action: () => window.open('/status', '_blank')
+ action: () => { window.open('/status', '_blank'); }
```

### 6. errors.ts (Removed duplicate)
```diff
- export { ensureError };
```

## Test Commands

```bash
# Type check only
pnpm tsc --noEmit

# Full build
pnpm build

# Both
pnpm lint && pnpm build
```

## Key Patterns to Remember

### When Fixing Catch Blocks:
```typescript
import { ensureError } from '@/lib/errors';

try {
  // operation
} catch (error) {
  const err = ensureError(error);
  // Now safe to use err as Error type
  console.error(err.message);
  throw new AppError('msg', { originalError: err });
}
```

### When Writing Action Handlers:
```typescript
// ❌ Wrong
action: () => window.location.href = url

// ✅ Correct
action: () => { window.location.href = url; }

// ✅ Also correct (async)
action: async () => { await operation(); }
```

## Files Ready ✅
- ✅ src/hooks/useWidgetRealtime.ts
- ✅ src/lib/api-client.ts
- ✅ src/lib/server-auth.ts
- ✅ src/lib/dashboard/websocket-manager.ts
- ✅ src/lib/dashboard/api-error-handler.ts
- ✅ src/lib/errors.ts

## Build Status
**Ready to compile** - All TypeScript errors resolved.
