'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Quote, BookOpen, FileText, Users, Calendar, Star, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CitationManagerDoc() {
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
          <h1 className="text-4xl font-bold text-white">Citation Manager & Reference Generator</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive tool for managing citations, generating references, and formatting bibliographies
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Citation Manager</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Citation Manager is a comprehensive solution for managing citations, generating 
              references, and creating properly formatted bibliographies according to various academic 
              standards. The tool is specifically designed to handle the citation needs of Filipino 
              students and researchers, with support for international standards and the ability to 
              format references according to specific university guidelines.
            </p>
            <p className="text-slate-300 mb-4">
              Our Citation Manager goes beyond simple citation generation to provide intelligent 
              reference management, plagiarism prevention, and collaboration features that streamline 
              the research process while maintaining academic integrity.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Features of Citation Manager</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Quote className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Multi-Format Support</h3>
                    <p className="text-slate-300">
                      Generate citations in multiple formats including APA, MLA, Chicago, IEEE, and 
                      university-specific styles. The system automatically updates citations when 
                      source information changes.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Intelligent Source Detection</h3>
                    <p className="text-slate-300">
                      Automatically extracts citation information from URLs, DOI, ISBN, or PubMed IDs. 
                      The system recognizes various source types including journal articles, books, 
                      conference papers, reports, and online resources.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Reference Library Management</h3>
                    <p className="text-slate-300">
                      Organize and categorize your references with tags, collections, and notes. 
                      Sync your library across devices and collaborate with advisors and peers 
                      on shared reference collections.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Collaborative Features</h3>
                    <p className="text-slate-300">
                      Share reference libraries with advisors, collaborators, and research teams. 
                      Track changes, merge libraries, and ensure everyone on your team is working 
                      with the same source references.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Dynamic Citation Updates</h3>
                    <p className="text-slate-300">
                      Automatically update citation styles and formats throughout your document 
                      when you change requirements. The system tracks citation locations and 
                      updates them consistently across all chapters.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Star className="h-6 w-6 text-red-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Quality Assurance</h3>
                    <p className="text-slate-300">
                      Validates citation accuracy and flags potential issues with incomplete 
                      or inconsistent information. Provides suggestions for improving citation quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use Citation Manager</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Adding Sources</h3>
            <p className="text-slate-300 mb-4">
              The Citation Manager offers multiple ways to add sources to your reference library:
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Manual Entry</h4>
                <ol className="list-decimal pl-6 space-y-3 text-slate-300">
                  <li>Click &quot;Add Source&quot; in your reference library</li>
                  <li>Select the source type (journal article, book, report, etc.)</li>
                  <li>Fill in the required fields (author, title, publication details)</li>
                  <li>Optionally add tags, notes, and collection assignments</li>
                  <li>Save the citation to your library</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="text-lg font-semibold text-green-400 mb-2">Import from URL/DOI</h4>
                <ol className="list-decimal pl-6 space-y-3 text-slate-300">
                  <li>Click &quot;Import Source&quot; in your reference library</li>
                  <li>Paste the URL, DOI, or ISBN of the publication</li>
                  <li>The system will automatically extract citation information</li>
                  <li>Review and edit any detected information as needed</li>
                  <li>Confirm addition to your library</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">Bulk Import</h4>
                <p className="text-slate-300 mb-3">
                  For importing multiple sources at once:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Upload a BibTeX, RIS, or CSV file containing citation data</li>
                  <li>Map fields if necessary to ensure proper data import</li>
                  <li>Review duplicates that may already exist in your library</li>
                  <li>Assign imported sources to collections or tags</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-amber-400 mb-3">Generating Citations</h3>
            <p className="text-slate-300 mb-4">
              Insert citations directly into your document with proper formatting:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>While writing in the ThesisAI editor, place your cursor where you want the citation</li>
              <li>Click the citation icon in the toolbar or use the shortcut (Ctrl/Cmd + K)</li>
              <li>Select the source from your reference library</li>
              <li>Choose the citation format (inline, footnote, endnote)</li>
              <li>Select the appropriate style (APA, MLA, Chicago, etc.)</li>
              <li>The citation will be inserted with proper formatting and linked to the source</li>
            </ol>
            
            <h3 className="text-xl font-semibold text-pink-400 mb-3">Managing Bibliography</h3>
            <p className="text-slate-300 mb-4">
              Generate and format your bibliography with a single click:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>Navigate to the end of your document where you want the bibliography</li>
              <li>Click &quot;Insert Bibliography&quot; from the citation tools menu</li>
              <li>Select your preferred citation style</li>
              <li>Choose formatting options (sorting, inclusion of annotations, etc.)</li>
              <li>The bibliography will be generated automatically from all cited sources</li>
              <li>Updates automatically when new citations are added</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Supported Citation Styles</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">International Standards</h3>
                <ul className="space-y-4">
                  <li>
                    <strong className="text-white">APA (American Psychological Association):</strong>
                    <p className="text-sm text-slate-300 ml-2">Commonly used in social sciences, psychology, and education fields</p>
                  </li>
                  <li>
                    <strong className="text-white">MLA (Modern Language Association):</strong>
                    <p className="text-sm text-slate-300 ml-2">Preferred for humanities, literature, and language studies</p>
                  </li>
                  <li>
                    <strong className="text-white">Chicago/Turabian:</strong>
                    <p className="text-sm text-slate-300 ml-2">Used in history, arts, and some social sciences</p>
                  </li>
                  <li>
                    <strong className="text-white">IEEE (Institute of Electrical and Electronics Engineers):</strong>
                    <p className="text-sm text-slate-300 ml-2">Standard for engineering, computer science, and technical disciplines</p>
                  </li>
                  <li>
                    <strong className="text-white">ACS (American Chemical Society):</strong>
                    <p className="text-sm text-slate-300 ml-2">Used in chemistry and related fields</p>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Philippine University Styles</h3>
                <ul className="space-y-4">
                  <li>
                    <strong className="text-white">University of the Philippines Style:</strong>
                    <p className="text-sm text-slate-300 ml-2">Specific format requirements for UP students and faculty</p>
                  </li>
                  <li>
                    <strong className="text-white">Ateneo de Manila Format:</strong>
                    <p className="text-sm text-slate-300 ml-2">Guidelines specific to Ateneo research requirements</p>
                  </li>
                  <li>
                    <strong className="text-white">De La Salle University Style:</strong>
                    <p className="text-sm text-slate-300 ml-2">DLSU-specific citation and formatting requirements</p>
                  </li>
                  <li>
                    <strong className="text-white">University of Santo Tomas Guidelines:</strong>
                    <p className="text-sm text-slate-300 ml-2">UST-specific academic writing standards</p>
                  </li>
                  <li>
                    <strong className="text-white">Custom Institution Templates:</strong>
                    <p className="text-sm text-slate-300 ml-2">Support for other Philippine universities' specific requirements</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Style Conversion</h3>
              <p className="text-slate-300">
                Easily switch between citation styles for different requirements or publications. 
                The Citation Manager maintains all citation information regardless of the format 
                being displayed, allowing seamless conversion between styles without re-entering 
                source details.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Collaboration Features</h2>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Shared Reference Libraries</h3>
            <p className="text-slate-300 mb-4">
              Work effectively with advisors, peers, and research teams:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li><strong>Library Sharing:</strong> Grant access to your reference library with specific permissions</li>
              <li><strong>Collection Groups:</strong> Organize sources into shared collections for different projects</li>
              <li><strong>Permission Levels:</strong> Control whether others can view, comment, or edit your references</li>
              <li><strong>Real-time Sync:</strong> Changes to shared libraries update across all collaborators instantly</li>
              <li><strong>Conflict Resolution:</strong> Automatic merging of changes with conflict detection</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Review and Validation</h3>
            <p className="text-slate-300 mb-4">
              Ensure the accuracy and quality of your citations through collaborative review:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ul className="list-disc pl-6 text-slate-300">
                <li><strong>Peer Validation:</strong> Invite collaborators to review citation accuracy</li>
                <li><strong>Expert Consultation:</strong> Share reference lists with subject matter experts</li>
                <li><strong>Advisor Review:</strong> Submit complete bibliographies for advisory feedback</li>
                <li><strong>Quality Flags:</strong> Automatic detection of incomplete or problematic citations</li>
                <li><strong>Verification Reports:</strong> Detailed analysis of citation coverage and accuracy</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Citation Management</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Organization Strategies</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Tag sources by relevance (critical, supporting, background)</li>
                  <li>Create collections by chapter or research phase</li>
                  <li>Add notes for each source summarizing key points</li>
                  <li>Record personal insights alongside bibliographic information</li>
                  <li>Track source evaluation criteria for later review</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Integration Techniques</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Import sources early in the research process</li>
                  <li>Regularly sync citations between different documents</li>
                  <li>Update citation styles before major revisions</li>
                  <li>Verify accuracy before final submission</li>
                  <li>Maintain backups of your reference library</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Quality Assurance</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Double-check automatically imported citation data</li>
                  <li>Verify that citation style matches institutional requirements</li>
                  <li>Ensure all sources in bibliography are cited in text</li>
                  <li>Confirm page numbers and other specific details</li>
                  <li>Validate URLs and DOI links for accessibility</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-3">Productivity Tips</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use keyboard shortcuts for quick citation insertion</li>
                  <li>Set default citation style for your institution</li>
                  <li>Enable automatic bibliography generation</li>
                  <li>Utilize smart search for finding existing sources</li>
                  <li>Regularly export library backups for safekeeping</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Citation Accuracy Issues</h3>
                <p className="text-slate-300 mb-3">
                  If citations appear incorrect:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Verify that the citation style is set correctly for your document</li>
                  <li>Check if source information was completely extracted during import</li>
                  <li>Manually edit source details to ensure accuracy</li>
                  <li>Update the citation style across your entire document</li>
                  <li>Confirm that your university's specific guidelines are applied</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Library Sync Problems</h3>
                <p className="text-slate-300 mb-3">
                  For collaboration and sync issues:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Confirm internet connectivity for cloud sync features</li>
                  <li>Ensure you have the necessary permissions for shared libraries</li>
                  <li>Check that your account is properly authenticated</li>
                  <li>Restart the application if sync seems stuck</li>
                  <li>Contact support if persistent sync issues occur</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Style Compatibility</h3>
                <p className="text-slate-300 mb-3">
                  When dealing with different citation style requirements:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Export citations in multiple formats simultaneously</li>
                  <li>Use the style preview feature before applying changes</li>
                  <li>Maintain separate document versions for different style requirements</li>
                  <li>Confirm with your university's library for specific guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Features</h2>
            
            <h3 className="text-xl font-semibold text-blue-400 mb-3">Citation Analytics</h3>
            <p className="text-slate-300 mb-4">
              Understand your research patterns and source usage:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ul className="list-disc pl-6 text-slate-300">
                <li>Citation frequency analysis across your document</li>
                <li>Source utilization metrics and timeline tracking</li>
                <li>Relevance scoring based on citation context</li>
                <li>Gap analysis showing under-cited areas</li>
                <li>Co-citation network visualization</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold text-green-400 mb-3 mt-6">Integration Capabilities</h3>
            <p className="text-slate-300 mb-4">
              Connect with external research tools and databases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Direct import from Google Scholar, JSTOR, and academic databases</li>
              <li>Integration with library systems of participating universities</li>
              <li>Export options compatible with Mendeley, Zotero, and EndNote</li>
              <li>API access for custom integration with research tools</li>
              <li>CSV import/export for manual data management</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/academic-integrity" className="text-blue-400 hover:underline">
              ← Academic Integrity
            </Link>
          </div>
          <div>
            <Link href="/documentation/university-guides" className="text-blue-400 hover:underline">
              University Guides →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}