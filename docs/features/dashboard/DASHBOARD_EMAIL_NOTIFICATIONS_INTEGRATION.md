# Dashboard Email Notifications Integration

## Overview
Email notifications have been integrated across all three main dashboards (Student, Advisor, Critic) and the Groups dashboard, allowing users to control which events trigger email notifications to their inbox.

## Integrated Components

### 1. User Hook: `useDashboardNotifications`
**Location:** `src/hooks/useDashboardNotifications.ts`

Provides functionality to send dashboard notifications with event tracking.

```typescript
interface DashboardNotificationConfig {
  enabled: boolean;
  emailOnSubmission: boolean;
  emailOnFeedback: boolean;
  emailOnMilestone: boolean;
  emailOnGroupActivity: boolean;
}

interface DashboardNotificationEvent {
  type: 'submission' | 'feedback' | 'revision' | 'milestone' | 'group-activity';
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: 'student' | 'advisor' | 'critic';
  documentTitle?: string;
  groupName?: string;
  message: string;
  actionUrl: string;
}

// Usage:
const { sendDashboardNotification, isSending } = useDashboardNotifications();
await sendDashboardNotification(event, config);
```

### 2. Settings Component: `DashboardNotificationSettings`
**Location:** `src/components/dashboard-notification-settings.tsx`

Modal dialog for users to manage notification preferences with role-specific settings.

**Features:**
- Master toggle for all notifications
- Role-specific notification type toggles (student/advisor/critic/group-leader)
- Auto-save functionality
- Descriptive help text for each setting

**Props:**
```typescript
interface DashboardNotificationSettingsProps {
  userRole: 'student' | 'advisor' | 'critic' | 'group-leader';
  onSettingsChange?: (settings: DashboardNotificationConfig) => void;
}
```

### 3. API Routes

#### Notification Sender
**Endpoint:** `POST /api/notifications/dashboard-notification`

Accepts notification events and sends appropriate emails based on sender/recipient roles.

Request body:
```json
{
  "type": "submission|feedback|revision|milestone|group-activity",
  "recipientEmail": "user@example.com",
  "recipientName": "Student Name",
  "senderName": "Advisor Name",
  "senderRole": "advisor",
  "documentTitle": "Chapter 1 Draft",
  "message": "You have a new submission to review",
  "actionUrl": "https://domain.com/advisor/review/123"
}
```

#### Preferences Management
**Endpoint:** `GET/PUT /api/user/notification-preferences`

- **GET:** Retrieve user's current notification preferences
- **PUT:** Update notification preferences

Request body (PUT):
```json
{
  "dashboardNotifications": {
    "enabled": true,
    "emailOnSubmission": true,
    "emailOnFeedback": true,
    "emailOnMilestone": true,
    "emailOnGroupActivity": true
  }
}
```

## Dashboard Integration

### Student Dashboard
**Location:** `src/app/thesis-phases/page.tsx`

- Added `DashboardNotificationSettings` with `userRole="student"`
- Positioned in header with back button
- Student-specific options:
  - Email on Advisor/Critic Feedback
  - Email on Milestone Updates
  - Email on Group Updates

### Advisor Dashboard
**Location:** `src/components/advisor-dashboard.tsx`

- Added `DashboardNotificationSettings` with `userRole="advisor"`
- Positioned in header next to dashboard title
- Advisor-specific options:
  - Email on Student Submissions
  - Email on Milestone Achievements
  - Email on Group Updates

### Critic Dashboard
**Location:** `src/components/critic-dashboard.tsx`

- Added `DashboardNotificationSettings` with `userRole="critic"`
- Positioned in header next to dashboard title
- Critic-specific options:
  - Email on Student Submissions
  - Email on Milestone Achievements
  - Email on Group Updates

### Groups Dashboard
**Location:** `src/app/groups/page.tsx`

- Added `DashboardNotificationSettings` with `userRole="group-leader"`
- Positioned alongside Create Group button
- Group leader-specific options:
  - Email on Group Activity
  - Email on Member Submissions

## Database Schema

### Migration: `20250106_add_dashboard_notifications.sql`

Adds JSONB column to `profiles` table:

```sql
ALTER TABLE profiles 
ADD COLUMN dashboard_notifications JSONB DEFAULT '{
  "enabled": true,
  "emailOnSubmission": true,
  "emailOnFeedback": true,
  "emailOnMilestone": true,
  "emailOnGroupActivity": true
}'::jsonb;
```

## Usage Examples

### Sending a Notification to an Advisor About Student Submission

