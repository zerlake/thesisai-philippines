# Editor Role-Based Workspace Implementation

## Overview
The Drafts Details page (`/drafts/[documentId]`) now shows different workspaces based on user role to avoid feature conflicts and improve student-advisor-critic communication.

## Changes Made

### 1. **New Component: Editor Email Notifications Sidebar**
**File:** `src/components/editor-email-notifications-sidebar.tsx`

Features for **students**:
- **Email Workspace**: Display feedback and suggestions from advisors and critics
- **Notification Types**:
  - 📘 Feedback (blue) - Advisor comments and requests for revision
  - 💜 Suggestions (purple) - Critic recommendations
  - ✓ Status (green) - Progress updates and submission status
  - ⚠️ Alerts (red) - Urgent items needing attention

- **Interactive Elements**:
  - Filter by "All" or "Unread" messages
  - Unread message counter (red badge)
  - Click to expand and view full message
  - "Jump to Section" action links
  - Delete/Archive messages

### 2. **Updated Editor Component**
**File:** `src/components/editor.tsx`

**Role Detection:**
```typescript
const isAdvisor = session?.user?.email?.includes('advisor');
const isCritic = session?.user?.email?.includes('critic');
const isAdmin = session?.user?.email?.includes('admin');
const isStudent = !isAdvisor && !isCritic && !isAdmin;
```

**Conditional Rendering:**
- **For Advisors/Critics/Admins**: Show "Review Workspace"
  - Submit feedback
  - View sample review data
  - Mark action items
  
- **For Students**: Show "Email Workspace"
  - View feedback from advisors and critics
  - Track notification status
  - Navigate to relevant document sections

## User Experience Flow

### Advisor Workflow
```
Advisor Dashboard 
  → Sample Students 
    → View Student Document 
      → Edit in Draft Details
        → Fill Review Workspace
          → Submit Feedback 
            → Student receives email notification
```

### Critic Workflow
```
Critic Dashboard 
  → My Students 
    → View Student Document 
      → Edit in Draft Details
        → Fill Review Workspace
          → Submit Feedback 
            → Student receives email notification
```

### Student Workflow
```
Student Dashboard 
  → Drafts 
    → Click Document 
      → Edit in Draft Details
        → Check Email Workspace
          → Review advisor/critic feedback
            → Jump to relevant sections
              → Make revisions
```

## No Feature Conflicts

✓ **Advisor Review Workspace** remains exclusive to advisors/critics  
✓ **Student Email Workspace** is clean and non-intrusive  
✓ Both use the same 350px right sidebar layout  
✓ No horizontal layout conflicts  
✓ Follows existing UI patterns (dark mode compatible)  

## Mock Data

The Email Notifications Sidebar includes sample mock data:
- 3 sample notifications (feedback, suggestion, status)
- Timestamps (2 hours ago, 1 day ago, 3 days ago)
- All notification types demonstrated
- Expandable message details

## Integration Points

### Email Notifications API
The system integrates with:
- `/api/notifications/send-student-email` - Student feedback notifications
- Advisor/Critic communication flows

### Future Enhancements
1. **Real-time Updates**: Connect to Supabase Realtime
2. **Database Persistence**: Store notifications in `email_notifications` table
3. **Email Templates**: Customize advisor/critic feedback emails
4. **Notification Preferences**: Let students opt-in/out of specific types
5. **Archive System**: Move old notifications to archive
6. **Rich Media**: Support images, links in notifications

## Testing

**Test as Student:**
- Navigate to `/drafts/{documentId}`
- Verify Email Workspace appears on right sidebar
- Verify Review Workspace does NOT appear
- Test filter (All/Unread)
- Click notifications to expand details
- Test "Jump to Section" links

**Test as Advisor:**
- Navigate to `/drafts/{documentId}`
- Verify Review Workspace appears on right sidebar
- Verify Email Workspace does NOT appear
- Test "Submit Feedback" button

**Test as Critic:**
- Same as Advisor workflow

## File Summary

| File | Purpose |
|------|---------|
| `editor.tsx` | Role detection and conditional rendering |
| `editor-email-notifications-sidebar.tsx` | Email workspace for students |
| `auth-provider.tsx` | Role info from session/profile |
