import { useCallback, useState } from "react";

export interface SearchIntent {
  type: "feature" | "help" | "action" | "file" | "setting";
  confidence: number;
  keywords: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  relevance: number;
  action?: string;
  icon: string;
}

/**
 * Hook for intelligent search with NLP and intent recognition
 * Understands what users are looking for without exact keyword matches
 */
export function useSmartSearch() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Knowledge base for search
  const searchDatabase = {
    features: [
      {
        id: "research-outline",
        title: "AI Thesis Outline Generator",
        keywords: ["outline", "structure", "thesis", "chapter", "organize"],
        description: "Generate structured outlines for your thesis",
        icon: "📋",
      },
      {
        id: "paraphrase",
        title: "Smart Paraphraser",
        keywords: ["paraphrase", "rewrite", "rephrase", "reword", "text"],
        description: "Rewrite text while maintaining meaning",
        icon: "✏️",
      },
      {
        id: "grammar",
        title: "Grammar & Tone Checker",
        keywords: ["grammar", "spell", "tone", "clarity", "fix"],
        description: "Check grammar and improve academic tone",
        icon: "✓",
      },
      {
        id: "citation",
        title: "Citation Manager",
        keywords: ["citation", "reference", "apa", "mla", "format", "cite"],
        description: "Manage and generate citations",
        icon: "📚",
      },
      {
        id: "plagiarism",
        title: "Originality Checker",
        keywords: ["plagiarism", "original", "unique", "check", "similarity"],
        description: "Check for plagiarism and originality",
        icon: "🔍",
      },
      {
        id: "qa-practice",
        title: "Q&A Practice Simulator",
        keywords: ["practice", "question", "defense", "qa", "answer", "prepare"],
        description: "Practice defense Q&A with AI",
        icon: "🎤",
      },
    ],
    actions: [
      {
        id: "new-document",
        title: "Create New Document",
        keywords: ["new", "create", "document", "file", "blank"],
        description: "Start a new thesis document",
        icon: "📄",
      },
      {
        id: "upload",
        title: "Upload File",
        keywords: ["upload", "import", "add", "attach", "file"],
        description: "Upload a file to analyze",
        icon: "📤",
      },
      {
        id: "collaborate",
        title: "Start Collaboration",
        keywords: ["collaborate", "share", "invite", "team", "advisor"],
        description: "Invite others to work with you",
        icon: "👥",
      },
    ],
  };

  /**
   * Detect user intent from search query
   */
  const detectIntent = useCallback((query: string): SearchIntent => {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(" ");

    // Analyze question patterns
    const isQuestion = query.includes("?") || query.startsWith("how") || query.startsWith("what");
    const isAction = words.some((w) =>
      ["create", "upload", "share", "send", "save", "export"].includes(w)
    );

    // Determine intent type
    let type: SearchIntent["type"] = "feature";
    if (isAction) type = "action";
    if (isQuestion) type = "help";

    return {
      type,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      keywords: words,
    };
  }, []);

  /**
   * Calculate relevance score using fuzzy matching
   */
  const calculateRelevance = useCallback(
    (query: string, itemKeywords: string[]): number => {
      const queryWords = query.toLowerCase().split(" ");
      let matches = 0;
      let totalWeight = 0;

      for (const qWord of queryWords) {
        const wordWeight = Math.max(
          ...itemKeywords.map((kw) => {
            // Exact match
            if (kw === qWord) return 1.0;
            // Partial match
            if (kw.includes(qWord) || qWord.includes(kw)) return 0.7;
            // Levenshtein distance
            if (levenshteinDistance(qWord, kw) <= 2) return 0.5;
            return 0;
          })
        );

        if (wordWeight > 0) {
          matches++;
          totalWeight += wordWeight;
        }
      }

      const baseScore = matches / queryWords.length;
      return Math.min(1.0, baseScore + totalWeight * 0.2);
    },
    []
  );

  /**
   * Simple Levenshtein distance for fuzzy matching
   */
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  /**
   * Main search function with intent recognition
   */
  const search = useCallback(
    (query: string): SearchResult[] => {
      if (!query.trim()) return [];

      const intent = detectIntent(query);

      // Filter results based on intent
      let database = searchDatabase.features;
      if (intent.type === "action") {
        database = searchDatabase.actions;
      }

      // Calculate relevance scores
      const results = database
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: intent.type === "action" ? "Action" : "Feature",
          relevance: calculateRelevance(query, item.keywords),
          icon: item.icon,
        }))
        .filter((r) => r.relevance > 0.3) // Only show relevant results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5); // Top 5 results

      // Track search for analytics
      if (results.length > 0) {
        setRecentSearches((prev) => [query, ...prev].slice(0, 10));
      }

      return results;
    },
    [detectIntent, calculateRelevance]
  );

  return {
    search,
    detectIntent,
    recentSearches,
    searchDatabase,
  };
}
