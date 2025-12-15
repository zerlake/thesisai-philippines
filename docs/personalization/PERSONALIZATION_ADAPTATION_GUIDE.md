# Modern Personalization & Adaptation System

## Overview

A comprehensive personalization framework enabling:
- **Adaptive Interfaces** that adjust to usage patterns
- **User Preference Systems** for layout, theme, and functionality
- **Cross-Device Synchronization** with conflict resolution
- **Customizable Dashboards** with drag-and-drop capabilities
- **Smart Notifications** with ML-based priority and timing
- **Smart Defaults** that improve over time
- **Accessibility Preference Inheritance** across sessions

## Architecture

```
┌─────────────────────────────────────────────┐
│         Personalization System              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  User Preferences Manager           │   │
│  │  ├── Layout preferences             │   │
│  │  ├── Theme preferences              │   │
│  │  ├── Notification settings          │   │
│  │  ├── Accessibility settings         │   │
│  │  └── Behavior settings              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Cross-Device Sync Manager          │   │
│  │  ├── Device registration            │   │
│  │  ├── Change tracking                │   │
│  │  ├── Conflict detection             │   │
│  │  └── Smart resolution               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Adaptive Interface Manager         │   │
│  │  ├── Behavior logging               │   │
│  │  ├── Pattern detection              │   │
│  │  ├── Customization level calc       │   │
│  │  └── Suggested actions              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Smart Notification Manager         │   │
│  │  ├── ML-based prioritization        │   │
│  │  ├── Optimal timing calculation     │   │
│  │  ├── Channel selection              │   │
│  │  └── Quiet hours management         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Dashboard Customization Manager    │   │
│  │  ├── Widget management              │   │
│  │  ├── Drag-and-drop support          │   │
│  │  ├── Layout presets                 │   │
│  │  └── Config import/export           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Core Modules

### 1. User Preferences Manager

Manages all user preferences with automatic persistence and caching.

#### Usage

```typescript
import { userPreferencesManager } from '@/lib/personalization';

// Get user preferences
const prefs = await userPreferencesManager.getUserPreferences(userId);

// Update preferences
await userPreferencesManager.updatePreferences(userId, {
  theme: { mode: 'dark' }
});

// Update specific sections
await userPreferencesManager.updateThemePreferences(userId, {
  mode: 'dark',
  colorScheme: 'blue'
});

await userPreferencesManager.updateAccessibilityPreferences(userId, {
  highContrast: true,
  fontSize: 110
});

// Reset to defaults
await userPreferencesManager.resetPreferences(userId);
```

#### Preference Structure

```typescript
interface UserPreferences {
  layout: {
    sidebarPosition: 'left' | 'right' | 'hidden'
    sidebarWidth: number
    compactMode: boolean
    gridLayout: 'flexible' | 'fixed' | 'masonry'
    cardView: 'grid' | 'list' | 'kanban'
    itemsPerPage: number
  }
  theme: {
    mode: 'light' | 'dark' | 'auto'
    colorScheme: string
    accentColor: string
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'normal' | 'large'
  }
  notifications: {
    enabled: boolean
    emailNotifications: boolean
    pushNotifications: boolean
    priorityBasedTiming: boolean
    quietHours: { enabled, start, end }
    channels: NotificationChannel[]
  }
  accessibility: {
    screenReaderEnabled: boolean
    reducedAnimations: boolean
    fontSize: number
    lineHeight: number
    dyslexiaFriendlyFont: boolean
  }
  dashboard: DashboardPreferences
  behavior: BehaviorSettings
}
```

### 2. Cross-Device Synchronization

Intelligently syncs preferences across devices with automatic conflict resolution.

#### Usage

```typescript
import { crossDeviceSyncManager } from '@/lib/personalization';

// Register a device
const device = await crossDeviceSyncManager.registerDevice({
  userId: 'user123',
  name: 'MacBook Pro',
  type: 'desktop',
  os: 'macOS',
  osVersion: '14.0',
  browser: 'Chrome',
  screenWidth: 1920,
  screenHeight: 1200
});

