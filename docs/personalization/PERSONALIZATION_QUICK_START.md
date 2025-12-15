# Personalization System - Quick Start Guide

## 5-Minute Setup

### 1. Import in Your Component

```typescript
'use client';

import { usePersonalization } from '@/hooks/usePersonalization';
import { useDashboardCustomization } from '@/hooks/useDashboardCustomization';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
```

### 2. Use in Your Component

```typescript
export function MyComponent() {
  // Get all personalization features
  const { preferences, updatePreferences } = usePersonalization();
  
  // Or specific features
  const { widgets, addWidget } = useDashboardCustomization();
  const { notifications, createNotification } = useSmartNotifications();

  return (
    <div>
      <p>Current theme: {preferences?.theme.mode}</p>
      <button onClick={() => updatePreferences({ 
        theme: { mode: 'dark' } 
      })}>
        Switch to Dark Mode
      </button>
    </div>
  );
}
```

## Common Tasks

### Update User Theme

```typescript
const { updatePreferences } = usePersonalization();

await updatePreferences({
  theme: {
    mode: 'dark',
    colorScheme: 'blue',
    accentColor: '#3b82f6'
  }
});
```

### Update Accessibility Settings

```typescript
const { updatePreferences } = usePersonalization();

await updatePreferences({
  accessibility: {
    highContrast: true,
    fontSize: 120,
    reducedAnimations: true
  }
});
```

### Add a Dashboard Widget

```typescript
const { addWidget } = useDashboardCustomization();

await addWidget('widget_analytics');
```

### Reorder Dashboard Widgets

```typescript
const { reorderWidgets } = useDashboardCustomization();

await reorderWidgets([
  { id: 'widget_stats', position: 0 },
  { id: 'widget_recent', position: 1 },
  { id: 'widget_quick_actions', position: 2 }
]);
```

### Send Smart Notification

```typescript
const { createNotification } = useSmartNotifications();

await createNotification({
  title: 'Task Complete',
  message: 'Your document has been processed',
  type: 'success',
  priority: 'high',
  channel: 'in-app',
  data: { actionUrl: '/documents/123' }
});
```

### Set Notification Preferences

```typescript
const { updatePreferences } = usePersonalization();

await updatePreferences({
  notifications: {
    enabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  }
});
```

## Component Examples

### Theme Switcher Component

```typescript
'use client';

import { usePersonalization } from '@/hooks/usePersonalization';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();

  if (isLoading || !preferences) return null;

  const isDark = preferences.theme.mode === 'dark';

  return (
    <button 
      onClick={() => updatePreferences({
        theme: { 
          ...preferences.theme,
          mode: isDark ? 'light' : 'dark' 
        }
      })}
      className="p-2 rounded-lg hover:bg-gray-100"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

### Accessibility Settings Component

```typescript
'use client';

