/**
 * Intersection Observer Utilities
 * Efficient scroll-based animations and lazy loading
 */

import React from 'react';

export interface IntersectionOptions extends IntersectionObserverInit {
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
  onIntersection?: (entry: IntersectionObserverEntry) => void;
  once?: boolean; // Only trigger once
  threshold?: number | number[];
}

/**
 * Singleton IntersectionObserver manager
 */
export class IntersectionManager {
  private observers: Map<Element, IntersectionObserver> = new Map();
  private callbacks: Map<Element, Set<(entry: IntersectionObserverEntry) => void>> = new Map();
  private observedOnce: Set<Element> = new Set();

  /**
   * Observe element
   */
  observe(
    element: Element,
    callback: (entry: IntersectionObserverEntry) => void,
    options: Omit<IntersectionOptions, 'onEnter' | 'onLeave' | 'onIntersection'> = {}
  ): () => void {
    const { once = false, ...observerOptions } = options;

    // Get or create observer for this element
    let observer = this.observers.get(element);
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.handleIntersection(entry, element, once);
        });
      }, observerOptions);

      this.observers.set(element, observer);
      this.callbacks.set(element, new Set());
    }

    // Register callback
    const callbacks = this.callbacks.get(element)!;
    callbacks.add(callback);

    // Start observing
    observer.observe(element);

    // Return unobserve function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        observer?.unobserve(element);
        this.observers.delete(element);
        this.callbacks.delete(element);
      }
    };
  }

  /**
   * Handle intersection change
   */
  private handleIntersection(entry: IntersectionObserverEntry, element: Element, once: boolean): void {
    if (once && this.observedOnce.has(element)) {
      return;
    }

    if (entry.isIntersecting) {
      this.observedOnce.add(element);
    }

    const callbacks = this.callbacks.get(element);
    callbacks?.forEach(callback => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Error in intersection observer callback:', error);
      }
    });
  }

  /**
   * Unobserve all
   */
  unobserveAll(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
    this.observedOnce.clear();
  }
}

/**
 * Global manager instance
 */
let globalManager: IntersectionManager | null = null;

function getGlobalManager(): IntersectionManager {
  if (!globalManager && typeof window !== 'undefined') {
    globalManager = new IntersectionManager();
  }
  return globalManager!;
}

/**
 * React Hook: useIntersectionObserver
 */
export function useIntersectionObserver(
  options: IntersectionOptions = {}
): [React.RefObject<HTMLDivElement>, IntersectionObserverEntry | null] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);

  const { onEnter, onLeave, onIntersection, ...observerOptions } = options;

  React.useEffect(() => {
    if (!ref.current || !IntersectionObserver) return;

    const manager = getGlobalManager();

    const unsubscribe = manager.observe(
      ref.current,
      (entry) => {
        setEntry(entry);
        onIntersection?.(entry);

        if (entry.isIntersecting) {
          onEnter?.(entry);
        } else {
          onLeave?.(entry);
        }
      },
      observerOptions
    );

    return () => unsubscribe();
  }, [onEnter, onLeave, onIntersection, observerOptions]);

  return [ref, entry];
}

/**
 * React Hook: useIntersectionVisibility
 * Returns boolean indicating if element is visible
 */
export function useIntersectionVisibility(
  options: Omit<IntersectionOptions, 'onEnter' | 'onLeave' | 'onIntersection'> = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || !IntersectionObserver) return;

    const manager = getGlobalManager();

    const unsubscribe = manager.observe(
      ref.current,
      (entry) => setIsVisible(entry.isIntersecting),
      options
    );

    return () => unsubscribe();
  }, [options]);

  return [ref, isVisible];
}

/**
 * Scroll animation trigger
 */
export function useScrollAnimation(
  config: {
    threshold?: number;
    rootMargin?: string;
    animationClass?: string;
    onEnter?: () => void;
    onLeave?: () => void;
  } = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationClass = 'animate-in',
    onEnter,
    onLeave
  } = config;

  const ref = React.useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.classList.add(animationClass);
          setIsAnimating(true);
          onEnter?.();
        } else {
          ref.current?.classList.remove(animationClass);
          setIsAnimating(false);
          onLeave?.();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [animationClass, onEnter, onLeave, rootMargin, threshold]);

  return [ref, isAnimating];
}

/**
 * Lazy load component
 */
export const LazyLoad = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number | number[];
    rootMargin?: string;
    onLoad?: () => void;
  }
>(({ children, fallback = null, threshold = 0.1, rootMargin = '50px', onLoad }, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const target = ref ? (ref as React.RefObject<HTMLDivElement>).current : internalRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          onLoad?.();
          observer.unobserve(target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, onLoad]);

  const containerRef = ref ? (ref as React.RefObject<HTMLDivElement>) : internalRef;

  return (
    <div ref={containerRef}>
      {isLoaded ? children : fallback}
    </div>
  );
});

LazyLoad.displayName = 'LazyLoad';

/**
 * Stagger children with scroll-based animation
 */
export function useStaggeredAnimation(
  children: React.ReactNode[],
  options: {
    delay?: number;
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { delay = 100, threshold = 0.1, rootMargin = '0px' } = options;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [animatedIndices, setAnimatedIndices] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const indices = new Set(animatedIndices);
          const childIndex = Array.from(containerRef.current?.children || []).indexOf(
            entry.target as HTMLElement
          );

          if (childIndex >= 0 && !indices.has(childIndex)) {
            setTimeout(() => {
              indices.add(childIndex);
              setAnimatedIndices(new Set(indices));
            }, childIndex * delay);
          }
        }
      },
      { threshold, rootMargin }
    );

    containerRef.current.childNodes.forEach(child => {
      if (child instanceof HTMLElement) {
        observer.observe(child);
      }
    });

    return () => observer.disconnect();
  }, [delay, threshold, rootMargin, animatedIndices]);

  return { ref: containerRef, animatedIndices };
}

/**
 * Monitor element visibility percentage
 */
export function useVisibilityPercentage(): [
  React.RefObject<HTMLDivElement>,
  number
] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [percentage, setPercentage] = React.useState(0);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const { intersectionRatio } = entry;
        setPercentage(Math.round(intersectionRatio * 100));
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return [ref, percentage];
}
