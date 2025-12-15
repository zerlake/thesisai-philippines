# Email Notifications Implementation Guide
## Student ↔ Advisor ↔ Critic Communication

**Date:** December 6, 2025  
**Status:** Implementation Ready

## Overview

This document covers the complete implementation of email notifications for three-way communication:
- **Student → Advisor**: Student submits document to advisor
- **Advisor → Student**: Advisor provides feedback to student
- **Student → Critic**: Student submits document to critic
- **Critic → Student**: Critic provides feedback to student

## Architecture

### Email Templates

#### 1. **Advisor/Critic Notification Template** (`src/emails/advisor-notification.tsx`)
Used for notifying advisors and critics about:
- Document submissions from students
- Revisions submitted by students
- Help requests from students
- Milestone achievements

**Key Features:**
- Gradient purple header for advisors
- Support for 4 action types (submission, revision, request, milestone)
- Call-to-action button
- Personalized greeting with advisor/critic name
- Responsive design

**Usage:**
```typescript
// Sent to advisors
notifyAdvisorOfSubmission(advisorEmail, advisorName, studentName, docTitle, docId)

// Sent to critics (same template, different email)
notifyCriticOfSubmission(criticEmail, criticName, studentName, docTitle, docId)
```

#### 2. **Student Notification Template** (`src/emails/student-notification.tsx`)
Used for notifying students about:
- Feedback from advisors
- Feedback from critics
- Revision requests
- Milestone feedback

**Key Features:**
- Gradient green header for students
- Support for 4 action types (feedback, revision-request, milestone-feedback, general-message)
- Sender role badge (Advisor/Critic)
- Call-to-action button
- Responsive design

**Usage:**
```typescript
// Feedback from advisor
notifyStudentOfAdvisorFeedback(studentEmail, studentName, advisorName, docTitle, docId)

// Feedback from critic
notifyStudentOfCriticFeedback(studentEmail, studentName, criticName, docTitle, docId)

// Revision request
notifyStudentOfRevisionRequest(studentEmail, studentName, requesterName, 'advisor'|'critic', docTitle, docId)
```

### Notification Functions

Located in `src/lib/resend-notification.ts`:

#### Advisor Notifications
- `notifyAdvisorOfSubmission()` - Student submitted document
- `notifyAdvisorOfRevision()` - Student resubmitted after feedback
- `notifyAdvisorOfRequest()` - Student requested help
- `notifyAdvisorOfMilestone()` - Student reached milestone

#### Student Notifications
- `notifyStudentOfAdvisorFeedback()` - Advisor provided feedback
- `notifyStudentOfCriticFeedback()` - Critic provided feedback
- `notifyStudentOfRevisionRequest()` - Request to revise document
- `notifyStudentOfMilestoneFeedback()` - Milestone achievement feedback

#### Critic Notifications
- `notifyCriticOfSubmission()` - Student submitted document
- `notifyCriticOfRevision()` - Student resubmitted after feedback
- `notifyCriticOfRequest()` - Student requested critical review
- `notifyCriticOfMilestone()` - Student reached milestone

### API Routes

#### 1. **POST /api/notifications/send-email**
Sends emails to advisors/critics

**Required Headers:**
```
x-api-key: [INTERNAL_API_KEY]
Content-Type: application/json
```

**Request Body:**
```typescript
{
  to: string;                    // Email address
  advisorName?: string;          // Advisor/Critic name
  studentName?: string;          // Student name
  actionType?: string;           // submission|revision|request|milestone
  documentTitle?: string;        // Document/topic title
  message?: string;              // Email message
  actionUrl?: string;            // Link for CTA button
  actionButtonText?: string;     // CTA button text
}
```

#### 2. **POST /api/notifications/send-student-email**
Sends emails to students

**Required Headers:**
```
x-api-key: [INTERNAL_API_KEY]
Content-Type: application/json
```

**Request Body:**
```typescript
{
  to: string;                    // Student email
  studentName?: string;          // Student name
  senderName?: string;           // Advisor/Critic name
  senderRole?: string;           // 'advisor' | 'critic'
  actionType?: string;           // feedback|revision-request|milestone-feedback|general-message
  documentTitle?: string;        // Document/topic title
  message?: string;              // Email message
  actionUrl?: string;            // Link for CTA button
  actionButtonText?: string;     // CTA button text
}
```

#### 3. **POST /api/notifications/send-critic-email**
Sends emails to critics (uses same template as advisors)

**Required Headers:**
```
x-api-key: [INTERNAL_API_KEY]
Content-Type: application/json
```

## Integration Points

### 1. Document Submission Flow

**Location:** Document upload/submit endpoint

