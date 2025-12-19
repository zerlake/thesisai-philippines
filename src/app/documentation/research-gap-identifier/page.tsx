'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Search, BookOpen, FileText, Users, TrendingUp } from 'lucide-react';

export default function ResearchGapIdentifierDoc() {
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
          <h1 className="text-4xl font-bold text-white">Research Gap Identifier</h1>
          <p className="mt-4 text-lg text-slate-300">
            AI-powered tool to identify unexplored research areas and opportunities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Research Gap Identifier</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI's Research Gap Identifier is a sophisticated AI tool designed to help researchers identify 
              unexplored areas, understudied populations, unanswered questions, and opportunities for new 
              contributions within the existing literature. This tool analyzes thousands of research papers, 
              identifies patterns, and highlights areas that warrant further investigation.
            </p>
            <p className="text-slate-300 mb-4">
              The Research Gap Identifier is particularly valuable for Filipino researchers who need to ensure 
              their work contributes meaningfully to local knowledge, addresses national priorities, and fills 
              gaps in the Philippines-specific research landscape.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Features of Research Gap Identifier</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Search className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Literature Analysis</h3>
                    <p className="text-slate-300">
                      Scans and analyzes large volumes of literature to identify research patterns, 
                      methodologies, and thematic trends. Compares local research with global studies 
                      to highlight unique Filipino perspectives or underrepresented topics.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Gap Detection</h3>
                    <p className="text-slate-300">
                      Identifies areas where research is sparse or nonexistent, highlighting opportunities 
                      for potentially impactful research. Flags underexplored connections between different 
                      research domains that might reveal new angles of investigation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Trend Forecasting</h3>
                    <p className="text-slate-300">
                      Predicts emerging research areas based on current trajectories and identifies 
                      opportunities for pioneering work in developing fields. Highlights research directions 
                      that align with national development goals.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Opportunity Evaluation</h3>
                    <p className="text-slate-300">
                      Assesses the potential impact, feasibility, and innovation level of identified 
                      research gaps. Provides insights into potential funding opportunities and 
                      publication venues for the suggested research areas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use Research Gap Identifier</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Accessing the Tool</h3>
            <p className="text-slate-300 mb-4">
              You can access the Research Gap Identifier through several pathways in the ThesisAI platform:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300 mb-6">
              <li>From your dashboard: Click on &quot;AI Tools&quot;, then &quot;Research Gap Identifier&quot;</li>
              <li>During document creation: Select &quot;Find Research Gaps&quot; when starting a new project</li>
              <li>Via quick access: Use the floating AI assistant and select &quot;Identify Gaps&quot;</li>
              <li>Integration with literature review: Access directly from the literature analysis tools</li>
            </ol>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Step-by-Step Process</h3>
            <ol className="list-decimal pl-6 space-y-6 text-slate-300">
              <li>
                <strong>Define Your Research Domain:</strong>
                <p className="ml-6 mt-2">
                  Specify your broad research area and any sub-fields of interest. Include information 
                  about your geographic focus (Philippines-specific, Southeast Asian, or global).
                </p>
              </li>
              <li>
                <strong>Upload Relevant Papers:</strong>
                <p className="ml-6 mt-2">
                  Upload research papers, articles, or abstracts relevant to your field. The system 
                  will analyze these materials to identify current research directions and gaps.
                </p>
              </li>
              <li>
                <strong>Set Analysis Parameters:</strong>
                <p className="ml-6 mt-2">
                  Configure the analysis criteria:
                </p>
                <ul className="list-disc pl-8 mt-2 space-y-1">
                  <li>Time range of publications to analyze</li>
                  <li>Geographic focus for comparison</li>
                  <li>Methodological approaches to consider</li>
                  <li>Specific keywords or themes to prioritize</li>
                </ul>
              </li>
              <li>
                <strong>Analyze Gaps:</strong>
                <p className="ml-6 mt-2">
                  Click &quot;Analyze&quot; to initiate the gap identification process. The AI will 
                  scan the uploaded materials and related literature to identify potential research opportunities.
                </p>
              </li>
              <li>
                <strong>Review Findings:</strong>
                <p className="ml-6 mt-2">
                  Examine the identified gaps with detailed explanations and supporting evidence. 
                  Each gap comes with potential research questions and methodological suggestions.
                </p>
              </li>
              <li>
                <strong>Refine and Export:</strong>
                <p className="ml-6 mt-2">
                  Refine the results by selecting the most promising gaps, export the findings, 
                  and integrate them into your research proposal or project plan.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Input Methods</h2>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">PDF Upload</h3>
            <p className="text-slate-300 mb-4">
              Upload academic papers in PDF format for analysis:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Drag and drop PDF files directly into the upload box</li>
              <li>Select papers from your document library</li>
              <li>Upload multiple papers simultaneously</li>
              <li>Processing occurs locally - no content is stored permanently</li>
              <li>Supports various PDF formats including scanned documents with OCR</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Text Input</h3>
            <p className="text-slate-300 mb-4">
              Paste abstracts, research statements, or bibliographies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Copy and paste abstracts or research summaries</li>
              <li>Add your own research questions or objectives</li>
              <li>Include relevant keywords or concepts</li>
              <li>Combine multiple sources into one input field</li>
              <li>Use the reference manager integration for direct input</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Types of Research Gaps Identified</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Temporal Gaps</h3>
                <p className="text-slate-300 mb-3">
                  Areas where research is outdated or has not kept pace with technological or social developments.
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Topics that haven't been studied recently</li>
                  <li>Areas where new technology hasn't been applied to existing problems</li>
                  <li>Research that doesn't reflect recent societal changes</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Geographic Gaps</h3>
                <p className="text-slate-300 mb-3">
                  Regions or populations that are understudied or underrepresented in the literature.
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Philippines-specific research that mirrors global studies</li>
                  <li>Studies focusing on local communities or ecosystems</li>
                  <li>Research considering local economic, political, or social factors</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Methodological Gaps</h3>
                <p className="text-slate-300 mb-3">
                  Opportunities to apply different research methods to existing problems or vice versa.
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Qualitative approaches for predominantly quantitative topics</li>
                  <li>Quantitative validation for qualitative findings</li>
                  <li>Interdisciplinary methodologies combining different fields</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Theoretical Gaps</h3>
                <p className="text-slate-300 mb-3">
                  Unexplored connections between theories, applications of theories to new contexts, or theoretical frameworks that haven't been tested in specific fields.
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Applying Western theories to Filipino contexts</li>
                  <li>Testing theoretical frameworks in new cultural settings</li>
                  <li>Combining theories from different disciplines</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Interpreting Analysis Results</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Gap Severity Classification</h3>
                <ul className="space-y-4">
                  <li>
                    <p className="font-medium text-white">High Impact Opportunity</p>
                    <p className="text-sm text-slate-300">Addresses significant local needs with potential for major contribution</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Emerging Area</p>
                    <p className="text-sm text-slate-300">Growing field with increasing relevance and funding opportunities</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Neglected Topic</p>
                    <p className="text-sm text-slate-300">Important but under-researched area requiring attention</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Bridging Potential</p>
                    <p className="text-sm text-slate-300">Connects different fields with potential for interdisciplinary impact</p>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Recommendation Components</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><strong>Gap Description:</strong> Detailed explanation of the underexplored area</li>
                  <li><strong>Research Questions:</strong> Suggested questions to investigate the gap</li>
                  <li><strong>Methodology:</strong> Recommended approaches for research</li>
                  <li><strong>Expected Contribution:</strong> Potential impact of addressing the gap</li>
                  <li><strong>Resource Needs:</strong> Estimated requirements for investigation</li>
                  <li><strong>Publication Potential:</strong> Likelihood of acceptance in journals</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Gap Analysis</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Preparation Strategies</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Upload a diverse set of papers covering different aspects of your field</li>
                  <li>Include both foundational and recent studies</li>
                  <li>Add papers addressing related but different research questions</li>
                  <li>Consider including papers outside your primary field for interdisciplinary insights</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Common Challenges</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Overly broad research domains leading to vague results</li>
                  <li>Insufficient diversity in input materials</li>
                  <li>Not specifying geographic or cultural focus</li>
                  <li>Expecting immediate breakthrough discoveries</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Evaluation Approach</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Assess feasibility alongside opportunity significance</li>
                  <li>Consider alignment with national development priorities</li>
                  <li>Evaluate resource requirements realistically</li>
                  <li>Validate high-priority gaps with field experts</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Integration Tips</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Integrate gap findings with your research objectives</li>
                  <li>Draft preliminary research questions based on identified gaps</li>
                  <li>Align gap opportunities with faculty expertise</li>
                  <li>Connect findings to national research priorities</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Trend Analysis</h3>
            <p className="text-slate-300 mb-4">
              Analyze how research focus has changed over time in your field to predict future directions:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-300">
              <li>Identify declining research areas that might represent opportunities</li>
              <li>Spot emerging trends that may become mainstream eventually</li>
              <li>Recognize cyclical patterns in research focus</li>
              <li>Anticipate technology-driven research shifts</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Collaboration Integration</h3>
            <p className="text-slate-300 mb-4">
              Share gap analysis results with advisors, critics, and research partners:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ul className="list-disc pl-6 text-slate-300">
                <li>Export gap reports in various formats (PDF, Word, plain text)</li>
                <li>Directly share findings with collaborators through the platform</li>
                <li>Generate summary presentations for advisory committees</li>
                <li>Create visual representations of identified gaps</li>
                <li>Link gap recommendations to specific university research priorities</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3">Insufficient Results</h3>
            <p className="text-slate-300 mb-4">
              If the tool doesn't identify sufficient gaps, try these approaches:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li>Upload more diverse materials covering different aspects of your field</li>
              <li>Include papers from various publication years to see temporal changes</li>
              <li>Broaden your search terms or research domain temporarily</li>
              <li>Include more foundational papers to establish baseline</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Optimization Tips</h3>
            <p className="text-slate-300 mb-4">
              To get the best results from the Research Gap Identifier:
            </p>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Upload at least 10-15 papers for meaningful analysis</li>
              <li>Include both seminal works and recent studies in your field</li>
              <li>Specify your geographic focus (especially for Philippines-specific research)</li>
              <li>Include research from related fields for interdisciplinary insight</li>
              <li>Iterate the analysis after reviewing initial results</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/topic-generator" className="text-blue-400 hover:underline">
              ← Topic Generator
            </Link>
          </div>
          <div>
            <Link href="/documentation/paraphraser" className="text-blue-400 hover:underline">
              Paraphraser →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}