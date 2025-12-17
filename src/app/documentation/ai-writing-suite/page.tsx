'use client';

import Link from 'next/link';
import { Bot, PenLine, Sparkles, BookText } from 'lucide-react';

export default function AIWritingSuiteDoc() {
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
          <h1 className="text-4xl font-bold text-white">AI Writing & Research Suite</h1>
          <p className="mt-4 text-lg text-slate-300">
            From topic ideas to conclusions, leverage AI at every step of your research process
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The AI Writing & Research Suite is your comprehensive AI assistant for academic
              writing. From generating initial drafts to refining your final manuscript, our
              AI tools help you write better, faster, and with greater confidence while
              maintaining academic integrity.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Bot className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI Writing Assistant</h3>
                    <p className="text-slate-300">
                      Get intelligent writing suggestions, complete sentences, and expand your
                      ideas. The AI understands academic writing conventions and helps maintain
                      scholarly tone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <PenLine className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Draft Generator</h3>
                    <p className="text-slate-300">
                      Generate first drafts for any chapter or section based on your outline
                      and research notes. Perfect for overcoming writer&apos;s block.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Style Enhancer</h3>
                    <p className="text-slate-300">
                      Transform casual writing into academic prose. The tool suggests vocabulary
                      improvements, sentence restructuring, and clarity enhancements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookText className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Literature Integration</h3>
                    <p className="text-slate-300">
                      Seamlessly integrate citations and references into your writing. The AI
                      helps you properly introduce sources and synthesize multiple viewpoints.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Writing Modes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Drafting Mode</h3>
                <p className="text-sm text-slate-300">
                  Get AI assistance to write initial drafts based on your outline, notes,
                  and research materials.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Editing Mode</h3>
                <p className="text-sm text-slate-300">
                  Refine existing text with grammar corrections, style improvements, and
                  clarity enhancements.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Expansion Mode</h3>
                <p className="text-sm text-slate-300">
                  Expand bullet points and brief notes into fully developed paragraphs
                  with proper transitions.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Summarization Mode</h3>
                <p className="text-sm text-slate-300">
                  Condense lengthy passages into concise summaries while preserving key
                  information.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter-Specific Assistance</h2>
            <p className="text-slate-300 mb-4">
              Our AI provides specialized help for each thesis chapter:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400">Chapter 1: Introduction</h3>
                <p className="text-sm text-slate-300">Background writing, problem statement formulation, research question development</p>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400">Chapter 2: Literature Review</h3>
                <p className="text-sm text-slate-300">Source synthesis, thematic organization, gap identification</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="font-semibold text-purple-400">Chapter 3: Methodology</h3>
                <p className="text-sm text-slate-300">Research design justification, procedure description, ethical considerations</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-800/30">
                <h3 className="font-semibold text-orange-400">Chapter 4: Results</h3>
                <p className="text-sm text-slate-300">Data presentation, findings description, table/figure narratives</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-900/20 border border-pink-800/30">
                <h3 className="font-semibold text-pink-400">Chapter 5: Discussion & Conclusion</h3>
                <p className="text-sm text-slate-300">Interpretation of results, implications, recommendations</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Academic Integrity</h2>
            <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Responsible AI Use</h3>
              <p className="text-slate-300 mb-4">
                Our AI Writing Suite is designed to assist, not replace, your academic work:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>AI suggestions are meant as starting points for your own writing</li>
                <li>Always review and revise AI-generated content to reflect your voice</li>
                <li>Cite AI assistance according to your institution&apos;s guidelines</li>
                <li>The final work should represent your understanding and analysis</li>
                <li>Use AI as a learning tool to improve your writing skills</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Tips for Best Results</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Do</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Provide detailed context and instructions</li>
                  <li>Break complex requests into smaller parts</li>
                  <li>Review and personalize all AI output</li>
                  <li>Use AI to overcome writer&apos;s block</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Avoid</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Submitting AI output without review</li>
                  <li>Relying solely on AI for analysis</li>
                  <li>Using AI for data fabrication</li>
                  <li>Ignoring institution AI policies</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/methodology-tools" className="text-blue-400 hover:underline">
              ← Methodology Tools
            </Link>
          </div>
          <div>
            <Link href="/documentation/citation-hub" className="text-blue-400 hover:underline">
              Citation Hub →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
