'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ValidityDefender = dynamic(() => import('@/components/ValidityDefender/ValidityDefender'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Validity Defender...</p>
      </div>
    </div>
  ),
});

export default function ValidityDefenderPage() {
  const [isReady, setIsReady] = useState(false);
  const thesisId = 'default-thesis-id';

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ValidityDefender thesisId={thesisId} />
      </div>
    </div>
  );
}
