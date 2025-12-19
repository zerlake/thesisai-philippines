'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ThesisEditor } from '@/components/thesis-editor';
import { PhaseEditorSidebar } from '@/components/phase-editor-sidebar';

export default function Chapter2EditorPage() {
  const documentId = 'chapter-2-main';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/thesis-phases/chapter-2" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapter 2
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">Chapter 2 - Review of Related Literature</h1>
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
              Review, synthesize, and critically analyze literature relevant to your study. Document foreign and local literature, studies, and synthesis.
            </p>
          </div>
          <ThesisEditor documentId={documentId} phase="research" />
        </div>

        {/* Sidebar Info - Hidden on mobile, shown on desktop */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 2 Writing Guides</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Foreign Literature
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Review scholarly literature from international sources. Include peer-reviewed journals, books, and credible publications from around the world. Focus on seminal works and current research related to your topic.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Local Literature
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Include locally-published research, dissertations, and studies relevant to your context. Highlight how your research connects to or builds upon local scholarship and understanding of the topic.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Critical Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Don't just summarize sources - critically evaluate them. Discuss strengths and weaknesses, methodologies, findings, and relevance to your research. Identify gaps and inconsistencies in the literature.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Thematic Organization
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Organize your review thematically rather than chronologically. Group sources by topic, concept, or methodology to show relationships and build a coherent argument throughout the chapter.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Synthesis & Integration
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Synthesize the literature to show how different sources relate to each other and your research. Build a logical argument that demonstrates how the literature supports your research questions and methodology.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Research Gaps
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Identify and articulate gaps in the existing literature. Explain what remains unanswered or understudied. Show how your research addresses these gaps and contributes to the field.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PhaseEditorSidebar phase="research" />
          </div>
        </div>
      </div>
    </div>
  );
}
