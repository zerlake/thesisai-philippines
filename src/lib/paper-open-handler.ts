/**
 * Utility function to open/view papers with fallback options
 * Handles multiple paper sources: PDF URLs, arXiv, DOI, generic URLs
 */

import { Paper } from '@/types/paper';

/**
 * Opens a paper in a new tab/window with intelligent fallback
 * Priority order:
 * 1. metadata.pdfUrl (direct PDF link)
 * 2. arxiv PDF (constructed from arxivId)
 * 3. DOI resolver (doi.org)
 * 4. metadata.url (generic URL)
 * 5. Fallback: Search Google Scholar for the paper
 * 
 * @param paper - The paper to open
 * @param toastError - Optional callback to show error message
 */
export function openPaper(paper: Paper, toastError?: (message: string) => void): void {
  // Try pdfUrl first
  if (paper.metadata.pdfUrl) {
    window.open(paper.metadata.pdfUrl, '_blank');
    return;
  }

  // Try arXiv PDF
  if (paper.sourceIds.arxivId) {
    // Extract ID from full URL if needed (e.g., "http://arxiv.org/abs/2304.02623v1" -> "2304.02623v1")
    let arxivId = paper.sourceIds.arxivId;
    const match = arxivId.match(/(\d+\.\d+(?:v\d+)?)/);
    if (match) {
      arxivId = match[1];
    }
    const arxivPdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    window.open(arxivPdfUrl, '_blank');
    return;
  }

  // Try DOI resolver
  if (paper.sourceIds.doi) {
    const doiUrl = `https://doi.org/${paper.sourceIds.doi}`;
    window.open(doiUrl, '_blank');
    return;
  }

  // Try generic URL
  if (paper.metadata.url) {
    window.open(paper.metadata.url, '_blank');
    return;
  }

  // Fallback: Search Google Scholar
  const searchQuery = encodeURIComponent(
    Array.isArray(paper.title) ? paper.title[0] : paper.title
  );
  const scholarUrl = `https://scholar.google.com/scholar?q=${searchQuery}`;
  window.open(scholarUrl, '_blank');

  if (toastError) {
    toastError(
      'No direct link available. Opening Google Scholar search instead.'
    );
  }
}
