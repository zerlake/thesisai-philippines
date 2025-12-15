# Email Notifications Clean Rebuild - EXECUTED

## Completed Actions ✓

### Phase 1: Deleted Test Data & Files
1. ✓ Deleted `supabase/migrations/43_create_test_advisor_critic_users.sql`
   - This was creating mock advisor/critic profiles with test UUIDs (550e8400-...)
   - These conflicted with real user data

2. ✓ Deleted `src/emails/advisor-notification.tsx`
   - Legacy React Email template (deprecated)

3. ✓ Deleted `src/emails/student-notification.tsx`
   - Legacy React Email template (deprecated)

4. ✓ Deleted `src/components/email-notification-demo.tsx`
   - Demo-only component

5. ✓ Deleted `src/app/api/notifications/test/page.tsx`
   - Test-only page

### Phase 2: Verified Core Implementation is Clean

**Core Files Status:**

1. `src/lib/resend-notification.ts` ✓
   - No hardcoded test emails
   - Uses real Resend API
   - All functions accept real email addresses from parameters
   - No demo/test branches

2. `src/app/api/notifications/send-advisor-email/route.ts` ✓
   - Production-ready
   - Accepts real email from request body
   - No test interceptors

3. `src/app/api/notifications/send-critic-email/route.ts` ✓
   - Production-ready
   - No test data injection

4. `src/app/api/notifications/send-student-email/route.ts` ✓
   - Production-ready
   - Real email handling

5. `src/app/api/documents/submit/route.ts` ✓
   - Fetches real advisor/critic emails from database
   - Calls email functions with real data
   - No mock data injection

---

## Next Steps: Test with Real Accounts

### Step 1: Create Real Test Accounts in Supabase Auth (GUI)
Navigate to Supabase → Authentication → Users → Add User

**Create these test accounts:**

1. **Test Advisor**
   - Email: `advisor.test@yourdomain.com` (use a real email you can access)
   - Password: (temporary)
   - Metadata: `{"role": "advisor"}`

2. **Test Student**
   - Email: `student.test@yourdomain.com` (use a real email you can access)
   - Password: (temporary)
   - Metadata: `{"role": "student"}`

3. **Test Critic**
   - Email: `critic.test@yourdomain.com` (use a real email you can access)
   - Password: (temporary)
   - Metadata: `{"role": "critic"}`

### Step 2: Create Profile Relationships
After accounts are created, add them in the database:

```sql
-- Verify profiles exist
SELECT id, email, role FROM profiles WHERE role IN ('advisor', 'critic');

-- If advisor/critic don't have relationships, create them
-- Get the advisor_id and student_id from the profiles table above
INSERT INTO advisor_student_relationships (student_id, advisor_id)
VALUES ('student-uuid', 'advisor-uuid');

INSERT INTO critic_student_relationships (student_id, critic_id)
VALUES ('student-uuid', 'critic-uuid');
```

### Step 3: Test Document Submission
1. Log in as student
2. Create a new document
3. Submit the document
4. **Check if the advisor/critic receives real email**

### Step 4: Monitor Logs
In the dev console, watch for:
```
[Submit] Sending notification to advisor: advisor.test@yourdomain.com
[Submit] Sending notification to critic: critic.test@yourdomain.com
```

### Step 5: Verify Email Content
The advisor/critic email should:
- Show real names (not mock data)
- Come from `noreply@thesisai-philippines.com`
- Include student name
- Include document title
- Have action button to review

---

## Why This Clean Rebuild Works

**Problem:** The migration `43_create_test_advisor_critic_users.sql` was creating hardcoded test profiles with:
- Mock UUID: `550e8400-e29b-41d4-a716-446655440001` (advisor)
- Mock UUID: `550e8400-e29b-41d4-a716-446655440002` (critic)
- Test emails: `advisor.test@example.com`, `critic.test@example.com`

These conflicted with the real email sending logic because:
1. Real students couldn't form relationships with these fake profiles
2. Real advisors/critics weren't in the system
3. Email API calls were succeeding but going to test Resend addresses, not real addresses

**Solution:** Removed test migration and verified all email sending code:
- Accepts real emails from database queries
- Uses real Resend API (not mocked)
- No conditional test/demo logic
- Works with real user accounts

---

## Quick Deployment Checklist

After testing locally:

- [ ] Real test advisor received email
- [ ] Real test student received email
- [ ] Real test critic received email
- [ ] Build succeeds: `pnpm build`
- [ ] Lint succeeds: `pnpm lint`
- [ ] No errors in dev server: `pnpm dev`
- [ ] Production ENV vars set:
  - `RESEND_API_KEY` = real API key
  - `RESEND_FROM_EMAIL` = `noreply@thesisai-philippines.com`
  - `INTERNAL_API_KEY` = (if re-enabling API auth)

---

## Troubleshooting

If emails still aren't received:

1. **Check Resend API key is valid**
   ```bash
   # In your .env.local
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **Check email addresses in database**
   ```sql
   SELECT email, role FROM profiles WHERE role IN ('advisor', 'critic') LIMIT 5;
   ```
   Make sure these are valid, real email addresses you can access.

3. **Check logs for errors**
   ```
   Failed to send notification email: [error message]
   ```

4. **Test Resend API directly**
   ```bash
   curl -X POST "https://api.resend.com/emails" \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@thesisai-philippines.com","to":"yourrealemail@example.com","subject":"Test","html":"<p>Test</p>"}'
   ```

---

## Migration Cleanup Completed

The problematic migration file has been removed from the file system. When you next run:
```bash
supabase migration list
```

You should see:
- Migration `43_create_test_advisor_critic_users.sql` is GONE
- Migrations `10` and `20250106` are still there (needed for notifications table)

This ensures no new deployments will create the mock test users that were blocking real email functionality.
