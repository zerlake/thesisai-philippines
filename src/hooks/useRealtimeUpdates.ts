/**
 * useRealtimeUpdates Hook
 * 
 * React hook for managing real-time optimistic updates.
 * Features:
 * - Optimistic UI updates
 * - Automatic sync with server
 * - Error recovery and rollback
 * - Pending state tracking
 * - Conflict resolution
 * 
 * @module hooks/useRealtimeUpdates
 */

'use client';

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useReducer,
  Reducer
} from 'react';
import {
  RealtimeStateManager,
  OperationStatus,
  PendingOperation,
  ConflictInfo,
  getRealtimeStateManager
} from '@/lib/dashboard/realtime-state';
import { WebSocketManager, MessageType } from '@/lib/dashboard/websocket-manager';

/**
 * Realtime updates state
 */
interface RealtimeUpdateState {
  data: Record<string, any>;
  pending: PendingOperation[];
  conflicts: ConflictInfo[];
  synced: boolean;
  lastSync: number;
  syncError: Error | null;
}

/**
 * Realtime updates action
 */
type RealtimeUpdateAction =
  | { type: 'UPDATE'; payload: Record<string, any> }
  | { type: 'SET_PENDING'; payload: PendingOperation[] }
  | { type: 'SET_CONFLICTS'; payload: ConflictInfo[] }
  | { type: 'SET_SYNCED'; payload: boolean }
  | { type: 'SET_SYNC_ERROR'; payload: Error | null }
  | { type: 'CLEAR_CONFLICTS' };

/**
 * Initial state for reducer
 */
const initialState: RealtimeUpdateState = {
  data: {},
  pending: [],
  conflicts: [],
  synced: true,
  lastSync: Date.now(),
  syncError: null
};

/**
 * Reducer for realtime updates state
 */
const realtimeUpdateReducer: Reducer<RealtimeUpdateState, RealtimeUpdateAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'UPDATE':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        synced: false
      };

    case 'SET_PENDING':
      return {
        ...state,
        pending: action.payload,
        synced: action.payload.length === 0
      };

    case 'SET_CONFLICTS':
      return {
        ...state,
        conflicts: action.payload
      };

    case 'SET_SYNCED':
      return {
        ...state,
        synced: action.payload,
        lastSync: action.payload ? Date.now() : state.lastSync
      };

    case 'SET_SYNC_ERROR':
      return {
        ...state,
        syncError: action.payload
      };

    case 'CLEAR_CONFLICTS':
      return {
        ...state,
        conflicts: []
      };

    default:
      return state;
  }
};

/**
 * useRealtimeUpdates Hook
 * 
 * Manage optimistic UI updates with automatic server synchronization.
 * 
 * @example
 * ```typescript
 * const {
 *   data,
 *   pending,
 *   synced,
 *   update,
 *   confirm,
 *   rollback
 * } = useRealtimeUpdates(manager, {
 *   onConflict: (conflict) => console.log('Conflict:', conflict)
 * });
 * 
 * // Update data optimistically
 * const opId = update('WIDGET_UPDATE', { widgetId: 'w-1', value: 42 });
 * 
 * // Confirm after server response
 * confirm(opId, serverResponse);
 * ```
 */
