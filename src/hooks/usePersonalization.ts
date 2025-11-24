'use client';

/**
 * Main personalization hook
 * Provides access to all personalization features
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  userPreferencesManager,
  crossDeviceSyncManager,
  adaptiveInterfaceManager,
  smartNotificationManager,
  dashboardCustomizationManager,
  UserPreferences,
  AdaptiveInterface,
  DashboardPreferences,
} from '@/lib/personalization';

interface UsePersonalizationReturn {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  adaptiveInterface: AdaptiveInterface | null;
  dashboard: DashboardPreferences | null;
  syncStatus: { syncing: boolean; lastSync: Date | null };
}

export function usePersonalization(): UsePersonalizationReturn {
  const { user, isLoaded } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [adaptiveInterface, setAdaptiveInterface] = useState<AdaptiveInterface | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, lastSync: null as Date | null });

  // Load preferences on mount and when user changes
  useEffect(() => {
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const prefs = await userPreferencesManager.getUserPreferences(user.id);
        setPreferences(prefs);

        const adaptive = await adaptiveInterfaceManager.getAdaptiveInterface(user.id);
        setAdaptiveInterface(adaptive);

        const dash = await dashboardCustomizationManager.getDashboardConfig(user.id);
        setDashboard(dash);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load preferences'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, isLoaded]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return;

      try {
        const updated = await userPreferencesManager.updatePreferences(user.id, updates);
        setPreferences(updated);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update preferences'));
        throw err;
      }
    },
    [user]
  );

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    adaptiveInterface,
    dashboard,
    syncStatus,
  };
}
