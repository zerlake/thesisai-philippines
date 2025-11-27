/**
 * Dashboard Customization System
 * Drag-and-drop widget management with smart defaults
 */

import { DashboardPreferences, DashboardWidget } from './types';
import { supabase } from '@/integrations/supabase/client';
import { userPreferencesManager } from './user-preferences';

const DASHBOARD_TABLE = 'dashboard_widgets';

class DashboardCustomizationManager {
  /**
   * Get dashboard configuration for user
   */
  async getDashboardConfig(userId: string): Promise<DashboardPreferences> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);
      return prefs.dashboard;
    } catch (error) {
      console.error('Error getting dashboard config:', error);
      return this._getDefaultDashboard();
    }
  }

  /**
   * Get available widgets
   */
  getAvailableWidgets(): DashboardWidget[] {
    return [
      {
        id: 'widget_stats',
        type: 'statistics',
        position: 0,
        size: 'large',
        enabled: true,
        settings: { title: 'Key Statistics', metric: 'documents_created' },
      },
      {
        id: 'widget_recent',
        type: 'recent_items',
        position: 1,
        size: 'medium',
        enabled: true,
        settings: { title: 'Recently Edited', limit: 5 },
      },
      {
        id: 'widget_quick_actions',
        type: 'quick_actions',
        position: 2,
        size: 'small',
        enabled: true,
        settings: { title: 'Quick Actions', actions: ['new_document', 'upload', 'templates'] },
      },
      {
        id: 'widget_goals',
        type: 'progress_tracker',
        position: 3,
        size: 'medium',
        enabled: false,
        settings: { title: 'Goals & Progress' },
      },
      {
        id: 'widget_calendar',
        type: 'calendar',
        position: 4,
        size: 'medium',
        enabled: false,
        settings: { title: 'Calendar', showEvents: true },
      },
      {
        id: 'widget_suggestions',
        type: 'ai_suggestions',
        position: 5,
        size: 'large',
        enabled: false,
        settings: { title: 'AI Suggestions', limit: 5 },
      },
      {
        id: 'widget_analytics',
        type: 'analytics',
        position: 6,
        size: 'large',
        enabled: false,
        settings: { title: 'Usage Analytics', timeRange: 'week' },
      },
      {
        id: 'widget_collaborators',
        type: 'collaborators',
        position: 7,
        size: 'small',
        enabled: false,
        settings: { title: 'Active Collaborators' },
      },
    ];
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(userId: string, widgetId: string): Promise<DashboardWidget> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);
      const availableWidget = this.getAvailableWidgets().find(w => w.id === widgetId);

      if (!availableWidget) {
        throw new Error(`Widget ${widgetId} not found`);
      }

      // Add widget to dashboard
      const newWidget = {
        ...availableWidget,
        enabled: true,
        position: prefs.dashboard.widgets.length,
      };

      const updatedDashboard: DashboardPreferences = {
        ...prefs.dashboard,
        widgets: [...prefs.dashboard.widgets, newWidget],
      };

      await userPreferencesManager.updateDashboardPreferences(userId, updatedDashboard);
      return newWidget;
    } catch (error) {
      console.error('Error adding widget:', error);
      throw error;
    }
  }

  /**
   * Remove widget from dashboard
   */
  async removeWidget(userId: string, widgetId: string): Promise<void> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);

      const updatedDashboard: DashboardPreferences = {
        ...prefs.dashboard,
        widgets: prefs.dashboard.widgets.filter(w => w.id !== widgetId),
      };

      await userPreferencesManager.updateDashboardPreferences(userId, updatedDashboard);
    } catch (error) {
      console.error('Error removing widget:', error);
      throw error;
    }
  }

  /**
   * Reorder widgets
   */
  async reorderWidgets(userId: string, newOrder: { id: string; position: number }[]): Promise<void> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);

      const updatedWidgets = prefs.dashboard.widgets.map(widget => {
        const newPosition = newOrder.find(item => item.id === widget.id);
        return {
          ...widget,
          position: newPosition?.position || widget.position,
        };
      });

      const updatedDashboard: DashboardPreferences = {
        ...prefs.dashboard,
        widgets: updatedWidgets.sort((a, b) => a.position - b.position),
      };

      await userPreferencesManager.updateDashboardPreferences(userId, updatedDashboard);
    } catch (error) {
      console.error('Error reordering widgets:', error);
      throw error;
    }
  }

  /**
   * Update widget settings
   */
  async updateWidgetSettings(
    userId: string,
    widgetId: string,
    settings: Record<string, unknown>
  ): Promise<DashboardWidget> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);

      const updatedWidgets = prefs.dashboard.widgets.map(w =>
        w.id === widgetId
          ? {
              ...w,
              settings: { ...w.settings, ...settings },
            }
          : w
      );

      const updatedDashboard: DashboardPreferences = {
        ...prefs.dashboard,
        widgets: updatedWidgets,
      };

      await userPreferencesManager.updateDashboardPreferences(userId, updatedDashboard);

      return updatedWidgets.find(w => w.id === widgetId) || ({} as DashboardWidget);
    } catch (error) {
      console.error('Error updating widget settings:', error);
      throw error;
    }
  }

  /**
   * Change widget size
   */
  async resizeWidget(
    userId: string,
    widgetId: string,
    size: 'small' | 'medium' | 'large' | 'full'
  ): Promise<void> {
    try {
      await this.updateWidgetSettings(userId, widgetId, { size });
    } catch (error) {
      console.error('Error resizing widget:', error);
      throw error;
    }
  }

  /**
   * Toggle widget visibility
   */
  async toggleWidget(userId: string, widgetId: string, enabled: boolean): Promise<void> {
    try {
      const prefs = await userPreferencesManager.getUserPreferences(userId);

      const updatedWidgets = prefs.dashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, enabled } : w
      );

      const updatedDashboard: DashboardPreferences = {
        ...prefs.dashboard,
        widgets: updatedWidgets,
      };

      await userPreferencesManager.updateDashboardPreferences(userId, updatedDashboard);
    } catch (error) {
      console.error('Error toggling widget:', error);
      throw error;
    }
  }

  /**
   * Save dashboard layout
   */
  async saveDashboardLayout(userId: string, layout: Partial<DashboardPreferences>): Promise<void> {
    try {
      await userPreferencesManager.updateDashboardPreferences(userId, layout);
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      throw error;
    }
  }

  /**
   * Load saved dashboard layout
   */
  async loadDashboardLayout(userId: string): Promise<DashboardPreferences> {
    return this.getDashboardConfig(userId);
  }

  /**
   * Reset dashboard to defaults
   */
  async resetDashboard(userId: string): Promise<void> {
    try {
      await userPreferencesManager.updateDashboardPreferences(userId, this._getDefaultDashboard());
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      throw error;
    }
  }

  /**
   * Export dashboard configuration
   */
  async exportDashboardConfig(userId: string): Promise<string> {
    try {
      const config = await this.getDashboardConfig(userId);
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error('Error exporting dashboard config:', error);
      throw error;
    }
  }

  /**
   * Import dashboard configuration
   */
  async importDashboardConfig(userId: string, configJson: string): Promise<void> {
    try {
      const config = JSON.parse(configJson) as DashboardPreferences;
      await this.saveDashboardLayout(userId, config);
    } catch (error) {
      console.error('Error importing dashboard config:', error);
      throw error;
    }
  }

  /**
   * Get default dashboard configuration
   */
  private _getDefaultDashboard(): DashboardPreferences {
    return {
      widgets: [
        this.getAvailableWidgets()[0],
        this.getAvailableWidgets()[1],
        this.getAvailableWidgets()[2],
      ],
      layout: 'grid',
      gridColumns: 3,
      enableDragAndDrop: true,
      autoArrangeWidgets: true,
      compactView: false,
    };
  }
}

export const dashboardCustomizationManager = new DashboardCustomizationManager();
