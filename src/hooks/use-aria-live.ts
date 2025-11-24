import { useRef, useCallback } from "react";

export type AriaLivePolarity = "polite" | "assertive";
export type AriaLiveRelevant = "additions" | "removals" | "text" | "all";

export interface AriaLiveMessage {
  id: string;
  content: string;
  polarity: AriaLivePolarity;
  duration?: number; // Auto-clear after duration (ms)
  relevant?: AriaLiveRelevant;
}

/**
 * Hook for managing ARIA live regions
 * Announces dynamic content changes to screen readers
 */
export function useAriaLive() {
  const messagesRef = useRef<Map<string, AriaLiveMessage>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback(
    (content: string, options?: {
      polarity?: AriaLivePolarity;
      duration?: number;
      id?: string;
    }) => {
      const id = options?.id || `aria-live-${Date.now()}`;
      const polarity = options?.polarity || "polite";
      const duration = options?.duration || 5000;

      const message: AriaLiveMessage = {
        id,
        content,
        polarity,
        duration,
        relevant: "text",
      };

      messagesRef.current.set(id, message);

      // Clear previous timeout if exists
      const previousTimeout = timeoutsRef.current.get(id);
      if (previousTimeout) {
        clearTimeout(previousTimeout);
      }

      // Find or create live region
      const regionId = `aria-live-${polarity}`;
      let region = document.querySelector(`[id="${regionId}"]`) as HTMLDivElement;

      if (!region) {
        region = document.createElement("div");
        region.id = regionId;
        region.setAttribute("aria-live", polarity);
        region.setAttribute("aria-atomic", "true");
        region.setAttribute("class", "sr-only"); // Screen reader only
        document.body.appendChild(region);
      }

      // Add message to region
      const messageEl = document.createElement("div");
      messageEl.id = id;
      messageEl.setAttribute("role", "status");
      messageEl.textContent = content;
      region.appendChild(messageEl);

      // Auto-remove message
      if (duration > 0) {
        const timeout = setTimeout(() => {
          messageEl.remove();
          messagesRef.current.delete(id);
          timeoutsRef.current.delete(id);
        }, duration);

        timeoutsRef.current.set(id, timeout);
      }

      return id;
    },
    []
  );

  /**
   * Announce success message (assertive)
   */
  const announceSuccess = useCallback(
    (content: string) => {
      return announce(content, {
        polarity: "assertive",
        duration: 3000,
      });
    },
    [announce]
  );

  /**
   * Announce error message (assertive)
   */
  const announceError = useCallback(
    (content: string) => {
      return announce(`Error: ${content}`, {
        polarity: "assertive",
        duration: 5000,
      });
    },
    [announce]
  );

  /**
   * Announce loading message (polite)
   */
  const announceLoading = useCallback(
    (content: string = "Loading...") => {
      return announce(content, {
        polarity: "polite",
        duration: 0, // Don't auto-clear
      });
    },
    [announce]
  );

  /**
   * Clear a specific message
   */
  const clearMessage = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
    messagesRef.current.delete(id);

    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearAll = useCallback(() => {
    Array.from(messagesRef.current.keys()).forEach(clearMessage);
  }, [clearMessage]);

  return {
    announce,
    announceSuccess,
    announceError,
    announceLoading,
    clearMessage,
    clearAll,
  };
}
