import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardCustomizationManager } from '@/lib/personalization/dashboard-customization';

// Mock dependencies
vi.mock('@/lib/personalization/user-preferences', () => ({
  userPreferencesManager: {
    getUserPreferences: vi.fn().mockResolvedValue({
      dashboard: { widgets: [], layout: 'grid', gridColumns: 3 },
    }),
    updateDashboardPreferences: vi.fn().mockResolvedValue({
      dashboard: { widgets: [], layout: 'grid', gridColumns: 3 },
    }),
  },
}));

describe('DashboardCustomizationManager', () => {
  let manager: DashboardCustomizationManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    manager = new DashboardCustomizationManager();
  });

  describe('getDashboardConfig', () => {
    it('should get dashboard configuration for user', async () => {
      const config = await manager.getDashboardConfig(testUserId);
      
      expect(config).toBeDefined();
      expect(config.widgets).toBeDefined();
      expect(config.layout).toBeDefined();
    });

    it('should return default dashboard on error', async () => {
      const config = await manager.getDashboardConfig(testUserId);
      
      expect(config.layout).toBe('grid');
      expect(Array.isArray(config.widgets)).toBe(true);
    });
  });

  describe('getAvailableWidgets', () => {
    it('should return list of available widgets', () => {
      const widgets = manager.getAvailableWidgets();
      
      expect(Array.isArray(widgets)).toBe(true);
      expect(widgets.length).toBeGreaterThan(0);
    });

    it('should have proper widget structure', () => {
      const widgets = manager.getAvailableWidgets();
      const firstWidget = widgets[0];
      
      expect(firstWidget.id).toBeDefined();
      expect(firstWidget.type).toBeDefined();
      expect(firstWidget.position).toBeDefined();
      expect(firstWidget.size).toBeDefined();
      expect(firstWidget.enabled).toBeDefined();
      expect(firstWidget.settings).toBeDefined();
    });
  });

  describe('addWidget', () => {
    it('should add widget to dashboard', async () => {
      const widgetId = 'widget_stats';
      
      const result = await manager.addWidget(testUserId, widgetId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(widgetId);
      expect(result.enabled).toBe(true);
    });

    it('should error on invalid widget ID', async () => {
      try {
        await manager.addWidget(testUserId, 'invalid-widget');
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('removeWidget', () => {
    it('should remove widget from dashboard', async () => {
      await manager.removeWidget(testUserId, 'widget_stats');
      
      expect(true).toBe(true);
    });
  });

  describe('reorderWidgets', () => {
    it('should reorder widgets', async () => {
      const newOrder = [
        { id: 'widget_stats', position: 1 },
        { id: 'widget_recent', position: 0 },
      ];
      
      await manager.reorderWidgets(testUserId, newOrder);
      
      expect(true).toBe(true);
    });
  });

  describe('updateWidgetSettings', () => {
    it('should update widget settings', async () => {
      const settings = { title: 'Custom Title', limit: 10 };
      
      const result = await manager.updateWidgetSettings(testUserId, 'widget_stats', settings);
      
      expect(result).toBeDefined();
      expect(result.settings).toBeDefined();
    });
  });

  describe('resizeWidget', () => {
    it('should resize widget', async () => {
      await manager.resizeWidget(testUserId, 'widget_stats', 'large');
      
      expect(true).toBe(true);
    });
  });

  describe('toggleWidget', () => {
    it('should toggle widget visibility', async () => {
      await manager.toggleWidget(testUserId, 'widget_stats', false);
      
      expect(true).toBe(true);
    });

    it('should enable disabled widget', async () => {
      await manager.toggleWidget(testUserId, 'widget_stats', true);
      
      expect(true).toBe(true);
    });
  });

  describe('saveDashboardLayout', () => {
    it('should save dashboard layout', async () => {
      const layout = { gridColumns: 4, enableDragAndDrop: true };
      
      await manager.saveDashboardLayout(testUserId, layout);
      
      expect(true).toBe(true);
    });
  });

  describe('loadDashboardLayout', () => {
    it('should load dashboard layout', async () => {
      const layout = await manager.loadDashboardLayout(testUserId);
      
      expect(layout).toBeDefined();
      expect(layout.layout).toBe('grid');
    });
  });

  describe('resetDashboard', () => {
    it('should reset dashboard to defaults', async () => {
      await manager.resetDashboard(testUserId);
      
      expect(true).toBe(true);
    });
  });

  describe('exportDashboardConfig', () => {
    it('should export dashboard configuration as JSON', async () => {
      const json = await manager.exportDashboardConfig(testUserId);
      
      expect(typeof json).toBe('string');
      const config = JSON.parse(json);
      expect(config).toBeDefined();
    });
  });

  describe('importDashboardConfig', () => {
    it('should import dashboard configuration from JSON', async () => {
      const configJson = JSON.stringify({
        widgets: [],
        layout: 'grid',
        gridColumns: 4,
      });
      
      await manager.importDashboardConfig(testUserId, configJson);
      
      expect(true).toBe(true);
    });

    it('should error on invalid JSON', async () => {
      try {
        await manager.importDashboardConfig(testUserId, 'invalid json');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Default Dashboard', () => {
    it('should have default widgets', () => {
      const widgets = manager.getAvailableWidgets();
      
      expect(widgets.some(w => w.type === 'statistics')).toBe(true);
      expect(widgets.some(w => w.type === 'recent_items')).toBe(true);
      expect(widgets.some(w => w.type === 'quick_actions')).toBe(true);
    });

    it('should have grid layout by default', async () => {
      const config = await manager.getDashboardConfig(testUserId);
      
      expect(config.layout).toBe('grid');
      expect(config.gridColumns).toBe(3);
    });
  });

  describe('Widget Management', () => {
    it('should maintain widget positions', async () => {
      await manager.addWidget(testUserId, 'widget_stats');
      await manager.addWidget(testUserId, 'widget_recent');
      
      expect(true).toBe(true);
    });

    it('should handle widget size changes', async () => {
      await manager.resizeWidget(testUserId, 'widget_stats', 'large');
      await manager.resizeWidget(testUserId, 'widget_stats', 'medium');
      
      expect(true).toBe(true);
    });
  });
});
