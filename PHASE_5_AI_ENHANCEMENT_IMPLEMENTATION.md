# Phase 5 Advanced AI Features - Implementation Templates

## Quick Implementation Guide

This document provides ready-to-use implementation templates for the most critical AI enhancements.

---

## 1. Intelligent Caching Layer

### File: `src/lib/ai/cache/intelligent-cache.ts`

```typescript
import { LRUCache } from 'lru-cache';

export interface CacheConfig {
  ttl?: number;                          // Time to live in ms
  staleWhileRevalidate?: number;         // Serve stale while updating
  revalidateOnFocus?: boolean;           // Refresh on tab focus
  dependencies?: string[];               // Invalidate on changes
  strategy?: 'cache-first' | 'network-first' | 'network-only' | 'cache-only';
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgRetrievalTime: number;
  size: number;
  maxSize: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  staleAt?: number;
  source: 'api' | 'cache' | 'mock';
}

export class IntelligentCache {
  private cache: LRUCache<string, CacheEntry<any>>;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    avgRetrievalTime: 0,
    size: 0,
    maxSize: 0
  };
  private updatePromises: Map<string, Promise<any>> = new Map();
  private dependencyMap: Map<string, Set<string>> = new Map();

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({ max: maxSize });
    this.metrics.maxSize = maxSize;
  }

  /**
   * Get or fetch value with intelligent caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Check cache
      const cached = this.cache.get(key);
      
      if (cached && config.strategy !== 'network-only') {
        const now = Date.now();
        
        // Return if fresh
        if (now < cached.expiresAt) {
          this.recordHit(startTime);
          return cached.data as T;
        }
        
        // Handle stale-while-revalidate
        if (
          config.staleWhileRevalidate &&
          cached.staleAt &&
          now < cached.staleAt
        ) {
          this.recordHit(startTime);
          // Revalidate in background
          this.updateInBackground(key, fetcher, config);
          return cached.data as T;
        }
      }

      // Fetch new data
      const data = await this.executeWithDedup(key, fetcher, config);
      
      // Store in cache
      this.setCached(key, data, config);
      
      // Register dependencies
      if (config.dependencies) {
        this.registerDependencies(key, config.dependencies);
      }

      this.recordMiss(startTime);
      return data;
    } catch (error) {
      // On error, return stale data if available
      const cached = this.cache.get(key);
      if (cached && config.strategy !== 'network-only') {
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Deduplicate concurrent requests
   */
  private async executeWithDedup<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    // If request already in flight, return that promise
    const existing = this.updatePromises.get(key);
    if (existing) {
      return existing;
    }

    // Create new promise
    const promise = fetcher()
      .then(data => {
        this.updatePromises.delete(key);
        return data;
      })
      .catch(error => {
        this.updatePromises.delete(key);
        throw error;
      });

    this.updatePromises.set(key, promise);
    return promise;
  }

  /**
   * Revalidate cache entry in background
   */
  private async updateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.setCached(key, data, config);
    } catch (error) {
      // Silently fail background updates
      console.debug(`Background update failed for ${key}:`, error);
    }
  }

  /**
   * Store value in cache with TTL
   */
  private setCached<T>(key: string, data: T, config: CacheConfig): void {
    const now = Date.now();
    const ttl = config.ttl ?? 5 * 60 * 1000; // Default 5 minutes

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      staleAt: config.staleWhileRevalidate 
        ? now + ttl + config.staleWhileRevalidate 
        : undefined,
      source: 'api'
    };

    this.cache.set(key, entry);
    this.updateMetrics();
  }

  /**
   * Invalidate cache by pattern or dependency
   */
  async invalidate(pattern: string | RegExp): Promise<void> {
    const isRegex = pattern instanceof RegExp;
    
    for (const key of this.cache.keys()) {
      const matches = isRegex
        ? (pattern as RegExp).test(key)
        : key.includes(pattern as string);
      
      if (matches) {
        this.cache.delete(key);
      }
    }

    this.updateMetrics();
  }

  /**
   * Prefetch data into cache
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<void> {
    await this.getOrFetch(key, fetcher, config);
  }

  /**
   * Warm cache with multiple keys
   */
  async warmCache<T>(
    keys: Array<{ key: string; fetcher: () => Promise<T> }>,
    config: CacheConfig = {}
  ): Promise<void> {
    await Promise.all(
      keys.map(({ key, fetcher }) =>
        this.prefetch(key, fetcher, config).catch(() => {
          // Ignore prefetch errors
        })
      )
    );
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.updatePromises.clear();
    this.dependencyMap.clear();
    this.updateMetrics();
  }

  /**
   * Register dependency relationships
   */
  private registerDependencies(key: string, dependencies: string[]): void {
    dependencies.forEach(dep => {
      if (!this.dependencyMap.has(dep)) {
        this.dependencyMap.set(dep, new Set());
      }
      this.dependencyMap.get(dep)!.add(key);
    });
  }

  /**
   * Invalidate dependent keys
   */
  invalidateDependents(key: string): void {
    const dependents = this.dependencyMap.get(key);
    if (dependents) {
      dependents.forEach(dependent => {
        this.cache.delete(dependent);
      });
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Record cache hit
   */
  private recordHit(startTime: number): void {
    this.metrics.hits++;
    this.updateHitRate();
    this.recordTime(startTime);
  }

  /**
   * Record cache miss
   */
  private recordMiss(startTime: number): void {
    this.metrics.misses++;
    this.updateHitRate();
    this.recordTime(startTime);
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * Record retrieval time
   */
  private recordTime(startTime: number): void {
    const elapsed = performance.now() - startTime;
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.avgRetrievalTime =
      (this.metrics.avgRetrievalTime * (total - 1) + elapsed) / total;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.size = this.cache.size;
  }
}

// Singleton instance
export const intelligentCache = new IntelligentCache(200);
```

