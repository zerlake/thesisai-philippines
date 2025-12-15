'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit3, Shuffle, RotateCcw, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

export default function ParaphraserDoc() {
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
          <h1 className="text-4xl font-bold text-white">Paraphraser & Content Rewriter</h1>
          <p className="mt-4 text-lg text-slate-300">
            Advanced tool for rewriting content while preserving meaning and enhancing academic integrity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Paraphraser</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Paraphraser is a sophisticated AI-powered tool designed to help you rewrite 
              content while preserving the original meaning and improving academic clarity. The tool 
              goes beyond simple synonym replacement to provide contextually appropriate rewording 
              that enhances readability and maintains scholarly standards.
            </p>
            <p className="text-slate-300 mb-4">
              This tool is particularly valuable for improving academic writing quality, enhancing 
              clarity, and ensuring that your ideas are expressed in an original and professional manner.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Features of Paraphraser</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Edit3 className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Advanced Paraphrasing</h3>
                    <p className="text-slate-300">
                      Understands context and meaning to provide accurate rewording that preserves 
                      the original message while using different sentence structures, synonyms, and expressions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shuffle className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Multiple Rewriting Styles</h3>
                    <p className="text-slate-300">
                      Offers different rewriting styles to suit your needs: Standard (maintains meaning), 
                      Academic (enhances scholarly tone), and Creative (improves flow and readability).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <RotateCcw className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Sentence Restructuring</h3>
                    <p className="text-slate-300">
                      Reorganizes sentence structures while maintaining logical flow, making complex ideas 
                      more accessible without losing technical accuracy.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Academic Integrity Focused</h3>
                    <p className="text-slate-300">
                      Designed to improve your writing rather than substitute for your understanding. 
                      Ensures that paraphrases respect intellectual property while enhancing clarity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use Paraphraser</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Accessing the Tool</h3>
            <p className="text-slate-300 mb-4">
              You can access the Paraphraser in several ways through the ThesisAI platform:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-6">
              <li>From your dashboard: Navigate to &quot;AI Tools&quot; then &quot;Paraphraser&quot;</li>
              <li>Within the editor: Select text and use the right-click menu to choose &quot;Paraphrase&quot;</li>
              <li>Via the floating AI assistant: Click the assistant and select &quot;Rewrite Text&quot;</li>
              <li>Through the toolbar: Use the &quot;AI&quot; menu when editing documents</li>
            </ol>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Step-by-Step Process</h3>
            <ol className="list-decimal pl-6 space-y-6 text-slate-300">
              <li>
                <strong>Prepare Your Content:</strong>
                <p className="ml-6 mt-2">
                  Decide whether you want to paraphrase selected text, an entire paragraph, or a larger section. 
                  Copy the text if working outside the editor, or select the text if working within the 
                  ThesisAI editor.
                </p>
              </li>
              <li>
                <strong>Open the Tool:</strong>
                <p className="ml-6 mt-2">
                  Launch the paraphraser through any of the access methods listed above. 
                  The tool interface will appear showing an input area for your text.
                </p>
              </li>
              <li>
                <strong>Enter Your Text:</strong>
                <p className="ml-6 mt-2">
                  Paste your content into the input box or type your text directly. The tool accepts 
                  up to 5000 characters per operation.
                </p>
              </li>
              <li>
                <strong>Configure Settings:</strong>
                <p className="ml-6 mt-2">
                  Choose your preferred rewriting style:
                </p>
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li><strong>Standard:</strong> Preserves meaning with moderate rewording</li>
                  <li><strong>Academic:</strong> Enhances scholarly tone and formality</li>
                  <li><strong>Creative:</strong> Improves flow and readability</li>
                </ul>
              </li>
              <li>
                <strong>Generate Rewrites:</strong>
                <p className="ml-6 mt-2">
                  Click the &quot;Rewrite&quot; button to generate paraphrased text. 
                  The tool will process your content and provide multiple options.
                </p>
              </li>
              <li>
                <strong>Review and Apply:</strong>
                <p className="ml-6 mt-2">
                  Compare the original and rewritten versions. You can accept the suggested revision, 
                  request additional variations, or modify suggestions to better fit your needs.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Paraphrasing Styles Explained</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Standard Style</h3>
                <p className="text-slate-300 mb-3">
                  <strong>Best for:</strong> Maintaining original meaning while improving clarity
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Moderate word replacement with synonymous terms</li>
                  <li>Maintains original sentence structure where appropriate</li>
                  <li>Focuses on clarity and readability without significant stylistic changes</li>
                  <li>Ideal for rewording quoted material or cited concepts</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Academic Style</h3>
                <p className="text-slate-300 mb-3">
                  <strong>Best for:</strong> Enhancing scholarly tone and formality
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Increases formality using more sophisticated vocabulary</li>
                  <li>Improves academic clarity and precision</li>
                  <li>Ensures compliance with academic writing standards</li>
                  <li>Ideal for thesis sections requiring elevated academic language</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Creative Style</h3>
                <p className="text-slate-300 mb-3">
                  <strong>Best for:</strong> Improving flow and engagement
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Restructures sentences for better flow and readability</li>
                  <li>May alter the order of ideas while preserving logical connections</li>
                  <li>Focuses on making complex concepts more accessible</li>
                  <li>Ideal for improving readability of dense academic passages</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Interpreting Results</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Result Quality Indicators</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">High Quality</p>
                      <p className="text-sm text-slate-300">Accurate meaning preservation with significant improvement</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">Moderate Quality</p>
                      <p className="text-sm text-slate-300">Meaning preserved with some minor issues</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-1"></span>
                    <div>
                      <p className="font-medium text-white">Low Quality</p>
                      <p className="text-sm text-slate-300">Meaning may not be adequately preserved</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Revision Information</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><strong>Original Text:</strong> The text before paraphrasing</li>
                  <li><strong>Paraphrased Text:</strong> Rewritten version based on selected style</li>
                  <li><strong>Similarity Score:</strong> Percentage indicating how similar to original</li>
                  <li><strong>Clarity Improvement:</strong> Estimated enhancement in readability</li>
                  <li><strong>Academic Tone:</strong> Assessment of scholarly appropriateness</li>
                  <li><strong>Alternative Options:</strong> Additional paraphrasing suggestions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Paraphrasing</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Effective Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Always review AI-generated content for accuracy and meaning preservation</li>
                  <li>Use paraphrasing to enhance your own writing, not replace your original thinking</li>
                  <li>Verify technical terms remain accurate after paraphrasing</li>
                  <li>Ensure citations are still appropriate after content changes</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Common Mistakes</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Blindly accepting all suggestions without review</li>
                  <li>Using paraphrased content without verifying accuracy</li>
                  <li>Paraphrasing to avoid citing sources (this violates academic integrity)</li>
                  <li>Changing technical terminology incorrectly</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Academic Integrity</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use paraphrasing to express your understanding of concepts</li>
                  <li>Continue to cite sources appropriately after paraphrasing</li>
                  <li>Don't use paraphrasing as a shortcut to avoid engaging with material</li>
                  <li>Ensure your voice remains in the final text</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Quality Assurance</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Compare original and paraphrased versions for meaning consistency</li>
                  <li>Check that technical accuracy is maintained</li>
                  <li>Ensure the text flows naturally in context</li>
                  <li>Verify citations and references remain appropriate</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Context-Aware Paraphrasing</h2>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Academic Context Recognition</h3>
            <p className="text-slate-300 mb-4">
              The Paraphraser understands academic writing context and adjusts accordingly:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-cyan-400 mb-2">Field-Specific Terminology</h4>
                <p className="text-slate-300 text-sm">
                  Recognizes and preserves technical terms and specialized vocabulary that shouldn't be paraphrased
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-blue-400 mb-2">Citation Awareness</h4>
                <p className="text-slate-300 text-sm">
                  Maintains proper attribution and citation context during rewriting
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-purple-400 mb-2">Formal Tone Maintenance</h4>
                <p className="text-slate-300 text-sm">
                  Preserves academic formality while improving clarity and readability
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-green-400 mb-2">Logical Flow Preservation</h4>
                <p className="text-slate-300 text-sm">
                  Maintains logical connections and argument structure during rewording
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3">Quality Concerns</h3>
            <p className="text-slate-300 mb-4">
              If the paraphrased text doesn't meet your expectations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li><strong>Technical Content:</strong> Select a different style or manually check technical accuracy</li>
              <li><strong>Context Loss:</strong> Request additional options or use shorter text segments</li>
              <li><strong>Clarity Issues:</strong> Try the Creative style for better flow</li>
              <li><strong>Formality Level:</strong> Switch to Academic style for scholarly tone</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Optimization Strategies</h3>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Break complex paragraphs into smaller sections for better processing</li>
              <li>Experiment with different styles to find the most appropriate for your content</li>
              <li>Manually adjust technical or specialized terms after paraphrasing</li>
              <li>Request multiple variations and combine the best elements</li>
              <li>Use the tool iteratively for fine-tuning</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Features</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Batch Processing</h3>
            <p className="text-slate-300 mb-4">
              For larger amounts of text, the Paraphraser offers batch processing:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-300">
              <li>Upload entire documents for section-by-section processing</li>
              <li>Configure processing options at the document level</li>
              <li>Preserve document structure and formatting</li>
              <li>Review and approve changes in context</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Comparison Tool</h3>
            <p className="text-slate-300 mb-4">
              Compare multiple paraphrasing options side-by-side:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ul className="list-disc pl-6 text-slate-300">
                <li>View 2-3 different paraphrasing styles simultaneously</li>
                <li>Evaluate each version for meaning preservation</li>
                <li>See which option best serves your writing goals</li>
                <li>Accept or modify individual suggestions</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/research-gap-identifier" className="text-blue-400 hover:underline">
              ← Research Gap Identifier
            </Link>
          </div>
          <div>
            <Link href="/documentation/essay-editor" className="text-blue-400 hover:underline">
              Essay Editor →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}