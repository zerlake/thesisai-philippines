# useAuthReady Hook - Quick Reference

## Overview
The `useAuthReady()` hook ensures that authentication has fully loaded before AI operations execute. This prevents race conditions where `session` is `null` during the loading phase.

## Usage

### Basic Pattern
```typescript
import { useAuth } from "./auth-provider";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function MyAIComponent() {
  const { session } = useAuth();
  const { isReady } = useAuthReady();

  const handleAIOperation = async () => {
    if (!isReady) {
      toast.error("Please wait while your session is loading...");
      return;
    }
    
    // Safe to use session here
    const response = await fetch("...", {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
  };

  return <button onClick={handleAIOperation}>Use AI</button>;
}
```

## Hook Return Values

```typescript
const { 
  session,                    // Session | null
  isLoading,                  // boolean
  isReady,                    // boolean (true when !isLoading && !!session)
  checkAuthBeforeAI          // (operationName: string) => boolean
} = useAuthReady();
```

### `session`
- The user's authentication session from Supabase
- Contains `user` and `access_token`
- `null` while loading or not authenticated

### `isLoading`
- `true` while AuthProvider is checking Supabase for existing session
- `false` when auth check is complete

### `isReady`
- `true` when session is loaded AND user is authenticated
- `false` otherwise (loading or not logged in)
- **Use this for most checks**

### `checkAuthBeforeAI(operationName)`
- Manual validation method for complex scenarios
- Returns `boolean` indicating if auth is ready
- Logs warnings if auth is loading
- Logs errors if user not authenticated

## Common Patterns

### Pattern 1: Simple AI Operation
```typescript
const handleGenerate = async () => {
  if (!isReady) {
    toast.error("Please wait while your session is loading...");
    return;
  }
  
  // Proceed with AI call
};
```

### Pattern 2: Early Input Validation
```typescript
const handleGenerate = async () => {
  // Validate input first
  if (!textInput.trim()) {
    toast.error("Please enter some text.");
    return;
  }
  
  // Then check auth
  if (!isReady) {
    toast.error("Please wait while your session is loading...");
    return;
  }
  
  // Proceed
};
```

### Pattern 3: Manual Checks
```typescript
const handleGenerate = async () => {
  const authOk = checkAuthBeforeAI("TextGeneration");
  if (!authOk) return;
  
  // Proceed
};
```

### Pattern 4: Conditional Rendering
```typescript
const { isReady } = useAuthReady();

return (
  <button onClick={handleGenerate} disabled={!isReady}>
    {isReady ? "Generate" : "Loading..."}
  </button>
);
```

## Components Already Using useAuthReady

✅ Paraphrasing Tool
✅ Q&A Simulator  
✅ Flashcards Generator
✅ Presentation Generator
✅ Title Generator
✅ Outline Generator
✅ Conclusion Generator
✅ Editor Component

## Migration Checklist

When adding this hook to a component:

- [ ] Import both `useAuth` and `useAuthReady`
- [ ] Call `const { isReady } = useAuthReady()` in component
- [ ] Check `if (!isReady)` before AI operations
- [ ] Show user-friendly error message
- [ ] Test with cold page refresh
- [ ] Test when logged out
- [ ] Test with network throttling

## Troubleshooting

### "User must be logged in" error appears
- Verify user is actually authenticated in Supabase
- Check if token has expired
- Look for auth redirect to /login page

### "Please wait..." message persists
- Check browser console for errors
- Verify Supabase client is initialized
- Check network requests in DevTools
- May indicate Supabase connection issue

### AI features still fail with null session
- Ensure component imports both hooks
- Verify `checkEditorAndAuth()` or similar also checks `isReady`
- Check if multiple async operations race each other

## Type Definitions

```typescript
// From src/hooks/use-auth-ready.ts
export function useAuthReady() {
  return {
    session: Session | null,
    isLoading: boolean,
    isReady: boolean,
    checkAuthBeforeAI: (operation: string) => boolean
  };
}
```

## Common Mistakes to Avoid

❌ **Don't**: Only check `!session`
```typescript
if (!session) {
  toast.error("Login required");
  return;
}
// session could still be loading!
```

✅ **Do**: Check `isReady` instead
```typescript
if (!isReady) {
  toast.error("Please wait while your session is loading...");
  return;
}
```

---

✅ **Best Practice**: Use `isReady` for all AI feature gates. It handles both loading and not-logged-in cases.
