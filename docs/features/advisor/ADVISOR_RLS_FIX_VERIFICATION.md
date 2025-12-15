# Advisor Dashboard RLS Fix - Verification & Next Steps

## Migration Applied ✅

**Migration 32** (`32_fix_advisor_requests_rls.sql`) has been successfully applied to Supabase.

## What Was Fixed

### Problem
Advisors received **403 Forbidden** errors when accessing pending student requests on their dashboard.

```
Error: "permission denied for table users"
GET .../rest/v1/advisor_requests?select=id%2Cstatus%2Cstudent_id&advisor_email=eq.advisor%40demo.thesisai.local&status=eq.pending
Response: 403 (Forbidden)
```

### Root Cause
Migration 31 had broken RLS policies:
- Referenced non-existent `email` column instead of `advisor_email`
- Syntax errors in UPDATE/DELETE policies

### Solution
Migration 32 replaces with corrected policies that:
1. Match `advisor_email` against the authenticated user's email
2. Include fallback role-based checks
3. Grant proper table permissions to authenticated users
4. Add public read access to `profiles` table (for student names)

## Changes Made

### `advisor_requests` table
- ✅ SELECT policy: Advisors can view requests directed to them
- ✅ UPDATE policy: Advisors can accept/decline requests  
- ✅ DELETE policy: Advisors can manage their requests
- ✅ Admin policy: Full access for admins

### `critic_requests` table
- ✅ Same fixes applied (identical issue)

### `profiles` table
- ✅ Public SELECT: Users can view all profiles (needed for fetching student names)

## Testing the Fix

### Manual Testing

1. **Log in as advisor:**
   - Navigate to `http://localhost:3001/dashboard`
   - Use advisor demo account
   
2. **Check Student Requests card:**
   - Card should display without errors
   - Should show "You have no pending student requests" OR list of actual requests
   - No console errors about "permission denied"

3. **Browser Console (F12):**
   - Should NOT see: `"permission denied for table users"`
   - Should NOT see: 403 Forbidden errors for advisor_requests

### Expected Console Output (BEFORE fix)
```
⚠️ advisor-requests-card.tsx:45 Advisor requests not available: permission denied for table users
❌ 403 Forbidden - GET .../advisor_requests?...
```

### Expected Console Output (AFTER fix)
```
✅ [Dashboard] Profile loaded: advisor isLoading: false
(No errors, Student Requests card loads successfully)
```

## Deployment Checklist

- [x] Migration file created: `32_fix_advisor_requests_rls.sql`
- [x] Migration applied to Supabase
- [x] RLS policies corrected for advisor_requests
- [x] RLS policies corrected for critic_requests
- [x] profiles table public read access enabled
- [x] Table permissions granted to authenticated role

## Next Steps (Manual Verification Required)

1. **Test in browser:**
   ```
   URL: http://localhost:3001/dashboard
   Login: advisor@demo.thesisai.local (or valid advisor account)
   Expected: Student Requests card loads without 403 error
   ```

2. **Verify API responses:**
   - Open DevTools Network tab
   - Look for requests to `/rest/v1/advisor_requests`
   - Should see `200 OK` (not 403)
   - Should return data or empty array (not permission denied)

3. **Test functionality:**
   - If test data exists: Try accepting/declining a request
   - Should use `manage-advisor-request` function
   - Should see toast notification on success

4. **Check for errors:**
   - Console should not show `"permission denied"`
   - AdvisorRequestsCard should not show error state
   - Profile loading should complete successfully

## Rollback (if needed)

If issues occur, previous working state can be restored by:
1. Manually removing the new policies in Supabase SQL Editor
2. Restoring policies from Migration 31 (if they work for your setup)
3. Or revert to commit before this migration

## Notes

- The fix uses email-based matching: `advisor_email` column must match authenticated user's email
- Secondary role check (`profiles.role = 'advisor'`) provides defense in depth
- Admins retain full access for management and debugging
- Same pattern applied to critic_requests for consistency

## Files Created

1. `supabase/migrations/32_fix_advisor_requests_rls.sql` - Migration file
2. `ADVISOR_DASHBOARD_RLS_FIX.md` - Technical documentation
3. `ADVISOR_RLS_FIX_VERIFICATION.md` - This file (verification guide)
4. `test-advisor-rls-fix.js` - Optional test script

## Related Issues

- Issue: Advisor dashboard 403 Forbidden
- Component: `src/components/advisor-requests-card.tsx`
- Related: Critic dashboard (same fix applied)
- Related: Profile access (secondary fix for student name fetching)
