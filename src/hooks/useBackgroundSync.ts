/**
 * useBackgroundSync Hook
 * 
 * React hook for background synchronization.
 * Features:
 * - Automatic periodic sync
 * - Offline queue management
 * - Sync status tracking
 * - Error handling and retry
 * 
 * @module hooks/useBackgroundSync
 */

'use client';

import {
  useEffect,
  useRef,
  useCallback,
  useState
} from 'react';
import {
  BackgroundSyncManager,
  SyncStatus,
  SyncEvent,
  SyncConfig,
  getBackgroundSyncManager
} from '@/lib/dashboard/background-sync';

/**
 * useBackgroundSync Hook Options
 */
interface UseBackgroundSyncOptions {
  config?: Partial<SyncConfig>;
  autoStart?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
  onOnline?: () => void;
  onOffline?: () => void;
  onStatusChange?: (status: SyncStatus) => void;
}

/**
 * useBackgroundSync Hook Return
 */
interface UseBackgroundSyncReturn {
  status: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: number;
  queueOperation: (type: string, data?: Record<string, any>) => string;
  refresh: () => Promise<void>;
  refreshWidget: (widgetId: string) => Promise<void>;
  clearQueue: () => void;
  start: () => void;
  stop: () => void;
  sync: () => Promise<void>;
  manager: BackgroundSyncManager;
}

/**
 * useBackgroundSync Hook
 * 
 * Manage background synchronization of dashboard data.
 * 
 * @example
 * ```typescript
 * const {
 *   status,
 *   isOnline,
 *   queueSize,
 *   refresh,
 *   refreshWidget
 * } = useBackgroundSync({
 *   autoStart: true,
 *   onSync: () => console.log('Synced!'),
 *   onError: (error) => console.error('Sync error:', error)
 * });
 * 
 * // Manual refresh
 * const handleRefresh = async () => {
 *   await refresh();
 * };
 * 
 * // Refresh specific widget
 * const handleRefreshWidget = async () => {
 *   await refreshWidget('widget-1');
 * };
 * ```
 */
