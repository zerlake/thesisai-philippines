# Email Notifications - Integration Code Patterns
## Copy-Paste Ready Integration Code

**Date:** December 6, 2025

---

## Pattern 1: Document Submission

### Scenario: Student submits document to advisor AND critic

**Location:** Document submission API route

```typescript
// src/app/api/documents/submit/route.ts (or similar)

import { 
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission 
} from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { documentTitle, content, studentId } = await request.json();

    // 1. Save document to database
    const document = await db.documents.create({
      title: documentTitle,
      content,
      userId: studentId,
    });

    // 2. Get student info
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get advisor
    const advisorRelation = await db.advisorStudentRelationships.findFirst({
      where: { studentId },
      include: {
        advisor: true, // Get full advisor profile
      },
    });

    // 4. Notify advisor
    if (advisorRelation?.advisor?.email) {
      await notifyAdvisorOfSubmission(
        advisorRelation.advisor.email,
        advisorRelation.advisor.first_name || 'Advisor',
        student?.first_name || 'Student',
        documentTitle,
        document.id
      ).catch(error => {
        // Log error but don't block submission
        console.error('Failed to notify advisor:', error);
      });
    }

    // 5. Get all critics
    const criticRelations = await db.criticStudentRelationships.findMany({
      where: { studentId },
      include: {
        critic: true, // Get full critic profile
      },
    });

    // 6. Notify all critics in parallel
    await Promise.all(
      criticRelations.map(relation =>
        notifyCriticOfSubmission(
          relation.critic.email,
          relation.critic.first_name || 'Critic',
          student?.first_name || 'Student',
          documentTitle,
          document.id
        ).catch(error => {
          // Log error but don't block
          console.error('Failed to notify critic:', error);
        })
      )
    );

    return Response.json({
      success: true,
      documentId: document.id,
    });
  } catch (error) {
    console.error('Document submission error:', error);
    return Response.json(
      { error: 'Failed to submit document' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 2: Advisor Provides Feedback

### Scenario: Advisor adds feedback, student gets notified

**Location:** Feedback/comment submission endpoint

```typescript
// src/app/api/documents/feedback/route.ts (or similar)

