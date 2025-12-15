# Email Notifications Clean Rebuild Plan

## Problem
Email notifications for advisors/critics not working despite multiple fix attempts. Root cause: accumulated test data, mock implementations, and potentially conflicting code paths.

## Solution: Complete Reset & Rebuild

### STEP 1: Remove Test Data Migration
**File:** `supabase/migrations/43_create_test_advisor_critic_users.sql`

**Action:** Delete this file entirely - it creates mock advisor/critic users with test emails that interfere with real functionality.

### STEP 2: Remove Email Template Files (Legacy)
These React Email templates are deprecated and may cause import conflicts:
- `src/emails/advisor-notification.tsx`
- `src/emails/student-notification.tsx`

### STEP 3: Identify Code Using Mock Data
Search for hardcoded test data:
```bash
grep -r "550e8400-e29b-41d4-a716-446655440001" src/
grep -r "advisor.test@example.com" src/
grep -r "critic.test@example.com" src/
grep -r "mock.*data" src/ --include="*.tsx" --include="*.ts"
grep -r "sample.*email" src/ --include="*.tsx" --include="*.ts"
```

### STEP 4: Database Schema - Keep These Migrations (Core)
These are valid schema migrations that should remain:
- `10_personalization_behavior_and_notifications.sql` - Creates `notifications` table
- `20250106_add_dashboard_notifications.sql` - Adds notification preferences to profiles

**But:** Remove test data from these if present.

### STEP 5: Clean Implementation Strategy

#### A. Core Email Routes (Keep & Fix)
1. `src/app/api/notifications/send-advisor-email/route.ts`
   - Should only send real emails via Resend API
   - No mock data, no test interceptors
   
2. `src/app/api/notifications/send-student-email/route.ts`
   - Real email sending only

3. `src/app/api/notifications/dashboard-notification/route.ts`
   - Orchestrator - must validate incoming data is real

#### B. Email Sending Library (Critical)
`src/lib/resend-notification.ts`
- Replace all test/demo logic with production-only code
- Remove any conditional checks for test emails
- Add proper error handling and logging

#### C. Hooks & Components
Review and remove mock data from:
- `src/hooks/useAdvisorNotificationEmail.ts`
- `src/hooks/useStudentNotificationEmail.ts`
- `src/hooks/useCriticNotificationEmail.ts`
- `src/components/advisor-email-notifications.tsx`
- `src/components/dashboard-notification-settings.tsx`

### STEP 6: Rebuild Implementation Flow

```
User Action (advisor submits feedback)
    ↓
API Route receives real user data (email, name, role)
    ↓
Validates input (no mock data checks)
    ↓
Calls resend-notification.ts
    ↓
Sends email via Resend API with real email address
    ↓
Logs transaction in notifications table
    ↓
Returns confirmation to frontend
```

### STEP 7: Testing After Rebuild
**Environment:** Use real advisor/student test accounts (created in Supabase Auth)
- Not the hardcoded 550e8400 UUIDs
- Real email addresses that exist
- Real roles assigned in auth.users claims

### STEP 8: Verification Checklist
- [ ] Test migration file deleted
- [ ] No mock UUID references in code
- [ ] No mock email references in code
- [ ] Resend API calls only use real email from request
- [ ] Logs show actual emails being sent
- [ ] Advisor receives real emails on student submission

---

## Files to Delete Immediately
1. `/supabase/migrations/43_create_test_advisor_critic_users.sql`
2. `/src/emails/advisor-notification.tsx` (if not used)
3. `/src/emails/student-notification.tsx` (if not used)

## Files to Review & Clean
1. `src/lib/resend-notification.ts` - Remove all test logic
2. `src/app/api/notifications/send-advisor-email/route.ts` - Production only
3. `src/hooks/useAdvisorNotificationEmail.ts` - No mock data
4. `src/components/advisor-email-notifications.tsx` - No mock data
5. `src/components/dashboard-notification-settings.tsx` - No mock data

## Database Changes Required
Run these commands to clean up test data:
```sql
-- Delete any test user profiles created by migration 43
DELETE FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440001';
DELETE FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Verify notifications table is empty or contains only valid data
SELECT COUNT(*) FROM notifications;
```

---

## Implementation Steps
1. Delete test migration file
2. Run: `supabase migration list` to verify migration removed
3. Search codebase for mock data references
4. Remove all mock/test logic from email sending functions
5. Test with real advisor/student accounts
6. Verify actual emails are received
