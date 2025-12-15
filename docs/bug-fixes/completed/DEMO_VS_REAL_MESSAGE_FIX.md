# Demo vs Real Messages - Complete Solution

## Problem
When sending a message on demo documents, the code tried to save to the database with invalid UUIDs:
- `documentId`: "doc-1" (not a UUID)
- `recipientId`: "demo-student-1" (not a UUID)

The database rejected both because:
- `document_id` references `documents(id)` which must be UUID
- `recipient_id` references `auth.users(id)` which must be UUID

## Solution
Detect demo messages and handle them differently:
- **Demo messages**: Show locally only, don't save to database
- **Real messages**: Save to database with email notification as before

## Code Changes
**File**: `src/components/editor.tsx`

### Before (Lines 201-227)
```javascript
// Only handled document_id, still tried to save demo recipients to DB
const isUUID = /^[0-9a-f]{8}...$/i.test(documentId);
const realDocumentId = isUUID ? documentId : null;

// Tried to save to database with "demo-student-1" as recipientId
const response = await fetch('/api/messages/send', {
  body: JSON.stringify({
    documentId: realDocumentId,
    recipientId: documentOwnerId, // ← Still "demo-student-1"!
  }),
});
```

### After (Lines 201-235)
```javascript
// Check if this is a demo user or document
const isDocumentUUID = /^[0-9a-f]{8}...$/i.test(documentId);
const isRecipientUUID = /^[0-9a-f]{8}...$/i.test(documentOwnerId);
const isDemoMessage = !isDocumentUUID || !isRecipientUUID;

// For demo messages, just show locally without saving to database
if (isDemoMessage) {
  const demoMessage = {
    id: `demo-${Date.now()}`,
    message: newMessage,
    sender: { full_name: profile?.full_name || 'Me' },
    sender_id: session.user.id,
    created_at: new Date().toISOString(),
    is_read: false,
  };
  
  setMessages([...messages, demoMessage]);
  setNewMessage('');
  toast.success('Message sent successfully! (Demo mode)');
  return; // ← Don't try to save to database
}

// For real messages, save to database
const response = await fetch('/api/messages/send', {
  body: JSON.stringify({
    documentId,
    recipientId: documentOwnerId, // ← Valid UUID for real users
  }),
});
```

## How It Works

### Demo Message Flow
```
User clicks Send on demo document (doc-1)
    ↓
Editor detects documentOwnerId = "demo-student-1" (not UUID)
    ↓
isDemoMessage = true
    ↓
Create local message object
    ↓
Add to messages state (UI only)
    ↓
Show "Message sent! (Demo mode)" toast
    ↓
Return early - skip API call and database
    ↓
✓ Message appears in conversation (local only)
```

### Real Message Flow
```
User clicks Send on real document (UUID)
    ↓
Editor detects documentOwnerId = "user-uuid" (valid UUID)
    ↓
isDemoMessage = false
    ↓
Call /api/messages/send with all IDs as UUIDs
    ↓
API saves to database
    ↓
API sends email notification
    ↓
Return API response data
    ↓
Add message to UI from database
    ↓
Show "Message sent successfully!" toast
    ↓
✓ Message appears in conversation and is persisted
```

## Demo Message Characteristics

Demo messages:
- ✓ Display immediately in conversation sidebar
- ✓ Show sender name and timestamp
- ✓ Have temporary ID: `demo-{timestamp}`
- ✗ Not saved to database
- ✗ No email notification sent
- ✗ Lost if page refreshes

This is appropriate for:
- Demo/testing accounts
- Development environments
- Mock documents for exploration

## Real Message Characteristics

Real messages:
- ✓ Display immediately in conversation sidebar
- ✓ Saved to database
- ✓ Email notification sent to recipient
- ✓ Persisted across page refreshes
- ✓ Queryable and searchable

This is for:
- Production advisor-student communication
- Real research documents
- Formal feedback and discussion

## Testing

### Test 1: Demo Document Message
1. Login as demo advisor
2. View document "doc-1"
3. Send message: "This is a test message"
4. Expected:
   - ✓ Green toast: "Message sent successfully! (Demo mode)"
   - ✓ Message appears in conversation
   - ✓ No database error
   - ✓ Console shows: "[Editor] Demo message - showing locally only"

### Test 2: Real Document Message
1. Login as real advisor
2. View a real student document (UUID)
3. Send message: "This is feedback"
4. Expected:
   - ✓ Green toast: "Message sent successfully!"
   - ✓ Message appears in conversation
   - ✓ Message saved to database
   - ✓ Email notification sent (if RESEND_API_KEY configured)

## Console Output Indicators

### Demo Message
```
[Editor] Demo message - showing locally only
```

### Real Message
```
[Editor] Sending real message: {
  documentId: "uuid-...",
  senderId: "uuid-...",
  senderRole: "advisor",
  recipientId: "uuid-...",
  message: "Your message"
}
[Editor] Message response: { data: [...] }
```

## Database Impact

### Demo Messages
- ✗ Not added to `advisor_student_messages` table
- ✗ Not persisted across sessions
- ✓ No risk of UUID validation errors

### Real Messages
- ✓ Saved to `advisor_student_messages` table
- ✓ Persisted across sessions
- ✓ Queryable for analytics/history
- ✓ Linked to actual documents and users

## Edge Cases Handled

| Case | documentId | recipientId | Result |
|------|-----------|------------|--------|
| Demo doc, demo user | "doc-1" | "demo-student-1" | Demo message ✓ |
| Demo doc, real user | "doc-1" | UUID | Demo message ✓ |
| Real doc, demo user | UUID | "demo-student-1" | Demo message ✓ |
| Real doc, real user | UUID | UUID | Real message ✓ |

## Files Modified
- `src/components/editor.tsx` - Added demo/real message detection and handling

## No Changes Needed To
- `/api/messages/send` - Only receives real message UUIDs now
- Database schema - Already correct for both cases
- Email notification system - Unchanged

## Summary
This solution provides a seamless experience for both demo and production users:
- **Demo users** can test the conversation interface without database constraints
- **Real users** get full message persistence and email notifications
- **No UUID validation errors** because demo messages never touch the database
