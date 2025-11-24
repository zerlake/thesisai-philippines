import { useCallback, useMemo } from "react";

export interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  confidence: number;
  trigger: string; // What triggered this suggestion
  shortcut?: string;
}

/**
 * Hook for AI-powered contextual suggestions
 * Provides just-in-time help and feature discovery
 */
export function useContextualSuggestions(
  currentContext: {
    feature?: string;
    action?: string;
    timeSpentMs?: number;
    previousActions?: string[];
  }
) {
  // Knowledge base of contextual suggestions
  const suggestionMap = useMemo<Record<string, ContextualSuggestion[]>>(() => ({
    // Research phase suggestions
    "research-planning": [
      {
        id: "gap-identifier",
        title: "Use Research Gap Identifier",
        description: "Automatically identify gaps in your research",
        action: "open-gap-identifier",
        icon: "🔍",
        confidence: 0.9,
        trigger: "user_in_research_planning_for_5min",
        shortcut: "Ctrl+G",
      },
      {
        id: "ai-ideation",
        title: "Generate Research Questions",
        description: "Let AI suggest research questions for your topic",
        action: "open-ai-ideation",
        icon: "💡",
        confidence: 0.85,
        trigger: "topic_defined",
        shortcut: "Ctrl+I",
      },
    ],
    "content-creation": [
      {
        id: "paraphrase-assist",
        title: "Quick Paraphrase",
        description: "Rewrite selected text while maintaining meaning",
        action: "open-paraphraser",
        icon: "✏️",
        confidence: 0.88,
        trigger: "long_text_selected",
        shortcut: "Ctrl+P",
      },
      {
        id: "citation-helper",
        title: "Generate Citation",
        description: "Auto-cite your sources in APA/MLA format",
        action: "open-citation",
        icon: "📚",
        confidence: 0.92,
        trigger: "citation_mentioned",
        shortcut: "Ctrl+C",
      },
    ],
    "manuscript-review": [
      {
        id: "grammar-check",
        title: "Grammar & Tone Check",
        description: "Improve clarity and academic tone",
        action: "open-grammar",
        icon: "✓",
        confidence: 0.9,
        trigger: "manuscript_pasted",
        shortcut: "Ctrl+.",
      },
      {
        id: "format-checker",
        title: "Check University Format",
        description: "Verify compliance with your university's requirements",
        action: "open-format-checker",
        icon: "📋",
        confidence: 0.87,
        trigger: "nearing_submission",
        shortcut: "Ctrl+F",
      },
    ],
    "defense-prep": [
      {
        id: "qa-simulator",
        title: "Practice Defense Q&A",
        description: "AI simulates advisor questions based on your thesis",
        action: "open-qa-simulator",
        icon: "🎤",
        confidence: 0.91,
        trigger: "defense_date_set",
        shortcut: "Ctrl+?",
      },
      {
        id: "slides-generator",
        title: "Generate Defense Slides",
        description: "Create presentation slides from your thesis",
        action: "open-slides",
        icon: "📊",
        confidence: 0.88,
        trigger: "defense_approaching",
        shortcut: "Ctrl+S",
      },
    ],
  }), []);

  const getSuggestions = useCallback(
    (context: typeof currentContext): ContextualSuggestion[] => {
      const suggestions: ContextualSuggestion[] = [];

      // Feature-based suggestions
      if (context.feature && suggestionMap[context.feature]) {
        suggestions.push(...suggestionMap[context.feature]);
      }

      // Time-based suggestions (suggest help if user stuck > 3min)
      if (context.timeSpentMs && context.timeSpentMs > 3 * 60 * 1000) {
        suggestions.push({
          id: "help-support",
          title: "Need Help?",
          description: "Get instant support or watch a tutorial",
          action: "open-help",
          icon: "❓",
          confidence: 0.75,
          trigger: "user_idle_for_3min",
        });
      }

      // Action-based suggestions
      if (context.action === "paste_text") {
        suggestions.push({
          id: "quick-improve",
          title: "Quick Improve",
          description: "Get instant suggestions to improve your text",
          action: "quick-improve",
          icon: "⚡",
          confidence: 0.8,
          trigger: "text_pasted",
        });
      }

      // Sort by confidence and return top 3
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    },
    [suggestionMap]
  );

  return { getSuggestions, suggestionMap };
}
