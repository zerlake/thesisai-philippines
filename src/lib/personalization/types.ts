/**
 * Personalization & Adaptation System Types
 * Comprehensive type definitions for user preferences, device sync, and adaptive interfaces
 */

// User Preference Models
export interface UserPreferences {
  id: string;
  userId: string;
  layout: LayoutPreferences;
  theme: ThemePreferences;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  dashboard: DashboardPreferences;
  behavior: BehaviorSettings;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface LayoutPreferences {
  sidebarPosition: 'left' | 'right' | 'hidden';
  sidebarWidth: number; // pixels
  compactMode: boolean;
  gridLayout: 'flexible' | 'fixed' | 'masonry';
  cardView: 'grid' | 'list' | 'kanban';
  itemsPerPage: number;
}

export interface ThemePreferences {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'blue' | 'purple' | 'green' | 'custom';
  accentColor: string;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
}

export interface NotificationPreferences {
  enabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  priorityBasedTiming: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  id: string;
  name: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export interface AccessibilityPreferences {
  screenReaderEnabled: boolean;
  keyboardNavigationOnly: boolean;
  reducedAnimations: boolean;
  highContrast: boolean;
  fontSize: number; // percentage
  lineHeight: number; // multiplier
  letterSpacing: number; // pixels
  dyslexiaFriendlyFont: boolean;
  focusIndicatorSize: 'normal' | 'large';
  captions: boolean;
  textToSpeech: boolean;
}

export interface DashboardPreferences {
  widgets: DashboardWidget[];
  layout: 'grid' | 'masonry' | 'flex';
  gridColumns: number;
  enableDragAndDrop: boolean;
  autoArrangeWidgets: boolean;
  compactView: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: number;
  size: 'small' | 'medium' | 'large' | 'full';
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface BehaviorSettings {
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  trackUsagePatterns: boolean;
  learnFromBehavior: boolean;
  predictiveFeatures: boolean;
}

// Cross-Device Synchronization
export interface DeviceInfo {
  id: string;
  userId: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'other';
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  screenWidth: number;
  screenHeight: number;
  lastSyncAt: Date;
  isActive: boolean;
}

export interface SyncConflict {
  id: string;
  resourceId: string;
  resourceType: string;
  deviceId: string;
  otherDeviceId: string;
  localVersion: unknown;
  remoteVersion: unknown;
  timestamp: Date;
  resolved: boolean;
  resolution: 'local' | 'remote' | 'merged';
}

export interface SyncState {
  lastSyncTime: number;
  pendingChanges: SyncChange[];
  conflictedItems: SyncConflict[];
  syncInProgress: boolean;
}

export interface SyncChange {
  id: string;
  resourceId: string;
  resourceType: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  deviceId: string;
}

// Smart Notifications
export interface SmartNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'in-app' | 'email' | 'push' | 'sms';
  scheduledFor: Date;
  sentAt?: Date;
  read: boolean;
  data: Record<string, unknown>;
  mlScore?: number; // ML-based priority score
}

// User Behavior Analytics
export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  timestamp: Date;
  eventType: string;
  eventData: Record<string, unknown>;
  deviceId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  duration?: number; // milliseconds
}

export interface UserPattern {
  id: string;
  userId: string;
  pattern: string;
  frequency: number;
  confidence: number; // 0-1
  suggestedDefaults: Record<string, unknown>;
  lastDetectedAt: Date;
}

// Adaptive Interface
export interface AdaptiveInterface {
  showAdvancedOptions: boolean;
  suggestedActions: SuggestedAction[];
  customizationLevel: 'beginner' | 'intermediate' | 'advanced';
  featureDiscoveryShown: string[]; // IDs of shown features
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  action: string;
  confidence: number; // ML confidence score
  contextual: boolean;
}

// Preference Inheritance
export interface PreferenceInheritance {
  accessibilitySettings: AccessibilityPreferences;
  inheritAcrossDevices: boolean;
  inheritAcrossSessions: boolean;
  lastInheritedAt: Date;
  overriddenSettings: string[]; // Setting IDs that user overrode
}

export interface PreferenceUpdate {
  key: string;
  value: unknown;
  timestamp: Date;
  deviceId: string;
  syncRequired: boolean;
}
