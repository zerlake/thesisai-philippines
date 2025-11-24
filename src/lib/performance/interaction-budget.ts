/**
 * Interaction Budget Monitor
 * Tracks frame budget and prevents janky interactions
 * Ensures smooth 60fps (16.67ms per frame) performance
 */

export interface InteractionMetrics {
  timestamp: number;
  frameTime: number;
  isInteracting: boolean;
  budget: number;
  available: number;
}

export interface BudgetThresholds {
  warning: number;    // Yellow: 12ms (75% of 16ms budget)
  critical: number;   // Red: 10ms (60% of 16ms budget)
  safezone: number;   // Green: 14ms (85% of 16ms budget)
}

const FRAME_BUDGET = 16.67; // 60fps target
const DEFAULT_THRESHOLDS: BudgetThresholds = {
  warning: 12,
  critical: 10,
  safezone: 14
};

export class InteractionBudgetMonitor {
  private metrics: InteractionMetrics[] = [];
  private maxMetrics = 60; // Keep last 60 frames
  private thresholds: BudgetThresholds;
  private isMonitoring = false;
  private lastFrameTime = 0;
  private listeners: Set<(metrics: InteractionMetrics) => void> = new Set();
  private animationFrameId: number | null = null;

  constructor(thresholds: Partial<BudgetThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Start monitoring interaction budget
   */
  start(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.monitor();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main monitoring loop
   */
  private monitor(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    const available = Math.max(0, FRAME_BUDGET - frameTime);
    const budget = frameTime / FRAME_BUDGET; // As percentage

    const metrics: InteractionMetrics = {
      timestamp: now,
      frameTime,
      isInteracting: this.isUserInteracting(),
      budget,
      available
    };

    this.addMetric(metrics);
    this.notifyListeners(metrics);

    this.animationFrameId = requestAnimationFrame(() => this.monitor());
  }

  /**
   * Check if user is currently interacting
   */
  private isUserInteracting(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for active pointer/touch
    if ('pointerLockElement' in document && document.pointerLockElement) {
      return true;
    }

    // Check for ongoing animations
    const hasTransitions = document.querySelectorAll('[style*="transition"]').length > 0;
    return hasTransitions;
  }

  /**
   * Add metric to history
   */
  private addMetric(metrics: InteractionMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(metrics: InteractionMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in interaction budget listener:', error);
      }
    });
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: (metrics: InteractionMetrics) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current budget status
   */
  getCurrentStatus(): 'safe' | 'warning' | 'critical' {
    if (this.metrics.length === 0) return 'safe';
    
    const latest = this.metrics[this.metrics.length - 1];
    
    if (latest.available < this.thresholds.critical) {
      return 'critical';
    }
    if (latest.available < this.thresholds.warning) {
      return 'warning';
    }
    return 'safe';
  }

  /**
   * Check if budget is available
   */
  hasBudget(requiredMs: number = 1): boolean {
    if (this.metrics.length === 0) return true;
    const latest = this.metrics[this.metrics.length - 1];
    return latest.available >= requiredMs;
  }

  /**
   * Get average frame time over last N frames
   */
  getAverageFrameTime(frames: number = 30): number {
    const recentMetrics = this.metrics.slice(-frames);
    if (recentMetrics.length === 0) return 0;
    
    const sum = recentMetrics.reduce((acc, m) => acc + m.frameTime, 0);
    return sum / recentMetrics.length;
  }

  /**
   * Get metrics history
   */
  getMetrics(): InteractionMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get percentage of frames exceeding budget
   */
  getJankPercentage(): number {
    if (this.metrics.length === 0) return 0;
    
    const janky = this.metrics.filter(m => m.frameTime > FRAME_BUDGET).length;
    return (janky / this.metrics.length) * 100;
  }

  /**
   * Defer work until budget is available
   */
  async whenBudgetAvailable(requiredMs: number = 5, timeout: number = 1000): Promise<boolean> {
    const startTime = performance.now();
    
    while (performance.now() - startTime < timeout) {
      if (this.hasBudget(requiredMs)) {
        return true;
      }
      // Wait 1 frame before checking again
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    return false;
  }

  /**
   * Schedule work during idle time
   */
  scheduleWork(callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if ('requestIdleCallback' in window) {
      const timeout = priority === 'high' ? 1 : priority === 'normal' ? 50 : 200;
      requestIdleCallback(
        () => callback(),
        { timeout }
      );
    } else {
      // Fallback: use setTimeout with priority
      const delay = priority === 'high' ? 0 : priority === 'normal' ? 50 : 200;
      setTimeout(callback, delay);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
    this.metrics = [];
  }
}

/**
 * Global monitor instance
 */
let globalMonitor: InteractionBudgetMonitor | null = null;

export function getGlobalBudgetMonitor(): InteractionBudgetMonitor {
  if (!globalMonitor) {
    globalMonitor = new InteractionBudgetMonitor();
  }
  return globalMonitor;
}

/**
 * Hook for React components
 */
export function useInteractionBudget() {
  const monitor = getGlobalBudgetMonitor();

  const startMonitoring = () => {
    if (!monitor) {
      const newMonitor = new InteractionBudgetMonitor();
      newMonitor.start();
      return newMonitor;
    }
    monitor.start();
    return monitor;
  };

  const getStatus = () => monitor.getCurrentStatus();
  const hasBudget = (ms: number) => monitor.hasBudget(ms);
  const getAverageFrameTime = (frames?: number) => monitor.getAverageFrameTime(frames);
  const getJankPercentage = () => monitor.getJankPercentage();
  const scheduleWork = (cb: () => void, priority?: 'high' | 'normal' | 'low') =>
    monitor.scheduleWork(cb, priority);
  const whenBudgetAvailable = (required?: number, timeout?: number) =>
    monitor.whenBudgetAvailable(required, timeout);

  return {
    startMonitoring,
    getStatus,
    hasBudget,
    getAverageFrameTime,
    getJankPercentage,
    scheduleWork,
    whenBudgetAvailable,
    monitor
  };
}
