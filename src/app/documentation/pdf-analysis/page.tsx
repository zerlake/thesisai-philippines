'use client';

import Link from 'next/link';
import { FileText, Shield, Cpu, Lock } from 'lucide-react';

export default function PDFAnalysisDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">Secure</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Privacy-Preserving PDF Analysis</h1>
          <p className="mt-4 text-lg text-slate-300">
            Analyze PDFs directly in your browser—no server uploads, complete privacy
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Our Privacy-Preserving PDF Analysis tool processes your documents entirely
              within your browser. Your files never leave your device, ensuring complete
              privacy and data protection for sensitive research materials.
            </p>
            <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
              <p className="text-green-300 font-semibold">
                Your PDFs are processed locally. We never upload, store, or have access to
                your documents.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Lock className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">100% Local Processing</h3>
                    <p className="text-slate-300">
                      All PDF parsing, text extraction, and analysis happens in your browser
                      using WebAssembly technology. Zero data transmission to servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Cpu className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Client-Side AI</h3>
                    <p className="text-slate-300">
                      Lightweight AI models run directly in your browser to provide intelligent
                      analysis without compromising your privacy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Full PDF Support</h3>
                    <p className="text-slate-300">
                      Extract text, images, and tables from PDFs. Supports multi-column layouts,
                      scanned documents (OCR), and complex formatting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Compliance Friendly</h3>
                    <p className="text-slate-300">
                      Perfect for research involving sensitive data, proprietary information,
                      or materials under NDA. Meets GDPR and institutional data policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Select Your PDF:</strong> Choose a PDF file from your computer.
                The file stays on your device.
              </li>
              <li>
                <strong>Local Processing:</strong> Our WebAssembly-based parser extracts
                text and structure entirely in your browser.
              </li>
              <li>
                <strong>AI Analysis:</strong> Client-side AI models analyze the content
                to identify key sections, extract data, and generate summaries.
              </li>
              <li>
                <strong>Review Results:</strong> View extracted information, make annotations,
                and export findings—all without server involvement.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Supported Analysis Types</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Text Extraction</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Full text extraction</li>
                  <li>Section identification</li>
                  <li>Paragraph segmentation</li>
                  <li>Header/footer removal</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Structure Analysis</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Table detection</li>
                  <li>Figure identification</li>
                  <li>Citation extraction</li>
                  <li>Reference parsing</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Content Analysis</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Key findings extraction</li>
                  <li>Methodology identification</li>
                  <li>Summary generation</li>
                  <li>Keyword extraction</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">OCR (Scanned PDFs)</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Text recognition</li>
                  <li>Layout preservation</li>
                  <li>Multi-language support</li>
                  <li>Quality enhancement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Privacy Guarantee</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Our Privacy Promise</h3>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>PDFs are never uploaded to our servers</li>
                <li>All processing occurs in your browser&apos;s memory</li>
                <li>Files are not cached or stored anywhere</li>
                <li>Analysis results stay on your device unless you choose to save them</li>
                <li>No tracking or analytics on document content</li>
                <li>Open-source processing libraries for transparency</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">System Requirements</h2>
            <p className="text-slate-300 mb-4">
              For optimal performance with local PDF processing:
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Modern browser (Chrome, Firefox, Safari, Edge)</li>
              <li>4GB+ available RAM for large documents</li>
              <li>WebAssembly support (all modern browsers)</li>
              <li>Stable internet for initial tool loading (processing is offline)</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/collaborative-literature-review" className="text-blue-400 hover:underline">
              ← Collaborative Literature Review
            </Link>
          </div>
          <div>
            <Link href="/documentation/methodology-tools" className="text-blue-400 hover:underline">
              Methodology & Data Tools →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