### Usage Example

```typescript
import { intelligentCache } from '@/lib/ai/cache/intelligent-cache';

// Basic usage
const data = await intelligentCache.getOrFetch(
  'research-progress:user123',
  async () => {
    const response = await fetch('/api/dashboard/widgets/research-progress');
    return response.json();
  },
  { ttl: 5 * 60 * 1000 }
);

// With stale-while-revalidate
const cachedData = await intelligentCache.getOrFetch(
  'papers-list',
  () => fetchPapersList(),
  {
    ttl: 2 * 60 * 1000,           // Fresh for 2 minutes
    staleWhileRevalidate: 5 * 60 * 1000  // Serve stale for 5 more minutes
  }
);

// With dependencies
const abstract = await intelligentCache.getOrFetch(
  'thesis:abstract',
  () => generateAbstract(),
  {
    ttl: 1 * 60 * 1000,
    dependencies: ['thesis:outline', 'thesis:content']
  }
);

// Invalidate when dependencies change
await intelligentCache.invalidate('thesis:outline');
await intelligentCache.invalidateDependents('thesis:outline'); // Invalidates abstract too

// Prefetch
await intelligentCache.prefetch('dashboard:stats', () => fetchStats());

// Warm cache
await intelligentCache.warmCache([
  { key: 'dashboard:widget1', fetcher: () => fetchWidget1() },
  { key: 'dashboard:widget2', fetcher: () => fetchWidget2() }
]);

// Monitor
const metrics = intelligentCache.getMetrics();
console.log(`Cache hit rate: ${(metrics.hitRate * 100).toFixed(2)}%`);
```

---

## 2. Tool Orchestration Engine

### File: `src/lib/ai/orchestration/tool-orchestrator.ts`

