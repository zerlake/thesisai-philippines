/**
 * Conflict Resolution UI Component
 * 
 * Displays and handles conflicts between local and remote state,
 * allowing users to choose which version to keep.
 * 
 * @component
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface ConflictData {
  operationId: string;
  type: string;
  localValue: any;
  remoteValue: any;
  timestamp: Date;
  retryCount: number;
}

interface ConflictResolutionUIProps {
  className?: string;
  autoResolve?: boolean;
  onConflictResolved?: (operationId: string, choice: 'local' | 'remote') => void;
  onConflictDismissed?: (operationId: string) => void;
}

/**
 * ConflictResolutionUI Component
 * 
 * Shows a modal or panel when conflicts are detected between
 * local and remote values, with options to keep either version
 */
export function ConflictResolutionUI({
  className = '',
  autoResolve = false,
  onConflictResolved,
  onConflictDismissed
}: ConflictResolutionUIProps) {
  const realtimeState = useRealtimeUpdates(undefined);
  const conflicts = realtimeState.conflicts || [];
  const [displayConflicts, setDisplayConflicts] = useState<ConflictData[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  // Convert conflicts from manager to display format
  useEffect(() => {
    if (conflicts) {
      const conflictList = Array.isArray(conflicts)
        ? conflicts.map((c: any) => ({
            operationId: c.operationId || c.id,
            type: c.type || 'unknown',
            localValue: c.localValue,
            remoteValue: c.remoteValue,
            timestamp: c.timestamp || new Date(),
            retryCount: c.retryCount || 0
          }))
        : [];
      setDisplayConflicts(conflictList);

      // Auto-resolve if enabled (prefer remote)
      if (autoResolve && conflictList.length > 0) {
        conflictList.forEach(conflict => {
          handleResolveConflict(conflict.operationId, 'remote');
        });
      }
    }
  }, [conflicts, autoResolve]);

  const handleResolveConflict = (operationId: string, choice: 'local' | 'remote') => {
    onConflictResolved?.(operationId, choice);
    setDisplayConflicts(prev => prev.filter(c => c.operationId !== operationId));
    setSelectedConflict(null);
  };

  const handleDismiss = (operationId: string) => {
    onConflictDismissed?.(operationId);
    setDisplayConflicts(prev => prev.filter(c => c.operationId !== operationId));
    setSelectedConflict(null);
  };

  if (!displayConflicts || displayConflicts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Conflict Alert Banner */}
      <div className="fixed top-4 right-4 z-50 max-w-md">
        {displayConflicts.map((conflict, idx) => (
          <div
            key={conflict.operationId}
            className={`mb-3 p-4 bg-amber-50 dark:bg-amber-900 border-2 border-amber-200 dark:border-amber-700 rounded-lg shadow-lg ${
              idx > 0 ? 'hidden md:block' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Conflict Detected
                </h3>
              </div>
              <button
                onClick={() => handleDismiss(conflict.operationId)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Conflict Type */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Operation <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {conflict.type}
              </code> has conflicting changes.
            </p>

            {/* Expandable Details */}
            <details className="mb-3">
              <summary className="cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline">
                Show Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs space-y-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Local Value:</p>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-700 rounded overflow-x-auto">
                    {JSON.stringify(conflict.localValue, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Remote Value:</p>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-700 rounded overflow-x-auto">
                    {JSON.stringify(conflict.remoteValue, null, 2)}
                  </pre>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <p>Timestamp: {conflict.timestamp.toLocaleString()}</p>
                  <p>Retry Count: {conflict.retryCount}</p>
                </div>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleResolveConflict(conflict.operationId, 'local')}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm transition"
              >
                Keep Local
              </button>
              <button
                onClick={() => handleResolveConflict(conflict.operationId, 'remote')}
                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium text-sm transition"
              >
                Keep Remote
              </button>
            </div>

            {/* Status */}
            {displayConflicts.length > 1 && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                Conflict {idx + 1} of {displayConflicts.length}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Conflict Count Badge */}
      {displayConflicts.length > 0 && (
        <div className="fixed top-4 left-4 z-40 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
          {displayConflicts.length} Conflict{displayConflicts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default ConflictResolutionUI;
