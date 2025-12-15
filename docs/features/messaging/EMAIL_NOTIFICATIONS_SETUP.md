# Email Notifications Setup Guide

This guide covers setting up email notifications for the advisor dashboard using Resend and React-Email.

## Installation (Already Done ✓)

The following packages have been installed:
- `resend` - Email service provider
- `react-email` - Email template library  
- `@trigger.dev/sdk` - Background job runner (optional for now)

```bash
pnpm add resend react-email @trigger.dev/sdk
```

## 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** For development, you can use a test API key. For production, use your actual domain.

## 2. Set Up Internal API Key

Add a secure internal API key to `.env.local`:

```env
INTERNAL_API_KEY=your-secret-api-key-here-minimum-32-characters
NEXT_PUBLIC_INTERNAL_API_KEY=your-secret-api-key-here-minimum-32-characters
```

Generate a secure key:
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 3. Files Created

### Email Template
**File:** `src/emails/advisor-notification.tsx`
- Beautiful email template with React-Email
- Supports 4 action types: submission, revision, request, milestone
- Fully styled with Tailwind-compatible inline styles
- Responsive design

### Resend Helper
**File:** `src/lib/resend-notification.ts`
- `sendNotificationEmail()` - Generic email sender
- `notifyAdvisorOfSubmission()` - Student submitted document
- `notifyAdvisorOfRevision()` - Student submitted revision
- `notifyAdvisorOfRequest()` - Student requested help
- `notifyAdvisorOfMilestone()` - Student reached milestone

### API Route
**File:** `src/app/api/notifications/send-email/route.ts`
- POST endpoint to send emails
- GET endpoint for health check
- API key authentication

### React Hook
**File:** `src/hooks/useNotificationEmail.ts`
- `useNotificationEmail()` hook for client-side usage
- Handles loading, errors, and toast notifications
- Easy integration with React components

## 4. Usage Examples

### From Component (Client-Side)

```typescript
import { useNotificationEmail } from '@/hooks/useNotificationEmail';

export function StudentSubmissionButton() {
  const { sendEmail, isLoading } = useNotificationEmail();

  const handleSubmission = async () => {
    await sendEmail({
      to: 'advisor@example.com',
      advisorName: 'Dr. Garcia',
      studentName: 'Maria Santos',
      actionType: 'submission',
      documentTitle: 'Chapter 1 - Introduction',
      message: 'Maria Santos has submitted Chapter 1 for your review.',
      actionUrl: 'https://thesisai-philippines.vercel.app/advisor/students/student-id',
      actionButtonText: 'Review Document',
    });
  };

  return (
    <button onClick={handleSubmission} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Submit Document'}
    </button>
  );
}
```

### From API Route (Server-Side)

```typescript
import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';

export async function POST(request: Request) {
  // ... validation code ...

  const advisor = await getAdvisor(studentAdvisorId);
  
  await notifyAdvisorOfSubmission(
    advisor.email,
    advisor.first_name,
    student.first_name,
    document.title,
    document.id
  );

  return Response.json({ success: true });
}
```

### Using Helper Functions

```typescript
import {
  notifyAdvisorOfSubmission,
  notifyAdvisorOfRevision,
  notifyAdvisorOfRequest,
  notifyAdvisorOfMilestone,
} from '@/lib/resend-notification';

// Notify on submission
await notifyAdvisorOfSubmission(
  'advisor@example.com',
  'Dr. Garcia',
  'Maria Santos',
  'Chapter 2 - Literature Review',
  'student-123'
);

// Notify on revision
await notifyAdvisorOfRevision(
  'advisor@example.com',
  'Dr. Garcia',
  'John Dela Cruz',
  'Chapter 1 - Introduction',
  'student-456'
);

// Notify on request
await notifyAdvisorOfRequest(
  'advisor@example.com',
  'Dr. Garcia',
  'Ana Reyes',
  'Help with statistical analysis methodology',
  'student-789'
);

// Notify on milestone
await notifyAdvisorOfMilestone(
  'advisor@example.com',
  'Dr. Garcia',
  'Maria Santos',
  'Literature Review Completed',
  'student-123'
);
```

