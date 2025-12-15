# Dashboard Notifications - Visual Guide

## User Interface

### Notification Settings Button

Appears in the header of each dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ← Back to Dashboard    [🔔 Notifications]                  │
│                                                              │
│  Student Dashboard                                           │
│  Continue your thesis journey...                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Settings Modal

When you click the notifications button:

```
╔═════════════════════════════════════════════════════════════╗
║                                                              ║
║              ⚙️ Email Notification Preferences               ║
║          Configure which events trigger email notifications  ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║                                                              ║
║  All Notifications                                           ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ Enable email notifications              [Toggle: ON]  │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║                                                              ║
║  Notification Types (Student Dashboard)                     ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ Advisor/Critic Feedback                 [Toggle: ON]  │   ║
║  │ Get notified when advisors/critics provide feedback  │   ║
║  │                                                       │   ║
║  │ Milestone Updates                       [Toggle: ON]  │   ║
║  │ Get notified when you reach thesis milestones        │   ║
║  │                                                       │   ║
║  │ Group Updates                           [Toggle: ON]  │   ║
║  │ Get notified of group collaboration activity         │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║                                                              ║
║  ℹ️ About notifications                                      ║
║  • Notifications are sent immediately when events occur     ║
║  • All emails respect your privacy settings                 ║
║  • You can unsubscribe from any email                       ║
║  • Changes are saved automatically                          ║
║                                                              ║
╚═════════════════════════════════════════════════════════════╝
```

## Notification Email Examples

### Advisor Receives Student Submission

```
┌─────────────────────────────────────────────────────────────┐
│ From: noreply@thesisai-philippines.com                      │
│ Subject: 📄 New Document from John Student - Review Needed  │
│                                                              │
│ Dear Dr. Smith,                                             │
│                                                              │
│ John Student has submitted "Chapter 1: Introduction"        │
│ for your review.                                            │
│                                                              │
│ Document Title: Chapter 1: Introduction                     │
│ Submitted by: John Student                                  │
│ Submitted on: January 6, 2025, 2:30 PM                      │
│                                                              │
│ ┌────────────────────────────────────────┐                  │
│ │      [REVIEW DOCUMENT]                   │                  │
│ └────────────────────────────────────────┘                  │
│                                                              │
│ This is an automated notification from ThesisAI.            │
│ [Unsubscribe]                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Student Receives Advisor Feedback

```
┌─────────────────────────────────────────────────────────────┐
│ From: noreply@thesisai-philippines.com                      │
│ Subject: 💬 Feedback from Dr. Smith                         │
│                                                              │
│ Hello John,                                                 │
│                                                              │
│ Your advisor Dr. Smith has provided feedback on             │
│ "Chapter 1: Introduction".                                  │
│                                                              │
│ Document Title: Chapter 1: Introduction                     │
│ Feedback from: Dr. Smith (Advisor)                          │
│ Date: January 6, 2025, 3:15 PM                              │
│                                                              │
│ ┌────────────────────────────────────────┐                  │
│ │      [VIEW FEEDBACK]                     │                  │
│ └────────────────────────────────────────┘                  │
│                                                              │
│ This is an automated notification from ThesisAI.            │
│ [Unsubscribe]                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Student Reaches Milestone

```
┌─────────────────────────────────────────────────────────────┐
│ From: noreply@thesisai-philippines.com                      │
│ Subject: 🎉 John Student Reached a Milestone!               │
│                                                              │
│ Dear Dr. Smith,                                             │
│                                                              │
│ Congratulations! John Student has completed the             │
│ "Literature Review" milestone in their thesis.              │
│                                                              │
│ Student: John Student                                       │
│ Milestone: Literature Review                                │
│ Completed on: January 6, 2025, 4:00 PM                      │
│ Progress: 50% of thesis complete                            │
│                                                              │
│ ┌────────────────────────────────────────┐                  │
│ │      [VIEW PROGRESS]                     │                  │
│ └────────────────────────────────────────┘                  │
│                                                              │
│ This is an automated notification from ThesisAI.            │
│ [Unsubscribe]                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Settings by Role

### Student Dashboard Settings
```
Master Toggle: Enable all notifications
│
├─ Feedback Notifications
│   └─ Notifications from advisors or critics
├─ Milestone Notifications  
│   └─ When you reach thesis milestones
└─ Group Notifications
    └─ Group collaboration updates
```

### Advisor Dashboard Settings
```
Master Toggle: Enable all notifications
│
├─ Student Submission Notifications
│   └─ When students submit work
├─ Milestone Notifications
│   └─ When your students reach milestones
└─ Group Notifications
    └─ Advisor group activities
```

### Critic Dashboard Settings
```
Master Toggle: Enable all notifications
│
├─ Student Submission Notifications
│   └─ When students submit for review
├─ Milestone Notifications
│   └─ When students reach milestones
└─ Group Notifications
    └─ Critic community activities
```

### Groups Dashboard Settings
```
Master Toggle: Enable all notifications
│
├─ Group Activity Notifications
│   └─ All group collaboration events
└─ Member Submission Notifications
    └─ When members submit work
```

## Data Flow Diagram

```
USER ACTIONS
  │
  ├─ Opens Dashboard
  │   ├─ Component loads
  │   ├─ Fetches current preferences from API
  │   └─ Displays notification settings button
  │
  └─ Clicks Notification Settings Button
      │
      ├─ Modal dialog opens
      ├─ Shows role-specific options
      │
      └─ Toggles notification preferences
          │
          ├─ Each toggle sends PUT request
          ├─ API validates and updates database
          ├─ Returns success confirmation
          ├─ Toast notification shows "Saved"
          └─ Settings persist on reload

