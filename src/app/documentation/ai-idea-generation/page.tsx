'use client';

import Link from 'next/link';
import { Lightbulb, Sparkles, BookOpen, MessageSquare } from 'lucide-react';

export default function AIIdeaGenerationDoc() {
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
          <h1 className="text-4xl font-bold text-white">AI Idea Generation</h1>
          <p className="mt-4 text-lg text-slate-300">
            Generate research questions, topic ideas, and chapter outlines tailored to your field
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Our AI Idea Generation tool leverages advanced language models to help you brainstorm
              and develop research ideas. Whether you&apos;re starting from scratch or refining an
              existing concept, this tool provides intelligent suggestions tailored to your
              academic field and research goals.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Lightbulb className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Topic Brainstorming</h3>
                    <p className="text-slate-300">
                      Generate dozens of research topic ideas based on your field, interests,
                      and current trends in academia. The AI analyzes recent publications to
                      suggest timely and relevant topics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Research Question Generator</h3>
                    <p className="text-slate-300">
                      Transform vague ideas into well-formed research questions. The tool helps
                      you craft specific, measurable, and researchable questions that meet
                      academic standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Chapter Outline Generator</h3>
                    <p className="text-slate-300">
                      Create structured chapter outlines for your thesis or dissertation.
                      The AI suggests sections, subsections, and key points to cover based
                      on your topic and methodology.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-pink-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Hypothesis Builder</h3>
                    <p className="text-slate-300">
                      Develop testable hypotheses based on your research questions. The tool
                      helps you formulate null and alternative hypotheses appropriate for
                      your research design.
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
                <strong>Select Your Field:</strong> Choose your academic discipline from our
                comprehensive list or enter a custom field.
              </li>
              <li>
                <strong>Provide Context:</strong> Enter any existing ideas, keywords, or areas
                of interest you want to explore.
              </li>
              <li>
                <strong>Choose Generation Mode:</strong> Select whether you want topic ideas,
                research questions, or chapter outlines.
              </li>
              <li>
                <strong>Review Suggestions:</strong> Browse through the AI-generated suggestions
                and save the ones that interest you.
              </li>
              <li>
                <strong>Refine and Iterate:</strong> Use the refinement feature to get more
                specific suggestions based on your favorites.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Supported Academic Fields</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Sciences</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Computer Science</li>
                  <li>Engineering</li>
                  <li>Biology</li>
                  <li>Chemistry</li>
                  <li>Physics</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Social Sciences</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Psychology</li>
                  <li>Sociology</li>
                  <li>Economics</li>
                  <li>Political Science</li>
                  <li>Anthropology</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Humanities</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Literature</li>
                  <li>History</li>
                  <li>Philosophy</li>
                  <li>Education</li>
                  <li>Communications</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Tips for Best Results</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Be specific about your academic level (undergraduate, master&apos;s, doctoral)</li>
                <li>Include any constraints like timeline, available resources, or methodology preferences</li>
                <li>Specify if you need Philippines-focused topics</li>
                <li>Use the iteration feature to narrow down broad ideas</li>
                <li>Save multiple ideas and discuss them with your advisor before deciding</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/research-conceptualization" className="text-blue-400 hover:underline">
              ← Research Conceptualization
            </Link>
          </div>
          <div>
            <Link href="/documentation/workflow-management" className="text-blue-400 hover:underline">
              Workflow Management →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
