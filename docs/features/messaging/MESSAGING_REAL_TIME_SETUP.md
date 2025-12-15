# Real-Time Messaging Setup Guide

## Overview

This document explains how to set up and test the real-time messaging feature with student, advisor, and critic roles.

## What's Changed

### 1. **Real UUIDs from Auth System**
- All messaging now uses real UUIDs from Supabase auth instead of hardcoded "demo-student-1" strings
- When users log in via demo login, they get assigned a real UUID
- The conversation panel uses `session.user.id` (the real UUID) for all operations

### 2. **Real-Time Message Delivery**
- Messages are delivered instantly to all participants using Supabase Realtime subscriptions
- When a message is inserted, the database notifies all subscribed clients
- No need to refresh or poll - messages appear immediately in the UI

### 3. **Send Status Modals**
- Success modal appears when a message is sent successfully
- Error modal appears if sending fails
- Modals auto-dismiss after 3 seconds (success) or stay until user closes (error)
- Provides clear feedback to users

## Sample User Credentials

After running the setup script, the following accounts are available:

```
Student:
  Email: student@demo.thesisai.local
  Password: demo123456
  Role: student

Advisor:
  Email: advisor@demo.thesisai.local
  Password: demo123456
  Role: advisor

Critic:
  Email: critic@demo.thesisai.local
  Password: demo123456
  Role: critic
```

## Testing Real-Time Messaging

### Step 1: Initialize Sample Data

```bash
# Option A: Using the TypeScript script
npx ts-node scripts/setup-messaging-demo.ts

# Option B: Manual setup via API
curl -X POST http://localhost:3000/api/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@demo.thesisai.local", "password": "demo123456"}'
```

### Step 2: Open Two Browser Windows

1. **Window 1**: Open http://localhost:3000/login
2. **Window 2**: Open http://localhost:3000/login in an incognito/private window

### Step 3: Log In as Different Roles

- **Window 1**: Log in as student (student@demo.thesisai.local / demo123456)
- **Window 2**: Log in as advisor (advisor@demo.thesisai.local / demo123456)

### Step 4: Open Conversation Panel

The conversation panel typically appears as a sidebar in the dashboard. You should see:
- List of previous messages (if any)
- Input field to type a message
- Send button

### Step 5: Send Messages

1. In Window 1 (Student), type a message: "Hello advisor, I need feedback"
2. Click "Send Message"
3. You should see:
   - ✅ Success modal in Window 1
   - 📨 Message appears instantly in Window 2 (Advisor)
   - Message styled as sent by student

4. In Window 2 (Advisor), type a reply: "Sure! Let me review your work"
5. Click "Send Message"
6. You should see:
   - ✅ Success modal in Window 2
   - 📨 Message appears instantly in Window 1 (Student)
   - Message styled as sent by advisor

## Architecture

### Message Flow

```
User sends message
    ↓
conversation-panel.tsx (handleSendMessage)
    ↓
/api/messages/send (validate & insert)
    ↓
Supabase Database
    ↓
Realtime Broadcast
    ↓
All subscribed clients receive update
    ↓
Messages appear instantly in conversation panel
```

### Real-Time Subscription

The conversation panel subscribes to the `advisor_student_messages` table:

```typescript
supabase
  .channel(`messages:${userId}:${recipientId || 'all'}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'advisor_student_messages',
    filter: `sender_id=eq.${recipientId}or recipient_id=eq.${userId}`
  })
  .subscribe();
```

This means:
- Any INSERT into the messages table triggers the subscription
- The filter ensures only relevant messages are processed
- No duplicate messages (checked via ID)

## API Endpoints

### POST /api/messages/send

Send a message from one user to another.

**Request:**
```json
{
  "senderId": "uuid-of-sender",
  "senderRole": "student|advisor|critic",
  "recipientId": "uuid-of-recipient",
  "documentId": "uuid-of-document|null",
  "message": "Message content",
  "subject": "Optional subject"
}
```

**Validations:**
- senderId and recipientId must be valid UUIDs
- message cannot be empty
- Email notifications sent if recipient has email

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Student User",
      "sender_role": "student",
      "recipient_id": "uuid",
      "message": "Message content",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### GET /api/messages/get

Fetch messages for a user.

**Query Parameters:**
- `userId`: (required) UUID of the user
- `documentId`: (optional) Filter to a specific document
- `recipientId`: (optional) Filter to conversation with specific user

**Examples:**
```bash
# All messages for a user
GET /api/messages/get?userId=uuid-of-user

# Messages for a specific document
GET /api/messages/get?userId=uuid-of-user&documentId=uuid-of-doc

# Messages with a specific person
GET /api/messages/get?userId=uuid-of-user&recipientId=uuid-of-other-person
```

## Email Notifications

When a message is sent, an email notification is sent to the recipient (if configured).

The endpoint determines the email notification type based on roles:
- **Advisor → Student**: Uses "send-advisor-email"
- **Student → Advisor**: Uses "send-email"
- **Critic → Student**: Uses "send-advisor-email"

Email notifications are sent asynchronously and don't block the message response.

## Troubleshooting

### Messages not appearing in real-time?

1. Check browser console for subscription errors
2. Verify Supabase Realtime is enabled in your project
3. Ensure both users have valid UUIDs (not "demo-student-1" strings)
4. Check that `recipient_id` matches in the conversation panel

### "Invalid UUID" Error

This means the `recipientId` passed to the API is not a valid UUID format. Check that:
- The UUID is from `session.user.id` (not a hardcoded string)
- The UUID format is correct: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Messages sent but not received by other user?

1. Verify both users are logged in with different accounts
2. Check that the subscription filter matches: `sender_id=eq.{recipientId} or recipient_id=eq.{userId}`
3. Ensure the recipient_id in the message matches the other user's UUID

### Email notifications not sent?

1. Check that `/api/notifications/send-email` is implemented
2. Verify recipient has an email address in the profiles table
3. Check server logs for email API errors

## Files Modified

- `src/components/conversation-panel.tsx` - Added real-time subscriptions and modals
- `src/app/api/messages/send/route.ts` - Updated to use real UUIDs, removed demo checks
- `src/app/api/messages/get/route.ts` - Added recipientId filtering
- `src/lib/setup-sample-data.ts` - New file to create sample users
- `scripts/setup-messaging-demo.ts` - Setup script

## Next Steps

1. Run the setup script to create sample accounts
2. Test messaging between different roles
3. Monitor browser console for any errors
4. Implement email notification endpoints if not already done
5. Add message persistence features (read status, threading, etc.)

## Performance Considerations

- Realtime subscriptions are lightweight but each active conversation uses one channel
- Database queries use indexed columns (sender_id, recipient_id)
- Messages are ordered by created_at for consistent display

## Security

- RLS policies prevent users from seeing other people's messages
- Only sender and recipient can view/send messages
- senderId must match authenticated user
- UUID validation prevents SQL injection

## Support

For questions or issues, check:
1. Browser DevTools → Console tab for client errors
2. Server logs for API errors
3. Supabase Dashboard → Realtime Status
4. Database logs for query errors
