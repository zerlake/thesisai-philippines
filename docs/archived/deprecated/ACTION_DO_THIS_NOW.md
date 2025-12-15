# Email Notifications - Action Steps (Do This Now)

## What Was Done
✓ Deleted test migration that created fake advisor/critic profiles
✓ Deleted legacy email templates
✓ Verified core email code is production-ready
✓ Build successful

## Now You Need To Do This

### STEP 1: Create Real Test Accounts
Go to: Supabase Dashboard → Authentication → Users → Add User

Create 3 accounts:

**Account 1 - Test Advisor**
- Email: `advisor.test@gmail.com` (or any email you can check)
- Password: Anything (temp)
- Auto confirm: Check if available
- Custom metadata: `{"role": "advisor"}`

**Account 2 - Test Student**
- Email: `student.test@gmail.com`
- Password: Anything (temp)
- Custom metadata: `{"role": "student"}`

**Account 3 - Test Critic**
- Email: `critic.test@gmail.com`
- Password: Anything (temp)
- Custom metadata: `{"role": "critic"}`

### STEP 2: Set Up Database Relationships
Go to: Supabase → SQL Editor → New Query

Run this query (adjust emails if you used different ones):
```sql
-- First, verify the profiles exist
SELECT id, email, role FROM profiles WHERE role IN ('advisor', 'critic', 'student');

-- Store the UUIDs from above, then use them below
-- Replace STUDENT_UUID, ADVISOR_UUID, CRITIC_UUID with actual UUIDs

-- Create advisor-student relationship
INSERT INTO advisor_student_relationships (student_id, advisor_id, created_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'student.test@gmail.com'),
  (SELECT id FROM profiles WHERE email = 'advisor.test@gmail.com'),
  NOW()
ON CONFLICT DO NOTHING;

-- Create critic-student relationship
INSERT INTO critic_student_relationships (student_id, critic_id, created_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'student.test@gmail.com'),
  (SELECT id FROM profiles WHERE email = 'critic.test@gmail.com'),
  NOW()
ON CONFLICT DO NOTHING;

-- Verify relationships created
SELECT * FROM advisor_student_relationships;
SELECT * FROM critic_student_relationships;
```

### STEP 3: Test the Email Flow
1. **Start dev server**
   ```bash
   pnpm dev
   ```

2. **Open app in browser**
   ```
   http://localhost:3000
   ```

3. **Log in as student**
   - Email: `student.test@gmail.com`
   - Password: (whatever you set in step 1)

4. **Create a document**
   - Click "New Document"
   - Title: "Test Chapter"
   - Add some content

5. **Submit the document**
   - Click "Submit" button
   - Watch the console for logs

6. **Check if advisor receives email**
   - Go to advisor email inbox (advisor.test@gmail.com)
   - **WAIT 30-60 seconds** for email to arrive
   - Look for email from `noreply@thesisai-philippines.com`
   - Subject should be like "📄 New Document from Test Student - Review Needed"

### STEP 4: Check Dev Console Logs
In your terminal where `pnpm dev` is running, look for:
```
[Submit] Sending notification to advisor: advisor.test@gmail.com
[Submit] Sending notification to critic: critic.test@gmail.com
```

This means the system tried to send emails.

### STEP 5: If Email Received ✓
**Great! Email notifications are working.** 
- Do same test with critic (create another student-critic relationship if needed)
- Test advisor-to-student feedback notifications
- Deploy to production

### STEP 6: If Email NOT Received ✗
Check these things in order:

**Check 1: Resend API Key**
```
In your .env.local:
RESEND_API_KEY=re_xxxxx... (should be real, not blank)
```

**Check 2: Email Addresses in Database**
Run in SQL Editor:
```sql
SELECT email, role FROM profiles WHERE role IN ('advisor', 'critic');
```
Make sure your test emails are there with correct roles.

**Check 3: Check for Errors in Logs**
Look for messages like:
```
Failed to send notification email: [error]
```

**Check 4: Test Resend API Directly**
Open another terminal:
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@thesisai-philippines.com",
    "to": "advisor.test@gmail.com",
    "subject": "Test Email",
    "html": "<p>This is a test email from Resend</p>"
  }'
```

If you get a success response with an `id`, then Resend is working.

**Check 5: Verify Relationships Exist**
```sql
SELECT 
  a.student_id,
  b.email as student_email,
  a.advisor_id,
  c.email as advisor_email
FROM advisor_student_relationships a
JOIN profiles b ON a.student_id = b.id
JOIN profiles c ON a.advisor_id = c.id;
```

If no rows, relationships aren't set up correctly.

---

## Summary of Clean Changes

### Removed:
- Test migration creating mock users (550e8400-... UUIDs)
- Legacy React Email templates
- Demo components

### Kept:
- All production email infrastructure
- Database migrations for notifications
- API routes for sending emails
- Email templates (HTML-based)

### Result:
Email system now only works with **real user accounts** in your system, not hardcoded test UUIDs.

---

## Timeline
- **Today:** Do Steps 1-5 above
- **If working:** Deploy to production
- **If not working:** Follow Step 6 troubleshooting

This should finally get real emails working to advisors when students submit documents.
