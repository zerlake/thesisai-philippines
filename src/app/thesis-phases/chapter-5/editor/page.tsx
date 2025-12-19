'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { ThesisEditor } from '@/components/thesis-editor';
import { PhaseEditorSidebar } from '@/components/phase-editor-sidebar';

export default function Chapter5EditorPage() {
  const documentId = 'chapter-5-main';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/thesis-phases/chapter-5" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapter 5
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">Chapter 5 - Summary, Conclusions & Recommendations</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Editor Section */}
        <div className="bg-card rounded-lg border border-border shadow-md p-8 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <FileText className="h-4 w-4" />
              Text Editor
            </div>
            <p className="text-muted-foreground text-sm">
              Synthesize your research findings, draw meaningful conclusions, and provide recommendations for future research and practice.
            </p>
          </div>
          <ThesisEditor documentId={documentId} phase="write" />
        </div>

        {/* Sidebar Info - Hidden on mobile, shown on desktop */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 5 Writing Guides</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Summary of Findings
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Provide a concise restatement of your key findings. Correspond the summary to each research question or hypothesis. Avoid introducing new data or analyses. Keep summaries brief but comprehensive, highlighting the most important results.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Conclusions
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Draw logical conclusions directly from your findings. Address your research questions explicitly. Explain what the results mean in practical or theoretical terms. Relate conclusions back to your literature review and theoretical framework.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Implications
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Discuss the theoretical implications of your findings for the field of study. Explain the practical implications for practitioners, policymakers, and organizations. Address how your research advances knowledge in your field.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Recommendations for Practice
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Provide actionable recommendations based on your findings. Make recommendations specific and feasible. Address different stakeholders (practitioners, policymakers, organizations). Justify recommendations with evidence from your research.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Recommendations for Future Research
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Identify gaps and limitations that suggest areas for future investigation. Propose specific research questions or topics for future studies. Explain how recommended future research could extend or clarify your findings.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Limitations Revisited
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Acknowledge limitations of your study and their impact on findings and conclusions. Discuss how limitations might affect generalizability. Show awareness of how addressing these limitations in future research could strengthen findings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PhaseEditorSidebar phase="write" />
          </div>
        </div>
      </div>
    </div>
  );
}
