/**
 * AI React Hooks
 * Phase 5 Sprint 4: Integration Layer
 *
 * Custom React hooks for AI functionality:
 * - useAIAnalysis - Content analysis
 * - useAISuggestions - Real-time suggestions
 * - useAIFeedback - Thesis feedback
 * - useAIGeneration - Content generation
 * - useAIProfile - User profile management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiService, type AIAnalysisResult, type AIServiceContext } from './ai-service';
import type { ThesisFeedback } from '../feedback/thesis-feedback-engine';
import type { RealtimeSuggestion, SuggestionContext } from '../suggestions/realtime-suggestions';
import type { GeneratedContent, MultiModalRequest } from '../multimodal/multimodal-generator';
import type { AdaptiveUserProfile, PersonalizedRecommendation } from '../adaptive/adaptive-engine';
import type { CompletionPrediction } from '../predictive/completion-predictor';

// ============================================
// useAIAnalysis Hook
// ============================================

export interface UseAIAnalysisOptions {
  autoAnalyze?: boolean;
  debounceMs?: number;
  includeSemantics?: boolean;
  includePredictions?: boolean;
}

export interface UseAIAnalysisReturn {
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  error: Error | null;
  analyze: (content: string, section?: string) => Promise<AIAnalysisResult | null>;
  clearAnalysis: () => void;
}

export function useAIAnalysis(
  initialContent?: string,
  options: UseAIAnalysisOptions = {}
): UseAIAnalysisReturn {
  const {
    autoAnalyze = false,
    debounceMs = 1000,
    includeSemantics = true,
    includePredictions = false
  } = options;

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const analyze = useCallback(async (
    content: string,
    section?: string
  ): Promise<AIAnalysisResult | null> => {
    if (!content || content.length < 50) {
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiService.analyze(content, {
        section,
        includeSemantics,
        includePredictions
      });
      setAnalysis(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [includeSemantics, includePredictions]);

  const debouncedAnalyze = useCallback((content: string, section?: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      analyze(content, section);
    }, debounceMs);
  }, [analyze, debounceMs]);

  useEffect(() => {
    if (autoAnalyze && initialContent) {
      debouncedAnalyze(initialContent);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [autoAnalyze, initialContent, debouncedAnalyze]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyze,
    clearAnalysis
  };
}

// ============================================
// useAISuggestions Hook
// ============================================

export interface UseAISuggestionsOptions {
  enabled?: boolean;
  debounceMs?: number;
  minConfidence?: number;
  types?: string[];
}

export interface UseAISuggestionsReturn {
  suggestions: RealtimeSuggestion[];
  isLoading: boolean;
  updateContext: (context: Partial<SuggestionContext>) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  clearSuggestions: () => void;
}

export function useAISuggestions(
  options: UseAISuggestionsOptions = {}
): UseAISuggestionsReturn {
  const {
    enabled = true,
    debounceMs = 300,
    minConfidence = 0.6,
    types
  } = options;

  const [suggestions, setSuggestions] = useState<RealtimeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const contextRef = useRef<Partial<SuggestionContext>>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = aiService.subscribeSuggestions(
      (newSuggestions) => {
        setSuggestions(newSuggestions);
        setIsLoading(false);
      },
      { types, minConfidence }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, types, minConfidence]);

  const updateContext = useCallback((partialContext: Partial<SuggestionContext>) => {
    if (!enabled) return;

    contextRef.current = { ...contextRef.current, ...partialContext };

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      const fullContext: SuggestionContext = {
        fullText: contextRef.current.fullText || '',
        cursorPosition: contextRef.current.cursorPosition || 0,
        selectedText: contextRef.current.selectedText,
        section: contextRef.current.section || 'general',
        recentEdits: contextRef.current.recentEdits || []
      };

      try {
        const newSuggestions = await aiService.getSuggestions(fullContext);
        setSuggestions(newSuggestions);
      } catch {
        // Silently fail for suggestions
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [enabled, debounceMs]);

  const acceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    // Record interaction
    aiService.recordInteraction('feedback-response', {
      suggestionId,
      response: 'accepted',
      category: 'suggestion'
    });
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    // Record interaction
    aiService.recordInteraction('feedback-response', {
      suggestionId,
      response: 'rejected',
      category: 'suggestion'
    });
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    updateContext,
    acceptSuggestion,
    dismissSuggestion,
    clearSuggestions
  };
}

// ============================================
// useAIFeedback Hook
// ============================================

export interface UseAIFeedbackOptions {
  autoFetch?: boolean;
  section?: string;
}

export interface UseAIFeedbackReturn {
  feedback: ThesisFeedback | null;
  isLoading: boolean;
  error: Error | null;
  getFeedback: (content: string, section?: string) => Promise<ThesisFeedback | null>;
  clearFeedback: () => void;
}

export function useAIFeedback(
  options: UseAIFeedbackOptions = {}
): UseAIFeedbackReturn {
  const { section = 'general' } = options;

  const [feedback, setFeedback] = useState<ThesisFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getFeedback = useCallback(async (
    content: string,
    sectionOverride?: string
  ): Promise<ThesisFeedback | null> => {
    if (!content || content.length < 50) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.getThesisFeedback(
        content,
        sectionOverride || section
      );
      setFeedback(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return {
    feedback,
    isLoading,
    error,
    getFeedback,
    clearFeedback
  };
}

// ============================================
// useAIGeneration Hook
// ============================================

export interface UseAIGenerationReturn {
  content: GeneratedContent | null;
  isGenerating: boolean;
  error: Error | null;
  generate: (request: MultiModalRequest) => Promise<GeneratedContent | null>;
  clearContent: () => void;
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (
    request: MultiModalRequest
  ): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiService.generateContent(request);
      setContent(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearContent = useCallback(() => {
    setContent(null);
    setError(null);
  }, []);

  return {
    content,
    isGenerating,
    error,
    generate,
    clearContent
  };
}

// ============================================
// useAIProfile Hook
// ============================================

export interface UseAIProfileReturn {
  profile: AdaptiveUserProfile | null;
  recommendations: PersonalizedRecommendation[];
  prediction: CompletionPrediction | null;
  isLoading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<AdaptiveUserProfile>) => Promise<void>;
}

export function useAIProfile(userId?: string): UseAIProfileReturn {
  const [profile, setProfile] = useState<AdaptiveUserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [prediction, setPrediction] = useState<CompletionPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [profileData, recs, pred] = await Promise.all([
        aiService.getAdaptiveProfile(userId),
        aiService.getRecommendations(userId),
        aiService.getPrediction(userId)
      ]);

      setProfile(profileData);
      setRecommendations(recs);
      setPrediction(pred);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<AdaptiveUserProfile>) => {
    if (!userId) return;

    try {
      const updated = await aiService.updateAdaptiveProfile(updates, userId);
      setProfile(updated);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshProfile();
    }
  }, [userId, refreshProfile]);

  return {
    profile,
    recommendations,
    prediction,
    isLoading,
    error,
    refreshProfile,
    updateProfile
  };
}

// ============================================
// useAIMetrics Hook
// ============================================

export interface UseAIMetricsReturn {
  systemMetrics: any;
  toolMetrics: any[];
  refreshMetrics: () => void;
}

export function useAIMetrics(autoRefresh: boolean = false): UseAIMetricsReturn {
  const [metrics, setMetrics] = useState<{
    systemMetrics: any;
    toolMetrics: any[];
  }>({ systemMetrics: null, toolMetrics: [] });

  const refreshMetrics = useCallback(() => {
    const data = aiService.getMetrics();
    setMetrics({
      systemMetrics: data.system,
      toolMetrics: data.tools
    });
  }, []);

  useEffect(() => {
    refreshMetrics();

    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshMetrics]);

  return {
    systemMetrics: metrics.systemMetrics,
    toolMetrics: metrics.toolMetrics,
    refreshMetrics
  };
}

// ============================================
// useAIInit Hook
// ============================================

export interface UseAIInitReturn {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  initialize: (context: AIServiceContext) => Promise<void>;
  reset: () => void;
}

export function useAIInit(): UseAIInitReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async (context: AIServiceContext) => {
    setIsInitializing(true);
    setError(null);

    try {
      await aiService.initialize(context);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const reset = useCallback(() => {
    aiService.reset();
    setIsInitialized(false);
    setError(null);
  }, []);

  return {
    isInitialized,
    isInitializing,
    error,
    initialize,
    reset
  };
}
