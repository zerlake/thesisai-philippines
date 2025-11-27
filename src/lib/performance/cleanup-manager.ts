/**
 * Cleanup Manager
 * Ensures proper cleanup of event listeners and memory management
 */

import React from 'react';

export type CleanupFunction = () => void | Promise<void>;

/**
 * CleanupManager - Centralized cleanup handling
 */
export class CleanupManager {
  private cleanups: Set<CleanupFunction> = new Set();
  private pending: Promise<void>[] = [];
  private isDestroyed = false;

  /**
   * Register cleanup function
   */
  register(cleanup: CleanupFunction): CleanupFunction {
    if (this.isDestroyed) {
      console.warn('Cannot register cleanup on destroyed CleanupManager');
      return () => {};
    }

    this.cleanups.add(cleanup);

    // Return unregister function
    return () => {
      this.cleanups.delete(cleanup);
    };
  }

  /**
   * Register event listener and auto-cleanup
   */
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);
    this.register(() => {
      target.removeEventListener(event, handler, options);
    });
  }

  /**
   * Register timer and auto-cleanup
   */
  setTimeout(callback: () => void, delay?: number): number {
    const id = window.setTimeout(callback, delay);
    this.register(() => {
      window.clearTimeout(id);
    });
    return id;
  }

  /**
   * Register interval and auto-cleanup
   */
  setInterval(callback: () => void, interval?: number): number {
    const id = window.setInterval(callback, interval);
    this.register(() => {
      window.clearInterval(id);
    });
    return id;
  }

  /**
   * Register animation frame and auto-cleanup
   */
  requestAnimationFrame(callback: FrameRequestCallback): number {
    const id = window.requestAnimationFrame(callback);
    this.register(() => {
      window.cancelAnimationFrame(id);
    });
    return id;
  }

  /**
   * Register observer and auto-cleanup
   */
  observe(observer: { disconnect(): void }): void {
    this.register(() => {
      observer.disconnect();
    });
  }

  /**
   * Execute all cleanups
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    for (const cleanup of this.cleanups) {
      try {
        const result = cleanup();
        if (result instanceof Promise) {
          cleanupPromises.push(result);
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }

    // Wait for all async cleanups
    if (cleanupPromises.length > 0) {
      await Promise.allSettled(cleanupPromises);
    }

    this.cleanups.clear();
  }

  /**
   * Cleanup and destroy
   */
  async destroy(): Promise<void> {
    this.isDestroyed = true;
    await this.cleanup();
    this.pending = [];
  }

  /**
   * Get cleanup count
   */
  getCleanupCount(): number {
    return this.cleanups.size;
  }

  /**
   * Check if destroyed
   */
  isAlive(): boolean {
    return !this.isDestroyed;
  }
}

/**
 * React Hook: useCleanup
 */
export function useCleanup(): CleanupManager {
  const managerRef = React.useRef<CleanupManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new CleanupManager();
  }

  React.useEffect(() => {
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  return managerRef.current;
}

/**
 * React Hook: useEventListener with auto-cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  element?: Element | Window
): void {
  const cleanup = useCleanup();

  React.useEffect(() => {
    const target = element ?? window;
    const eventHandler = (event: Event) => {
      handler.call(window, event as WindowEventMap[K]);
    };

    cleanup.addEventListener(target as EventTarget, eventName, eventHandler);
  }, [eventName, handler, element, cleanup]);
}

/**
 * React Hook: useTimer with auto-cleanup
 */
export function useTimer(
  callback: () => void,
  delay: number | null,
  options: { immediate?: boolean } = {}
): void {
  const cleanup = useCleanup();
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;

    if (options.immediate) {
      callbackRef.current();
    }

    const id = cleanup.setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, cleanup, options.immediate]);
}

/**
 * React Hook: useInterval with auto-cleanup
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const cleanup = useCleanup();
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;

    const id = cleanup.setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay, cleanup]);
}

/**
 * React Hook: useAnimationFrame with auto-cleanup
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true
): void {
  const cleanup = useCleanup();
  const callbackRef = React.useRef(callback);
  const lastTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 0;
      lastTimeRef.current = currentTime;
      callbackRef.current(deltaTime);
      cleanup.requestAnimationFrame(animate);
    };

    const id = cleanup.requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(id);
      lastTimeRef.current = 0;
    };
  }, [enabled, cleanup]);
}

/**
 * React Hook: useResizeObserver with auto-cleanup
 */
export function useResizeObserver<T extends Element>(
  callback: (rect: DOMRectReadOnly) => void
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const cleanup = useCleanup();

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.contentRect);
      });
    });

    observer.observe(ref.current);
    cleanup.observe(observer);

    return () => {
      observer.disconnect();
    };
  }, [callback, cleanup]);

  return ref;
}

/**
 * React Hook: useMutationObserver with auto-cleanup
 */
export function useMutationObserver<T extends Element>(
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = { attributes: true, childList: true, subtree: true }
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const cleanup = useCleanup();

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new MutationObserver((mutations) => {
      callback(mutations);
    });

    observer.observe(ref.current, options);
    cleanup.observe(observer);

    return () => {
      observer.disconnect();
    };
  }, [callback, cleanup, options]);

  return ref;
}

/**
 * Cleanup multiple resources
 */
export function useCleanupMultiple(...cleanups: CleanupFunction[]): void {
  const manager = useCleanup();

  React.useEffect(() => {
    cleanups.forEach(cleanup => {
      manager.register(cleanup);
    });
  }, [cleanups, manager]);
}

/**
 * Track object lifecycle
 */
export function useObjectLifecycle<T extends object>(
  obj: T | null,
  onCreated?: (obj: T) => void,
  onDestroyed?: (obj: T) => void
): T | null {
  const prevRef = React.useRef<T | null>(null);

  React.useEffect(() => {
    if (obj && !prevRef.current) {
      onCreated?.(obj);
    }
    prevRef.current = obj;

    return () => {
      if (prevRef.current) {
        onDestroyed?.(prevRef.current);
      }
    };
  }, [obj, onCreated, onDestroyed]);

  return obj;
}

/**
 * Memory leak detector (development only)
 */
export class MemoryLeakDetector {
  private listeners: Set<CleanupFunction> = new Set();
  private timers: Set<number> = new Set();
  private observers: Set<any> = new Set();

  static isEnabled = process.env.NODE_ENV === 'development';

  /**
   * Track listener registration
   */
  trackEventListener(target: EventTarget, event: string, handler: EventListener): CleanupFunction {
    if (!MemoryLeakDetector.isEnabled) {
      return () => target.removeEventListener(event, handler);
    }

    const cleanup = () => {
      target.removeEventListener(event, handler);
      this.listeners.delete(cleanup);
    };

    this.listeners.add(cleanup);
    target.addEventListener(event, handler);

    return cleanup;
  }

  /**
   * Track timer registration
   */
  trackTimer(id: number): void {
    if (MemoryLeakDetector.isEnabled) {
      this.timers.add(id);
    }
  }

  /**
   * Cleanup all tracked resources
   */
  cleanup(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.timers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    this.observers.forEach(observer => observer.disconnect?.());

    this.listeners.clear();
    this.timers.clear();
    this.observers.clear();
  }

  /**
   * Report tracked resources
   */
  report(): void {
    if (MemoryLeakDetector.isEnabled) {
      console.warn('Memory Leak Detector Report:', {
        listeners: this.listeners.size,
        timers: this.timers.size,
        observers: this.observers.size
      });
    }
  }
}
