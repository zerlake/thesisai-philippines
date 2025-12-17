'use client';

import Link from 'next/link';
import { BookOpen, FileSearch, Table, Highlighter } from 'lucide-react';

export default function ArticleAnalyzerDoc() {
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
          <h1 className="text-4xl font-bold text-white">Research Article Analyzer</h1>
          <p className="mt-4 text-lg text-slate-300">
            Extract methodology, findings, conclusions with annotation tools and literature matrices
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Research Article Analyzer is a powerful tool designed to help you efficiently
              review and extract key information from academic papers. Using AI-powered analysis,
              it identifies and organizes the essential components of research articles to
              accelerate your literature review process.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Automatic Extraction</h3>
                    <p className="text-slate-300">
                      Automatically extracts research objectives, methodology, sample size,
                      findings, and conclusions from uploaded articles using AI analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Table className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Literature Matrix Generator</h3>
                    <p className="text-slate-300">
                      Automatically populate literature review matrices with extracted data.
                      Export to Excel or integrate directly into your thesis document.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Highlighter className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Annotations</h3>
                    <p className="text-slate-300">
                      Highlight and annotate articles with color-coded categories. Add notes,
                      tags, and create connections between related concepts across papers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileSearch className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Cross-Paper Analysis</h3>
                    <p className="text-slate-300">
                      Compare methodologies and findings across multiple papers. Identify
                      patterns, contradictions, and research gaps in your literature.
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
                <strong>Upload Articles:</strong> Upload PDF files of research articles you
                want to analyze. Supports batch upload of multiple papers.
              </li>
              <li>
                <strong>Select Analysis Mode:</strong> Choose between quick summary, detailed
                extraction, or comprehensive analysis modes.
              </li>
              <li>
                <strong>Review Extractions:</strong> Review the AI-extracted information and
                make corrections or additions as needed.
              </li>
              <li>
                <strong>Add Annotations:</strong> Highlight important sections and add your
                own notes and interpretations.
              </li>
              <li>
                <strong>Generate Matrix:</strong> Create a literature matrix from analyzed
                articles for your review chapter.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Extracted Information</h2>
            <p className="text-slate-300 mb-4">
              The analyzer extracts and organizes the following elements:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Study Details</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Author(s) and Year</li>
                  <li>Research Title</li>
                  <li>Publication Source</li>
                  <li>Research Objectives</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Methodology</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Research Design</li>
                  <li>Sample Size & Selection</li>
                  <li>Data Collection Methods</li>
                  <li>Analysis Techniques</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Findings</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Key Results</li>
                  <li>Statistical Findings</li>
                  <li>Themes/Patterns</li>
                  <li>Supporting Evidence</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Conclusions</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Main Conclusions</li>
                  <li>Implications</li>
                  <li>Limitations</li>
                  <li>Future Research</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Always verify AI-extracted information against the original paper</li>
                <li>Use consistent tagging and annotation schemes across all papers</li>
                <li>Group related papers into collections for easier comparison</li>
                <li>Export your literature matrix regularly as a backup</li>
                <li>Add personal notes about relevance to your specific research</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/workflow-management" className="text-blue-400 hover:underline">
              ← Workflow Management
            </Link>
          </div>
          <div>
            <Link href="/documentation/collaborative-literature-review" className="text-blue-400 hover:underline">
              Collaborative Literature Review →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
