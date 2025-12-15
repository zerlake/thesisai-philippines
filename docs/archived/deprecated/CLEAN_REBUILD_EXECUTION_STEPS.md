# Email Notifications Clean Rebuild - Execution Steps

## Phase 1: Backup & Assessment

### Step 1.1 - Check Migration Status
```bash
supabase migration list
```
Look for:
- `20250106_add_dashboard_notifications.sql` ✓ Keep
- `10_personalization_behavior_and_notifications.sql` ✓ Keep  
- `43_create_test_advisor_critic_users.sql` ✗ Delete

### Step 1.2 - Backup Current State
```bash
# Export current database state for safety
pg_dump $DATABASE_URL > backup_notifications.sql
```

---

## Phase 2: Delete Test Data & Migrations

### Step 2.1 - Delete Test Migration File
```bash
rm supabase/migrations/43_create_test_advisor_critic_users.sql
```

### Step 2.2 - Delete Legacy Email Template Files
```bash
# These React Email templates are deprecated
rm src/emails/advisor-notification.tsx
rm src/emails/student-notification.tsx
```

### Step 2.3 - Clean Database: Remove Test User Data
Run in Supabase SQL Editor:
```sql
-- Delete test advisor/critic profiles created by migration 43
DELETE FROM profiles WHERE email LIKE '%advisor.test%';
DELETE FROM profiles WHERE email LIKE '%critic.test%';
DELETE FROM profiles WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
);

-- Verify no test data remains
SELECT * FROM profiles WHERE email LIKE '%test%';
```

### Step 2.4 - Clean Up Abandoned Notifications
```sql
-- Check for notifications with NULL or invalid user_ids
SELECT COUNT(*) FROM notifications WHERE user_id IS NULL;

-- Delete orphaned notifications (if any)
DELETE FROM notifications WHERE user_id IS NULL;
```

---

## Phase 3: Code Cleanup - Remove Test Helpers

### Step 3.1 - Check for Test Components
Files to review and clean:
- `src/components/email-notification-demo.tsx` - REMOVE if demo-only
- `src/app/api/notifications/test/page.tsx` - REMOVE if test-only

If these exist and are demo-only:
```bash
rm src/components/email-notification-demo.tsx
rm src/app/api/notifications/test/page.tsx
```

### Step 3.2 - Review All API Routes for Test Logic
Check these files for any conditional test logic:
```bash
grep -r "if.*test\|if.*demo\|if.*mock" src/app/api/notifications/ --include="*.ts"
```

If found, remove the test branches.

---

## Phase 4: Verify Core Implementation is Clean

### Step 4.1 - Verify Email Library Has No Test Logic
File: `src/lib/resend-notification.ts`

Should contain:
- ✓ Real Resend API calls using `process.env.RESEND_API_KEY`
- ✓ Email templates from `src/lib/email-templates.ts`
- ✓ Real email addresses passed from callers
- ✗ NO hardcoded test emails
- ✗ NO conditional test/demo branches
- ✗ NO mocked Resend responses

### Step 4.2 - Verify Email Routes Have No Test Logic
Check these files for production-only logic:
- `src/app/api/notifications/send-advisor-email/route.ts`
- `src/app/api/notifications/send-student-email/route.ts`
- `src/app/api/notifications/send-critic-email/route.ts`

Each should:
- ✓ Accept real email from request body
- ✓ Validate input
- ✓ Call email sending function
- ✓ Return success/error response
- ✗ NO test interceptors
- ✗ NO demo data injections

### Step 4.3 - Verify Document Submission Route
File: `src/app/api/documents/submit/route.ts`

Should trigger emails like this (production only):
```typescript
// Get real advisor/critic data from database
const advisors = await fetchAdvisorsForStudent(studentId);
const critics = await fetchCriticsForStudent(studentId);

// Send real emails
for (const advisor of advisors) {
  await notifyAdvisorOfSubmission(
    advisor.email,      // Real email from DB
    advisor.name,       // Real name from DB
    student.name,       // Real name from DB
    title,             // Real document title
    documentId         // Real document ID
  );
}
```

