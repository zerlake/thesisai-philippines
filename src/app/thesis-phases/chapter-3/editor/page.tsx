'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { NovelEditorEnhanced } from '@/components/novel-editor-enhanced';
import { PhaseEditorSidebar } from '@/components/phase-editor-sidebar';

export default function Chapter3EditorPage() {
  const documentId = 'chapter-3-main';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/thesis-phases/chapter-3" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapter 3
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">Chapter 3 - Research Methodology</h1>
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
              <Shield className="h-4 w-4" />
              Text Editor
            </div>
            <p className="text-muted-foreground text-sm">
              Design and document your research methodology with confidence. Detail your approach, instrumentation, and statistical methods.
            </p>
          </div>
          <NovelEditorEnhanced documentId={documentId} phase="write" />
        </div>

        {/* Sidebar Info - Hidden on mobile, shown on desktop */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 3 Writing Guides</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Research Design Selection
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Clearly state your research design (quantitative, qualitative, or mixed-methods). Justify why this design is appropriate for your research questions. Explain how your design will help you achieve your research objectives. Specify variables you'll study and their relationships.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Population & Sampling
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Define your target population clearly with specifics. Explain your sampling method (random, purposive, stratified, etc.) and justify your sample size. Discuss inclusion and exclusion criteria. Address potential sampling bias and how you'll mitigate it. Include estimated sample characteristics.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Instruments & Data Collection
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Describe all instruments (surveys, interviews, observation guides, tests, etc.) used to collect data. Include instrument development or adaptation process. Discuss validity and reliability measures (Cronbach's alpha, inter-rater reliability, etc.). Explain your data collection procedures, timeline, and location.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Data Analysis Procedures
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Specify the statistical methods or qualitative analysis approaches you'll use (t-tests, ANOVA, regression, thematic analysis, content analysis, etc.). Explain how each method aligns with your research questions. Describe software or tools used for analysis. Address handling of missing data, outliers, and data quality checks.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Validity & Reliability
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Address internal validity (experimental control, confounding variables). Discuss external validity and generalizability limitations. For qualitative research, address credibility, dependability, confirmability, and transferability. Explain measures taken to ensure trustworthiness of findings.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    Ethical Considerations
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Address informed consent procedures and participant recruitment. Discuss confidentiality and anonymity protections. Explain data security measures and storage. Address potential risks and how you'll minimize harm. Include IRB approval number or mention if exemption was obtained.
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
