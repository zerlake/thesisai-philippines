import { useState } from 'react';
import {
  unlockPDFFromSciHub,
  extractDOIFromPaper,
  UnlockPDFResult,
} from '@/lib/scihub-integration';

interface UseSciHubResult {
  isUnlocking: boolean;
  error: string | null;
  unlockPDF: (doi: string) => Promise<UnlockPDFResult>;
  extractDOI: (paper: any) => string | null;
}

/**
 * Hook for Sci-Hub PDF unlocking operations
 */
export function useScihub(): UseSciHubResult {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockPDF = async (doi: string): Promise<UnlockPDFResult> => {
    setIsUnlocking(true);
    setError(null);

    try {
      const result = await unlockPDFFromSciHub(doi);
      
      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: 'UNKNOWN',
        message: errorMessage,
      };
    } finally {
      setIsUnlocking(false);
    }
  };

  const extractDOI = (paper: any): string | null => {
    return extractDOIFromPaper(paper);
  };

  return {
    isUnlocking,
    error,
    unlockPDF,
    extractDOI,
  };
}
