import { getPhaseById, getPhaseNavigation, getAllPhaseIds } from '@/lib/thesis-phases';
import { PhasePageClient } from './client';
import Link from 'next/link';

interface PhasePageProps {
  params: Promise<{
    phaseId: string;
  }>;
}

export function generateStaticParams() {
  return getAllPhaseIds().map((phaseId) => ({
    phaseId,
  }));
}

export default async function PhasePage({ params }: PhasePageProps) {
  const { phaseId } = await params;
  const phase = getPhaseById(phaseId);

  if (!phase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Phase Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">The thesis phase you're looking for doesn't exist.</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navigation = getPhaseNavigation(phaseId);

  return (
    <PhasePageClient
      phase={phase}
      navigation={navigation}
    />
  );
}