**Student → Advisor:**
```typescript
import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';

// After document is saved
const advisor = await getAdvisorForStudent(studentId);
if (advisor?.email) {
  await notifyAdvisorOfSubmission(
    advisor.email,
    advisor.first_name || 'Advisor',
    student.first_name || 'Student',
    document.title || 'Untitled',
    document.id
  );
}
```

**Student → Critic:**
```typescript
import { notifyCriticOfSubmission } from '@/lib/resend-notification';

// After document is saved
const critics = await getCriticsForStudent(studentId);
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
```

### 2. Feedback Submission Flow

**Location:** When advisor/critic adds feedback to document

**Advisor → Student:**
```typescript
import { notifyStudentOfAdvisorFeedback } from '@/lib/resend-notification';

// After feedback is saved
const student = await getStudent(studentId);
const advisor = await getAdvisor(advisorId);

if (student?.email && advisor?.email) {
  await notifyStudentOfAdvisorFeedback(
    student.email,
    student.first_name || 'Student',
    advisor.first_name || 'Advisor',
    document.title || 'Untitled',
    document.id
  );
}
```

**Critic → Student:**
```typescript
import { notifyStudentOfCriticFeedback } from '@/lib/resend-notification';

// After feedback is saved
const student = await getStudent(studentId);
const critic = await getCritic(criticId);

if (student?.email && critic?.email) {
  await notifyStudentOfCriticFeedback(
    student.email,
    student.first_name || 'Student',
    critic.first_name || 'Critic',
    document.title || 'Untitled',
    document.id
  );
}
```

### 3. Revision Request Flow

**Location:** When requesting revision

**Advisor → Student:**
```typescript
import { notifyStudentOfRevisionRequest } from '@/lib/resend-notification';

const student = await getStudent(studentId);
const advisor = await getAdvisor(advisorId);

if (student?.email) {
  await notifyStudentOfRevisionRequest(
    student.email,
    student.first_name || 'Student',
    advisor.first_name || 'Advisor',
    'advisor',
    document.title || 'Untitled',
    document.id
  );
}
```

**Critic → Student:**
```typescript
import { notifyStudentOfRevisionRequest } from '@/lib/resend-notification';

const student = await getStudent(studentId);
const critic = await getCritic(criticId);

if (student?.email) {
  await notifyStudentOfRevisionRequest(
    student.email,
    student.first_name || 'Student',
    critic.first_name || 'Critic',
    'critic',
    document.title || 'Untitled',
    document.id
  );
}
```

### 4. Milestone Completion Flow

**Location:** When student completes milestone

**To Advisor:**
```typescript
import { notifyAdvisorOfMilestone } from '@/lib/resend-notification';

const advisor = await getAdvisorForStudent(studentId);
if (advisor?.email) {
  await notifyAdvisorOfMilestone(
    advisor.email,
    advisor.first_name || 'Advisor',
    student.first_name || 'Student',
    'Chapter 1 - Introduction Completed',
    studentId
  );
}
```

**To Critic:**
```typescript
import { notifyCriticOfMilestone } from '@/lib/resend-notification';

const critics = await getCriticsForStudent(studentId);
for (const critic of critics) {
  if (critic.email) {
    await notifyCriticOfMilestone(
      critic.email,
      critic.first_name || 'Critic',
      student.first_name || 'Student',
      'Chapter 1 - Introduction Completed',
      studentId
    );
  }
}
```

**To Student:**
```typescript
import { notifyStudentOfMilestoneFeedback } from '@/lib/resend-notification';

const student = await getStudent(studentId);
if (student?.email) {
  await notifyStudentOfMilestoneFeedback(
    student.email,
    student.first_name || 'Student',
    'System',
    'system', // or 'advisor'/'critic' if applicable
    'Chapter 1 - Introduction Completed',
    '🎉 Great job completing this milestone! Your advisor will review your work.'
  );
}
```

## Database Tables

The relationships between students, advisors, and critics are stored in:

- **advisor_student_relationships**: Links students to their advisors
  - `advisor_id`: UUID of advisor
  - `student_id`: UUID of student
  - `created_at`: Timestamp

- **critic_student_relationships**: Links students to their critics
  - `critic_id`: UUID of critic
  - `student_id`: UUID of student
  - `created_at`: Timestamp

- **profiles**: Contains user information
  - `email`: User email address
  - `first_name`: User's first name
  - `last_name`: User's last name
  - `role`: User role (student, advisor, critic, admin)

## Environment Setup

### 1. Get Resend API Key
```bash
# Visit https://resend.com
# Sign up for free account
# Copy API key from dashboard
```

### 2. Update `.env.local`
```env
# Email service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com

# Security keys (generate with command below)
INTERNAL_API_KEY=your-secure-key-here
NEXT_PUBLIC_INTERNAL_API_KEY=same-key-here
```

