/**
 * Research Gap Identifier Component
 * Integrated MCP example for thesis-ai
 * Uses createResearchWorkflow from MCP utilities
 */

'use client';

import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { createResearchWorkflow } from '@/lib/mcp/utils';

interface ResearchGapResult {
  success: boolean;
  steps: Array<{
    name: string;
    status: 'success' | 'failed' | 'skipped';
    result?: unknown;
    error?: string;
  }>;
  totalExecutionTime: number;
}

export function ResearchGapIdentifier() {
  const [topic, setTopic] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { executeWorkflow, isLoading, result, error } = useMCP();

  const handleAnalyze = async () => {
    if (!topic.trim()) return;

    const steps = createResearchWorkflow(topic);
    await executeWorkflow(steps);
    setShowResults(true);
  };

  const getStepDetails = (stepResult: ResearchGapResult) => {
    if (!stepResult || !stepResult.steps) return null;

    return (
      <div className="space-y-4">
        {stepResult.steps.map((step, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              step.status === 'success'
                ? 'bg-green-50 border-green-500'
                : step.status === 'failed'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-gray-50 border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-900 capitalize">{step.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  step.status === 'success'
                    ? 'bg-green-200 text-green-800'
                    : step.status === 'failed'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-gray-200 text-gray-800'
                }`}
              >
                {step.status}
              </span>
            </div>
            {step.error && <p className="text-sm text-red-700 mb-2">{step.error}</p>}
            {step.result ? (
              <div className="text-sm text-slate-700 bg-white/50 p-2 rounded max-h-48 overflow-auto">
                {typeof step.result === 'string'
                  ? step.result
                  : JSON.stringify(step.result, null, 2)}
              </div>
            ) : null}
          </div>
        ))}
        <div className="text-xs text-slate-500 pt-2 border-t">
          Total execution time: {stepResult.totalExecutionTime}ms
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Research Gap Identifier</h2>
      <p className="text-slate-600 mb-6">
        Identify research gaps in your topic and get intelligent recommendations.
      </p>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">
            Research Topic
          </span>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'AI applications in healthcare', 'Climate change mitigation strategies', 'Machine learning in education'"
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </label>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !topic.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading || !topic.trim()
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              Analyzing Research Topic...
            </span>
          ) : (
            'Identify Research Gaps'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800 font-medium mb-1">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {showResults && result && !error && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-medium">Analysis Results</p>
          </div>
          {getStepDetails(result as ResearchGapResult)}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Analyzes your research topic for existing knowledge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Identifies gaps and under-researched areas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Summarizes relevant literature and methodologies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <span>Provides research recommendations based on identified gaps</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
