/**
 * Real-time State Management
 * 
 * Handles optimistic updates, pending operations, and conflict resolution.
 * Features:
 * - Optimistic UI updates
 * - Pending operation queue
 * - Conflict detection and resolution
 * - State synchronization
 * - Rollback on error
 * 
 * @module lib/dashboard/realtime-state
 */

/**
 * Operation status
 */
export enum OperationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

/**
 * Pending operation
 */
export interface PendingOperation {
  id: string;
  type: string;
  status: OperationStatus;
  data: Record<string, any>;
  originalData: Record<string, any>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

/**
 * Conflict info
 */
export interface ConflictInfo {
  operationId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  timestamp: number;
}

/**
 * Change event
 */
export interface ChangeEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
  source: 'local' | 'remote';
}

/**
 * Real-time state manager
 */
export class RealtimeStateManager {
  private state: Record<string, any> = {};
  private pendingOperations: Map<string, PendingOperation> = new Map();
  private conflicts: Map<string, ConflictInfo[]> = new Map();
  private listeners: Map<string, Set<(event: ChangeEvent) => void>> = new Map();
  private operationId: number = 0;
  private lastSync: number = Date.now();

  /**
   * Initialize state
   * @param initialState - Initial state value
   */
  initialize(initialState: Record<string, any>): void {
    this.state = { ...initialState };
    this.lastSync = Date.now();
  }

  /**
   * Get current state
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Get state value by path
   * @param path - State path (e.g., 'widgets.widget-1.data')
   */
  getStateValue(path: string): any {
    const parts = path.split('.');
    let current = this.state;

    for (const part of parts) {
      current = current?.[part];
      if (current === undefined) return undefined;
    }

    return current;
  }

  /**
   * Apply optimistic update
   * @param type - Operation type
   * @param data - Operation data
   * @returns Operation ID
   */
  applyOptimisticUpdate(type: string, data: Record<string, any>): string {
    const id = `op_${++this.operationId}`;
    
    // Store original state for rollback
    const originalData = { ...data };

    // Apply update to local state
    this.mergeState(data);

    // Create pending operation
    const operation: PendingOperation = {
      id,
      type,
      status: OperationStatus.PENDING,
      data,
      originalData,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    };

    this.pendingOperations.set(id, operation);

    // Emit change event
    this.emit('change', {
      type,
      data,
      timestamp: Date.now(),
      source: 'local'
    });

    return id;
  }

  /**
   * Mark operation as sent
   * @param operationId - Operation ID
   */
  markOperationSent(operationId: string): void {
    const operation = this.pendingOperations.get(operationId);
    if (operation) {
      operation.status = OperationStatus.SENT;
    }
  }

  /**
   * Confirm operation
   * @param operationId - Operation ID
   * @param serverData - Confirmed server data
   */
  confirmOperation(operationId: string, serverData?: Record<string, any>): void {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) return;

    operation.status = OperationStatus.CONFIRMED;

    // If server returned different data, merge it
    if (serverData) {
      this.mergeState(serverData);
      this.emit('confirmed', {
        operationId,
        serverData
      });
    }

    // Remove from pending after delay (keep for undo)
    setTimeout(() => {
      this.pendingOperations.delete(operationId);
    }, 5000);
  }

  /**
   * Fail operation
   * @param operationId - Operation ID
   * @param error - Error details
   */
  failOperation(operationId: string, error?: Error): void {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) return;

    operation.status = OperationStatus.FAILED;
    operation.retries++;

    if (operation.retries < operation.maxRetries) {
      // Can be retried
      operation.status = OperationStatus.PENDING;
    } else {
      // Max retries exceeded, rollback
      this.rollbackOperation(operationId);
    }

    this.emit('operationFailed', {
      operationId,
      error: error?.message,
      canRetry: operation.status === OperationStatus.PENDING
    });
  }

  /**
   * Rollback operation
   * @param operationId - Operation ID
   */
  rollbackOperation(operationId: string): void {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) return;

    // Restore original state
    this.mergeState(operation.originalData);

    this.emit('rolledBack', {
      operationId,
      originalData: operation.originalData
    });

    this.pendingOperations.delete(operationId);
  }

  /**
   * Apply remote update
   * @param type - Update type
   * @param data - Update data
   */
  applyRemoteUpdate(type: string, data: Record<string, any>): void {
    // Check for conflicts with pending operations
    this.detectConflicts(data);

    // Resolve conflicts
    const resolvedData = this.resolveConflicts(data);

    // Merge state
    this.mergeState(resolvedData);

    this.lastSync = Date.now();

    this.emit('change', {
      type,
      data: resolvedData,
      timestamp: Date.now(),
      source: 'remote'
    });
  }

  /**
   * Get pending operations
   */
  getPendingOperations(): PendingOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  /**
   * Get pending operation by ID
   */
  getPendingOperation(id: string): PendingOperation | undefined {
    return this.pendingOperations.get(id);
  }

  /**
   * Get conflicts
   */
  getConflicts(): ConflictInfo[] {
    return Array.from(this.conflicts.values()).flat();
  }

  /**
   * Merge state
   * @param data - Data to merge
   */
  private mergeState(data: Record<string, any>): void {
    this.state = {
      ...this.state,
      ...data
    };
  }

  /**
   * Detect conflicts between pending operations and remote update
   * @param remoteData - Remote update data
   */
  private detectConflicts(remoteData: Record<string, any>): void {
    for (const [opId, operation] of this.pendingOperations) {
      for (const [key, value] of Object.entries(operation.data)) {
        if (key in remoteData && remoteData[key] !== value) {
          const conflict: ConflictInfo = {
            operationId: opId,
            field: key,
            localValue: value,
            remoteValue: remoteData[key],
            timestamp: Date.now()
          };

          if (!this.conflicts.has(opId)) {
            this.conflicts.set(opId, []);
          }

          this.conflicts.get(opId)!.push(conflict);

          this.emit('conflict', conflict);
        }
      }
    }
  }

  /**
   * Resolve conflicts
   * @param remoteData - Remote data
   * @returns Resolved data
   */
  private resolveConflicts(remoteData: Record<string, any>): Record<string, any> {
    const resolved = { ...remoteData };

    // Strategy: Remote wins for now (can be customized)
    // In real apps, you might want conflict resolution UI

    return resolved;
  }

  /**
   * Subscribe to changes
   * @param type - Event type
   * @param listener - Event listener
   */
  subscribe(type: string, listener: (event: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Emit event
   * @param type - Event type
   * @param data - Event data
   */
  private emit(type: string, data: any): void {
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[RealtimeState] Event listener error (${type}):`, error);
        }
      });
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    lastSync: number;
    pendingCount: number;
    conflictCount: number;
    isSynced: boolean;
  } {
    return {
      lastSync: this.lastSync,
      pendingCount: this.pendingOperations.size,
      conflictCount: this.getConflicts().length,
      isSynced: this.pendingOperations.size === 0
    };
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state = {};
    this.pendingOperations.clear();
    this.conflicts.clear();
  }
}

/**
 * Singleton instance
 */
let realtimeManager: RealtimeStateManager | null = null;

/**
 * Get realtime state manager
 */
export function getRealtimeStateManager(): RealtimeStateManager {
  if (!realtimeManager) {
    realtimeManager = new RealtimeStateManager();
  }

  return realtimeManager;
}

/**
 * Reset realtime state manager (for testing)
 */
export function resetRealtimeStateManager(): void {
  if (realtimeManager) {
    realtimeManager.clear();
    realtimeManager = null;
  }
}
