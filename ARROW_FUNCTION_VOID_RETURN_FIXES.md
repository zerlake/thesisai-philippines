# Arrow Function Void Return Type Fixes

## Problem
Arrow functions that use statements without explicit `return` were returning the result of assignment or method call expressions instead of `undefined` (void). This caused TypeScript errors when the function is typed to return `void | Promise<void>`.

### Example Error:
```typescript
// ❌ BEFORE - Type error
action: () => (window.location.href = '/auth/login')
// Returns: '/auth/login' (string type) instead of void

// ✅ AFTER - Fixed
action: () => { window.location.href = '/auth/login'; }
// Returns: undefined (void type)
```

## Root Cause
In JavaScript, an arrow function with implicit return (parentheses without braces) returns the expression value:
- `() => expression` returns the value of `expression`
- `() => { expression; }` executes the statement and returns `undefined`

When assignment or method calls are the expression, they return their values (strings, DOM elements, etc.) rather than `void`.

## Files Fixed

### src/lib/dashboard/api-error-handler.ts ✅
**Interface:** `RecoveryAction { action: () => Promise<void> | void }`

**Fixes Applied:**
1. Line 253: `() => location.reload()` → `() => { location.reload(); }`
2. Line 262: `() => (window.location.href = '/auth/login')` → `() => { window.location.href = '/auth/login'; }`
3. Line 271: `() => location.reload()` → `() => { location.reload(); }`
4. Line 277: `() => window.open('/status', '_blank')` → `() => { window.open('/status', '_blank'); }`

**Before:**
```typescript
actions.push({
  label: 'Log In Again',
  description: 'Your session has expired',
  action: () => (window.location.href = '/auth/login') // ❌ Type error
});
```

**After:**
```typescript
actions.push({
  label: 'Log In Again',
  description: 'Your session has expired',
  action: () => { window.location.href = '/auth/login'; } // ✅ Fixed
});
```

## Why Other Files Don't Have This Issue

### React Event Handlers (e.g., admin-dashboard.tsx)
React's `onClick` handler accepts:
```typescript
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
```

However, TypeScript's `onClick` handler is lenient and allows any return value. The fix isn't strictly necessary for React handlers, but these patterns are still in the codebase:
- `onClick={() => window.location.href = '/mcp-demo'}`
- `onClick={() => window.open('https://mcp-spec.io/', '_blank')}`

These work because React ignores the return value, but they could be improved for consistency.

### Async Functions (e.g., use-error-recovery.ts)
These are correctly typed:
```typescript
action: () => Promise<void>
// Implemented as:
async () => { await someAsyncOperation(); }
// or:
() => somePromise.then(...)
```

These return `Promise<void>`, so they don't have the issue.

## Type Signatures Verified

Files with action handlers properly typed:
- ✅ `src/lib/dashboard/api-error-handler.ts` - `action: () => Promise<void> | void`
- ✅ `src/hooks/use-error-recovery.ts` - `action: () => Promise<void>`
- ✅ `src/lib/performance/cleanup-manager.ts` - `() => void | Promise<void>`
- ✅ `src/hooks/useSmartNotifications.ts` - `() => Promise<void>`

## Testing the Fix

To verify the fix works:

```bash
# Type check
pnpm tsc --noEmit

# Build
pnpm build

# The error should no longer appear:
# "Type error: Type 'string' is not assignable to type 'void | Promise<void>'."
```

## Pattern Summary

### Anti-pattern (Implicit Return):
```typescript
// ❌ Returns the expression value (wrong type)
() => location.reload()           // returns undefined (works by accident)
() => (x = y)                     // returns y (type error)
() => window.open(url)            // returns Window | null (type error)
() => window.location.href = url  // returns url string (type error)
```

### Correct Pattern (Statement Block):
```typescript
// ✅ Returns undefined (void)
() => { location.reload(); }
() => { x = y; }
() => { window.open(url); }
() => { window.location.href = url; }
```

### Alternative: Async Pattern:
```typescript
// ✅ Returns Promise<void>
async () => { await operation(); }
() => Promise.resolve()
() => new Promise(resolve => setTimeout(resolve, 1000))
```

## Status
- [x] Identified all RecoveryAction usages
- [x] Fixed void return type issues in api-error-handler.ts
- [x] Verified other files have correct typing
- [x] Documented pattern for future prevention
- [x] Ready for build verification

## Recommendations for Future Code

1. **Avoid implicit returns for void callbacks:**
   ```typescript
   // ❌ Don't
   const handler = () => doSomething();
   
   // ✅ Do
   const handler = () => { doSomething(); };
   // or
   const handler = async () => { await doSomething(); };
   ```

2. **Use TypeScript strict mode** to catch these issues early

3. **Consider ESLint rules** to enforce explicit braces for arrow functions with statements

4. **Document action callback patterns** in your component library guidelines
