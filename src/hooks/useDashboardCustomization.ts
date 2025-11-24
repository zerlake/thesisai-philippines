'use client';

/**
 * Dashboard customization hook
 * Handles drag-and-drop widget management
 */

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  dashboardCustomizationManager,
  DashboardWidget,
  DashboardPreferences,
} from '@/lib/personalization';

interface UseDashboardCustomizationReturn {
  widgets: DashboardWidget[];
  config: DashboardPreferences | null;
  isLoading: boolean;
  addWidget: (widgetId: string) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  reorderWidgets: (newOrder: { id: string; position: number }[]) => Promise<void>;
  resizeWidget: (widgetId: string, size: 'small' | 'medium' | 'large' | 'full') => Promise<void>;
  toggleWidget: (widgetId: string, enabled: boolean) => Promise<void>;
  updateWidgetSettings: (widgetId: string, settings: Record<string, unknown>) => Promise<void>;
  resetDashboard: () => Promise<void>;
}

export function useDashboardCustomization(): UseDashboardCustomizationReturn {
  const { user, isLoaded } = useAuth();
  const [config, setConfig] = useState<DashboardPreferences | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard config
  useEffect(() => {
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const dashConfig = await dashboardCustomizationManager.getDashboardConfig(user.id);
        setConfig(dashConfig);
        setWidgets(dashConfig.widgets);
      } catch (error) {
        console.error('Failed to load dashboard config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [user, isLoaded]);

  const addWidget = useCallback(
    async (widgetId: string) => {
      if (!user) return;

      try {
        const newWidget = await dashboardCustomizationManager.addWidget(user.id, widgetId);
        setWidgets(prev => [...prev, newWidget]);
      } catch (error) {
        console.error('Failed to add widget:', error);
        throw error;
      }
    },
    [user]
  );

  const removeWidget = useCallback(
    async (widgetId: string) => {
      if (!user) return;

      try {
        await dashboardCustomizationManager.removeWidget(user.id, widgetId);
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
      } catch (error) {
        console.error('Failed to remove widget:', error);
        throw error;
      }
    },
    [user]
  );

  const reorderWidgets = useCallback(
    async (newOrder: { id: string; position: number }[]) => {
      if (!user) return;

      try {
        await dashboardCustomizationManager.reorderWidgets(user.id, newOrder);
        const reordered = [...widgets].sort((a, b) => {
          const aPos = newOrder.find(o => o.id === a.id)?.position || a.position;
          const bPos = newOrder.find(o => o.id === b.id)?.position || b.position;
          return aPos - bPos;
        });
        setWidgets(reordered);
      } catch (error) {
        console.error('Failed to reorder widgets:', error);
        throw error;
      }
    },
    [user, widgets]
  );

  const resizeWidget = useCallback(
    async (widgetId: string, size: 'small' | 'medium' | 'large' | 'full') => {
      if (!user) return;

      try {
        await dashboardCustomizationManager.resizeWidget(user.id, widgetId, size);
        setWidgets(prev =>
          prev.map(w => (w.id === widgetId ? { ...w, size } : w))
        );
      } catch (error) {
        console.error('Failed to resize widget:', error);
        throw error;
      }
    },
    [user]
  );

  const toggleWidget = useCallback(
    async (widgetId: string, enabled: boolean) => {
      if (!user) return;

      try {
        await dashboardCustomizationManager.toggleWidget(user.id, widgetId, enabled);
        setWidgets(prev =>
          prev.map(w => (w.id === widgetId ? { ...w, enabled } : w))
        );
      } catch (error) {
        console.error('Failed to toggle widget:', error);
        throw error;
      }
    },
    [user]
  );

  const updateWidgetSettings = useCallback(
    async (widgetId: string, settings: Record<string, unknown>) => {
      if (!user) return;

      try {
        await dashboardCustomizationManager.updateWidgetSettings(user.id, widgetId, settings);
        setWidgets(prev =>
          prev.map(w =>
            w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
          )
        );
      } catch (error) {
        console.error('Failed to update widget settings:', error);
        throw error;
      }
    },
    [user]
  );

  const resetDashboard = useCallback(async () => {
    if (!user) return;

    try {
      await dashboardCustomizationManager.resetDashboard(user.id);
      const newConfig = await dashboardCustomizationManager.getDashboardConfig(user.id);
      setConfig(newConfig);
      setWidgets(newConfig.widgets);
    } catch (error) {
      console.error('Failed to reset dashboard:', error);
      throw error;
    }
  }, [user]);

  return {
    widgets,
    config,
    isLoading,
    addWidget,
    removeWidget,
    reorderWidgets,
    resizeWidget,
    toggleWidget,
    updateWidgetSettings,
    resetDashboard,
  };
}
