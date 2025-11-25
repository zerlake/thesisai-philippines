/**
 * Real-time Configuration
 * 
 * Configuration constants and settings for real-time features.
 * 
 * @module lib/dashboard/realtime-config
 */

/**
 * WebSocket configuration
 */
export const WEBSOCKET_CONFIG = {
  // Server URL (can be overridden by env var)
  URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws',

  // Connection settings
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000, // ms
  RECONNECT_BACKOFF_MULTIPLIER: 2,
  
  // Heartbeat settings
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  HEARTBEAT_TIMEOUT: 5000, // 5 seconds
  
  // Message settings
  MESSAGE_TIMEOUT: 10000, // 10 seconds
  MESSAGE_BATCH_SIZE: 50,
  MESSAGE_BATCH_DELAY: 100, // ms
} as const;

/**
 * Real-time state configuration
 */
export const REALTIME_STATE_CONFIG = {
  // Optimistic update settings
  OPTIMISTIC_UPDATE_TIMEOUT: 30000, // 30 seconds
  MAX_PENDING_OPERATIONS: 100,
  
  // Conflict resolution
  CONFLICT_RESOLUTION_STRATEGY: 'REMOTE_WINS', // or 'LOCAL_WINS', 'MANUAL'
  CONFLICT_RETENTION_TIME: 60000, // 1 minute
  
  // State synchronization
  SYNC_INTERVAL: 60000, // 1 minute
  SYNC_TIMEOUT: 10000, // 10 seconds
} as const;

/**
 * Background sync configuration
 */
export const BACKGROUND_SYNC_CONFIG = {
  // Enable/disable
  ENABLED: true,
  
  // Sync intervals
  SYNC_INTERVAL: 30000, // 30 seconds
  WIDGET_REFRESH_INTERVAL: 60000, // 1 minute
  
  // Queue settings
  MAX_QUEUE_SIZE: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Polling settings
  POLL_INTERVAL: 60000, // 1 minute
  POLL_TIMEOUT: 10000, // 10 seconds
  
  // Cache invalidation
  CACHE_TTL: 300000, // 5 minutes
  CACHE_INVALIDATE_ON_ERROR: true,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // Update latency
  SLOW_UPDATE_THRESHOLD: 1000, // ms
  VERY_SLOW_UPDATE_THRESHOLD: 5000, // ms
  
  // Sync performance
  SLOW_SYNC_THRESHOLD: 5000, // ms
  VERY_SLOW_SYNC_THRESHOLD: 10000, // ms
  
  // Message processing
  SLOW_MESSAGE_THRESHOLD: 100, // ms
  
  // Memory
  MEMORY_WARNING_THRESHOLD: 50 * 1024 * 1024, // 50MB
  MEMORY_CRITICAL_THRESHOLD: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  // Real-time updates
  ENABLE_WEBSOCKET: true,
  ENABLE_OPTIMISTIC_UPDATES: true,
  ENABLE_BACKGROUND_SYNC: true,
  
  // Conflict resolution
  ENABLE_CONFLICT_DETECTION: true,
  ENABLE_CONFLICT_RESOLUTION: true,
  SHOW_CONFLICT_UI: true,
  
  // Performance monitoring
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_MEMORY_MONITORING: true,
  LOG_SLOW_UPDATES: true,
  
  // Debugging
  DEBUG_WEBSOCKET: false,
  DEBUG_REALTIME_STATE: false,
  DEBUG_BACKGROUND_SYNC: false,
  DEBUG_MESSAGES: false,
} as const;

/**
 * Message types
 */
export enum RealtimeMessageType {
  // Connection
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  PING = 'PING',
  PONG = 'PONG',
  
  // Dashboard updates
  DASHBOARD_UPDATE = 'DASHBOARD_UPDATE',
  DASHBOARD_STATE = 'DASHBOARD_STATE',
  
