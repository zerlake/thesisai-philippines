/**
 * Integration Module Index
 * Phase 5 Sprint 4: Integration Layer
 */

// AI Service
export {
  AIService,
  aiService,
  initializeAI,
  analyzeContent,
  getThesisFeedback,
  generateAIContent,
  type AIServiceConfig,
  type AIServiceContext,
  type AIAnalysisResult,
  type AIGenerationResult
} from './ai-service';

// React Hooks
export {
  useAIAnalysis,
  useAISuggestions,
  useAIFeedback,
  useAIGeneration,
  useAIProfile,
  useAIMetrics,
  useAIInit,
  type UseAIAnalysisOptions,
  type UseAIAnalysisReturn,
  type UseAISuggestionsOptions,
  type UseAISuggestionsReturn,
  type UseAIFeedbackOptions,
  type UseAIFeedbackReturn,
  type UseAIGenerationReturn,
  type UseAIProfileReturn,
  type UseAIMetricsReturn,
  type UseAIInitReturn
} from './use-ai';

// React Provider
export {
  AIProvider,
  useAI,
  useAIReady,
  useAIError,
  useAIProfileData,
  useAISuggestionsData,
  withAI,
  AIContext,
  type AIProviderState,
  type AIProviderActions,
  type AIContextValue,
  type AIProviderProps,
  type WithAIProps
} from './ai-provider';
