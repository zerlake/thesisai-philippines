"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Search, Mic, MicOff, X } from "lucide-react";
import { useUserBehavior } from "@/hooks/use-user-behavior";
import { useSmartDefaults } from "@/hooks/use-smart-defaults";
import { useContextualSuggestions } from "@/hooks/use-contextual-suggestions";
import { useSmartSearch } from "@/hooks/use-smart-search";
import { useAdaptiveNavigation } from "@/hooks/use-adaptive-navigation";
import { useMultimodalInput } from "@/hooks/use-multimodal-input";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function IntelligentAssistant() {
  const prefersReducedMotion = useReducedMotion();
  const { trackEvent, analyzePatterns } = useUserBehavior();
  const [showAssistant, setShowAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  // Analyze user patterns
  const patterns = useMemo(() => analyzePatterns(), [analyzePatterns]);
  
  // Get smart defaults
  const smartDefaults = useSmartDefaults(patterns);
  
  // Get contextual suggestions
  const { getSuggestions } = useContextualSuggestions({
    feature: "manuscript-review",
    timeSpentMs: 300000,
  });

  const suggestions = useMemo(() => getSuggestions({}), [getSuggestions]);

  // Get search functionality
  const { search, detectIntent } = useSmartSearch();
  const searchResults = useMemo(() => search(searchQuery), [search, searchQuery]);

  // Get adaptive navigation
  const { navConfig } = useAdaptiveNavigation(patterns);

  // Get multimodal input
  const { isListening, startListening, stopListening, lastInput } = useMultimodalInput((command) => {
    trackEvent("voice_command", "assistant", { command });
  });

  const handleCommand = (action: string) => {
    trackEvent("suggestion_clicked", "assistant", { action });
    setShowAssistant(false);
  };

  const springConfig = prefersReducedMotion
    ? { type: "tween", duration: 0.3 }
    : { type: "spring", stiffness: 100, damping: 30 };

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.button
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center z-40"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={springConfig}
        aria-label="Open intelligent assistant"
      >
        <Lightbulb className="w-6 h-6" />
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={springConfig}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                AI Assistant
              </h3>
              <button
                onClick={() => setShowAssistant(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Smart Search */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  What do you need help with?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search features, get help..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <motion.div
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {searchResults.map((result, idx) => (
                      <motion.button
                        key={result.id}
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                        transition={{ ...springConfig, delay: idx * 0.05 }}
                        onClick={() => handleCommand(result.id)}
                        className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600 hover:bg-slate-800 transition text-left group"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{result.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white group-hover:text-blue-300">
                              {result.title}
                            </p>
                            <p className="text-xs text-slate-400">{result.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Contextual Suggestions */}
              {!searchQuery && suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    💡 Suggestions for you
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <motion.button
                        key={suggestion.id}
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                        transition={{ ...springConfig, delay: idx * 0.05 }}
                        onClick={() => handleCommand(suggestion.action)}
                        className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition text-left"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{suggestion.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-300">
                              {suggestion.title}
                            </p>
                            <p className="text-xs text-slate-400">{suggestion.description}</p>
                            {suggestion.shortcut && (
                              <p className="text-xs text-slate-500 mt-1">{suggestion.shortcut}</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Defaults */}
              {Object.keys(smartDefaults).length > 0 && !searchQuery && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    ⚙️ Personalized for you
                  </p>
                  <div className="text-xs text-slate-400 space-y-1">
                    {Object.entries(smartDefaults).slice(0, 2).map(([key, value]) => (
                      <p key={key} className="p-2 bg-slate-800/30 rounded text-slate-300">
                        {value.rationale}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Input Status */}
              {lastInput?.type === "voice" && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1 }}
                  className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300"
                >
                  ✓ Voice command understood: "{lastInput.text}"
                </motion.div>
              )}
            </div>

            {/* Voice Input Button */}
            <div className="border-t border-slate-700 p-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  isListening
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Command (Cmd+Shift+Space)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssistant(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