EVENT TRIGGERS
  │
  ├─ Student submits document
  │   └─ Code calls sendDashboardNotification()
  │
  ├─ Advisor provides feedback
  │   └─ Code calls sendDashboardNotification()
  │
  ├─ Student reaches milestone
  │   └─ Code calls sendDashboardNotification()
  │
  └─ Group activity occurs
      └─ Code calls sendDashboardNotification()

NOTIFICATION SENDING
  │
  ├─ Event data sent to /api/notifications/dashboard-notification
  │
  ├─ API validates:
  │   ├─ Required fields present?
  │   ├─ Recipient email valid?
  │   └─ Sender role valid?
  │
  ├─ API selects email template
  │   ├─ Student recipient? → StudentNotificationEmail
  │   └─ Advisor/Critic recipient? → AdvisorNotificationEmail
  │
  ├─ API sends via Resend
  │   ├─ Sets subject line
  │   ├─ Renders HTML email
  │   └─ Includes CTA button
  │
  └─ Returns success/error to caller

EMAIL DELIVERY
  │
  ├─ Resend sends email
  │ 
  ├─ Email arrives in inbox
  │   ├─ Subject line shown in inbox
  │   ├─ Preview text shown
  │   └─ From address is configured email
  │
  └─ User clicks CTA button
      └─ Navigated to action URL
```

## Component Architecture

```
Dashboard Page
│
├─ Header
│  ├─ Dashboard Title
│  └─ DashboardNotificationSettings
│      │
│      ├─ Button (appears in header)
│      │  └─ Click → Opens Modal
│      │
│      ├─ Dialog/Modal
│      │  │
│      │  ├─ Load User Preferences
│      │  │  └─ GET /api/user/notification-preferences
│      │  │
│      │  ├─ Master Toggle
│      │  │  └─ Enable/Disable all
│      │  │
│      │  ├─ Role-Specific Settings
│      │  │  ├─ Setting 1 Toggle
│      │  │  ├─ Setting 2 Toggle
│      │  │  └─ Setting 3 Toggle
│      │  │
│      │  ├─ On Each Toggle Change
│      │  │  └─ PUT /api/user/notification-preferences
│      │  │
│      │  └─ Info Section
│      │     └─ Help text and tips
│      │
│      └─ Toast Notifications
│         ├─ On Save Success
│         └─ On Save Error
│
└─ Dashboard Content
   └─ (Unchanged)
```

## API Endpoints

### Notification Preferences
```
GET /api/user/notification-preferences
├─ Request: None (uses auth token)
└─ Response:
   {
     "dashboardNotifications": {
       "enabled": true,
       "emailOnSubmission": true,
       "emailOnFeedback": true,
       "emailOnMilestone": true,
       "emailOnGroupActivity": true
     }
   }

PUT /api/user/notification-preferences
├─ Request:
│  {
│    "dashboardNotifications": {
│      "enabled": boolean,
│      "emailOnSubmission": boolean,
│      "emailOnFeedback": boolean,
│      "emailOnMilestone": boolean,
│      "emailOnGroupActivity": boolean
│    }
│  }
└─ Response:
   {
     "message": "Preferences updated successfully",
     "dashboardNotifications": { ... }
   }
```

### Send Notification
```
POST /api/notifications/dashboard-notification
├─ Request:
│  {
│    "type": "submission|feedback|revision|milestone|group-activity",
│    "recipientEmail": "email@example.com",
│    "recipientName": "Name",
│    "senderName": "Sender Name",
│    "senderRole": "student|advisor|critic",
│    "documentTitle": "Doc Title", (optional)
│    "groupName": "Group Name",    (optional)
│    "message": "Email message",
│    "actionUrl": "https://..."
│  }
└─ Response:
   {
     "message": "Notification sent successfully",
     "data": { ... }
   }
```

## Color & Icon Reference

| Element | Icon | Color | Usage |
|---------|------|-------|-------|
| Notifications Button | 🔔 | Primary | Header button |
| Settings Icon | ⚙️ | Muted | Dialog title |
| Success | ✓ | Green | File created confirmation |
| Info | ℹ️ | Blue | Help text in modal |
| Submission | 📄 | - | Email subject |
| Feedback | 💬 | - | Email subject |
| Milestone | 🎉 | - | Email subject |
| Revision | ✏️ | - | Email subject |

## Timeline of User Experience

```
User opens dashboard
    ↓
Sees header with 🔔 Notifications button
    ↓
Clicks button
    ↓
Modal dialog opens (with loading state)
    ↓
Preferences load from server
    ↓
User sees toggles for their role
    ↓
User toggles an option
    ↓
Request sent to /api/user/notification-preferences
    ↓
Database updated
    ↓
Toast notification: "Notification preferences updated" ✓
    ↓
User closes modal (or continues toggling)
    ↓
Preferences saved to database
    ↓
Later, when event occurs...
    ↓
Code checks user's preferences
    ↓
If enabled, sends email via Resend
    ↓
Email arrives in user's inbox
    ↓
User reads email and clicks button
    ↓
Navigated to relevant page in app
```

---

This visual guide helps understand the flow and UI of the notification system.
