/**
 * Example MCP Component
 * Demonstrates basic MCP usage patterns
 */

'use client';

import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { createResearchWorkflow } from '@/lib/mcp/utils';

export function ExampleMCPComponent() {
  const [activeTab, setActiveTab] = useState<'simple' | 'workflow' | 'chain'>('simple');
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [tasks, setTasks] = useState<Array<{ prompt: string }>>([{ prompt: '' }]);

  const { executeTask, executeWorkflow, chainTasks, isLoading, result, error } = useMCP();

  // Simple Task Execution
  const handleSimpleTask = async () => {
    if (prompt) {
      await executeTask(prompt);
    }
  };

  // Workflow Execution
  const handleWorkflow = async () => {
    if (topic) {
      const steps = createResearchWorkflow(topic);
      await executeWorkflow(steps);
    }
  };

  // Task Chaining
  const handleChainTasks = async () => {
    const validTasks = tasks.filter((t) => t.prompt.trim());
    if (validTasks.length > 0) {
      await chainTasks(validTasks);
    }
  };

  const addTaskField = () => {
    setTasks([...tasks, { prompt: '' }]);
  };

  const updateTaskField = (index: number, value: string) => {
    const updated = [...tasks];
    updated[index].prompt = value;
    setTasks(updated);
  };

  const removeTaskField = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-6">MCP Integration Example</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('simple')}
          className={`px-4 py-2 ${
            activeTab === 'simple'
              ? 'border-b-2 border-blue-500 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Simple Task
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 ${
            activeTab === 'workflow'
              ? 'border-b-2 border-blue-500 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Workflow
        </button>
        <button
          onClick={() => setActiveTab('chain')}
          className={`px-4 py-2 ${
            activeTab === 'chain'
              ? 'border-b-2 border-blue-500 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Chain Tasks
        </button>
      </div>

      {/* Simple Task Tab */}
      {activeTab === 'simple' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter a task prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Analyze this research paper..."
              className="w-full p-3 border rounded-md"
              rows={4}
            />
          </div>
          <button
            onClick={handleSimpleTask}
            disabled={isLoading || !prompt}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Execute Task'}
          </button>
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter research topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI in Education"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <p className="text-sm text-gray-600">
            This will execute a multi-step workflow: identify gaps → summarize literature →
            provide recommendations
          </p>
          <button
            onClick={handleWorkflow}
            disabled={isLoading || !topic}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Execute Workflow'}
          </button>
        </div>
      )}

      {/* Chain Tasks Tab */}
      {activeTab === 'chain' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Chain multiple tasks</label>
            <p className="text-sm text-gray-600 mb-3">
              Each task receives context from the previous one
            </p>
          </div>

          {tasks.map((task, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={task.prompt}
                onChange={(e) => updateTaskField(index, e.target.value)}
                placeholder={`Task ${index + 1}...`}
                className="flex-1 p-2 border rounded-md text-sm"
              />
              {tasks.length > 1 && (
                <button
                  onClick={() => removeTaskField(index)}
                  className="px-3 py-2 text-red-500 border border-red-500 rounded-md"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addTaskField}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            + Add Task
          </button>

          <button
            onClick={handleChainTasks}
            disabled={isLoading || tasks.every((t) => !t.prompt.trim())}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Execute Chain'}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-900 mb-2">Result:</h3>
          <pre className="text-sm overflow-auto max-h-64 text-green-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

export default ExampleMCPComponent;