// Sync preferences
const result = await crossDeviceSyncManager.syncPreferences(userId, deviceId);
console.log(`Synced: ${result.synced}`);
console.log(`Conflicts: ${result.conflicts.length}`);

// Get sync state
const state = await crossDeviceSyncManager.getSyncState(userId);
console.log(`Pending changes: ${state.pendingChanges.length}`);
console.log(`Conflicts: ${state.conflictedItems.length}`);

// Mark device as active
await crossDeviceSyncManager.markDeviceActive(deviceId);
```

#### Conflict Resolution

The system automatically detects and resolves conflicts:

- **Local vs Remote Changes**: Uses timestamp-based resolution (most recent wins)
- **Multiple Device Changes**: Implements 3-way merge when possible
- **User Overrides**: Respects user preference for conflicted settings

### 3. Adaptive Interface

Adjusts UI complexity and features based on usage patterns.

#### Usage

```typescript
import { adaptiveInterfaceManager } from '@/lib/personalization';

// Get adaptive interface configuration
const adaptive = await adaptiveInterfaceManager.getAdaptiveInterface(userId);
console.log(adaptive.customizationLevel); // 'beginner', 'intermediate', 'advanced'
console.log(adaptive.suggestedActions);

// Log user behavior
await adaptiveInterfaceManager.logBehavior({
  userId,
  sessionId: 'session123',
  eventType: 'document_created',
  eventData: { documentType: 'thesis', wordCount: 5000 },
  deviceId: 'device123'
});

// Detect patterns
const patterns = await adaptiveInterfaceManager.detectPatterns(userId);
patterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.pattern}`);
  console.log(`Frequency: ${pattern.frequency}`);
  console.log(`Confidence: ${pattern.confidence}`);
});

// Track feature discovery
await adaptiveInterfaceManager.trackFeatureDiscovery(userId, 'advanced_research_tools');
```

#### Customization Levels

- **Beginner**: Shows core features only, simplified interface
- **Intermediate**: Shows common advanced features based on usage
- **Advanced**: Shows all features, expert-focused UI

### 4. Smart Notifications

ML-based notification system with optimal timing and priority.

#### Usage

```typescript
import { smartNotificationManager } from '@/lib/personalization';

// Create a smart notification
const notif = await smartNotificationManager.createNotification(userId, {
  title: 'Research Complete',
  message: 'Your literature review is ready',
  type: 'success',
  priority: 'high',
  channel: 'in-app',
  data: {
    channelId: 'research',
    timeSensitive: true,
    actionUrl: '/documents/review-123'
  }
}, { immediate: false });

// Get unread notifications
const unread = await smartNotificationManager.getUnreadNotifications(userId);

// Mark as read
await smartNotificationManager.markAsRead(notificationId);
```

#### Priority Calculation

Combines multiple factors:
1. **Notification Type**: urgent > error > warning > success > info
2. **User Preference**: Channel priority settings
3. **Time Sensitivity**: Whether notification needs immediate attention
4. **Quiet Hours**: Respects user's quiet hours configuration

#### Delivery Channels

- **In-app**: Browser notification/toast
- **Email**: Email delivery (batch if multiple pending)
- **Push**: Browser push notification
- **SMS**: SMS delivery (configurable)

### 5. Dashboard Customization

Flexible dashboard with drag-and-drop widgets.

#### Usage