```typescript
export interface ToolChainStep {
  id: string;
  tool: string;
  config: Record<string, any>;
  inputTransform?: (data: any) => any;
  outputTransform?: (data: any) => any;
  errorHandler?: (error: Error, context: ChainContext) => any;
  timeout?: number;
  retryConfig?: {
    maxAttempts: number;
    backoff: 'exponential' | 'linear';
  };
}

export interface ChainContext {
  stepIndex: number;
  stepId: string;
  tool: string;
  previousResults: Map<string, any>;
  initialInput: any;
  startTime: number;
}

export interface ChainResult {
  success: boolean;
  steps: Map<string, StepResult>;
  finalOutput: any;
  executionTime: number;
  totalTokens?: number;
  errors: ChainError[];
}

interface StepResult {
  stepId: string;
  status: 'success' | 'error' | 'skipped';
  data?: any;
  error?: Error;
  executionTime: number;
  tokensUsed?: number;
}

interface ChainError {
  stepId: string;
  tool: string;
  error: Error;
  attempt: number;
}

export class ToolOrchestrator {
  private toolRegistry: Map<string, any> = new Map();
  private executionHistory: ChainResult[] = [];
  private workflows: Map<string, ToolChainStep[]> = new Map();

  /**
   * Register a tool
   */
  registerTool(name: string, tool: any): void {
    this.toolRegistry.set(name, tool);
  }

  /**
   * Execute a chain of tools sequentially
   */
  async executeChain(
    steps: ToolChainStep[],
    initialInput: any
  ): Promise<ChainResult> {
    const startTime = performance.now();
    const result: ChainResult = {
      success: true,
      steps: new Map(),
      finalOutput: initialInput,
      executionTime: 0,
      errors: []
    };

    const previousResults = new Map<string, any>();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const context: ChainContext = {
        stepIndex: i,
        stepId: step.id,
        tool: step.tool,
        previousResults,
        initialInput,
        startTime
      };

      try {
        // Prepare input
        let input = i === 0 ? initialInput : result.finalOutput;
        if (step.inputTransform) {
          input = step.inputTransform(input);
        }

        // Execute step with retry
        const stepResult = await this.executeStepWithRetry(
          step,
          input,
          context
        );

        // Transform output if needed
        let output = stepResult.data;
        if (step.outputTransform) {
          output = step.outputTransform(output);
        }

        // Store result
        previousResults.set(step.id, output);
        result.steps.set(step.id, {
          stepId: step.id,
          status: 'success',
          data: output,
          executionTime: stepResult.executionTime,
          tokensUsed: stepResult.tokensUsed
        });

        result.finalOutput = output;
      } catch (error) {
        const chainError: ChainError = {
          stepId: step.id,
          tool: step.tool,
          error: error as Error,
          attempt: 1
        };

        result.errors.push(chainError);
        result.success = false;

        // Use error handler if provided
        if (step.errorHandler) {
          try {
            const fallback = await step.errorHandler(
              error as Error,
              context
            );
            previousResults.set(step.id, fallback);
            result.steps.set(step.id, {
              stepId: step.id,
              status: 'success',
              data: fallback,
              executionTime: 0
            });
            result.finalOutput = fallback;
          } catch (handlerError) {
            // Handler failed, stop chain
            result.steps.set(step.id, {
              stepId: step.id,
              status: 'error',
              error: error as Error,
              executionTime: 0
            });
            break;
          }
        } else {
          // No handler, stop chain
          result.steps.set(step.id, {
            stepId: step.id,
            status: 'error',
            error: error as Error,
            executionTime: 0
          });
          break;
        }
      }
    }

    result.executionTime = performance.now() - startTime;
    this.executionHistory.push(result);
    
    return result;
  }

  /**
   * Execute step with retry logic
   */
  private async executeStepWithRetry(
    step: ToolChainStep,
    input: any,
    context: ChainContext
  ): Promise<StepResult> {
    const maxAttempts = step.retryConfig?.maxAttempts ?? 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const stepStartTime = performance.now();

        // Get tool
        const tool = this.toolRegistry.get(step.tool);
        if (!tool) {
          throw new Error(`Tool not registered: ${step.tool}`);
        }

        // Execute tool
        const result = await this.executeWithTimeout(
          () => tool.execute(input, step.config),
          step.timeout ?? 30000
        );

        return {
          stepId: step.id,
          status: 'success',
          data: result,
          executionTime: performance.now() - stepStartTime,
          tokensUsed: result.tokensUsed
        };
      } catch (error) {
        lastError = error as Error;

        // Wait before retry
        if (attempt < maxAttempts) {
          const delay = this.calculateBackoff(
            attempt,
            step.retryConfig?.backoff
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Execution timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(
    attempt: number,
    strategy?: 'exponential' | 'linear'
  ): number {
    if (strategy === 'linear') {
      return attempt * 1000;
    }
    // Exponential (default)
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }

  /**
   * Execute tools in parallel
   */
  async executeParallel(
    tools: string[],
    input: any
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    const promises = tools.map(async (toolName) => {
      try {
        const tool = this.toolRegistry.get(toolName);
        if (!tool) {
          throw new Error(`Tool not registered: ${toolName}`);
        }
        const result = await tool.execute(input);
        results.set(toolName, result);
      } catch (error) {
        results.set(toolName, { error });
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Create and save a workflow template
   */
  async createWorkflow(
    name: string,
    steps: ToolChainStep[]
  ): Promise<void> {
    this.workflows.set(name, steps);
  }

  /**
   * Execute a saved workflow
   */
  async executeWorkflow(
    name: string,
    input: any
  ): Promise<ChainResult> {
    const steps = this.workflows.get(name);
    if (!steps) {
      throw new Error(`Workflow not found: ${name}`);
    }
    return this.executeChain(steps, input);
  }

  /**
   * Get workflow execution history
   */
  getWorkflowHistory(
    workflowName?: string,
    limit: number = 10
  ): ChainResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get execution metrics
   */
  getMetrics() {
    const results = this.executionHistory;
    if (results.length === 0) {
      return null;
    }

    const executionTimes = results.map(r => r.executionTime);
    const successCount = results.filter(r => r.success).length;

    return {
      totalExecutions: results.length,
      successRate: successCount / results.length,
      avgExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      minExecutionTime: Math.min(...executionTimes),
      maxExecutionTime: Math.max(...executionTimes),
      errors: results.flatMap(r => r.errors)
    };
  }
}

// Singleton
export const orchestrator = new ToolOrchestrator();
```