export function useRealtimeUpdates(
  manager?: WebSocketManager,
  options: {
    onConflict?: (conflict: ConflictInfo) => void;
    onPending?: (operations: PendingOperation[]) => void;
    onSynced?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const stateManagerRef = useRef(getRealtimeStateManager());
  const [state, dispatch] = useReducer(realtimeUpdateReducer, initialState);

  // Setup listeners
  useEffect(() => {
    const stateManager = stateManagerRef.current;

    // Conflict listener
    const unsubscribeConflict = stateManager.subscribe('conflict', (conflict) => {
      dispatch({
        type: 'SET_CONFLICTS',
        payload: stateManager.getConflicts()
      });

      options.onConflict?.(conflict);
    });

    // Pending operations listener
    const unsubscribePending = stateManager.subscribe('change', () => {
      const pending = stateManager.getPendingOperations();
      dispatch({ type: 'SET_PENDING', payload: pending });

      if (pending.length > 0) {
        options.onPending?.(pending);
      } else {
        options.onSynced?.();
      }
    });

    // Operation failed listener
    const unsubscribeFailed = stateManager.subscribe('operationFailed', (data) => {
      options.onError?.(new Error(data.error));
    });

    // Confirmed listener
    const unsubscribeConfirmed = stateManager.subscribe('confirmed', () => {
      dispatch({
        type: 'SET_PENDING',
        payload: stateManager.getPendingOperations()
      });
    });

    return () => {
      unsubscribeConflict();
      unsubscribePending();
      unsubscribeFailed();
      unsubscribeConfirmed();
    };
  }, [options]);

  /**
   * Apply optimistic update
   */
  const update = useCallback(
    (type: string, data: Record<string, any>): string => {
      return stateManagerRef.current.applyOptimisticUpdate(type, data);
    },
    []
  );

  /**
   * Send update to server
   */
  const send = useCallback(
    async (operationId: string, data?: Record<string, any>): Promise<void> => {
      if (!manager) return;

      const operation = stateManagerRef.current.getPendingOperation(operationId);
      if (!operation) return;

      stateManagerRef.current.markOperationSent(operationId);

      try {
        // Send to server
        const response = await manager.request(
          MessageType.WIDGET_UPDATE,
          data || operation.data
        );

        if (response.error) {
          stateManagerRef.current.failOperation(operationId);
          throw new Error(response.error.message);
        }

        // Confirm with server data
        stateManagerRef.current.confirmOperation(operationId, response.data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        stateManagerRef.current.failOperation(operationId, err);
        dispatch({ type: 'SET_SYNC_ERROR', payload: err });
        throw err;
      }
    },
    [manager]
  );

  /**
   * Confirm operation with server response
   */
  const confirm = useCallback(
    (operationId: string, serverData?: Record<string, any>): void => {
      stateManagerRef.current.confirmOperation(operationId, serverData);
      dispatch({
        type: 'SET_PENDING',
        payload: stateManagerRef.current.getPendingOperations()
      });
    },
    []
  );

  /**
   * Fail operation
   */
  const fail = useCallback(
    (operationId: string, error?: Error): void => {
      stateManagerRef.current.failOperation(operationId, error);
    },
    []
  );

  /**
   * Rollback operation
   */
  const rollback = useCallback(
    (operationId: string): void => {
      stateManagerRef.current.rollbackOperation(operationId);
    },
    []
  );

  /**
   * Apply remote update
   */
  const applyRemoteUpdate = useCallback(
    (type: string, data: Record<string, any>): void => {
      stateManagerRef.current.applyRemoteUpdate(type, data);
      dispatch({
        type: 'UPDATE',
        payload: stateManagerRef.current.getState()
      });
    },
    []
  );

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback(() => {
    return stateManagerRef.current.getSyncStatus();
  }, []);

  /**
   * Retry pending operation
   */
  const retry = useCallback(
    async (operationId: string): Promise<void> => {
      return send(operationId);
    },
    [send]
  );

  return {
    // State
    data: state.data,
    pending: state.pending,
    conflicts: state.conflicts,
    synced: state.synced,
    lastSync: state.lastSync,
    syncError: state.syncError,

    // Actions
    update,
    send,
    confirm,
    fail,
    rollback,
    applyRemoteUpdate,
    getSyncStatus,
    retry,

    // Utils
    hasPending: state.pending.length > 0,
    hasConflicts: state.conflicts.length > 0,
    pendingCount: state.pending.length,
    conflictCount: state.conflicts.length
  };
}

/**
 * useOptimisticUpdate Hook
 * 
 * Simplified hook for optimistic updates.
 * 
 * @example
 * ```typescript
 * const { apply, confirm, rollback } = useOptimisticUpdate({
 *   onError: (error) => toast.error(error.message)
 * });
 * 
 * const handleUpdate = async () => {
 *   const opId = apply({ value: 42 });
 * 
 *   try {
 *     await updateServer({ value: 42 });
 *     confirm(opId);
 *   } catch (error) {
 *     rollback(opId);
 *   }
 * };
 * ```
 */
export function useOptimisticUpdate(options: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  const { update, confirm, rollback, fail } = useRealtimeUpdates(undefined, {
    onError: options.onError
  });

  const apply = useCallback(
    (data: Record<string, any>): string => {
      return update('OPTIMISTIC_UPDATE', data);
    },
    [update]
  );

  return {
    apply,
    confirm,
    rollback,
    fail
  };
}

/**
 * useSyncStatus Hook
 * 
 * Track sync status.
 * 
 * @example
 * ```typescript
 * const { isSynced, pendingCount, lastSync } = useSyncStatus();
 * 
 * return <div>Status: {isSynced ? 'Synced' : `${pendingCount} pending`}</div>;
 * ```
 */
export function useSyncStatus() {
  const stateManagerRef = useRef(getRealtimeStateManager());
  const [status, setStatus] = useState(() => stateManagerRef.current.getSyncStatus());

  useEffect(() => {
    const stateManager = stateManagerRef.current;

    const unsubscribe = stateManager.subscribe('change', () => {
      setStatus(stateManager.getSyncStatus());
    });

    return unsubscribe;
  }, []);

  return {
    isSynced: status.isSynced,
    pendingCount: status.pendingCount,
    conflictCount: status.conflictCount,
    lastSync: status.lastSync
  };
}
