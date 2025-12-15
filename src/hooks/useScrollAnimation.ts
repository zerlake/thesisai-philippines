import { useEffect, useRef, useState } from 'react';

/**
 * Hook for triggering animations when element enters viewport
 * Uses Intersection Observer for performance
 */
export function useScrollAnimation(options = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Only observe once - remove observer after animation triggers
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px',
      ...options,
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { elementRef, isVisible };
}

/**
 * Hook for counting animations (stats, numbers)
 * Uses requestAnimationFrame for smooth 60fps performance
 */
export function useCounterAnimation(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newCount = start + (end - start) * easeOutCubic;

      setCount(Math.floor(newCount));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration, start]);

  return count;
}

/**
 * Hook for parallax scroll effects
 * Updates transform based on scroll position
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const elementTop = elementRef.current.getBoundingClientRect().top;
        const newOffset = window.scrollY * speed;
        setOffset(newOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { elementRef, offset };
}

/**
 * Hook for detecting if element is in view
 * Returns boolean for conditional rendering
 */
export function useInView(options = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
      });
    }, {
      threshold: 0.1,
      ...options,
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { elementRef, isInView };
}

/**
 * Hook for managing animation state on scroll
 * Returns { ref, shouldAnimate } for use with Framer Motion
 */
export function useScrollTrigger(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setShouldAnimate(true), delay);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return { ref, shouldAnimate };
}

/**
 * Hook for staggered animations
 * Returns array of animation triggers staggered over time
 */
export function useStaggerAnimation(itemCount: number, staggerDelay = 100) {
  const [animateStates, setAnimateStates] = useState(
    Array(itemCount).fill(false)
  );
  const [trigger, setTrigger] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTrigger(true);
        observer.unobserve(entries[0].target);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trigger) return;

    const timers = animateStates.map((_, index) =>
      setTimeout(() => {
        setAnimateStates((prev) => {
          const newStates = [...prev];
          newStates[index] = true;
          return newStates;
        });
      }, index * staggerDelay)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [trigger, staggerDelay]);

  return { containerRef, animateStates };
}
