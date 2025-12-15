# Real-Time Messaging - Test Checklist

**Status**: ✅ Ready for Testing  
**Build**: ✅ Passing  
**Date**: December 8, 2025

## Pre-Test Requirements

- [ ] Application built successfully (`pnpm build`)
- [ ] Dev server running (`pnpm dev`)
- [ ] Two browser windows/tabs available
- [ ] Supabase connection verified
- [ ] Sample accounts created or will be auto-created on login

## Phase 1: Account Creation & Setup

### Create Student Account
- [ ] Navigate to http://localhost:3000/login
- [ ] Click "Demo Login" or Login as:
  - Email: `student@demo.thesisai.local`
  - Password: `demo123456`
- [ ] Login successful
- [ ] Dashboard loads without errors
- [ ] Profile shows "Student" role
- [ ] Browser console has no errors

### Create Advisor Account
- [ ] Open new browser window/incognito tab
- [ ] Navigate to http://localhost:3000/login
- [ ] Login as:
  - Email: `advisor@demo.thesisai.local`
  - Password: `demo123456`
- [ ] Login successful
- [ ] Dashboard loads without errors
- [ ] Profile shows "Advisor" role
- [ ] Browser console has no errors

### Verify Sample Data
- [ ] Student has sample documents visible
- [ ] Both users have profile data
- [ ] No auth errors in console

## Phase 2: Basic Messaging

### Window 1 (Student) - Send First Message
- [ ] Locate "Conversation" panel (usually right sidebar)
- [ ] Type message: `Hello advisor, can you review my work?`
- [ ] Click "Send Message" button
- [ ] ✅ Success modal appears
- [ ] Modal shows green checkmark
- [ ] Modal shows: "Message sent successfully!"
- [ ] Input field clears
- [ ] Message appears in conversation list
- [ ] Message styled as "sent by you" (blue, right-aligned)
- [ ] Message has timestamp

### Window 2 (Advisor) - Receive Message
- [ ] Message appears instantly (within 1 second)
- [ ] No page refresh needed
- [ ] Message shows: `Hello advisor, can you review my work?`
- [ ] Message styled as "received from student" (gray, left-aligned)
- [ ] Sender name shows "Student User" or equivalent
- [ ] Message has correct timestamp

### Window 2 (Advisor) - Send Reply
- [ ] Type message: `Sure! I'll review it this week.`
- [ ] Click "Send Message" button
- [ ] ✅ Success modal appears
- [ ] Input field clears
- [ ] Message appears in advisor's list

### Window 1 (Student) - Receive Reply
- [ ] Message appears instantly (within 1 second)
- [ ] Message shows: `Sure! I'll review it this week.`
- [ ] Message styled as "received from advisor" (gray, left-aligned)
- [ ] No page refresh needed
- [ ] Conversation flow makes sense

## Phase 3: Modal Testing

### Success Modal Behavior
- [ ] Green checkmark icon visible
- [ ] "Success" header shown
- [ ] Message text correct
- [ ] Close button (X) visible
- [ ] Modal appears for 3 seconds then auto-dismisses
- [ ] Can close manually with X button
- [ ] No errors in console

### Error Modal Behavior
- [ ] Send blank message (edge case)
  - [ ] Button disabled, modal shouldn't appear
- [ ] Try sending with invalid recipient (if possible)
  - [ ] Red alert icon visible
  - [ ] "Error" header shown
  - [ ] Error message explains issue
  - [ ] Close button (X) visible
  - [ ] Modal does NOT auto-dismiss
  - [ ] Must be closed manually

## Phase 4: Real-Time Delivery

### Latency Testing
- [ ] Measure time from "Send" click to message appearance
- [ ] Expected: 100-500ms
- [ ] Record latency: _____ ms
- [ ] Not slower than 1 second
- [ ] Consistent across multiple messages

### Multiple Messages
- [ ] Student sends 3 quick messages (no pause)
- [ ] [ ] Message 1: "First"
- [ ] [ ] Message 2: "Second"
- [ ] [ ] Message 3: "Third"
- [ ] All appear instantly on advisor side
- [ ] No messages lost
- [ ] Correct order maintained
- [ ] All have success modals

### Concurrent Messaging
- [ ] Student sends: "What about chapter 2?"
- [ ] Advisor sends: "How about chapter 1?" (simultaneously)
- [ ] Both messages delivered correctly
- [ ] No message overwrites/corruption
- [ ] Both users see both messages

## Phase 5: Edge Cases & Error Handling

### Empty Message
- [ ] Try sending empty message (just spaces)
- [ ] Send button should be disabled
- [ ] No API call made
- [ ] No error modal shown

### Long Messages
- [ ] Send message with 500+ characters
- [ ] Message sent successfully
- [ ] No truncation in UI
- [ ] Timestamp correct
- [ ] No database errors

### Special Characters
- [ ] Send: `Hello! How's the thesis? It's going well. 😊`
- [ ] Message appears correctly
- [ ] Special characters preserved
- [ ] No encoding issues

### Session Expiry (Optional)
- [ ] Keep app open for extended period
- [ ] Try sending message
- [ ] Either:
  - [ ] Message sends normally
  - [ ] Get helpful error message
  - [ ] Auto-redirect to login
- [ ] No cryptic errors

## Phase 6: Multi-Role Testing

### Create Critic Account
- [ ] Login as: `critic@demo.thesisai.local` / `demo123456`
- [ ] Profile shows "Critic" role
- [ ] Can access conversation panel