---

## Phase 5: Testing with Real Accounts

### Step 5.1 - Create Real Test Accounts
Create test accounts in Supabase Auth (NOT via SQL migration):

1. **Test Student Account**
   - Email: `student.test@yourdomain.com`
   - Role: student
   - Name: Test Student

2. **Test Advisor Account**
   - Email: `advisor.test@yourdomain.com`
   - Role: advisor
   - Name: Test Advisor

3. **Test Critic Account**
   - Email: `critic.test@yourdomain.com`
   - Role: critic
   - Name: Test Critic

### Step 5.2 - Test Email Sending via API
```bash
# Test advisor email sending
curl -X POST http://localhost:3000/api/notifications/send-advisor-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "advisor.test@yourdomain.com",
    "studentName": "Test Student",
    "advisorName": "Test Advisor",
    "actionType": "feedback",
    "documentTitle": "Chapter 1",
    "message": "Test email from clean rebuild",
    "actionUrl": "http://localhost:3000/dashboard"
  }'
```

### Step 5.3 - Test Document Submission Flow
1. Log in as student
2. Create and submit a document
3. Check advisor email inbox - should receive real email
4. Check logs in Supabase for `notifications` table entry

### Step 5.4 - Verify Email Headers & Content
Emails received should:
- ✓ Come from `noreply@thesisai-philippines.com`
- ✓ Have proper subject line
- ✓ Show real advisor/student names
- ✓ Include action URL
- ✓ NOT contain hardcoded test UUIDs

---

## Phase 6: Deployment Verification

### Step 6.1 - Build Check
```bash
pnpm build
# Should complete without errors
```

### Step 6.2 - Lint Check
```bash
pnpm lint
# Should show no issues
```

### Step 6.3 - Dev Server Check
```bash
pnpm dev
# Monitor console for email-related errors
```

### Step 6.4 - Production Email Config
Verify environment variables:
```bash
# Must be set in production:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
```

---

## Phase 7: Rollback Plan (If Needed)

If emails still don't work after rebuild:

### Option A: Check Resend API Status
```bash
# Test Resend API directly
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Hello World",
    "html": "<strong>It works!</strong>"
  }'
```

### Option B: Check Database Permissions
```sql
-- Verify current user can read/write notifications table
SELECT * FROM notifications LIMIT 1;
INSERT INTO notifications (user_id, title, message, notification_type) 
VALUES (auth.uid(), 'Test', 'Test message', 'system');
```

### Option C: Check Email Address Validity
```sql
-- Verify advisor email addresses in profiles table
SELECT id, email, role FROM profiles WHERE role IN ('advisor', 'critic');
```

---

## Checklist

- [ ] Deleted `supabase/migrations/43_create_test_advisor_critic_users.sql`
- [ ] Deleted `/src/emails/advisor-notification.tsx`
- [ ] Deleted `/src/emails/student-notification.tsx`
- [ ] Deleted test components (`email-notification-demo.tsx`, etc.)
- [ ] Removed test data from database
- [ ] Verified `src/lib/resend-notification.ts` has no test logic
- [ ] Verified API routes have no test logic
- [ ] Created real test accounts
- [ ] Tested email sending via API
- [ ] Tested document submission flow
- [ ] Build passes (`pnpm build`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Dev server starts cleanly
- [ ] Real advisor received test email

---

## Summary

This clean rebuild approach:
1. Removes all test data and migrations that created mock users
2. Deletes deprecated email templates
3. Verifies core email sending code is production-ready
4. Tests with real (non-mock) accounts
5. Provides rollback plan if issues persist

After completing all steps, advisor email notifications should work with real emails being sent to real advisor addresses in the system.
