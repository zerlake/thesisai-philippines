/**
 * Responsive Layout System
 * Handles breakpoint calculations, layout reflowing, and mobile optimization
 */

import { WidgetLayout } from './widget-registry';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointConfig {
  name: Breakpoint;
  minWidth: number;
  maxWidth: number;
  columns: number;
  gutter: number;
  cellHeight: number;
}

/**
 * Breakpoint configurations
 */
export const BREAKPOINT_CONFIGS: Record<Breakpoint, BreakpointConfig> = {
  mobile: {
    name: 'mobile',
    minWidth: 320,
    maxWidth: 480,
    columns: 2,
    gutter: 8,
    cellHeight: 60,
  },
  tablet: {
    name: 'tablet',
    minWidth: 481,
    maxWidth: 1024,
    columns: 4,
    gutter: 12,
    cellHeight: 70,
  },
  desktop: {
    name: 'desktop',
    minWidth: 1025,
    maxWidth: Infinity,
    columns: 6,
    gutter: 16,
    cellHeight: 80,
  },
};

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width?: number): Breakpoint {
  const w = width || (typeof window !== 'undefined' ? window.innerWidth : 1200);

  if (w <= BREAKPOINT_CONFIGS.mobile.maxWidth) return 'mobile';
  if (w <= BREAKPOINT_CONFIGS.tablet.maxWidth) return 'tablet';
  return 'desktop';
}

/**
 * Get breakpoint config for a given breakpoint
 */
export function getBreakpointConfig(breakpoint: Breakpoint): BreakpointConfig {
  return BREAKPOINT_CONFIGS[breakpoint];
}

/**
 * Calculate grid dimensions for a given breakpoint
 */
export function getGridDimensions(
  breakpoint: Breakpoint,
  containerWidth: number
) {
  const config = getBreakpointConfig(breakpoint);
  const availableWidth = containerWidth - (config.columns - 1) * config.gutter;
  const cellWidth = availableWidth / config.columns;

  return {
    cellWidth,
    cellHeight: config.cellHeight,
    columns: config.columns,
    gutter: config.gutter,
    totalWidth: containerWidth,
  };
}

/**
 * Reflow widget layout for a new breakpoint
 * Intelligently adjusts positions and sizes
 */
export function reflowWidgetLayout(
  widgets: WidgetLayout[],
  fromBreakpoint: Breakpoint,
  toBreakpoint: Breakpoint
): WidgetLayout[] {
  const fromConfig = getBreakpointConfig(fromBreakpoint);
  const toConfig = getBreakpointConfig(toBreakpoint);

  // Scale factor between breakpoints
  const columnScale = toConfig.columns / fromConfig.columns;

  return widgets.map((widget) => {
    // Adjust position and size based on column scaling
    const newX = Math.min(
      Math.round(widget.x * columnScale),
      Math.max(0, toConfig.columns - 1)
    );
    const newW = Math.min(
      Math.round(widget.w * columnScale),
      toConfig.columns - newX
    );

    // On mobile, normalize to full-width if larger than 1 column
    if (toBreakpoint === 'mobile' && newW > 1) {
      return {
        ...widget,
        x: 0,
        w: 1,
      };
    }

    return {
      ...widget,
      x: newX,
      w: newW === 0 ? 1 : newW,
    };
  });
}

/**
 * Stack widgets vertically (for mobile layout)
 */
export function stackWidgetsVertically(
  widgets: WidgetLayout[],
  maxColumns: number = 2
): WidgetLayout[] {
  const sorted = [...widgets].sort((a, b) => a.y - b.y || a.x - b.x);

  let currentY = 0;
  let currentX = 0;
  let maxHeightInRow = 0;

  return sorted.map((widget) => {
    // If widget doesn't fit in current row, move to next row
    if (currentX + widget.w > maxColumns) {
      currentX = 0;
      currentY += maxHeightInRow;
      maxHeightInRow = 0;
    }

    const reflowed = {
      ...widget,
      x: currentX,
      y: currentY,
    };

    currentX += widget.w;
    maxHeightInRow = Math.max(maxHeightInRow, widget.h);

    return reflowed;
  });
}

/**
 * Detect if layout needs reflow (e.g., overlapping widgets)
 */
export function detectLayoutIssues(widgets: WidgetLayout[]): string[] {
  const issues: string[] = [];

  // Check for overlapping widgets
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      const a = widgets[i];
      const b = widgets[j];

      if (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      ) {
        issues.push(`Widgets ${a.id} and ${b.id} overlap`);
      }
    }
  }

  return issues;
}

/**
 * Auto-fix layout by resolving overlaps
 */
export function autoFixLayout(
  widgets: WidgetLayout[],
  maxColumns: number = 6
): WidgetLayout[] {
  const sorted = [...widgets].sort((a, b) => a.y - b.y || a.x - b.x);
  const fixed: WidgetLayout[] = [];

  for (const widget of sorted) {
    let x = widget.x;
    let y = widget.y;
    let placed = false;

    // Try to place widget at original position
    while (!placed) {
      let hasCollision = false;

      // Check for collisions with already placed widgets
      for (const placed of fixed) {
        if (
          x < placed.x + placed.w &&
          x + widget.w > placed.x &&
          y < placed.y + placed.h &&
          y + widget.h > placed.y
        ) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision && x + widget.w <= maxColumns) {
        // No collision, place widget here
        fixed.push({ ...widget, x, y });
        placed = true;
      } else if (x + widget.w <= maxColumns) {
        // Try next x position
        x++;
      } else {
        // Move to next row
        x = 0;
        y++;
      }
    }
  }

  return fixed;
}

/**
 * Calculate total height of layout
 */
export function calculateLayoutHeight(
  widgets: WidgetLayout[],
  cellHeight: number
): number {
  if (widgets.length === 0) return 0;

  const maxY = Math.max(...widgets.map((w) => w.y + w.h));
  return maxY * cellHeight;
}

/**
 * Validate widget position is within bounds
 */
export function isValidPosition(
  widget: WidgetLayout,
  maxColumns: number,
  config: BreakpointConfig
): boolean {
  return (
    widget.x >= 0 &&
    widget.x + widget.w <= maxColumns &&
    widget.y >= 0 &&
    widget.w > 0 &&
    widget.h > 0 &&
    widget.w <= config.columns &&
    widget.h <= 10 // reasonable max height
  );
}

/**
 * Hook for responsive breakpoint detection
 */
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>(() =>
    getCurrentBreakpoint()
  );

  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Import React for hook
import React from 'react';
