'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ThesisEditor } from '@/components/thesis-editor';
import { PhaseEditorSidebar } from '@/components/phase-editor-sidebar';

export default function Chapter1EditorPage() {
  const documentId = 'chapter-1-main';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/thesis-phases/chapter-1" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapter 1
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">Chapter 1 - The Problem and Its Background</h1>
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
              <BookOpen className="h-4 w-4" />
              Text Editor
            </div>
            <p className="text-muted-foreground text-sm">
              Define your research problem, establish background context, and develop your theoretical/conceptual framework. This chapter sets the foundation for your entire thesis.
            </p>
          </div>
          <ThesisEditor documentId={documentId} phase="conceptualize" />
        </div>

        {/* Sidebar Info - Hidden on mobile, shown on desktop */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 1 Writing Guides</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Introduction & Background
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Begin with a clear introduction to your research topic. Provide context and background information that helps readers understand why your research is important. Establish the general problem area before narrowing to your specific research focus.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Problem Statement
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Clearly define the specific problem your research addresses. Make it concrete, measurable, and researchable. Explain why this problem matters and what makes it worth investigating. Distinguish between the general problem area and your specific research problem.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Theoretical/Conceptual Framework
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Identify and discuss the theories or concepts that underpin your study. Explain how these theories relate to your research problem. Often includes a conceptual paradigm diagram showing relationships between key concepts and variables.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Research Questions & Objectives
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    State your research questions or objectives clearly. Make them specific, answerable, and aligned with your problem statement. If applicable, include research hypotheses. Ensure questions are measurable and testable.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Significance of the Study
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Explain the importance and implications of your research. Discuss how your findings will benefit various stakeholders: academic community, practitioners, policymakers, and society. Address theoretical and practical contributions.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Scope & Delimitation
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Define the boundaries of your study. Specify the population, geographic area, time period, and variables included. Explain what your study will and will not cover. Address limitations that affect the generalizability of findings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PhaseEditorSidebar phase="conceptualize" />
          </div>
        </div>
      </div>
    </div>
  );
}
