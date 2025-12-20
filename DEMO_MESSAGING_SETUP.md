# Demo Messaging Setup Guide

This guide helps you set up sample advisor-student conversations for testing the messaging system.

## Option 1: Quick Setup with Demo UUIDs (Recommended for Testing)

Run the migration to add sample data:

```bash
supabase migration up
```

This will:
- Add `sender_name`, `sender_avatar_url`, and `read_status` columns to `advisor_student_messages`
- Insert 3 sample messages between Dr. Johnson (advisor) and Maria Santos (student)

**UUIDs used in sample data:**
- Advisor (Dr. Johnson): `11111111-1111-1111-1111-111111111111`
- Student (Maria Santos): `22222222-2222-2222-2222-222222222222`

## Option 2: Use Your Actual Demo Account UUIDs

If you already have demo accounts in your auth system, follow these steps:

### Step 1: Find Your Demo Account UUIDs

Login to Supabase Dashboard → Authentication → Users

Note down the UUIDs for:
- Your student account
- Your advisor account (or create one for testing)

### Step 2: Create Sample Messages

In Supabase SQL Editor, run this query (replace UUIDs):

```sql
INSERT INTO advisor_student_messages (
  sender_id,
  sender_name,
  sender_role,
  recipient_id,
  message,
  subject,
  is_read,
  read_status,
  created_at
) VALUES
-- Message 1: Advisor to Student
(
  'YOUR-ADVISOR-UUID-HERE'::UUID,
  'Dr. Johnson',
  'advisor',
  'YOUR-STUDENT-UUID-HERE'::UUID,
  'Hi Maria, how are you progressing with your thesis research? Have you started on the literature review?',
  'Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
-- Message 2: Student to Advisor  
(
  'YOUR-STUDENT-UUID-HERE'::UUID,
  'Maria Santos',
  'student',
  'YOUR-ADVISOR-UUID-HERE'::UUID,
  'Hi Dr. Johnson! Great to hear from you. I''ve finished the literature review and reviewed 45 papers. I''m ready to discuss Chapter 1 findings.',
  'Re: Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '30 minutes'
),
-- Message 3: Advisor to Student
(
  'YOUR-ADVISOR-UUID-HERE'::UUID,
  'Dr. Johnson',
  'advisor',
  'YOUR-STUDENT-UUID-HERE'::UUID,
  'Excellent work! 45 papers is a solid foundation. Let''s schedule a meeting next week to review your findings.',
  'Re: Thesis Progress Check-in',
  false,
  false,
  NOW() - INTERVAL '10 minutes'
);
```

## Option 3: Add Messages Programmatically

Create a script to insert demo messages via your API:

```typescript
// lib/demo-messaging-setup.ts
import { supabase } from '@/integrations/supabase/client';

export async function setupDemoMessaging(
  advisorId: string,
  advisorName: string,
  studentId: string,
  studentName: string
) {
  const messages = [
    {
      sender_id: advisorId,
      sender_name: advisorName,
      sender_role: 'advisor',
      recipient_id: studentId,
      message: 'Hi, how are you progressing with your thesis research?',
      subject: 'Thesis Progress Check-in',
      is_read: true,
      read_status: true,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      sender_id: studentId,
      sender_name: studentName,
      sender_role: 'student',
      recipient_id: advisorId,
      message: 'Great! I finished the literature review. Ready to discuss Chapter 1.',
      subject: 'Re: Thesis Progress Check-in',
      is_read: true,
      read_status: true,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      sender_id: advisorId,
      sender_name: advisorName,
      sender_role: 'advisor',
      recipient_id: studentId,
      message: 'Perfect! Let''s schedule a meeting next week to review your findings.',
      subject: 'Re: Thesis Progress Check-in',
      is_read: false,
      read_status: false,
      created_at: new Date(Date.now() - 600000).toISOString()
    }
  ];

  const { error } = await supabase
    .from('advisor_student_messages')
    .insert(messages);

  if (error) {
    console.error('Error inserting demo messages:', error);
    throw error;
  }

  return messages;
}
```

Usage in a page or component:

```typescript
import { setupDemoMessaging } from '@/lib/demo-messaging-setup';

// Call this when setting up demo account
await setupDemoMessaging(
  'advisor-uuid-here',
  'Dr. Johnson',
  'student-uuid-here',
  'Maria Santos'
);
```

## Verifying Your Demo Messages

1. **Via Supabase Dashboard:**
   - Go to Supabase → Tables → `advisor_student_messages`
   - Check that messages appear with correct sender/recipient IDs

2. **Via Application:**
   - Login as the student account
   - Navigate to Messages section
   - Should see conversation with advisor
   - Messages should display with sender names and timestamps

3. **Via Browser Console:**
   - Open DevTools → Console
   - Check that no "Error loading direct messages" appears
   - Check that conversation loads successfully

## Sample Conversation Flow

**Timeline:**
```
Dr. Johnson (Advisor)                 Maria Santos (Student)
    │                                      │
    │─ "How are you progressing..." ─────→│  (60 min ago) ✓ Read
    │                                      │
    │←─ "I finished the literature..." ────│  (30 min ago) ✓ Read
    │                                      │
    │─ "Perfect! Let's schedule..." ─────→│  (10 min ago) ◯ Unread
```

## Troubleshooting

**"No conversations yet" message?**
- Ensure you're logged in with the student account (recipient of messages)
- Check that sender/recipient UUIDs are correct
- Verify messages in Supabase Dashboard

**"Error loading direct messages" in console?**
- Run migration: `supabase migration up`
- Check that `sender_name` column exists: `ALTER TABLE advisor_student_messages ADD COLUMN IF NOT EXISTS sender_name TEXT;`
- Verify RLS policies allow you to see messages

**Messages not appearing?**
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser DevTools → Network tab for API errors
- Verify user has correct role (student/advisor) in profiles table

## Next Steps

Once demo messaging works:
1. Test sending new messages between accounts
2. Verify read status updates
3. Test on different devices/browsers for real-time sync
4. Remove demo data before production deployment
