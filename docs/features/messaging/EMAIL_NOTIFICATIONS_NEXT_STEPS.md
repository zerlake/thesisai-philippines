# Email Notifications - Next Steps & Action Items

## 🎯 Immediate Actions (Do This Now)

### 1. Get Resend API Key
- [ ] Go to https://resend.com
- [ ] Sign up for free account
- [ ] Navigate to API Keys dashboard
- [ ] Copy your API key (starts with `re_`)
- [ ] Add to `.env.local`:
  ```env
  RESEND_API_KEY=re_xxxxxxxxxxxxx
  ```

### 2. Configure Email & Security Keys
- [ ] Add to `.env.local`:
  ```env
  RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
  INTERNAL_API_KEY=generate-secure-key-32-chars
  NEXT_PUBLIC_INTERNAL_API_KEY=same-key
  ```
- [ ] Generate secure keys (use command below):
  ```bash
  # Mac/Linux
  openssl rand -base64 32
  
  # Windows PowerShell
  [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  ```

### 3. Test Email Sending
- [ ] Start dev server: `pnpm dev`
- [ ] Navigate to `http://localhost:3000/api/notifications/test`
- [ ] Fill out test form:
  - Email: `delivered@resend.dev`
  - Advisor Name: Your name
  - Student Name: Test Student
  - Action Type: Submission
  - Document Title: Test Document
- [ ] Click "Send Test Email"
- [ ] Verify success message appears
- [ ] Check browser console for email ID

### 4. Verify Email Delivery
- [ ] Check your inbox (if using real email)
- [ ] Check spam folder
- [ ] Verify email formatting looks good
- [ ] Click CTA button to ensure URL works

---

## 📋 Integration Implementation (Next Week)

### 1. Document Submission Notifications

**File to modify:** `src/app/api/documents/submit/route.ts` (or equivalent)

Add import:
```typescript
import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';
```

After saving document, add:
```typescript
if (advisor) {
  await notifyAdvisorOfSubmission(
    advisor.email,
    advisor.first_name || 'Advisor',
    student.first_name || 'Student',
    document.title || 'Untitled Document',
    document.id
  );
}
```

**Test:**
- [ ] Submit a document as student
- [ ] Check advisor email inbox
- [ ] Verify email contains correct info
- [ ] Test CTA button link works

### 2. Advisor Feedback Notifications

**File to modify:** `src/app/api/documents/feedback/route.ts` (or equivalent)

Add after feedback is saved:
```typescript
import { sendNotificationEmail } from '@/lib/resend-notification';

await sendNotificationEmail({
  to: student.email,
  advisorName: advisor.first_name,
  studentName: student.first_name,
  actionType: 'revision',
  documentTitle: document.title,
  message: `Your advisor ${advisor.first_name} has provided feedback on "${document.title}".`,
  actionUrl: `https://thesisai-philippines.vercel.app/drafts/${document.id}`,
  actionButtonText: 'View Feedback',
});
```

**Test:**
- [ ] Add advisor feedback
- [ ] Verify student receives email
- [ ] Check feedback link works

### 3. Milestone Notifications

**File to modify:** `src/lib/checklist-items.ts` or progress tracking

Add when progress reaches milestone:
```typescript
import { notifyAdvisorOfMilestone } from '@/lib/resend-notification';

if (studentProgress === 100) {
  await notifyAdvisorOfMilestone(
    advisor.email,
    advisor.first_name,
    student.first_name,
    'Thesis Outline Completed',
    student.id
  );
}
```

**Test:**
- [ ] Complete all checklist items
- [ ] Verify milestone email sent
- [ ] Check email subject mentions milestone

### 4. Student Request Notifications

**File to modify:** `src/app/api/student-requests/create/route.ts` (create if needed)

```typescript
import { notifyAdvisorOfRequest } from '@/lib/resend-notification';

