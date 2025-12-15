# Restore Email Notifications to Dashboard UI

## Status

Email notification **code exists and is fully functional** but is **not currently displayed** in the dashboard UI.

## Quick Fix

The `DashboardNotificationSettings` component exists in:
```
src/components/dashboard-notification-settings.tsx
```

It provides a complete email notification preferences dialog with:
- Master toggle for all notifications
- Role-specific settings
- Event type selection
- Auto-save functionality

## Where to Add It

### Option 1: Dashboard Header (Recommended)

Edit: `src/components/dashboard/DashboardPageContent.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { DashboardNotificationSettings } from '@/components/dashboard-notification-settings'; // ADD THIS
import { ErrorBoundary } from './ErrorBoundary';
import { DashboardSkeleton } from './LoadingSkeleton';
// ... other imports

export function DashboardPageContent() {
  const store = useDashboardStore();
  const { widgetData, isLoadingAllWidgets } = store;
  const userRole = 'student'; // Get from auth context

  // ... existing code ...

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Dashboard header - UPDATED */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your research overview.
            </p>
          </div>
          {/* ADD EMAIL NOTIFICATIONS BUTTON */}
          <DashboardNotificationSettings userRole={userRole} />
        </div>

        {/* Widgets grid */}
        {/* ... rest of component ... */}
      </div>
    </ErrorBoundary>
  );
}
```

### Option 2: Navigation Sidebar

Add to the user navigation menu/dropdown:

```tsx
import { DashboardNotificationSettings } from '@/components/dashboard-notification-settings';

// In your nav dropdown/menu:
<DropdownMenu>
  <DropdownMenuTrigger>Settings</DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* Existing menu items */}
    <DashboardNotificationSettings userRole={userRole} />
    {/* More menu items */}
  </DropdownMenuContent>
</DropdownMenu>
```

### Option 3: Account Settings Page

Add to dedicated settings/preferences page:

```tsx
// pages/settings/notifications.tsx or similar
import { DashboardNotificationSettings } from '@/components/dashboard-notification-settings';

export default function NotificationSettingsPage() {
  const userRole = 'student'; // Get from context
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Preferences</h1>
      <DashboardNotificationSettings userRole={userRole} />
    </div>
  );
}
```

## Component Props

```typescript
interface DashboardNotificationSettingsProps {
  userRole: 'student' | 'advisor' | 'critic' | 'group-leader';
  onSettingsChange?: (settings: DashboardNotificationConfig) => void;
}
```

## What It Includes

### Default Settings
```javascript
{
  enabled: true,
  emailOnSubmission: true,
  emailOnFeedback: true,
  emailOnMilestone: true,
  emailOnGroupActivity: true,
}
```

### Role-Specific Options

**Student:**
- Advisor/Critic Feedback
- Milestone Updates
- Group Updates

**Advisor:**
- Student Submissions
- Milestone Achievements
- Group Updates

**Critic:**
- Student Submissions
- Milestone Achievements
- Group Updates

**Group-Leader:**
- Group Activity
- Member Submissions

## Features

✅ Master toggle to enable/disable all notifications
✅ Individual event type toggles
✅ Dark mode support
✅ Auto-save preferences
✅ Dialog-based UI
✅ Role-specific settings
✅ Toast notifications for user feedback

## Testing

After adding to dashboard:

```bash
# Test component renders
pnpm test:ui

# Run integration tests
pnpm exec vitest src/__tests__/novel-sh-integration.test.ts

# Build to verify no errors
pnpm build
```

## Related Files

| File | Purpose |
|------|---------|
| `src/components/dashboard-notification-settings.tsx` | Main component |
| `src/hooks/useDashboardNotifications.ts` | Hook for notification logic |
| `src/lib/personalization/validation.ts` | Settings validation |
| `src/app/api/user/notification-preferences` | API endpoints |

## API Endpoints Used

```bash
# GET current preferences
GET /api/user/notification-preferences

# PUT update preferences
PUT /api/user/notification-preferences
Body: {
  dashboardNotifications: {
    enabled: boolean,
    emailOnSubmission: boolean,
    emailOnFeedback: boolean,
    emailOnMilestone: boolean,
    emailOnGroupActivity: boolean,
  }
}
```

## Implementation Steps

1. **Open** `src/components/dashboard/DashboardPageContent.tsx`

2. **Add import** at top:
   ```tsx
   import { DashboardNotificationSettings } from '@/components/dashboard-notification-settings';
   ```

3. **Get user role** from auth context:
   ```tsx
   const { user } = useAuth(); // or your auth hook
   const userRole = user?.role || 'student';
   ```

4. **Add component** to dashboard header:
   ```tsx
   <div className="flex items-center justify-between">
     <div>
       <h1 className="text-3xl font-bold">Dashboard</h1>
       <p className="text-gray-600">Welcome back!</p>
     </div>
     <DashboardNotificationSettings userRole={userRole} />
   </div>
   ```

5. **Test** the button appears and works
6. **Build** to verify no errors

## Complete Example

Here's a complete implementation in the dashboard:

```tsx
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { DashboardNotificationSettings } from '@/components/dashboard-notification-settings';
import { useAuth } from '@/components/auth-provider';
import { ErrorBoundary } from './ErrorBoundary';
import { DashboardSkeleton } from './LoadingSkeleton';
import { ResearchProgressWidget } from './widgets/ResearchProgressWidget';
import { StatsWidget } from './widgets/StatsWidget';
// ... other imports

export function DashboardPageContent() {
  const store = useDashboardStore();
  const { widgetData, isLoadingAllWidgets } = store;
  const { session } = useAuth();
  const userRole = (session?.user?.user_metadata?.role || 'student') as any;

  useEffect(() => {
    store.loadAllWidgetData([
      'research-progress',
      'stats',
      'recent-papers',
      'writing-goals',
      'collaboration',
      'calendar',
    ]);
  }, [store]);

  if (isLoadingAllWidgets) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Dashboard header with notification settings */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your research overview.
            </p>
          </div>
          <DashboardNotificationSettings userRole={userRole} />
        </div>

        {/* Widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Your existing widgets ... */}
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

## Verification Checklist

- [ ] Component imported correctly
- [ ] User role passed to component
- [ ] Button appears in dashboard
- [ ] Dialog opens on button click
- [ ] Settings can be toggled
- [ ] Preferences save successfully
- [ ] Toast notifications appear
- [ ] Works in dark mode
- [ ] No console errors
- [ ] Build succeeds

## Rollback

If needed, simply remove the import and component usage. The underlying code will remain intact for future use.

## Support

For questions about:
- **Component logic**: See `src/hooks/useDashboardNotifications.ts`
- **API integration**: See `src/app/api/user/notification-preferences`
- **Settings validation**: See `src/lib/personalization/validation.ts`
- **UI styling**: See the component file itself
