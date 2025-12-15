/**
 * Sci-Hub Integration Utility
 * Provides CORS-free PDF fetching from Sci-Hub mirrors using Puter.js
 */

// List of Sci-Hub mirrors (domain rotation for reliability)
const SCI_HUB_MIRRORS = [
  'https://sci-hub.se',
  'https://sci-hub.st',
  'https://sci-hub.ru',
  'https://sci-hub.scihubtw.tw',
];

export interface UnlockPDFResult {
  success: boolean;
  url?: string;
  error?: string;
  message: string;
  fallbackUrl?: string; // Manual access URL if automatic extraction fails
}

/**
 * Extract DOI from a string (handles various formats)
 */
export function extractDOI(text: any): string | null {
  // Handle non-string inputs
  if (!text) return null;
  if (typeof text !== 'string') {
    text = String(text);
  }

  // Match DOI format: 10.xxxx/xxxxx (stop before common punctuation)
  const doiMatch = text.match(/10\.\d{4,}\/[^\s\)\]\,\;]+/);
  return doiMatch ? doiMatch[0] : null;
}

/**
 * Attempt to unlock PDF from Sci-Hub
 * Uses server-side API to handle CORS issues
 */
export async function unlockPDFFromSciHub(doi: string): Promise<UnlockPDFResult> {
  if (!doi) {
    return {
      success: false,
      error: 'INVALID_DOI',
      message: 'Invalid or missing DOI',
    };
  }

  try {
    // Call server API which handles domain rotation and CORS
    const response = await fetch('/api/papers/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doi }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      return {
        success: false,
        error: error.error || 'UNLOCK_FAILED',
        message: error.message || 'Failed to unlock PDF',
      };
    }

    const data = await response.json();

    if (data.success && data.url) {
      // Return the PDF URL directly
      return {
        success: true,
        url: data.url,
        message: data.message || 'Successfully unlocked PDF',
      };
    }

    return {
      success: false,
      error: data.error || 'UNKNOWN',
      message: data.message || 'Failed to unlock PDF',
      fallbackUrl: data.fallbackUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: `Network error: ${errorMessage}`,
    };
  }
}

/**
 * Open PDF in new window or iframe
 */
export function openPDF(url: string, title?: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Download PDF file
 */
export async function downloadPDF(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

/**
 * Extract DOI from paper metadata
 */
export function extractDOIFromPaper(paper: any): string | null {
  // Handle undefined/null paper
  if (!paper || typeof paper !== 'object') {
    return null;
  }

  // Priority 1: Check sourceIds.doi (the primary DOI field in Paper type)
  if (paper.sourceIds?.doi) {
    return paper.sourceIds.doi;
  }

  // Priority 2: Check metadata.url (might contain DOI)
  if (paper.metadata?.url) {
    const doi = extractDOI(paper.metadata.url);
    if (doi) return doi;
  }

  // Priority 3: Try link (legacy field, might still exist in some data)
  if (paper.link) {
    const doi = extractDOI(paper.link);
    if (doi) return doi;
  }

  // Priority 4: Try publication info (legacy field)
  if (paper.publication_info) {
    const doi = extractDOI(paper.publication_info);
    if (doi) return doi;
  }

  // Priority 5: Try abstract/snippet (DOI might be mentioned)
  if (paper.abstract) {
    const doi = extractDOI(paper.abstract);
    if (doi) return doi;
  }

  if (paper.snippet) {
    const doi = extractDOI(paper.snippet);
    if (doi) return doi;
  }

  // Priority 6: Try title (least likely but worth checking)
  if (paper.title) {
    const doi = extractDOI(paper.title);
    if (doi) return doi;
  }

  return null;
}
