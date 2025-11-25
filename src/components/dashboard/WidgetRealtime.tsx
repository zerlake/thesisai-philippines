/**
 * WidgetRealtime Component
 * 
 * High-order component that wraps dashboard widgets to add
 * real-time synchronization capabilities.
 * 
 * @component
 */

'use client';

import React, { ReactNode, useMemo } from 'react';
import { useWidgetRealtime, WidgetUpdatePayload } from '@/hooks/useWidgetRealtime';

interface WidgetRealtimeProps {
  widgetId: string;
  children: ReactNode;
  onUpdate?: (payload: WidgetUpdatePayload) => void;
  onError?: (error: Error) => void;
  showSyncStatus?: boolean;
}

/**
 * WidgetRealtime Component
 * 
 * Wraps widgets with real-time update capabilities.
 * Automatically syncs widget data with backend.
 * 
 * Usage:
 * ```tsx
 * <WidgetRealtime widgetId="writing-stats" onUpdate={handleUpdate}>
 *   <MyWidget />
 * </WidgetRealtime>
 * ```
 */
export function WidgetRealtime({
  widgetId,
  children,
  onUpdate,
  onError,
  showSyncStatus = false
}: WidgetRealtimeProps) {
  const {
    isConnected,
    refresh,
    activeSubscriptions
  } = useWidgetRealtime({
    widgetId,
    onUpdate,
    onError,
    autoSubscribe: true
  });

  const isSynced = useMemo(
    () => activeSubscriptions.includes(widgetId),
    [activeSubscriptions, widgetId]
  );

  return (
    <div data-widget-id={widgetId} data-synced={isSynced} className="relative">
      {/* Sync status badge (optional) */}
      {showSyncStatus && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Synced' : 'Syncing...'}
            </span>
          </div>
        </div>
      )}

      {/* Widget content */}
      {children}

      {/* Refresh button (optional) */}
      {isConnected && (
        <button
          onClick={refresh}
          className="sr-only"
          aria-label={`Refresh ${widgetId}`}
        >
          Refresh
        </button>
      )}
    </div>
  );
}

export default WidgetRealtime;
