/**
 * Dashboard Sync Status Indicator Component
 * 
 * Displays real-time synchronization status:
 * - Connected/Disconnected state
 * - Pending operations count
 * - Sync progress
 * - Error states
 * 
 * @component
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { SyncStatus as BackgroundSyncStatus } from '@/lib/dashboard/background-sync';

interface DashboardSyncIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onStatusChange?: (status: SyncStatus) => void;
}

export interface SyncStatus {
  isConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime?: Date;
  error?: string;
  queueSize: number;
}

/**
 * DashboardSyncIndicator Component
 * 
 * Shows a status indicator with color-coded connection state
 * and optional detailed status information
 */
export function DashboardSyncIndicator({
  className = '',
  showDetails = false,
  onStatusChange
}: DashboardSyncIndicatorProps) {
  const [wsError, setWsError] = useState<Error | null>(null);
  const { isConnected } = useWebSocket({
    autoConnect: true,
    onError: (error) => setWsError(error)
  });
  const { pending } = useRealtimeUpdates(undefined);
  const { status: syncStatus, queueSize } = useBackgroundSync({ autoStart: true });
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    pendingCount: 0,
    isSyncing: false,
    queueSize: 0
  });

  // Update status whenever any value changes
  useEffect(() => {
    const newStatus: SyncStatus = {
      isConnected,
      pendingCount: pending?.length || 0,
      isSyncing: syncStatus === BackgroundSyncStatus.SYNCING,
      lastSyncTime: new Date(),
      queueSize,
      error: wsError?.message
    };
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [isConnected, pending, syncStatus, queueSize, wsError, onStatusChange]);

  // Determine indicator color
  const getIndicatorColor = () => {
    if (wsError) return 'bg-red-500';
    if (!isConnected) return 'bg-yellow-500';
    if (status.pendingCount > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Determine status text
  const getStatusText = () => {
    if (wsError) return 'Connection Error';
    if (!isConnected) return 'Disconnected';
    if (status.pendingCount > 0) return `Syncing (${status.pendingCount})`;
    if (syncStatus === BackgroundSyncStatus.SYNCING) return 'Syncing Data';
    return 'Synced';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${getIndicatorColor()} animate-pulse`}
          role="status"
          aria-label={getStatusText()}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
      </div>

      {/* Pending Badge */}
      {status.pendingCount > 0 && (
        <div className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-semibold text-blue-700 dark:text-blue-100">
          {status.pendingCount} pending
        </div>
      )}

      {/* Queue Size Badge */}
      {status.queueSize > 0 && (
        <div className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs font-semibold text-purple-700 dark:text-purple-100">
          {status.queueSize} queued
        </div>
      )}

      {/* Detailed Status (if enabled) */}
      {showDetails && (
        <details className="ml-4 text-xs text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
            Details
          </summary>
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded space-y-1">
            <p>Status: {status.isConnected ? 'Connected' : 'Disconnected'}</p>
            <p>Pending: {status.pendingCount}</p>
            <p>Queued: {status.queueSize}</p>
            <p>Syncing: {status.isSyncing ? 'Yes' : 'No'}</p>
            {status.lastSyncTime && (
              <p>Last Sync: {status.lastSyncTime.toLocaleTimeString()}</p>
            )}
            {status.error && (
              <p className="text-red-600 dark:text-red-400">Error: {status.error}</p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

export default DashboardSyncIndicator;
