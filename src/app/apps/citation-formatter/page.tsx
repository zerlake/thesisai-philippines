// src/app/apps/citation-formatter/page.tsx

import { Metadata } from 'next';
import CitationFormatter from '@/components/citation-formatter';

export const metadata: Metadata = {
  title: 'Citation Formatter | Thesis AI',
  description: 'Generate properly formatted citations in multiple academic styles (APA, MLA, Chicago, Harvard, IEEE)'
};

export default function CitationFormatterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <CitationFormatter />
      </div>
    </div>
  );
}