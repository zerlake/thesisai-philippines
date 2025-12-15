# Dashboard Notifications - Next Steps

## Immediate Actions Required

### 1. Apply Database Migration ⚠️ REQUIRED

```bash
supabase migration up
```

This creates the `dashboard_notifications` column in the `profiles` table. Without this, the notification settings API will fail.

### 2. Verify Environment Variables

Ensure your `.env.local` has:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
```

If missing, email sending will fail silently.

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Test Each Dashboard

Open in browser and verify notification settings button appears:

1. **Student Dashboard** - http://localhost:3000/thesis-phases
   - Should see 🔔 Notifications button in header

2. **Advisor Dashboard** - http://localhost:3000/(app)/advisor
   - Should see 🔔 Notifications button in header

3. **Critic Dashboard** - Check URL in browser (usually behind auth)
   - Should see 🔔 Notifications button in header

4. **Groups Dashboard** - http://localhost:3000/groups
   - Should see 🔔 Notifications button next to Create Group

### 5. Test Settings Dialog

On each dashboard:
1. Click the 🔔 Notifications button
2. Verify modal opens
3. Toggle each setting
4. Verify toast notification appears: "Notification preferences updated"
5. Close modal and reopen
6. Verify settings were saved

## Verify Installation

Run this to check all files were created:

```bash
# Check hook exists
test -f src/hooks/useDashboardNotifications.ts && echo "✓ Hook created"

# Check component exists
test -f src/components/dashboard-notification-settings.tsx && echo "✓ Component created"

# Check API endpoints exist
test -f src/app/api/notifications/dashboard-notification/route.ts && echo "✓ Notification API created"
test -f src/app/api/user/notification-preferences/route.ts && echo "✓ Preferences API created"

# Check migration exists
test -f supabase/migrations/20250106_add_dashboard_notifications.sql && echo "✓ Migration created"
```

All should output checkmarks (✓).

## Integrating Into Your Features

Once verified, add notifications to your features:

### Example 1: When Student Submits Document

In your document submission handler:

```typescript
import { useDashboardNotifications } from '@/hooks/useDashboardNotifications';

