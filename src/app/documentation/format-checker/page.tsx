'use client';

import Link from 'next/link';
import { FileCheck, AlertTriangle, CheckCircle, List } from 'lucide-react';

export default function FormatCheckerDoc() {
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
          <h1 className="text-4xl font-bold text-white">Format Compliance Checker</h1>
          <p className="mt-4 text-lg text-slate-300">
            Automated checks against your university&apos;s specific requirements
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Format Compliance Checker automatically scans your document against your
              university&apos;s specific formatting requirements. Get detailed reports on
              compliance issues and suggestions for fixing them before submission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileCheck className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Analysis</h3>
                    <p className="text-slate-300">
                      Checks margins, fonts, spacing, pagination, headings, citations,
                      and all other formatting elements required by your university.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Issue Highlighting</h3>
                    <p className="text-slate-300">
                      Visual highlighting of formatting issues directly in your document.
                      Click on any issue to see what&apos;s wrong and how to fix it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Auto-Fix Suggestions</h3>
                    <p className="text-slate-300">
                      One-click fixes for common formatting issues. Apply individual fixes
                      or fix all issues at once.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <List className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Compliance Report</h3>
                    <p className="text-slate-300">
                      Generate a detailed PDF report showing compliance status for each
                      requirement. Perfect for review meetings with your advisor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">What We Check</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Page Layout</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Margin sizes (top, bottom, left, right)</li>
                  <li>Paper size and orientation</li>
                  <li>Header and footer placement</li>
                  <li>Binding edge allowance</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Typography</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Font family and size</li>
                  <li>Line spacing throughout</li>
                  <li>Paragraph indentation</li>
                  <li>Character spacing</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Structure</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Chapter heading formats</li>
                  <li>Section numbering</li>
                  <li>Table of contents accuracy</li>
                  <li>List formatting</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">References</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Citation style consistency</li>
                  <li>Reference list format</li>
                  <li>In-text citation accuracy</li>
                  <li>Hanging indent formatting</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Tables & Figures</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Caption placement and format</li>
                  <li>Numbering sequence</li>
                  <li>List of tables/figures accuracy</li>
                  <li>Image quality requirements</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Front & Back Matter</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Title page layout</li>
                  <li>Approval sheet format</li>
                  <li>Abstract requirements</li>
                  <li>Appendix formatting</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Select University:</strong> Choose your university from the dropdown
                to load the correct requirements.
              </li>
              <li>
                <strong>Upload Document:</strong> Upload your thesis document in .docx or
                .pdf format.
              </li>
              <li>
                <strong>Run Check:</strong> Click &quot;Check Format&quot; to start the automated
                analysis.
              </li>
              <li>
                <strong>Review Results:</strong> Browse through the list of issues organized
                by category and severity.
              </li>
              <li>
                <strong>Apply Fixes:</strong> Fix issues individually or use &quot;Fix All&quot;
                for automatic corrections.
              </li>
              <li>
                <strong>Generate Report:</strong> Export a compliance report for your records
                or advisor review.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Issue Severity Levels</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Critical</h3>
                <p className="text-sm text-slate-300">
                  Must be fixed before submission. These issues will likely cause rejection.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Warning</h3>
                <p className="text-sm text-slate-300">
                  Should be fixed. May cause reviewer comments or revision requests.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Suggestion</h3>
                <p className="text-sm text-slate-300">
                  Optional improvements for better presentation and readability.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Tips</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Run the checker early and often during your writing process</li>
                <li>Fix critical issues first before addressing warnings</li>
                <li>Verify auto-fixes to ensure they match your intentions</li>
                <li>Keep the compliance report for your thesis defense</li>
                <li>Update your university selection if requirements change</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/university-formatting" className="text-blue-400 hover:underline">
              ← University Formatting
            </Link>
          </div>
          <div>
            <Link href="/documentation/advisor-collaboration" className="text-blue-400 hover:underline">
              Advisor Collaboration →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
