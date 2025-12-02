/**
 * Papers Search Page
 * Route: /papers
 */

import { FindPapersPage } from '@/components/paper-search/find-papers-page';

export const metadata = {
  title: 'Find Research Papers | ThesisAI',
  description: 'Search and discover academic papers across CrossRef, ArXiv, OpenAlex, and Semantic Scholar',
};

export default function PapersPage() {
  return <FindPapersPage />;
}
