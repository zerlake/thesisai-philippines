"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Eye, Volume2, Keyboard, Zap } from "lucide-react";
import {
  useAccessibilityTheme,
  AccessibilityTheme,
} from "@/hooks/use-accessibility-theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";

/**
 * Comprehensive accessibility settings panel
 * Allows users to customize visual, auditory, and cognitive accessibility
 */
export function AccessibilitySettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { settings, updateSetting } = useAccessibilityTheme();

  const springConfig = prefersReducedMotion
    ? { type: "tween", duration: 0.3 }
    : { type: "spring", stiffness: 100, damping: 30 };

  const themes: Array<{ value: AccessibilityTheme; label: string; icon: string }> = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "high-contrast-light", label: "High Contrast Light", icon: "⚪" },
    { value: "high-contrast-dark", label: "High Contrast Dark", icon: "⚫" },
    { value: "calm", label: "Calm", icon: "🌿" },
  ];

  return (
    <>
      {/* Accessibility Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center z-30"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={springConfig}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={springConfig}
            className="fixed bottom-40 right-6 w-96 max-w-[calc(100vw-48px)] bg-white border-2 border-slate-300 rounded-lg shadow-2xl z-30 max-h-[700px] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-panel-title"
          >
            {/* Header */}
            <div className="sticky top-0 p-6 border-b-2 border-slate-300 bg-white flex items-center justify-between">
              <h2
                id="a11y-panel-title"
                className="font-bold text-lg text-slate-900"
              >
                Accessibility Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-900 transition p-2"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Theme Selection */}
              <fieldset>
                <legend className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                  <Eye className="w-5 h-5" />
                  Visual Theme
                </legend>
                <div className="space-y-2">
                  {themes.map((theme) => (
                    <label
                      key={theme.value}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={theme.value}
                        checked={settings.theme === theme.value}
                        onChange={(e) =>
                          updateSetting("theme", e.target.value as AccessibilityTheme)
                        }
                        className="w-4 h-4"
                      />
                      <span>{theme.icon}</span>
                      <span className="font-medium text-slate-900">
                        {theme.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Font Size */}
              <fieldset>
                <legend className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                  <Zap className="w-5 h-5" />
                  Text Size
                </legend>
                <div className="space-y-2">
                  {(
                    ["small", "normal", "large", "xlarge"] as const
                  ).map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={settings.fontSize === size}
                        onChange={(e) =>
                          updateSetting("fontSize", e.target.value as any)
                        }
                        className="w-4 h-4"
                      />
                      <span
                        style={{
                          fontSize: size === "small" ? "0.875rem" : 
                                   size === "normal" ? "1rem" : 
                                   size === "large" ? "1.125rem" : "1.5rem"
                        }}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Line Height */}
              <fieldset>
                <legend className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                  <Keyboard className="w-5 h-5" />
                  Line Spacing
                </legend>
                <div className="space-y-2">
                  {(["normal", "relaxed", "very-relaxed"] as const).map((height) => (
                    <label
                      key={height}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="lineHeight"
                        value={height}
                        checked={settings.lineHeight === height}
                        onChange={(e) =>
                          updateSetting("lineHeight", e.target.value as any)
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-slate-900">
                        {height === "normal" ? "Normal" : 
                         height === "relaxed" ? "Relaxed" : "Very Relaxed"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Toggles */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-300">
                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) =>
                      updateSetting("reduceMotion", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-slate-900">
                    Reduce Motion
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.dyslexiaFont}
                    onChange={(e) =>
                      updateSetting("dyslexiaFont", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-slate-900">
                    Dyslexia-Friendly Font
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.screenReaderMode}
                    onChange={(e) =>
                      updateSetting("screenReaderMode", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-slate-900">
                    Screen Reader Mode
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.reduceTransparency}
                    onChange={(e) =>
                      updateSetting("reduceTransparency", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-slate-900">
                    Reduce Transparency
                  </span>
                </label>
              </div>

              {/* Help Text */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700">
                  💡 These settings are saved locally and will persist across
                  sessions.
                </p>
              </div>

              {/* Keyboard Shortcut */}
              <p className="text-xs text-slate-600 text-center">
                Keyboard shortcut: <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-900 font-mono">Alt+A</kbd>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-20"
          />
        )}
      </AnimatePresence>
    </>
  );
}
