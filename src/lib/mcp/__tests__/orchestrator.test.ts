/**
 * MCPOrchestrator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MCPOrchestrator } from '../orchestrator';

describe('MCPOrchestrator', () => {
  let orchestrator: MCPOrchestrator;

  beforeEach(() => {
    orchestrator = new MCPOrchestrator('http://localhost:3000');
  });

  it('should create orchestrator instance', () => {
    expect(orchestrator).toBeDefined();
  });

  it('should execute workflow steps', { timeout: 10000 }, async () => {
    const steps = [
      {
        name: 'test-step',
        task: 'Test task',
      },
    ];

    const result = await orchestrator.executeWorkflow(steps);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('totalExecutionTime');
    expect(Array.isArray(result.steps)).toBe(true);
  });

  it('should handle workflow execution errors', { timeout: 10000 }, async () => {
    const steps = [
      {
        name: 'error-step',
        task: 'This should fail',
      },
    ];

    const result = await orchestrator.executeWorkflow(steps);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('steps');
  });

  it('should get serena context', () => {
    const context = orchestrator.getSerenaContext();

    expect(context).toHaveProperty('sessionId');
    expect(context).toHaveProperty('conversationHistory');
    expect(context).toHaveProperty('metadata');
  });

  it('should set metadata', () => {
    orchestrator.setSerenaMetadata('testKey', 'testValue');
    const context = orchestrator.getSerenaContext();

    expect(context.metadata.testKey).toBe('testValue');
  });
});