### Critic → Student Messaging
- [ ] Critic sends: `I have feedback on your thesis`
- [ ] Student receives instantly
- [ ] Styled as from "Critic User"
- [ ] Success modal appears
- [ ] Student replies to critic
- [ ] Critic receives reply instantly

### Complex Conversation
- [ ] Three-way group conversation (in comment-like format):
  - Student sends message
  - Advisor responds
  - Critic adds feedback
  - Student acknowledges all
- [ ] All messages deliver correctly
- [ ] Sender names clear for each message
- [ ] No cross-user message leakage

## Phase 7: Browser/Device Testing

### Multiple Tabs (Same Browser)
- [ ] Login as student in Tab 1
- [ ] Login as advisor in Tab 2
- [ ] Send message in Tab 1
- [ ] Appears instantly in Tab 2
- [ ] Both tabs sync correctly

### Incognito/Private Window
- [ ] Send message from incognito window
- [ ] Receive in regular window
- [ ] Works same as normal windows

### Different Devices/Machines (if available)
- [ ] Same user logged in from 2 devices
- [ ] Send from Device 1
- [ ] Appears on Device 2
- [ ] No message duplication

## Phase 8: Performance & Load Testing

### Single Conversation
- [ ] 5 back-and-forth messages
- [ ] No slowdown observed
- [ ] UI remains responsive
- [ ] No memory leaks in console

### Multiple Conversations (if applicable)
- [ ] 3 different recipient conversations
- [ ] Switch between them
- [ ] Each maintains message history
- [ ] No cross-conversation message leakage

### Long Conversation History
- [ ] 20+ messages in conversation
- [ ] Scroll works smoothly
- [ ] No lag when scrolling
- [ ] Newest messages visible
- [ ] Can scroll to old messages

## Phase 9: API Validation

### Valid UUIDs
- [ ] Both senderId and recipientId are valid UUIDs
- [ ] Message inserts successfully
- [ ] No "invalid UUID" errors
- [ ] ✓ Endpoint accepts valid UUIDs

### Invalid UUID Handling
- [ ] If somehow recipientId is wrong format:
  - [ ] API returns 400 error
  - [ ] Error message: "Invalid recipientId - must be a valid UUID from auth system"
  - [ ] Message not inserted
  - [ ] ✓ Validation prevents bad data

### Database Constraints
- [ ] All required fields populated
- [ ] sender_role correct (student/advisor/critic)
- [ ] Timestamps generated correctly
- [ ] UUIDs properly formatted in DB

## Phase 10: Email Notifications (If Configured)

### Check Email Sending
- [ ] Check server logs for email API calls
- [ ] Email sent asynchronously (doesn't slow down message)
- [ ] Email endpoint called for each message
- [ ] Proper template selected based on role

### Email Content (Manual Check)
- [ ] Email received with message notification
- [ ] Sender name correct
- [ ] Message preview in email
- [ ] Action button/link working
- [ ] No email errors in logs

## Phase 11: Documentation & Code Quality

### Code Review
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] ESLint passes (no unused imports)
- [ ] No hardcoded demo account strings
- [ ] All UUIDs from auth system

### Documentation
- [ ] README created: ✓ MESSAGING_QUICK_START.md
- [ ] Detailed guide: ✓ MESSAGING_REAL_TIME_SETUP.md
- [ ] Visual guide: ✓ MESSAGING_VISUAL_GUIDE.md
- [ ] Implementation doc: ✓ MESSAGING_IMPLEMENTATION_COMPLETE.md

## Test Results Summary

### Critical Path (Must Pass)
- [ ] Accounts create successfully
- [ ] Student sends message
- [ ] Advisor receives instantly
- [ ] Advisor replies
- [ ] Student receives instantly
- [ ] Success modals appear
- [ ] No errors in console

### Important Features (Should Pass)
- [ ] All roles can message each other
- [ ] Messages persist in database
- [ ] Modal dismissal works
- [ ] Error handling works
- [ ] Multiple messages work correctly

### Nice to Have (Can Pass Later)
- [ ] Email notifications configured
- [ ] Multi-device sync
- [ ] Performance optimization
- [ ] Read receipts
- [ ] Typing indicators

## Known Issues (If Any)

### Issue 1: [Description]
- [ ] Severity: Low/Medium/High
- [ ] Workaround: [If applicable]
- [ ] Fix Status: Pending/In Progress/Done
- [ ] Notes: [Any notes]

### Issue 2: [Description]
- [ ] Severity: Low/Medium/High
- [ ] Workaround: [If applicable]
- [ ] Fix Status: Pending/In Progress/Done
- [ ] Notes: [Any notes]

## Sign-Off

**Tester Name**: _______________  
**Date**: _______________  
**Overall Status**: 
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️  PASS with issues - Ready with known workarounds
- [ ] ❌ FAIL - Needs fixes before release

**Notes**:
```
[Test notes and observations]
```

**Build Details**:
- Build Time: _______________
- Build Status: ✓ Successful
- TypeScript Errors: 0
- ESLint Warnings: 0

## Rollback Plan (If Issues Found)

If critical issues found:
1. [ ] Revert conversation-panel.tsx to previous version
2. [ ] Revert message API routes to previous version
3. [ ] Redeploy
4. [ ] Notify team of rollback

---

## Post-Testing

### For Production Deployment
- [ ] All critical tests pass
- [ ] No console errors
- [ ] Email notifications working
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Error tracking (Sentry) enabled

### For Next Sprint
- [ ] Document any remaining issues
- [ ] Create tickets for nice-to-have features
- [ ] Update team on status
- [ ] Plan next iteration

---

**Test Checklist Version**: 1.0  
**Created**: December 8, 2025  
**Last Updated**: December 8, 2025
