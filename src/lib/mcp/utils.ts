/**
 * MCP Utilities
 * Helper functions for common MCP operations
 */

import { type WorkflowStep } from './orchestrator';

export function createWorkflowStep(
  name: string,
  task: string,
  params?: Record<string, unknown>,
  model?: string
): WorkflowStep {
  return {
    name,
    task,
    params,
    model,
  };
}

export function createTextAnalysisWorkflow(text: string): WorkflowStep[] {
  return [
    createWorkflowStep(
      'analyze',
      `Analyze the following text for clarity, readability, and structure: ${text}`,
      { type: 'analysis' }
    ),
    createWorkflowStep(
      'suggest-improvements',
      `Based on the analysis, suggest improvements for the text`,
      { type: 'suggestions' }
    ),
  ];
}

export function createResearchWorkflow(topic: string): WorkflowStep[] {
  return [
    createWorkflowStep(
      'research-gap-identification',
      `Identify research gaps in the topic: ${topic}`,
      { type: 'research' }
    ),
    createWorkflowStep(
      'literature-summary',
      `Summarize key literature and methodologies`,
      { type: 'literature' }
    ),
    createWorkflowStep(
      'recommendations',
      `Provide research recommendations based on gaps`,
      { type: 'recommendations' }
    ),
  ];
}

export function createCodeReviewWorkflow(code: string): WorkflowStep[] {
  return [
    createWorkflowStep(
      'code-analysis',
      `Analyze the following code for quality and best practices: ${code}`,
      { type: 'code-quality' }
    ),
    createWorkflowStep(
      'identify-issues',
      `Identify potential issues and bugs`,
      { type: 'issues' }
    ),
    createWorkflowStep(
      'suggest-refactoring',
      `Suggest refactoring improvements`,
      { type: 'refactoring' }
    ),
  ];
}

export function buildPrompt(
  systemPrompt: string,
  userPrompt: string,
  context?: string
): string {
  let prompt = '';

  if (systemPrompt) {
    prompt += `System: ${systemPrompt}\n\n`;
  }

  if (context) {
    prompt += `Context: ${context}\n\n`;
  }

  prompt += `User: ${userPrompt}`;

  return prompt;
}

export function parseWorkflowResponse(
  response: Record<string, unknown>
): Record<string, unknown> {
  // Extract structured data from response
  if (typeof response === 'string') {
    try {
      return JSON.parse(response);
    } catch {
      return { text: response };
    }
  }

  return response;
}

export function formatExecutionResults(
  results: Array<{
    name: string;
    status: string;
    result?: unknown;
    error?: string;
  }>
): string {
  return results
    .map((r) => {
      const status = r.status.toUpperCase();
      const content = r.error || r.result || 'No result';
      return `[${status}] ${r.name}: ${content}`;
    })
    .join('\n');
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

export function sanitizeTaskName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}
