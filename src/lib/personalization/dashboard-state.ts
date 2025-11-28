/**
 * Dashboard State Management
 * Manages dashboard customizer state with undo/redo, layout persistence
 */

import { create } from 'zustand';
import { WidgetLayout, WidgetId, WidgetSettings } from './widget-registry';

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetLayout[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  isTemplate?: boolean;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

export interface HistoryState {
  past: DashboardLayout[];
  present: DashboardLayout;
  future: DashboardLayout[];
}

export interface WidgetData {
  [key: string]: any;
}

export interface WidgetDataState {
  [widgetId: string]: {
    data: WidgetData | null;
    loading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    isCached: boolean;
  };
}

interface DashboardState {
  // Current state
  currentLayout: DashboardLayout;
  allLayouts: DashboardLayout[];
  history: HistoryState;
  isDirty: boolean;
  isSaving: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  
  // Widget data state (NEW)
  widgetData: WidgetDataState;
  isLoadingAllWidgets: boolean;
  
  // Layout management
  createLayout: (name: string, description?: string) => void;
  loadLayout: (id: string) => void;
  saveLayout: () => Promise<void>;
  deleteLayout: (id: string) => void;
  renameLayout: (id: string, name: string) => void;
  
  // Widget management
  addWidget: (widgetId: WidgetId, x?: number, y?: number) => void;
  removeWidget: (widgetLayoutId: string) => void;
  updateWidgetPosition: (widgetLayoutId: string, x: number, y: number) => void;
  updateWidgetSize: (widgetLayoutId: string, w: number, h: number) => void;
  updateWidgetSettings: (widgetLayoutId: string, settings: WidgetSettings) => void;
  lockWidget: (widgetLayoutId: string) => void;
  unlockWidget: (widgetLayoutId: string) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Breakpoint management
  setBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void;
  getLayoutForBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => DashboardLayout | null;
  
  // Reset
  resetToDefault: () => void;
  loadTemplate: (templateId: string) => void;
  
  // Widget data loading (NEW)
  loadWidgetData: (widgetId: string) => Promise<WidgetData | null>;
  loadAllWidgetData: (widgetIds: string[]) => Promise<Record<string, WidgetData | null>>;
  setWidgetData: (widgetId: string, data: WidgetData, isCached?: boolean) => void;
  setWidgetError: (widgetId: string, error: Error | null) => void;
  clearWidgetCache: (widgetId?: string) => void;
  refetchWidget: (widgetId: string) => Promise<WidgetData | null>;
  getWidgetData: (widgetId: string) => WidgetData | null;
  isWidgetLoading: (widgetId: string) => boolean;
  getWidgetError: (widgetId: string) => Error | null;
}

// Helper function to generate widget layout ID
function generateWidgetLayoutId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to find next available position
function findNextWidgetPosition(widgets: WidgetLayout[]): { x: number; y: number } {
  let maxY = 0;
  let x = 0;
  
  for (const widget of widgets) {
    const widgetBottom = widget.y + widget.h;
    if (widgetBottom > maxY) {
      maxY = widgetBottom;
    }
  }
  
  // Default grid: 6 columns
  const x_pos = (widgets.length % 3) * 2;
  const y_pos = maxY;
  
  return { x: x_pos, y: y_pos };
}

// Helper function to save to history
function pushHistory(state: DashboardState): HistoryState {
  return {
    past: [...state.history.past, state.history.present],
    present: state.currentLayout,
    future: []
  };
}

// Create default layout
function createDefaultLayout(): DashboardLayout {
  return {
    id: 'default',
    name: 'Default Dashboard',
    description: 'Default dashboard layout',
    widgets: [
      {
        id: generateWidgetLayoutId(),
        widgetId: 'research-progress',
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        settings: {
          period: 'month',
          metrics: ['papers_read', 'notes_taken'],
          chartType: 'line'
        }
      },
      {
        id: generateWidgetLayoutId(),
        widgetId: 'stats',
        x: 2,
        y: 0,
        w: 2,
        h: 1,
        settings: {
          stats: ['total_papers', 'total_notes']
        }
      },
      {
        id: generateWidgetLayoutId(),
        widgetId: 'recent-papers',
        x: 0,
        y: 2,
        w: 2,
        h: 2,
        settings: {
          count: 5,
          sortBy: 'date'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  currentLayout: createDefaultLayout(),
  allLayouts: [createDefaultLayout()],
  history: {
    past: [],
    present: createDefaultLayout(),
    future: []
  },
  isDirty: false,
  isSaving: false,
  currentBreakpoint: 'desktop',
  
  // Widget data state (NEW)
  widgetData: {},
  isLoadingAllWidgets: false,
  
  // Create new layout
  createLayout: (name: string, description?: string) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      name,
      description,
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };
    
    set((state) => ({
      currentLayout: newLayout,
      allLayouts: [...state.allLayouts, newLayout],
      history: pushHistory(state),
      isDirty: false
    }));
  },
  
  // Load existing layout
  loadLayout: (id: string) => {
    const layout = get().allLayouts.find(l => l.id === id);
    if (layout) {
      set((state) => ({
        currentLayout: layout,
        history: {
          past: [...state.history.past, state.history.present],
          present: layout,
          future: []
        },
        isDirty: false
      }));
    }
  },
  
  // Save current layout
  saveLayout: async () => {
    set({ isSaving: true });
    try {
      const state = get();
      const updated = {
        ...state.currentLayout,
        updatedAt: new Date()
      };
      
      set((s) => ({
        currentLayout: updated,
        allLayouts: s.allLayouts.map(l => l.id === updated.id ? updated : l),
        isDirty: false,
        isSaving: false
      }));
      
      // TODO: Persist to API
      // await apiClient.saveDashboardLayout(updated);
    } catch (error) {
      console.error('Failed to save layout:', error);
      set({ isSaving: false });
      throw error;
    }
  },
  
  // Delete layout
  deleteLayout: (id: string) => {
    set((state) => {
      const remaining = state.allLayouts.filter(l => l.id !== id);
      const newCurrent = remaining.length > 0 ? remaining[0] : createDefaultLayout();
      
      return {
        allLayouts: remaining,
        currentLayout: newCurrent,
        isDirty: true
      };
    });
  },
  
  // Rename layout
  renameLayout: (id: string, name: string) => {
    set((state) => ({
      currentLayout: state.currentLayout.id === id 
        ? { ...state.currentLayout, name }
        : state.currentLayout,
      allLayouts: state.allLayouts.map(l => 
        l.id === id ? { ...l, name } : l
      ),
      isDirty: true
    }));
  },
  
  // Add widget to layout
  addWidget: (widgetId: WidgetId, x = 0, y = 0) => {
    set((state) => {
      const pos = x === 0 && y === 0 
        ? findNextWidgetPosition(state.currentLayout.widgets)
        : { x, y };
      
      const newWidget: WidgetLayout = {
        id: generateWidgetLayoutId(),
        widgetId,
        x: pos.x,
        y: pos.y,
        w: 2,
        h: 2,
        settings: {}
      };
      
      const updated = {
        ...state.currentLayout,
        widgets: [...state.currentLayout.widgets, newWidget],
        updatedAt: new Date()
      };
      
      return {
        currentLayout: updated,
        history: pushHistory(state),
        isDirty: true
      };
    });
  },
  
  // Remove widget
  removeWidget: (widgetLayoutId: string) => {
    set((state) => {
      const updated = {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.filter(w => w.id !== widgetLayoutId),
        updatedAt: new Date()
      };
      
      return {
        currentLayout: updated,
        history: pushHistory(state),
        isDirty: true
      };
    });
  },
  
  // Update widget position
  updateWidgetPosition: (widgetLayoutId: string, x: number, y: number) => {
    set((state) => {
      const updated = {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.map(w =>
          w.id === widgetLayoutId ? { ...w, x, y } : w
        ),
        updatedAt: new Date()
      };
      
      return {
        currentLayout: updated,
        isDirty: true
      };
    });
  },
  
  // Update widget size
  updateWidgetSize: (widgetLayoutId: string, w: number, h: number) => {
    set((state) => {
      const updated = {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.map(wl =>
          wl.id === widgetLayoutId ? { ...wl, w, h } : wl
        ),
        updatedAt: new Date()
      };
      
      return {
        currentLayout: updated,
        isDirty: true
      };
    });
  },
  
  // Update widget settings
  updateWidgetSettings: (widgetLayoutId: string, settings: WidgetSettings) => {
    set((state) => {
      const updated = {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.map(wl =>
          wl.id === widgetLayoutId ? { ...wl, settings } : wl
        ),
        updatedAt: new Date()
      };
      
      return {
        currentLayout: updated,
        history: pushHistory(state),
        isDirty: true
      };
    });
  },
  
  // Lock widget
  lockWidget: (widgetLayoutId: string) => {
    set((state) => ({
      currentLayout: {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.map(wl =>
          wl.id === widgetLayoutId ? { ...wl, locked: true } : wl
        )
      }
    }));
  },
  
  // Unlock widget
  unlockWidget: (widgetLayoutId: string) => {
    set((state) => ({
      currentLayout: {
        ...state.currentLayout,
        widgets: state.currentLayout.widgets.map(wl =>
          wl.id === widgetLayoutId ? { ...wl, locked: false } : wl
        )
      }
    }));
  },
  
  // Undo
  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;
      
      const newPast = state.history.past.slice(0, -1);
      const newPresent = state.history.past[state.history.past.length - 1];
      
      return {
        currentLayout: newPresent,
        history: {
          past: newPast,
          present: newPresent,
          future: [state.history.present, ...state.history.future]
        }
      };
    });
  },
  
  // Redo
  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;
      
      const newFuture = state.history.future.slice(1);
      const newPresent = state.history.future[0];
      
      return {
        currentLayout: newPresent,
        history: {
          past: [...state.history.past, state.history.present],
          present: newPresent,
          future: newFuture
        }
      };
    });
  },
  
  // Clear history
  clearHistory: () => {
    set((state) => ({
      history: {
        past: [],
        present: state.currentLayout,
        future: []
      }
    }));
  },
  
  // Set breakpoint
  setBreakpoint: (breakpoint) => {
    set({ currentBreakpoint: breakpoint });
  },
  
  // Get layout for breakpoint
  getLayoutForBreakpoint: (breakpoint) => {
    return get().allLayouts.find(l => l.breakpoint === breakpoint) || null;
  },
  
  // Reset to default
  resetToDefault: () => {
    set((state) => {
      const defaultLayout = createDefaultLayout();
      return {
        currentLayout: defaultLayout,
        history: {
          past: [...state.history.past, state.history.present],
          present: defaultLayout,
          future: []
        },
        isDirty: false
      };
    });
  },
  
  // Load template
  loadTemplate: (templateId: string) => {
    // TODO: Implement template loading
    const state = get();
    state.loadLayout(templateId);
  },
  
  // Widget data loading methods (NEW)
  loadWidgetData: async (widgetId: string) => {
    try {
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            data: state.widgetData[widgetId]?.data || null,
            loading: true,
            error: null,
            lastUpdated: state.widgetData[widgetId]?.lastUpdated || null,
            isCached: state.widgetData[widgetId]?.isCached || false
          }
        }
      }));

      // Create timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Widget ${widgetId} load timeout`)), 15000); // 15 second timeout (increased for network reliability)
      });

      // Create fetch promise
      const fetchPromise = (async () => {
        const response = await fetch(`/api/dashboard/widgets/${widgetId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch widget data: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      })();

      // Race with timeout
      const { data, cached } = await Promise.race([fetchPromise, timeoutPromise]);

      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            data,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isCached: cached || false
          }
        }
      }));

      return data;
    } catch (error) {
      console.error(`Error loading widget ${widgetId}:`, error);
      const err = error instanceof Error ? error : new Error(String(error));
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            data: state.widgetData[widgetId]?.data || null,
            loading: false,
            error: err,
            lastUpdated: state.widgetData[widgetId]?.lastUpdated || null,
            isCached: state.widgetData[widgetId]?.isCached || false
          }
        }
      }));
      return null;
    }
  },

  loadAllWidgetData: async (widgetIds: string[]) => {
    set({ isLoadingAllWidgets: true });

    try {
      // Initialize all widgets as loading
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          ...Object.fromEntries(
            widgetIds.map((id) => [
              id,
              {
                data: state.widgetData[id]?.data || null,
                loading: true,
                error: null,
                lastUpdated: state.widgetData[id]?.lastUpdated || null,
                isCached: state.widgetData[id]?.isCached || false
              }
            ])
          )
        }
      }));

      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Dashboard widgets load timeout')), 15000); // 15 second timeout
      });

      // Create the fetch promise
      const fetchPromise = (async () => {
        const response = await fetch('/api/dashboard/widgets/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgetIds, forceRefresh: false })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch widget data: ${response.statusText}`);
        }

        const { results, errors } = await response.json();
        return { results, errors };
      })();

      // Race the fetch with timeout
      const { results, errors } = await Promise.race([fetchPromise, timeoutPromise]);

      // Update widget data with results
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          ...Object.fromEntries(
            widgetIds.map((id) => [
              id,
              {
                data: results[id] || null,
                loading: false,
                error: errors[id] ? new Error(errors[id]) : null,
                lastUpdated: results[id] ? new Date() : null,
                isCached: false
              }
            ])
          )
        },
        isLoadingAllWidgets: false
      }));

      return results;
    } catch (error) {
      console.error('Error loading dashboard widgets:', error);
      const err = error instanceof Error ? error : new Error(String(error));

      // Set all widgets to error state and stop loading
      set((state) => ({
        widgetData: Object.fromEntries(
          widgetIds.map((id) => [
            id,
            {
              data: state.widgetData[id]?.data || null,
              loading: false,
              error: err,
              lastUpdated: state.widgetData[id]?.lastUpdated || null,
              isCached: state.widgetData[id]?.isCached || false
            }
          ])
        ),
        isLoadingAllWidgets: false
      }));
      return {};
    }
  },

  setWidgetData: (widgetId: string, data: WidgetData, isCached = false) => {
    set((state) => ({
      widgetData: {
        ...state.widgetData,
        [widgetId]: {
          data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          isCached
        }
      }
    }));
  },

  setWidgetError: (widgetId: string, error: Error | null) => {
    set((state) => ({
      widgetData: {
        ...state.widgetData,
        [widgetId]: {
          ...state.widgetData[widgetId],
          error,
          loading: false
        }
      }
    }));
  },

  clearWidgetCache: (widgetId?: string) => {
    set((state) => {
      if (widgetId) {
        return {
          widgetData: {
            ...state.widgetData,
            [widgetId]: {
              ...state.widgetData[widgetId],
              data: null,
              isCached: false
            }
          }
        };
      }
      
      // Clear all widget cache
      return {
        widgetData: Object.fromEntries(
          Object.entries(state.widgetData).map(([id, state]) => [
            id,
            {
              ...state,
              data: null,
              isCached: false
            }
          ])
        )
      };
    });
  },

  refetchWidget: async (widgetId: string) => {
    try {
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            ...state.widgetData[widgetId],
            loading: true
          }
        }
      }));

      const response = await fetch(`/api/dashboard/widgets/${widgetId}?forceRefresh=true`);
      if (!response.ok) {
        throw new Error(`Failed to refetch widget: ${response.statusText}`);
      }

      const { data } = await response.json();

      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            data,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            isCached: false
          }
        }
      }));

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: {
            ...state.widgetData[widgetId],
            loading: false,
            error: err
          }
        }
      }));
      return null;
    }
  },

  getWidgetData: (widgetId: string) => {
    const state = get();
    return state.widgetData[widgetId]?.data || null;
  },

  isWidgetLoading: (widgetId: string) => {
    const state = get();
    return state.widgetData[widgetId]?.loading || false;
  },

  getWidgetError: (widgetId: string) => {
    const state = get();
    return state.widgetData[widgetId]?.error || null;
  }
}));

