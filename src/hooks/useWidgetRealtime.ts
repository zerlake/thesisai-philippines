/**
 * useWidgetRealtime Hook
 * 
 * Provides real-time update capabilities for dashboard widgets.
 * Manages widget-specific state updates from WebSocket messages.
 * 
 * @hook
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRealtimeManagers } from '@/components/dashboard/DashboardRealtimeProvider';
import { MessageType } from '@/lib/dashboard/websocket-manager';

export interface WidgetUpdatePayload {
  widgetId: string;
  type: 'update' | 'refresh' | 'error';
  data?: Record<string, any>;
  error?: string;
  timestamp: number;
}

interface UseWidgetRealtimeOptions {
  widgetId: string;
  onUpdate?: (payload: WidgetUpdatePayload) => void;
  onError?: (error: Error) => void;
  autoSubscribe?: boolean;
}

/**
 * Hook for real-time widget updates
 * 
 * Usage:
 * ```ts
 * const { isConnected, lastUpdate, subscribe, unsubscribe } = useWidgetRealtime({
 *   widgetId: 'writing-stats',
 *   onUpdate: (payload) => {
 *     setStats(payload.data);
 *   }
 * });
 * ```
 */
export function useWidgetRealtime({
  widgetId,
  onUpdate,
  onError,
  autoSubscribe = true
}: UseWidgetRealtimeOptions) {
  const { wsManager, stateManager } = useRealtimeManagers();
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Unsubscribe from widget updates
  const unsubscribe = useCallback(() => {
    if (!unsubscribeRef.current) return;
    unsubscribeRef.current();
    unsubscribeRef.current = null;
    subscriptionsRef.current.delete(widgetId);
  }, [widgetId]);

  // Subscribe to widget updates
  const subscribe = useCallback(() => {
    if (!wsManager) return;

    const handler = (message: any) => {
      // Check if message is for this widget
      if (message.widgetId === widgetId || message.type === 'broadcast') {
        const payload: WidgetUpdatePayload = {
          widgetId,
          type: message.type || 'update',
          data: message.data,
          timestamp: Date.now()
        };

        onUpdate?.(payload);
      }
    };

    unsubscribeRef.current = wsManager.on('message', handler);
    subscriptionsRef.current.add(widgetId);

    return unsubscribe;
  }, [wsManager, widgetId, onUpdate, unsubscribe]);

  // Request widget refresh
  const refresh = useCallback(async () => {
    if (!wsManager) {
      onError?.(new Error('WebSocket not connected'));
      return;
    }

    try {
      wsManager.send(MessageType.WIDGET_LOAD, {
        widgetId,
        timestamp: Date.now()
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [wsManager, widgetId, onError]);

  // Get widget state from state manager
  const getWidgetState = useCallback(() => {
    if (!stateManager) return null;
    return stateManager.getStateValue(`widget.${widgetId}`);
  }, [stateManager, widgetId]);

  // Update widget state locally
  const updateWidgetState = useCallback((data: Record<string, any>) => {
    if (!stateManager) return;
    stateManager.applyOptimisticUpdate(`widget-update:${widgetId}`, data);
  }, [stateManager, widgetId]);

  // Auto-subscribe on mount
  useEffect(() => {
    if (autoSubscribe) {
      subscribe();
    }

    return () => {
      if (autoSubscribe) {
        unsubscribe();
      }
    };
  }, [autoSubscribe, subscribe, unsubscribe]);

  return {
    isConnected: wsManager?.isConnected() ?? false,
    lastUpdate: Date.now(),
    subscribe,
    unsubscribe,
    refresh,
    getWidgetState,
    updateWidgetState,
    activeSubscriptions: Array.from(subscriptionsRef.current)
  };
}

export default useWidgetRealtime;
