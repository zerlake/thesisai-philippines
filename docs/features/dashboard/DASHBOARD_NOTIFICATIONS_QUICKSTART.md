# Dashboard Notifications - Quick Start Guide

## What's New

Email notifications have been integrated into all three main dashboards:
- ✅ **Student Dashboard** (Thesis Phases)
- ✅ **Advisor Dashboard**
- ✅ **Critic Dashboard**
- ✅ **Groups Dashboard**

## For Users

### Accessing Notification Settings

1. Open any dashboard (student, advisor, critic, or groups)
2. Look for the **🔔 Notifications** button in the header
3. Click it to open the settings dialog
4. Toggle notification types on/off
5. Settings are auto-saved

### What Notifications Can You Receive?

**Student Dashboard:**
- Feedback from advisors/critics
- Thesis milestone updates
- Group collaboration activity

**Advisor Dashboard:**
- New student document submissions
- Student milestone achievements
- Advisor group activities

**Critic Dashboard:**
- New documents submitted for review
- Student milestone achievements
- Critic community activities

**Groups Dashboard:**
- Member activity in groups
- New member submissions
- Group announcements

## For Developers

### How to Send a Notification

1. **Import the hook:**
```typescript
import { useDashboardNotifications } from '@/hooks/useDashboardNotifications';
```

2. **Use it in your component:**
```typescript
const { sendDashboardNotification, isSending } = useDashboardNotifications();
```

3. **Send notification when an event occurs:**
```typescript
// Example: When a student submits work
await sendDashboardNotification(
  {
    type: 'submission',
    recipientEmail: advisor.email,
    recipientName: advisor.name,
    senderName: student.name,
    senderRole: 'student',
    documentTitle: doc.title,
    message: `${student.name} submitted "${doc.title}"`,
    actionUrl: `/advisor/review/${doc.id}`,
  },
  advisorConfig
);
```

### Notification Event Types

```typescript
type NotificationType = 
  | 'submission'      // Document/work submitted
  | 'feedback'        // Feedback provided  
  | 'revision'        // Revision requested
  | 'milestone'       // Milestone reached
  | 'group-activity'  // Group collaboration activity
```

### Sender Roles

```typescript
type SenderRole = 
  | 'student'   // Student sending to advisor/critic
  | 'advisor'   // Advisor sending to student
  | 'critic'    // Critic sending to student
```

## Setup Checklist

- [x] Files created
  - `src/hooks/useDashboardNotifications.ts`
  - `src/components/dashboard-notification-settings.tsx`
  - `src/app/api/notifications/dashboard-notification/route.ts`
  - `src/app/api/user/notification-preferences/route.ts`

- [ ] Database migration applied
  ```bash
  supabase migration up
  ```

- [ ] Environment variables verified
  ```bash
  # Check .env.local has:
  # RESEND_API_KEY=...
  # RESEND_FROM_EMAIL=...
  ```

- [ ] Dashboards updated
  - [x] Student Dashboard (`src/app/thesis-phases/page.tsx`)
  - [x] Advisor Dashboard (`src/components/advisor-dashboard.tsx`)
  - [x] Critic Dashboard (`src/components/critic-dashboard.tsx`)
  - [x] Groups Dashboard (`src/app/groups/page.tsx`)

## Common Integration Points

### When Student Submits Document
```typescript
// In document submission handler
await sendDashboardNotification(
  {
    type: 'submission',
    recipientEmail: advisor.email,
    recipientName: advisor.name,
    senderName: student.name,
    senderRole: 'student',
    documentTitle: document.title,
    message: `New document submitted for review`,
    actionUrl: `/advisor/review/${document.id}`,
  },
  config
);
```

