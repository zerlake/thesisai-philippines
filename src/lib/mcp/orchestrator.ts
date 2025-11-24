/**
 * MCP Orchestrator
 * Coordinates between AMP CLI, Serena, and Puter.js
 */

import { SerenaClient, type AgentRequest, type AgentResponse, type SerenaContext } from './serena-client';
import { PuterAdapter, type PuterRequest, type PuterResponse } from './puter-adapter';

export interface WorkflowStep {
  name: string;
  task: string;
  params?: Record<string, unknown>;
  model?: string;
  retryOnFailure?: boolean;
}

export interface WorkflowResult {
  success: boolean;
  steps: Array<{
    name: string;
    status: 'success' | 'failed' | 'skipped';
    result?: AgentResponse | PuterResponse;
    error?: string;
  }>;
  totalExecutionTime: number;
}

export class MCPOrchestrator {
  private serena: SerenaClient;
  private puter: PuterAdapter;

  constructor(serenaUrl?: string) {
    this.serena = new SerenaClient(serenaUrl);
    this.puter = new PuterAdapter();
  }

  async executeWorkflow(steps: WorkflowStep[]): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results = [];

    for (const step of steps) {
      try {
        const result = await this.executeStep(step);

        // Check if result is successful (works for both AgentResponse and PuterResponse)
        const isSuccess = this.isSuccessResponse(result);
        
        results.push({
          name: step.name,
          status: isSuccess ? ('success' as const) : ('failed' as const),
          result: result,
        });

        if (!isSuccess && !step.retryOnFailure) {
          break;
        }
      } catch (error) {
        results.push({
          name: step.name,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results.every((r) => r.status !== 'failed'),
      steps: results,
      totalExecutionTime: Date.now() - startTime,
    };
  }

  private isSuccessResponse(response: AgentResponse | PuterResponse): boolean {
    // AgentResponse has success property
    if ('success' in response) {
      return (response as AgentResponse).success;
    }
    // PuterResponse is successful if it has text and no error
    if ('text' in response) {
      return !!(response as PuterResponse).text;
    }
    return false;
  }

  private async executeStep(step: WorkflowStep): Promise<AgentResponse | PuterResponse> {
    // If explicit model is specified, use Puter directly
    if (step.model && step.model !== 'default') {
      return this.executePuterRequest(step);
    }

    // Otherwise, use Serena for orchestration
    return this.executeSerenaRequest(step);
  }

  private async executeSerenaRequest(step: WorkflowStep): Promise<AgentResponse> {
    const request: AgentRequest = {
      task: `${step.name}: ${step.task}`,
      params: step.params,
      model: step.model,
    };

    return this.serena.sendRequest(request);
  }

  private async executePuterRequest(step: WorkflowStep): Promise<PuterResponse> {
    const request: PuterRequest = {
      prompt: step.task,
      ...((step.params as Partial<PuterRequest>) || {}),
      model: step.model || (step.params as any)?.model || 'local-llm',
    };

    return this.puter.execute(request);
  }

  async chainTasks(
    tasks: Array<{
      prompt: string;
      systemPrompt?: string;
      temperature?: number;
    }>
  ): Promise<string> {
    let context = '';

    for (const task of tasks) {
      const response = await this.puter.execute({
        model: 'local-llm',
        prompt: context ? `Context: ${context}\n\nTask: ${task.prompt}` : task.prompt,
        systemPrompt: task.systemPrompt,
        temperature: task.temperature,
      });

      context = response.text;
    }

    return context;
  }

  getSerenaContext(): SerenaContext {
    return this.serena.getContext();
  }

  setSerenaMetadata(key: string, value: unknown): void {
    this.serena.setMetadata(key, value);
  }

  clearSerenaHistory(): void {
    this.serena.clearHistory();
  }

  disconnect(): void {
    this.serena.disconnect();
  }
}

// Singleton instance
let orchestrator: MCPOrchestrator | null = null;

export function getOrchestrator(serenaUrl?: string): MCPOrchestrator {
  if (!orchestrator) {
    orchestrator = new MCPOrchestrator(serenaUrl);
  }
  return orchestrator;
}

export function createOrchestrator(serenaUrl?: string): MCPOrchestrator {
  return new MCPOrchestrator(serenaUrl);
}
