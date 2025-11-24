import { z } from 'zod';

// Preference section schemas
export const themeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark', 'auto']).default('auto'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xl']).default('medium'),
  lineHeight: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
});

export const notificationSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notificationBatching: z.boolean().default(false),
  batchInterval: z.number().min(5).max(1440).default(60),
});

export const accessibilitySettingsSchema = z.object({
  highContrast: z.boolean().default(false),
  reduceMotion: z.boolean().default(false),
  largerText: z.boolean().default(false),
  keyboardNavigation: z.boolean().default(false),
  screenReaderOptimized: z.boolean().default(false),
  focusIndicators: z.boolean().default(true),
});

export const layoutSettingsSchema = z.object({
  sidebarPosition: z.enum(['left', 'right']).default('left'),
  compactMode: z.boolean().default(false),
  showBreadcrumbs: z.boolean().default(true),
  showFilters: z.boolean().default(true),
  defaultViewType: z.enum(['list', 'grid', 'kanban']).default('list'),
});

export const privacySettingsSchema = z.object({
  behaviorTracking: z.boolean().default(true),
  analyticsOptIn: z.boolean().default(true),
  personalizationOptIn: z.boolean().default(true),
  dataRetentionDays: z.number().min(7).max(730).default(90),
});

// Full preferences schema
export const userPreferencesSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  theme: themeSettingsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  accessibility: accessibilitySettingsSchema.optional(),
  layout: layoutSettingsSchema.optional(),
  privacy: privacySettingsSchema.optional(),
  customPreferences: z.record(z.unknown()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Device schemas
export const userDeviceSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  deviceId: z.string().min(1),
  deviceName: z.string().min(1),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  osName: z.string().optional(),
  osVersion: z.string().optional(),
  browserName: z.string().optional(),
  browserVersion: z.string().optional(),
  isTrusted: z.boolean().default(false),
  lastSeen: z.date().optional(),
  deviceToken: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Sync schemas
export const syncChangeSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  changeType: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  section: z.string(),
  data: z.record(z.unknown()),
  isSynced: z.boolean().default(false),
  syncTimestamp: z.date().optional(),
  createdAt: z.date().optional(),
});

export const syncConflictSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  section: z.string(),
  sourceDeviceId: z.string(),
  targetDeviceId: z.string().optional(),
  sourceValue: z.record(z.unknown()),
  targetValue: z.record(z.unknown()),
  resolutionMethod: z.enum(['timestamp', 'user_preference', 'merge']).optional(),
  resolvedValue: z.record(z.unknown()).optional(),
  isResolved: z.boolean().default(false),
  createdAt: z.date().optional(),
  resolvedAt: z.date().optional(),
});

// Behavior and pattern schemas
export const behaviorLogSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  sessionId: z.string(),
  eventType: z.enum(['click', 'hover', 'focus', 'scroll', 'feature_usage']),
  featureName: z.string().optional(),
  featureCategory: z.string().optional(),
  durationMs: z.number().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().optional(),
});

export const userPatternSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  detectedPatterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    lastDetected: z.date(),
  })).default([]),
  customizationLevel: z.number().min(0).max(1).default(0.5),
  featureRecommendations: z.array(z.object({
    feature: z.string(),
    priority: z.number().min(1).max(5),
    reason: z.string(),
  })).default([]),
  learningData: z.record(z.unknown()).optional(),
  lastUpdated: z.date().optional(),
  createdAt: z.date().optional(),
});

// Notification schema
export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
  notificationType: z.enum(['system', 'feature', 'recommendation', 'alert']),
  priority: z.number().min(1).max(5).default(1),
  channels: z.array(z.enum(['in_app', 'email', 'push'])).default(['in_app']),
  data: z.record(z.unknown()).optional(),
  readAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Widget and dashboard schemas
export const dashboardWidgetSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum([
    'writing_stats',
    'recent_essays',
    'quick_actions',
    'recommendations',
    'calendar',
    'goals_progress',
    'grammar_check',
    'research_links'
  ]),
  title: z.string(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1),
  }),
  settings: z.record(z.unknown()).optional(),
  refreshInterval: z.number().min(0).optional(),
});

export const dashboardLayoutSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  layoutName: z.string(),
  widgets: z.array(dashboardWidgetSchema),
  gridSize: z.object({
    columns: z.number().min(1).max(12),
    rows: z.number().min(1),
  }),
  isDefault: z.boolean().default(false),
  isResponsive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Export types inferred from schemas
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type AccessibilitySettings = z.infer<typeof accessibilitySettingsSchema>;
export type LayoutSettings = z.infer<typeof layoutSettingsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type UserDevice = z.infer<typeof userDeviceSchema>;
export type SyncChange = z.infer<typeof syncChangeSchema>;
export type SyncConflict = z.infer<typeof syncConflictSchema>;
export type BehaviorLog = z.infer<typeof behaviorLogSchema>;
export type UserPattern = z.infer<typeof userPatternSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
