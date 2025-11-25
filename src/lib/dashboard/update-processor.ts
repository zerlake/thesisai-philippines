/**
 * Update Processor
 * 
 * Processes, batches, and optimizes real-time updates.
 * Features:
 * - Batch update processing
 * - Debounce logic
 * - Update merging
 * - Conflict detection
 * - Deduplication
 * 
 * @module lib/dashboard/update-processor
 */

import { BATCH_UPDATE_CONFIG } from './realtime-config';

/**
 * Update item
 */
export interface UpdateItem {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: number;
  priority?: number;
}

/**
 * Batch update
 */
export interface BatchUpdate {
  id: string;
  items: UpdateItem[];
  timestamp: number;
  processedAt?: number;
}

/**
 * Update handler
 */
export type UpdateHandler = (batch: BatchUpdate) => Promise<void>;

/**
 * Update processor
 */
export class UpdateProcessor {
  private queue: UpdateItem[] = [];
  private pendingBatch: BatchUpdate | null = null;
  private batchTimer: NodeJS.Timeout | null = null;
  private dedupMap: Map<string, UpdateItem> = new Map();
  private handlers: UpdateHandler[] = [];
  private isProcessing: boolean = false;
  private processedCount: number = 0;
  private dropCount: number = 0;

  /**
   * Add update to queue
   */
  add(item: UpdateItem): void {
    // Deduplication: replace existing update of same type
    const dedupKey = `${item.type}:${item.data?.id || 'global'}`;

    if (BATCH_UPDATE_CONFIG.DEDUPLICATE) {
      this.dedupMap.set(dedupKey, item);
    } else {
      this.queue.push(item);
    }

    // Trigger batch processing
    this.scheduleBatch();
  }

  /**
   * Add multiple updates
   */
  addBatch(items: UpdateItem[]): void {
    items.forEach((item) => this.add(item));
  }

  /**
   * Register update handler
   */
  onUpdate(handler: UpdateHandler): () => void {
    this.handlers.push(handler);

    // Return unregister function
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Check if we should process immediately
    const totalItems = this.getTotalItemsCount();

    if (totalItems >= BATCH_UPDATE_CONFIG.BATCH_SIZE) {
      // Process immediately if batch size reached
      this.processBatch();
    } else {
      // Otherwise schedule with delay
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, BATCH_UPDATE_CONFIG.BATCH_DELAY);
    }
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing) return;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const items = this.getQueuedItems();

    if (items.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Create batch
      const batch: BatchUpdate = {
        id: `batch_${Date.now()}`,
        items,
        timestamp: Date.now()
      };

      // Merge similar updates
      const merged = this.mergeUpdates(batch.items);
      batch.items = merged;

      // Execute handlers
      for (const handler of this.handlers) {
        try {
          await handler(batch);
        } catch (error) {
          console.error('[UpdateProcessor] Handler error:', error);
        }
      }

      batch.processedAt = Date.now();
      this.processedCount += batch.items.length;

      // Clear dedup map
      if (BATCH_UPDATE_CONFIG.DEDUPLICATE) {
        this.dedupMap.clear();
      }
    } finally {
      this.isProcessing = false;

      // Process next batch if items queued
      if (this.getTotalItemsCount() > 0) {
        this.scheduleBatch();
      }
    }
  }

  /**
   * Get queued items
   */
  private getQueuedItems(): UpdateItem[] {
    if (BATCH_UPDATE_CONFIG.DEDUPLICATE && this.dedupMap.size > 0) {
      return Array.from(this.dedupMap.values());
    }

    return this.queue.splice(0, BATCH_UPDATE_CONFIG.BATCH_SIZE);
  }

  /**
   * Get total items count
   */
  private getTotalItemsCount(): number {
    if (BATCH_UPDATE_CONFIG.DEDUPLICATE) {
      return this.dedupMap.size + this.queue.length;
    }

    return this.queue.length;
  }

  /**
   * Merge similar updates
   */
  private mergeUpdates(items: UpdateItem[]): UpdateItem[] {
    const merged = new Map<string, UpdateItem>();

    for (const item of items) {
      const key = `${item.type}:${item.data?.id || 'global'}`;

      const existing = merged.get(key);

      if (existing) {
        // Merge data
        existing.data = {
          ...existing.data,
          ...item.data
        };
        existing.timestamp = item.timestamp;
      } else {
        merged.set(key, { ...item });
      }
    }

    // Sort by priority (higher first) then timestamp
    return Array.from(merged.values()).sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Force process immediately
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    while (this.getTotalItemsCount() > 0) {
      await this.processBatch();
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.dedupMap.clear();

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      queuedItems: this.getTotalItemsCount(),
      processedItems: this.processedCount,
      isProcessing: this.isProcessing,
      dropCount: this.dropCount,
      dedupEnabled: BATCH_UPDATE_CONFIG.DEDUPLICATE,
      dedupMapSize: this.dedupMap.size,
      queueLength: this.queue.length
    };
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = BATCH_UPDATE_CONFIG.DEBOUNCE_DELAY,
  immediate: boolean = BATCH_UPDATE_CONFIG.DEBOUNCE_IMMEDIATE
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, delay);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Coalesce similar updates
 */
export function coalesceUpdates(
  updates: UpdateItem[],
  timeWindow: number = 1000
): UpdateItem[] {
  const grouped = new Map<string, UpdateItem[]>();

  for (const update of updates) {
    const key = `${update.type}:${update.data?.id || 'global'}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)!.push(update);
  }

  const coalesced: UpdateItem[] = [];

  for (const [, group] of grouped) {
    // Find oldest and newest
    const oldest = group.reduce((a, b) => (a.timestamp < b.timestamp ? a : b));
    const newest = group.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

    // Check time window
    if (newest.timestamp - oldest.timestamp <= timeWindow) {
      // Merge all data
      const merged = group.reduce(
        (acc, item) => ({
          ...acc,
          data: { ...acc.data, ...item.data }
        }),
        newest
      );

      coalesced.push(merged);
    } else {
      // Too far apart, keep all
      coalesced.push(...group);
    }
  }

  return coalesced;
}

/**
 * Singleton instance
 */
let processor: UpdateProcessor | null = null;

/**
 * Get update processor
 */
export function getUpdateProcessor(): UpdateProcessor {
  if (!processor) {
    processor = new UpdateProcessor();
  }

  return processor;
}

/**
 * Reset processor (for testing)
 */
export function resetUpdateProcessor(): void {
  if (processor) {
    processor.clear();
    processor = null;
  }
}
