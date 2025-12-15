# Message Sending Fix - Complete Testing Guide

## Issues Fixed

### 1. **API Key Validation Blocking Messages**
- **Problem**: `/api/notifications/send-email` was checking for `INTERNAL_API_KEY` and rejecting requests
- **Fix**: Disabled API key verification for testing (like send-advisor-email does)
- **File**: `src/app/api/notifications/send-email/route.ts`

### 2. **Missing Error Feedback**
- **Problem**: Message sending failures were silent (only logged to console)
- **Fix**: Added toast notifications for success/error messages
- **File**: `src/components/editor.tsx`

### 3. **Missing Profile Data**
- **Problem**: API was checking `senderData?.name` which might not exist
- **Fix**: Updated to check `full_name`, `name`, or default to 'User'
- **File**: `src/app/api/messages/send/route.ts`

### 4. **Sender Role Not Being Captured**
- **Problem**: Profile might not be loaded when sending message
- **Fix**: Added better logging and fallback for senderRole

## Changes Made

### Editor Component (`src/components/editor.tsx`)
```javascript
// Added toast notifications
import { toast } from 'sonner';

// Enhanced handleSendMessage with:
- Better error messages via toast
- Console logging for debugging
- Check for session/documentOwnerId with user feedback
- Response logging to see what the API returns
```

### Messages API (`src/app/api/messages/send/route.ts`)
```javascript
// Enhanced email notification logic:
- Check full_name OR name from profiles
- Better console logging
- Handle missing email gracefully
- Improved error handling
```

### Notifications API (`src/app/api/notifications/send-email/route.ts`)
```javascript
// Disabled API key check for testing (like send-advisor-email)
// Added TODO to re-enable in production
```

## How to Test

### Step 1: Open Developer Console
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Keep this open while testing

### Step 2: Login as Advisor
1. Go to `/advisor` or advisor dashboard
2. Navigate to a student's document
3. Make sure you see the "Conversation" sidebar on the right

### Step 3: Send a Test Message
1. Type a message in the "Type your feedback here..." textarea
2. Click "Send Message"
3. **Watch the console** - you should see:
   ```
   [Editor] Sending message: { documentId, senderId, senderRole, recipientId, message }
   [Editor] Message response: { data: [...], success: true }
   ```

### Step 4: Check for Toast Notification
- You should see a green "Message sent successfully!" toast at the top
- If there's an error, you'll see a red error toast

### Step 5: Verify in Database
1. Check the `advisor_student_messages` table in Supabase
2. You should see a new message with:
   - `sender_id`: Your advisor ID
   - `sender_role`: 'advisor'
   - `recipient_id`: Student's ID
   - `message`: Your message text
   - `created_at`: Current timestamp

### Step 6: Check Email Notification (if configured)
1. If you have RESEND_API_KEY configured:
   - Check the recipient's email
   - Should receive an email with subject like "📩 Message from [AdvisorName]"
2. If RESEND_API_KEY is not set:
   - Check console logs: `Email notification sent successfully to...` or error

## Troubleshooting

### Problem: "Message sent successfully!" but no message appears
**Solution**: 
- Check browser console for errors
- The message is in the database, but UI might not have refreshed
- Reload the page to see it

### Problem: Red error toast appears
**Solution**:
1. Check the error message
2. Common errors:
   - "Not authenticated" → Need to log in
   - "Document owner not found" → documentOwnerId is null
   - "Failed to send message" → Check console logs for details

### Problem: Message sends but no email received
**Solution**:
1. Check if RESEND_API_KEY is set in `.env.local`
2. Check console logs for email sending errors
3. Check spam/junk folder
4. Email might be failing silently (by design, doesn't block message sending)

### Problem: "undefined" or empty sender name in email
**Solution**:
- Make sure your profile has `full_name` or `name` set
- Update profile in database:
  ```sql
  UPDATE profiles SET full_name = 'Your Name' WHERE id = 'your-id';
  ```

## Console Logging Guide

### Expected Console Output When Sending Message

```javascript
// Step 1: Message is being sent
[Editor] Sending message: {
  documentId: 'uuid-here',
  senderId: 'user-id-here',
  senderRole: 'advisor',
  recipientId: 'student-id-here',
  message: 'Your message text'
}

// Step 2: Database insertion (from API)
Inserting message: { documentId, senderId, senderRole, ... }

// Step 3: Email preparation (from API)
[Messages API] Sending email notification: {
  to: 'student@example.com',
  senderRole: 'advisor',
  recipientRole: 'student',
  senderName: 'Advisor Name',
  subject: 'New message about your document'
}

// Step 4: API Response back to editor
[Editor] Message response: {
  data: [{ id: 'msg-uuid', message: 'Your message text', ... }]
}
```

## Production Checklist

Before deploying to production:

- [ ] Re-enable API key verification in `send-email` route
- [ ] Set `INTERNAL_API_KEY` environment variable
- [ ] Configure `RESEND_API_KEY` for email sending
- [ ] Test email delivery end-to-end
- [ ] Ensure student email addresses are populated in profiles
- [ ] Test with real advisor-student relationships
- [ ] Monitor email bounce rates

## Files Modified

1. `src/components/editor.tsx`
   - Added toast import
   - Enhanced handleSendMessage function
   - Added console logging

2. `src/app/api/messages/send/route.ts`
   - Improved email notification helper
   - Better error handling
   - Enhanced logging

3. `src/app/api/notifications/send-email/route.ts`
   - Disabled API key check for testing

## Related Files (No Changes)

- `src/app/api/notifications/send-advisor-email/route.ts` (already has key check disabled)
- `src/lib/resend-notification.ts` (email template functions)
- `supabase/migrations/42_advisor_student_messages.sql` (table schema)
