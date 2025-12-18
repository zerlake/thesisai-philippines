// Phase 5 AI Enhancement - Core Modules
// Export all AI-related modules for easy import

// Intelligent Caching
export {
  IntelligentCache,
  intelligentCache,
  type CacheConfig,
  type CacheMetrics
} from './cache/intelligent-cache';

// Tool Orchestration
export {
  ToolOrchestrator,
  orchestrator,
  type ToolChainStep,
  type ChainContext,
  type ChainResult,
  type AITool
} from './orchestration/tool-orchestrator';

// Error Recovery
export {
  AdvancedRecoveryEngine,
  advancedRecoveryEngine,
  type ErrorType as RecoveryErrorType,
  type RecoveryContext,
  type RecoveryStrategy,
  type ErrorPattern as RecoveryErrorPattern,
  type AlternativeApproach
} from './errors/advanced-recovery';

// Context Engine (Phase 5 Week 2)
export {
  ContextEngine,
  contextEngine,
  type ThesisContext,
  type ThesisSection,
  type SectionType,
  type DocumentStructure,
  type OutlineItem,
  type UserProgress,
  type ActivityItem,
  type UserPreferences,
  type ContextualSuggestion,
  type SuggestionType,
  type SuggestionAction
} from './context/context-engine';

// Learning Adapter (Phase 5 Week 2)
export {
  LearningAdapter,
  learningAdapter,
  type UserLearningPattern,
  type WritingPatterns,
  type WordFrequency,
  type ErrorPattern as LearningErrorPattern,
  type ErrorType as LearningErrorType,
  type FeedbackHistoryItem,
  type InteractionStyles,
  type SkillLevels,
  type LearningPreferences,
  type AdaptedResponse,
  type ResponseCustomization
} from './learning/learning-adapter';

// Thesis Feedback Engine (Phase 5 Week 2)
export {
  ThesisFeedbackEngine,
  thesisFeedbackEngine,
  type ThesisSubmission,
  type AnalysisCriteria,
  type FeedbackSuggestion,
  type FeedbackCategory,
  type ThesisFeedback
} from './feedback/thesis-feedback-engine';

// Completion Predictor (Phase 5 Week 2)
export {
  CompletionPredictor,
  completionPredictor,
  type ThesisProgressData,
  type CompletionPrediction,
  type CompletionTrend
} from './predictive';

// Feedback Aggregator (Phase 5 Week 2)
export {
  FeedbackAggregator,
  feedbackAggregator,
  type FeedbackSource,
  type FeedbackSourceType,
  type AggregatedFeedback,
  type FeedbackSourceResult,
  type FeedbackIssue,
  type IssueLocation,
  type PrioritizedIssue,
  type CategorySummary,
  type ActionItem,
  type FeedbackProgress,
  type FeedbackHistoryEntry
} from './feedback/feedback-aggregator';

// Real-time Suggestions (Phase 5 Week 2)
export {
  RealtimeSuggestionEngine,
  realtimeSuggestions,
  type RealtimeSuggestion,
  type SuggestionType as RealtimeSuggestionType,
  type TriggerInfo,
  type SuggestionAction as RealtimeSuggestionAction,
  type SuggestionMetadata,
  type SuggestionConfig,
  type SuggestionContext,
  type EditEvent,
  type SuggestionSubscriber
} from './suggestions/realtime-suggestions';

// AI Metrics & Monitoring (Phase 5 Week 2)
export {
  AIMetricsCollector,
  aiMetrics,
  type MetricEvent,
  type MetricType,
  type ToolMetrics,
  type SystemMetrics,
  type UserEngagement,
  type PerformanceAlert,
  type AlertType,
  type AlertThresholds,
  type MetricsConfig
} from './monitoring/ai-metrics';

// Semantic Analyzer (Phase 5 Sprint 2)
export {
  SemanticAnalyzer,
  semanticAnalyzer,
  type SemanticAnalysisResult,
  type ConceptEntity,
  type ConceptType,
  type ArgumentStructure,
  type ArgumentType,
  type EvidenceItem,
  type TextPosition,
  type SentimentAnalysis,
  type SentimentScore,
  type CoherenceAnalysis,
  type CoherenceIssue,
  type ConceptRelationship,
  type RelationshipType,
  type SemanticSummary,
  type SimilarityResult,
  type SemanticConfig
} from './semantic/semantic-analyzer';

// Multi-Modal Generator (Phase 5 Sprint 3)
export {
  MultiModalGenerator,
  multiModalGenerator,
  type MultiModalRequest,
  type ContentType,
  type ContentInput,
  type DataSet,
  type DataSeries,
  type GenerationOptions,
  type GeneratedContent,
  type ContentMetadata,
  type DiagramSpec,
  type DiagramElement,
  type DiagramConnection,
  type FlowchartSpec,
  type FlowchartNode,
  type FlowchartEdge,
  type PresentationSlide,
  type VideoScript,
  type VideoScene
} from './multimodal/multimodal-generator';

// Adaptive Learning Engine (Phase 5 Sprint 3)
export {
  AdaptiveEngine,
  adaptiveEngine,
  type AdaptiveUserProfile,
  type UserDemographics,
  type AdaptivePreferences,
  type FeedbackStylePreference,
  type LearningStyle,
  type LearningStyleType,
  type PerformanceProfile,
  type SkillScores as AdaptiveSkillScores,
  type InteractionHistory,
  type ToolUsageStats,
  type FeedbackResponse as AdaptiveFeedbackResponse,
  type CompletedTask,
  type Milestone,
  type UserGoals,
  type Goal,
  type GoalMetric,
  type DailyTargets,
  type Deadline,
  type AdaptedContent,
  type Adaptation,
  type AdaptationType,
  type PersonalizedRecommendation,
  type RecommendationType,
  type RecommendedAction
} from './adaptive/adaptive-engine';

// Integration Layer (Phase 5 Sprint 4)
export {
  // AI Service
  AIService,
  aiService,
  initializeAI,
  analyzeContent,
  getThesisFeedback,
  generateAIContent,
  type AIServiceConfig,
  type AIServiceContext,
  type AIAnalysisResult,
  type AIGenerationResult,
  // React Hooks
  useAIAnalysis,
  useAISuggestions,
  useAIFeedback,
  useAIGeneration,
  useAIProfile,
  useAIMetrics,
  useAIInit,
  // React Provider
  AIProvider,
  useAI,
  useAIReady,
  useAIError,
  useAIProfileData,
  useAISuggestionsData,
  withAI,
  AIContext
} from './integration';

// AI Service Provider (Backend Integration)
export {
  AIServiceProvider,
  getAIServiceProvider,
  resetAIServiceProvider,
  type AIRequest,
  type AIResponse,
  type AIProvider as AIServiceProviderType
} from '../ai-service-provider';