### Usage Example

```typescript
import { orchestrator } from '@/lib/ai/orchestration/tool-orchestrator';
import { abstractGenerator } from '@/lib/ai/tools/abstract-generator';
import { paraphraser } from '@/lib/ai/tools/paraphraser';
import { grammarChecker } from '@/lib/ai/tools/grammar-checker';

// Register tools
orchestrator.registerTool('abstract-generator', abstractGenerator);
orchestrator.registerTool('paraphraser', paraphraser);
orchestrator.registerTool('grammar-checker', grammarChecker);

// Create a workflow
const abstractGenerationWorkflow = [
  {
    id: 'step1',
    tool: 'abstract-generator',
    config: { maxLength: 250 },
    timeout: 30000
  },
  {
    id: 'step2',
    tool: 'paraphraser',
    config: { mode: 'formal' },
    inputTransform: (abstract) => ({ text: abstract }),
    timeout: 25000
  },
  {
    id: 'step3',
    tool: 'grammar-checker',
    config: { detailed: true },
    inputTransform: (text) => ({ content: text }),
    errorHandler: async (error, context) => {
      console.warn(`Grammar check failed:`, error);
      return context.previousResults.get('step2'); // Return previous result
    },
    timeout: 20000
  }
];

// Save workflow
await orchestrator.createWorkflow('thesis-abstract', abstractGenerationWorkflow);

// Execute
const result = await orchestrator.executeWorkflow('thesis-abstract', {
  outline: ['Introduction', 'Methods', 'Results', 'Conclusion']
});

console.log('Success:', result.success);
console.log('Final output:', result.finalOutput);
console.log('Execution time:', result.executionTime, 'ms');

// Get metrics
const metrics = orchestrator.getMetrics();
console.log('Success rate:', (metrics.successRate * 100).toFixed(2), '%');
console.log('Avg execution time:', metrics.avgExecutionTime.toFixed(0), 'ms');
```

---

## 3. Advanced Error Recovery System

### File: `src/lib/ai/errors/advanced-recovery.ts`

