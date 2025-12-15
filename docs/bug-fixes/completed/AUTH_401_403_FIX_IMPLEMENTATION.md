# Authentication 401/403 Fix Implementation Guide

## Overview
This document provides step-by-step instructions for implementing fixes for the 401 Unauthorized and 403 Forbidden errors in the ThesisAI application.

## Changes Implemented

### 1. Session Validator Utility (`src/lib/auth/session-validator.ts`)
**Purpose**: Prevents 401 errors by ensuring valid sessions before API calls

**Features**:
- Automatic token refresh before expiry (5-minute window)
- Singleton pattern to prevent duplicate refresh attempts
- Automatic retry on 401 errors with session refresh
- Comprehensive logging using the centralized logger

**Usage Example**:
```typescript
import { withValidSession } from '@/lib/auth/session-validator';
import { supabase } from '@/integrations/supabase/client';

// Wrap any API call that requires authentication
const data = await withValidSession(
  supabase,
  async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) throw error;
    return data;
  },
  'Fetch user profile'
);
```

### 2. Enhanced RLS Policies (`supabase/migrations/31_fix_advisor_critic_rls_comprehensive.sql`)
**Purpose**: Fixes 403 errors by granting proper access to advisors, critics, and admins

**Changes**:
- Added policies for advisors to view/manage their student relationships
- Added policies for critics to view/manage their student relationships
- Added policies for admins to have full access to all relationships
- Added policies for advisors/critics to view and respond to requests directed to them

**Key Policies Added**:
1. `"Advisors can view their student relationships"` - Allows advisors to see students assigned to them
2. `"Critics can view their student relationships"` - Allows critics to see students assigned to them
3. `"Admins can manage all advisor relationships"` - Full admin access
4. `"Admins can manage all critic relationships"` - Full admin access
5. Request management policies for advisors and critics

## Implementation Steps

### Step 1: Apply Database Migration

Run the new RLS policy migration:

```bash
cd /c/Users/Projects/thesis-ai-fresh
supabase db push
```

Or apply manually via Supabase Dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/31_fix_advisor_critic_rls_comprehensive.sql`
3. Execute the SQL

### Step 2: Update Auth Provider with Logging

The auth provider should use the centralized logger for better diagnostics. Add to `src/components/auth-provider.tsx`:

```typescript
import { logger } from '@/lib/logger';

// In fetchProfile function, replace console.log with logger:
logger.debug('Fetching profile for user', { userId: user.id });

// On errors:
logger.error('Profile fetch failed', error);

// On token refresh:
if (_event === 'TOKEN_REFRESHED' && session) {
  logger.info('Token refreshed successfully', { userId: session.user.id });
  await handleAuthChange(session);
}
```

### Step 3: Integrate Session Validator in Components

Update components that make API calls to use the session validator:

**Example**: Dashboard component
```typescript
import { withValidSession } from '@/lib/auth/session-validator';

const fetchDashboardData = async () => {
  try {
    const data = await withValidSession(
      supabase,
      async () => {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .select('*');

        if (error) throw error;
        return data;
      },
      'Fetch dashboard data'
    );

    setDashboardData(data);
  } catch (error) {
    logger.error('Dashboard data fetch failed', error as Error);
    toast.error('Failed to load dashboard data');
  }
};
```

### Step 4: Update Realtime Connections

For Realtime subscriptions that fail with 401:

```typescript
import { sessionValidator } from '@/lib/auth/session-validator';

const setupRealtimeSubscription = async () => {
  // Ensure valid session before subscribing
  const isValid = await sessionValidator.ensureValidSession(supabase);

  if (!isValid) {
    logger.error('Cannot setup realtime: invalid session');
    return;
  }

  const channel = supabase
    .channel('dashboard-updates')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'dashboard_layouts' },
      (payload) => {
        logger.info('Realtime update received', { payload });
        handleUpdate(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logger.info('Realtime subscription active');
      } else if (status === 'CHANNEL_ERROR') {
        logger.error('Realtime subscription error');
      }
    });
};
```

### Step 5: Add Retry Logic for Network Errors

For components experiencing intermittent failures:

```typescript
const fetchWithRetry = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      logger.warn(`Attempt ${attempt} failed`, { error: error.message });

      if (attempt === maxRetries) {
        logger.error('Max retries reached', error);
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Retry logic failed unexpectedly');
};