export function useBackgroundSync(
  options: UseBackgroundSyncOptions = {}
): UseBackgroundSyncReturn {
  const {
    config,
    autoStart = true,
    onSync,
    onError,
    onOnline,
    onOffline,
    onStatusChange
  } = options;

  const managerRef = useRef<BackgroundSyncManager>(
    getBackgroundSyncManager(config)
  );

  const [status, setStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueSize, setQueueSize] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  // Setup event listeners
  useEffect(() => {
    const manager = managerRef.current;

    // Status change listener
    const unsubscribeStatus = manager.on('status', (event: SyncEvent) => {
      setStatus(event.status);
      onStatusChange?.(event.status);
    });

    // Sync listener
    const unsubscribeSync = manager.on('synced', (event: SyncEvent) => {
      setQueueSize(event.operationsCount || 0);
      setLastSyncTime(event.timestamp);
      onSync?.();
    });

    // Error listener
    const unsubscribeError = manager.on('error', (event: SyncEvent) => {
      onError?.(event.lastError || new Error('Sync error'));
    });

    // Online listener
    const unsubscribeOnline = manager.on('online', (event: SyncEvent) => {
      setIsOnline(true);
      onOnline?.();
    });

    // Offline listener
    const unsubscribeOffline = manager.on('offline', (event: SyncEvent) => {
      setIsOnline(false);
      onOffline?.();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSync();
      unsubscribeError();
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [onSync, onError, onOnline, onOffline, onStatusChange]);

  // Auto-start sync
  useEffect(() => {
    if (autoStart) {
      const manager = managerRef.current;
      manager.start();

      return () => {
        // Keep running, don't stop on unmount
      };
    }
  }, [autoStart]);

  /**
   * Queue operation
   */
  const queueOperation = useCallback(
    (type: string, data?: Record<string, any>): string => {
      return managerRef.current.queueOperation(type, data);
    },
    []
  );

  /**
   * Refresh all widgets
   */
  const refresh = useCallback(async () => {
    return managerRef.current.refreshWidgets();
  }, []);

  /**
   * Refresh specific widget
   */
  const refreshWidget = useCallback(
    async (widgetId: string) => {
      return managerRef.current.refreshWidget(widgetId);
    },
    []
  );

  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
    managerRef.current.clearQueue();
    setQueueSize(0);
  }, []);

  /**
   * Start sync
   */
  const start = useCallback(() => {
    managerRef.current.start();
  }, []);

  /**
   * Stop sync
   */
  const stop = useCallback(() => {
    managerRef.current.stop();
  }, []);

  /**
   * Manual sync
   */
  const sync = useCallback(async () => {
    return managerRef.current.sync();
  }, []);

  return {
    status,
    isOnline,
    isSyncing: status === SyncStatus.SYNCING,
    queueSize,
    lastSyncTime,
    queueOperation,
    refresh,
    refreshWidget,
    clearQueue,
    start,
    stop,
    sync,
    manager: managerRef.current
  };
}

/**
 * useSyncStatus Hook
 * 
 * Track background sync status.
 * 
 * @example
 * ```typescript
 * const { status, isOnline, isSyncing } = useSyncStatus();
 * 
 * return (
 *   <div>
 *     Status: {status}
 *     Online: {isOnline ? 'Yes' : 'No'}
 *     Syncing: {isSyncing ? 'Yes' : 'No'}
 *   </div>
 * );
 * ```
 */
export function useSyncStatus() {
  const { status, isOnline, isSyncing } = useBackgroundSync({ autoStart: true });

  return { status, isOnline, isSyncing };
}

/**
 * useOfflineQueue Hook
 * 
 * Manage offline queue operations.
 * 
 * @example
 * ```typescript
 * const {
 *   queue,
 *   queueSize,
 *   addToQueue,
 *   clearQueue,
 *   syncQueue
 * } = useOfflineQueue();
 * 
 * const handleOfflineUpdate = () => {
 *   addToQueue('WIDGET_UPDATE', { id: 'w-1', value: 42 });
 * };
 * ```
 */
export function useOfflineQueue() {
  const {
    queueSize,
    queueOperation,
    clearQueue,
    sync
  } = useBackgroundSync({ autoStart: true });

  const managerRef = useRef(getBackgroundSyncManager());
  const [queue, setQueue] = useState(() => managerRef.current.getQueue());

  // Update queue when it changes
  useEffect(() => {
    const updateQueue = () => {
      setQueue(managerRef.current.getQueue());
    };

    const manager = managerRef.current;
    
    // Poll queue updates
    const interval = setInterval(updateQueue, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToQueue = useCallback(
    (type: string, data?: Record<string, any>) => {
      return queueOperation(type, data);
    },
    [queueOperation]
  );

  return {
    queue,
    queueSize,
    addToQueue,
    clearQueue,
    syncQueue: sync
  };
}

/**
 * usePeriodicRefresh Hook
 * 
 * Automatically refresh data at intervals.
 * 
 * @example
 * ```typescript
 * const { isRefreshing, refresh } = usePeriodicRefresh({
 *   interval: 60000, // 1 minute
 *   onRefresh: () => console.log('Refreshed!')
 * });
 * 
 * // Trigger manual refresh
 * const handleRefresh = async () => {
 *   await refresh();
 * };
 * ```
 */
export function usePeriodicRefresh(options: {
  interval?: number;
  enabled?: boolean;
  onRefresh?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const {
    interval = 60000,
    enabled = true,
    onRefresh,
    onError
  } = options;

  const { refresh } = useBackgroundSync({
    autoStart: true,
    onSync: onRefresh,
    onError
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Setup periodic refresh
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(async () => {
      setIsRefreshing(true);

      try {
        await refresh();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      } finally {
        setIsRefreshing(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [interval, enabled, refresh, onError]);

  const manualRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refresh();
      onRefresh?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, onRefresh, onError]);

  return {
    isRefreshing,
    refresh: manualRefresh
  };
}
