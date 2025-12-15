'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenTool, Edit3, BookOpen, Users, Calendar, FileText, Save, Settings } from 'lucide-react';

export default function EssayEditorDoc() {
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
          <h1 className="text-4xl font-bold text-white">Essay Editor & Research Companion</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive writing environment with AI assistance, collaboration tools, and academic formatting
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Essay Editor</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Essay Editor is a comprehensive writing environment specially designed for academic 
              writing. It integrates AI-powered writing assistance, collaboration tools, and formatting 
              utilities into a seamless experience that supports the entire academic writing process - from 
              initial brainstorming through final submission.
            </p>
            <p className="text-slate-300 mb-4">
              The editor supports various academic document types including essays, research papers, thesis 
              chapters, and manuscript sections, with specialized tools for each type to ensure compliance 
              with academic standards and university-specific requirements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features of Essay Editor</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <PenTool className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Intelligent Writing Assistance</h3>
                    <p className="text-slate-300">
                      Integrated AI tools provide real-time suggestions for grammar, style, and academic 
                      tone while respecting the context of academic writing. The assistant understands 
                      technical terminology and research-specific language.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Edit3 className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Advanced Editing Tools</h3>
                    <p className="text-slate-300">
                      Includes sophisticated text manipulation tools such as paragraph restructuring, 
                      sentence optimization, and automated citation insertion. Features for tracking 
                      changes and comparing versions are also available.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Collaborative Review System</h3>
                    <p className="text-slate-300">
                      Enables real-time collaboration with advisors, critics, and peers. Allows for 
                      annotations, comments, and version tracking. Supports role-based permissions 
                      for different collaborators.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Academic Formatting</h3>
                    <p className="text-slate-300">
                      Automatically applies academic formatting styles including APA, MLA, Chicago, 
                      and university-specific templates. Manages references, tables of contents, 
                      and cross-references according to academic standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Editor Interface Overview</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Toolbar Features</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-blue-400 mb-2">Text Formatting</h4>
                <p className="text-slate-300 mb-3">
                  Standard formatting options with academic-specific styles:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Headings:</strong> Properly structured headings for academic documents</li>
                  <li><strong>Fonts:</strong> Academic-standard fonts (Times New Roman, Arial, Calibri)</li>
                  <li><strong>Spacing:</strong> Double spacing, proper margins, and line spacing</li>
                  <li><strong>Lists:</strong> Numbered and bulleted lists following academic standards</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-cyan-400 mb-2">AI Assistance Tools</h4>
                <p className="text-slate-300 mb-3">
                  Integrated AI features accessible from the main toolbar:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Grammar Checker:</strong> Real-time grammar and style suggestions</li>
                  <li><strong>Paraphraser:</strong> Content rewording while preserving meaning</li>
                  <li><strong>Citation Helper:</strong> Automatic citation generation and formatting</li>
                  <li><strong>Research Finder:</strong> Finds related academic sources</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-green-400 mb-3">Document Structure Panel</h3>
            <p className="text-slate-300 mb-4">
              On the left side of the editor, a navigation panel displays the document structure:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-300">
              <li><strong>Outline View:</strong> Hierarchical structure of headings and sections</li>
              <li><strong>Word Count:</strong> Real-time count of total words, current section, and goal progress</li>
              <li><strong>Statistics:</strong> Reading time, estimated pages, and other metrics</li>
              <li><strong>References:</strong> List of sources cited in the document</li>
              <li><strong>Comments:</strong> All annotations and feedback from collaborators</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Working with Different Document Types</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Research Essays</h3>
                <p className="text-slate-300 mb-3">
                  For analytical and argumentative essays:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Thesis statement templates and guidance</li>
                  <li>Evidence integration tools and citation helpers</li>
                  <li>Counterargument consideration prompts</li>
                  <li>Logical flow and coherence checking features</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Thesis Chapters</h3>
                <p className="text-slate-300 mb-3">
                  For thesis and dissertation writing:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Chapter-specific templates and structuring guides</li>
                  <li>Consistency checking across chapters</li>
                  <li>Bibliography management and cross-referencing</li>
                  <li>University-specific formatting and compliance tools</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Literature Reviews</h3>
                <p className="text-slate-300 mb-3">
                  For comprehensive review documents:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Source integration tools and synthesis aids</li>
                  <li>Thematic organization assistance</li>
                  <li>Gap identification and research question formulation</li>
                  <li>Chronological and thematic structuring options</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Collaboration Features</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Reviewer Management</h3>
                <p className="text-slate-300 mb-4">
                  Invite and manage reviewers with appropriate permissions:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Comment-Only:</strong> Reviewers can add feedback but not edit content</li>
                  <li><strong>Edit:</strong> Full editing capabilities with change tracking</li>
                  <li><strong>Approve:</strong> Authority to approve changes and finalize sections</li>
                  <li><strong>Admin:</strong> Complete control over document and reviewer access</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Feedback System</h3>
                <p className="text-slate-300 mb-4">
                  Comprehensive feedback and annotation tools:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Inline comments linked to specific text passages</li>
                  <li>General document comments</li>
                  <li>Priority tagging for feedback items</li>
                  <li>Response and resolution tracking</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Version Control</h3>
            <p className="text-slate-300 mb-4">
              The editor maintains comprehensive version history:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-300">
              <li><strong>Auto-Save:</strong> Frequent automatic saving of your work</li>
              <li><strong>Manual Versions:</strong> Save specific versions with custom names</li>
              <li><strong>Change Tracking:</strong> Visual indication of additions and deletions</li>
              <li><strong>Rollback:</strong> Ability to restore previous versions</li>
              <li><strong>Side-by-Side Comparison:</strong> Compare different versions directly</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">AI-Assisted Writing Features</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Content Generation</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Paragraph expansion and development</li>
                  <li>Transition sentence suggestions</li>
                  <li>Evidence and example recommendations</li>
                  <li>Summary and conclusion generation</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Quality Enhancement</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Clarity and coherence analysis</li>
                  <li>Tone and formality assessment</li>
                  <li>Academic vocabulary enhancement suggestions</li>
                  <li>Logical flow improvement recommendations</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Research Integration</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Automatic source linking to text passages</li>
                  <li>Reference list compilation and formatting</li>
                  <li>Plagiarism detection and prevention tips</li>
                  <li>Related research suggestions</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Formatting Automation</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Automatic heading numbering</li>
                  <li>Table of contents generation</li>
                  <li>Bibliography formatting and sorting</li>
                  <li>Figure and table captioning</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Academic Writing</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Planning and Organization</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use the outline feature to structure your document before writing</li>
                  <li>Set realistic goals for each writing session</li>
                  <li>Establish a consistent writing schedule</li>
                  <li>Keep track of sources as you write rather than after</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Collaboration Best Practices</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Provide clear instructions to reviewers about specific feedback needed</li>
                  <li>Respond promptly to feedback and questions from collaborators</li>
                  <li>Keep drafts in appropriate sharing stages (Draft, Review, Final)</li>
                  <li>Communicate deadlines and expectations clearly</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-800/30">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">AI Tool Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use AI suggestions as starting points, not final answers</li>
                  <li>Critical evaluation of AI-generated content is essential</li>
                  <li>Always verify technical accuracy of AI suggestions</li>
                  <li>Ensure AI suggestions align with your original argument</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Setting Up Your Writing Environment</h2>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Document Configuration</h3>
            <p className="text-slate-300 mb-4">
              Configure your document settings appropriately:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-6">
              <li>
                <strong>Document Type:</strong> Select your document type (Essay, Thesis Chapter, Literature Review, etc.) 
                to enable appropriate templates and features.
              </li>
              <li>
                <strong>Academic Level:</strong> Specify if undergraduate, graduate, or doctoral level 
                to adjust suggestions appropriately.
              </li>
              <li>
                <strong>University Template:</strong> Apply your university's specific formatting guidelines.
              </li>
              <li>
                <strong>Citation Style:</strong> Choose the required citation format (APA, MLA, Chicago, etc.).
              </li>
              <li>
                <strong>Language Settings:</strong> Set primary and secondary languages if needed.
              </li>
            </ol>
            
            <h3 className="text-xl font-semibold text-teal-400 mb-3">Workflow Optimization</h3>
            <p className="text-slate-300 mb-4">
              Optimize your workflow for maximum productivity:
            </p>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Use keyboard shortcuts to speed up the writing process</li>
              <li>Take advantage of the distraction-free writing mode</li>
              <li>Utilize the research database integration for source access</li>
              <li>Set up notifications for deadline reminders</li>
              <li>Sync your work across devices for multi-location writing</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3">Connection and Sync Issues</h3>
            <p className="text-slate-300 mb-4">
              If experiencing connection or synchronization problems:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Check your internet connection stability</li>
              <li>Clear browser cache and cookies</li>
              <li>Try using a different browser or device</li>
              <li>Ensure your document isn't locked by another collaborator</li>
              <li>Contact support if issues persist</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">AI Tool Troubleshooting</h3>
            <p className="text-slate-300 mb-4">
              For AI-related issues:
            </p>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Ensure input text is clear and grammatically correct</li>
              <li>Try breaking complex queries into simpler sentences</li>
              <li>Use the feedback feature to report unexpected suggestions</li>
              <li>Check that your document type and settings are properly configured</li>
              <li>Review AI suggestions critically before accepting</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/paraphraser" className="text-blue-400 hover:underline">
              ← Paraphraser
            </Link>
          </div>
          <div>
            <Link href="/documentation/academic-integrity" className="text-blue-400 hover:underline">
              Academic Integrity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}