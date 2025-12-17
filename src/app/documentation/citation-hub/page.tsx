'use client';

import Link from 'next/link';
import { BookCopy, Quote, Shield, FileCheck } from 'lucide-react';

export default function CitationHubDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">Essential</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Citation & Originality Hub</h1>
          <p className="mt-4 text-lg text-slate-300">
            Generate citations, manage bibliography, and ensure academic integrity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Citation & Originality Hub is your comprehensive solution for managing
              references and ensuring academic integrity. Generate accurate citations in
              any format, organize your bibliography, and check your work for originality—
              all in one place.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookCopy className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Citation Generator</h3>
                    <p className="text-slate-300">
                      Automatically generate citations from URLs, DOIs, ISBNs, or manual entry.
                      Supports 10,000+ citation styles including APA 7th, MLA, Chicago, Harvard,
                      and Philippine-specific formats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Quote className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Bibliography Manager</h3>
                    <p className="text-slate-300">
                      Organize all your sources in one place. Create folders, add tags, and
                      export your complete bibliography in any format with one click.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Originality Checker</h3>
                    <p className="text-slate-300">
                      Check your work against billions of sources to ensure originality.
                      Get detailed reports highlighting potential issues with suggestions
                      for proper citation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileCheck className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">In-Text Citation Helper</h3>
                    <p className="text-slate-300">
                      Insert properly formatted in-text citations as you write. The tool
                      automatically formats citations based on context (narrative vs.
                      parenthetical).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Supported Citation Styles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">International</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>APA 7th Edition</li>
                  <li>MLA 9th Edition</li>
                  <li>Chicago/Turabian</li>
                  <li>Harvard</li>
                  <li>IEEE</li>
                  <li>Vancouver</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Philippine Universities</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>UP Format</li>
                  <li>Ateneo Format</li>
                  <li>La Salle Format</li>
                  <li>UST Format</li>
                  <li>CHED Guidelines</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Discipline-Specific</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>AMA (Medical)</li>
                  <li>ACS (Chemistry)</li>
                  <li>APSA (Political Science)</li>
                  <li>ASA (Sociology)</li>
                  <li>Bluebook (Legal)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Add Sources:</strong> Enter URLs, DOIs, ISBNs, or manually input
                source details to add them to your library.
              </li>
              <li>
                <strong>Select Style:</strong> Choose your required citation style from the
                dropdown menu or set a default for your project.
              </li>
              <li>
                <strong>Generate Citations:</strong> Get formatted citations instantly.
                Copy in-text citations or reference list entries.
              </li>
              <li>
                <strong>Organize Bibliography:</strong> Create folders for different chapters
                or themes. Tag sources for easy filtering.
              </li>
              <li>
                <strong>Check Originality:</strong> Upload your document to scan for potential
                similarity issues before submission.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Originality Report</h2>
            <p className="text-slate-300 mb-4">
              Our originality checker provides detailed reports including:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Report Contents</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Overall similarity percentage</li>
                  <li>Highlighted matching passages</li>
                  <li>Source links for matches</li>
                  <li>Excluded quotes/references</li>
                  <li>Word-by-word analysis</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Sources Checked</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Academic journals & papers</li>
                  <li>Online publications</li>
                  <li>Student paper database</li>
                  <li>Books & textbooks</li>
                  <li>Web content</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Add sources to your library as soon as you find them</li>
                <li>Verify auto-generated citations against the original source</li>
                <li>Run originality checks before each major revision</li>
                <li>Use the in-text citation helper while writing to avoid missing citations</li>
                <li>Export and backup your bibliography regularly</li>
                <li>Check your university&apos;s specific citation requirements</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/ai-writing-suite" className="text-blue-400 hover:underline">
              ← AI Writing Suite
            </Link>
          </div>
          <div>
            <Link href="/documentation/synthesis-paraphrasing" className="text-blue-400 hover:underline">
              Synthesis & Paraphrasing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