import { notifyStudentOfAdvisorFeedback } from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { documentId, feedback, advisorId, studentId } = await request.json();

    // 1. Save feedback
    const comment = await db.comments.create({
      documentId,
      content: feedback,
      authorId: advisorId,
    });

    // 2. Get student email
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get advisor name
    const advisor = await db.profiles.findUnique({
      where: { id: advisorId },
    });

    // 4. Get document title
    const document = await db.documents.findUnique({
      where: { id: documentId },
    });

    // 5. Notify student (if email exists)
    if (student?.email && advisor?.email) {
      await notifyStudentOfAdvisorFeedback(
        student.email,
        student.first_name || 'Student',
        advisor.first_name || 'Advisor',
        document?.title || 'Untitled Document',
        documentId
      ).catch(error => {
        console.error('Failed to notify student:', error);
        // Don't block feedback submission if email fails
      });
    }

    return Response.json({
      success: true,
      commentId: comment.id,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return Response.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 3: Critic Provides Feedback

### Scenario: Critic adds feedback, student gets notified

**Location:** Critic feedback endpoint

```typescript
// src/app/api/documents/critic-feedback/route.ts (or similar)

import { notifyStudentOfCriticFeedback } from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { documentId, feedback, criticId, studentId } = await request.json();

    // 1. Save feedback
    const comment = await db.criticComments.create({
      documentId,
      content: feedback,
      authorId: criticId,
    });

    // 2. Get student
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get critic
    const critic = await db.profiles.findUnique({
      where: { id: criticId },
    });

    // 4. Get document
    const document = await db.documents.findUnique({
      where: { id: documentId },
    });

    // 5. Notify student
    if (student?.email && critic?.email) {
      await notifyStudentOfCriticFeedback(
        student.email,
        student.first_name || 'Student',
        critic.first_name || 'Critic',
        document?.title || 'Untitled Document',
        documentId
      ).catch(error => {
        console.error('Failed to notify student of critic feedback:', error);
      });
    }

    return Response.json({
      success: true,
      commentId: comment.id,
    });
  } catch (error) {
    console.error('Critic feedback error:', error);
    return Response.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 4: Request Revision (Advisor)

### Scenario: Advisor requests revision, student gets notified

**Location:** Revision request endpoint

```typescript
// src/app/api/documents/request-revision/route.ts (or similar)

import { notifyStudentOfRevisionRequest } from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { documentId, studentId, advisorId, revisionNotes } = await request.json();

    // 1. Create revision request
    const revisionRequest = await db.revisionRequests.create({
      documentId,
      requestedBy: advisorId,
      notes: revisionNotes,
      status: 'pending',
    });

    // 2. Get student
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get advisor
    const advisor = await db.profiles.findUnique({
      where: { id: advisorId },
    });

    // 4. Get document
    const document = await db.documents.findUnique({
      where: { id: documentId },
    });

    // 5. Notify student
    if (student?.email) {
      await notifyStudentOfRevisionRequest(
        student.email,
        student.first_name || 'Student',
        advisor?.first_name || 'Advisor',
        'advisor',
        document?.title || 'Untitled Document',
        documentId
      ).catch(error => {
        console.error('Failed to notify student of revision request:', error);
      });
    }

    return Response.json({
      success: true,
      revisionRequestId: revisionRequest.id,
    });
  } catch (error) {
    console.error('Revision request error:', error);
    return Response.json(
      { error: 'Failed to request revision' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 5: Request Revision (Critic)

### Scenario: Critic requests revision, student gets notified

**Location:** Critic revision request endpoint

```typescript
// src/app/api/documents/critic-request-revision/route.ts

import { notifyStudentOfRevisionRequest } from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { documentId, studentId, criticId, revisionNotes } = await request.json();

    // 1. Create revision request
    const revisionRequest = await db.criticRevisionRequests.create({
      documentId,
      requestedBy: criticId,
      notes: revisionNotes,
      status: 'pending',
    });

    // 2. Get student
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get critic
    const critic = await db.profiles.findUnique({
      where: { id: criticId },
    });

    // 4. Get document
    const document = await db.documents.findUnique({
      where: { id: documentId },
    });

    // 5. Notify student
    if (student?.email) {
      await notifyStudentOfRevisionRequest(
        student.email,
        student.first_name || 'Student',
        critic?.first_name || 'Critic',
        'critic', // <-- Note: 'critic' role instead of 'advisor'
        document?.title || 'Untitled Document',
        documentId
      ).catch(error => {
        console.error('Failed to notify student of revision request:', error);
      });
    }

    return Response.json({
      success: true,
      revisionRequestId: revisionRequest.id,
    });
  } catch (error) {
    console.error('Critic revision request error:', error);
    return Response.json(
      { error: 'Failed to request revision' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 6: Milestone Completion

### Scenario: Student completes milestone, notify advisor and critics

**Location:** Milestone completion handler

```typescript
// src/app/api/milestones/complete/route.ts (or update progress endpoint)

import {
  notifyAdvisorOfMilestone,
  notifyCriticOfMilestone,
} from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { studentId, milestoneId, milestoneName } = await request.json();

    // 1. Mark milestone as complete
    const milestone = await db.milestones.update({
      where: { id: milestoneId },
      data: { completedAt: new Date() },
    });

    // 2. Get student
    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // 3. Get advisor
    const advisorRelation = await db.advisorStudentRelationships.findFirst({
      where: { studentId },
      include: { advisor: true },
    });

    // 4. Notify advisor
    if (advisorRelation?.advisor?.email) {
      await notifyAdvisorOfMilestone(
        advisorRelation.advisor.email,
        advisorRelation.advisor.first_name || 'Advisor',
        student?.first_name || 'Student',
        milestoneName,
        studentId
      ).catch(error => {
        console.error('Failed to notify advisor of milestone:', error);
      });
    }

    // 5. Get all critics
    const criticRelations = await db.criticStudentRelationships.findMany({
      where: { studentId },
      include: { critic: true },
    });

    // 6. Notify all critics
    await Promise.all(
      criticRelations.map(relation =>
        notifyCriticOfMilestone(
          relation.critic.email,
          relation.critic.first_name || 'Critic',
          student?.first_name || 'Student',
          milestoneName,
          studentId
        ).catch(error => {
          console.error('Failed to notify critic of milestone:', error);
        })
      )
    );

    return Response.json({
      success: true,
      milestoneId: milestone.id,
    });
  } catch (error) {
    console.error('Milestone completion error:', error);
    return Response.json(
      { error: 'Failed to complete milestone' },
      { status: 500 }
    );
  }
}
```

---

## Pattern 7: Error Handling Wrapper

### Reusable error-safe notification wrapper

```typescript
// src/lib/notification-helpers.ts

import { 
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission,
  notifyStudentOfAdvisorFeedback,
} from '@/lib/resend-notification';

/**
 * Safely notify advisor without blocking the operation
 */
export async function safeNotifyAdvisor(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  documentTitle: string,
  documentId: string,
  onError?: (error: Error) => void
) {
  try {
    await notifyAdvisorOfSubmission(
      advisorEmail,
      advisorName,
      studentName,
      documentTitle,
      documentId
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Advisor notification failed:', err);
    onError?.(err);
  }
}

/**
 * Safely notify multiple critics in parallel
 */
export async function safeNotifyAllCritics(
  critics: Array<{ email: string; first_name: string }>,
  studentName: string,
  documentTitle: string,
  documentId: string,
  onError?: (criticName: string, error: Error) => void
) {
  const results = await Promise.allSettled(
    critics.map(critic =>
      notifyCriticOfSubmission(
        critic.email,
        critic.first_name,
        studentName,
        documentTitle,
        documentId
      )
    )
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const error = result.reason instanceof Error 
        ? result.reason 
        : new Error(String(result.reason));
      console.error(
        `Failed to notify critic ${critics[index].first_name}:`,
        error
      );
      onError?.(critics[index].first_name, error);
    }
  });
}

/**
 * Send notification with retry logic
 */
export async function notifyWithRetry(
  notificationFn: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await notificationFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
}
```

**Usage:**
```typescript
// Safe advisor notification
await safeNotifyAdvisor(
  advisor.email,
  advisor.first_name,
  student.first_name,
  document.title,
  document.id,
  (error) => {
    // Handle error separately if needed
    logToErrorService(error);
  }
);

// Safe critic notifications
await safeNotifyAllCritics(
  critics,
  student.first_name,
  document.title,
  document.id
);

// With retry
await notifyWithRetry(
  () => notifyAdvisorOfSubmission(...)
);
```

---

## Pattern 8: Conditional Notification

### Only notify if conditions are met

```typescript
// Example: Only notify if advisor accepts notifications

export async function notifyAdvisorIfEnabled(
  advisorId: string,
  notificationFn: (email: string, name: string) => Promise<any>
) {
  // 1. Check if advisor has notifications enabled
  const preferences = await db.userNotificationPreferences.findUnique({
    where: { userId: advisorId },
  });

  if (!preferences?.emailNotificationsEnabled) {
    console.log(`Advisor ${advisorId} has disabled email notifications`);
    return;
  }

  // 2. Get advisor details
  const advisor = await db.profiles.findUnique({
    where: { id: advisorId },
  });

  if (!advisor?.email) {
    console.log(`Advisor ${advisorId} has no email address`);
    return;
  }

  // 3. Send notification
  await notificationFn(advisor.email, advisor.first_name || 'Advisor');
}

// Usage
await notifyAdvisorIfEnabled(
  advisorId,
  (email, name) => notifyAdvisorOfSubmission(
    email,
    name,
    student.first_name,
    document.title,
    document.id
  )
);
```

---

## Pattern 9: Bulk Notifications

### Notify multiple recipients efficiently

```typescript
// src/app/api/notifications/bulk-send/route.ts

import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';

export async function POST(request: Request) {
  try {
    const { studentId, documentId, documentTitle } = await request.json();

    const student = await db.profiles.findUnique({
      where: { id: studentId },
    });

    // Get all advisors for this student
    const advisors = await db.advisorStudentRelationships.findMany({
      where: { studentId },
      include: { advisor: true },
    });

    // Send to all advisors in parallel
    const results = await Promise.allSettled(
      advisors.map(rel =>
        notifyAdvisorOfSubmission(
          rel.advisor.email,
          rel.advisor.first_name || 'Advisor',
          student?.first_name || 'Student',
          documentTitle,
          documentId
        )
      )
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return Response.json({
      success: true,
      sent: successful,
      failed: failed,
      total: advisors.length,
    });
  } catch (error) {
    console.error('Bulk notification error:', error);
    return Response.json(
      { error: 'Failed to send bulk notifications' },
      { status: 500 }
    );
  }
}
```

---

## Integration Checklist

Use this checklist when implementing each pattern:

### Before Integration
- [ ] Identify the API endpoint/handler
- [ ] Determine who should be notified
- [ ] Choose the appropriate notification function
- [ ] Check email field exists in profiles table
- [ ] Check relationship table exists (advisor_student, critic_student)

### During Integration
- [ ] Import notification function
- [ ] Save/update database record first
- [ ] Fetch required user data
- [ ] Call notification function (with error handling)
- [ ] Don't block main operation on notification failure

### After Integration
- [ ] Test with `delivered@resend.dev`
- [ ] Verify email content is correct
- [ ] Check links work
- [ ] Test with real email address
- [ ] Monitor Resend dashboard

---

## Common Gotchas

### ❌ Don't
```typescript
// Block operation if email fails
if (email sending fails) {
  return error;  // ← Document doesn't save!
}
```

### ✅ Do
```typescript
// Email failure doesn't block operation
try {
  await sendEmail(...);
} catch (error) {
  console.error(error);
  // Continue - document still saves
}
```

### ❌ Don't
```typescript
// Send one email at a time
for (const critic of critics) {
  await notifyCritic(...);  // ← Slow!
}
```

### ✅ Do
```typescript
// Send all emails in parallel
await Promise.all(
  critics.map(critic => notifyCritic(...))
);
```

### ❌ Don't
```typescript
// Forget to check if email exists
await notifyStudent(student.email, ...);  // What if null?
```

### ✅ Do
```typescript
// Check before sending
if (student?.email) {
  await notifyStudent(student.email, ...);
}
```

---

## Environment Setup Required

Before any integration works, `.env.local` must have:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
INTERNAL_API_KEY=your-secure-key-32-chars
NEXT_PUBLIC_INTERNAL_API_KEY=same-key-32-chars
```

Generate keys with:
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Testing Patterns

### Unit Test
```typescript
// src/__tests__/notifications.test.ts

import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';

describe('Email Notifications', () => {
  test('notifyAdvisorOfSubmission sends email with correct parameters', async () => {
    const result = await notifyAdvisorOfSubmission(
      'advisor@test.com',
      'Dr. Garcia',
      'Maria Santos',
      'Chapter 1',
      'doc-123'
    );
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Test
```typescript
// Test full flow
test('document submission triggers advisor and critic notifications', async () => {
  // Create student, advisor, critic
  // Submit document
  // Verify emails were sent
  // Check email content
});
```

---

## Performance Optimization

### Use Parallel Notifications
```typescript
// ✅ Fast: ~1-2 seconds
await Promise.all([
  notifyAdvisor(...),
  notifyCritic1(...),
  notifyCritic2(...),
]);

// ❌ Slow: ~3-6 seconds
await notifyAdvisor(...);
await notifyCritic1(...);
await notifyCritic2(...);
```

### Use Promise.allSettled for Robustness
```typescript
// Don't fail if one email fails
const results = await Promise.allSettled([
  notifyAdvisor(...),
  notifyCritic(...),
]);

// Check individual results
results.forEach((result, i) => {
  if (result.status === 'rejected') {
    console.error(`Notification ${i} failed:`, result.reason);
  }
});
```

---

This document provides copy-paste ready patterns for all common integration scenarios. Adjust database queries and field names to match your actual schema.
