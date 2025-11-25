/**
 * Responsive Layout System Tests
 * Tests for breakpoint detection, layout reflowing, and validation
 */

import {
  getCurrentBreakpoint,
  getBreakpointConfig,
  reflowWidgetLayout,
  stackWidgetsVertically,
  detectLayoutIssues,
  autoFixLayout,
  calculateLayoutHeight,
  isValidPosition,
  BREAKPOINT_CONFIGS,
} from '@/lib/personalization/responsive-layout';
import type { WidgetLayout, Breakpoint } from '@/lib/personalization/responsive-layout';

describe('Responsive Layout System', () => {
  describe('getCurrentBreakpoint', () => {
    it('should detect mobile breakpoint', () => {
      expect(getCurrentBreakpoint(375)).toBe('mobile');
    });

    it('should detect tablet breakpoint', () => {
      expect(getCurrentBreakpoint(768)).toBe('tablet');
    });

    it('should detect desktop breakpoint', () => {
      expect(getCurrentBreakpoint(1920)).toBe('desktop');
    });

    it('should use window width as default', () => {
      const breakpoint = getCurrentBreakpoint();
      expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);
    });
  });

  describe('getBreakpointConfig', () => {
    it('should return mobile config', () => {
      const config = getBreakpointConfig('mobile');
      expect(config.columns).toBe(2);
      expect(config.minWidth).toBe(320);
    });

    it('should return tablet config', () => {
      const config = getBreakpointConfig('tablet');
      expect(config.columns).toBe(4);
      expect(config.minWidth).toBe(481);
    });

    it('should return desktop config', () => {
      const config = getBreakpointConfig('desktop');
      expect(config.columns).toBe(6);
      expect(config.minWidth).toBe(1025);
    });

    it('should have correct cell heights', () => {
      expect(BREAKPOINT_CONFIGS.mobile.cellHeight).toBe(60);
      expect(BREAKPOINT_CONFIGS.tablet.cellHeight).toBe(70);
      expect(BREAKPOINT_CONFIGS.desktop.cellHeight).toBe(80);
    });
  });

  describe('reflowWidgetLayout', () => {
    const mockWidget: WidgetLayout = {
      id: 'widget-1',
      widgetId: 'stats',
      x: 2,
      y: 0,
      w: 2,
      h: 2,
      settings: {},
    };

    it('should scale positions from desktop to mobile', () => {
      const result = reflowWidgetLayout([mockWidget], 'desktop', 'mobile');
      expect(result[0].w).toBeLessThanOrEqual(2);
      expect(result[0].x).toBeGreaterThanOrEqual(0);
    });

    it('should normalize mobile widgets to single column', () => {
      const widget: WidgetLayout = {
        id: 'widget-1',
        widgetId: 'stats',
        x: 0,
        y: 0,
        w: 4,
        h: 2,
        settings: {},
      };

      const result = reflowWidgetLayout([widget], 'tablet', 'mobile');
      expect(result[0].w).toBe(1);
      expect(result[0].x).toBe(0);
    });

    it('should maintain height during reflow', () => {
      const result = reflowWidgetLayout([mockWidget], 'desktop', 'tablet');
      expect(result[0].h).toBe(mockWidget.h);
    });

    it('should handle multiple widgets', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 1, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 2, y: 0, w: 2, h: 1, settings: {} },
        { id: 'w3', widgetId: 'stats', x: 4, y: 0, w: 2, h: 1, settings: {} },
      ];

      const result = reflowWidgetLayout(widgets, 'desktop', 'tablet');
      expect(result).toHaveLength(3);
      expect(result.every(w => w.w > 0)).toBe(true);
    });
  });

  describe('stackWidgetsVertically', () => {
    const widgets: WidgetLayout[] = [
      { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 1, settings: {} },
      { id: 'w2', widgetId: 'stats', x: 2, y: 0, w: 2, h: 1, settings: {} },
      { id: 'w3', widgetId: 'stats', x: 4, y: 0, w: 2, h: 1, settings: {} },
    ];

    it('should stack widgets vertically', () => {
      const result = stackWidgetsVertically(widgets, 2);
      
      // First widget at origin
      expect(result[0].x).toBe(0);
      expect(result[0].y).toBe(0);

      // Widgets should not overlap
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          const a = result[i];
          const b = result[j];
          const overlap =
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
          expect(overlap).toBe(false);
        }
      }
    });

    it('should respect max columns constraint', () => {
      const result = stackWidgetsVertically(widgets, 2);
      result.forEach(w => {
        expect(w.x + w.w).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('detectLayoutIssues', () => {
    it('should detect overlapping widgets', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 2, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 1, y: 1, w: 2, h: 2, settings: {} },
      ];

      const issues = detectLayoutIssues(widgets);
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should not report non-overlapping widgets', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 2, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 2, y: 0, w: 2, h: 2, settings: {} },
      ];

      const issues = detectLayoutIssues(widgets);
      expect(issues).toHaveLength(0);
    });
  });

  describe('autoFixLayout', () => {
    it('should fix overlapping widgets', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 2, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 1, y: 1, w: 2, h: 2, settings: {} },
      ];

      const fixed = autoFixLayout(widgets);
      const issues = detectLayoutIssues(fixed);
      expect(issues).toHaveLength(0);
    });

    it('should preserve widget count', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 2, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 1, y: 1, w: 2, h: 2, settings: {} },
        { id: 'w3', widgetId: 'stats', x: 2, y: 2, w: 2, h: 2, settings: {} },
      ];

      const fixed = autoFixLayout(widgets);
      expect(fixed).toHaveLength(widgets.length);
    });

    it('should respect max columns', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 3, h: 2, settings: {} },
      ];

      const fixed = autoFixLayout(widgets, 2);
      fixed.forEach(w => {
        expect(w.x + w.w).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('calculateLayoutHeight', () => {
    it('should calculate height from widgets', () => {
      const widgets: WidgetLayout[] = [
        { id: 'w1', widgetId: 'stats', x: 0, y: 0, w: 2, h: 2, settings: {} },
        { id: 'w2', widgetId: 'stats', x: 0, y: 2, w: 2, h: 3, settings: {} },
      ];

      const height = calculateLayoutHeight(widgets, 80);
      expect(height).toBe(5 * 80); // (2 + 3 = 5 rows)
    });

    it('should return 0 for empty layout', () => {
      const height = calculateLayoutHeight([], 80);
      expect(height).toBe(0);
    });
  });

  describe('isValidPosition', () => {
    const config = BREAKPOINT_CONFIGS.desktop;

    it('should validate correct positions', () => {
      const widget: WidgetLayout = {
        id: 'w1',
        widgetId: 'stats',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        settings: {},
      };

      expect(isValidPosition(widget, 6, config)).toBe(true);
    });

    it('should reject invalid x position', () => {
      const widget: WidgetLayout = {
        id: 'w1',
        widgetId: 'stats',
        x: -1,
        y: 0,
        w: 2,
        h: 2,
        settings: {},
      };

      expect(isValidPosition(widget, 6, config)).toBe(false);
    });

    it('should reject widget exceeding max width', () => {
      const widget: WidgetLayout = {
        id: 'w1',
        widgetId: 'stats',
        x: 5,
        y: 0,
        w: 2,
        h: 2,
        settings: {},
      };

      expect(isValidPosition(widget, 6, config)).toBe(false);
    });

    it('should reject zero/negative dimensions', () => {
      const widget: WidgetLayout = {
        id: 'w1',
        widgetId: 'stats',
        x: 0,
        y: 0,
        w: 0,
        h: 2,
        settings: {},
      };

      expect(isValidPosition(widget, 6, config)).toBe(false);
    });
  });

  describe('Breakpoint Config Values', () => {
    it('should have increasing column counts', () => {
      expect(BREAKPOINT_CONFIGS.mobile.columns).toBeLessThan(
        BREAKPOINT_CONFIGS.tablet.columns
      );
      expect(BREAKPOINT_CONFIGS.tablet.columns).toBeLessThan(
        BREAKPOINT_CONFIGS.desktop.columns
      );
    });

    it('should have increasing cell heights', () => {
      expect(BREAKPOINT_CONFIGS.mobile.cellHeight).toBeLessThan(
        BREAKPOINT_CONFIGS.tablet.cellHeight
      );
      expect(BREAKPOINT_CONFIGS.tablet.cellHeight).toBeLessThan(
        BREAKPOINT_CONFIGS.desktop.cellHeight
      );
    });

    it('should have increasing gutter sizes', () => {
      expect(BREAKPOINT_CONFIGS.mobile.gutter).toBeLessThan(
        BREAKPOINT_CONFIGS.tablet.gutter
      );
      expect(BREAKPOINT_CONFIGS.tablet.gutter).toBeLessThan(
        BREAKPOINT_CONFIGS.desktop.gutter
      );
    });
  });
});
