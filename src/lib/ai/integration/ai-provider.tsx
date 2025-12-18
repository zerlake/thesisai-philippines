/**
 * AI Provider Context
 * Phase 5 Sprint 4: Integration Layer
 *
 * React context provider for AI functionality:
 * - Centralized AI state management
 * - Automatic initialization
 * - Shared configuration
 */

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactNode
} from 'react';
import { aiService, type AIServiceConfig, type AIServiceContext } from './ai-service';
import type { AdaptiveUserProfile, PersonalizedRecommendation } from '../adaptive/adaptive-engine';
import type { CompletionPrediction } from '../predictive/completion-predictor';
import type { RealtimeSuggestion } from '../suggestions/realtime-suggestions';

// ============================================
// Types
// ============================================

export interface AIProviderState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  userId: string | null;
  documentId: string | null;
  profile: AdaptiveUserProfile | null;
  recommendations: PersonalizedRecommendation[];
  prediction: CompletionPrediction | null;
  suggestions: RealtimeSuggestion[];
}

export interface AIProviderActions {
  initialize: (context: AIServiceContext) => Promise<void>;
  reset: () => void;
  refreshProfile: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  refreshPrediction: () => Promise<void>;
  recordInteraction: (
    type: 'tool-use' | 'feedback-response' | 'task-completion' | 'session',
    data: Record<string, any>
  ) => Promise<void>;
  clearSuggestions: () => void;
}

export interface AIContextValue extends AIProviderState, AIProviderActions {
  config: AIServiceConfig;
}

export interface AIProviderProps {
  children: ReactNode;
  config?: Partial<AIServiceConfig>;
  autoInitialize?: boolean;
  userId?: string;
  documentId?: string;
}

// ============================================
// Context
// ============================================

const AIContext = createContext<AIContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

export function AIProvider({
  children,
  config: configOverride,
  autoInitialize = false,
  userId: initialUserId,
  documentId: initialDocumentId
}: AIProviderProps) {
  // State
  const [state, setState] = useState<AIProviderState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    userId: initialUserId || null,
    documentId: initialDocumentId || null,
    profile: null,
    recommendations: [],
    prediction: null,
    suggestions: []
  });

  // Config
  const config = useMemo<AIServiceConfig>(() => ({
    enableCaching: true,
    enableMetrics: true,
    enableAdaptive: true,
    enableRealtime: true,
    ...configOverride
  }), [configOverride]);

  // Initialize
  const initialize = useCallback(async (context: AIServiceContext) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await aiService.initialize(context);

      // Fetch initial data
      const [profile, recommendations, prediction] = await Promise.all([
        context.userId ? aiService.getAdaptiveProfile(context.userId) : null,
        context.userId ? aiService.getRecommendations(context.userId) : [],
        context.userId ? aiService.getPrediction(context.userId) : null
      ]);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        userId: context.userId,
        documentId: context.documentId,
        profile,
        recommendations,
        prediction
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({
        ...prev,
        isLoading: false,
        error
      }));
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    aiService.reset();
    setState({
      isInitialized: false,
      isLoading: false,
      error: null,
      userId: null,
      documentId: null,
      profile: null,
      recommendations: [],
      prediction: null,
      suggestions: []
    });
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.userId) return;

    try {
      const profile = await aiService.getAdaptiveProfile(state.userId);
      setState(prev => ({ ...prev, profile }));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, [state.userId]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!state.userId) return;

    try {
      const recommendations = await aiService.getRecommendations(state.userId);
      setState(prev => ({ ...prev, recommendations }));
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
    }
  }, [state.userId]);

  // Refresh prediction
  const refreshPrediction = useCallback(async () => {
    if (!state.userId) return;

    try {
      const prediction = await aiService.getPrediction(state.userId);
      setState(prev => ({ ...prev, prediction }));
    } catch (err) {
      console.error('Failed to refresh prediction:', err);
    }
  }, [state.userId]);

  // Record interaction
  const recordInteraction = useCallback(async (
    type: 'tool-use' | 'feedback-response' | 'task-completion' | 'session',
    data: Record<string, any>
  ) => {
    if (!state.userId) return;

    try {
      await aiService.recordInteraction(type, data, state.userId);

      // Refresh recommendations after significant interactions
      if (type === 'task-completion' || type === 'feedback-response') {
        refreshRecommendations();
      }
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  }, [state.userId, refreshRecommendations]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, suggestions: [] }));
  }, []);

  // Subscribe to suggestions
  useEffect(() => {
    if (!state.isInitialized || !config.enableRealtime) return;

    const unsubscribe = aiService.subscribeSuggestions(
      (suggestions) => {
        setState(prev => ({ ...prev, suggestions }));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [state.isInitialized, config.enableRealtime]);

  // Auto-initialize
  useEffect(() => {
    if (autoInitialize && initialUserId && !state.isInitialized) {
      initialize({
        userId: initialUserId,
        documentId: initialDocumentId || 'default'
      });
    }
  }, [autoInitialize, initialUserId, initialDocumentId, state.isInitialized, initialize]);

  // Context value
  const value = useMemo<AIContextValue>(() => ({
    ...state,
    config,
    initialize,
    reset,
    refreshProfile,
    refreshRecommendations,
    refreshPrediction,
    recordInteraction,
    clearSuggestions
  }), [
    state,
    config,
    initialize,
    reset,
    refreshProfile,
    refreshRecommendations,
    refreshPrediction,
    recordInteraction,
    clearSuggestions
  ]);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAI(): AIContextValue {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }

  return context;
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Hook for checking if AI is ready
 */
export function useAIReady(): boolean {
  const { isInitialized, isLoading } = useAI();
  return isInitialized && !isLoading;
}

/**
 * Hook for AI error handling
 */
export function useAIError(): Error | null {
  const { error } = useAI();
  return error;
}

/**
 * Hook for AI profile data
 */
export function useAIProfileData() {
  const { profile, recommendations, prediction, refreshProfile } = useAI();
  return { profile, recommendations, prediction, refreshProfile };
}

/**
 * Hook for AI suggestions
 */
export function useAISuggestionsData() {
  const { suggestions, clearSuggestions } = useAI();
  return { suggestions, clearSuggestions };
}

// ============================================
// HOC for AI initialization
// ============================================

export interface WithAIProps {
  userId: string;
  documentId?: string;
}

export function withAI<P extends object>(
  Component: React.ComponentType<P>,
  config?: Partial<AIServiceConfig>
) {
  return function WithAIComponent(props: P & WithAIProps) {
    const { userId, documentId, ...rest } = props as P & WithAIProps;

    return (
      <AIProvider
        config={config}
        autoInitialize
        userId={userId}
        documentId={documentId}
      >
        <Component {...(rest as P)} />
      </AIProvider>
    );
  };
}

// ============================================
// Export
// ============================================

export { AIContext };