// Export hook for easier usage
export function useDashboardLayout() {
  return useDashboardStore();
}

export function useDashboardHistory() {
  return useDashboardStore((state) => ({
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    undo: state.undo,
    redo: state.redo
  }));
}

export function useDashboardSave() {
  return useDashboardStore((state) => ({
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    saveLayout: state.saveLayout
  }));
}

// Widget data hooks (NEW)
export function useWidgetData(widgetId: string) {
  return useDashboardStore((state) => ({
    data: state.getWidgetData(widgetId),
    loading: state.isWidgetLoading(widgetId),
    error: state.getWidgetError(widgetId),
    lastUpdated: state.widgetData[widgetId]?.lastUpdated || null,
    isCached: state.widgetData[widgetId]?.isCached || false,
    refetch: () => state.refetchWidget(widgetId)
  }));
}

export function useWidgetsData(widgetIds: string[]) {
  return useDashboardStore((state) => ({
    data: Object.fromEntries(
      widgetIds.map((id) => [id, state.getWidgetData(id)])
    ),
    loading: state.isLoadingAllWidgets || widgetIds.some(id => state.isWidgetLoading(id)),
    errors: Object.fromEntries(
      widgetIds.map((id) => [id, state.getWidgetError(id)])
    ),
    loadAll: () => state.loadAllWidgetData(widgetIds)
  }));
}

export function useWidgetDataState(widgetId: string) {
  return useDashboardStore((state) => state.widgetData[widgetId] || {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    isCached: false
  });
}