## 5. Integration Points

### Where to Add Email Notifications:

1. **Document Submission**
   - Location: When student submits a document
   - Trigger: After document is saved to database
   - Template: `submission`

2. **Document Review Complete**
   - Location: When advisor provides feedback
   - Trigger: After advisor adds comments
   - Template: `revision` (if student revises)

3. **Student Requests Help**
   - Location: Student initiates help request
   - Trigger: Help request created
   - Template: `request`

4. **Milestone Reached**
   - Location: Student completes a thesis phase
   - Trigger: Progress reaches milestone threshold
   - Template: `milestone`

5. **Pending Review Alert**
   - Location: Scheduled daily/weekly digest
   - Trigger: Cron job (via Trigger.dev)
   - Template: Custom summary email

## 6. Testing Emails

### Using Resend's Test Email

In development, use Resend's test email address:
```typescript
await sendNotificationEmail({
  to: 'delivered@resend.dev',  // Test delivery
  // ... other params
});
```

### Local Testing with Mailtrap or MailHog

Install MailHog for local email testing:
```bash
# Docker setup
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Then update `src/lib/resend-notification.ts` for development:
```typescript
if (process.env.NODE_ENV === 'development') {
  // Use MailHog for testing
  const nodemailer = require('nodemailer');
  // ... setup ...
}
```

## 7. Best Practices

✅ **DO:**
- Use descriptive subject lines
- Include clear action URLs (CTAs)
- Test emails before sending
- Use appropriate action types (submission, revision, request, milestone)
- Add error handling and logging
- Rate limit notifications to avoid spam
- Send emails asynchronously (use Trigger.dev for production)

❌ **DON'T:**
- Send emails synchronously in request handlers
- Use generic "Admin" in recipient names
- Include sensitive data in email bodies
- Forget to validate email addresses
- Send duplicate notifications
- Miss adding error handlers

## 8. Next Steps

### Phase 1: Setup (Now)
- ✓ Install packages
- ✓ Create email templates
- ✓ Create API routes
- [ ] Add Resend API key to environment
- [ ] Test email sending

### Phase 2: Integration
- [ ] Add email notifications to document submission flow
- [ ] Add email notifications to advisor feedback flow
- [ ] Add email notifications to student request flow
- [ ] Add email notifications to milestone achievement

### Phase 3: Advanced (Optional)
- [ ] Setup Trigger.dev for background jobs
- [ ] Create scheduled digest emails
- [ ] Add email preferences to user profiles
- [ ] Create email analytics dashboard
- [ ] Setup email unsubscribe links

## 9. Troubleshooting

### Email not sending?
- Check API key is correct in `.env.local`
- Verify `RESEND_FROM_EMAIL` is valid
- Check API route logs for errors
- Test with `delivered@resend.dev`

### Rate limiting?
- Resend has no rate limits on free plan
- Implement application-level rate limiting if needed
- Consider batching emails with Trigger.dev

### Email styling issues?
- React-Email renders to clean HTML
- Test in different email clients
- Use `react-email preview` command for local testing

### Missing emails?
- Check spam folder
- Verify recipient email address
- Check Resend dashboard for bounce/reject logs
- Look at API response for errors

## 10. Useful Commands

```bash
# Preview emails during development (if using react-email CLI)
pnpm react-email preview

# Test API endpoint health
curl http://localhost:3000/api/notifications/send-email

# View Resend logs
# Visit dashboard.resend.com

# Check test email delivery
# Visit mailhog UI at http://localhost:8025
```

## 11. Environment Variables Summary

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Security
INTERNAL_API_KEY=your-secret-key-minimum-32-chars
NEXT_PUBLIC_INTERNAL_API_KEY=same-key-for-client
```

---

**Status:** Setup Complete ✓  
**Next Action:** Add Resend API key to `.env.local` and test email sending  
**Documentation:** See files in `src/lib/resend-notification.ts` and `src/emails/`
