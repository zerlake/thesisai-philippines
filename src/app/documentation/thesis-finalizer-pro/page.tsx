'use client';

import Link from 'next/link';
import { FileText, Bot, Target, Shield } from 'lucide-react';

export default function ThesisFinalizerProDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Pro+Advisor+</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Thesis Finalizer Pro</h1>
          <p className="mt-4 text-lg text-slate-300">
            Advanced multi-agent AI system to polish and integrate all chapters into a cohesive final draft
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Thesis Finalizer Pro is an advanced multi-agent AI system that takes your individual thesis chapters and transforms them into a cohesive, polished final draft. Using six specialized AI agents working in parallel, it ensures consistency, flow, and academic quality across your entire thesis.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Bot className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Multi-Agent Processing</h3>
                    <p className="text-slate-300">
                      Six specialized AI agents work simultaneously to refine different aspects of your thesis:
                      <ul className="mt-2 list-disc pl-5">
                        <li><strong>Coherence Agent:</strong> Checks logical flow across all chapters</li>
                        <li><strong>Style Agent:</strong> Harmonizes voice, tense, formatting (APA/MLA)</li>
                        <li><strong>Citation Agent:</strong> Fixes/validates all citations, adds missing ones</li>
                        <li><strong>Strength Agent:</strong> Identifies weak sections, suggests improvements</li>
                        <li><strong>Polish Agent:</strong> Final grammar, clarity, academic tone pass</li>
                        <li><strong>Summary Agent:</strong> Generates abstract, keywords, conclusion synthesis</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Chapter Integration</h3>
                    <p className="text-slate-300">
                      Seamlessly integrates all chapters with consistent voice, tone, and formatting. Ensures smooth transitions between sections and maintains academic standards throughout the entire document.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Quality Assurance</h3>
                    <p className="text-slate-300">
                      Performs comprehensive quality checks including grammar, clarity, academic tone, citation validation, and consistency across all chapters. Ensures your final draft meets academic standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400 mb-2">1. Upload Chapters</h3>
                <p className="text-slate-300">Upload all your thesis chapters (minimum 3) in supported formats (.txt, .doc, .docx, .pdf, .rtf)</p>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400 mb-2">2. Multi-Agent Processing</h3>
                <p className="text-slate-300">Six specialized AI agents work in parallel to refine different aspects of your thesis simultaneously</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="font-semibold text-purple-400 mb-2">3. Integration & Polish</h3>
                <p className="text-slate-300">Final integration with improved flow, consistency, and academic quality</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-800/30">
                <h3 className="font-semibold text-indigo-400 mb-2">4. Review & Export</h3>
                <p className="text-slate-300">Review the final draft and export as needed</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Minimum Chapter Count</h3>
                <p className="text-sm text-slate-300">
                  Upload at least 3 chapter files to use the Thesis Finalizer Pro tool.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Supported Formats</h3>
                <p className="text-sm text-slate-300">
                  .txt, .doc, .docx, .pdf, .rtf files are supported for upload.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Subscription Tier</h3>
                <p className="text-sm text-slate-300">
                  Available exclusively for Pro + Advisor and Pro Complete subscribers.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Processing Time</h3>
                <p className="text-sm text-slate-300">
                  Typically completes in 2 minutes depending on document length and complexity.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Preparation Tips</h3>
                <ul className="list-disc pl-6 text-sm text-slate-300">
                  <li>Ensure chapters are in final or near-final form before processing</li>
                  <li>Upload chapters in a logical order (Chapter 1, Chapter 2, etc.)</li>
                  <li>Include all relevant content and citations in your chapter files</li>
                  <li>Review individual chapters for major issues before using the tool</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">What to Expect</h3>
                <ul className="list-disc pl-6 text-sm text-slate-300">
                  <li>Improved chapter flow and coherence</li>
                  <li>Consistent academic style and formatting</li>
                  <li>Validated citations and references</li>
                  <li>Enhanced clarity and academic tone</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Academic Integrity</h2>
            <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Responsible Use</h3>
              <p className="text-slate-300 mb-4">
                Thesis Finalizer Pro is designed to assist with the final stages of thesis preparation:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Use the tool to polish and integrate your original work</li>
                <li>Always review and approve all changes made by the AI</li>
                <li>The final work should represent your understanding and research</li>
                <li>Ensure all content accurately reflects your research findings</li>
                <li>Follow your institution's guidelines for AI tool usage</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/defense-preparation" className="text-blue-400 hover:underline">
              ← Defense Preparation
            </Link>
          </div>
          <div>
            <Link href="/thesis-phases/finalizer" className="text-blue-400 hover:underline">
              Try Thesis Finalizer Pro →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}