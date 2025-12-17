'use client';

import Link from 'next/link';
import { University, FileText, Download, Settings } from 'lucide-react';

export default function UniversityFormattingDoc() {
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
          <h1 className="text-4xl font-bold text-white">University-Specific Formatting</h1>
          <p className="mt-4 text-lg text-slate-300">
            Access formatting guides for major Philippine universities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Every Philippine university has specific formatting requirements for theses
              and dissertations. Our University-Specific Formatting tool provides detailed
              guides and templates for major institutions, ensuring your document meets
              all requirements before submission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <University className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">University Profiles</h3>
                    <p className="text-slate-300">
                      Detailed formatting specifications for each university including
                      margins, fonts, spacing, and pagination requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready-Made Templates</h3>
                    <p className="text-slate-300">
                      Download pre-formatted templates that comply with your university&apos;s
                      requirements. Available in Word and LaTeX formats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Settings className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Auto-Formatting</h3>
                    <p className="text-slate-300">
                      Automatically format your existing document to match your university&apos;s
                      requirements with one click.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Download className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Sample Documents</h3>
                    <p className="text-slate-300">
                      View approved thesis samples from each university to see proper
                      formatting in context.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Supported Universities</h2>
            <p className="text-slate-300 mb-4">
              We provide formatting guides for these Philippine institutions:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Metro Manila</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>University of the Philippines - Diliman</li>
                  <li>Ateneo de Manila University</li>
                  <li>De La Salle University</li>
                  <li>University of Santo Tomas</li>
                  <li>Polytechnic University of the Philippines</li>
                  <li>Far Eastern University</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Visayas & Mindanao</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>University of San Carlos</li>
                  <li>Silliman University</li>
                  <li>UP Visayas</li>
                  <li>Ateneo de Davao University</li>
                  <li>Xavier University</li>
                  <li>Mindanao State University</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Common Formatting Elements</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400">Page Setup</h3>
                <p className="text-sm text-slate-300">Margins, paper size, orientation, binding edge allowance</p>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400">Typography</h3>
                <p className="text-sm text-slate-300">Font family, font sizes for headings and body, line spacing</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="font-semibold text-purple-400">Front Matter</h3>
                <p className="text-sm text-slate-300">Title page, approval sheet, abstract, table of contents format</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-800/30">
                <h3 className="font-semibold text-orange-400">Citations & References</h3>
                <p className="text-sm text-slate-300">Required citation style, reference list formatting</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-900/20 border border-pink-800/30">
                <h3 className="font-semibold text-pink-400">Chapter Structure</h3>
                <p className="text-sm text-slate-300">Heading levels, numbering systems, paragraph formatting</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Select Your University:</strong> Choose your institution from
                the dropdown menu in your project settings.
              </li>
              <li>
                <strong>Download Template:</strong> Get a pre-formatted template with
                correct styles already applied.
              </li>
              <li>
                <strong>Write Your Content:</strong> Use the template&apos;s built-in styles
                for automatic formatting.
              </li>
              <li>
                <strong>Review Guidelines:</strong> Access the full formatting guide
                for specific questions.
              </li>
              <li>
                <strong>Export:</strong> Export your final document in the required
                format (usually .docx or PDF).
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Tips</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Always verify requirements with your department—some have additional specifications</li>
                <li>Check for recent updates to your university&apos;s thesis manual</li>
                <li>Use our format checker before final submission</li>
                <li>Keep a backup of the original template for reference</li>
                <li>Contact us if your university isn&apos;t listed—we&apos;ll add it</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/synthesis-paraphrasing" className="text-blue-400 hover:underline">
              ← Synthesis & Paraphrasing
            </Link>
          </div>
          <div>
            <Link href="/documentation/format-checker" className="text-blue-400 hover:underline">
              Format Checker →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
