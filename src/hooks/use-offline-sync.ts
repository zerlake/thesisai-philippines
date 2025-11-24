import { useEffect, useRef, useCallback, useState } from "react";

export interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  lastSyncTime?: number;
  syncError?: Error;
}

/**
 * Hook for offline-first functionality with background sync
 * Queues actions when offline, syncs when online
 */
export function useOfflineSync(
  syncFn: (actions: QueuedAction[]) => Promise<void>,
  config?: {
    maxRetries?: number;
    retryDelay?: number;
    persistQueue?: boolean;
  }
) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const queueRef = useRef<Map<string, QueuedAction>>(new Map());
  const syncTimerRef = useRef<NodeJS.Timeout>();

  const defaultConfig = {
    maxRetries: 3,
    retryDelay: 5000,
    persistQueue: true,
    ...config,
  };

  // Load queue from storage
  useEffect(() => {
    if (defaultConfig.persistQueue && typeof window !== "undefined") {
      const stored = localStorage.getItem("sync-queue");
      if (stored) {
        try {
          const queue = JSON.parse(stored) as QueuedAction[];
          queue.forEach((action) => {
            queueRef.current.set(action.id, action);
          });
        } catch (e) {
          console.error("Failed to load sync queue", e);
        }
      }
    }
  }, [defaultConfig.persistQueue]);

  // Persist queue to storage
  const persistQueue = useCallback(() => {
    if (defaultConfig.persistQueue && typeof window !== "undefined") {
      const queue = Array.from(queueRef.current.values());
      localStorage.setItem("sync-queue", JSON.stringify(queue));
    }
  }, [defaultConfig.persistQueue]);

  /**
   * Add action to queue
   */
  const queue = useCallback(
    (type: string, payload: unknown): string => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      const action: QueuedAction = {
        id,
        type,
        payload,
        timestamp: Date.now(),
        retries: 0,
      };

      queueRef.current.set(id, action);
      persistQueue();

      // Try to sync immediately if online
      if (isOnline) {
        sync();
      }

      return id;
    },
    [isOnline, persistQueue]
  );

  /**
   * Sync queued actions with server
   */
  const sync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    const actions = Array.from(queueRef.current.values());
    if (actions.length === 0) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncFn(actions);

      // Clear synced actions
      actions.forEach((action) => {
        queueRef.current.delete(action.id);
      });
      persistQueue();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSyncError(error);

      // Retry failed actions with exponential backoff
      actions.forEach((action) => {
        const existing = queueRef.current.get(action.id);
        if (
          existing &&
          existing.retries < defaultConfig.maxRetries
        ) {
          existing.retries++;
          queueRef.current.set(action.id, existing);
        }
      });
      persistQueue();

      // Schedule retry
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        sync();
      }, defaultConfig.retryDelay * (2 ** Math.min(3, actions[0]?.retries || 0)));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, syncFn, persistQueue, defaultConfig]);

  /**
   * Remove action from queue
   */
  const removeFromQueue = useCallback(
    (id: string) => {
      queueRef.current.delete(id);
      persistQueue();
    },
    [persistQueue]
  );

  /**
   * Clear all queued actions
   */
  const clearQueue = useCallback(() => {
    queueRef.current.clear();
    persistQueue();
  }, [persistQueue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [sync]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(sync, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, [isOnline, sync]);

  return {
    queue,
    sync,
    removeFromQueue,
    clearQueue,
    status: {
      isOnline,
      isSyncing,
      queuedCount: queueRef.current.size,
      syncError,
      lastSyncTime: syncError ? undefined : Date.now(),
    },
  };
}

/**
 * Service Worker registration for background sync
 */
export async function registerBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    console.warn("Service Worker or Background Sync not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/sw.js"
    );

    // Request background sync
    if ("sync" in registration) {
      await (registration as any).sync.register("sync-queue");
    }
  } catch (err) {
    console.error("Failed to register service worker", err);
  }
}

/**
 * Check if device is online (includes more thorough checking)
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch("/api/ping", {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch (err) {
    return navigator.onLine;
  }
}
