import { useEffect, useRef, useCallback } from "react";

export interface KeyboardMap {
  [key: string]: (e: KeyboardEvent) => void;
}

export interface KeyboardConfig {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: HTMLElement | Document;
}

/**
 * Hook for managing keyboard shortcuts and navigation
 * Supports both simple and complex key combinations
 */
export function useKeyboardNavigation(
  keyMap: KeyboardMap,
  config?: KeyboardConfig
) {
  const configRef = useRef<KeyboardConfig>({
    enabled: true,
    preventDefault: false,
    stopPropagation: false,
    target: document,
    ...config,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!configRef.current.enabled) return;

      // Build key string for comparison (e.g., "ctrl+s", "alt+shift+d")
      const keyParts: string[] = [];
      if (e.ctrlKey || e.metaKey) keyParts.push("ctrl");
      if (e.altKey) keyParts.push("alt");
      if (e.shiftKey) keyParts.push("shift");
      
      // Normalize key name
      let key = e.key.toLowerCase();
      if (key === " ") key = "space";
      if (key === "enter") key = "enter";
      if (key === "escape") key = "esc";
      
      keyParts.push(key);
      const keyString = keyParts.join("+");

      // Check if this key combination is mapped
      if (keyMap[keyString]) {
        if (configRef.current.preventDefault) e.preventDefault();
        if (configRef.current.stopPropagation) e.stopPropagation();
        
        keyMap[keyString](e);
      }
    },
    [keyMap]
  );

  useEffect(() => {
    const target = configRef.current.target || document;
    target.addEventListener("keydown", handleKeyDown);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    enable: () => { configRef.current.enabled = true; },
    disable: () => { configRef.current.enabled = false; },
  };
}

/**
 * Common keyboard shortcuts for accessibility
 */
export const COMMON_SHORTCUTS = {
  SKIP_TO_MAIN: "alt+m",
  SKIP_TO_NAV: "alt+n",
  SKIP_TO_SEARCH: "alt+s",
  OPEN_HELP: "ctrl+?",
  OPEN_MENU: "alt+/",
  CLOSE_MODAL: "esc",
  FOCUS_SEARCH: "ctrl+k",
  HELP: "f1",
};

/**
 * Helper to navigate between focusable elements
 */
export function useArrowKeyNavigation(
  containerSelector: string,
  direction: "vertical" | "horizontal" | "both" = "vertical"
) {
  const handleArrowKeys = useCallback((e: KeyboardEvent) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const focusableElements = Array.from(
      container.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    let nextIndex = currentIndex;
    const isVertical = ["ArrowUp", "ArrowDown"].includes(e.key) && 
                       (direction === "vertical" || direction === "both");
    const isHorizontal = ["ArrowLeft", "ArrowRight"].includes(e.key) && 
                        (direction === "horizontal" || direction === "both");

    if (!isVertical && !isHorizontal) return;

    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      nextIndex = Math.max(0, currentIndex - 1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      focusableElements[nextIndex].focus();
    }
  }, [containerSelector, direction]);

  useKeyboardNavigation({
    "arrowup": handleArrowKeys,
    "arrowdown": handleArrowKeys,
    "arrowleft": handleArrowKeys,
    "arrowright": handleArrowKeys,
  });
}

/**
 * Helper for dialog/modal keyboard navigation
 */
export function useModalKeyboardNav(containerRef: React.RefObject<HTMLDivElement>) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Close on Escape
    if (e.key === "Escape") {
      const closeButton = container.querySelector('[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }

    // Tab trap (already handled by useFocusTrap)
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