await notifyAdvisorOfRequest(
  advisor.email,
  advisor.first_name,
  student.first_name,
  requestContent,
  student.id
);
```

**Test:**
- [ ] Create a student request
- [ ] Verify advisor receives email
- [ ] Check request details in email

---

## 🔧 Optional Enhancements

### Email Preferences
Allow users to control which emails they receive:

```typescript
// In user settings page
interface EmailPreferences {
  documentSubmissions: boolean;
  feedback: boolean;
  milestones: boolean;
  requests: boolean;
  weeklyDigest: boolean;
}
```

### Digest Emails
Create weekly/monthly summaries using Trigger.dev:

```typescript
// in jobs directory
export const weeklyDigestEmail = scheduled.weekly('Friday 9am', async () => {
  // Get all pending items
  // Send digest email
});
```

### Email Templates
Create templates for different scenarios:

```typescript
// src/emails/
- advisor-notification.tsx ✅
- student-feedback-notification.tsx
- milestone-celebration.tsx
- weekly-digest.tsx
- pending-reviews-reminder.tsx
```

### Analytics
Track email metrics:

```typescript
interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}
```

---

## 🧪 Testing Checklist

### Basic Testing
- [ ] Email sends without errors
- [ ] Email arrives in inbox
- [ ] Email styling looks correct
- [ ] CTA button is clickable
- [ ] Recipient name is personalized
- [ ] Action type is correctly displayed
- [ ] Document title shows correctly

### Integration Testing
- [ ] Document submission triggers email
- [ ] Multiple students don't cause duplicates
- [ ] Advisor with multiple students gets correct emails
- [ ] Email addresses with special characters work
- [ ] Unsubscribe link works (if implemented)

### Error Testing
- [ ] Invalid email format fails gracefully
- [ ] Missing advisor email doesn't crash
- [ ] API rate limiting works
- [ ] Error messages are helpful
- [ ] Logs show failures

### Performance Testing
- [ ] Email doesn't block user action
- [ ] Multiple emails send in parallel
- [ ] No memory leaks from repeated sends
- [ ] Response time is < 1 second

---

## 📚 Documentation to Update

- [ ] Update main README with email notification feature
- [ ] Add email notification section to admin guide
- [ ] Create user guide for email preferences
- [ ] Document API endpoints in API docs
- [ ] Add troubleshooting section to support docs

---

## 🚀 Deployment Checklist

### Before Going to Production
- [ ] Test with real Resend account (not test key)
- [ ] Verify `RESEND_FROM_EMAIL` uses real domain
- [ ] Update `INTERNAL_API_KEY` to new secure value
- [ ] Set up email monitoring/alerts
- [ ] Configure spam filter whitelist
- [ ] Test email delivery in Gmail, Outlook, Apple Mail

### Post-Deployment
- [ ] Monitor Resend dashboard for bounces
- [ ] Check logs for email sending errors
- [ ] Collect user feedback on emails
- [ ] Track email open rates
- [ ] Optimize send times if needed

---

## 📊 Success Metrics

Track these to measure email feature success:

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| Email Delivery Rate | >98% | Resend dashboard |
| Open Rate | >30% | Resend analytics |
| Click Rate | >10% | Link tracking |
| Bounce Rate | <2% | Resend dashboard |
| Unsubscribe Rate | <0.5% | Resend dashboard |
| User Satisfaction | >4/5 | User surveys |
| Support Tickets Reduced | 20% | Ticket tracking |

---

## 🐛 Known Limitations & Future Work

### Current Limitations
- No email scheduling (can add with Trigger.dev)
- No A/B testing (can add with Resend API)
- No read receipts (email limitation)
- No advanced analytics (Resend has API for this)
- Single language only (can add translation)

### Future Enhancements
- [ ] Email scheduling for optimal delivery time
- [ ] User-defined email frequency/preferences
- [ ] HTML email editor for admins
- [ ] Template variables system
- [ ] Multi-language email templates
- [ ] Email preview in admin panel
- [ ] Bounce/complaint handling
- [ ] Unsubscribe link implementation
- [ ] Email signature customization
- [ ] Attachment support

---

## 💡 Quick Reference

### Key Files
```
src/emails/advisor-notification.tsx         ← Email template
src/lib/resend-notification.ts               ← Helper functions
src/app/api/notifications/send-email/       ← API endpoint
src/hooks/useNotificationEmail.ts            ← React hook
src/components/email-notification-demo.tsx  ← Demo component
```

### Key Functions
```typescript
// Email sending
sendNotificationEmail()           ← Generic sender
notifyAdvisorOfSubmission()      ← Document submitted
notifyAdvisorOfRevision()        ← Revision submitted
notifyAdvisorOfRequest()         ← Student requested help
notifyAdvisorOfMilestone()       ← Milestone achieved

// Client-side
useNotificationEmail()            ← React hook
```

### Key Environment Variables
```
RESEND_API_KEY                    ← API authentication
RESEND_FROM_EMAIL                 ← Sender email
INTERNAL_API_KEY                  ← Route authentication
NEXT_PUBLIC_INTERNAL_API_KEY      ← Client-side auth
```

---

## 📞 Support Resources

### Documentation
- Resend Docs: https://resend.com/docs
- React-Email Docs: https://react.email
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### Testing Tools
- Resend Test Email: delivered@resend.dev
- MailHog Local Testing: http://localhost:8025
- Email Testing: Litmus, Email on Acid

### Issues?
1. Check `EMAIL_NOTIFICATIONS_SETUP.md`
2. Review code comments in source files
3. Check browser console for errors
4. Check server logs: `pnpm dev`
5. Visit test page: `/api/notifications/test`

---

## ✅ Completion Tracker

**Phase 1: Setup**
- [x] Install packages
- [x] Create email template
- [x] Create API route
- [x] Create React hook
- [ ] Get Resend API key
- [ ] Configure .env.local
- [ ] Test email sending

**Phase 2: Integration**
- [ ] Add to document submission
- [ ] Add to advisor feedback
- [ ] Add to milestones
- [ ] Add to student requests

**Phase 3: Enhancement** 
- [ ] Email preferences UI
- [ ] Digest emails
- [ ] Advanced templates
- [ ] Analytics

---

**Next Action:** Get Resend API key and test email sending! 🚀
