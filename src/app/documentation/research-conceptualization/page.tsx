'use client';

import Link from 'next/link';
import { Target, Lightbulb, Map, FileSearch, ArrowRight } from 'lucide-react';

export default function ResearchConceptualizationDoc() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/documentation"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Documentation
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Pro</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Research Conceptualization Tools</h1>
          <p className="mt-4 text-lg text-slate-300">
            Variable Mapping Tool and Research Problem Identifier with Philippine-specific data
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Our Research Conceptualization Tools are designed to help you develop a solid
              foundation for your research project. These tools combine advanced AI analysis
              with Philippine-specific data to help you identify meaningful research problems
              and map the variables in your study.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Research Problem Identifier</h3>
                    <p className="text-slate-300">
                      Analyzes your research area to identify specific problems worth investigating.
                      Includes access to Philippine-specific datasets and regional issues.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Map className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Variable Mapping Tool</h3>
                    <p className="text-slate-300">
                      Helps you identify and organize independent, dependent, and moderating
                      variables in your research. Creates visual concept maps for better understanding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileSearch className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Framework Suggester</h3>
                    <p className="text-slate-300">
                      Recommends theoretical and conceptual frameworks based on your research
                      problem and variables, with citations to relevant literature.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Define Your Research Area:</strong> Start by entering your broad research
                topic or field of study.
              </li>
              <li>
                <strong>Identify Problems:</strong> Use the Research Problem Identifier to explore
                potential issues within your area that need investigation.
              </li>
              <li>
                <strong>Map Variables:</strong> Once you have a research problem, use the Variable
                Mapping Tool to identify and organize your variables.
              </li>
              <li>
                <strong>Select Framework:</strong> Choose a theoretical framework that best supports
                your study from the AI-generated suggestions.
              </li>
              <li>
                <strong>Export:</strong> Export your concept map and framework documentation to use
                in your thesis proposal.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Philippine-Specific Data</h2>
            <p className="text-slate-300 mb-4">
              Our tools include access to datasets and research contexts specific to the Philippines:
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>PSA (Philippine Statistics Authority) data integration</li>
              <li>Local government unit research priorities</li>
              <li>Philippine university thesis repositories</li>
              <li>Regional development indicators</li>
              <li>Industry-specific data from Philippine sectors</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Do</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Start with a broad topic and narrow down</li>
                  <li>Validate problems with literature review</li>
                  <li>Consult with your advisor before finalizing</li>
                  <li>Consider local relevance and applicability</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Avoid</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Choosing overly broad research problems</li>
                  <li>Ignoring variable relationships</li>
                  <li>Selecting frameworks without understanding them</li>
                  <li>Skipping the mapping step</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation" className="text-blue-400 hover:underline">
              ← Back to Documentation
            </Link>
          </div>
          <div>
            <Link href="/documentation/ai-idea-generation" className="text-blue-400 hover:underline">
              AI Idea Generation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
