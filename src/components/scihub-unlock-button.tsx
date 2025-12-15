"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Unlock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useScihub } from '@/hooks/use-scihub';

interface SciHubUnlockButtonProps {
  paper: {
    id?: string;
    title?: string;
    link?: string;
    publication_info?: string;
    snippet?: string;
    [key: string]: any;
  };
  doi?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: (paperId: string) => void;
}

export function SciHubUnlockButton({
  paper,
  doi: providedDOI,
  variant = 'outline',
  size = 'default',
  className = '',
  onSuccess,
}: SciHubUnlockButtonProps) {
  const { isUnlocking, error, unlockPDF, extractDOI } = useScihub();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [lastUnlockResult, setLastUnlockResult] = useState<any>(null);

  const doi = providedDOI || extractDOI(paper);

  if (!doi) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <AlertCircle className="w-4 h-4 mr-2" />
        No DOI
      </Button>
    );
  }

  const handleUnlock = async () => {
    setShowDisclaimer(false);

    toast.loading('Unlocking PDF from Sci-Hub...', {
      duration: Infinity,
      id: 'scihub-unlock',
    });

    const result = await unlockPDF(doi);

    toast.dismiss('scihub-unlock');

    if (result.success && result.url) {
      setLastUnlockResult(result);
      toast.success('PDF unlocked! Opening in new window...', {
        duration: 3000,
      });
      window.open(result.url, '_blank', 'noopener,noreferrer');

      // Call success callback if provided
      if (onSuccess && paper.id) {
        onSuccess(paper.id);
      }
    } else {
      // If automatic unlock failed but we have a fallback URL, offer to open it
      if (result.fallbackUrl) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{result.message || 'Failed to unlock PDF automatically'}</p>
            <button
              onClick={() => {
                window.open(result.fallbackUrl, '_blank', 'noopener,noreferrer');
                toast.dismiss();
              }}
              className="text-sm underline text-blue-600 hover:text-blue-800"
            >
              Open Sci-Hub manually →
            </button>
          </div>,
          {
            duration: 10000,
          }
        );
      } else {
        toast.error(result.message || 'Failed to unlock PDF', {
          duration: 5000,
        });
      }
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDisclaimer(true)}
        disabled={isUnlocking}
        className={className}
      >
        {isUnlocking ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Unlocking...
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4 mr-2" />
            Unlock PDF
          </>
        )}
      </Button>

      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Legal Notice
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to access a PDF via <strong>Sci-Hub</strong>, an unofficial open-access repository.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-900">
                    <strong>⚠️ Important:</strong> Sci-Hub access may violate copyright in some jurisdictions.
                    Always prefer official open-access sources like ArXiv, PubMed Central, or publisher repositories first.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  By proceeding, you confirm that you are using this for personal, non-commercial research purposes only.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlock} className="bg-blue-600 hover:bg-blue-700">
              Continue to Sci-Hub
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