```typescript
import { dashboardCustomizationManager } from '@/lib/personalization';

// Get dashboard configuration
const config = await dashboardCustomizationManager.getDashboardConfig(userId);

// Add widget
await dashboardCustomizationManager.addWidget(userId, 'widget_analytics');

// Remove widget
await dashboardCustomizationManager.removeWidget(userId, 'widget_calendar');

// Reorder widgets
await dashboardCustomizationManager.reorderWidgets(userId, [
  { id: 'widget_stats', position: 0 },
  { id: 'widget_recent', position: 1 },
  { id: 'widget_quick_actions', position: 2 }
]);

// Resize widget
await dashboardCustomizationManager.resizeWidget(userId, 'widget_stats', 'full');

// Update widget settings
await dashboardCustomizationManager.updateWidgetSettings(userId, 'widget_analytics', {
  timeRange: 'month',
  metricType: 'documents'
});

// Toggle widget visibility
await dashboardCustomizationManager.toggleWidget(userId, 'widget_suggestions', true);

// Save/load layouts
await dashboardCustomizationManager.saveDashboardLayout(userId, { gridColumns: 4 });
const layout = await dashboardCustomizationManager.loadDashboardLayout(userId);

// Export/import configuration
const config = await dashboardCustomizationManager.exportDashboardConfig(userId);
await dashboardCustomizationManager.importDashboardConfig(userId, configJson);
```

#### Available Widgets

1. **Statistics** (Large): Key metrics and KPIs
2. **Recent Items** (Medium): Recently edited documents
3. **Quick Actions** (Small): Common actions
4. **Progress Tracker** (Medium): Goals and milestones
5. **Calendar** (Medium): Events and deadlines
6. **AI Suggestions** (Large): Context-aware recommendations
7. **Analytics** (Large): Usage patterns and insights
8. **Collaborators** (Small): Active team members

## React Hooks

### usePersonalization

Main hook for accessing all personalization features.

```typescript
import { usePersonalization } from '@/hooks';

function MyComponent() {
  const {
    preferences,
    isLoading,
    error,
    updatePreferences,
    adaptiveInterface,
    dashboard,
    syncStatus
  } = usePersonalization();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Theme: {preferences.theme.mode}</p>
      <p>Customization Level: {adaptiveInterface.customizationLevel}</p>
      <button onClick={() => updatePreferences({ theme: { mode: 'dark' } })}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

### useDashboardCustomization

Specialized hook for dashboard operations.

```typescript
import { useDashboardCustomization } from '@/hooks';

function DashboardEditor() {
  const {
    widgets,
    config,
    isLoading,
    addWidget,
    removeWidget,
    reorderWidgets,
    resizeWidget
  } = useDashboardCustomization();

  return (
    <div>
      <button onClick={() => addWidget('widget_analytics')}>
        Add Analytics
      </button>
      {widgets.map(widget => (
        <div key={widget.id} onClick={() => removeWidget(widget.id)}>
          {widget.type}
        </div>
      ))}
    </div>
  );
}
```

### useSmartNotifications

Hook for notification management.

```typescript
import { useSmartNotifications } from '@/hooks';

function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead
  } = useSmartNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <button onClick={markAllAsRead}>Mark All as Read</button>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

## Database Schema

### user_preferences
```sql
CREATE TABLE user_preferences (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL UNIQUE,
  layout JSONB,
  theme JSONB,
  notifications JSONB,
  accessibility JSONB,
  dashboard JSONB,
  behavior JSONB,
  version INT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

CREATE INDEX idx_user_prefs_userId ON user_preferences(userId);
```

### user_devices
```sql
CREATE TABLE user_devices (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL,
  name VARCHAR,
  type VARCHAR,
  os VARCHAR,
  osVersion VARCHAR,
  browser VARCHAR,
  browserVersion VARCHAR,
  screenWidth INT,
  screenHeight INT,
  lastSyncAt TIMESTAMP,
  isActive BOOLEAN,
  createdAt TIMESTAMP
);

CREATE INDEX idx_devices_userId ON user_devices(userId);
CREATE INDEX idx_devices_lastSync ON user_devices(lastSyncAt);
```

### sync_changes
```sql
CREATE TABLE sync_changes (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL,
  resourceId VARCHAR NOT NULL,
  resourceType VARCHAR,
  operation VARCHAR,
  data JSONB,
  deviceId VARCHAR,
  timestamp BIGINT,
  syncedAt TIMESTAMP,
  createdAt TIMESTAMP
);

CREATE INDEX idx_sync_userId ON sync_changes(userId);
CREATE INDEX idx_sync_timestamp ON sync_changes(timestamp DESC);
```

