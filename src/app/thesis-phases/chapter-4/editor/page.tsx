'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { NovelEditorEnhanced } from '@/components/novel-editor-enhanced';
import { PhaseEditorSidebar } from '@/components/phase-editor-sidebar';

export default function Chapter4EditorPage() {
  const documentId = 'chapter-4-main';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/thesis-phases/chapter-4" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapter 4
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">Chapter 4 - Presentation, Analysis and Interpretation of Data</h1>
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
              <BarChart3 className="h-4 w-4" />
              Text Editor
            </div>
            <p className="text-muted-foreground text-sm">
              Present your research findings with appropriate statistical treatments and meaningful interpretations. Document your data analysis and results.
            </p>
          </div>
          <NovelEditorEnhanced documentId={documentId} phase="write" />
        </div>

        {/* Sidebar Info - Hidden on mobile, shown on desktop */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 4 Writing Guides</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Presentation of Data
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Organize your findings in a clear, logical sequence. Follow the same order as your research questions or hypotheses. Use tables, figures, and charts to present data effectively. Include actual data values alongside visual representations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Statistical Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Apply the statistical methods you outlined in Chapter 3. Present results of hypothesis tests, correlation analyses, regression analyses, or other statistical procedures as appropriate. Include p-values, confidence intervals, and effect sizes.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Interpretation of Results
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Explain what your findings mean. Relate results back to your research questions and hypotheses. Discuss whether results support or contradict your expectations. Consider alternative explanations for unexpected findings.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Connection to Literature
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Compare your findings with results from other studies reviewed in Chapter 2. Discuss how your results align with or differ from existing literature. Explain implications of any discrepancies.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Tables and Figures
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Use clear, appropriately labeled tables and figures. Each should have a caption and be referenced in text. Ensure data presentation is accurate and easy to understand. Follow your institution's formatting guidelines.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Limitations Discussion
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Acknowledge limitations in your data collection, analysis, or interpretation. Discuss how limitations might affect the generalizability of findings. Show awareness of potential sources of error or bias.
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