// Usage:
const profile = await fetchWithRetry(() =>
  withValidSession(supabase, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }, 'Fetch profile')
);
```

## Testing the Fixes

### Test 1: Session Expiry Handling
1. Log in to the application
2. Wait for token to approach expiry (or manually set short expiry in dev)
3. Perform an action that requires authentication
4. Verify: Session is automatically refreshed, no 401 error
5. Check logs tab in admin dashboard for refresh events

### Test 2: RLS Policy Access
1. Create test advisor account
2. Assign students to the advisor
3. Log in as advisor
4. Navigate to advisor dashboard
5. Verify: Can see assigned students, no 403 errors
6. Try accessing student relationships
7. Verify: Access granted without errors

### Test 3: Admin Access
1. Log in as admin
2. Navigate to admin dashboard → User Management
3. Try viewing advisor relationships
4. Verify: Full access to all relationships, no 403 errors

### Test 4: Realtime Connection Stability
1. Log in and navigate to dashboard
2. Open browser DevTools → Network tab
3. Monitor WebSocket connections
4. Wait 10-15 minutes
5. Verify: No disconnections or 401 errors in realtime channel

### Test 5: Profile Data Persistence
1. Update profile settings (avatar, name)
2. Navigate to different pages
3. Refresh the browser
4. Verify: Profile data persists, doesn't disappear

## Monitoring and Debugging

### Check Logs
Navigate to Admin Dashboard → Logs tab to view:
- Session refresh events
- Authentication failures
- RLS policy denials
- API call errors

### Log Levels to Watch:
- **ERROR**: Authentication failures, session refresh failures
- **WARN**: Token approaching expiry, retry attempts
- **INFO**: Successful refreshes, authentication events
- **DEBUG**: Session validation checks

### Common Log Messages:
```
[INFO] Token refreshed successfully
[WARN] Session expiring soon, refreshing token
[ERROR] Session refresh failed
[DEBUG] Session is valid
[ERROR] Fetch user profile: No valid session available
```

## Rollback Plan

If issues occur after implementing these fixes:

### Rollback Database Changes:
```sql
-- Drop the new policies
DROP POLICY IF EXISTS "Advisors can view their student relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Critics can view their student relationships" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "Admins can manage all advisor relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Admins can manage all critic relationships" ON public.critic_student_relationships;
-- ... (drop all policies from migration 31)
```

### Rollback Code Changes:
1. Remove session validator imports
2. Revert to direct supabase calls
3. Remove withValidSession wrappers

## Production Deployment Checklist

Before deploying to production:

- [ ] Database migration 31 applied successfully
- [ ] All 401 errors resolved in testing
- [ ] All 403 errors resolved in testing
- [ ] Profile data persists correctly
- [ ] Realtime connections stable
- [ ] Session refresh working automatically
- [ ] Logging system operational
- [ ] Admin can access all advisor/critic relationships
- [ ] Advisors can access their student assignments
- [ ] Critics can access their student assignments
- [ ] Load testing completed (simulate multiple users)
- [ ] Error monitoring configured (check logs regularly)

## Additional Recommendations

### 1. Add Session Health Monitoring
Create a component to monitor session health:

```typescript
const SessionHealthMonitor = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const isValid = await sessionValidator.validateSession(supabase);
      if (!isValid) {
        logger.warn('Session health check failed');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
};
```

### 2. Add User-Facing Session Warnings
Show users when their session is about to expire:

```typescript
if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
  toast.info('Your session will expire soon. Refreshing automatically...');
}
```

### 3. Implement Session Recovery
Add a mechanism to recover from complete session loss:

```typescript
const handleSessionLoss = async () => {
  logger.critical('Session lost, redirecting to login');
  await supabase.auth.signOut();
  router.push('/login?reason=session_expired');
};
```

## Support and Troubleshooting

If issues persist after implementing these fixes:

1. Check the Logs tab in Admin Dashboard
2. Look for patterns in error timing
3. Verify RLS policies are applied: `SELECT * FROM pg_policies WHERE tablename IN ('advisor_student_relationships', 'critic_student_relationships');`
4. Test session refresh manually: `await supabase.auth.refreshSession();`
5. Verify auth provider is using autoRefreshToken: true

## Success Criteria

The fixes are successful when:
1. Zero 401 Unauthorized errors in production for 24 hours
2. Zero 403 Forbidden errors for advisor/critic access
3. Profile data remains consistent across sessions
4. Realtime connections maintain stable authenticated state
5. Token refresh happens automatically without user intervention
6. All roles (student, advisor, critic, admin) can access their respective data

## Next Steps

After successful implementation:
1. Monitor logs for 48 hours
2. Collect user feedback on authentication experience
3. Consider implementing refresh token rotation for enhanced security
4. Add metrics dashboard for authentication events
5. Document common authentication patterns for future development
