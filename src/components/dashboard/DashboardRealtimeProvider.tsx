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
  const contextRef = useRef<RealtimeContextType>({
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

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Initialize managers on mount
  useEffect(() => {
    // Don't proceed if managers are already initialized
    if (managersRef.current.ws) return;

    // Declare unsubscribe refs in outer scope for cleanup
    let unsubscribeWidgetUpdate: (() => void) | undefined;
    let unsubscribeDashboardUpdate: (() => void) | undefined;
    let unsubscribeSyncResponse: (() => void) | undefined;
    let unsubscribeConnected: (() => void) | undefined;
    let unsubscribeDisconnected: (() => void) | undefined;
    let unsubscribeConflict: (() => void) | undefined;

            const initializeManagers = async () => {
              try {
                let actualWsUrl = wsUrl;
    
                // If wsUrl is not provided, fetch it from the API
                if (!actualWsUrl) {
                  const response = await fetch('/api/realtime');
                  if (!response.ok) {
                    throw new Error(`Failed to fetch WebSocket URL: ${response.statusText}`);
                  }
                  const data = await response.json();
                  actualWsUrl = data.wsUrl;
                }
    
                // Create WebSocket Manager
                const wsManager = new WebSocketManager(
                  actualWsUrl || 'ws://localhost:3000/realtime', // Fallback to /realtime if API fails or wsUrl is empty
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
        unsubscribeWidgetUpdate = wsManager.subscribe(MessageType.WIDGET_UPDATE, (message) => {
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
        unsubscribeDashboardUpdate = wsManager.subscribe(MessageType.DASHBOARD_UPDATE, (message) => {
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
        unsubscribeSyncResponse = wsManager.subscribe(MessageType.SYNC_RESPONSE, (message) => {
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

        unsubscribeConnected = wsManager.on('connected', () => {
          syncManager.start();
        });

        unsubscribeDisconnected = wsManager.on('disconnected', () => {
          syncManager.stop();
        });

        unsubscribeConflict = stateManager.subscribe('conflict', (conflict) => {
          console.warn('State conflict detected:', conflict);
        });

        // Store references to prevent recreation
        managersRef.current = {
          ws: wsManager,
          state: stateManager,
          sync: syncManager,
          update: updateProcessor
        };

        // Auto-connect if enabled
        if (autoConnect) {
          await wsManager.connect();
        }
        
        // Update context ref AFTER successful connection
        contextRef.current = {
          wsManager,
          stateManager,
          syncManager,
          updateProcessor,
          isInitialized: true // Set to true only after successful connection
        };

        // Force a re-render to update the context
        forceUpdate();

        onInitialized?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        // Update error in context
        contextRef.current = {
          ...contextRef.current,
          error: err,
          isInitialized: contextRef.current.isInitialized
        };
        onError?.(err);
        forceUpdate(); // Trigger re-render to show error
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

      // Disconnect managers
      managersRef.current.ws?.disconnect();
      managersRef.current.sync?.stop();
    };
  }, [wsUrl, autoConnect, onError, onInitialized]); // Only re-run if these props change

  // Return context value from ref
  return (
    <RealtimeContext.Provider value={contextRef.current}>
      {children}
    </RealtimeContext.Provider>
  );
}

export default DashboardRealtimeProvider;
