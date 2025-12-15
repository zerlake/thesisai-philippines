# Email Notifications Quick Reference
## 3-Way Communication: Student ↔ Advisor ↔ Critic

**Implementation Date:** December 6, 2025

## Quick Summary

✅ **Implemented:**
- Student notification template (green header)
- Advisor notification template (purple header) - reused for critics
- Helper functions for all notification types
- API routes for sending emails
- Complete integration guide

📧 **Notification Flow:**
```
Student submits → Advisor & Critic notified
Advisor feedback → Student notified
Critic feedback → Student notified
```

---

## All Available Functions

### ADVISOR NOTIFICATIONS (notify advisor about student action)

```typescript
import { 
  notifyAdvisorOfSubmission,
  notifyAdvisorOfRevision,
  notifyAdvisorOfRequest,
  notifyAdvisorOfMilestone 
} from '@/lib/resend-notification';

// When student submits document
await notifyAdvisorOfSubmission(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
);

// When student revises after feedback
await notifyAdvisorOfRevision(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
);

// When student requests help
await notifyAdvisorOfRequest(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  requestType: string,  // e.g., "Help with statistics"
  studentId: string
);

// When student completes milestone
await notifyAdvisorOfMilestone(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  milestoneName: string,  // e.g., "Chapter 1 Complete"
  studentId: string
);
```

### STUDENT NOTIFICATIONS (notify student about advisor/critic action)

```typescript
import {
  notifyStudentOfAdvisorFeedback,
  notifyStudentOfCriticFeedback,
  notifyStudentOfRevisionRequest,
  notifyStudentOfMilestoneFeedback
} from '@/lib/resend-notification';

// When advisor provides feedback
await notifyStudentOfAdvisorFeedback(
  studentEmail: string,
  studentName: string,
  advisorName: string,
  documentTitle: string,
  documentId: string
);

// When critic provides feedback
await notifyStudentOfCriticFeedback(
  studentEmail: string,
  studentName: string,
  criticName: string,
  documentTitle: string,
  documentId: string
);

// When advisor/critic requests revision
await notifyStudentOfRevisionRequest(
  studentEmail: string,
  studentName: string,
  requesterName: string,
  requesterRole: 'advisor' | 'critic',
  documentTitle: string,
  documentId: string
);

// When advisor/critic provides milestone feedback
await notifyStudentOfMilestoneFeedback(
  studentEmail: string,
  studentName: string,
  senderName: string,
  senderRole: 'advisor' | 'critic',
  milestoneName: string,
  feedbackMessage: string
);
```

### CRITIC NOTIFICATIONS (notify critic about student action)

```typescript
import {
  notifyCriticOfSubmission,
  notifyCriticOfRevision,
  notifyCriticOfRequest,
  notifyCriticOfMilestone
} from '@/lib/resend-notification';

// When student submits document for critical review
await notifyCriticOfSubmission(
  criticEmail: string,
  criticName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
);

// When student revises after critic feedback
await notifyCriticOfRevision(
  criticEmail: string,
  criticName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
);

// When student requests critical review
await notifyCriticOfRequest(
  criticEmail: string,
  criticName: string,
  studentName: string,
  requestType: string,
  studentId: string
);

// When student completes milestone
await notifyCriticOfMilestone(
  criticEmail: string,
  criticName: string,
  studentName: string,
  milestoneName: string,
  studentId: string
);
```

---

## Integration Examples

### Example 1: Student Submits Document
```typescript
// src/app/api/documents/submit/route.ts

import { 
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission 
} from '@/lib/resend-notification';

export async function POST(request: Request) {
  // ... validate and save document ...
  
  const student = await getStudent(studentId);
  const advisor = await getAdvisorForStudent(studentId);
  const critics = await getCriticsForStudent(studentId);

  // Notify advisor
  if (advisor?.email) {
    await notifyAdvisorOfSubmission(
      advisor.email,
      advisor.first_name || 'Advisor',
      student.first_name || 'Student',
      document.title || 'Untitled',
      document.id
    );
  }

  // Notify all critics
  for (const critic of critics) {
    if (critic.email) {
      await notifyCriticOfSubmission(
        critic.email,
        critic.first_name || 'Critic',
        student.first_name || 'Student',
        document.title || 'Untitled',
        document.id
      );
    }
  }

  return Response.json({ success: true });
}
```

### Example 2: Advisor Provides Feedback
```typescript
// src/app/api/documents/feedback/route.ts

import { notifyStudentOfAdvisorFeedback } from '@/lib/resend-notification';

export async function POST(request: Request) {
  // ... save feedback ...
  
  const student = await getStudent(studentId);
  const advisor = await getAdvisor(advisorId);

  if (student?.email) {
    await notifyStudentOfAdvisorFeedback(
      student.email,
      student.first_name || 'Student',
      advisor.first_name || 'Advisor',
      document.title || 'Untitled',
      document.id
    );
  }

  return Response.json({ success: true });
}
```

### Example 3: Critic Provides Feedback
```typescript
// src/app/api/documents/critic-feedback/route.ts

import { notifyStudentOfCriticFeedback } from '@/lib/resend-notification';

export async function POST(request: Request) {
  // ... save feedback ...
  
  const student = await getStudent(studentId);
  const critic = await getCritic(criticId);

  if (student?.email) {
    await notifyStudentOfCriticFeedback(
      student.email,
      student.first_name || 'Student',
      critic.first_name || 'Critic',
      document.title || 'Untitled',
      document.id
    );
  }

  return Response.json({ success: true });
}
```

