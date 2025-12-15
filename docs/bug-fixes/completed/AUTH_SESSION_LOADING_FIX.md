# Auth Session Loading Fix

## Problem Identified

AI tools (Paraphrasing, Q&A Simulator, Flashcards, Presentation, etc.) were experiencing race conditions where they attempted to use the `session` object before it fully loaded from Supabase authentication.

**Root Cause**: The `AuthProvider` context had an `isLoading` state but didn't expose it to components. This meant components using `useAuth()` received:
- `session: null` while loading
- `session: { user, access_token }` when ready

This caused PuterAITools and other AI features to fail because they need a valid session but couldn't wait for it to load.

## Solution Implemented

### 1. Updated `AuthContextType` (auth-provider.tsx)
- Added `isLoading: boolean` to the context type definition
- Exported `isLoading` in the context provider value

```typescript
type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  profile: Profile;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;  // ← NEW
};
```

### 2. Created `useAuthReady` Hook
- New helper hook at `src/hooks/use-auth-ready.ts`
- Encapsulates the logic for checking if auth is ready
- Returns:
  - `session`: The actual session
  - `isLoading`: Whether auth is still loading
  - `isReady`: Convenience flag (true when `!isLoading && !!session`)
  - `checkAuthBeforeAI()`: Helper method for manual checks

```typescript
export function useAuthReady() {
  const { session, isLoading } = useAuth();
  
  const isReady = !isLoading && !!session;
  
  const checkAuthBeforeAI = (operation: string): boolean => {
    if (isLoading) {
      console.warn(`[${operation}] Auth is still loading, waiting...`);
      return false;
    }
    if (!session) {
      console.error(`[${operation}] No active session.`);
      return false;
    }
    return true;
  };

  return { session, isLoading, isReady, checkAuthBeforeAI };
}
```

### 3. Updated Components Using AI Features

Applied the fix to all AI-connected components:

**Fixed Components**:
- ✅ `editor.tsx` - Now waits for auth before rendering PuterAITools
- ✅ `paraphrasing-tool.tsx` - Checks `isReady` before calling Puter AI
- ✅ `qa-simulator.tsx` - Checks `isReady` before fetching from Supabase functions
- ✅ `flashcards-generator.tsx` - Checks `isReady` before generating
- ✅ `presentation-generator.tsx` - Checks `isReady` before generating
- ✅ `title-generator.tsx` - Checks `isReady` before generating
- ✅ `outline-generator.tsx` - Checks `isReady` before generating
- ✅ `conclusion-generator.tsx` - Checks `isReady` before generating
- ✅ `puter-ai-tools.tsx` - Already had proper auth checks

**Pattern Applied**:
```typescript
const { session } = useAuth();
const { isReady } = useAuthReady();  // ← NEW

const handleGenerate = async () => {
  // ... input validation ...
  
  // ← NEW: Check if auth is ready
  if (!isReady) {
    toast.error("Please wait while your session is loading...");
    return;
  }
  
  // ... proceed with AI operations ...
};
```

## Benefits

1. **Prevents Race Conditions**: Components wait for session to fully load
2. **Better UX**: Users get clear feedback ("Please wait...") instead of cryptic errors
3. **Consistency**: Same pattern across all AI-connected tools
4. **Debugging**: Clearer console logs help identify auth issues
5. **Type Safety**: New `useAuthReady()` hook provides proper typing

## How It Works

```
User navigates to AI tool
    ↓
Component renders with `isLoading=true`, `session=null`
    ↓
AuthProvider checks Supabase for existing session
    ↓
`isLoading=false`, `session={ user, access_token }`
    ↓
`isReady=true` → AI buttons become enabled
    ↓
User clicks button → `handleGenerate()` checks `isReady` again
    ↓
Proceeds with Puter/Supabase function calls
```

## Migration Guide for New Components

When creating new components that use AI features:

1. Import both hooks:
```typescript
import { useAuth } from "./auth-provider";
import { useAuthReady } from "@/hooks/use-auth-ready";
```

2. Use in component:
```typescript
const { session } = useAuth();
const { isReady } = useAuthReady();
```

3. Check before AI operations:
```typescript
if (!isReady) {
  toast.error("Please wait while your session is loading...");
  return;
}
```

## Components Pending Update

The following components may benefit from this fix but require careful integration:
- `rich-text-editor.tsx` - Uses different auth check pattern
- `ai-assistant-panel.tsx` - May have its own auth handling
- `grammar-checker.tsx` - Needs verification
- `originality-check-panel.tsx` - Needs verification
- `statistical-analysis-panel.tsx` - Needs verification

## Testing Recommendations

1. **Cold Start**: Refresh page and immediately click AI feature button
   - Should show loading message, not error
   
2. **Logged Out**: Sign out and try to use AI feature
   - Should show appropriate error, not crash
   
3. **Session Expires**: Use app until session expires
   - Should handle gracefully with auth redirect

4. **Network Slow**: Throttle network and test
   - Should still show proper loading state feedback
