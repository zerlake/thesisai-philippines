# Advisor Email Notification Implementation

## Overview

Implemented complete email notification system for advisors and critics sending to students, mirroring the student-to-advisor notification pattern.

## What Was Added

### 1. Core Notification Functions (`src/lib/resend-notification.ts`)

#### Advisor-to-Student Functions
- **`sendAdvisorToStudentNotificationEmail()`** - Generic function for sending emails from advisor to student
- **`notifyStudentOfAdvisorMessage()`** - Send feedback email
- **`notifyStudentOfAdvisorRevisionRequest()`** - Send revision request
- **`notifyStudentOfAdvisorMilestoneFeedback()`** - Send milestone feedback
- **`getAdvisorToStudentEmailSubject()`** - Generate contextual email subjects

#### Critic-to-Student Functions
- **`sendCriticToStudentNotificationEmail()`** - Generic function for sending emails from critic to student
- **`notifyStudentOfCriticMessage()`** - Send feedback email
- **`notifyStudentOfCriticRevisionRequest()`** - Send revision request
- **`notifyStudentOfCriticMilestoneFeedback()`** - Send milestone feedback
- **`getCriticToStudentEmailSubject()`** - Generate contextual email subjects

### 2. New Type Definitions
```typescript
SendAdvisorToStudentNotificationEmailProps
SendCriticToStudentNotificationEmailProps
```

### 3. API Routes

#### `/api/notifications/send-advisor-email` (NEW)
- **POST** - Send email from advisor to student
- Request body:
  ```json
  {
    "to": "student@example.com",
    "studentName": "John Doe",
    "advisorName": "Dr. Smith",
    "actionType": "feedback|revision-request|milestone-feedback|general-message",
    "documentTitle": "Chapter 1",
    "message": "Great work on this chapter!",
    "actionUrl": "https://...",
    "actionButtonText": "View Feedback"
  }
  ```
- **GET** - Health check endpoint

#### `/api/notifications/send-critic-email` (NEW)
- **POST** - Send email from critic to student
- Same request body structure as advisor endpoint
- **GET** - Health check endpoint

### 4. React Hooks

#### `useAdvisorNotificationEmail()` (NEW)
```typescript
const { sendAdvisorEmail, isLoading, error } = useAdvisorNotificationEmail();

await sendAdvisorEmail({
  to: 'student@example.com',
  studentName: 'John Doe',
  advisorName: 'Dr. Smith',
  actionType: 'feedback',
  documentTitle: 'Chapter 1',
  message: 'Great work!',
  actionUrl: '/drafts/123',
  actionButtonText: 'View Feedback'
});
```

#### `useCriticNotificationEmail()` (NEW)
```typescript
const { sendCriticEmail, isLoading, error } = useCriticNotificationEmail();

await sendCriticEmail({
  to: 'student@example.com',
  studentName: 'John Doe',
  criticName: 'Dr. Johnson',
  actionType: 'revision-request',
  documentTitle: 'Methodology',
  message: 'Please revise the methodology section.',
  actionUrl: '/drafts/456',
  actionButtonText: 'View Revision Request'
});
```

### 5. Email Templates

Both advisor and critic notifications use the **student email template** (`generateStudentNotificationEmail()`) with:
- Sender role differentiation (Advisor vs. Critic)
- Green gradient header with role badge
- Document card with title and context
- Action button with contextual CTA text
- Responsive design

### 6. Unified Dashboard Notification Route

The `/api/notifications/dashboard-notification` endpoint already supports:
- **Student → Advisor/Critic** notifications
- **Advisor/Critic → Student** notifications (newly tested)

Routes based on `senderRole`:
- `'student'` → Uses advisor template
- `'advisor'` or `'critic'` → Uses student template

## File Locations

### New Files
- `src/app/api/notifications/send-advisor-email/route.ts` - Advisor email API
- `src/app/api/notifications/send-critic-email/route.ts` - Critic email API
- `src/hooks/useAdvisorNotificationEmail.ts` - Advisor notification hook
- `src/hooks/useCriticNotificationEmail.ts` - Critic notification hook

### Modified Files
- `src/lib/resend-notification.ts` - Added 8 new functions + 2 type definitions

## Action Types

### Advisor/Critic → Student Email
- `'feedback'` - General feedback on work
- `'revision-request'` - Request for revisions
- `'milestone-feedback'` - Feedback on milestone completion
- `'general-message'` - Generic message

### Email Subject Examples
- 💬 Feedback from Advisor Dr. Smith
- ✏️ Revision Requested by Dr. Johnson
- 🎯 Milestone Feedback from Dr. Smith
- 📩 Message from Critic Dr. Brown

