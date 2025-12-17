'use client';

import Link from 'next/link';
import { FileText, RefreshCw, Layers, Wand2 } from 'lucide-react';

export default function SynthesisParaphrasingDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">AI</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Intelligent Synthesis & Paraphrasing</h1>
          <p className="mt-4 text-lg text-slate-300">
            Synthesize sources, rewrite for clarity, and maintain academic tone
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Intelligent Synthesis & Paraphrasing tool helps you combine ideas from
              multiple sources and rewrite content while maintaining academic integrity.
              Unlike simple word replacement, our AI understands context and produces
              natural, scholarly prose that reflects your unique voice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Layers className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Source Synthesis</h3>
                    <p className="text-slate-300">
                      Combine findings from multiple sources into coherent paragraphs.
                      The tool identifies common themes, contrasting viewpoints, and helps
                      you build comprehensive literature discussions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <RefreshCw className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Academic Paraphraser</h3>
                    <p className="text-slate-300">
                      Rewrite passages in your own words while preserving meaning.
                      Multiple paraphrase levels from light editing to complete restructuring.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Tone Adjuster</h3>
                    <p className="text-slate-300">
                      Transform informal writing into formal academic prose. Adjust the
                      level of formality while keeping your ideas intact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Wand2 className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Clarity Enhancer</h3>
                    <p className="text-slate-300">
                      Simplify complex sentences without losing meaning. Make your writing
                      more accessible while maintaining scholarly credibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Paraphrase Levels</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Light</h3>
                <p className="text-sm text-slate-300">
                  Minor word changes while keeping sentence structure. Best for
                  already-clear passages needing slight variation.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Standard</h3>
                <p className="text-sm text-slate-300">
                  Restructures sentences and replaces vocabulary. Recommended for
                  most academic paraphrasing needs.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Creative</h3>
                <p className="text-sm text-slate-300">
                  Complete rewriting with new structure and phrasing. Use when you
                  need a fresh perspective on familiar content.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Synthesis Techniques</h2>
            <p className="text-slate-300 mb-4">
              Our tool helps you synthesize sources using these academic techniques:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400">Thematic Synthesis</h3>
                <p className="text-sm text-slate-300">Group sources by common themes and discuss them together</p>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400">Compare & Contrast</h3>
                <p className="text-sm text-slate-300">Highlight similarities and differences between sources</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="font-semibold text-purple-400">Chronological Development</h3>
                <p className="text-sm text-slate-300">Show how ideas have evolved over time across sources</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-800/30">
                <h3 className="font-semibold text-orange-400">Methodological Comparison</h3>
                <p className="text-sm text-slate-300">Compare research methods used by different studies</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Input Your Content:</strong> Paste the original text or select
                multiple sources from your library to synthesize.
              </li>
              <li>
                <strong>Choose Mode:</strong> Select paraphrasing (single source) or
                synthesis (multiple sources) mode.
              </li>
              <li>
                <strong>Set Parameters:</strong> Choose paraphrase level, desired tone,
                and output length.
              </li>
              <li>
                <strong>Generate:</strong> Click generate to receive rewritten content.
                Multiple variations are provided.
              </li>
              <li>
                <strong>Review & Edit:</strong> Always review and personalize the output
                before including it in your work.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Academic Integrity</h2>
            <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Important Reminders</h3>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Paraphrased content still requires citation of the original source</li>
                <li>Use paraphrasing to demonstrate understanding, not to disguise copying</li>
                <li>Review all output to ensure it accurately represents the original meaning</li>
                <li>When synthesizing, ensure all sources are properly attributed</li>
                <li>Your final work should reflect your own analysis and interpretation</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Do</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Read and understand source material first</li>
                  <li>Add your own analysis and interpretation</li>
                  <li>Maintain the original meaning accurately</li>
                  <li>Use multiple sources for richer synthesis</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Avoid</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Paraphrasing without understanding</li>
                  <li>Omitting required citations</li>
                  <li>Using output without personal review</li>
                  <li>Distorting the original meaning</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/citation-hub" className="text-blue-400 hover:underline">
              ← Citation Hub
            </Link>
          </div>
          <div>
            <Link href="/documentation/university-formatting" className="text-blue-400 hover:underline">
              University Formatting →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
