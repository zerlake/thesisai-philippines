import { useEffect, useRef } from "react";

/**
 * Hook to manage focus trapping within a container
 * Prevents focus from leaving a modal/dialog without closing it
 */
export function useFocusTrap(options?: {
  enabled?: boolean;
  initialFocus?: string; // CSS selector for element to focus initially
  returnFocus?: boolean; // Return focus to trigger element on close
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || options?.enabled === false) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    if (options?.initialFocus) {
      const initialElement = containerRef.current.querySelector(
        options.initialFocus
      ) as HTMLElement;
      if (initialElement) {
        initialElement.focus();
      }
    } else {
      // Focus first focusable element
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Shift + Tab on first element → focus last element
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element → focus first element
      else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    containerRef.current.addEventListener("keydown", handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element
      if (options?.returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [options]);

  return containerRef;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
  ).filter((el) => {
    // Check if element is visible
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}
