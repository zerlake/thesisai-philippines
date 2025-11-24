import { useEffect, useState, useCallback } from "react";

export type AccessibilityTheme = 
  | "light" 
  | "dark" 
  | "high-contrast-light" 
  | "high-contrast-dark"
  | "calm"
  | "custom";

export interface AccessibilitySettings {
  theme: AccessibilityTheme;
  fontSize: "small" | "normal" | "large" | "xlarge";
  letterSpacing: "normal" | "wide" | "extra-wide";
  lineHeight: "normal" | "relaxed" | "very-relaxed";
  reduceMotion: boolean;
  reduceTransparency: boolean;
  screenReaderMode: boolean;
  dyslexiaFont: boolean;
  focusIndicatorSize: "normal" | "large" | "xlarge";
}

/**
 * Hook for comprehensive accessibility theme management
 * Supports multiple visual accessibility modes
 */
export function useAccessibilityTheme() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: "light",
    fontSize: "normal",
    letterSpacing: "normal",
    lineHeight: "normal",
    reduceMotion: false,
    reduceTransparency: false,
    screenReaderMode: false,
    dyslexiaFont: false,
    focusIndicatorSize: "normal",
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("a11y-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load accessibility settings", e);
      }
    }

    // Also check system preferences
    checkSystemPreferences();
  }, []);

  /**
   * Check system accessibility preferences
   */
  const checkSystemPreferences = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev };

      // Check dark mode preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        updated.theme = updated.theme.includes("light") ? "dark" : updated.theme;
      }

      // Check reduced motion preference
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updated.reduceMotion = true;
      }

      // Check high contrast preference (Windows)
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        updated.theme = `high-contrast-${updated.theme.includes("dark") ? "dark" : "light"}` as AccessibilityTheme;
      }

      return updated;
    });
  }, []);

  /**
   * Update individual setting
   */
  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem("a11y-settings", JSON.stringify(updated));
        applyTheme(updated);
        return updated;
      });
    },
    []
  );

  /**
   * Apply theme settings to DOM
   */
  const applyTheme = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply theme class
    root.className = root.className.replace(/theme-\S+/g, "");
    root.classList.add(`theme-${newSettings.theme}`);

    // Apply CSS variables for settings
    const cssVars: Record<string, string> = {
      "--a11y-font-size": getFontSizeValue(newSettings.fontSize),
      "--a11y-letter-spacing": getLetterSpacingValue(newSettings.letterSpacing),
      "--a11y-line-height": getLineHeightValue(newSettings.lineHeight),
      "--a11y-focus-outline-width": getFocusIndicatorSize(newSettings.focusIndicatorSize),
    };

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply motion preferences
    if (newSettings.reduceMotion) {
      root.style.setProperty("--a11y-transition-duration", "0ms");
      root.style.setProperty("--a11y-animation-duration", "0ms");
    } else {
      root.style.setProperty("--a11y-transition-duration", "150ms");
      root.style.setProperty("--a11y-animation-duration", "300ms");
    }

    // Apply transparency preferences
    if (newSettings.reduceTransparency) {
      root.style.setProperty("--a11y-backdrop-opacity", "1");
    }

    // Apply dyslexia-friendly font
    if (newSettings.dyslexiaFont) {
      root.style.fontFamily = '"OpenDyslexic", "Atkinson Hyperlegible", sans-serif';
    }
  };

  // Listen to system preference changes
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrastQuery = window.matchMedia("(prefers-contrast: more)");

    const handleChange = () => checkSystemPreferences();

    darkModeQuery.addEventListener("change", handleChange);
    motionQuery.addEventListener("change", handleChange);
    contrastQuery.addEventListener("change", handleChange);

    return () => {
      darkModeQuery.removeEventListener("change", handleChange);
      motionQuery.removeEventListener("change", handleChange);
      contrastQuery.removeEventListener("change", handleChange);
    };
  }, [checkSystemPreferences]);

  return {
    settings,
    updateSetting,
    checkSystemPreferences,
  };
}

function getFontSizeValue(size: AccessibilitySettings["fontSize"]): string {
  const map: Record<typeof size, string> = {
    small: "0.875rem",
    normal: "1rem",
    large: "1.125rem",
    xlarge: "1.5rem",
  };
  return map[size];
}

function getLetterSpacingValue(spacing: AccessibilitySettings["letterSpacing"]): string {
  const map: Record<typeof spacing, string> = {
    normal: "0em",
    wide: "0.05em",
    "extra-wide": "0.1em",
  };
  return map[spacing];
}

function getLineHeightValue(height: AccessibilitySettings["lineHeight"]): string {
  const map: Record<typeof height, string> = {
    normal: "1.5",
    relaxed: "1.75",
    "very-relaxed": "2",
  };
  return map[height];
}

function getFocusIndicatorSize(size: AccessibilitySettings["focusIndicatorSize"]): string {
  const map: Record<typeof size, string> = {
    normal: "2px",
    large: "3px",
    xlarge: "4px",
  };
  return map[size];
}
