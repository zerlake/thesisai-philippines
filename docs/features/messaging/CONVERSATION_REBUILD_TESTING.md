# Conversation Feature Rebuild - Testing Guide

## Status: ✓ Build Successful
- ConversationPanel component created
- Integrated into Editor component
- Build passes without errors
- Ready for functional testing

## Test Environment Setup

### Prerequisites
1. Development server running: `pnpm dev`
2. Real test accounts in Supabase Auth:
   - Test Advisor: `advisor.test@yourdomain.com` (role: advisor)
   - Test Student: `student.test@yourdomain.com` (role: student)
3. Advisor-Student relationships set up in database
4. Document submitted by student

### Database Verification

Run these queries before testing:

```sql
-- Check advisor_student_messages table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'advisor_student_messages';

-- Check sample relationships
SELECT * FROM advisor_student_relationships LIMIT 5;

-- Verify test data (should be empty at start)
SELECT COUNT(*) FROM advisor_student_messages;
```

## Test Cases

### TEST 1: Component Renders for Advisors
**Purpose:** Verify ConversationPanel only shows for advisors/critics

**Steps:**
1. Log in as advisor (advisor.test@yourdomain.com)
2. Navigate to /advisor/students/[studentId]
3. Click on a document
4. **Expected:** Conversation panel appears on right side
5. **Expected:** Shows "Conversation" header
6. **Expected:** Shows "No messages yet" initially

**Verification:**
- [ ] Panel is visible
- [ ] Header text is correct
- [ ] Empty state message shows

---

### TEST 2: Component NOT Rendered for Students
**Purpose:** Verify students don't see conversation panel in editor

**Steps:**
1. Log in as student (student.test@yourdomain.com)
2. Navigate to /drafts/[documentId]
3. Open a document
4. **Expected:** NO conversation panel on right side
5. **Expected:** Only editor content visible

**Verification:**
- [ ] Panel is NOT visible
- [ ] No error in console
- [ ] Editor functions normally

---

### TEST 3: Real Message Sending (Advisor)
**Purpose:** Verify messages are saved to database

**Steps:**
1. Log in as advisor
2. Open document in editor
3. Type message: "This is a test message from advisor"
4. Click "Send Message"
5. **Expected:** Message appears in conversation immediately
6. **Expected:** Toast notification: "Message sent!"
7. **Expected:** Message saved to database

**Verification:**
```sql
-- Check message in database
SELECT * FROM advisor_student_messages 
WHERE sender_role = 'advisor' 
ORDER BY created_at DESC LIMIT 1;
```
- [ ] Message appears in conversation
- [ ] Toast shows success
- [ ] Message in database with correct sender_id
- [ ] Message contains exact text sent

---

### TEST 4: Real Message Loading
**Purpose:** Verify messages load from database

**Setup:** Advisor sent message in TEST 3

**Steps:**
1. Log in as STUDENT
2. Navigate to /drafts/[documentId]
3. Scroll down to conversation
4. **Expected:** Advisor's message appears in conversation
5. **Expected:** Shows sender name
6. **Expected:** Shows timestamp

**Verification:**
```sql
-- Verify student can read the message
SELECT * FROM advisor_student_messages 
WHERE document_id = '[documentId]';
```
- [ ] Message from advisor visible
- [ ] Sender name shows "Test Advisor"
- [ ] Message content correct
- [ ] Timestamp shows

---

### TEST 5: Student Reply to Advisor
**Purpose:** Verify student can send messages back

