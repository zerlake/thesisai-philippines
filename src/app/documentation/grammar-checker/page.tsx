'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SpellCheck, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

export default function GrammarCheckerDoc() {
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
          <h1 className="text-4xl font-bold text-white">Grammar Checker & Writing Assistant</h1>
          <p className="mt-4 text-lg text-slate-300">
            Advanced tool for improving your academic writing quality and clarity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Grammar Checker</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Grammar Checker is a sophisticated AI-powered tool designed specifically for academic writing. 
              It goes beyond basic grammar checking to provide context-aware suggestions that align with academic writing 
              standards and the Philippine educational system's requirements.
            </p>
            <p className="text-slate-300 mb-4">
              The tool identifies various types of errors while considering the formal tone, technical terminology, 
              and scholarly conventions expected in thesis and research documents.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Features of Grammar Checker</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <SpellCheck className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Advanced Grammar Detection</h3>
                    <p className="text-slate-300">
                      Identifies complex grammatical structures and provides corrections for subject-verb agreement, 
                      tense consistency, pronoun usage, and more sophisticated grammatical constructs specific to 
                      academic writing.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Style Enhancement</h3>
                    <p className="text-slate-300">
                      Improves sentence structure, eliminates redundancy, enhances clarity, and suggests more 
                      appropriate academic vocabulary while preserving the meaning and technical accuracy of your text.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Context-Aware Suggestions</h3>
                    <p className="text-slate-300">
                      Distinguishes between technical terminology, proper nouns, and potentially incorrect usage, 
                      avoiding false positives with domain-specific language commonly used in academic research.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Wrench className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Editing Tools</h3>
                    <p className="text-slate-300">
                      Provides multiple correction suggestions for each issue, with explanations to help you 
                      understand the grammar rule and improve your writing skills over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Using the Grammar Checker</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">In the Editor</h3>
            <p className="text-slate-300 mb-4">
              The Grammar Checker is integrated directly into the ThesisAI editor:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-6">
              <li>Open any document in the ThesisAI editor</li>
              <li>Click the &quot;AI Tools&quot; menu in the top toolbar</li>
              <li>Select &quot;Grammar Checker&quot; from the dropdown menu</li>
              <li>Choose your checking options:</li>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Check Entire Document:</strong> Analyze the complete document</li>
                <li><strong>Check Selection:</strong> Only analyze selected text</li>
                <li><strong>Check Paragraph:</strong> Analyze only the current paragraph</li>
              </ul>
              <li>Review suggestions presented in the sidebar</li>
              <li>Accept, reject, or modify each suggestion as needed</li>
            </ol>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Standalone Grammar Check</h3>
            <p className="text-slate-300 mb-4">
              You can also access the Grammar Checker independently:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-300">
              <li>Navigate to the &quot;AI Tools&quot; section from your dashboard</li>
              <li>Select &quot;Grammar Checker&quot; from the available tools</li>
              <li>Paste your text into the input field or upload a document</li>
              <li>Configure your checking preferences</li>
              <li>Click &quot;Check Grammar&quot; to analyze your text</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Types of Errors Detected</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Grammar Issues</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Subject-verb disagreement</li>
                  <li>Tense inconsistencies</li>
                  <li>Pronoun reference errors</li>
                  <li>Modifier placement issues</li>
                  <li>Run-on sentences and fragments</li>
                  <li>Improper comma usage</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Style Concerns</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Passive voice overuse</li>
                  <li>Redundant phrases</li>
                  <li>Unclear antecedents</li>
                  <li>Wordiness and verbosity</li>
                  <li>Inconsistent terminology</li>
                  <li>Awkward sentence construction</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Academic Writing Standards</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Informal language usage</li>
                  <li>First-person overuse (when inappropriate)</li>
                  <li>Contractions in formal text</li>
                  <li>Colloquial expressions</li>
                  <li>Inappropriate casual tone</li>
                  <li>Citation integration issues</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Interpreting Results</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Error Severity Levels</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">Critical</p>
                      <p className="text-sm text-slate-300">Errors that significantly impact readability or meaning</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">Moderate</p>
                      <p className="text-sm text-slate-300">Issues that affect clarity or professionalism</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">Style</p>
                      <p className="text-sm text-slate-300">Suggestions to improve academic tone and clarity</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Suggestion Elements</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><strong>Issue Description:</strong> Clear explanation of what's wrong</li>
                  <li><strong>Original Text:</strong> The text before correction</li>
                  <li><strong>Suggested Text:</strong> Proposed correction or improvement</li>
                  <li><strong>Rule Explanation:</strong> Academic writing principle behind the suggestion</li>
                  <li><strong>Alternative Options:</strong> Multiple ways to address the issue</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Grammar Checking</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Effective Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use Grammar Checker as one of many tools, not the sole editor</li>
                  <li>Review all suggestions critically, not blindly accepting them</li>
                  <li>Consider the context and academic requirements</li>
                  <li>Learn from the suggestions to improve your writing</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Common Pitfalls</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Over-relying on automated checks</li>
                  <li>Accepting suggestions that change the meaning</li>
                  <li>Ignoring domain-specific terminology</li>
                  <li>Applying changes without understanding the reason</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Academic Writing Tips</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Maintain objective tone throughout</li>
                  <li>Use appropriate academic terminology</li>
                  <li>Ensure consistency in formatting and style</li>
                  <li>Follow your university's specific writing guidelines</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Review Workflow</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Perform content editing first, then grammar checking</li>
                  <li>Use Grammar Checker in multiple passes if needed</li>
                  <li>Have collaborators review after grammar corrections</li>
                  <li>Do a final proofread yourself before submission</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Configuring Grammar Checker Settings</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Academic Writing Modes</h3>
            <p className="text-slate-300 mb-4">
              ThesisAI offers specialized settings for different academic writing contexts:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white">Formal Academic Mode</h4>
                <p className="text-slate-300 text-sm mt-2">
                  Stricter rules for formal writing, with emphasis on eliminating contractions, 
                  informal language, and first-person statements unless appropriate.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white">Technical Writing Mode</h4>
                <p className="text-slate-300 text-sm mt-2">
                  Adjusted sensitivities for technical terminology, with special recognition for 
                  field-specific jargon and complex technical phrasing.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white">Colloquial Check Mode</h4>
                <p className="text-slate-300 text-sm mt-2">
                  Focus on identifying overly casual language, slang, and informal expressions 
                  that may not be appropriate for academic documents.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3">False Positives</h3>
            <p className="text-slate-300 mb-4">
              Sometimes the Grammar Checker flags acceptable academic usage. Handle these situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li><strong>Specialized Terminology:</strong> Properly configured systems recognize most technical terms, but rare terminologies might need manual review</li>
              <li><strong>University-Specific Terms:</strong> Some institutional abbreviations or names might be flagged incorrectly</li>
              <li><strong>Quoted Material:</strong> Direct quotes should not be modified unless they contain transcription errors</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Performance Tips</h3>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Check grammar in sections rather than entire long documents</li>
              <li>Focus on one type of error at a time for comprehensive improvement</li>
              <li>Use the ignore option for repeated acceptable usage</li>
              <li>Save corrected versions to track your improvement over time</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/dashboard-overview" className="text-blue-400 hover:underline">
              ← Dashboard Overview
            </Link>
          </div>
          <div>
            <Link href="/documentation/topic-generator" className="text-blue-400 hover:underline">
              Topic Generator →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}