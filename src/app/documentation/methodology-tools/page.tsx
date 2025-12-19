'use client';

import Link from 'next/link';
import { FlaskConical, BarChart3, Calculator, Database } from 'lucide-react';

export default function MethodologyToolsDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">Professional</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Methodology & Data Tools</h1>
          <p className="mt-4 text-lg text-slate-300">
            Design studies with interactive advisors, run statistical tests, generate charts
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Our Methodology & Data Tools suite provides comprehensive support for designing
              your research methodology, analyzing data, and creating publication-ready
              visualizations. From study design to statistical analysis, these tools guide
              you through every step of your research methodology.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FlaskConical className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Research Design Advisor</h3>
                    <p className="text-slate-300">
                      Interactive guide to help you choose the right research design based on
                      your questions, variables, and constraints. Supports quantitative,
                      qualitative, and mixed methods approaches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Calculator className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Statistical Test Selector</h3>
                    <p className="text-slate-300">
                      Answer a few questions about your data and research objectives, and the
                      tool recommends appropriate statistical tests with explanations of when
                      and why to use each.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BarChart3 className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Visualization Generator</h3>
                    <p className="text-slate-300">
                      Create publication-quality charts and graphs. Import your data and choose
                      from various visualization types optimized for academic papers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Database className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Sample Size Calculator</h3>
                    <p className="text-slate-300">
                      Calculate required sample sizes based on effect size, power, and
                      significance level. Supports various research designs and sampling methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Research Design Types</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Quantitative Designs</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Experimental</li>
                  <li>Quasi-experimental</li>
                  <li>Correlational</li>
                  <li>Survey/Descriptive</li>
                  <li>Causal-comparative</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Qualitative Designs</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Phenomenological</li>
                  <li>Grounded Theory</li>
                  <li>Case Study</li>
                  <li>Ethnographic</li>
                  <li>Narrative</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Mixed Methods</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Convergent Parallel</li>
                  <li>Explanatory Sequential</li>
                  <li>Exploratory Sequential</li>
                  <li>Embedded</li>
                  <li>Transformative</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Other Approaches</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Action Research</li>
                  <li>Design-Based Research</li>
                  <li>Meta-Analysis</li>
                  <li>Systematic Review</li>
                  <li>Content Analysis</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Statistical Tests Available</h2>
            <p className="text-slate-300 mb-4">
              Our statistical analysis tools support a wide range of tests:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Parametric</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>T-tests (independent, paired)</li>
                  <li>ANOVA (one-way, factorial)</li>
                  <li>Pearson correlation</li>
                  <li>Linear regression</li>
                  <li>Multiple regression</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Non-parametric</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Mann-Whitney U</li>
                  <li>Wilcoxon signed-rank</li>
                  <li>Kruskal-Wallis</li>
                  <li>Spearman correlation</li>
                  <li>Chi-square tests</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Professional</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Factor analysis</li>
                  <li>Structural equation modeling</li>
                  <li>Logistic regression</li>
                  <li>MANOVA/MANCOVA</li>
                  <li>Reliability analysis</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Design Your Study:</strong> Use the Research Design Advisor to
                select an appropriate methodology based on your research questions.
              </li>
              <li>
                <strong>Plan Data Collection:</strong> Get recommendations for instruments,
                sampling methods, and sample size requirements.
              </li>
              <li>
                <strong>Prepare for Analysis:</strong> The Statistical Test Selector helps
                you identify appropriate tests for your data.
              </li>
              <li>
                <strong>Analyze Data:</strong> Import your data and run statistical tests
                directly in the platform.
              </li>
              <li>
                <strong>Visualize Results:</strong> Generate charts and graphs suitable
                for your thesis or publication.
              </li>
            </ol>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/pdf-analysis" className="text-blue-400 hover:underline">
              ← PDF Analysis
            </Link>
          </div>
          <div>
            <Link href="/documentation/ai-writing-suite" className="text-blue-400 hover:underline">
              AI Writing Suite →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
