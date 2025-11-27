/**
 * Mock data for development and testing
 * Use in storybook, development, and component previews
 */

import {
  UserPreferences,
  UserDevice,
  SyncChange,
  Notification,
  DashboardLayout
} from './validation';

export const mockPreferences: UserPreferences = {
  id: 'pref-mock-123',
  userId: 'user-mock-123',
  theme: {
    mode: 'auto',
    fontSize: 'medium',
    lineHeight: 'normal',
    accentColor: '#3B82F6'
  },
  notifications: {
    enabled: true,
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationBatching: false,
    batchInterval: 60
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    largerText: false,
    keyboardNavigation: false,
    screenReaderOptimized: false,
    focusIndicators: true
  },
  layout: {
    sidebarPosition: 'left',
    compactMode: false,
    showBreadcrumbs: true,
    showFilters: true,
    defaultViewType: 'list'
  },
  privacy: {
    behaviorTracking: true,
    analyticsOptIn: true,
    personalizationOptIn: true,
    dataRetentionDays: 90
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
};

export const mockDevices: UserDevice[] = [
  {
    id: 'device-1',
    userId: 'user-mock-123',
    deviceId: 'desktop-main-001',
    deviceName: 'Main Laptop',
    deviceType: 'desktop',
    osName: 'Windows',
    osVersion: '11',
    browserName: 'Chrome',
    browserVersion: '120.0',
    isTrusted: true,
    lastSeen: new Date(),
    deviceToken: 'token-main-laptop',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'device-2',
    userId: 'user-mock-123',
    deviceId: 'mobile-iphone-001',
    deviceName: 'iPhone 15',
    deviceType: 'mobile',
    osName: 'iOS',
    osVersion: '17.2',
    browserName: 'Safari',
    browserVersion: '17.2',
    isTrusted: true,
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    deviceToken: 'token-iphone',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'device-3',
    userId: 'user-mock-123',
    deviceId: 'tablet-ipad-001',
    deviceName: 'iPad Pro',
    deviceType: 'tablet',
    osName: 'iPadOS',
    osVersion: '17.2',
    browserName: 'Safari',
    browserVersion: '17.2',
    isTrusted: false,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    deviceToken: 'token-ipad',
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(Date.now() - 86400000)
  }
];

export const mockSyncChanges: SyncChange[] = [
  {
    id: 'change-1',
    userId: 'user-mock-123',
    deviceId: 'desktop-main-001',
    changeType: 'UPDATE',
    section: 'theme',
    data: { mode: 'dark', fontSize: 'large' },
    isSynced: true,
    syncTimestamp: new Date(Date.now() - 600000),
    createdAt: new Date(Date.now() - 600000)
  },
  {
    id: 'change-2',
    userId: 'user-mock-123',
    deviceId: 'mobile-iphone-001',
    changeType: 'UPDATE',
    section: 'notifications',
    data: { emailNotifications: false },
    isSynced: true,
    syncTimestamp: new Date(Date.now() - 300000),
    createdAt: new Date(Date.now() - 300000)
  },
  {
    id: 'change-3',
    userId: 'user-mock-123',
    deviceId: 'tablet-ipad-001',
    changeType: 'UPDATE',
    section: 'layout',
    data: { sidebarPosition: 'right' },
    isSynced: false,
    createdAt: new Date(Date.now() - 60000)
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-mock-123',
    title: 'Welcome to Personalization',
    message: 'Customize your experience with our new personalization features',
    notificationType: 'feature',
    priority: 3,
    channels: ['in_app'],
    data: { featureUrl: '/features/personalization' },
    deliveredAt: new Date(),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'notif-2',
    userId: 'user-mock-123',
    title: 'Preferences Synced',
    message: 'Your preferences have been synced across all devices',
    notificationType: 'system',
    priority: 2,
    channels: ['in_app'],
    readAt: new Date(Date.now() - 1800000),
    deliveredAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'notif-3',
    userId: 'user-mock-123',
    title: 'Recommendation',
    message: 'Based on your usage, try enabling dark mode for better readability at night',
    notificationType: 'recommendation',
    priority: 2,
    channels: ['in_app', 'email'],
    data: { recommendedSetting: 'theme.mode', recommendedValue: 'dark' },
    deliveredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'notif-4',
    userId: 'user-mock-123',
    title: 'Alert: Unusual Activity',
    message: 'Your account was accessed from a new device',
    notificationType: 'alert',
    priority: 5,
    channels: ['in_app', 'email', 'push'],
    data: { deviceName: 'Unknown Device', location: 'Unknown' },
    deliveredAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockDashboardLayouts: DashboardLayout[] = [
  {
    id: 'layout-default',
    userId: 'user-mock-123',
    layoutName: 'Default Dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'writing_stats',
        title: 'Writing Statistics',
        position: { x: 0, y: 0, width: 6, height: 2 }
      },
      {
        id: 'widget-2',
        type: 'recent_essays',
        title: 'Recent Essays',
        position: { x: 6, y: 0, width: 6, height: 2 }
      },
      {
        id: 'widget-3',
        type: 'quick_actions',
        title: 'Quick Actions',
        position: { x: 0, y: 2, width: 4, height: 1 }
      },
      {
        id: 'widget-4',
        type: 'goals_progress',
        title: 'Goals Progress',
        position: { x: 4, y: 2, width: 4, height: 1 }
      },
      {
        id: 'widget-5',
        type: 'recommendations',
        title: 'Recommendations',
        position: { x: 8, y: 2, width: 4, height: 1 }
      }
    ],
    gridSize: { columns: 12, rows: 4 },
    isDefault: true,
    isResponsive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'layout-compact',
    userId: 'user-mock-123',
    layoutName: 'Compact Layout',
    widgets: [
      {
        id: 'widget-1',
        type: 'quick_actions',
        title: 'Quick Actions',
        position: { x: 0, y: 0, width: 6, height: 1 }
      },
      {
        id: 'widget-2',
        type: 'writing_stats',
        title: 'Stats',
        position: { x: 6, y: 0, width: 6, height: 1 }
      },
      {
        id: 'widget-3',
        type: 'recent_essays',
        title: 'Recent',
        position: { x: 0, y: 1, width: 12, height: 2 }
      }
    ],
    gridSize: { columns: 12, rows: 3 },
    isDefault: false,
    isResponsive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

/**
 * Create mock data with variations for testing
 */
export function createMockPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    ...mockPreferences,
    ...overrides,
    createdAt: overrides.createdAt || mockPreferences.createdAt,
    updatedAt: overrides.updatedAt || new Date()
  };
}

export function createMockDevice(overrides: Partial<UserDevice> = {}): UserDevice {
  return {
    ...mockDevices[0],
    id: overrides.id || `device-${Math.random()}`,
    ...overrides
  };
}

export function createMockSyncChange(overrides: Partial<SyncChange> = {}): SyncChange {
  return {
    ...mockSyncChanges[0],
    id: overrides.id || `change-${Math.random()}`,
    ...overrides,
    createdAt: overrides.createdAt || new Date()
  };
}

export function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    ...mockNotifications[0],
    id: overrides.id || `notif-${Math.random()}`,
    ...overrides,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  };
}

export function createMockLayout(overrides: Partial<DashboardLayout> = {}): DashboardLayout {
  return {
    ...mockDashboardLayouts[0],
    id: overrides.id || `layout-${Math.random()}`,
    ...overrides,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date()
  };
}

/**
 * Get all mock data
 */
export function getAllMockData() {
  return {
    preferences: mockPreferences,
    devices: mockDevices,
    syncChanges: mockSyncChanges,
    notifications: mockNotifications,
    layouts: mockDashboardLayouts
  };
}

/**
 * Reset all mock data to defaults
 */
export function resetMockData() {
  return getAllMockData();
}
