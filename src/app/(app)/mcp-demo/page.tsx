/**
 * MCP Integration Demo Page
 * Shows all usage patterns from MCP_QUICKSTART.md
 */

'use client';

import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { createResearchWorkflow } from '@/lib/mcp/utils';

export default function MCPDemoPage() {
  const [activeTab, setActiveTab] = useState<'simple' | 'workflow' | 'chain' | 'research'>('simple');
  const [inputText, setInputText] = useState('');
  const [topic, setTopic] = useState('');

  const {
    executeTask,
    executeWorkflow,
    chainTasks,
    getContext,
    setMetadata,
    isLoading,
    result,
    error,
  } = useMCP();

  // Pattern 1: Simple Task Execution
  const handleSimpleTask = async () => {
    if (inputText.trim()) {
      await executeTask(inputText);
    }
  };

  // Pattern 2: Multi-Step Workflow
  const handleWorkflow = async () => {
    const steps = [
      { name: 'extract', task: 'Extract key points from: ' + inputText },
      { name: 'summarize', task: 'Create a brief summary' },
      { name: 'critique', task: 'Provide feedback for improvement' },
    ];
    await executeWorkflow(steps);
  };

  // Pattern 3: Task Chaining
  const handleChainTasks = async () => {
    await chainTasks([
      { prompt: 'Identify main themes in: ' + inputText },
      { prompt: 'Based on those themes, suggest related topics' },
    ]);
  };

  // Pattern 4: Research Workflow
  const handleResearchWorkflow = async () => {
    if (topic.trim()) {
      const steps = createResearchWorkflow(topic);
      await executeWorkflow(steps);
    }
  };

  // Pattern 5: Context Management
  const handleContextManagement = () => {
    setMetadata('demoUserId', 'demo-user-123');
    setMetadata('timestamp', new Date().toISOString());
    const context = getContext();
    console.log('Current Context:', context);
    alert(`Context saved. Check console for details.\nSession: ${context.sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">MCP Integration Demo</h1>
          <p className="text-slate-600 mb-8">
            Explore all usage patterns from MCP_QUICKSTART.md
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
            {['simple', 'workflow', 'chain', 'research'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'simple' && 'Pattern 1: Simple Task'}
                {tab === 'workflow' && 'Pattern 2: Workflow'}
                {tab === 'chain' && 'Pattern 3: Chain Tasks'}
                {tab === 'research' && 'Pattern 4: Research'}
              </button>
            ))}
          </div>

          {/* Pattern 1: Simple Task */}
          {activeTab === 'simple' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Pattern 1: Simple Task Execution</h2>
              <p className="text-slate-600">
                Execute a single AI prompt and get results back.
              </p>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-sm overflow-auto">
                {`const { executeTask } = useMCP();
const result = await executeTask('Your prompt');`}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button
                onClick={handleSimpleTask}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Execute Task'}
              </button>
            </div>
          )}

          {/* Pattern 2: Workflow */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Pattern 2: Multi-Step Workflow</h2>
              <p className="text-slate-600">
                Execute multiple steps in sequence (extract → summarize → critique).
              </p>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-sm overflow-auto">
                {`const { executeWorkflow } = useMCP();
const steps = [
  { name: 'extract', task: 'Extract key points' },
  { name: 'summarize', task: 'Create summary' },
  { name: 'critique', task: 'Provide feedback' }
];
await executeWorkflow(steps);`}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to analyze..."
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button
                onClick={handleWorkflow}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Execute Workflow'}
              </button>
            </div>
          )}

          {/* Pattern 3: Chain Tasks */}
          {activeTab === 'chain' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Pattern 3: Task Chaining</h2>
              <p className="text-slate-600">
                Chain tasks where each step receives context from previous ones.
              </p>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-sm overflow-auto">
                {`const { chainTasks } = useMCP();
const output = await chainTasks([
  { prompt: 'Step 1: Identify gaps' },
  { prompt: 'Step 2: Suggest solutions' }
]);`}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text for analysis..."
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button
                onClick={handleChainTasks}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Chain Tasks'}
              </button>
            </div>
          )}

          {/* Pattern 4: Research Workflow */}
          {activeTab === 'research' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Pattern 4: Research Workflow</h2>
              <p className="text-slate-600">
                Specialized workflow for research analysis (identify gaps → summarize literature → recommend directions).
              </p>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-sm overflow-auto">
                {`import { createResearchWorkflow } from '@/lib/mcp/utils';
const { executeWorkflow } = useMCP();
const steps = createResearchWorkflow('Your research topic');
await executeWorkflow(steps);`}
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your research topic..."
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleResearchWorkflow}
                disabled={isLoading || !topic.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Analyze Research'}
              </button>
            </div>
          )}

          {/* Context Management */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Pattern 5: Context Management</h3>
            <button
              onClick={handleContextManagement}
              className="px-4 py-2 bg-slate-600 text-white rounded-md font-medium hover:bg-slate-700 transition-colors"
            >
              Save & View Context
            </button>
          </div>

          {/* Results */}
          {(result || error) && (
            <div className={`mt-8 p-6 rounded-lg ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <h3 className={`text-lg font-bold mb-3 ${error ? 'text-red-900' : 'text-green-900'}`}>
                {error ? 'Error' : 'Result'}
              </h3>
              <pre className={`text-sm overflow-auto max-h-96 ${error ? 'text-red-800' : 'text-green-800'}`}>
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-3 text-slate-600">Processing your request...</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">About This Demo</h2>
          <div className="space-y-4 text-slate-600">
            <p>
              This page demonstrates all usage patterns from MCP_QUICKSTART.md. The patterns are now integrated with your app!
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Pattern 1:</strong> Simple task execution for single prompts</li>
              <li><strong>Pattern 2:</strong> Multi-step workflows for complex operations</li>
              <li><strong>Pattern 3:</strong> Task chaining for context-aware sequences</li>
              <li><strong>Pattern 4:</strong> Pre-built research workflow</li>
              <li><strong>Pattern 5:</strong> Session context and metadata management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
