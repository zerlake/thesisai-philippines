import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardCustomizationManager } from '@/lib/personalization/dashboard-customization';

describe('DashboardCustomizationManager', () => {
  let manager: DashboardCustomizationManager;

  beforeEach(() => {
    manager = new DashboardCustomizationManager('test-user-123');
  });

  describe('Widget CRUD', () => {
    it('should create a new widget', async () => {
      const widget = {
        type: 'writing_stats' as const,
        title: 'Writing Statistics',
        position: { x: 0, y: 0, width: 3, height: 2 }
      };

      const created = await manager.addWidget(widget);

      expect(created.id).toBeDefined();
      expect(created.type).toBe('writing_stats');
    });

    it('should get widget by ID', async () => {
      const widget = {
        type: 'recent_essays' as const,
        title: 'Recent Essays',
        position: { x: 0, y: 0, width: 3, height: 2 }
      };

      const created = await manager.addWidget(widget);
      const retrieved = await manager.getWidget(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Recent Essays');
    });

    it('should update widget', async () => {
      const widget = {
        type: 'quick_actions' as const,
        title: 'Quick Actions',
        position: { x: 0, y: 0, width: 2, height: 1 }
      };

      const created = await manager.addWidget(widget);

      const updated = await manager.updateWidget(created.id, {
        title: 'New Quick Actions',
        position: { x: 3, y: 0, width: 3, height: 2 }
      });

      expect(updated.title).toBe('New Quick Actions');
      expect(updated.position.x).toBe(3);
    });

    it('should delete widget', async () => {
      const widget = {
        type: 'recommendations' as const,
        title: 'Recommendations',
        position: { x: 0, y: 0, width: 3, height: 2 }
      };

      const created = await manager.addWidget(widget);
      await manager.removeWidget(created.id);

      const retrieved = await manager.getWidget(created.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Widget Reordering', () => {
    it('should reorder widgets', async () => {
      const widget1 = await manager.addWidget({
        type: 'writing_stats' as const,
        title: 'Widget 1',
        position: { x: 0, y: 0, width: 3, height: 2 }
      });

      const widget2 = await manager.addWidget({
        type: 'recent_essays' as const,
        title: 'Widget 2',
        position: { x: 3, y: 0, width: 3, height: 2 }
      });

      const reordered = await manager.reorderWidgets([widget2.id, widget1.id]);

      expect(reordered[0].id).toBe(widget2.id);
      expect(reordered[1].id).toBe(widget1.id);
    });

    it('should handle position changes during reorder', async () => {
      const widget1 = await manager.addWidget({
        type: 'writing_stats' as const,
        title: 'Widget 1',
        position: { x: 0, y: 0, width: 3, height: 2 }
      });

      const widget2 = await manager.addWidget({
        type: 'recent_essays' as const,
        title: 'Widget 2',
        position: { x: 3, y: 0, width: 3, height: 2 }
      });

      const rearranged = await manager.rearrangeWidgets([
        { id: widget2.id, position: { x: 0, y: 0, width: 3, height: 2 } },
        { id: widget1.id, position: { x: 3, y: 0, width: 3, height: 2 } }
      ]);

      expect(rearranged[0].id).toBe(widget2.id);
      expect(rearranged[0].position.x).toBe(0);
    });
  });

  describe('Widget Settings', () => {
    it('should update widget settings', async () => {
      const widget = await manager.addWidget({
        type: 'writing_stats' as const,
        title: 'Stats',
        position: { x: 0, y: 0, width: 3, height: 2 },
        settings: { period: 'month' }
      });

      const updated = await manager.updateWidgetSettings(widget.id, {
        period: 'year',
        showChart: true
      });

      expect(updated.settings.period).toBe('year');
      expect(updated.settings.showChart).toBe(true);
    });

    it('should validate refresh interval', async () => {
      const widget = await manager.addWidget({
        type: 'quick_actions' as const,
        title: 'Actions',
        position: { x: 0, y: 0, width: 2, height: 1 },
        refreshInterval: 30000 // 30 seconds
      });

      expect(widget.refreshInterval).toBe(30000);
    });
  });

  describe('Layout Presets', () => {
    it('should create layout preset', async () => {
      const widgets = [
        {
          type: 'writing_stats' as const,
          title: 'Stats',
          position: { x: 0, y: 0, width: 6, height: 2 }
        },
        {
          type: 'recent_essays' as const,
          title: 'Essays',
          position: { x: 6, y: 0, width: 6, height: 2 }
        }
      ];

      const preset = await manager.createPreset('My Layout', widgets);

      expect(preset.layoutName).toBe('My Layout');
      expect(preset.widgets.length).toBe(2);
    });

    it('should set default layout', async () => {
      const widgets = [
        {
          type: 'writing_stats' as const,
          title: 'Stats',
          position: { x: 0, y: 0, width: 12, height: 2 }
        }
      ];

      const preset = await manager.createPreset('Default', widgets, true);

      expect(preset.isDefault).toBe(true);
    });

    it('should load preset', async () => {
      const widgets = [
        {
          type: 'quick_actions' as const,
          title: 'Actions',
          position: { x: 0, y: 0, width: 4, height: 1 }
        }
      ];

      const preset = await manager.createPreset('Quick Start', widgets);
      const loaded = await manager.loadPreset(preset.id);

      expect(loaded.widgets.length).toBe(widgets.length);
      expect(loaded.widgets[0].type).toBe('quick_actions');
    });
  });

  describe('Responsive Layouts', () => {
    it('should handle responsive configurations', async () => {
      const widget = await manager.addWidget({
        type: 'writing_stats' as const,
        title: 'Stats',
        position: { x: 0, y: 0, width: 6, height: 2 }
      });

      // Get layout for mobile
      const mobileLayout = await manager.getResponsiveLayout('mobile');

      expect(mobileLayout).toBeDefined();
    });

    it('should adapt widget sizes for different screens', async () => {
      const widget = await manager.addWidget({
        type: 'recent_essays' as const,
        title: 'Essays',
        position: { x: 0, y: 0, width: 6, height: 2 }
      });

      const desktopLayout = await manager.getResponsiveLayout('desktop');
      const mobileLayout = await manager.getResponsiveLayout('mobile');

      expect(desktopLayout).toBeDefined();
      expect(mobileLayout).toBeDefined();
    });
  });

  describe('Config Import/Export', () => {
    it('should export configuration', async () => {
      const widget = await manager.addWidget({
        type: 'writing_stats' as const,
        title: 'Stats',
        position: { x: 0, y: 0, width: 3, height: 2 }
      });

      const exported = await manager.exportConfig();

      expect(exported).toBeDefined();
      expect(Array.isArray(exported.widgets)).toBe(true);
    });

    it('should import configuration', async () => {
      const config = {
        widgets: [
          {
            id: 'widget-1',
            type: 'quick_actions' as const,
            title: 'Actions',
            position: { x: 0, y: 0, width: 3, height: 1 }
          }
        ],
        gridSize: { columns: 12, rows: 4 }
      };

      const imported = await manager.importConfig(config);

      expect(imported.widgets.length).toBe(1);
      expect(imported.widgets[0].title).toBe('Actions');
    });

    it('should validate imported config', async () => {
      const invalidConfig = {
        widgets: null, // Invalid
        gridSize: { columns: 0, rows: 0 } // Invalid
      };

      const result = await manager.importConfig(invalidConfig).catch(e => e);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('Smart Defaults', () => {
    it('should generate default layout', async () => {
      const defaults = await manager.generateDefaults();

      expect(defaults.widgets.length).toBeGreaterThan(0);
      expect(defaults.gridSize.columns).toBe(12);
    });

    it('should suggest widgets based on patterns', async () => {
      // With no patterns, suggest popular widgets
      const suggestions = await manager.suggestWidgets();

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});
