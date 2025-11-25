/**
 * Pending Operations Badge Component
 * 
 * Displays count of pending operations awaiting server confirmation.
 * Shows operation details on hover.
 * 
 * @component
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface PendingOperationsBadgeProps {
  className?: string;
  showDetails?: boolean;
  maxDisplay?: number;
  onOperationComplete?: (operationId: string) => void;
  onOperationFail?: (operationId: string, error: Error) => void;
}

interface PendingOperation {
  id: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'retrying' | 'failed';
  retryCount?: number;
  error?: string;
}

/**
 * PendingOperationsBadge Component
 * 
 * Shows badge with count of pending operations and optionally
 * displays a list of pending operations with their status
 */
export function PendingOperationsBadge({
  className = '',
  showDetails = true,
  maxDisplay = 5,
  onOperationComplete,
  onOperationFail
}: PendingOperationsBadgeProps) {
  const { pending = [], rollback } = useRealtimeUpdates(undefined);
  const [displayOperations, setDisplayOperations] = useState<PendingOperation[]>([]);

  // Convert pending operations to display format
  useEffect(() => {
    if (pending) {
      const operations = Array.isArray(pending)
        ? pending.map((op: any, index: number) => ({
            id: op.id || `op-${index}`,
            type: op.type || 'unknown',
            timestamp: op.timestamp || new Date(),
            status: op.status || 'pending',
            retryCount: op.retryCount || 0,
            error: op.error?.message
          }))
        : [];
      setDisplayOperations(operations.slice(0, maxDisplay));
    }
  }, [pending, maxDisplay]);

  if (!displayOperations || displayOperations.length === 0) {
    return null;
  }

  const count = displayOperations.length;
  const failedCount = displayOperations.filter(op => op.status === 'failed').length;
  const retryingCount = displayOperations.filter(op => op.status === 'retrying').length;

  return (
    <div className={className}>
      {/* Main Badge */}
      <div className="relative inline-block">
        <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
          <span>⏳ {count} Pending</span>
          {failedCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 rounded-full text-xs">
              {failedCount} failed
            </span>
          )}
          {retryingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-yellow-500 rounded-full text-xs">
              {retryingCount} retrying
            </span>
          )}
        </div>

        {/* Details Dropdown */}
        {showDetails && (
          <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Pending Operations ({count})
              </h3>

              {/* Operation List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {displayOperations.map(op => (
                  <div
                    key={op.id}
                    className={`p-3 rounded border ${
                      op.status === 'failed'
                        ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                        : op.status === 'retrying'
                        ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
                        : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                    }`}
                  >
                    {/* Operation Type */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {op.type}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ID: {op.id.substring(0, 8)}...
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          op.status === 'failed'
                            ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : op.status === 'retrying'
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                            : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        }`}
                      >
                        {op.status}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {op.timestamp.toLocaleTimeString()}
                    </p>

                    {/* Retry Count */}
                    {op.retryCount ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Retries: {op.retryCount}
                      </p>
                    ) : null}

                    {/* Error Message */}
                    {op.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                        {op.error}
                      </p>
                    )}

                    {/* Action Buttons */}
                    {op.status === 'failed' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            rollback(op.id);
                            onOperationFail?.(op.id, new Error(op.error || 'Operation failed'));
                          }}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Rollback
                        </button>
                        <button
                          onClick={() => {
                            // Retry logic would be handled by the manager
                            onOperationComplete?.(op.id);
                          }}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Retrying</p>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">{retryingCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Failed</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">{failedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingOperationsBadge;