### When Advisor Provides Feedback
```typescript
// In feedback creation handler
await sendDashboardNotification(
  {
    type: 'feedback',
    recipientEmail: student.email,
    recipientName: student.name,
    senderName: advisor.name,
    senderRole: 'advisor',
    documentTitle: document.title,
    message: `Feedback added to your document`,
    actionUrl: `/drafts/${document.id}#feedback`,
  },
  config
);
```

### When Student Reaches Milestone
```typescript
// In milestone achievement handler
await sendDashboardNotification(
  {
    type: 'milestone',
    recipientEmail: advisor.email,
    recipientName: advisor.name,
    senderName: student.name,
    senderRole: 'student',
    documentTitle: milestone.name,
    message: `Milestone completed: ${milestone.name}`,
    actionUrl: `/advisor/students/${student.id}`,
  },
  config
);
```

### When Group Member is Added
```typescript
// In group membership handler
await sendDashboardNotification(
  {
    type: 'group-activity',
    recipientEmail: member.email,
    recipientName: member.name,
    senderName: groupLeader.name,
    senderRole: 'student',
    groupName: group.name,
    message: `You've been added to group: ${group.name}`,
    actionUrl: `/groups/${group.id}`,
  },
  config
);
```

## Testing

### Test Endpoint
Visit: http://localhost:3000/api/notifications/test

### Manual Test with cURL
```bash
curl -X POST http://localhost:3000/api/notifications/dashboard-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "submission",
    "recipientEmail": "advisor@test.com",
    "recipientName": "Test Advisor",
    "senderName": "Test Student",
    "senderRole": "student",
    "documentTitle": "Chapter 1",
    "message": "Test notification",
    "actionUrl": "http://localhost:3000/advisor"
  }'
```

## Troubleshooting

### Notifications not appearing in UI
- Clear browser cache
- Check browser console for errors
- Verify auth token is valid

### Notifications not sending emails
- Check RESEND_API_KEY is set
- Verify email addresses are valid
- Check Resend dashboard for bounces
- Review server logs

### Settings not saving
- Verify user is logged in
- Check database has `dashboard_notifications` column
- Run migration: `supabase migration up`
- Check browser Network tab for API errors

## File Structure

```
src/
├── hooks/
│   └── useDashboardNotifications.ts         # Hook for sending notifications
├── components/
│   └── dashboard-notification-settings.tsx # Settings modal component
├── app/
│   ├── thesis-phases/
│   │   └── page.tsx                         # Updated: Added settings
│   ├── groups/
│   │   └── page.tsx                         # Updated: Added settings
│   └── api/
│       ├── notifications/
│       │   └── dashboard-notification/
│       │       └── route.ts                 # Sends notifications
│       └── user/
│           └── notification-preferences/
│               └── route.ts                 # Manages settings
├── components/
│   ├── advisor-dashboard.tsx                # Updated: Added settings
│   └── critic-dashboard.tsx                 # Updated: Added settings
└── lib/
    └── resend-notification.ts               # Existing email templates

supabase/migrations/
└── 20250106_add_dashboard_notifications.sql # Database schema update
```

## Next Steps

1. **Apply database migration:**
   ```bash
   supabase migration up
   ```

2. **Test in development:**
   ```bash
   pnpm dev
   ```

3. **Navigate to any dashboard and test:**
   - Open a dashboard
   - Click the notification settings button
   - Toggle settings
   - Verify they save

4. **Integrate into your workflows:**
   - Add `sendDashboardNotification()` calls where needed
   - Test each notification type
   - Verify emails arrive

5. **Monitor in production:**
   - Check Resend dashboard for delivery status
   - Monitor error logs
   - Gather user feedback

## API Reference

### DashboardNotificationConfig
```typescript
{
  enabled: boolean;                  // Master on/off
  emailOnSubmission: boolean;         // Document submissions
  emailOnFeedback: boolean;           // Feedback events
  emailOnMilestone: boolean;          // Milestone achievements
  emailOnGroupActivity: boolean;      // Group collaboration
}
```

### DashboardNotificationEvent
```typescript
{
  type: 'submission' | 'feedback' | 'revision' | 'milestone' | 'group-activity';
  recipientEmail: string;             // Who receives email
  recipientName: string;              // Recipient display name
  senderName: string;                 // Who triggered event
  senderRole: 'student' | 'advisor' | 'critic';  // Sender type
  documentTitle?: string;             // Doc/milestone name
  groupName?: string;                 // Group name (if applicable)
  message: string;                    // Email body message
  actionUrl: string;                  // CTA link in email
}
```

## Support

For detailed documentation: See `DASHBOARD_EMAIL_NOTIFICATIONS_INTEGRATION.md`
