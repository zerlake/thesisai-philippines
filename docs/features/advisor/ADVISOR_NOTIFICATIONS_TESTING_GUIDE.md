# Advisor Email Notifications - Testing & Troubleshooting Guide

## ⚠️ IMPORTANT: Clear Cache First

If you're seeing the old "Message sent successfully! (Demo mode)" message, the changes haven't been picked up. Follow these steps:

### Step 1: Kill Dev Server
```bash
# Windows: Find and kill the Node.js process
taskkill /F /IM node.exe

# Or press Ctrl+C if it's running in your terminal
```

### Step 2: Clear All Caches
```bash
# Clear Next.js build cache
rm -rf .next
# or on Windows (PowerShell):
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue

# Clear npm/pnpm cache (optional but recommended)
pnpm store prune
```

### Step 3: Delete browser cache (Chrome/Firefox)
- **Chrome**: 
  - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
  - Select "All time"
  - Click "Clear data"
  
- **Firefox**:
  - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
  - Click "Clear Now"

- **Safari**:
  - Go to Develop menu → Empty Web Caches

### Step 4: Restart Dev Server
```bash
cd c:/Users/Projects/thesis-ai-fresh
pnpm dev
```

### Step 5: Hard Refresh Browser
- **Windows/Linux**: `Ctrl+Shift+R` or `Ctrl+F5`
- **Mac**: `Cmd+Shift+R`

---

## What Changed

### Old Component (Removed)
- **File**: `src/components/advisor-messages-panel.tsx`
- **Issue**: Uses mock data, shows "Message sent successfully! (Demo mode)"
- **Location**: Was in the advisor dashboard as `<AdvisorMessagesPanel />`

### New Component (Active)
- **File**: `src/components/advisor-email-notifications.tsx`
- **Features**: Real submissions, conversation history, feedback interface
- **Location**: Now in the advisor dashboard as `<AdvisorEmailNotifications />`

---

## How to Test

### Prerequisites
1. Login as an **advisor** account
2. Have a **student** assigned to you
3. Student should have documents in their draft

### Test Flow

**Step 1: Navigate to Advisor Dashboard**
```
URL: http://localhost:3001/dashboard (or /advisor)
Expected: See "Email Notifications" section
```

**Step 2: Have Student Submit Document**
- Login as student (in separate browser/incognito)
- Go to /drafts
- Open a document
- Click **"Submit for Review"** button (top right)
- Should see "Document submitted for review!" toast

**Step 3: Check Advisor Dashboard**
- Refresh advisor dashboard (hard refresh: Ctrl+Shift+R)
- Should see new submission in "Email Notifications" section
- Should show:
  - Student name
  - Document title
  - "New Submission" badge
  - Time submitted (e.g., "5 minutes ago")

**Step 4: Click Submission to View Details**
- Click the submission in the list
- Right panel should show:
  - Student name & email
  - Document title with "View Full Document" button
  - Submission time
  - **Conversation** section (empty if no messages yet)
  - **Send Feedback** text area

**Step 5: Send Feedback**
- Type feedback message in the text area
- Click "Send Feedback"
- Message should appear in the Conversation section
- Document status should change to "needs_revision"

**Step 6: Verify Student Receives Email**
- Check student's email inbox
- Should receive notification about advisor feedback
- Email should contain feedback message and link to view document

---

## Troubleshooting

### Issue: Still Seeing "Demo mode" Message

**Cause**: Browser/build cache not cleared

**Fix**:
1. Close dev server (Ctrl+C)
2. Run: `rm -rf .next` (or use PowerShell command above)
3. Run: `pnpm dev`
4. Do a hard browser refresh (Ctrl+Shift+R)
5. Clear browser cache manually

### Issue: "No pending submissions" But Student Submitted

**Cause**: 
- Students and advisors not properly linked in database
- Review status not set to "submitted"

**Check**:
```sql
-- Check advisor-student relationships
SELECT * FROM advisor_student_relationships WHERE advisor_id = 'YOUR_ADVISOR_ID';

-- Check document status
SELECT id, title, review_status, user_id FROM documents WHERE user_id = 'STUDENT_ID';
```

### Issue: Error Loading Notifications (Red Banner)

**Check Console**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed API requests

**Common Errors**:
- `RLS Policy Error`: Check Row Level Security settings in Supabase
- `Table doesn't exist`: Migration not applied (`supabase migration up`)
- `Unauthorized`: Check auth token

### Issue: Messages Not Showing in Conversation

**Cause**: 
- Messages table empty
- Wrong document_id being queried

**Fix**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see logs like: `[AdvisorEmailNotifications] Component mounted`
4. Submit feedback and check if message appears immediately
5. If not, check Supabase dashboard to see if message was inserted

---

## File Changes Summary

### Modified Files
1. **src/components/advisor-dashboard.tsx**
   - Removed: `import { AdvisorMessagesPanel }`
   - Added: `import { AdvisorEmailNotifications }`
   - Removed: Old Messages Card
   - Added: `<AdvisorEmailNotifications />`

### New Files
1. **src/components/advisor-email-notifications.tsx** (500+ lines)
   - Complete email notifications system
   - Real-time submission tracking
   - Message conversation UI
   - Feedback interface

### Unchanged Files
- All API routes working (no changes needed)
- Database schema working (uses existing tables)
- Email sending working (`/api/documents/submit` already sends notifications)

---

## Expected Behavior After Fix

### Advisor Dashboard
```
Email Notifications
You have 2 new student submission(s)

[Left Panel - Submissions List]    [Right Panel - Details & Conversation]
┌─────────────────────────────┐    ┌──────────────────────────────────┐
│ John Doe                    │    │ Student: John Doe                │
│ Chapter 1 Introduction      │    │ Email: john@example.com          │
│ New Submission · 5 min ago  │    │                                  │
├─────────────────────────────┤    │ Document: Chapter 1 Intro        │
│ Maria Santos                │    │ Submitted: Dec 8, 2025 10:30 AM  │
│ Chapter 2 Literature Review │    │                                  │
│ New Submission · 2 hours ago│    │ ┌─ Conversation ───────────────┐ │
│                             │    │ │ John: Hi, here's my draft    │ │
│                             │    │ │ [timestamp]                   │ │
│                             │    │ │                               │ │
│                             │    │ │ You: Looks good, needs...    │ │
│                             │    │ │ [timestamp]                   │ │
│                             │    │ └─────────────────────────────┘ │
│                             │    │                                  │
│                             │    │ Send Feedback                    │
│                             │    │ ┌──────────────────────────────┐ │
│                             │    │ │ [Text input area]            │ │
│                             │    │ │                              │ │
│                             │    │ │ [Send Feedback] [Close]      │ │
│                             │    │ └──────────────────────────────┘ │
└─────────────────────────────┘    └──────────────────────────────────┘
```

---

## Success Indicators

✅ You'll know it's working when:
1. Advisor dashboard shows "Email Notifications" section
2. New submissions appear automatically (or after page refresh)
3. Submissions have student name, document title, and "New Submission" badge
4. Clicking submission shows conversation history
5. Sending feedback updates conversation immediately
6. Student receives email with feedback
7. No "Demo mode" messages anywhere
8. Dark mode displays correctly

---

## Questions?

Check browser console (F12 → Console) for debug logs:
```
[AdvisorEmailNotifications] Component mounted { userId: '...', hasSupabase: true }
[Submit] Sending notification to advisor: ...
```

These logs indicate the new component is active and working.

---

**Last Updated**: December 8, 2025  
**Status**: Ready for Testing
