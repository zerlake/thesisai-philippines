/**
 * AI Tools Page
 * Showcases MCP integration examples
 */

'use client';

import { useState } from 'react';
import { ResearchGapIdentifier } from '@/components/mcp/ResearchGapIdentifier';
import { DocumentAnalyzer } from '@/components/mcp/DocumentAnalyzer';

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<'research' | 'document'>('research');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI-Powered Research Tools</h1>
          <p className="text-lg text-slate-600">
            Leverage AI to accelerate your research and writing process
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTool('research')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTool === 'research'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Research Gap Identifier
            </button>
            <button
              onClick={() => setActiveTool('document')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTool === 'document'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Document Analyzer
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTool === 'research' && <ResearchGapIdentifier />}
        {activeTool === 'document' && <DocumentAnalyzer />}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">About These Tools</h3>
              <p className="text-slate-600 mb-4">
                These tools are powered by Serena MCP Server and Puter.js, providing intelligent AI
                assistance for your academic work.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Context-aware analysis</li>
                <li>✓ Multi-step workflows</li>
                <li>✓ Session management</li>
                <li>✓ Production-ready integration</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">How It Works</h3>
              <p className="text-slate-600 mb-4">
                Each tool uses the MCP (Model Context Protocol) to coordinate intelligent AI workflows:
              </p>
              <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                <li>You provide input (topic or document)</li>
                <li>MCP orchestrates multi-step AI analysis</li>
                <li>Results are streamed back with full context</li>
                <li>Session history is maintained for follow-ups</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Technical Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Frontend</p>
                <p className="text-sm text-slate-600">Next.js 16, React 19</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Orchestration</p>
                <p className="text-sm text-slate-600">Serena MCP Server</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Model Runtime</p>
                <p className="text-sm text-slate-600">Puter.js</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Protocol</p>
                <p className="text-sm text-slate-600">Model Context Protocol</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
