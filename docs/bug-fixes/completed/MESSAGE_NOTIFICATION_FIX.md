# Message Notification Fix - Session Summary

## Problem
When advisors clicked "Send Message" in the editor (viewing student documents), the message was not being sent or connected to email notifications.

## Root Causes Identified
1. **No API Integration**: The editor component was directly inserting messages into the database via Supabase without calling the `/api/messages/send` endpoint
2. **Missing Email Notification Trigger**: Messages weren't triggering the email notification system
3. **Incorrect Email Endpoint**: The email notification logic wasn't selecting the right endpoint for advisor→student messages

## Solutions Implemented

### 1. Updated Editor Component (`src/components/editor.tsx`)
**Changed**: `handleSendMessage` function now uses the API endpoint instead of direct Supabase insert

**Before**:
```javascript
const { data, error } = await supabase
  .from('advisor_student_messages')
  .insert({...});
```

**After**:
```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId,
    senderId: session.user.id,
    senderRole: profile?.role || 'user',
    recipientId: documentOwnerId,
    message: newMessage,
    subject: 'New message about your document',
  }),
});
```

### 2. Enhanced Email Notification Logic (`src/app/api/messages/send/route.ts`)
**Improved**: `sendEmailNotification` function to properly route emails based on sender/recipient roles

**New Role-Based Email Routing**:
- **Advisor → Student**: Uses `/api/notifications/send-advisor-email` with actionType `general-message`
- **Student → Advisor**: Uses `/api/notifications/send-email` with actionType `request`
- **Critic → Student**: Uses `/api/notifications/send-advisor-email` with actionType `feedback`

**Benefits**:
- Each role combination triggers the appropriate email template
- Email content matches the context (advisor feedback vs. student request)
- Subject lines are customized based on sender role

### 3. Fixed Document Content Display (`src/components/editor.tsx`)
**Also Fixed**: Demo document display that showed only "Chapter I: Introduction..." with ellipsis

**Now Includes**:
- Chapter I: Introduction (with Background, Problem Statement, Research Objectives sections)
- Chapter II: Literature Review (with Theoretical Framework, Trends, Research Gaps sections)

## How It Now Works

```
User clicks "Send Message"
    ↓
Editor calls /api/messages/send with message data
    ↓
Message gets inserted into advisor_student_messages table
    ↓
API identifies sender/recipient roles
    ↓
Selects appropriate email notification endpoint
    ↓
Resend sends email with proper template & subject
    ↓
Recipient gets email notification
```

## Testing Instructions

1. Login as advisor (demo or real account)
2. Navigate to advisor dashboard → My Students
3. Click "View Details" on a student
4. Click "View" on a student document
5. In the right sidebar "Conversation" section:
   - Type a message
   - Click "Send Message"
6. Check the recipient's email for the notification

## Files Modified
- `src/components/editor.tsx` (2 changes: message sending + demo content)
- `src/app/api/messages/send/route.ts` (improved email routing logic)

## Email Templates Used
- For advisors sending to students: `sendAdvisorToStudentNotificationEmail`
- For students sending to advisors: `sendNotificationEmail`
- Both templates are in `src/lib/resend-notification.ts`

## Environment Requirements
- `RESEND_API_KEY`: Must be configured for email sending
- `INTERNAL_API_KEY`: Used for API security (x-api-key header)
- `NEXT_PUBLIC_APP_URL`: Base URL for email links (defaults to localhost:3000)

## Next Steps (Optional Improvements)
1. Add read receipts for messages
2. Add typing indicators in real-time
3. Add message reactions/emoji support
4. Implement message search functionality
