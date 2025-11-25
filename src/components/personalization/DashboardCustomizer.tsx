/**
 * Dashboard Customizer Canvas
 * Grid-based drag-and-drop canvas for dashboard layout customization
 * Supports widget positioning, resizing, and management
 */

'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { getWidget } from '@/lib/personalization/widget-registry';
import { useDebounce, useThrottle } from '@/lib/performance/event-delegation';
import { useCleanup } from '@/lib/performance/cleanup-manager';
import styles from './styles/dashboard-customizer.module.css';

interface DragState {
  isResizing: boolean;
  isDragging: boolean;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  currentWidgetId: string | null;
}

const GRID_SIZE = 16;
const GRID_COLUMNS = 6;
const CELL_HEIGHT = 80; // pixels per grid unit

export const DashboardCustomizer: React.FC<{
  onOpenSettings?: (widgetLayoutId: string) => void;
}> = ({ onOpenSettings }) => {
  const {
    currentLayout,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    undo,
    redo,
    saveLayout,
    resetToDefault,
  } = useDashboardStore();

  const [dragState, setDragState] = useState<DragState>({
    isResizing: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    currentWidgetId: null,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanup = useCleanup();

  // Calculate grid position from pixel coordinates
  const pixelsToGrid = useCallback((px: number, isHeight = false) => {
    const cellSize = CELL_HEIGHT;
    return Math.round(px / cellSize);
  }, []);

  const gridToPixels = useCallback((grid: number, isHeight = false) => {
    return grid * CELL_HEIGHT;
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (previewMode) return;
    
    const target = (e.currentTarget as HTMLElement).querySelector('[data-drag-handle]');
    if (!target?.contains(e.target as Node)) return;

    e.preventDefault();
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      currentWidgetId: widgetId,
      startX: e.clientX,
      startY: e.clientY,
    }));
  }, [previewMode]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (previewMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    const widget = currentLayout.widgets.find((w: any) => w.id === widgetId);
    if (!widget) return;

    setDragState((prev) => ({
      ...prev,
      isResizing: true,
      currentWidgetId: widgetId,
      startX: e.clientX,
      startY: e.clientY,
      startW: widget.w,
      startH: widget.h,
    }));
  }, [currentLayout, previewMode]);

  // Throttled mouse move handler
  const handleMouseMove = useThrottle(
    useCallback(
      (e: MouseEvent) => {
        if (!dragState.currentWidgetId) return;

        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;

        if (dragState.isDragging) {
          const gridX = pixelsToGrid(dragState.startX + deltaX);
          const gridY = pixelsToGrid(dragState.startY + deltaY);

          updateWidgetPosition(
            dragState.currentWidgetId,
            Math.max(0, gridX),
            Math.max(0, gridY)
          );
        } else if (dragState.isResizing) {
          const widget = currentLayout.widgets.find(
            (w: any) => w.id === dragState.currentWidgetId
          );
          if (!widget) return;

          const gridW = Math.max(1, dragState.startW + pixelsToGrid(deltaX));
          const gridH = Math.max(1, dragState.startH + pixelsToGrid(deltaY));

          // Respect widget constraints
          const widgetDef = getWidget(widget.widgetId);
          if (widgetDef) {
            const constrainedW = Math.min(
              Math.max(gridW, widgetDef.minSize.width),
              widgetDef.maxSize.width
            );
            const constrainedH = Math.min(
              Math.max(gridH, widgetDef.minSize.height),
              widgetDef.maxSize.height
            );

            updateWidgetSize(dragState.currentWidgetId, constrainedW, constrainedH);
          }
        }
      },
      [dragState, currentLayout, pixelsToGrid, updateWidgetPosition, updateWidgetSize]
    ),
    16 // throttle to ~60fps
  );

  // Throttled mouse up handler
  const handleMouseUp = useThrottle(
    useCallback(() => {
      setDragState((prev) => ({
        ...prev,
        isDragging: false,
        isResizing: false,
        currentWidgetId: null,
      }));
    }, []),
    16
  );

  // Setup event listeners
  useEffect(() => {
    if (!dragState.isDragging && !dragState.isResizing) {
      return;
    }

    // Note: These manual subscriptions should be removed since we're using cleanup manager below
    // document.addEventListener('mousemove', handleMouseMove as EventListener);
    // document.addEventListener('mouseup', handleMouseUp as EventListener);

    cleanup.addEventListener(document, 'mousemove', handleMouseMove as EventListener);
    cleanup.addEventListener(document, 'mouseup', handleMouseUp as EventListener);

    // Return cleanup function for effect
    return () => {
      // Cleanup handled by cleanup manager
    };
  }, [dragState, handleMouseMove, handleMouseUp, cleanup]);

  // Calculate container height
  const maxY = Math.max(
    0,
    ...currentLayout.widgets.map((w: any) => w.y + w.h)
  );
  const containerHeight = gridToPixels(maxY + 2);

  return (
    <div className={styles.customizer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2>{currentLayout.name}</h2>
        </div>

        <div className={styles.toolbarRight}>
          <button
            className={styles.btn}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>

          <button
            className={styles.btn}
            onClick={redo}
            title="Redo (Ctrl+Y)"
          >
            Redo ↷
          </button>

          <div className={styles.separator} />

          <button
            className={`${styles.btn} ${previewMode ? styles.active : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
            title="Toggle preview mode"
          >
            {previewMode ? '✎ Edit' : '👁 Preview'}
          </button>

          <button
            className={styles.btn}
            onClick={() => saveLayout()}
            title="Save layout"
          >
            💾 Save
          </button>

          <button
            className={`${styles.btn} ${styles.danger}`}
            onClick={() => {
              if (confirm('Reset to default layout?')) {
                resetToDefault();
              }
            }}
            title="Reset to default"
          >
            ⟲ Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className={`${styles.canvas} ${previewMode ? styles.previewMode : ''}`}
        ref={containerRef}
        style={{ minHeight: containerHeight }}
      >
        {/* Grid background */}
        {!previewMode && (
          <div
            className={styles.gridBackground}
            style={{
              backgroundSize: `${CELL_HEIGHT}px ${CELL_HEIGHT}px`,
            }}
          />
        )}

        {/* Widgets */}
        <div className={styles.widgetsContainer}>
          {currentLayout.widgets.map((widgetLayout: any) => {
            const widget = getWidget(widgetLayout.widgetId);
            if (!widget) return null;

            const x = gridToPixels(widgetLayout.x);
            const y = gridToPixels(widgetLayout.y);
            const w = gridToPixels(widgetLayout.w);
            const h = gridToPixels(widgetLayout.h);

            return (
              <div
                key={widgetLayout.id}
                className={`${styles.widgetWrapper} ${widgetLayout.locked ? styles.locked : ''}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  cursor: dragState.isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleDragStart(e, widgetLayout.id)}
              >
                {/* Widget header with drag handle */}
                {!previewMode && (
                  <div className={styles.widgetHeader} data-drag-handle>
                    <div className={styles.widgetTitle}>
                      <span>{widget.icon}</span>
                      <span>{widget.name}</span>
                    </div>

                    <div className={styles.widgetControls}>
                      {widget.configurable && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => onOpenSettings?.(widgetLayout.id)}
                          title="Settings"
                        >
                          ⚙️
                        </button>
                      )}

                      {widget.removable && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => removeWidget(widgetLayout.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Widget content */}
                <div className={styles.widgetContent}>
                  <widget.previewComponent settings={widgetLayout.settings} />
                </div>

                {/* Resize handle */}
                {!previewMode && widget.resizable && (
                  <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeStart(e, widgetLayout.id)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {currentLayout.widgets.length === 0 && (
          <div className={styles.emptyState}>
            <p>No widgets added yet</p>
            <p className={styles.hint}>Open the widget gallery to add widgets</p>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className={styles.infoBar}>
        <span>Widgets: {currentLayout.widgets.length}</span>
        <span>Grid: {GRID_COLUMNS} columns × auto rows</span>
        <span>{previewMode ? 'Preview Mode' : 'Edit Mode'}</span>
      </div>
    </div>
  );
};

export default DashboardCustomizer;
