/**
 * Document Analyzer Component
 * Integrated MCP example for thesis-ai
 * Uses chainTasks for multi-step document analysis
 */

'use client';

import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';

export function DocumentAnalyzer() {
  const [documentText, setDocumentText] = useState('');
  const [analysisType, setAnalysisType] = useState<'summary' | 'themes' | 'quality' | 'gaps'>('summary');

  const { chainTasks, isLoading, result, error } = useMCP();

  const handleAnalyze = async () => {
    if (!documentText.trim()) return;

    const tasks = {
      summary: [
        {
          prompt: `Analyze this document and provide a structured summary:\n\n${documentText}`,
          systemPrompt: 'You are an expert document analyst. Provide concise, structured summaries.',
        },
        {
          prompt: 'Based on the summary, what are the 3 most important takeaways?',
        },
      ],
      themes: [
        {
          prompt: `Identify the main themes in this document:\n\n${documentText}`,
          systemPrompt: 'You are a content analyst. Identify major themes and their relationships.',
        },
        {
          prompt: 'How do these themes connect to academic research?',
        },
      ],
      quality: [
        {
          prompt: `Evaluate the writing quality of this document:\n\n${documentText}`,
          systemPrompt: 'You are an academic writing expert. Evaluate clarity, structure, and impact.',
        },
        {
          prompt: 'Provide specific recommendations for improvement.',
        },
      ],
      gaps: [
        {
          prompt: `Identify knowledge gaps or missing information in this document:\n\n${documentText}`,
          systemPrompt: 'You are a research analyst. Identify gaps in the analysis.',
        },
        {
          prompt: 'Suggest what additional research or information would strengthen this document.',
        },
      ],
    };

    await chainTasks(tasks[analysisType]);
  };

  const analysisLabels = {
    summary: 'Generate Summary',
    themes: 'Identify Themes',
    quality: 'Evaluate Quality',
    gaps: 'Find Knowledge Gaps',
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Document Analyzer</h2>
      <p className="text-slate-600 mb-6">
        Analyze documents with multi-step AI workflows using task chaining.
      </p>

      {/* Analysis Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Analysis Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['summary', 'themes', 'quality', 'gaps'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                analysisType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {analysisLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Document Input */}
      <div className="mb-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">
            Document Text
          </span>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste your document text here for analysis..."
            className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={8}
          />
        </label>
        <p className="text-xs text-slate-500 mt-2">
          {documentText.length} characters
        </p>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !documentText.trim()}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors mb-6 ${
          isLoading || !documentText.trim()
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
            Analyzing...
          </span>
        ) : (
          `${analysisLabels[analysisType]} (2-Step Analysis)`
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800 font-medium mb-1">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">Analysis Results</h3>
          <div className="bg-white p-4 rounded border border-green-100">
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Analysis Methods</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-900">Generate Summary</p>
            <p>Creates a structured summary and identifies key takeaways</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Identify Themes</p>
            <p>Extracts main themes and their academic relevance</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Evaluate Quality</p>
            <p>Assesses writing quality and provides improvement suggestions</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Find Knowledge Gaps</p>
            <p>Identifies missing information and recommends additional research</p>
          </div>
        </div>
      </div>
    </div>
  );
}