### notifications
```sql
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL,
  title VARCHAR,
  message TEXT,
  type VARCHAR,
  priority VARCHAR,
  channel VARCHAR,
  scheduledFor TIMESTAMP,
  sentAt TIMESTAMP,
  read BOOLEAN,
  mlScore FLOAT,
  data JSONB,
  createdAt TIMESTAMP
);

CREATE INDEX idx_notif_userId ON notifications(userId);
CREATE INDEX idx_notif_read ON notifications(userId, read);
```

## Implementation Examples

### Theme Switcher

```typescript
'use client';

import { usePersonalization } from '@/hooks';

export function ThemeSwitcher() {
  const { preferences, updatePreferences } = usePersonalization();

  const toggleTheme = async () => {
    const newMode = preferences.theme.mode === 'dark' ? 'light' : 'dark';
    await updatePreferences({
      theme: { ...preferences.theme, mode: newMode }
    });
  };

  return (
    <button onClick={toggleTheme}>
      {preferences.theme.mode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Adaptive Feature Panel

```typescript
'use client';

import { usePersonalization } from '@/hooks';

export function FeaturePanel() {
  const { adaptiveInterface } = usePersonalization();

  return (
    <div>
      {adaptiveInterface.suggestedActions.map(action => (
        <div key={action.id} className="suggestion">
          <h3>{action.title}</h3>
          <p>{action.description}</p>
          <button onClick={() => executeAction(action.action)}>
            Apply
          </button>
          <small>Confidence: {(action.confidence * 100).toFixed(0)}%</small>
        </div>
      ))}
    </div>
  );
}
```

### Drag-and-Drop Dashboard

```typescript
'use client';

import { useDashboardCustomization } from '@/hooks';
import { DndContext } from '@dnd-kit/core';

export function CustomizableDashboard() {
  const { widgets, reorderWidgets } = useDashboardCustomization();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = widgets.findIndex(w => w.id === active.id);
    const overIndex = widgets.findIndex(w => w.id === over.id);

    const newOrder = widgets.map((w, i) => ({
      id: w.id,
      position: i === activeIndex ? overIndex : i === overIndex ? activeIndex : i
    }));

    await reorderWidgets(newOrder);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {widgets.map(widget => (
        <div key={widget.id} draggable>
          {/* Widget content */}
        </div>
      ))}
    </DndContext>
  );
}
```

## Best Practices

1. **Cache Management**: The system caches preferences for 5 minutes. Clear cache after major updates.

2. **Async Operations**: All database operations are async. Always await results.

3. **Error Handling**: Implement try-catch blocks and provide user feedback on failures.

4. **Performance**: Use the hooks instead of direct manager calls for better integration with React.

5. **Accessibility**: Always respect user accessibility preferences before modifying UI.

6. **Sync Handling**: The system handles sync automatically. Monitor `syncStatus` for UI feedback.

## Advanced Features

### ML-Based Learning

The system learns from user behavior:
- Tracks common patterns in document usage
- Suggests interface optimizations
- Auto-adjusts notification timing
- Predicts preferred default values

### Conflict Resolution Strategies

1. **Timestamp-based**: Most recent change wins
2. **User preference**: Respects user's chosen device priority
3. **3-way merge**: Combines non-conflicting changes
4. **User manual**: Let user choose when automatic fails

### Smart Defaults

Calculated from behavior patterns:
- Research-heavy users: List view, larger page size
- Quick editors: Auto-save, compact mode
- Collaborative work: Drag-and-drop enabled
- Accessibility-focused: Keyboard navigation only

## Future Enhancements

- [ ] Voice preference customization
- [ ] Biometric unlock integration
- [ ] Advanced ML predictions
- [ ] Team/organization-wide presets
- [ ] A/B testing for UI variations
- [ ] Preference migration wizard
