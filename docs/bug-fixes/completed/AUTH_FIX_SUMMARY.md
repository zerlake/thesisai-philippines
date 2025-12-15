# Auth & Realtime Error Handling Fixes

## Issues Fixed

### 1. Notification Bell Realtime Errors
**Problem**: WebSocket connection failing when refresh token is invalid, causing unhandled promise rejections
**Location**: `src/components/notification-bell.tsx`

**Changes**:
- Added `isMounted` flag to prevent state updates after unmount
- Added strict auth checks: `session?.access_token && session?.user?.id`
- Added `supabase.auth.getUser()` verification before Realtime setup
- Changed all error logging to `console.debug()` for auth failures (non-obtrusive)
- Changed error toast behavior to silently fail and use polling as fallback
- Removed error messages shown to users for expected auth failures
- Added JWT and token error detection

### 1.5 Authenticated Notification Bell Wrapper
**New File**: `src/components/authenticated-notification-bell.tsx`

**Purpose**: Prevents NotificationBell from even attempting Realtime setup when unauthenticated
- Only renders NotificationBell if `session?.access_token` exists
- Uses component-level guard instead of relying on useEffect cleanup
- Eliminates race conditions during auth state transitions

### 2. Auth Provider Token Refresh Handling
**Problem**: Invalid refresh tokens not properly caught during session initialization
**Location**: `src/components/auth-provider.tsx`

**Changes**:
- Added `mounted` flag to prevent state updates after unmount
- Added logging for auth events with `[Auth]` prefix for debugging
- Improved error handling in `onAuthStateChange` callback
- Added specific detection for `TOKEN_REFRESHED` event
- Added try-catch around `getSession()` with specific handling for refresh token errors
- If refresh token is invalid, explicitly sign out user before handling as null session
- Added logging for session retrieval failures to diagnose issues

### 2.5 Global Error Suppression Utility
**New File**: `src/utils/supabase-error-handler.ts`

**Purpose**: Suppress expected Realtime/Auth errors from appearing in browser console
- Intercepts `console.error()` and `console.warn()`
- Detects known auth failure patterns
- Redirects known errors to `console.debug()` instead
- Keeps unexpected errors visible for debugging
- Activated on AuthProvider initialization (runs early)

### 3. Middleware Session Handling
**Problem**: Middleware crashes when session retrieval fails due to invalid refresh token
**Location**: `middleware.ts`

**Changes**:
- Wrapped session retrieval in try-catch
- Added specific error message checking for refresh token errors
- If refresh token is invalid, treat as unauthenticated and redirect to login
- Added logging with `[Middleware]` prefix for consistency
- Gracefully handles other session retrieval errors

## How It Works Now

1. **On App Load**: Auth provider initializes session
   - If refresh token is invalid, user is signed out and redirected to login
   - Invalid tokens don't cause crashes, just clean redirects
   - Error suppression utility activated automatically

2. **All Realtime Subscriptions**: Consistent protection across all features
   - **Notification Bell**: AuthenticatedNotificationBell wrapper prevents rendering when unauthenticated
   - **Goal Tracking Hook**: Only subscribes when `session?.access_token` exists
   - **Group Communication**: Verifies user auth before Realtime setup
   - All subscribe to auth state changes and verify before setting up channels

3. **Auth Verification**: Pre-subscription check
   - All hooks/components call `supabase.auth.getUser()` before subscribing
   - Prevents WebSocket connection attempts for unauthenticated users
   - Non-intrusive debug logging if verification fails

4. **Error Handling**: Graceful degradation
   - CHANNEL_ERROR, TIMED_OUT → logged to debug only
   - Auth errors (Refresh Token, JWT, Invalid) → silent fallback
   - Component still functions (uses polling instead of Realtime)
   - No error toasts for expected failures

5. **On Component Unmount**: 
   - All state updates prevented via `isMounted` flags
   - Realtime channels properly cleaned up with error handling
   - No "state update on unmounted component" warnings

6. **Console Output**: Clean and diagnostic
   - Auth errors suppressed → `console.debug()` instead of `console.error()`
   - WebSocket closure errors silently logged
   - Token refresh warnings converted to debug messages
   - Unexpected errors still visible for troubleshooting

## Testing the Fix

1. **Clear browser storage**: Delete all Supabase auth cookies/localStorage to simulate expired token
2. **Reload page**: Should redirect to login without errors
3. **Log in again**: Should work normally with fresh token
4. **Open dev console**: Look for `[Auth]`, `[Middleware]` logs but no red errors

## Console Logs Added

- `[Auth] Event: <event-type>` - Track auth state changes
- `[Auth] Token refreshed successfully` - Token refresh succeeded
- `[Auth] User signed out or token expired` - Sign out detected
- `[Auth] Refresh token invalid, signing out` - Invalid token detected
- `[Middleware] Session retrieval error:` - Middleware session errors
- Realtime subscription status changes logged without error toasts
