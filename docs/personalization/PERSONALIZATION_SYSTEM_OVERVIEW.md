# Personalization & Adaptation System - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Settings Page  │  Dashboard Editor  │  Notification Center │
│       ↓         │        ↓           │         ↓             │
│    ┌────────────────────────────────────────────────────┐   │
│    │          React Hooks (Custom Layer)                │   │
│    ├────────────────────────────────────────────────────┤   │
│    │  usePersonalization  │  useDashboardCustomization  │   │
│    │  useSmartNotifications  │  useAdaptiveInterface    │   │
│    └────────────────────────────────────────────────────┘   │
│                          ↓                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   MANAGER LAYER (Core Logic)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ UserPreferences      │  │ CrossDeviceSync      │         │
│  │ Manager              │  │ Manager              │         │
│  │                      │  │                      │         │
│  │ • getCached          │  │ • registerDevice     │         │
│  │ • updatePrefs        │  │ • trackChanges       │         │
│  │ • resetDefaults      │  │ • detectConflicts    │         │
│  │ • clearCache         │  │ • resolveConflicts   │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ AdaptiveInterface    │  │ SmartNotification    │         │
│  │ Manager              │  │ Manager              │         │
│  │                      │  │                      │         │
│  │ • logBehavior        │  │ • createNotification │         │
│  │ • detectPatterns     │  │ • calculatePriority  │         │
│  │ • getAdaptiveConfig  │  │ • optimizeTime       │         │
│  │ • suggestedActions   │  │ • selectChannels     │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │ DashboardCustomization Manager       │                   │
│  │                                      │                   │
│  │ • getDashboardConfig                 │                   │
│  │ • addWidget / removeWidget            │                   │
│  │ • reorderWidgets / resizeWidget       │                   │
│  │ • updateWidgetSettings                │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Cache Layer      │  │ Supabase (Real)  │                 │
│  │ (In-Memory)      │  │ Database          │                 │
│  │ 5-min TTL        │  │                  │                 │
│  │                  │  │ Tables:          │                 │
│  │ • Preferences    │  │ • preferences    │                 │
│  │ • Patterns       │  │ • devices        │                 │
│  │ • Adaptive       │  │ • sync_changes   │                 │
│  └──────────────────┘  │ • notifications  │                 │
│                        │ • behavior_logs  │                 │
│                        │ • patterns       │                 │
│                        └──────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Preference Update Flow

```
┌─────────────────────┐
│  User Updates       │
│  Preference Setting │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────────┐
│ React Component (Theme Switcher)    │
│ calls updatePreferences()           │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ usePersonalization Hook             │
│ • Validates update                  │
│ • Calls manager method              │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ UserPreferencesManager              │
│ • Merges with existing prefs        │
│ • Increments version                │
│ • Updates state object              │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Supabase upsert() call              │
│ • INSERT if new, UPDATE if exists   │
│ • Returns updated record            │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Cache Update                        │
│ • Store in memory cache             │
│ • Set TTL timer                     │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Component Re-render                 │
│ • UI updates with new preference    │
│ • User sees change immediately      │
└─────────────────────────────────────┘
```

### Cross-Device Sync Flow