### Example 4: Request Revision
```typescript
// When requesting revision from student

import { notifyStudentOfRevisionRequest } from '@/lib/resend-notification';

// From advisor
await notifyStudentOfRevisionRequest(
  student.email,
  student.first_name,
  advisor.first_name,
  'advisor',
  document.title,
  document.id
);

// From critic
await notifyStudentOfRevisionRequest(
  student.email,
  student.first_name,
  critic.first_name,
  'critic',
  document.title,
  document.id
);
```

---

## Email Templates

### Advisor/Critic Template
**File:** `src/emails/advisor-notification.tsx`
- Gradient purple header
- Notification icons (📄, ✏️, ❓, 🎉)
- 4 action types: submission, revision, request, milestone
- Works for both advisors and critics

### Student Template
**File:** `src/emails/student-notification.tsx`
- Gradient green header
- Sender role badge (Advisor 👨‍🏫 / Critic 👁️)
- 4 action types: feedback, revision-request, milestone-feedback, general-message
- Different styling for student perspective

---

## API Endpoints

### Send to Advisor/Critic
```
POST /api/notifications/send-email
```

**Headers:**
```
x-api-key: [INTERNAL_API_KEY]
Content-Type: application/json
```

**Body:**
```json
{
  "to": "advisor@example.com",
  "advisorName": "Dr. Garcia",
  "studentName": "Maria Santos",
  "actionType": "submission",
  "documentTitle": "Chapter 1",
  "message": "Maria has submitted Chapter 1 for review.",
  "actionUrl": "https://...",
  "actionButtonText": "Review Now"
}
```

### Send to Student
```
POST /api/notifications/send-student-email
```

**Headers:**
```
x-api-key: [INTERNAL_API_KEY]
Content-Type: application/json
```

**Body:**
```json
{
  "to": "student@example.com",
  "studentName": "Maria Santos",
  "senderName": "Dr. Garcia",
  "senderRole": "advisor",
  "actionType": "feedback",
  "documentTitle": "Chapter 1",
  "message": "Your advisor has provided feedback.",
  "actionUrl": "https://...",
  "actionButtonText": "View Feedback"
}
```

### Send to Critic
```
POST /api/notifications/send-critic-email
```

Same as send-email endpoint, uses same template.

---

## Database Relationships

```sql
-- Check advisor-student relationship
SELECT * FROM advisor_student_relationships 
WHERE student_id = $1;

-- Check critic-student relationship
SELECT * FROM critic_student_relationships 
WHERE student_id = $1;

-- Get student's advisor
SELECT p.* FROM profiles p
JOIN advisor_student_relationships a ON p.id = a.advisor_id
WHERE a.student_id = $1;

-- Get student's critics
SELECT p.* FROM profiles p
JOIN critic_student_relationships c ON p.id = c.critic_id
WHERE c.student_id = $1;
```

---

## Environment Variables

Required in `.env.local`:
```env
# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com

# Security
INTERNAL_API_KEY=your-secure-key-here
NEXT_PUBLIC_INTERNAL_API_KEY=same-key-here
```

---

## Testing Checklist

- [ ] Advisor receives email when student submits document
- [ ] Critic receives email when student submits document
- [ ] Student receives email when advisor provides feedback
- [ ] Student receives email when critic provides feedback
- [ ] Student receives email when advisor requests revision
- [ ] Student receives email when critic requests revision
- [ ] All advisor emails have correct name and document title
- [ ] All student emails identify sender as Advisor or Critic
- [ ] All links in emails work correctly
- [ ] Email formatting looks good in Gmail, Outlook
- [ ] Multiple advisors/critics per student works

---

## Common Use Cases

### Case 1: Single Advisor, Single Critic
```typescript
// Student submits document
const advisor = await getAdvisorForStudent(studentId);
const critics = await getCriticsForStudent(studentId);

await notifyAdvisorOfSubmission(advisor.email, ...);
for (const critic of critics) {
  await notifyCriticOfSubmission(critic.email, ...);
}
```

### Case 2: Multiple Advisors
```typescript
// Get all advisors for student
const advisors = await getAdvisorsForStudent(studentId);

for (const advisor of advisors) {
  await notifyAdvisorOfSubmission(advisor.email, ...);
}
```

### Case 3: Advisor-Only Workflow
```typescript
// Only notify advisor, skip critics
const advisor = await getAdvisorForStudent(studentId);
await notifyAdvisorOfSubmission(advisor.email, ...);
```

### Case 4: No Advisor/Critic Assigned
```typescript
// Check if advisor/critic exists before sending
const advisor = await getAdvisorForStudent(studentId);
if (advisor?.email) {
  await notifyAdvisorOfSubmission(advisor.email, ...);
}
```

---

## Error Handling

```typescript
// Always wrap in try-catch for production
try {
  await notifyAdvisorOfSubmission(email, name, studentName, title, id);
} catch (error) {
  console.error('Failed to send notification:', error);
  // Log error, but don't block document submission
}
```

---

## Performance Notes

- Notifications are sent asynchronously
- Use `await` to ensure delivery before responding
- Multiple notifications can be sent in parallel with `Promise.all()`
- No API rate limits on Resend free plan

```typescript
// Send multiple emails in parallel
await Promise.all([
  notifyAdvisorOfSubmission(...),
  notifyCriticOfSubmission(...),
  notifyStudentOfAdvisorFeedback(...)
]);
```

---

## Next Steps

1. **Add Resend API key** to `.env.local`
2. **Implement in document submission** flow
3. **Implement in feedback** flow
4. **Test with real emails**
5. **Monitor delivery** via Resend dashboard
6. **Collect user feedback** on emails

See `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` for detailed integration instructions.
