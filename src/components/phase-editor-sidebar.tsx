'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Phase = 'conceptualize' | 'research' | 'write' | 'submit';

interface Tool {
  id: string;
  label: string;
  href: string;
}

interface PhaseEditorSidebarProps {
  phase: Phase;
}

const phaseSidebarContent = {
  conceptualize: {
    title: 'Phase 1: Conceptualize',
    tools: [
      { id: 'problem-id', label: 'Research Problem Identifier', href: '/research-problem-identifier' },
      { id: 'topic-ideas', label: 'Topic Ideator', href: '/topic-ideas' },
      { id: 'var-mapper', label: 'Variable Mapper', href: '/variable-mapping-tool' },
      { id: 'outline', label: 'Outline Generator', href: '/outline' },
    ],
    proTip: 'Use the Research Problem Identifier to clearly define your research focus. The Topic Ideator helps you brainstorm and refine your research questions.',
    stats: [
      { label: 'Estimated Duration', value: '2-4 weeks' },
      { label: 'Key Deliverable', value: 'Research Question' },
      { label: 'Tools Available', value: '9' },
    ],
  },
  research: {
    title: 'Phase 2: Research',
    tools: [
      { id: 'lit-matrix', label: 'Literature Matrix', href: '/literature-review' },
      { id: 'article-analyzer', label: 'Article Analyzer', href: '/research-article-analyzer' },
      { id: 'annotation', label: 'Annotation Tool', href: '/literature-review' },
      { id: 'synthesis', label: 'Synthesis Tool', href: '/literature-review' },
    ],
    proTip: 'Use the Literature Matrix to organize your sources systematically. The Annotation Tool enables collaboration with your advisor on key passages.',
    stats: [
      { label: 'Estimated Duration', value: '4-8 weeks' },
      { label: 'Recommended Sources', value: '15-30' },
      { label: 'Tools Available', value: '12' },
    ],
  },
  write: {
    title: 'Phase 3: Write & Refine',
    tools: [
      { id: 'ai-write', label: 'AI Writing Suite', href: '/outline' },
      { id: 'grammar', label: 'Grammar Checker', href: '/grammar-check' },
      { id: 'paraphrase', label: 'Paraphraser', href: '/paraphraser' },
      { id: 'citations', label: 'Citation Generator', href: '/citations' },
    ],
    proTip: 'The AI Writing Suite helps you draft and refine content. Use the Grammar Checker for polishing and the Citation Generator for proper formatting.',
    stats: [
      { label: 'Estimated Duration', value: '6-12 weeks' },
      { label: 'Total Thesis Length', value: '60-100+ pages' },
      { label: 'Tools Available', value: '9' },
    ],
  },
  submit: {
    title: 'Phase 4: Submit & Present',
    tools: [
      { id: 'format-check', label: 'Format Checker', href: '/university-format-checker' },
      { id: 'ppt-coach', label: 'Defense PPT Coach', href: '/defense-ppt-coach' },
      { id: 'qa-sim', label: 'Q&A Simulator', href: '/qa-simulator' },
      { id: 'doc-analyzer', label: 'Document Analyzer', href: '/document-analyzer' },
    ],
    proTip: 'Use the Format Checker to ensure compliance with your university guidelines. The Defense PPT Coach and Q&A Simulator prepare you for your defense.',
    stats: [
      { label: 'Estimated Duration', value: '2-4 weeks' },
      { label: 'Key Deliverables', value: 'Slides & Presentation' },
      { label: 'Tools Available', value: '16' },
    ],
  },
};

export function PhaseEditorSidebar({ phase }: PhaseEditorSidebarProps) {
  const content = phaseSidebarContent[phase];

  return (
    <div className="sticky top-24 space-y-4">
      {/* Phase Tools */}
      <div className="bg-secondary rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">{content.title} Tools</h3>
        <div className="space-y-3">
          {content.tools.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary justify-start">
                {tool.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-tertiary rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-2">Pro Tip</h3>
        <p className="text-muted-foreground text-sm">
          {content.proTip}
        </p>
      </div>

      {/* Phase Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-3">Phase Stats</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          {content.stats.map((stat) => (
            <div key={stat.label} className="flex justify-between">
              <span>{stat.label}:</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
