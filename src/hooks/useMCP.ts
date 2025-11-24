/**
 * useMCP Hook
 * React hook for integrating MCP orchestrator in components
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getOrchestrator, type WorkflowStep, type WorkflowResult } from '@/lib/mcp/orchestrator';
import { type AgentResponse } from '@/lib/mcp/serena-client';
import { type PuterResponse } from '@/lib/mcp/puter-adapter';

interface UseMCPOptions {
  autoConnect?: boolean;
  serenaUrl?: string;
}

interface ExecutionState {
  isLoading: boolean;
  error: string | null;
  result: WorkflowResult | AgentResponse | PuterResponse | string | null;
}

export function useMCP(options: UseMCPOptions = {}) {
  const { autoConnect = true, serenaUrl } = options;
  const orchestratorRef = useRef(getOrchestrator(serenaUrl));
  const [state, setState] = useState<ExecutionState>({
    isLoading: false,
    error: null,
    result: null,
  });

  useEffect(() => {
    if (autoConnect) {
      // Initialize connection
      return () => {
        orchestratorRef.current?.disconnect();
      };
    }
  }, [autoConnect]);

  const executeWorkflow = useCallback(
    async (steps: WorkflowStep[]) => {
      setState({ isLoading: true, error: null, result: null });

      try {
        const result = await orchestratorRef.current.executeWorkflow(steps);
        setState({
          isLoading: false,
          error: null,
          result,
        });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          error: errorMessage,
          result: null,
        });
        throw error;
      }
    },
    []
  );

  const executeTask = useCallback(
    async (task: string, model?: string) => {
      setState({ isLoading: true, error: null, result: null });

      try {
        const result = await orchestratorRef.current.executeWorkflow([
          {
            name: 'task',
            task,
            model,
          },
        ]);

        const taskResult = result.steps[0]?.result;
        setState({
          isLoading: false,
          error: null,
          result: taskResult || null,
        });
        return taskResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          error: errorMessage,
          result: null,
        });
        throw error;
      }
    },
    []
  );

  const chainTasks = useCallback(
    async (
      tasks: Array<{
        prompt: string;
        systemPrompt?: string;
        temperature?: number;
      }>
    ) => {
      setState({ isLoading: true, error: null, result: null });

      try {
        const result = await orchestratorRef.current.chainTasks(tasks);
        setState({
          isLoading: false,
          error: null,
          result,
        });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          error: errorMessage,
          result: null,
        });
        throw error;
      }
    },
    []
  );

  const getContext = useCallback(() => {
    return orchestratorRef.current.getSerenaContext();
  }, []);

  const setMetadata = useCallback((key: string, value: unknown) => {
    orchestratorRef.current.setSerenaMetadata(key, value);
  }, []);

  const clearHistory = useCallback(() => {
    orchestratorRef.current.clearSerenaHistory();
  }, []);

  return {
    ...state,
    executeWorkflow,
    executeTask,
    chainTasks,
    getContext,
    setMetadata,
    clearHistory,
  };
}