```typescript
export type ErrorType =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'rate-limit'
  | 'api-error'
  | 'validation'
  | 'fallback'
  | 'unknown';

export interface RecoveryContext {
  tool: string;
  operation: 'generate' | 'analyze' | 'transform';
  userContext?: Record<string, any>;
  previousAttempts?: number;
  lastError?: Error;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'manual' | 'skip';
  action: 'wait-and-retry' | 'use-mock' | 'show-error' | 'skip-step';
  delay?: number;
  maxAttempts?: number;
  message: string;
}

export interface ErrorPattern {
  errorType: ErrorType;
  frequency: number;
  lastOccurrence: Date;
  recoverySuccessRate: number;
}

export class AdvancedRecoveryEngine {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryHistory: Array<{
    error: Error;
    strategy: RecoveryStrategy;
    success: boolean;
    timestamp: Date;
  }> = [];

  /**
   * Identify error type and generate recovery strategy
   */
  async handleError(
    error: Error,
    context: RecoveryContext
  ): Promise<RecoveryStrategy> {
    const errorType = this.classifyError(error);
    this.recordErrorPattern(errorType);

    const strategy = this.selectRecoveryStrategy(
      errorType,
      error,
      context
    );

    return strategy;
  }

  /**
   * Classify error into known types
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('timeout')
    ) {
      return 'network';
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return 'auth';
    }

    if (message.includes('429') || message.includes('rate limit')) {
      return 'rate-limit';
    }

    if (message.includes('timeout')) {
      return 'timeout';
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }

    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'api-error';
    }

    return 'unknown';
  }

  /**
   * Select recovery strategy based on error type and context
   */
  private selectRecoveryStrategy(
    errorType: ErrorType,
    error: Error,
    context: RecoveryContext
  ): RecoveryStrategy {
    const pattern = this.errorPatterns.get(errorType);
    const successRate = pattern?.recoverySuccessRate ?? 0;
    const attempts = context.previousAttempts ?? 0;

    switch (errorType) {
      case 'network':
        if (attempts < 2) {
          return {
            type: 'retry',
            action: 'wait-and-retry',
            delay: 1000 * Math.pow(2, attempts),
            maxAttempts: 3,
            message: 'Network connection issue. Retrying...'
          };
        }
        return {
          type: 'fallback',
          action: 'use-mock',
          message: 'Using offline data. Please check your connection.'
        };

      case 'timeout':
        return {
          type: 'retry',
          action: 'wait-and-retry',
          delay: 2000,
          maxAttempts: 2,
          message: 'Request timed out. Retrying with extended timeout...'
        };

      case 'rate-limit':
        return {
          type: 'retry',
          action: 'wait-and-retry',
          delay: 5000,
          maxAttempts: 1,
          message: 'Rate limited. Waiting before retry...'
        };

      case 'auth':
        return {
          type: 'manual',
          action: 'show-error',
          message: 'Authentication required. Please sign in again.'
        };

      case 'validation':
        return {
          type: 'skip',
          action: 'skip-step',
          message: 'Invalid input. Skipping this step.'
        };

      case 'api-error':
        return {
          type: 'fallback',
          action: 'use-mock',
          message: 'Service temporarily unavailable. Using cached data.'
        };

      default:
        return {
          type: 'manual',
          action: 'show-error',
          message: `An unexpected error occurred: ${error.message}`
        };
    }
  }

  /**
   * Execute recovery strategy
   */
  async executeFallback<T>(
    strategy: RecoveryStrategy,
    fallbackFn?: () => Promise<T>
  ): Promise<T | null> {
    switch (strategy.action) {
      case 'wait-and-retry':
        // Let caller handle retry
        return null;

      case 'use-mock':
        if (fallbackFn) {
          return fallbackFn();
        }
        return null;

      case 'show-error':
        // Let caller display error
        return null;

      case 'skip-step':
        return null;

      default:
        return null;
    }
  }

  /**
   * Suggest alternatives for failed operation
   */
  async suggestAlternatives(error: Error): Promise<AlternativeApproach[]> {
    const errorType = this.classifyError(error);

    const alternatives: Record<ErrorType, AlternativeApproach[]> = {
      network: [
        {
          description: 'Check internet connection',
          action: 'verify-connectivity'
        },
        {
          description: 'Try a different network',
          action: 'switch-network'
        },
        {
          description: 'Use cached data',
          action: 'use-cache'
        }
      ],
      timeout: [
        {
          description: 'Try again with simpler input',
          action: 'simplify-input'
        },
        {
          description: 'Request shorter response',
          action: 'reduce-output-size'
        }
      ],
      'rate-limit': [
        {
          description: 'Wait a few minutes before trying again',
          action: 'wait'
        },
        {
          description: 'Try a different tool',
          action: 'switch-tool'
        }
      ],
      auth: [
        {
          description: 'Sign in to your account',
          action: 'sign-in'
        },
        {
          description: 'Create a new account',
          action: 'create-account'
        }
      ],
      'api-error': [
        {
          description: 'Try again in a few moments',
          action: 'retry-later'
        },
        {
          description: 'Check service status',
          action: 'check-status'
        }
      ],
      validation: [
        {
          description: 'Review and fix input errors',
          action: 'fix-input'
        }
      ],
      fallback: [
        {
          description: 'Contact support',
          action: 'contact-support'
        }
      ],
      unknown: [
        {
          description: 'Try again',
          action: 'retry'
        }
      ]
    };

    return alternatives[errorType] || alternatives.unknown;
  }

  /**
   * Record error pattern for analytics
   */
  private recordErrorPattern(errorType: ErrorType): void {
    const key = errorType;
    const current = this.errorPatterns.get(key) || {
      errorType,
      frequency: 0,
      lastOccurrence: new Date(),
      recoverySuccessRate: 0
    };

    current.frequency++;
    current.lastOccurrence = new Date();

    this.errorPatterns.set(key, current);
  }

  /**
   * Record recovery attempt result
   */
  recordRecoveryResult(
    error: Error,
    strategy: RecoveryStrategy,
    success: boolean
  ): void {
    this.recoveryHistory.push({
      error,
      strategy,
      success,
      timestamp: new Date()
    });

    // Update success rate
    const errorType = this.classifyError(error);
    const pattern = this.errorPatterns.get(errorType);
    if (pattern) {
      const successes = this.recoveryHistory.filter(
        r => r.success && this.classifyError(r.error) === errorType
      ).length;
      pattern.recoverySuccessRate =
        successes / this.recoveryHistory.length;
    }
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    return {
      totalErrors: this.recoveryHistory.length,
      byType: Object.fromEntries(this.errorPatterns),
      successRate:
        this.recoveryHistory.filter(r => r.success).length /
        (this.recoveryHistory.length || 1),
      recentErrors: this.recoveryHistory.slice(-10)
    };
  }
}

export interface AlternativeApproach {
  description: string;
  action: string;
}

export const advancedRecoveryEngine = new AdvancedRecoveryEngine();
```

