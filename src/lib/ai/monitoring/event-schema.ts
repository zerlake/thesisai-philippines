/**
 * AI Pipeline Event Schema
 * Phase 5: Real-time Monitoring & Analytics
 */

export interface AIPipelineEvent {
  id: string;
  timestamp: number;
  module: 'cache' | 'orchestration' | 'errors' | 'context' | 'feedback' | 'suggestions' | 'semantic' | 'multimodal' | 'adaptive' | 'integration';
  operation: string;
  userId?: string;
  documentId?: string;
  metadata: {
    // Performance metrics
    duration?: number;
    cacheHit?: boolean;
    cacheKey?: string;
    provider?: string;
    workflowId?: string;
    stepId?: string;
    retries?: number;
    errorType?: string;
    errorMessage?: string;
    recoveryStrategy?: string;
    fallbackUsed?: boolean;
  };
  context?: {
    section?: string;
    contentLength?: number;
    requestType?: string;
    responseSize?: number;
  };
  tags?: string[];
}

export interface CacheEvent extends AIPipelineEvent {
  module: 'cache';
  operation: 'get' | 'set' | 'delete' | 'evict' | 'hit' | 'miss' | 'deduplicate' | 'ttl_expired';
  metadata: AIPipelineEvent['metadata'] & {
    cacheSize?: number;
    evictionPolicy?: string;
    ttl?: number;
    staleWhileRevalidate?: boolean;
  };
}

export interface OrchestrationEvent extends AIPipelineEvent {
  module: 'orchestration';
  operation: 'workflow_start' | 'workflow_end' | 'step_start' | 'step_end' | 'retry' | 'timeout' | 'parallel_execute' | 'sequential_execute';
  metadata: AIPipelineEvent['metadata'] & {
    workflowName: string;
    stepName?: string;
    stepOrder?: number;
    parallelSteps?: number;
  };
}

export interface ErrorEvent extends AIPipelineEvent {
  module: 'errors';
  operation: 'error_detected' | 'recovery_attempted' | 'recovery_success' | 'recovery_failure' | 'fallback_executed';
  metadata: AIPipelineEvent['metadata'] & {
    errorType: 'connection_timeout' | 'api_error' | 'validation_error' | 'rate_limit' | 'authentication_error' | 'unknown_error';
    recoveryStrategy: 'retry' | 'fallback' | 'cache' | 'skip' | 'timeout';
    fallbackUsed?: boolean;
  };
}

export interface ContextEvent extends AIPipelineEvent {
  module: 'context';
  operation: 'extract' | 'validate' | 'update' | 'consistency_check';
  metadata: AIPipelineEvent['metadata'] & {
    extractionType: 'title' | 'abstract' | 'research_question' | 'methodology' | 'style_detection';
    confidence?: number;
    fieldOfStudy?: string;
    writingStyle?: string;
  };
}

export interface FeedbackEvent extends AIPipelineEvent {
  module: 'feedback';
  operation: 'analyze' | 'aggregate' | 'prioritize' | 'generate';
  metadata: AIPipelineEvent['metadata'] & {
    feedbackCount?: number;
    priorityIssues?: number;
    integrationType: 'grammar' | 'paraphraser' | 'semantic';
  };
}

export interface SuggestionsEvent extends AIPipelineEvent {
  module: 'suggestions';
  operation: 'generate' | 'accept' | 'reject' | 'stream' | 'debounce';
  metadata: AIPipelineEvent['metadata'] & {
    suggestionCount?: number;
    acceptanceRate?: number;
    suggestionType?: string;
    latency?: number;
  };
}

export interface SemanticEvent extends AIPipelineEvent {
  module: 'semantic';
  operation: 'analyze' | 'embed' | 'compare' | 'relate' | 'analyze_sentiment';
  metadata: AIPipelineEvent['metadata'] & {
    conceptCount?: number;
    similarityScore?: number;
    embeddingSize?: number;
    sentimentScore?: number;
  };
}

export interface MultimodalEvent extends AIPipelineEvent {
  module: 'multimodal';
  operation: 'generate' | 'process' | 'render' | 'convert';
  metadata: AIPipelineEvent['metadata'] & {
    contentType: 'diagram' | 'chart' | 'video' | 'audio';
    outputFormat?: string;
    processingTime?: number;
  };
}

export interface AdaptiveEvent extends AIPipelineEvent {
  module: 'adaptive';
  operation: 'profile_load' | 'profile_update' | 'adapt_content' | 'track_preference';
  metadata: AIPipelineEvent['metadata'] & {
    profileSize?: number;
    preferenceCount?: number;
    adaptationType?: string;
  };
}

export interface IntegrationEvent extends AIPipelineEvent {
  module: 'integration';
  operation: 'provider_route' | 'fallback_switch' | 'request' | 'response';
  metadata: AIPipelineEvent['metadata'] & {
    primaryProvider: string;
    fallbackUsed?: boolean;
    requestSize?: number;
    responseSize?: number;
  };
}