```
┌────────────────────────────────────────────────────────────┐
│                      Device A                               │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ User Updates Theme Setting                           │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ trackChange() in CrossDeviceSyncManager              │  │
│ │ • Creates change record                              │  │
│ │ • Device ID: device_a_123                            │  │
│ │ • Operation: "update"                                │  │
│ │ • Timestamp: 2024-01-15T10:00:00Z                    │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Insert to sync_changes table (pending)               │  │
│ └────────────────┬─────────────────────────────────────┘  │
└────────────────┼──────────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────────┐
│                   Sync Engine                               │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Manual or Automatic Sync Trigger                     │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Fetch pending changes from Device A                  │  │
│ │ Fetch remote changes from other devices              │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Conflict Detection                                   │  │
│ │ • Same resource updated on Device B                  │  │
│ │ • Timestamp overlap detected                         │  │
│ │ • Create conflict record                             │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Auto-Resolution                                      │  │
│ │ • Use most recent timestamp (Device B wins)          │  │
│ │ • Mark conflict as resolved                          │  │
│ │ • Apply winning version                              │  │
│ └────────────────┬─────────────────────────────────────┘  │
│                  ↓                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Mark changes as synced                               │  │
│ │ Update device lastSyncAt timestamp                   │  │
│ └────────────────┬─────────────────────────────────────┘  │
└────────────────┼──────────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────────┐
│                      Device B                               │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Next Sync Fetch                                      │  │
│ │ • Pulls Device A changes                             │  │
│ │ • Applies resolved version                           │  │
│ │ • Updates local preferences                          │  │
│ │ • UI reflects new theme                              │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Smart Notification Flow

```
┌──────────────────────────────────────────────────────────┐
│ Application Event                                         │
│ (Document upload complete)                               │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ createNotification() called                               │
│ {                                                        │
│   title: "Upload Complete",                             │
│   type: "success",                                       │
│   priority: "medium",                                    │
│   timeSensitive: false                                   │
│ }                                                        │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ ML Priority Calculation                                  │
│ • Type score: success = 0.4                              │
│ • User preference: medium = 1.0x                         │
│ • Time sensitivity: false = 0x                           │
│ • Base score: 0.5                                        │
│ ────────────────────────────────                        │
│ Final ML Score: 0.65 (65% priority)                     │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ Fetch User Preferences                                   │
│ • Check notifications settings                           │
│ • Check quiet hours (9 PM - 8 AM)                        │
│ • Current time: 2 PM (outside quiet hours)               │
│ • Email notifications: enabled                           │
│ • Push notifications: enabled                            │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ Optimal Timing Calculation                               │
│ • Current time: 2:00 PM                                  │
│ • Outside quiet hours: send immediately                  │
│ • Schedule for: 2:00 PM (now)                            │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ Channel Selection                                         │
│ • Priority=medium: in-app + email                        │
│ • Medium frequency: not urgent push                       │
│ • Selected channels: [in-app, email]                     │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ Delivery                                                 │
│ ┌─────────────────────┐  ┌────────────────────────────┐  │
│ │ In-App              │  │ Email                      │  │
│ │ • Show toast/modal  │  │ • Queue for batch send    │  │
│ │ • Click action link │  │ • Send within hour        │  │
│ └─────────────────────┘  └────────────────────────────┘  │
│                                                           │
│ All delivered within 5 seconds                           │
└─────────────┬────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ Update Notification Record                               │
│ • sentAt: 2024-01-15T14:00:00Z                           │
│ • status: "delivered"                                    │
│ • mlScore: 0.65                                          │
└──────────────────────────────────────────────────────────┘
```

### Adaptive Interface Flow

```
┌──────────────────────────────────────────────────────────┐
│ User Interactions Over Time                              │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Day 1: logBehavior() called for each action             │
│ • Click: research_tool (10:00 AM)                        │
│ • Click: advanced_options (11:00 AM)                     │
│ • Edit: document (2:00 PM)                               │
│ • Click: settings (4:00 PM)                              │
│                                                           │
│ Day 2-7: More behavior logged                            │
│ • Research tool clicks: 45 total                         │
│ • Advanced options: 30 total                             │
│ • Settings access: 5 total                               │
│                                                           │
│ Day 14: Pattern detection runs                          │
│ • Frequency analysis per event type                      │
│ • Confidence calculation (0-1 scale)                     │
│ • User is "research_heavy" (0.85 confidence)             │
│                                                           │
└──────────┬───────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ getAdaptiveInterface() called                             │
│                                                           │
│ Pattern Analysis:                                        │
│ • research_heavy: freq=45, confidence=0.85               │
│ • power_user: freq=30, confidence=0.70                   │
│ • setting_tweaker: freq=5, confidence=0.40               │
│                                                           │
│ Customization Level: "advanced"                          │
│ • avg_freq=26.7 (>20)                                    │
│ • avg_confidence=0.65 (>0.6)                             │
│                                                           │
│ Suggested Actions:                                       │
│ [1] "Optimize for Research"                              │
│     - action: apply_defaults_research_heavy              │
│     - confidence: 0.85                                   │
│ [2] "Enable Advanced Features"                           │
│     - action: show_advanced_menu                         │
│     - confidence: 0.70                                   │
│ [3] "Explore Power User Tools"                           │
│     - action: feature_tour                               │
│     - confidence: 0.50                                   │
│                                                           │
└──────────┬───────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ UI Automatically Adjusts                                 │
│                                                           │
│ Before: Beginner layout                                  │
│ • Basic menu only                                        │
│ • Simple options                                         │
│ • Hidden advanced features                               │
│                                                           │
│ After: Advanced layout                                   │
│ • Full menu visible                                      │
│ • Advanced options shown                                 │
│ • Power user tools available                             │
│ • Context-aware suggestions displayed                    │
│                                                           │
│ User sees: "We noticed you use research tools a lot.     │
│ Would you like these optimizations?"                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Widget Management Flow

