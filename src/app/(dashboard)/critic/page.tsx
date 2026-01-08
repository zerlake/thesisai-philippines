'use client';

import { useAuth } from '@/components/auth-provider';
import { redirect } from 'next/navigation';
import { EnhancedCriticDashboard } from '@/components/critic/enhanced-critic-dashboard';

export default function CriticPage() {
  const authContext = useAuth();

  if (!authContext) {
    // If auth context is not available, return null to let the layout handle it
    // or redirect to login if needed
    redirect('/login');
  }

  const { session, profile, isLoading } = authContext;

  // Redirect if not authenticated or not authorized (critic or admin can access)
  if (!isLoading && (!session || (profile?.role !== 'critic' && profile?.role !== 'admin'))) {
    redirect('/login');
  }

  // Render the dashboard immediately with role-based access control handled inside
  // The EnhancedCriticDashboard will handle its own loading states
  return <EnhancedCriticDashboard />;
}