**Steps:**
1. Still logged in as STUDENT
2. In conversation panel, type: "Thank you for the feedback!"
3. Click "Send Message"
4. **Expected:** Message appears in conversation
5. **Expected:** Appears on right side (student's side)
6. **Expected:** Toast shows success

**Verification:**
```sql
-- Check student's message
SELECT * FROM advisor_student_messages 
WHERE sender_role = 'student' 
ORDER BY created_at DESC LIMIT 1;
```
- [ ] Student message visible
- [ ] Message saved to database
- [ ] sender_role = 'student'
- [ ] sender_name shows student name

---

### TEST 6: Full Conversation Thread
**Purpose:** Verify complete conversation visible

**Setup:** Advisor and student have exchanged messages

**Steps:**
1. Log in as ADVISOR
2. Open same document
3. **Expected:** Full conversation thread visible
4. **Expected:** Advisor messages on right (blue)
5. **Expected:** Student messages on left (gray)
6. **Expected:** Messages in chronological order

**Verification:**
```sql
-- Count messages in conversation
SELECT COUNT(*) FROM advisor_student_messages 
WHERE document_id = '[documentId]';
-- Should be 2 or more
```
- [ ] Both messages visible
- [ ] Correct styling (blue/gray)
- [ ] Chronological order
- [ ] Sender names correct
- [ ] Timestamps correct

---

### TEST 7: Message API Integration
**Purpose:** Verify API endpoints work correctly

**Steps:**
1. Use Postman/curl to test API directly

**POST /api/messages/send:**
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "actual-uuid",
    "senderId": "actual-user-uuid",
    "senderRole": "advisor",
    "recipientId": "student-uuid",
    "message": "Test message via API"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Name",
      "sender_role": "advisor",
      "message": "Test message via API",
      "created_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

**GET /api/messages/get:**
```bash
curl "http://localhost:3000/api/messages/get?documentId=actual-uuid&userId=actual-user-uuid"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Name",
      "sender_role": "advisor",
      "message": "Message text",
      "created_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

**Verification:**
- [ ] POST returns 200 status
- [ ] GET returns 200 status
- [ ] Data structure matches expected
- [ ] No empty data arrays

---

### TEST 8: Error Handling
**Purpose:** Verify errors handled gracefully

**Test Case A: Not Authenticated**
1. Log out completely
2. Try to access /drafts/[documentId]
3. **Expected:** Redirected to login
4. **Expected:** No conversation panel

**Test Case B: Empty Message**
1. Log in as advisor
2. Leave message empty
3. Click "Send Message"
4. **Expected:** Button disabled
5. **Expected:** No API call made
6. **Expected:** No error message

**Test Case C: Network Error**
1. Open DevTools → Network
2. Set to "Offline" mode
3. Log in as advisor
4. Type message and send
5. **Expected:** Toast error: "Failed to send message"
6. **Expected:** Message not added to UI

**Verification:**
- [ ] All error cases handled
- [ ] No console errors
- [ ] User sees clear error messages

---

### TEST 9: Loading States
**Purpose:** Verify loading indicators work

**Steps:**
1. Log in as advisor
2. Open document (watch for loading spinner)
3. **Expected:** Loader shows while fetching messages
4. **Expected:** Loader disappears after load

**Send Message Loading:**
1. Type message
2. Click send
3. **Expected:** Button shows "Sending..." with spinner
4. **Expected:** Button disabled during send
5. **Expected:** State resets after success/error

**Verification:**
- [ ] Loading spinner shows
- [ ] Button state changes correctly
- [ ] No stuck loading states

---

### TEST 10: Multi-Role Conversation
**Purpose:** Verify advisor and critic can both message

**Setup:** Document has both advisor and critic assigned

**Steps:**
1. Log in as ADVISOR
2. Send message: "Advisor feedback"
3. Log in as CRITIC
4. Open same document
5. Send message: "Critical review"
6. Log in as STUDENT
7. Open same document
8. **Expected:** Both messages visible
9. **Expected:** Both sender roles shown correctly

**Verification:**
```sql
SELECT DISTINCT sender_role FROM advisor_student_messages 
WHERE document_id = '[documentId]';
-- Should show: advisor, critic, student
```
- [ ] Advisor message visible
- [ ] Critic message visible
- [ ] Student message visible
- [ ] Roles labeled correctly

---

## Performance Tests

### TEST 11: Large Conversation Load
**Purpose:** Verify component handles many messages

**Setup:** Create 50+ messages in database

**Steps:**
1. Add messages to database:
```sql
INSERT INTO advisor_student_messages 
(document_id, sender_id, sender_name, sender_role, message, created_at)
VALUES
-- Repeat 50+ times with different messages
```

2. Log in as advisor
3. Open document
4. **Expected:** All messages load
5. **Expected:** No UI lag
6. **Expected:** Scrolling smooth

**Verification:**
- [ ] All 50+ messages visible
- [ ] Scrolling performant
- [ ] No memory issues

---

## Email Notification Tests

### TEST 12: Email on Message Send
**Purpose:** Verify email sent to recipient

**Prerequisites:**
- Resend API configured and working
- Test advisor has valid email

**Steps:**
1. Log in as STUDENT
2. Send message to advisor
3. Check advisor's email inbox
4. **Expected:** Email received within 60 seconds
5. **Expected:** Email from noreply@thesisai-philippines.com
6. **Expected:** Subject line mentions document
7. **Expected:** Message preview in email

**Verification:**
- [ ] Email arrives in inbox
- [ ] Correct sender address
- [ ] Correct subject
- [ ] Message content correct

---

## Database Validation

After all tests, verify database integrity:

```sql
-- Check message count
SELECT COUNT(*) as total_messages FROM advisor_student_messages;

-- Check sender role distribution
SELECT sender_role, COUNT(*) FROM advisor_student_messages 
GROUP BY sender_role;

-- Check no orphaned messages
SELECT * FROM advisor_student_messages 
WHERE document_id NOT IN (SELECT id FROM documents)
OR sender_id NOT IN (SELECT id FROM auth.users);
-- Should return 0 rows

-- Check timestamps
SELECT 
  id,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago
FROM advisor_student_messages
ORDER BY created_at DESC LIMIT 5;
-- All should have reasonable timestamps
```

**Verification:**
- [ ] No orphaned messages
- [ ] Timestamps reasonable
- [ ] Role distribution makes sense

---

## Browser Console Checks

Open DevTools Console while testing and verify:

**Should see:**
- [ ] No TypeScript errors
- [ ] No undefined reference errors
- [ ] No network errors (unless intentional)
- [ ] Clean logs from ConversationPanel

**Should NOT see:**
- [ ] "Cannot read property 'sender_id' of undefined"
- [ ] "Failed to fetch messages"
- [ ] "useEffect dependency changed"
- [ ] Unhandled promise rejections

---

## Summary Checklist

- [ ] Build successful (no TypeScript errors)
- [ ] ConversationPanel renders for advisors
- [ ] ConversationPanel hidden for students
- [ ] Messages send successfully
- [ ] Messages load from database
- [ ] Full conversation thread visible
- [ ] Error handling works
- [ ] Loading states show
- [ ] Multi-role conversations work
- [ ] Emails sent on message
- [ ] Database clean and valid
- [ ] Console clean (no errors)
- [ ] Performance acceptable

---

## Debugging Tips

If tests fail:

1. **Check browser console** for errors
2. **Check server logs** (pnpm dev terminal)
3. **Verify database** with SQL queries above
4. **Check network tab** in DevTools for API responses
5. **Verify auth state** - ensure proper user logged in
6. **Check Supabase RLS policies** - may block queries

---

## Next Steps After Testing

1. ✓ All tests pass → Deploy to staging
2. ✓ Staging verified → Deploy to production
3. Monitor logs for errors
4. Get user feedback
5. Iterate on UX improvements

