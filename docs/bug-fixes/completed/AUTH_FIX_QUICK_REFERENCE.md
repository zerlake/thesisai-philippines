# Quick Reference: Authentication 401/403 Fixes

## Problem Summary
- **401 Unauthorized**: API/Realtime endpoints rejecting authenticated users
- **403 Forbidden**: Advisor/Critic tables denying access to authorized roles
- **Intermittent Profile Loss**: User data disappearing during operations

## Root Causes
1. **401 Errors**: Token expiring during long sessions without proactive refresh
2. **403 Errors**: RLS policies only allowing students to view their own data, blocking advisors/critics/admins
3. **Profile Loss**: Auth provider falling back to minimal profiles during transient errors

## Solutions Implemented

### 1. Session Validator (`src/lib/auth/session-validator.ts`)
✅ **What it does**: Validates sessions before API calls, auto-refreshes expiring tokens, retries on 401 errors

✅ **How to use**:
```typescript
import { withValidSession } from '@/lib/auth/session-validator';

const data = await withValidSession(
  supabase,
  async () => supabase.from('table').select('*'),
  'Operation name'
);
```

### 2. Enhanced RLS Policies (`migrations/31_fix_advisor_critic_rls_comprehensive.sql`)
✅ **What it does**: Grants proper access to advisors, critics, and admins for their relationships

✅ **New policies added**:
- Advisors can view/manage their student relationships
- Critics can view/manage their student relationships
- Admins have full access to all relationships
- Advisors/Critics can respond to requests directed to them

## Quick Fix Checklist

### Database (Run Once)
```bash
# Apply RLS policy fixes
cd /c/Users/Projects/thesis-ai-fresh
supabase db push
```

**Or via Supabase Dashboard**:
1. SQL Editor → New Query
2. Copy `supabase/migrations/31_fix_advisor_critic_rls_comprehensive.sql`
3. Run

### Code Updates (Per Component)

**For Dashboard/API components**:
```typescript
// Before (401 prone):
const { data } = await supabase.from('table').select('*');

// After (401 protected):
import { withValidSession } from '@/lib/auth/session-validator';
const data = await withValidSession(
  supabase,
  async () => {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    return data;
  },
  'Fetch data'
);
```

**For Realtime subscriptions**:
```typescript
import { sessionValidator } from '@/lib/auth/session-validator';

// Validate before subscribing
const isValid = await sessionValidator.ensureValidSession(supabase);
if (!isValid) {
  logger.error('Invalid session, cannot subscribe');
  return;
}

const channel = supabase.channel('updates')...
```

## Testing Checklist

| Test | Expected Result | Status |
|------|----------------|--------|
| Login → Wait 15 min → Perform action | No 401, auto-refresh | ⬜ |
| Advisor views assigned students | Success, no 403 | ⬜ |
| Critic views assigned students | Success, no 403 | ⬜ |
| Admin views all relationships | Success, no 403 | ⬜ |
| Profile update → Navigate → Refresh | Data persists | ⬜ |
| Realtime connection stability (15 min) | No disconnects | ⬜ |

## Monitoring

**Check Logs** (Admin Dashboard → Logs tab):
- `[INFO] Token refreshed successfully` ✅ Good
- `[WARN] Session expiring soon` ⚠️ Expected, watch for refresh
- `[ERROR] Session refresh failed` ❌ Needs investigation
- `[ERROR] No valid session available` ❌ User needs re-auth

## Common Issues & Fixes

### Issue: Still getting 401 errors
**Fix**: Ensure `withValidSession` wrapper is used on all authenticated API calls

### Issue: Still getting 403 on advisor/critic tables
**Fix**: Verify migration 31 was applied: `SELECT * FROM pg_policies WHERE tablename = 'advisor_student_relationships';`

### Issue: Profile keeps disappearing
**Fix**: Check network stability, verify no auth state change loops in logs

### Issue: Realtime disconnects frequently
**Fix**: Wrap subscription setup in `sessionValidator.ensureValidSession()`

## Rollback

If critical issues occur:

```sql
-- Remove new policies
DROP POLICY IF EXISTS "Advisors can view their student relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Critics can view their student relationships" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "Admins can manage all advisor relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Admins can manage all critic relationships" ON public.critic_student_relationships;
-- (repeat for all policies in migration 31)
```

Remove `withValidSession` wrappers from code.

## Success Metrics

✅ **Fixed** when:
1. No 401 errors for 24 hours
2. No 403 errors on advisor/critic access
3. Profile data stable across sessions
4. Realtime connections stay authenticated
5. Token refresh happens automatically

## Next Steps

1. ✅ Apply database migration
2. ✅ Update high-traffic components first (Dashboard, Advisor/Critic pages)
3. ✅ Monitor logs for 24-48 hours
4. ✅ Roll out to all API-calling components
5. ✅ Add session health monitoring component

## Files Created/Modified

**New Files**:
- `src/lib/auth/session-validator.ts` - Session validation utility
- `supabase/migrations/31_fix_advisor_critic_rls_comprehensive.sql` - RLS fixes
- `AUTH_401_403_FIX_IMPLEMENTATION.md` - Detailed implementation guide
- `AUTH_FIX_QUICK_REFERENCE.md` - This file

**Files to Update** (Priority Order):
1. Components making frequent API calls (Dashboard, Profile)
2. Advisor/Critic management components
3. Realtime subscription initialization
4. Auth provider logging

## Support

See `AUTH_401_403_FIX_IMPLEMENTATION.md` for detailed implementation instructions, testing procedures, and troubleshooting guidance.