```typescript
import { useDashboardNotifications } from '@/hooks/useDashboardNotifications';

const { sendDashboardNotification } = useDashboardNotifications();

await sendDashboardNotification(
  {
    type: 'submission',
    recipientEmail: 'advisor@example.com',
    recipientName: 'Dr. Smith',
    senderName: 'John Student',
    senderRole: 'student',
    documentTitle: 'Chapter 1 - Introduction',
    message: 'A new document has been submitted for your review.',
    actionUrl: 'https://domain.com/advisor/review/doc-123',
  },
  advisorNotificationConfig
);
```

### Sending a Notification to a Student About Feedback

```typescript
await sendDashboardNotification(
  {
    type: 'feedback',
    recipientEmail: 'student@example.com',
    recipientName: 'John Student',
    senderName: 'Dr. Smith',
    senderRole: 'advisor',
    documentTitle: 'Chapter 1 - Introduction',
    message: 'Your advisor has provided feedback on your chapter.',
    actionUrl: 'https://domain.com/drafts/doc-123#feedback',
  },
  studentNotificationConfig
);
```

### Sending a Group Notification

```typescript
await sendDashboardNotification(
  {
    type: 'group-activity',
    recipientEmail: 'member@example.com',
    recipientName: 'Group Member',
    senderName: 'Group Leader',
    senderRole: 'student',
    groupName: 'Literature Review Team',
    message: 'New activity in your research group.',
    actionUrl: 'https://domain.com/groups/group-123',
  },
  groupConfig
);
```

## Email Templates

The system uses existing email templates:
- **Advisor notifications:** `AdvisorNotificationEmail` template (for advisor/critic recipients)
- **Student notifications:** `StudentNotificationEmail` template (for student recipients)

### Customization

To modify email templates, edit:
- `src/lib/email-templates.ts` - Template HTML generation
- `src/emails/advisor-notification.tsx` - Advisor email template
- `src/emails/student-notification.tsx` - Student email template

## Implementation Checklist

- [x] Create `useDashboardNotifications` hook
- [x] Create `DashboardNotificationSettings` component
- [x] Create dashboard notification API endpoint
- [x] Create notification preferences API endpoint
- [x] Integrate into Student Dashboard (thesis-phases)
- [x] Integrate into Advisor Dashboard
- [x] Integrate into Critic Dashboard
- [x] Integrate into Groups Dashboard
- [x] Create database migration
- [ ] Test all notification flows
- [ ] Document email unsubscribe mechanism (in footer)

## Testing

### Manual Testing Checklist

1. **Student Dashboard**
   - [ ] Open thesis-phases page
   - [ ] Click notification settings button
   - [ ] Toggle email preferences
   - [ ] Verify settings persist on reload

2. **Advisor Dashboard**
   - [ ] Open advisor dashboard
   - [ ] Click notification settings button
   - [ ] Toggle email preferences
   - [ ] Submit a test notification

3. **Critic Dashboard**
   - [ ] Open critic dashboard
   - [ ] Click notification settings button
   - [ ] Verify role-specific options appear

4. **Groups Dashboard**
   - [ ] Open groups page
   - [ ] Click notification settings button
   - [ ] Verify group-specific options appear

5. **API Testing**
   ```bash
   # Test notification endpoint
   curl -X POST http://localhost:3000/api/notifications/dashboard-notification \
     -H "Content-Type: application/json" \
     -d '{
       "type": "submission",
       "recipientEmail": "test@example.com",
       "recipientName": "Advisor Name",
       "senderName": "Student Name",
       "senderRole": "student",
       "documentTitle": "Chapter 1",
       "message": "New submission",
       "actionUrl": "http://localhost:3000/advisor/review"
     }'
   ```

## Future Enhancements

1. **Notification History** - Log sent notifications for audit trail
2. **Unsubscribe Links** - Add one-click unsubscribe in email footer
3. **Notification Digest** - Batch notifications into daily/weekly digests
4. **In-App Bell Icon** - Show notification count in UI
5. **Webhook Support** - Allow external systems to trigger notifications
6. **Analytics** - Track notification open rates and click-through rates
7. **Scheduling** - Allow users to set quiet hours (no notifications)
8. **SMS Notifications** - Add SMS as alternative channel

## Environment Variables

Ensure these are set in your `.env.local`:

```
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Notifications not sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify recipient email is valid
3. Check network requests in browser DevTools
4. Review server logs for errors

### Settings not saving
1. Verify user is authenticated
2. Check that `profiles` table migration has been applied
3. Verify `dashboard_notifications` column exists
4. Check network requests for 401/403 errors

### Wrong email template
1. Verify `senderRole` is correct (advisor/critic vs student)
2. Check email template files exist
3. Review `generateAdvisorNotificationEmail` and `generateStudentNotificationEmail` logic

## Support

For issues or questions:
1. Check logs in `/var/log/thesis-ai/`
2. Review recent notifications in test page at `/api/notifications/test`
3. Verify Resend email service status
4. Check Supabase dashboard for database errors
