import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

interface OnboardingState {
  id: string;
  user_id: string;
  role: 'student' | 'advisor' | 'critic';
  current_step: number;
  completed_at: string | null;
  skipped_at: string | null;
  thesis_title: string | null;
  institution: string | null;
  target_defense_semester: string | null;
  language: string;
  degree_level: string | null;
  field_of_study: string | null;
  guidance_intensity: string | null;
  help_topics: string[];
  setup_score: number;
  achievements: string[];
  unlocked_features: string[];
  viewed_steps: number[];
  time_spent_seconds: number;
  skipped_steps: number[];
  created_at: string;
  updated_at: string;
}

interface UseOnboardingStateReturn {
  state: OnboardingState | null;
  isLoading: boolean;
  shouldShowOnboarding: boolean;
  error: string | null;
  markAsSkipped: () => Promise<void>;
  markAsCompleted: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useOnboardingState(): UseOnboardingStateReturn {
  const { session } = useAuth();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const fetchState = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/onboarding/state');

      if (!response.ok) {
        throw new Error(`Failed to fetch onboarding state: ${response.statusText}`);
      }

      const data = await response.json();
      setState(data.onboarding);
      setShouldShowOnboarding(data.shouldShowOnboarding);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error fetching onboarding state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsSkipped = async () => {
    try {
      const response = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to mark as skipped');
      }

      setShouldShowOnboarding(false);
      await fetchState();
    } catch (err) {
      console.error('Error marking as skipped:', err);
    }
  };

  const markAsCompleted = async () => {
    try {
      const response = await fetch('/api/onboarding/complete-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to mark as completed');
      }

      setShouldShowOnboarding(false);
      await fetchState();
    } catch (err) {
      console.error('Error marking as completed:', err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchState();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  return {
    state,
    isLoading,
    shouldShowOnboarding,
    error,
    markAsSkipped,
    markAsCompleted,
    refetch: fetchState,
  };
}
