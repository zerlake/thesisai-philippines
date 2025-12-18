/**
 * Unified AI Service
 * Phase 5 Sprint 4: Integration Layer
 *
 * Provides a single entry point for all AI functionality:
 * - Orchestrates multiple AI modules
 * - Manages caching and performance
 * - Handles errors and recovery
 * - Tracks metrics and analytics
 * - Integrates with multiple AI service providers
 */

import { intelligentCache, type CacheConfig } from '../cache/intelligent-cache';
import { orchestrator, type AITool, type ChainResult } from '../orchestration/tool-orchestrator';
import { advancedRecoveryEngine } from '../errors/advanced-recovery';
import { contextEngine, type ThesisContext, type ThesisSection } from '../context/context-engine';
import { learningAdapter, type UserLearningPattern } from '../learning/learning-adapter';
import { thesisFeedbackEngine, type ThesisFeedback, type ThesisSubmission } from '../feedback/thesis-feedback-engine';
import { feedbackAggregator, type AggregatedFeedback } from '../feedback/feedback-aggregator';
import { completionPredictor, type CompletionPrediction } from '../predictive/completion-predictor';
import { realtimeSuggestions, type RealtimeSuggestion, type SuggestionContext } from '../suggestions/realtime-suggestions';
import { aiMetrics, type ToolMetrics, type SystemMetrics } from '../monitoring/ai-metrics';
import { semanticAnalyzer, type SemanticAnalysisResult } from '../semantic/semantic-analyzer';
import { multiModalGenerator, type GeneratedContent, type MultiModalRequest } from '../multimodal/multimodal-generator';
import { adaptiveEngine, type AdaptiveUserProfile, type PersonalizedRecommendation } from '../adaptive/adaptive-engine';
import { getAIServiceProvider, type AIRequest, type AIResponse, type AIServiceConfig as AIServiceProviderConfig } from '../../ai-service-provider';

export interface AIServiceConfig {
  enableCaching: boolean;
  enableMetrics: boolean;
  enableAdaptive: boolean;
  enableRealtime: boolean;
  userId?: string;
  documentId?: string;
}

export interface AIServiceContext {
  userId: string;
  documentId: string;
  section?: string;
  content?: string;
}

export interface AIAnalysisResult {
  feedback: AggregatedFeedback;
  semantic: SemanticAnalysisResult;
  thesisContext: ThesisContext;
  predictions?: CompletionPrediction;
  recommendations: PersonalizedRecommendation[];
  processingTime: number;
}

export interface AIGenerationResult {
  content: string;
  adaptedContent?: string;
  suggestions: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export class AIService {
  private config: AIServiceConfig;
  private initialized: boolean = false;
  private currentContext: AIServiceContext | null = null;
  private aiServiceProvider: import('../../ai-service-provider').AIServiceProvider;

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = {
      enableCaching: true,
      enableMetrics: true,
      enableAdaptive: true,
      enableRealtime: true,
      ...config
    };

    // Initialize AI service provider
    this.aiServiceProvider = getAIServiceProvider();
  }

  /**
   * Initialize the AI service for a user session
   */
  async initialize(context: AIServiceContext): Promise<void> {
    this.currentContext = context;

    // Initialize user profile if adaptive is enabled
    if (this.config.enableAdaptive && context.userId) {
      await adaptiveEngine.getProfile(context.userId);
    }

    // Build thesis context if document is provided
    if (context.documentId && context.content) {
      await this.buildContext(context);
    }

    this.initialized = true;

    if (this.config.enableMetrics) {
      aiMetrics.record({
        type: 'tool-invoked',
        tool: 'ai-service',
        success: true,
        metadata: { action: 'initialize', userId: context.userId }
      });
    }
  }

