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
  type ErrorType,
  type RecoveryContext,
  type RecoveryStrategy,
  type ErrorPattern,
  type AlternativeApproach
} from './errors/advanced-recovery';
