/**
 * Efficient Event Delegation & Debouncing
 * Reduces event listeners and improves performance on complex interfaces
 */

export type EventHandler<T = Event> = (event: T, target: Element) => void;

interface DelegatedListener<T = Event> {
  selector: string;
  handler: EventHandler<T>;
  boundHandler: (e: Event) => void;
}

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * EventDelegator - Attach listeners to parent, filter by selector
 */
export class EventDelegator {
  private root: Element | Document;
  private listeners: Map<string, DelegatedListener<any>[]> = new Map();
  private rafId: number | null = null;

  constructor(root: Element | Document = document) {
    this.root = root;
  }

  /**
   * Attach delegated event listener
   */
  on<T extends Event = Event>(
    eventType: string,
    selector: string,
    handler: EventHandler<T>,
    options?: AddEventListenerOptions
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.attachRootListener(eventType, options);
    }

    const boundHandler = (e: Event) => {
      const target = this.findMatchingElement(e.target as Element, selector);
      if (target) {
        handler.call(target, e as T, target);
      }
    };

    const listener: DelegatedListener<T> = {
      selector,
      handler,
      boundHandler
    };

    const eventListeners = this.listeners.get(eventType)!;
    eventListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
      // Remove root listener if no more handlers for this event
      if (eventListeners.length === 0) {
        this.root.removeEventListener(eventType, this.getRootHandler(eventType)!);
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Attach root-level event listener
   */
  private attachRootListener(eventType: string, options?: AddEventListenerOptions): void {
    const handler = (e: Event) => {
      const listeners = this.listeners.get(eventType) || [];
      listeners.forEach(listener => {
        listener.boundHandler(e);
      });
    };

    this.root.addEventListener(eventType, handler, options ?? false);
    this.listeners.set(`__handler_${eventType}`, [{ selector: '', handler: () => {}, boundHandler: handler }]);
  }

  /**
   * Get root handler for event type
   */
  private getRootHandler(eventType: string): EventListener | null {
    const handlers = this.listeners.get(`__handler_${eventType}`);
    return handlers?.[0]?.boundHandler as EventListener || null;
  }

  /**
   * Find matching element by selector
   */
  private findMatchingElement(element: Element | null, selector: string): Element | null {
    while (element && element !== this.root) {
      if (element.matches?.(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  /**
   * Remove all listeners
   */
  destroy(): void {
    this.listeners.forEach((listeners, eventType) => {
      if (!eventType.startsWith('__handler_')) {
        const handler = listeners[0]?.boundHandler;
        if (handler) {
          this.root.removeEventListener(eventType, handler as EventListener);
        }
      }
    });
    this.listeners.clear();
  }
}

/**
 * Debounce function with leading/trailing/maxWait options
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let maxTimeout: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let result: any = undefined;

  const { leading = false, trailing = true, maxWait = 0 } = options;

  function invokeFunc(time: number) {
    const args: any[] = [];
    result = func(...args);
    lastInvokeTime = time;
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    
    const timeWaiting = time - lastCallTime;
    const timeToWait = wait - timeWaiting;
    timeout = setTimeout(timerExpired, timeToWait);
  }

  function trailingEdge(time: number) {
    timeout = null;
    if (trailing && lastCallTime > lastInvokeTime) {
      return invokeFunc(time);
    }
    return result;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait > 0 && timeSinceLastInvoke >= maxWait)
    );
  }

  function debounced(...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTime = time;

    if (isInvoking) {
      if (!timeout && leading) {
        leadingEdge(time);
      }
      if (maxWait > 0 && !maxTimeout) {
        maxTimeout = setTimeout(() => {
          if (trailing && lastCallTime > lastInvokeTime) {
            invokeFunc(Date.now());
          }
          maxTimeout = null;
        }, maxWait);
      }
    } else if (timeout) {
      return result;
    }

    if (!timeout) {
      timeout = setTimeout(timerExpired, wait);
    }

    return result;
  }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    if (maxTimeout) clearTimeout(maxTimeout);
    timeout = null;
    maxTimeout = null;
  };

  debounced.flush = () => {
    return !timeout ? result : trailingEdge(Date.now());
  };

  return debounced;
}

/**
 * Throttle function - ensure function called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastRan: number = 0;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    if (!lastRan) {
      func(...args);
      lastRan = now;
    } else {
      if (inThrottle) return;
      const remaining = limit - (now - lastRan);
      if (remaining <= 0) {
        func(...args);
        lastRan = now;
      } else {
        inThrottle = true;
        setTimeout(() => {
          func(...args);
          lastRan = Date.now();
          inThrottle = false;
        }, remaining);
      }
    }
  };
}

/**
 * React hook for debounced callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  wait: number,
  options?: DebounceOptions
): (...args: Parameters<T>) => void {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedRef = React.useRef(
    debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      wait,
      options
    )
  );

  React.useEffect(() => {
    return () => {
      debouncedRef.current.cancel?.();
    };
  }, []);

  return debouncedRef.current;
}

/**
 * React hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledRef = React.useRef(
    throttle(
      (...args: Parameters<T>) => callbackRef.current(...args),
      limit
    )
  );

  return throttledRef.current;
}

// Need to import React for hooks
import React from 'react';