export function SubmitDocumentButton() {
  const { sendDashboardNotification, isSending } = useDashboardNotifications();

  const handleSubmit = async (doc: Document, advisor: User) => {
    try {
      // Save document...
      await submitDocument(doc);

      // Send notification to advisor
      await sendDashboardNotification(
        {
          type: 'submission',
          recipientEmail: advisor.email,
          recipientName: advisor.name,
          senderName: `${user.firstName} ${user.lastName}`,
          senderRole: 'student',
          documentTitle: doc.title,
          message: `${user.firstName} submitted "${doc.title}" for review.`,
          actionUrl: `/advisor/review/${doc.id}`,
        },
        advisorConfig // from useAuth or usePreferences
      );

      toast.success('Document submitted!');
    } catch (error) {
      toast.error('Failed to submit');
    }
  };

  return (
    <Button onClick={handleSubmit} disabled={isSending}>
      Submit
    </Button>
  );
}
```

### Example 2: When Advisor Provides Feedback

```typescript
const handleProvideFeedback = async (feedback: Feedback, student: User) => {
  try {
    // Save feedback...
    await createFeedback(feedback);

    // Notify student
    await sendDashboardNotification(
      {
        type: 'feedback',
        recipientEmail: student.email,
        recipientName: student.name,
        senderName: advisorName,
        senderRole: 'advisor',
        documentTitle: feedback.documentTitle,
        message: 'Your advisor provided feedback on your document.',
        actionUrl: `/drafts/${feedback.documentId}#feedback`,
      },
      studentConfig
    );

    toast.success('Feedback saved and notified student');
  } catch (error) {
    toast.error('Failed to save feedback');
  }
};
```

### Example 3: When Milestone is Reached

```typescript
const handleMilestoneCompletion = async (milestone: Milestone, student: User) => {
  try {
    // Mark milestone as complete...
    await completeMilestone(milestone);

    // Notify advisor
    if (student.advisorEmail) {
      await sendDashboardNotification(
        {
          type: 'milestone',
          recipientEmail: student.advisorEmail,
          recipientName: student.advisorName,
          senderName: `${student.firstName} ${student.lastName}`,
          senderRole: 'student',
          documentTitle: milestone.name,
          message: `${student.firstName} completed milestone: ${milestone.name}`,
          actionUrl: `/advisor/students/${student.id}?tab=milestones`,
        },
        advisorConfig
      );
    }

    toast.success(`Milestone "${milestone.name}" completed!`);
  } catch (error) {
    toast.error('Failed to complete milestone');
  }
};
```

## Testing Notifications

### Test Without Sending Emails

If you want to test notification UI without sending actual emails:

1. Comment out the email sending in the API route temporarily
2. The modal and settings will still work
3. Check network tab to see API calls

### Test Email Delivery

1. Use a real email address (yours or test account)
2. Check spam/promotions folder
3. Verify sender is from configured `RESEND_FROM_EMAIL`
4. Check Resend dashboard for delivery status: https://resend.com/emails

### Test Different Roles

Use different accounts:
- Student account: See student-specific settings
- Advisor account: See advisor-specific settings
- Critic account: See critic-specific settings
- Group leader account: See group-specific settings

## Common Issues & Solutions

### Issue: Settings button doesn't appear
**Solution:** 
- Clear browser cache (Cmd+Shift+Delete on Mac, Ctrl+Shift+Delete on Windows)
- Restart dev server
- Check browser console for errors (F12)

### Issue: Toggle doesn't save
**Solution:**
- Ensure you're logged in (check auth status)
- Check network tab (F12 → Network) for API errors
- Verify Supabase connection
- Run migration: `supabase migration up`

### Issue: Emails not arriving
**Solution:**
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for bounce/failures
- Verify recipient email address is valid
- Check spam/promotions folder
- Check server logs for errors

### Issue: Wrong role settings show
**Solution:**
- Verify `userRole` prop passed to component is correct
- Check user's role in database
- Clear browser cache and reload

## Documentation Reference

- **Quick start:** `DASHBOARD_NOTIFICATIONS_QUICKSTART.md`
- **Full docs:** `DASHBOARD_EMAIL_NOTIFICATIONS_INTEGRATION.md`
- **Summary:** `DASHBOARD_NOTIFICATIONS_SUMMARY.md`

## Rollback Plan

If you need to revert everything:

```bash
# 1. Revert dashboard changes
git checkout src/app/thesis-phases/page.tsx
git checkout src/components/advisor-dashboard.tsx
git checkout src/components/critic-dashboard.tsx
git checkout src/app/groups/page.tsx

# 2. Delete new files
rm src/hooks/useDashboardNotifications.ts
rm src/components/dashboard-notification-settings.tsx
rm src/app/api/notifications/dashboard-notification/route.ts
rm src/app/api/user/notification-preferences/route.ts

# 3. Revert database (if needed)
supabase migration down
```

## Support

For issues:
1. Check the troubleshooting section in `DASHBOARD_EMAIL_NOTIFICATIONS_INTEGRATION.md`
2. Review error messages in browser console (F12)
3. Check network tab for API errors
4. Verify environment variables are set

## Timeline

| Task | Estimated Time | Required? |
|------|---|---|
| Run migration | 1 min | YES |
| Verify files | 2 min | YES |
| Test dashboards | 10 min | Recommended |
| Test settings | 5 min | Recommended |
| Integrate into features | Variable | When ready |

## Success Criteria

✅ All dashboards show notification settings button
✅ Settings dialog opens and closes properly
✅ Toggling settings saves preferences
✅ Preferences persist on page reload
✅ Test email sends successfully
✅ Email includes correct subject/content/button

## Next Phase (Future)

Once the basics are working:
1. Add notification sending to real feature flows
2. Monitor email delivery rates
3. Gather user feedback on notification preferences
4. Iterate on notification types and frequency
5. Consider adding digest/batch mode
6. Add unsubscribe link to emails

---

**Ready to get started? Run:** `supabase migration up && pnpm dev`