### 3. Generate Secure Keys (Windows PowerShell)
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 4. Generate Secure Keys (Mac/Linux)
```bash
openssl rand -base64 32
```

## Testing

### 1. Test Email Endpoint
```bash
# Test advisor email
curl -X POST http://localhost:3000/api/notifications/send-email \
  -H "Content-Type: application/json" \
  -H "x-api-key: [YOUR_INTERNAL_API_KEY]" \
  -d '{
    "to": "delivered@resend.dev",
    "advisorName": "Dr. Garcia",
    "studentName": "Maria Santos",
    "actionType": "submission",
    "documentTitle": "Chapter 1",
    "message": "Maria has submitted Chapter 1 for review.",
    "actionUrl": "https://thesisai-philippines.vercel.app/advisor",
    "actionButtonText": "Review Now"
  }'

# Test student email
curl -X POST http://localhost:3000/api/notifications/send-student-email \
  -H "Content-Type: application/json" \
  -H "x-api-key: [YOUR_INTERNAL_API_KEY]" \
  -d '{
    "to": "delivered@resend.dev",
    "studentName": "Maria Santos",
    "senderName": "Dr. Garcia",
    "senderRole": "advisor",
    "actionType": "feedback",
    "documentTitle": "Chapter 1",
    "message": "Your advisor has provided feedback on your chapter.",
    "actionUrl": "https://thesisai-philippines.vercel.app/drafts/123",
    "actionButtonText": "View Feedback"
  }'
```

### 2. Use Test Email Address
Resend provides a test email for development:
```
delivered@resend.dev
```

### 3. Monitor Email Delivery
Visit [Resend Dashboard](https://dashboard.resend.com) to:
- View sent emails
- Check delivery status
- Monitor open/click rates
- View bounce reports

## Error Handling

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check `x-api-key` header matches `INTERNAL_API_KEY` |
| Missing email | Ensure `to` field is provided and valid |
| Failed to send | Check Resend API key is valid and not expired |
| Emails in spam | Add noreply email to contacts in email client |

### Logging

All errors are logged to console:
```
Failed to send notification email: [error message]
```

Check server logs in `pnpm dev` output for debugging.

## Checklist

### Phase 1: Setup
- [ ] Get Resend API key
- [ ] Add environment variables to `.env.local`
- [ ] Test email routes with curl

### Phase 2: Integration
- [ ] Add advisor notifications to document submission
- [ ] Add critic notifications to document submission
- [ ] Add student notifications to advisor feedback
- [ ] Add student notifications to critic feedback
- [ ] Add notifications to revision requests
- [ ] Add notifications to milestones

### Phase 3: Testing
- [ ] Test advisor receives document submission email
- [ ] Test student receives feedback email
- [ ] Test critic receives document submission email
- [ ] Test links in emails work
- [ ] Test email styling in different clients
- [ ] Test with multiple advisors/critics per student

### Phase 4: Monitoring
- [ ] Set up email alerts
- [ ] Monitor delivery rates
- [ ] Track open rates
- [ ] Monitor bounce rates
- [ ] Collect user feedback

## Reference

### Helper Functions Summary
```typescript
// Advisor notifications
notifyAdvisorOfSubmission(email, name, studentName, docTitle, docId)
notifyAdvisorOfRevision(email, name, studentName, docTitle, docId)
notifyAdvisorOfRequest(email, name, studentName, requestType, studentId)
notifyAdvisorOfMilestone(email, name, studentName, milestoneName, studentId)

// Student notifications
notifyStudentOfAdvisorFeedback(email, name, advisorName, docTitle, docId)
notifyStudentOfCriticFeedback(email, name, criticName, docTitle, docId)
notifyStudentOfRevisionRequest(email, name, requesterName, role, docTitle, docId)
notifyStudentOfMilestoneFeedback(email, name, senderName, role, milestoneName, message)

// Critic notifications
notifyCriticOfSubmission(email, name, studentName, docTitle, docId)
notifyCriticOfRevision(email, name, studentName, docTitle, docId)
notifyCriticOfRequest(email, name, studentName, requestType, studentId)
notifyCriticOfMilestone(email, name, studentName, milestoneName, studentId)
```

### API Endpoints
- `POST /api/notifications/send-email` - Send to advisors/critics
- `POST /api/notifications/send-student-email` - Send to students
- `POST /api/notifications/send-critic-email` - Send to critics

### Email Templates
- `src/emails/advisor-notification.tsx` - For advisor/critic emails
- `src/emails/student-notification.tsx` - For student emails

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Resend documentation: https://resend.com/docs
3. Check server logs: `pnpm dev`
4. Test with `delivered@resend.dev`
