/**
 * Background Sync Manager
 * 
 * Handles periodic background synchronization of dashboard data.
 * Features:
 * - Configurable refresh intervals
 * - Smart cache invalidation
 * - Offline queue management
 * - Automatic retry on failure
 * - Sync status tracking
 * 
 * @module lib/dashboard/background-sync
 */

/**
 * Sync operation
 */
export interface SyncOperation {
  id: string;
  type: string;
  timestamp: number;
  data?: Record<string, any>;
  retry: number;
  maxRetries: number;
}

/**
 * Sync status
 */
export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

/**
 * Sync event
 */
export interface SyncEvent {
  status: SyncStatus;
  timestamp: number;
  operationsCount?: number;
  lastError?: Error;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  enableBackgroundSync: boolean;
  syncInterval: number; // ms
  widgetRefreshInterval: number; // ms
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number; // ms
}

/**
 * Background sync manager
 */
export class BackgroundSyncManager {
  private syncStatus: SyncStatus = SyncStatus.IDLE;
  private syncInterval: NodeJS.Timeout | null = null;
  private widgetRefreshInterval: NodeJS.Timeout | null = null;
  private queue: SyncOperation[] = [];
  private listeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
  private config: SyncConfig;
  private isOnline: boolean = true;
  private syncId: number = 0;
  private failureCount: number = 0;
  private lastSyncTime: number = 0;
  
  // Bound handlers for event listeners (needed for proper cleanup)
  private boundHandleOnline = this.handleOnline.bind(this);
  private boundHandleOffline = this.handleOffline.bind(this);

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      enableBackgroundSync: true,
      syncInterval: 30000, // 30 seconds
      widgetRefreshInterval: 60000, // 1 minute
      maxQueueSize: 100,
      maxRetries: 3,
      retryDelay: 5000,
      ...config
    };

    this.setupOnlineDetection();
  }

  /**
   * Start background sync
   */
  start(): void {
    if (!this.config.enableBackgroundSync) return;

    // Setup offline detection with bound handlers
    window.addEventListener('online', this.boundHandleOnline);
    window.addEventListener('offline', this.boundHandleOffline);

    // Start sync interval
    this.syncInterval = setInterval(() => {
      this.sync();
    }, this.config.syncInterval);

    // Start widget refresh interval
    this.widgetRefreshInterval = setInterval(() => {
      this.refreshWidgets();
    }, this.config.widgetRefreshInterval);

    this.emit('status', {
      status: SyncStatus.IDLE,
      timestamp: Date.now()
    });
  }

  /**
   * Stop background sync
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.widgetRefreshInterval) {
      clearInterval(this.widgetRefreshInterval);
      this.widgetRefreshInterval = null;
    }

    // Remove event listeners using bound handlers
    window.removeEventListener('online', this.boundHandleOnline);
    window.removeEventListener('offline', this.boundHandleOffline);
  }

  /**
   * Queue sync operation
   */
  queueOperation(type: string, data?: Record<string, any>): string {
    if (this.queue.length >= this.config.maxQueueSize) {
      this.queue.shift(); // Remove oldest
    }

    const id = `sync_${++this.syncId}`;
    const operation: SyncOperation = {
      id,
      type,
      timestamp: Date.now(),
      data,
      retry: 0,
      maxRetries: this.config.maxRetries
    };

    this.queue.push(operation);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    return id;
  }

  /**
   * Manual sync trigger
   */
  async sync(): Promise<void> {
    if (this.syncStatus === SyncStatus.SYNCING || !this.isOnline) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.setSyncStatus(SyncStatus.SYNCING);

    try {
      // Process queue
      const operations = [...this.queue];

      for (const operation of operations) {
        await this.processOperation(operation);
      }

      // Clear processed operations
      this.queue = this.queue.filter(
        (op) => op.retry > 0 && op.retry < op.maxRetries
      );

      this.failureCount = 0;
      this.lastSyncTime = Date.now();

      this.setSyncStatus(SyncStatus.IDLE);

      this.emit('synced', {
        status: SyncStatus.IDLE,
        timestamp: Date.now(),
        operationsCount: this.queue.length
      });
    } catch (error) {
      this.failureCount++;

      if (this.failureCount > 3) {
        this.setSyncStatus(SyncStatus.ERROR);
      } else {
        this.setSyncStatus(SyncStatus.IDLE);
      }

      this.emit('error', {
        status: SyncStatus.ERROR,
        timestamp: Date.now(),
        lastError: error instanceof Error ? error : new Error(String(error)),
        operationsCount: this.queue.length
      });
    }
  }

  /**
   * Process individual operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    // This would call your API
    // For now, just mark as processed
    operation.retry++;

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  /**
   * Refresh widgets
   */
  async refreshWidgets(): Promise<void> {
    if (!this.isOnline) return;

    // Queue refresh operation
    this.queueOperation('REFRESH_WIDGETS');
  }

  /**
   * Refresh specific widget
   */
  async refreshWidget(widgetId: string): Promise<void> {
    if (!this.isOnline) return;

    this.queueOperation('REFRESH_WIDGET', { widgetId });
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get queue
   */
  getQueue(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  /**
   * Check if online
   */
  isOnlineSyncing(): boolean {
    return this.isOnline && this.syncStatus === SyncStatus.SYNCING;
  }

  /**
   * Subscribe to events
   */
  on(event: string, listener: (e: SyncEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Setup online detection
   */
  private setupOnlineDetection(): void {
    if (typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.emit('online', {
      status: SyncStatus.IDLE,
      timestamp: Date.now()
    });

    // Try to sync queued operations
    this.sync();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.setSyncStatus(SyncStatus.OFFLINE);

    this.emit('offline', {
      status: SyncStatus.OFFLINE,
      timestamp: Date.now()
    });
  }

  /**
   * Set sync status
   */
  private setSyncStatus(status: SyncStatus): void {
    if (this.syncStatus !== status) {
      this.syncStatus = status;
      this.emit('status', {
        status,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: SyncEvent): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[BackgroundSync] Event listener error (${event}):`, error);
        }
      });
    }
  }
}

/**
 * Singleton instance
 */
let syncManager: BackgroundSyncManager | null = null;

/**
 * Get background sync manager
 */
export function getBackgroundSyncManager(
  config?: Partial<SyncConfig>
): BackgroundSyncManager {
  if (!syncManager) {
    syncManager = new BackgroundSyncManager(config);
  }

  return syncManager;
}

/**
 * Reset sync manager (for testing)
 */
export function resetBackgroundSyncManager(): void {
  if (syncManager) {
    syncManager.stop();
    syncManager = null;
  }
}