  // Widget updates
  WIDGET_UPDATE = 'WIDGET_UPDATE',
  WIDGET_LOAD = 'WIDGET_LOAD',
  WIDGET_ERROR = 'WIDGET_ERROR',
  
  // Layout changes
  LAYOUT_CHANGE = 'LAYOUT_CHANGE',
  LAYOUT_REORDER = 'LAYOUT_REORDER',
  
  // Sync operations
  SYNC_REQUEST = 'SYNC_REQUEST',
  SYNC_RESPONSE = 'SYNC_RESPONSE',
  SYNC_BATCH = 'SYNC_BATCH',
  
  // Server events
  SERVER_BROADCAST = 'SERVER_BROADCAST',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVER_INFO = 'SERVER_INFO',
}

/**
 * Batch update config
 */
export const BATCH_UPDATE_CONFIG = {
  // Debouncing
  DEBOUNCE_DELAY: 100, // ms
  DEBOUNCE_IMMEDIATE: false,
  
  // Batching
  BATCH_SIZE: 50,
  BATCH_DELAY: 200, // ms
  
  // Deduplication
  DEDUPLICATE: true,
  DEDUP_WINDOW: 1000, // ms
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache sizes
  MAX_CACHE_SIZE: 100,
  MAX_WIDGET_CACHE_SIZE: 1000,
  
  // TTL (time to live)
  WIDGET_CACHE_TTL: 300000, // 5 minutes
  LAYOUT_CACHE_TTL: 600000, // 10 minutes
  STATE_CACHE_TTL: 60000, // 1 minute
  
  // Cache strategies
  CACHE_STRATEGY: 'LRU', // Least Recently Used
} as const;

/**
 * Error handling config
 */
export const ERROR_HANDLING_CONFIG = {
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  RETRY_BACKOFF: 2,
  
  // Timeout settings
  CONNECTION_TIMEOUT: 10000, // ms
  OPERATION_TIMEOUT: 30000, // ms
  SYNC_TIMEOUT: 10000, // ms
  
  // Error recovery
  AUTO_RECONNECT: true,
  AUTO_RETRY: true,
  ROLLBACK_ON_ERROR: true,
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  // Indicators
  SHOW_SYNC_INDICATOR: true,
  SHOW_PENDING_BADGE: true,
  SHOW_CONFLICT_UI: true,
  
  // Animations
  ANIMATE_OPTIMISTIC_UPDATES: true,
  TRANSITION_DURATION: 300, // ms
  
  // Toast notifications
  SHOW_SYNC_NOTIFICATIONS: true,
  SHOW_ERROR_NOTIFICATIONS: true,
  NOTIFICATION_DURATION: 5000, // ms
} as const;

/**
 * Get configuration value with optional override
 */
export function getConfig<T>(
  path: string,
  defaultValue?: T
): T {
  const segments = path.split('.');
  
  const configs = {
    websocket: WEBSOCKET_CONFIG,
    realtimeState: REALTIME_STATE_CONFIG,
    backgroundSync: BACKGROUND_SYNC_CONFIG,
    performance: PERFORMANCE_THRESHOLDS,
    features: FEATURE_FLAGS,
    batch: BATCH_UPDATE_CONFIG,
    cache: CACHE_CONFIG,
    error: ERROR_HANDLING_CONFIG,
    ui: UI_CONFIG,
  };

  let current: any = configs;

  for (const segment of segments) {
    current = current?.[segment];
    if (current === undefined) {
      return defaultValue as T;
    }
  }

  return current as T;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Get environment-specific config
 */
export function getEnvironmentConfig() {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    isDev,
    isProd,
    isTest,
    debug: isDev && FEATURE_FLAGS.DEBUG_WEBSOCKET,
    logErrors: isDev || FEATURE_FLAGS.DEBUG_WEBSOCKET,
    performance: {
      monitoringEnabled: isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING'),
      slowThreshold: isProd ? 1000 : 500,
    }
  };
}
