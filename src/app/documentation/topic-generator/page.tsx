'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Lightbulb, BookOpen, Users, TrendingUp, FileText } from 'lucide-react';

export default function TopicGeneratorDoc() {
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
          <h1 className="text-4xl font-bold text-white">Topic Generator & Research Assistant</h1>
          <p className="mt-4 text-lg text-slate-300">
            AI-powered tool for generating research topics and identifying opportunities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Topic Generator</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Topic Generator is an AI-powered tool designed to assist researchers in developing 
              relevant and innovative research topics. It leverages machine learning algorithms to analyze 
              current research trends, identify gaps in existing literature, and suggest potential research 
              directions that are both academically viable and practically valuable.
            </p>
            <p className="text-slate-300 mb-4">
              This tool is particularly valuable for Filipino students and researchers who are looking for 
              research topics that address local problems or contribute to Philippines-specific knowledge domains.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Features of Topic Generator</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Research Gap Identification</h3>
                    <p className="text-slate-300">
                      Identifies areas in existing research that have not been thoroughly explored, helping you choose 
                      meaningful research topics that contribute new knowledge to your field.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Lightbulb className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Trend-Based Suggestions</h3>
                    <p className="text-slate-300">
                      Provides topic suggestions based on current research trends and emerging areas of study, 
                      ensuring your research remains relevant and timely.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Domain-Specific Recommendations</h3>
                    <p className="text-slate-300">
                      Generates tailored suggestions based on your academic field, research interest, and 
                      specific requirements of your program or university.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Feasibility Analysis</h3>
                    <p className="text-slate-300">
                      Evaluates the practicality of suggested topics, considering factors like available 
                      resources, scope, and potential for completion within standard academic timelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use Topic Generator</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Accessing the Tool</h3>
            <p className="text-slate-300 mb-4">
              You can access the Topic Generator through multiple pathways in the ThesisAI platform:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-6">
              <li>From your dashboard: Click on the &quot;AI Tools&quot; section, then select &quot;Topic Generator&quot;</li>
              <li>During new document setup: When creating a new research document, select &quot;Generate Topic&quot;</li>
              <li>Via quick access: Use the floating AI assistant button and select &quot;Topic Ideas&quot;</li>
            </ol>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Step-by-Step Process</h3>
            <ol className="list-decimal pl-6 space-y-6 text-slate-300">
              <li>
                <strong>Define Your Research Area:</strong>
                <p className="ml-6 mt-2">
                  Select your broad academic field (e.g., Computer Science, Psychology, Economics, etc.) and 
                  specify any particular aspects or subfields you're interested in.
                </p>
              </li>
              <li>
                <strong>Provide Context:</strong>
                <p className="ml-6 mt-2">
                  Optionally, provide additional context such as:
                </p>
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li>Your academic level (undergraduate, graduate, doctoral)</li>
                  <li>Specific regional focus (Philippines-specific, Southeast Asian, etc.)</li>
                  <li>Any particular methodologies you want to employ</li>
                  <li>Resources available for your research</li>
                  <li>Timeline constraints</li>
                </ul>
              </li>
              <li>
                <strong>Generate Topics:</strong>
                <p className="ml-6 mt-2">
                  Click the &quot;Generate Topics&quot; button to receive initial suggestions. 
                  The AI will analyze current literature and trends to provide relevant options.
                </p>
              </li>
              <li>
                <strong>Refine Suggestions:</strong>
                <p className="ml-6 mt-2">
                  Review the generated topics and provide feedback. You can ask for more options, 
                  narrow down focus areas, or request adjustments based on your preferences.
                </p>
              </li>
              <li>
                <strong>Evaluate Feasibility:</strong>
                <p className="ml-6 mt-2">
                  Use the built-in feasibility evaluator to assess each topic based on your 
                  resources, timeline, and expertise level.
                </p>
              </li>
              <li>
                <strong>Save or Export:</strong>
                <p className="ml-6 mt-2">
                  Save promising topics to your research ideas collection or export them for 
                  further discussion with your advisor.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Input Parameters for Better Results</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Essential Information</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Academic Field:</strong> Specific discipline or interdisciplinary area</li>
                  <li><strong>Research Level:</strong> Undergraduate, master's, or doctoral expectations</li>
                  <li><strong>Regional Focus:</strong> Local, national, or international perspective</li>
                  <li><strong>Methodology Preference:</strong> Quantitative, qualitative, or mixed methods</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Additional Context</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Special Interests:</strong> Specific problems, populations, or phenomena of interest</li>
                  <li><strong>Resource Availability:</strong> Access to participants, equipment, or special environments</li>
                  <li><strong>Time Constraints:</strong> Duration available for conducting the research</li>
                  <li><strong>Career Goals:</strong> How the research aligns with your professional aspirations</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Limitation Parameters</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Budget Constraints:</strong> Funding limitations affecting feasibility</li>
                  <li><strong>Location Constraints:</strong> Geographic limitations for data collection</li>
                  <li><strong>Language Skills:</strong> Limitations in languages affecting research sources</li>
                  <li><strong>Ethical Considerations:</strong> Special approvals needed or vulnerable populations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Interpreting Topic Suggestions</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Topic Evaluation Criteria</h3>
                <ul className="space-y-4">
                  <li>
                    <p className="font-medium text-white">Novelty Score</p>
                    <p className="text-sm text-slate-300">Indicates how original the research contribution might be</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Feasibility Index</p>
                    <p className="text-sm text-slate-300">Assesses practical aspects like timeline, resources, and complexity</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Relevance Factor</p>
                    <p className="text-sm text-slate-300">Measures alignment with current research trends</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Impact Potential</p>
                    <p className="text-sm text-slate-300">Estimates the potential scholarly or practical influence</p>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Suggestion Components</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><strong>Topic Title:</strong> Suggested name for the research</li>
                  <li><strong>Research Objective:</strong> Primary aim of the proposed study</li>
                  <li><strong>Justification:</strong> Rationale for the topic's importance</li>
                  <li><strong>Methodology Hints:</strong> Recommended approaches for investigation</li>
                  <li><strong>Expected Outcomes:</strong> Potential contributions to knowledge</li>
                  <li><strong>Resource Requirements:</strong> Estimated needs for completion</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Topic Selection</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Effective Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use the topic generator early in your research process</li>
                  <li>Generate multiple options to compare and contrast</li>
                  <li>Discuss suggestions with your academic advisor</li>
                  <li>Combine elements from different suggestions for hybrid topics</li>
                  <li>Refine topics iteratively based on feedback</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Common Mistakes</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Choosing overly broad topics that are difficult to complete</li>
                  <li>Selecting topics requiring resources you don't have</li>
                  <li>Ignoring the feasibility assessment provided by the AI</li>
                  <li>Not considering your own interest and long-term goals</li>
                  <li>Failing to validate topics with field experts</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Evaluation Strategy</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Score each topic on originality, feasibility, and relevance</li>
                  <li>Consider alignment with your career objectives</li>
                  <li>Assess compatibility with your university's focus areas</li>
                  <li>Check for potential publication opportunities</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Collaboration Tips</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Share generated topics with your advisor for feedback</li>
                  <li>Compare suggestions with similar research in your field</li>
                  <li>Validate topic relevance with practitioners</li>
                  <li>Seek input from subject matter experts</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Comparative Analysis</h3>
            <p className="text-slate-300 mb-4">
              The Topic Generator allows you to compare multiple suggested topics side by side, 
              evaluating them across several dimensions:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-300">
              <li>Research novelty and contribution</li>
              <li>Practical applicability</li>
              <li>Resource and time requirements</li>
              <li>Publication potential</li>
              <li>Alignment with career goals</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Iterative Refinement</h3>
            <p className="text-slate-300 mb-4">
              Use the iterative refinement feature to progressively narrow down and develop your 
              chosen topic:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ol className="list-decimal pl-6 space-y-3 text-slate-300">
                <li>Start with a broad topic suggestion</li>
                <li>Specify additional constraints or preferences</li>
                <li>Generate variations based on your inputs</li>
                <li>Repeat the process until you have a focused, feasible topic</li>
              </ol>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3">Unhelpful Suggestions</h3>
            <p className="text-slate-300 mb-4">
              If the topic suggestions seem too broad, too narrow, or not aligned with your needs:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Provide more specific context about your research interests</li>
              <li>Clarify your academic level and scope expectations</li>
              <li>Specify geographic or cultural focus areas</li>
              <li>Indicate particular methodologies you prefer</li>
              <li>Specify your available resources or limitations</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Optimization Tips</h3>
            <p className="text-slate-300 mb-4">
              For the best results from the Topic Generator:
            </p>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Be as specific as possible with your input parameters</li>
              <li>Include your university's research priorities in your input</li>
              <li>State your advisor's expertise area to get relevant suggestions</li>
              <li>Consider local or regional problems that need research attention</li>
              <li>Specify preferred data collection methods</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/grammar-checker" className="text-blue-400 hover:underline">
              ← Grammar Checker
            </Link>
          </div>
          <div>
            <Link href="/documentation/research-gap-identifier" className="text-blue-400 hover:underline">
              Research Gap Identifier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}