```
┌─────────────────────────────────────┐
│ User Clicks "Add Widget"             │
│ Modal opens with available widgets   │
└────────────┬────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────┐
│ getAvailableWidgets()                                │
│ Returns 8 widget types:                             │
│ • Statistics, Recent Items, Quick Actions            │
│ • Progress Tracker, Calendar                         │
│ • AI Suggestions, Analytics, Collaborators           │
└────────────┬─────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────┐
│ User Selects Widget                                 │
│ Example: "Analytics"                                │
└────────────┬─────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────┐
│ addWidget("widget_analytics")                       │
│                                                     │
│ • Get current preferences                           │
│ • Find available widget in list                     │
│ • Set enabled = true                                │
│ • Add to widgets array                              │
│ • Set position = last                               │
│                                                     │
└────────────┬─────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────┐
│ updateDashboardPreferences(updated)                 │
│ • Save to Supabase                                  │
│ • Update cache                                      │
│ • Trigger component re-render                       │
└────────────┬─────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────┐
│ Dashboard Updates Immediately                        │
│ • New widget appears                                 │
│ • Default size: medium                               │
│ • Default position: bottom                           │
│ • Loads widget data                                  │
│ • Shows visualization                                │
└──────────────────────────────────────────────────────┘
```

## Preference Categories Hierarchy

```
User Preferences
│
├── Layout
│   ├── Sidebar Position (left, right, hidden)
│   ├── Sidebar Width (pixels)
│   ├── Compact Mode (boolean)
│   ├── Grid Layout (flexible, fixed, masonry)
│   ├── Card View (grid, list, kanban)
│   └── Items Per Page (number)
│
├── Theme
│   ├── Mode (light, dark, auto)
│   ├── Color Scheme (default, blue, purple, green, custom)
│   ├── Accent Color (hex string)
│   ├── Reduced Motion (boolean)
│   ├── High Contrast (boolean)
│   └── Font Size (small, normal, large, extra-large)
│
├── Notifications
│   ├── Enabled (boolean)
│   ├── Email Notifications (boolean)
│   ├── Push Notifications (boolean)
│   ├── Sound Enabled (boolean)
│   ├── Priority-Based Timing (boolean)
│   ├── Quiet Hours
│   │   ├── Enabled (boolean)
│   │   ├── Start Time (HH:mm)
│   │   └── End Time (HH:mm)
│   └── Channels (array)
│       ├── Channel 1: Updates
│       ├── Channel 2: Reminders
│       └── Channel 3: Messages
│
├── Accessibility
│   ├── Screen Reader Enabled (boolean)
│   ├── Keyboard Navigation Only (boolean)
│   ├── Reduced Animations (boolean)
│   ├── High Contrast (boolean)
│   ├── Font Size (percentage)
│   ├── Line Height (multiplier)
│   ├── Letter Spacing (pixels)
│   ├── Dyslexia-Friendly Font (boolean)
│   ├── Focus Indicator Size (normal, large)
│   ├── Captions (boolean)
│   └── Text-to-Speech (boolean)
│
├── Dashboard
│   ├── Widgets (array of widget configs)
│   ├── Layout (grid, masonry, flex)
│   ├── Grid Columns (number)
│   ├── Enable Drag-and-Drop (boolean)
│   ├── Auto-Arrange Widgets (boolean)
│   └── Compact View (boolean)
│
└── Behavior
    ├── Auto-Save (boolean)
    ├── Auto-Save Interval (milliseconds)
    ├── Track Usage Patterns (boolean)
    ├── Learn From Behavior (boolean)
    └── Predictive Features (boolean)
```

