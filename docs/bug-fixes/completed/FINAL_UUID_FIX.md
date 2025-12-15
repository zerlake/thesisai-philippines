# UUID Validation Error - Final Fix

## Error Message
```
Error: invalid input syntax for type uuid: "doc-1"
```

## Root Cause
When sending a message on demo documents (with non-UUID IDs like "doc-1"), the code was passing "doc-1" as the `document_id` to the database. The `document_id` field expects either a valid UUID or NULL, but not arbitrary strings.

## Solution
For demo documents, convert the document_id to `null` before sending to the API, since the `document_id` column is nullable (migration 44 makes it nullable).

## Code Fix
**File**: `src/components/editor.tsx` (lines 200-223)

```javascript
// BEFORE (sends "doc-1" as document_id)
const response = await fetch('/api/messages/send', {
  body: JSON.stringify({
    documentId, // "doc-1" ← Invalid UUID!
    senderId: session.user.id,
    // ...
  }),
});

// AFTER (converts non-UUID to null)
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId);
const realDocumentId = isUUID ? documentId : null;

const response = await fetch('/api/messages/send', {
  body: JSON.stringify({
    documentId: realDocumentId, // null for "doc-1" ✓ Valid
    senderId: session.user.id,
    // ...
  }),
});
```

## How It Works

### Demo Documents (doc-1, doc-2, etc.)
1. User sends message on demo document
2. documentId = "doc-1" (not a UUID)
3. isUUID test fails
4. realDocumentId = null
5. Message sent with document_id = NULL
6. Database accepts NULL (column is nullable)
7. ✓ Message saves successfully

### Real Documents (UUID format)
1. User sends message on real document
2. documentId = "uuid-1234-..." (valid UUID)
3. isUUID test passes
4. realDocumentId = "uuid-1234-..." (unchanged)
5. Message sent with document_id = UUID
6. Database accepts UUID (normal case)
7. ✓ Message saves successfully

## Database Schema Support
Migration 44 makes document_id nullable:
```sql
ALTER TABLE advisor_student_messages
ALTER COLUMN document_id DROP NOT NULL;
```

This allows:
- NULL: Messages not tied to a specific document (demo/general messages)
- UUID: Messages tied to specific documents (production)

## What Now Works
✓ Demo document messages send without UUID error
✓ Real document messages send normally
✓ Both save to database correctly
✓ Email notifications trigger for both
✓ Messages appear in conversation for both

## Testing

### Demo Document Test
1. Login as advisor
2. View document "doc-1"
3. Send message in Conversation
4. ✓ No UUID error
5. ✓ Message appears
6. ✓ Message saved to database

### Real Document Test
1. Login as advisor
2. View a real student document (UUID)
3. Send message in Conversation
4. ✓ Works as before
5. ✓ Message appears
6. ✓ Message saved with document_id

## Files Modified
- `src/components/editor.tsx` - Add UUID validation before sending

## Related Files (No Changes Needed)
- `supabase/migrations/42_advisor_student_messages.sql` - Table schema
- `supabase/migrations/44_make_document_id_nullable.sql` - Already makes it nullable
- `src/app/api/messages/send/route.ts` - Already handles null document_id

## Complete Message Flow Now Working
```
User clicks "Send Message"
    ↓
Editor checks if documentId is UUID
    ↓
If UUID: use it | If not: use null
    ↓
Send to /api/messages/send
    ↓
API inserts message with documentId (null or UUID)
    ↓
API sends email notification
    ↓
Message appears in conversation
    ↓
✓ Success!
```