---

## 4. Hooks for Using Enhanced AI

### File: `src/hooks/useEnhancedAI.ts`

```typescript
import { useCallback, useState, useEffect } from 'react';
import { orchestrator } from '@/lib/ai/orchestration/tool-orchestrator';
import { advancedRecoveryEngine } from '@/lib/ai/errors/advanced-recovery';
import { intelligentCache } from '@/lib/ai/cache/intelligent-cache';

interface UseEnhancedAIOptions {
  cacheTTL?: number;
  enableCaching?: boolean;
  enableErrorRecovery?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}

export function useEnhancedAI<T = any>(
  options: UseEnhancedAIOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [metrics, setMetrics] = useState({ executionTime: 0, cacheHit: false });

  const execute = useCallback(
    async (
      toolChain: any[],
      input: any,
      context?: Record<string, any>
    ) => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);

      try {
        // Try cache first
        const cacheKey = `ai:${JSON.stringify({ input, context })}`.slice(0, 100);

        if (options.enableCaching) {
          const cached = await intelligentCache.getOrFetch(
            cacheKey,
            async () => {
              const result = await orchestrator.executeChain(toolChain, input);
              return result;
            },
            { ttl: options.cacheTTL ?? 5 * 60 * 1000 }
          );

          setData(cached.finalOutput as T);
          setMetrics({
            executionTime: cached.executionTime,
            cacheHit: true
          });

          options.onSuccess?.(cached.finalOutput);
          return cached;
        } else {
          const result = await orchestrator.executeChain(toolChain, input);

          setData(result.finalOutput as T);
          setMetrics({
            executionTime: result.executionTime,
            cacheHit: false
          });

          options.onSuccess?.(result.finalOutput);
          return result;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (options.enableErrorRecovery) {
          const strategy = await advancedRecoveryEngine.handleError(error, {
            tool: 'unknown',
            operation: 'generate',
            userContext: context,
            previousAttempts: 0
          });

          setError(error);
          options.onError?.(error);

          return { error, strategy };
        }

        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    execute,
    data,
    isLoading,
    error,
    metrics,
    clearCache: () => intelligentCache.clear()
  };
}
```

---

## Quick Start Template

```bash
# 1. Create directories
mkdir -p src/lib/ai/{cache,orchestration,errors,semantic,feedback}
mkdir -p src/lib/ai/__tests__

# 2. Copy templates from this file

# 3. Install dependencies if needed
pnpm add lru-cache

# 4. Create tests
# __tests__/lib/ai/cache/intelligent-cache.test.ts
# __tests__/lib/ai/orchestration/tool-orchestrator.test.ts

# 5. Integrate into components
# Update existing tools to use orchestrator and cache

# 6. Test
pnpm test
```

---

**Ready to implement?** Start with the caching layer (highest ROI), then move to orchestration.