## Usage Examples

### Send Advisor Feedback
```typescript
import { notifyStudentOfAdvisorMessage } from '@/lib/resend-notification';

await notifyStudentOfAdvisorMessage(
  'student@university.edu',    // studentEmail
  'Jane Student',               // studentName
  'Dr. Smith',                  // advisorName
  'Chapter 1: Introduction',    // documentTitle
  'doc-123',                    // documentId
  'Excellent introduction! Consider adding more citations to support your argument.' // message
);
```

### Send Revision Request
```typescript
import { notifyStudentOfAdvisorRevisionRequest } from '@/lib/resend-notification';

await notifyStudentOfAdvisorRevisionRequest(
  'student@university.edu',
  'Jane Student',
  'Dr. Smith',
  'Methodology',
  'doc-456',
  'Please revise the methodology section. Add more details about your research design.'
);
```

### Use in React Component
```typescript
import { useAdvisorNotificationEmail } from '@/hooks/useAdvisorNotificationEmail';

export function AdvisorFeedbackForm() {
  const { sendAdvisorEmail, isLoading } = useAdvisorNotificationEmail();

  const handleSendFeedback = async () => {
    await sendAdvisorEmail({
      to: studentEmail,
      studentName: 'John Doe',
      advisorName: 'Dr. Smith',
      actionType: 'feedback',
      documentTitle: 'Chapter 2',
      message: 'Great work on your research methodology!',
      actionUrl: `/drafts/${documentId}`,
      actionButtonText: 'View Feedback'
    });
  };

  return (
    <button onClick={handleSendFeedback} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send Feedback'}
    </button>
  );
}
```

## Testing

### Test Advisor Email Endpoint
```bash
curl -X POST http://localhost:3000/api/notifications/send-advisor-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "delivered@resend.dev",
    "studentName": "Test Student",
    "advisorName": "Dr. Test",
    "actionType": "feedback",
    "documentTitle": "Test Document",
    "message": "This is test feedback from your advisor.",
    "actionUrl": "http://localhost:3000/dashboard",
    "actionButtonText": "View Feedback"
  }'
```

### Test Critic Email Endpoint
```bash
curl -X POST http://localhost:3000/api/notifications/send-critic-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "delivered@resend.dev",
    "studentName": "Test Student",
    "criticName": "Dr. Critic",
    "actionType": "revision-request",
    "documentTitle": "Test Document",
    "message": "Please revise this section.",
    "actionUrl": "http://localhost:3000/dashboard",
    "actionButtonText": "View Revision Request"
  }'
```

### Test Dashboard Notification Route
```bash
curl -X POST http://localhost:3000/api/notifications/dashboard-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "feedback",
    "recipientEmail": "delivered@resend.dev",
    "recipientName": "Test Student",
    "senderName": "Dr. Smith",
    "senderRole": "advisor",
    "documentTitle": "Chapter 3",
    "message": "Excellent work on your research!",
    "actionUrl": "http://localhost:3000/dashboard"
  }'
```

## Symmetry with Student Implementation

The advisor/critic notification system now mirrors the student implementation:

| Feature | Student → Advisor | Advisor/Critic → Student |
|---------|-------------------|--------------------------|
| Generic send function | `sendNotificationEmail()` | `sendAdvisorToStudentNotificationEmail()` / `sendCriticToStudentNotificationEmail()` |
| Action types | 4 (submission, revision, request, milestone) | 4 (feedback, revision-request, milestone-feedback, general-message) |
| Email template | Advisor template (purple header) | Student template (green header) |
| Role differentiation | N/A | ✅ Advisor vs. Critic |
| Subject line generation | ✅ `getEmailSubject()` | ✅ `getAdvisorToStudentEmailSubject()` / `getCriticToStudentEmailSubject()` |
| Type-specific functions | 4 functions | 8 functions (4 advisor + 4 critic) |
| React hook | `useNotificationEmail()` | `useAdvisorNotificationEmail()` / `useCriticNotificationEmail()` |
| API endpoint | `/api/notifications/send-email` | `/api/notifications/send-advisor-email` / `/api/notifications/send-critic-email` |
| Unified dashboard route | ✅ `/api/notifications/dashboard-notification` | ✅ `/api/notifications/dashboard-notification` |

## Build Status

✅ Build successful with no TypeScript errors
✅ All new endpoints registered in Next.js router
✅ No breaking changes to existing functionality

## Next Steps

1. Integrate new hooks into advisor/critic dashboard components
2. Add email notification preferences for advisors/critics
3. Create admin panel to monitor sent notifications
4. Add email delivery tracking
5. Implement email templates in Resend dashboard
