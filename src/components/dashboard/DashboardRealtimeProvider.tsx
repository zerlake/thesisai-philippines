/**
 * Dashboard Realtime Provider
 * 
 * Context provider that wraps dashboard and initializes all
 * real-time update systems (WebSocket, state management, sync).
 * 
 * @component
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { WebSocketManager, MessageType } from '@/lib/dashboard/websocket-manager';
import { RealtimeStateManager } from '@/lib/dashboard/realtime-state';
import { BackgroundSyncManager } from '@/lib/dashboard/background-sync';
import { UpdateProcessor } from '@/lib/dashboard/update-processor';
import {
  WEBSOCKET_CONFIG,
  REALTIME_STATE_CONFIG,
  BACKGROUND_SYNC_CONFIG
} from '@/lib/dashboard/realtime-config';

/**
 * Realtime Managers Context
 */
interface RealtimeContextType {
  wsManager: WebSocketManager | null;
  stateManager: RealtimeStateManager | null;
  syncManager: BackgroundSyncManager | null;
  updateProcessor: UpdateProcessor | null;
  isInitialized: boolean;
  error?: Error;
}

const RealtimeContext = createContext<RealtimeContextType>({
  wsManager: null,
  stateManager: null,
  syncManager: null,
  updateProcessor: null,
  isInitialized: false
});

/**
 * Hook to use realtime managers from context
 */
export function useRealtimeManagers(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeManagers must be used within DashboardRealtimeProvider');
  }
  return context;
}

interface DashboardRealtimeProviderProps {
  children: ReactNode;
  wsUrl?: string;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
  onInitialized?: () => void;
}

/**
 * DashboardRealtimeProvider Component
 * 
 * Initializes all realtime systems and provides them to children
 * via context. Handles connection lifecycle and error recovery.
 */
export function DashboardRealtimeProvider({
  children,
  wsUrl,
  autoConnect = true,
  onError,
  onInitialized
}: DashboardRealtimeProviderProps) {
  const [context, setContext] = React.useState<RealtimeContextType>({
    wsManager: null,
    stateManager: null,
    syncManager: null,
    updateProcessor: null,
    isInitialized: false
  });

  const managersRef = useRef<{
    ws?: WebSocketManager;
    state?: RealtimeStateManager;
    sync?: BackgroundSyncManager;
    update?: UpdateProcessor;
  }>({});

  // Initialize managers on mount
  useEffect(() => {
    const initializeManagers = async () => {
      try {
        // Create WebSocket Manager
        const wsManager = new WebSocketManager(
          wsUrl || (typeof window !== 'undefined'
            ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/realtime`
            : 'ws://localhost:3000/api/realtime'),
          WEBSOCKET_CONFIG as any
        );

        // Create State Manager
        const stateManager = new RealtimeStateManager();

        // Create Update Processor
        const updateProcessor = new UpdateProcessor();

        // Create Background Sync Manager
        const syncManager = new BackgroundSyncManager({
          enableBackgroundSync: BACKGROUND_SYNC_CONFIG.ENABLED,
          syncInterval: BACKGROUND_SYNC_CONFIG.SYNC_INTERVAL,
          widgetRefreshInterval: BACKGROUND_SYNC_CONFIG.WIDGET_REFRESH_INTERVAL,
          maxQueueSize: BACKGROUND_SYNC_CONFIG.MAX_QUEUE_SIZE,
          maxRetries: BACKGROUND_SYNC_CONFIG.MAX_RETRIES,
          retryDelay: BACKGROUND_SYNC_CONFIG.RETRY_DELAY,
        });

        // Wire up event listeners
        // Subscribe to all message types that should trigger updates
        const unsubscribeWidgetUpdate = wsManager.subscribe(MessageType.WIDGET_UPDATE, (message) => {
          if (message.data) {
            stateManager.applyRemoteUpdate(message.type, message.data);
          }
          updateProcessor.add({
            id: message.id || `msg_${Date.now()}`,
            type: message.type,
            data: message.data || {},
            timestamp: message.timestamp
          });
        });
        const unsubscribeDashboardUpdate = wsManager.subscribe(MessageType.DASHBOARD_UPDATE, (message) => {
          if (message.data) {
            stateManager.applyRemoteUpdate(message.type, message.data);
          }
          updateProcessor.add({
            id: message.id || `msg_${Date.now()}`,
            type: message.type,
            data: message.data || {},
            timestamp: message.timestamp
          });
        });
        const unsubscribeSyncResponse = wsManager.subscribe(MessageType.SYNC_RESPONSE, (message) => {
          if (message.data) {
            stateManager.applyRemoteUpdate(message.type, message.data);
          }
          updateProcessor.add({
            id: message.id || `msg_${Date.now()}`,
            type: message.type,
            data: message.data || {},
            timestamp: message.timestamp
          });
        });

        const unsubscribeConnected = wsManager.on('connected', () => {
          syncManager.start();
        });

        const unsubscribeDisconnected = wsManager.on('disconnected', () => {
          syncManager.stop();
        });

        const unsubscribeConflict = stateManager.subscribe('conflict', (conflict) => {
          console.warn('State conflict detected:', conflict);
        });

        // Store references
        managersRef.current = {
          ws: wsManager,
          state: stateManager,
          sync: syncManager,
          update: updateProcessor
        };

        // Update context
        setContext({
          wsManager,
          stateManager,
          syncManager,
          updateProcessor,
          isInitialized: true
        });

        // Auto-connect if enabled
        if (autoConnect) {
          await wsManager.connect();
        }

        onInitialized?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setContext(prev => ({ ...prev, error: err }));
        onError?.(err);
        console.error('Failed to initialize realtime managers:', err);
      }
    };

    initializeManagers();

    // Cleanup on unmount
    return () => {
      // Unsubscribe from all event listeners
      unsubscribeWidgetUpdate?.();
      unsubscribeDashboardUpdate?.();
      unsubscribeSyncResponse?.();
      unsubscribeConnected?.();
      unsubscribeDisconnected?.();
      unsubscribeConflict?.();
      
      if (managersRef.current.ws) {
        managersRef.current.ws?.disconnect?.();
      }
      if (managersRef.current.sync) {
        managersRef.current.sync?.stop?.();
      }
    };
  }, [wsUrl, autoConnect, onError, onInitialized]);

  return (
    <RealtimeContext.Provider value={context}>
      {children}
    </RealtimeContext.Provider>
  );
}

export default DashboardRealtimeProvider;
