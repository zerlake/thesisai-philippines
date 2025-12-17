'use client';

import Link from 'next/link';
import { Presentation, MessageCircleQuestion, BookOpen, Brain } from 'lucide-react';

export default function DefensePreparationDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">Advanced</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Defense Preparation Suite</h1>
          <p className="mt-4 text-lg text-slate-300">
            Generate slides, practice with AI Q&A simulator, study with flashcards
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Defense Preparation Suite helps you prepare for your thesis defense with
              comprehensive tools for creating presentations, practicing answers, and reviewing
              your research. Face your panel with confidence knowing you&apos;ve prepared thoroughly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Presentation className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Slide Generator</h3>
                    <p className="text-slate-300">
                      Automatically generate defense presentation slides from your thesis.
                      Customize layouts, add charts from your data, and export to PowerPoint
                      or Google Slides.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <MessageCircleQuestion className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI Q&A Simulator</h3>
                    <p className="text-slate-300">
                      Practice with an AI that simulates panel questions based on your thesis
                      content. Get feedback on your answers and improve your responses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Flashcard Generator</h3>
                    <p className="text-slate-300">
                      Create flashcards from your thesis key points, definitions, and
                      methodology details. Use spaced repetition to memorize important content.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Brain className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Defense Checklist</h3>
                    <p className="text-slate-300">
                      Comprehensive checklist covering everything you need to prepare before
                      your defense: documents, presentation, attire, and logistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Slide Generator</h2>
            <p className="text-slate-300 mb-4">
              Create professional defense presentations in minutes:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Auto-Generated Slides</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Title slide with university branding</li>
                  <li>Introduction & background</li>
                  <li>Research questions/objectives</li>
                  <li>Methodology overview</li>
                  <li>Key findings with charts</li>
                  <li>Conclusions & recommendations</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Customization Options</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Multiple design themes</li>
                  <li>Custom color schemes</li>
                  <li>University logo placement</li>
                  <li>Chart style preferences</li>
                  <li>Slide count settings</li>
                  <li>Export formats</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">AI Q&A Simulator</h2>
            <p className="text-slate-300 mb-4">
              Practice defending your thesis with our AI-powered question simulator:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400">Question Types</h3>
                <p className="text-sm text-slate-300">Methodology questions, theoretical framework, limitations, implications, future research</p>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400">Difficulty Levels</h3>
                <p className="text-sm text-slate-300">Easy (clarification), Medium (analysis), Hard (critique), Expert (deep probing)</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="font-semibold text-purple-400">Feedback System</h3>
                <p className="text-sm text-slate-300">Get scored on completeness, clarity, academic rigor, and confidence</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-800/30">
                <h3 className="font-semibold text-orange-400">Panel Simulation</h3>
                <p className="text-sm text-slate-300">Simulates different panel member personalities and questioning styles</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Flashcard System</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Card Categories</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Key terms & definitions</li>
                  <li>Statistical results</li>
                  <li>Methodology steps</li>
                  <li>Literature highlights</li>
                  <li>Theoretical concepts</li>
                  <li>Important citations</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Study Features</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Spaced repetition algorithm</li>
                  <li>Progress tracking</li>
                  <li>Difficulty rating</li>
                  <li>Custom card creation</li>
                  <li>Mobile-friendly review</li>
                  <li>Share with teammates</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Generate Presentation:</strong> Select your thesis document and
                click &quot;Generate Slides&quot; to create a draft presentation.
              </li>
              <li>
                <strong>Customize Slides:</strong> Edit content, rearrange slides, and
                apply your preferred theme.
              </li>
              <li>
                <strong>Create Flashcards:</strong> Auto-generate flashcards from your
                thesis or create custom ones for specific topics.
              </li>
              <li>
                <strong>Practice Q&A:</strong> Start a practice session with the AI
                simulator. Choose difficulty and question types.
              </li>
              <li>
                <strong>Review & Improve:</strong> Use feedback to identify weak areas
                and review relevant flashcards.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Defense Tips</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Know your thesis inside out—read it multiple times before defense</li>
                <li>Anticipate questions about methodology and limitations</li>
                <li>Practice explaining complex concepts simply</li>
                <li>Prepare concise answers—don&apos;t ramble</li>
                <li>It&apos;s okay to say &quot;I don&apos;t know&quot; but offer to find out</li>
                <li>Practice with friends or family before the actual defense</li>
                <li>Get adequate rest the night before</li>
                <li>Arrive early to set up and settle your nerves</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/team-collaboration" className="text-blue-400 hover:underline">
              ← Team Collaboration
            </Link>
          </div>
          <div>
            <Link href="/documentation" className="text-blue-400 hover:underline">
              Back to Documentation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