import { usePersonalization } from '@/hooks/usePersonalization';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function AccessibilitySettings() {
  const { preferences, updatePreferences } = usePersonalization();

  if (!preferences) return null;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <label className="font-semibold">Font Size: {preferences.accessibility.fontSize}%</label>
        <Slider
          value={[preferences.accessibility.fontSize]}
          min={80}
          max={150}
          step={10}
          onValueChange={([value]) => 
            updatePreferences({
              accessibility: { ...preferences.accessibility, fontSize: value }
            })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="font-semibold">High Contrast</label>
        <Switch
          checked={preferences.accessibility.highContrast}
          onCheckedChange={(checked) =>
            updatePreferences({
              accessibility: { ...preferences.accessibility, highContrast: checked }
            })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="font-semibold">Reduced Animations</label>
        <Switch
          checked={preferences.accessibility.reducedAnimations}
          onCheckedChange={(checked) =>
            updatePreferences({
              accessibility: { ...preferences.accessibility, reducedAnimations: checked }
            })
          }
        />
      </div>
    </Card>
  );
}
```

### Dashboard Widget Manager

```typescript
'use client';

import { useDashboardCustomization } from '@/hooks/useDashboardCustomization';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export function DashboardWidgetManager() {
  const { 
    widgets, 
    addWidget, 
    removeWidget, 
    getAvailableWidgets 
  } = useDashboardCustomization();

  const available = dashboardCustomizationManager.getAvailableWidgets();
  const active = new Set(widgets.map(w => w.id));

  return (
    <Card className="p-6 space-y-6">
      <h3 className="font-semibold">Available Widgets</h3>
      <div className="grid grid-cols-2 gap-3">
        {available.map(widget => (
          <Button
            key={widget.id}
            variant={active.has(widget.id) ? 'default' : 'outline'}
            onClick={() => 
              active.has(widget.id) 
                ? removeWidget(widget.id)
                : addWidget(widget.id)
            }
          >
            {widget.settings.title}
            {active.has(widget.id) && <X className="w-4 h-4 ml-2" />}
          </Button>
        ))}
      </div>
    </Card>
  );
}
```

### Notification Center

```typescript
'use client';

import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead } = useSmartNotifications();

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <Badge variant="secondary">{unreadCount} unread</Badge>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => markAsRead(notif.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
              </div>
              <Badge variant="outline">{notif.priority}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

## API Reference

### usePersonalization()

```typescript
interface UsePersonalizationReturn {
  preferences: UserPreferences | null;        // Current preferences
  isLoading: boolean;                         // Loading state
  error: Error | null;                        // Error if any
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  adaptiveInterface: AdaptiveInterface | null; // Adaptive UI config
  dashboard: DashboardPreferences | null;     // Dashboard config
  syncStatus: { syncing: boolean; lastSync: Date | null };
}
```

### useDashboardCustomization()

```typescript
interface UseDashboardCustomizationReturn {
  widgets: DashboardWidget[];                 // Current widgets
  config: DashboardPreferences | null;        // Dashboard config
  isLoading: boolean;                         // Loading state
  addWidget: (widgetId: string) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  reorderWidgets: (newOrder: { id: string; position: number }[]) => Promise<void>;
  resizeWidget: (widgetId: string, size: 'small' | 'medium' | 'large' | 'full') => Promise<void>;
  toggleWidget: (widgetId: string, enabled: boolean) => Promise<void>;
  updateWidgetSettings: (widgetId: string, settings: Record<string, unknown>) => Promise<void>;
  resetDashboard: () => Promise<void>;
}
```

### useSmartNotifications()

```typescript
interface UseSmartNotificationsReturn {
  notifications: SmartNotification[];         // All notifications
  unreadCount: number;                        // Count of unread
  isLoading: boolean;                         // Loading state
  createNotification: (notification: Omit<...>, options?: { immediate?: boolean }) => Promise<SmartNotification>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

## Direct Manager Usage

For server-side or non-React code:

```typescript
import { 
  userPreferencesManager,
  smartNotificationManager,
  dashboardCustomizationManager
} from '@/lib/personalization';

// Get preferences
const prefs = await userPreferencesManager.getUserPreferences(userId);

// Create notification
const notif = await smartNotificationManager.createNotification(userId, {
  title: 'Hello',
  message: 'This is a test',
  type: 'info',
  priority: 'medium',
  channel: 'in-app',
  data: {}
});

// Manage dashboard
await dashboardCustomizationManager.addWidget(userId, 'widget_stats');
```

## Troubleshooting

### Preferences Not Loading

```typescript
// Check if user is authenticated
const { user, isLoaded } = useAuth();
console.log({ user, isLoaded });

// Verify network request
// Check browser dev tools Network tab for /api calls
```

### Sync Not Working

```typescript
// Check sync state
const { syncStatus } = usePersonalization();
console.log('Syncing:', syncStatus.syncing);
console.log('Last sync:', syncStatus.lastSync);

// Check browser console for errors
```

### Dashboard Not Updating

```typescript
// Refresh dashboard config
const { config } = useDashboardCustomization();
console.log('Current widgets:', config?.widgets);

// Verify widget IDs match available widgets
```

## Performance Tips

1. **Use hooks for automatic caching**: Hooks manage cache automatically
2. **Batch preference updates**: Update multiple settings in one call
3. **Lazy load dashboard widgets**: Load widget data on demand
4. **Implement virtualization**: For large widget lists, use virtualization
5. **Debounce sync operations**: Debounce rapid preference changes

## Security Considerations

1. Never store sensitive data in preferences
2. Always validate user input
3. Use HTTPS for all communication
4. Implement proper access controls
5. Encrypt sensitive preference data

## Next Steps

1. Read [PERSONALIZATION_ADAPTATION_GUIDE.md](./PERSONALIZATION_ADAPTATION_GUIDE.md) for detailed documentation
2. Check [PERSONALIZATION_IMPLEMENTATION_CHECKLIST.md](./PERSONALIZATION_IMPLEMENTATION_CHECKLIST.md) for implementation status
3. Review database schema and create migrations
4. Implement UI components for your use cases
5. Add tests for your implementations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review component examples
3. Check the full implementation guide
4. Review the codebase in `/src/lib/personalization/`
