'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiError } from '@/lib/personalization/api-client';
import { UserPreferences } from '@/lib/personalization/validation';

interface UsePersonalizationState {
  preferences: Partial<UserPreferences> | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

interface UsePersonalizationReturn extends UsePersonalizationState {
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  updateSection: (section: string, data: Record<string, any>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing user preferences with API integration
 * Handles loading, caching, and error states
 */
export function usePersonalization(): UsePersonalizationReturn {
  const [state, setState] = useState<UsePersonalizationState>({
    preferences: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const cacheRef = useRef<{ preferences: Partial<UserPreferences>; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch preferences from API
  const fetchPreferences = useCallback(async () => {
    // Check cache first (5 minute TTL)
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < 5 * 60 * 1000) {
      setState(prev => ({
        ...prev,
        preferences: cacheRef.current?.preferences || null,
        isLoading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const preferences = await apiClient.getPreferences();
      
      // Update cache
      cacheRef.current = {
        preferences,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        preferences,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      const err = error instanceof ApiError 
        ? error 
        : new Error('Failed to fetch preferences');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err))
      }));

      console.error('Failed to fetch preferences:', error);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await apiClient.updatePreferences(prefs);

      // Update cache
      cacheRef.current = {
        preferences: { ...cacheRef.current?.preferences, ...updated },
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...updated },
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      const err = error instanceof ApiError
        ? error
        : new Error('Failed to update preferences');

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err))
      }));

      throw err;
    }
  }, []);

  // Update specific section
  const updateSection = useCallback(async (section: string, data: Record<string, any>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await apiClient.updatePreferenceSection(section, data);

      // Update cache
      const newPrefs = { ...cacheRef.current?.preferences, [section]: updated };
      cacheRef.current = {
        preferences: newPrefs,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        preferences: newPrefs,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      const err = error instanceof ApiError
        ? error
        : new Error(`Failed to update ${section}`);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err))
      }));

      throw err;
    }
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call API to reset (assuming endpoint exists)
      const reset = await apiClient.updatePreferences({
        theme: { mode: 'auto', fontSize: 'medium', lineHeight: 'normal' },
        notifications: { enabled: true },
        accessibility: { highContrast: false, reduceMotion: false },
        layout: { sidebarPosition: 'left', compactMode: false },
        privacy: { behaviorTracking: true, analyticsOptIn: true }
      });

      // Update cache
      cacheRef.current = {
        preferences: reset,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        preferences: reset,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      const err = error instanceof ApiError
        ? error
        : new Error('Failed to reset preferences');

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err))
      }));

      throw err;
    }
  }, []);

  // Refetch preferences
  const refetch = useCallback(async () => {
    cacheRef.current = null; // Clear cache
    await fetchPreferences();
  }, [fetchPreferences]);

  // Initial fetch
  useEffect(() => {
    fetchPreferences();

    return () => {
      // Cleanup
      abortControllerRef.current?.abort();
    };
  }, [fetchPreferences]);

  return {
    ...state,
    updatePreferences,
    updateSection,
    resetPreferences,
    refetch
  };
}

/**
 * Hook for managing a specific preference section
 */
export function usePreferenceSection<T extends Record<string, any>>(
  section: string,
  defaultValue: T
): {
  data: T;
  isLoading: boolean;
  error: Error | null;
  update: (data: Partial<T>) => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  const fetchSection = useCallback(async () => {
    // Check cache first
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < 5 * 60 * 1000) {
      setData(cacheRef.current.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getPreferenceSection(section);
      const sectionData = result[section] || defaultValue;

      cacheRef.current = {
        data: sectionData,
        timestamp: Date.now()
      };

      setData(sectionData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Failed to fetch ${section}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [section, defaultValue]);

  const update = useCallback(async (updates: Partial<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await apiClient.updatePreferenceSection(section, updates);

      const newData = { ...data, ...updated };
      setData(newData);

      cacheRef.current = {
        data: newData,
        timestamp: Date.now()
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [section, data]);

  const refetch = useCallback(async () => {
    cacheRef.current = null;
    await fetchSection();
  }, [fetchSection]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  return { data, isLoading, error, update, refetch };
}

export default usePersonalization;
