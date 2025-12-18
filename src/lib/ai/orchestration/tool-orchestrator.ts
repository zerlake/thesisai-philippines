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

export interface AITool {
  execute: (input: any, config?: Record<string, any>) => Promise<any>;
}

export class ToolOrchestrator {
  private toolRegistry: Map<string, AITool> = new Map();
  private executionHistory: ChainResult[] = [];
  private workflows: Map<string, ToolChainStep[]> = new Map();

  /**
   * Register a tool
   */
  registerTool(name: string, tool: AITool): void {
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
          } catch {
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
    _context: ChainContext
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
          tokensUsed: result?.tokensUsed
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
    _workflowName?: string,
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

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Get registered tools
   */
  getRegisteredTools(): string[] {
    return Array.from(this.toolRegistry.keys());
  }

  /**
   * Get saved workflows
   */
  getSavedWorkflows(): string[] {
    return Array.from(this.workflows.keys());
  }
}

// Singleton
export const orchestrator = new ToolOrchestrator();
