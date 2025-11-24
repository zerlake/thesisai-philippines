import { useCallback, useState, useEffect } from "react";
import { UserPattern } from "./use-user-behavior";

export interface AdaptiveNav {
  pinnedItems: string[];
  hiddenItems: string[];
  order: string[];
  sidebarMode: "full" | "compact" | "minimal";
}

/**
 * Hook for adaptive navigation that learns from user behavior
 * Reorganizes UI based on actual usage patterns
 */
export function useAdaptiveNavigation(patterns: UserPattern) {
  const [navConfig, setNavConfig] = useState<AdaptiveNav>({
    pinnedItems: [],
    hiddenItems: [],
    order: [],
    sidebarMode: "full",
  });

  useEffect(() => {
    const allNavItems = [
      "research-planning",
      "literature-review",
      "content-creation",
      "manuscript-review",
      "defense-prep",
      "collaboration",
      "analytics",
      "settings",
    ];

    // 1. Pin most-used features
    const pinnedItems = patterns.mostUsedFeatures
      .filter((f) => allNavItems.includes(f))
      .slice(0, 4);

    // 2. Identify unused features (potential candidates for hiding)
    const usedFeatures = new Set(patterns.mostUsedFeatures);
    const hiddenItems = allNavItems.filter((item) => !usedFeatures.has(item));

    // 3. Determine sidebar mode based on usage intensity
    let sidebarMode: "full" | "compact" | "minimal" = "full";
    const isHeavyUser = patterns.averageSessionDuration > 60 * 60 * 1000; // 1hr+
    if (isHeavyUser) {
      sidebarMode = "compact"; // Compact for power users
    }

    // 4. Reorder navigation based on workflow
    const orderedNav = [
      ...pinnedItems,
      ...allNavItems.filter((item) => !pinnedItems.includes(item) && !hiddenItems.includes(item)),
    ];

    setNavConfig({
      pinnedItems,
      hiddenItems: hiddenItems.slice(0, 2), // Only hide least used
      order: orderedNav,
      sidebarMode,
    });
  }, [patterns]);

  /**
   * Pin/unpin navigation items
   */
  const togglePin = useCallback((item: string) => {
    setNavConfig((prev) => ({
      ...prev,
      pinnedItems: prev.pinnedItems.includes(item)
        ? prev.pinnedItems.filter((p) => p !== item)
        : [...prev.pinnedItems, item].slice(0, 4), // Max 4 pins
    }));
  }, []);

  /**
   * Hide/show navigation items
   */
  const toggleHidden = useCallback((item: string) => {
    setNavConfig((prev) => ({
      ...prev,
      hiddenItems: prev.hiddenItems.includes(item)
        ? prev.hiddenItems.filter((h) => h !== item)
        : [...prev.hiddenItems, item],
    }));
  }, []);

  /**
   * Change sidebar mode
   */
  const setSidebarMode = useCallback((mode: "full" | "compact" | "minimal") => {
    setNavConfig((prev) => ({ ...prev, sidebarMode: mode }));
  }, []);

  return {
    navConfig,
    togglePin,
    toggleHidden,
    setSidebarMode,
  };
}
