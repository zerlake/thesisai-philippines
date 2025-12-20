'use client';

import { useAuth } from '@/components/auth-provider';
import { redirect } from 'next/navigation';
import { BrandedLoader } from '@/components/branded-loader';
import { EnhancedCriticDashboard } from '@/components/critic/enhanced-critic-dashboard';

export default function CriticPage() {
  const authContext = useAuth();

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  // Redirect if not authenticated or not a critic
  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  return <EnhancedCriticDashboard />;
}