  /**
   * Build thesis context from document
   */
  private async buildContext(context: AIServiceContext): Promise<ThesisContext | null> {
    if (!context.content) return null;

    const sections: ThesisSection[] = [{
      id: context.section || 'default',
      type: 'chapter',
      title: context.section || 'Document',
      content: context.content,
      wordCount: context.content.split(/\s+/).length,
      completionPercentage: 50,
      lastModified: new Date()
    }];

    return contextEngine.buildContext(
      context.documentId,
      context.section || 'default',
      sections,
      {
        writingStyle: 'academic',
        citationFormat: 'apa7',
        language: 'en',
        aiAssistanceLevel: 'moderate',
        focusAreas: []
      }
    );
  }

  /**
   * Perform comprehensive analysis on content
   */
  async analyze(
    content: string,
    options?: {
      section?: string;
      includeSemantics?: boolean;
      includePredictions?: boolean;
    }
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    const context = this.ensureContext();

    const fetcher = async (): Promise<AIAnalysisResult> => {
      // Run analyses in parallel
      const [feedback, semantic, thesisContext] = await Promise.all([
        feedbackAggregator.aggregateFeedback(
          context.documentId,
          content,
          options?.section || 'general'
        ),
        options?.includeSemantics !== false
          ? semanticAnalyzer.analyze(context.documentId, content, options?.section)
          : Promise.resolve(this.getEmptySemanticResult(context.documentId)),
        this.buildContext({ ...context, content, section: options?.section })
      ]);

      // Get predictions if requested
      let predictions: CompletionPrediction | undefined;
      if (options?.includePredictions && context.userId) {
        try {
          predictions = await completionPredictor.predictCompletion(context.userId);
        } catch {
          // Predictions are optional, continue without them
        }
      }

      // Get personalized recommendations
      const recommendations = this.config.enableAdaptive && context.userId
        ? await adaptiveEngine.getRecommendations(context.userId)
        : [];

      return {
        feedback,
        semantic,
        thesisContext: thesisContext!,
        predictions,
        recommendations,
        processingTime: Date.now() - startTime
      };
    };

    try {
      let result: AIAnalysisResult;

      if (this.config.enableCaching) {
        const cacheKey = `analysis:${context.documentId}:${content.substring(0, 100)}`;
        result = await intelligentCache.getOrFetch<AIAnalysisResult>(
          cacheKey,
          fetcher,
          { ttl: 300000 } // 5 min TTL
        );
      } else {
        result = await fetcher();
      }

      this.recordMetric('analysis', Date.now() - startTime, true);
      return result;

    } catch (error) {
      this.recordMetric('analysis', Date.now() - startTime, false, { error: String(error) });

      // Try recovery
      const recoveryStrategy = await advancedRecoveryEngine.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { tool: 'ai-service', operation: 'analyze' }
      );

      // If strategy suggests retry, try once more
      if (recoveryStrategy.type === 'retry' && recoveryStrategy.delay) {
        await new Promise(resolve => setTimeout(resolve, recoveryStrategy.delay));
        try {
          return await fetcher();
        } catch {
          // Fall through to throw original error
        }
      }

      throw error;
    }
  }

  /**
   * Get thesis-specific feedback
   */
  async getThesisFeedback(
    content: string,
    section: string,
    options?: {
      checkGrammar?: boolean;
      checkStructure?: boolean;
      checkCitations?: boolean;
    }
  ): Promise<ThesisFeedback> {
    const startTime = Date.now();
    const context = this.ensureContext();

    try {
      const submission: ThesisSubmission = {
        userId: context.userId,
        documentId: context.documentId,
        title: section,
        content,
        section,
        wordCount: content.split(/\s+/).length,
        submissionDate: new Date(),
        version: 1
      };

      const feedback = await thesisFeedbackEngine.generateFeedback(submission, options);

      // Adapt feedback if adaptive is enabled
      if (this.config.enableAdaptive && context.userId) {
        const adapted = await adaptiveEngine.adaptContent(context.userId, feedback.overallFeedback);
        feedback.overallFeedback = adapted.adaptedContent;
      }

      this.recordMetric('thesis-feedback', Date.now() - startTime, true);
      return feedback;

    } catch (error) {
      this.recordMetric('thesis-feedback', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Get real-time suggestions as user types
   */
  async getSuggestions(suggestionContext: SuggestionContext): Promise<RealtimeSuggestion[]> {
    if (!this.config.enableRealtime) {
      return [];
    }

    const startTime = Date.now();

    try {
      const suggestions = await realtimeSuggestions.generateSuggestions(suggestionContext);
      this.recordMetric('suggestions', Date.now() - startTime, true);
      return suggestions;
    } catch (error) {
      this.recordMetric('suggestions', Date.now() - startTime, false);
      return [];
    }
  }

  /**
   * Subscribe to real-time suggestions
   */
  subscribeSuggestions(
    callback: (suggestions: RealtimeSuggestion[]) => void,
    filters?: { types?: string[]; minConfidence?: number }
  ): () => void {
    const subscriberId = `sub_${Date.now()}`;
    return realtimeSuggestions.subscribe({
      id: subscriberId,
      callback,
      filters: filters as any
    });
  }

  /**
   * Generate multi-modal content
   */
  async generateContent(request: MultiModalRequest): Promise<GeneratedContent> {
    const startTime = Date.now();

    const fetcher = async (): Promise<GeneratedContent> => {
      return multiModalGenerator.generate(request);
    };

    try {
      let content: GeneratedContent;

      if (this.config.enableCaching) {
        const cacheKey = `content:${request.type}:${JSON.stringify(request.input).substring(0, 100)}`;
        content = await intelligentCache.getOrFetch<GeneratedContent>(
          cacheKey,
          fetcher,
          { ttl: 600000 } // 10 min TTL
        );
      } else {
        content = await fetcher();
      }

      this.recordMetric('generate-content', Date.now() - startTime, true);
      return content;

    } catch (error) {
      this.recordMetric('generate-content', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Execute a tool chain workflow
   */
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>
  ): Promise<ChainResult> {
    const startTime = Date.now();

    try {
      const result = await orchestrator.executeWorkflow(workflowId, input);
      this.recordMetric('workflow', Date.now() - startTime, result.success);
      return result;
    } catch (error) {
      this.recordMetric('workflow', Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Register a custom tool with the orchestrator
   */
  registerTool(name: string, tool: AITool): void {
    orchestrator.registerTool(name, tool);
  }

  /**
   * Get user's learning pattern
   */
  async getLearningPattern(userId?: string): Promise<UserLearningPattern> {
    const id = userId || this.currentContext?.userId;
    if (!id) throw new Error('User ID required');
    return learningAdapter.getUserPattern(id);
  }

  /**
   * Get user's adaptive profile
   */
  async getAdaptiveProfile(userId?: string): Promise<AdaptiveUserProfile> {
    const id = userId || this.currentContext?.userId;
    if (!id) throw new Error('User ID required');
    return adaptiveEngine.getProfile(id);
  }

  /**
   * Update user's adaptive profile
   */
  async updateAdaptiveProfile(
    updates: Partial<AdaptiveUserProfile>,
    userId?: string
  ): Promise<AdaptiveUserProfile> {
    const id = userId || this.currentContext?.userId;
    if (!id) throw new Error('User ID required');
    return adaptiveEngine.updateProfile(id, updates);
  }

  /**
   * Record user interaction for learning
   */
  async recordInteraction(
    type: 'tool-use' | 'feedback-response' | 'task-completion' | 'session',
    data: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const id = userId || this.currentContext?.userId;
    if (!id) return;

    if (this.config.enableAdaptive) {
      await adaptiveEngine.recordInteraction(id, { type, data });
    }

    // Also update learning adapter
    if (type === 'feedback-response') {
      await learningAdapter.recordFeedbackResponse(id, {
        type: data.response,
        category: data.category,
        originalSuggestion: data.suggestion || '',
        userAction: data.action || '',
        contextSection: data.section || ''
      });
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId?: string): Promise<PersonalizedRecommendation[]> {
    const id = userId || this.currentContext?.userId;
    if (!id || !this.config.enableAdaptive) return [];
    return adaptiveEngine.getRecommendations(id);
  }

  /**
   * Get completion prediction
   */
  async getPrediction(userId?: string): Promise<CompletionPrediction | null> {
    const id = userId || this.currentContext?.userId;
    if (!id) return null;

    try {
      return await completionPredictor.predictCompletion(id);
    } catch {
      return null;
    }
  }

  /**
   * Get AI metrics
   */
  getMetrics(): {
    system: SystemMetrics;
    tools: ToolMetrics[];
  } {
    return {
      system: aiMetrics.getSystemMetrics(),
      tools: aiMetrics.getAllToolMetrics()
    };
  }

  /**
   * Get contextual suggestions based on current thesis context
   */
  async getContextualSuggestions(): Promise<any[]> {
    const context = this.currentContext;
    if (!context?.documentId) return [];

    const thesisContext = contextEngine.getCachedContext(context.documentId);
    if (!thesisContext) return [];

    return contextEngine.getSuggestions(thesisContext);
  }

  /**
   * Adapt content for user preferences
   */
  async adaptContent(content: string, userId?: string): Promise<string> {
    const id = userId || this.currentContext?.userId;
    if (!id || !this.config.enableAdaptive) return content;

    const adapted = await adaptiveEngine.adaptContent(id, content);
    return adapted.adaptedContent;
  }

  /**
   * Generate AI response using the best available provider
   */
  async generateAIResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const result = await this.aiServiceProvider.generate(request);
      this.recordMetric('ai-generation', Date.now() - startTime, true);
      return result;
    } catch (error) {
      this.recordMetric('ai-generation', Date.now() - startTime, false, { error: String(error) });
      throw error;
    }
  }

  /**
   * Get status of available AI providers
   */
  async getProviderStatus(): Promise<Record<string, boolean>> {
    return this.aiServiceProvider.getProviderStatus();
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    intelligentCache.clear();
    semanticAnalyzer.clearCache();
    realtimeSuggestions.clearCache();
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.currentContext = null;
    this.initialized = false;
    this.clearCaches();
  }

  /**
   * Ensure context is available
   */
  private ensureContext(): AIServiceContext {
    if (!this.currentContext) {
      throw new Error('AI Service not initialized. Call initialize() first.');
    }
    return this.currentContext;
  }

  /**
   * Record metric
   */
  private recordMetric(
    tool: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enableMetrics) return;

    aiMetrics.recordApiCall(tool, duration, success, metadata);
  }

  /**
   * Get empty semantic result (for when semantics are disabled)
   */
  private getEmptySemanticResult(documentId: string): SemanticAnalysisResult {
    return {
      id: `sem_empty_${Date.now()}`,
      documentId,
      timestamp: new Date(),
      concepts: [],
      arguments: [],
      sentiment: {
        overall: { positive: 0, negative: 0, neutral: 1, compound: 0 },
        bySection: {},
        confidence: 0,
        objectivity: 1,
        academicTone: 0.5
      },
      coherence: {
        overallScore: 0,
        topicConsistency: 0,
        logicalFlow: 0,
        transitionQuality: 0,
        issues: []
      },
      relationships: [],
      summary: {
        mainTopics: [],
        keyFindings: [],
        methodologyUsed: [],
        researchGaps: [],
        contributions: []
      }
    };
  }
}

// Singleton instance
export const aiService = new AIService();

// Export convenience functions
export async function initializeAI(context: AIServiceContext): Promise<void> {
  return aiService.initialize(context);
}

export async function analyzeContent(
  content: string,
  options?: { section?: string; includeSemantics?: boolean; includePredictions?: boolean }
): Promise<AIAnalysisResult> {
  return aiService.analyze(content, options);
}

export async function getThesisFeedback(
  content: string,
  section: string
): Promise<ThesisFeedback> {
  return aiService.getThesisFeedback(content, section);
}

export async function generateAIContent(request: MultiModalRequest): Promise<GeneratedContent> {
  return aiService.generateContent(request);
}
