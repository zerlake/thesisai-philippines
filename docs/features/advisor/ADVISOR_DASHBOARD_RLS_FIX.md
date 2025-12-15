# Advisor Dashboard RLS Fix

## Problem

The advisor dashboard was throwing a **403 Forbidden** error when trying to fetch pending advisor requests.

**Error Details:**
```
Advisor requests not available: permission denied for table users
GET https://dnyjgzzfyzrsucucexhy.supabase.co/rest/v1/advisor_requests?select=id%2Cstatus%2Cstudent_id&advisor_email=eq.advisor%40demo.thesisai.local&status=eq.pending 403 (Forbidden)
```

## Root Cause

The RLS (Row Level Security) policies were misconfigured:

1. **Migration 27** created `advisor_requests` table with only **student-accessible** policies
2. **Migration 31** attempted to add advisor-accessible policies but had bugs:
   - Referenced non-existent `email` column instead of `advisor_email`
   - Referenced non-existent `email` field in UPDATE policy for the `advisor_requests` table

## Solution

Created **Migration 32** (`32_fix_advisor_requests_rls.sql`) which:

### For `advisor_requests` table:
1. Drops broken policies from Migration 31
2. Creates three new corrected policies for advisors:
   - **SELECT**: View requests where `advisor_email` matches their email
   - **UPDATE**: Modify requests directed to them
   - **DELETE**: Remove requests directed to them
3. Creates admin policy for full access

### For `critic_requests` table:
- Applied the same fix (same issue with critic role)

### For `profiles` table:
- Added public SELECT policy: `"Users can view all profiles"`
- Allows fetching student name information without secondary permission errors

### Grants:
- Ensured `authenticated` role has SELECT, UPDATE, DELETE on both request tables
- Ensured authenticated users can SELECT from profiles

## Implementation

**File Created:**
```
supabase/migrations/32_fix_advisor_requests_rls.sql
```

**To Apply:**
```bash
supabase migration up
```

Or if running against production Supabase:
```bash
# Copy and run the SQL manually in Supabase dashboard
```

## Result

After applying this migration, advisors will be able to:
- ✅ View their pending student requests
- ✅ Accept/decline requests
- ✅ See student names in the UI
- ✅ Manage all their advisor relationships

## Notes

- The fix uses email matching since `advisor_requests.advisor_email` stores the advisor's email address
- Secondary check for `profiles.role = 'advisor'` ensures role-based access control
- Admins maintain full access to all request tables for management/debugging