## Component Interaction Map

```
Landing Page
    ↓
┌──────────────────────────────────┐
│ PersonalizationShowcase Component │
├──────────────────────────────────┤
│ • Displays feature overview       │
│ • Shows benefits                  │
│ • Interactive tabs               │
│ • Links to settings              │
└──────────────────────────────────┘

Settings Page
    ↓
┌──────────────────────────────────┐     ┌──────────────────────┐
│ ThemeSwitcher Component           │←────┤ usePersonalization   │
│ AccessibilitySettings Component   │     │ Hook                 │
│ NotificationPreferences Component │     └──────────────────────┘
│ Layout Customizer Component       │
└──────────────────────────────────┘

Dashboard Page
    ↓
┌──────────────────────────────────┐     ┌──────────────────────┐
│ DashboardEditor Component         │←────┤ useDashboardCust     │
│ WidgetManager Component           │     │ Hook                 │
│ DragDropContainer Component       │     └──────────────────────┘
└──────────────────────────────────┘

Notification Area
    ↓
┌──────────────────────────────────┐     ┌──────────────────────┐
│ NotificationCenter Component      │←────┤ useSmartNotifications│
│ NotificationBell Component        │     │ Hook                 │
│ NotificationToast Component       │     └──────────────────────┘
└──────────────────────────────────┘
```

## Database Schema Relationship Diagram

```
user_preferences
├── id (PK)
├── userId (FK)
├── layout (JSON)
├── theme (JSON)
├── notifications (JSON)
├── accessibility (JSON)
├── dashboard (JSON)
├── behavior (JSON)
└── version

        │
        ├→ user_devices
        │  ├── id (PK)
        │  ├── userId (FK)
        │  ├── name
        │  ├── type
        │  ├── lastSyncAt
        │  └── isActive
        │      │
        │      └→ sync_changes
        │         ├── id (PK)
        │         ├── userId (FK)
        │         ├── deviceId (FK)
        │         ├── resourceId
        │         ├── operation
        │         └── timestamp
        │             │
        │             └→ sync_conflicts
        │                ├── id (PK)
        │                ├── resourceId
        │                ├── deviceId
        │                ├── otherDeviceId
        │                ├── resolved
        │                └── resolution
        │
        ├→ notifications
        │  ├── id (PK)
        │  ├── userId (FK)
        │  ├── title
        │  ├── priority
        │  ├── mlScore
        │  ├── sentAt
        │  └── read
        │
        ├→ user_behavior_logs
        │  ├── id (PK)
        │  ├── userId (FK)
        │  ├── eventType
        │  ├── eventData (JSON)
        │  └── timestamp
        │      │
        │      └→ user_patterns
        │         ├── id (PK)
        │         ├── userId (FK)
        │         ├── pattern
        │         ├── frequency
        │         └── confidence
        │
        └→ dashboard_widgets
           ├── id (PK)
           ├── userId (FK)
           ├── type
           ├── position
           ├── settings (JSON)
           └── enabled
```

This visual overview provides a complete picture of how all components interact within the personalization system.
