/**
 * Dashboard State Unit Tests
 * Tests for Zustand store managing dashboard layout and widget data
 * Coverage: 30+ test cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDashboardStore,
  useWidgetData,
  useWidgetsData,
  useDashboardLayout,
  useDashboardHistory,
  useDashboardSave,
  useWidgetDataState,
} from '@/lib/personalization/dashboard-state';

// Mock the fetch API
global.fetch = vi.fn();

describe('Dashboard State - Store Initialization', () => {
  beforeEach(() => {
    // Reset store state
    const store = useDashboardStore.getState();
    useDashboardStore.setState({
      currentLayout: store.currentLayout,
      allLayouts: store.allLayouts,
      history: { past: [], present: store.currentLayout, future: [] },
      isDirty: false,
      isSaving: false,
      currentBreakpoint: 'desktop',
      widgetData: {},
      isLoadingAllWidgets: false,
    });
    vi.clearAllMocks();
  });

  it('should initialize with default layout', () => {
    const store = useDashboardStore.getState();
    expect(store.currentLayout).toBeDefined();
    expect(store.currentLayout.name).toBe('Default Dashboard');
    expect(store.currentLayout.widgets.length).toBeGreaterThan(0);
  });

  it('should have default widget layout properties', () => {
    const store = useDashboardStore.getState();
    const firstWidget = store.currentLayout.widgets[0];
    expect(firstWidget).toHaveProperty('id');
    expect(firstWidget).toHaveProperty('widgetId');
    expect(firstWidget).toHaveProperty('x');
    expect(firstWidget).toHaveProperty('y');
    expect(firstWidget).toHaveProperty('w');
    expect(firstWidget).toHaveProperty('h');
    expect(firstWidget).toHaveProperty('settings');
  });

  it('should start with empty widget data state', () => {
    const store = useDashboardStore.getState();
    expect(store.widgetData).toEqual({});
  });

  it('should start with isLoadingAllWidgets as false', () => {
    const store = useDashboardStore.getState();
    expect(store.isLoadingAllWidgets).toBe(false);
  });
});

describe('Dashboard State - Layout Management', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      currentLayout: useDashboardStore.getState().currentLayout,
      allLayouts: [useDashboardStore.getState().currentLayout],
      isDirty: false,
      isSaving: false,
      history: { past: [], present: useDashboardStore.getState().currentLayout, future: [] },
    });
    vi.clearAllMocks();
  });

  it('should create a new layout', () => {
    const store = useDashboardStore.getState();
    const initialLayoutCount = store.allLayouts.length;
    
    act(() => {
      store.createLayout('New Layout', 'Test layout');
    });

    const updatedStore = useDashboardStore.getState();
    expect(updatedStore.allLayouts.length).toBe(initialLayoutCount + 1);
    expect(updatedStore.currentLayout.name).toBe('New Layout');
    expect(updatedStore.currentLayout.description).toBe('Test layout');
  });

  it('should load an existing layout', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.createLayout('Layout to Load');
    });
    
    const layoutId = useDashboardStore.getState().currentLayout.id;
    
    act(() => {
      store.createLayout('Another Layout');
    });
    
    act(() => {
      store.loadLayout(layoutId);
    });

    expect(useDashboardStore.getState().currentLayout.id).toBe(layoutId);
  });

  it('should rename a layout', () => {
    const store = useDashboardStore.getState();
    const layoutId = store.currentLayout.id;
    
    act(() => {
      store.renameLayout(layoutId, 'Renamed Layout');
    });

    const updated = useDashboardStore.getState();
    const renamedLayout = updated.allLayouts.find(l => l.id === layoutId);
    expect(renamedLayout?.name).toBe('Renamed Layout');
  });

  it('should delete a layout', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.createLayout('Layout to Delete');
    });

    const layoutToDeleteId = useDashboardStore.getState().currentLayout.id;
    const totalBeforeDelete = useDashboardStore.getState().allLayouts.length;

    act(() => {
      store.deleteLayout(layoutToDeleteId);
    });

    const updated = useDashboardStore.getState();
    expect(updated.allLayouts.length).toBe(totalBeforeDelete - 1);
    expect(updated.allLayouts.find(l => l.id === layoutToDeleteId)).toBeUndefined();
  });
});

describe('Dashboard State - Widget Management', () => {
  beforeEach(() => {
    const defaultLayout = useDashboardStore.getState().currentLayout;
    useDashboardStore.setState({
      currentLayout: defaultLayout,
      allLayouts: [defaultLayout],
      isDirty: false,
      history: { past: [], present: defaultLayout, future: [] },
    });
    vi.clearAllMocks();
  });

  it('should add a widget to layout', () => {
    const store = useDashboardStore.getState();
    const initialCount = store.currentLayout.widgets.length;

    act(() => {
      store.addWidget('test-widget', 0, 0);
    });

    const updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBe(initialCount + 1);
    const newWidget = updated.currentLayout.widgets[updated.currentLayout.widgets.length - 1];
    expect(newWidget.widgetId).toBe('test-widget');
  });

  it('should auto-position widget when coordinates not provided', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.addWidget('auto-positioned-widget');
    });

    const widget = useDashboardStore.getState().currentLayout.widgets.find(
      w => w.widgetId === 'auto-positioned-widget'
    );
    expect(widget?.x).toBeGreaterThanOrEqual(0);
    expect(widget?.y).toBeGreaterThanOrEqual(0);
  });

  it('should remove a widget from layout', () => {
    const store = useDashboardStore.getState();
    const widgetToRemove = store.currentLayout.widgets[0];
    const initialCount = store.currentLayout.widgets.length;

    act(() => {
      store.removeWidget(widgetToRemove.id);
    });

    const updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBe(initialCount - 1);
    expect(updated.currentLayout.widgets.find(w => w.id === widgetToRemove.id)).toBeUndefined();
  });

  it('should update widget position', () => {
    const store = useDashboardStore.getState();
    const widget = store.currentLayout.widgets[0];

    act(() => {
      store.updateWidgetPosition(widget.id, 5, 10);
    });

    const updated = useDashboardStore.getState();
    const updatedWidget = updated.currentLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.x).toBe(5);
    expect(updatedWidget?.y).toBe(10);
  });

  it('should update widget size', () => {
    const store = useDashboardStore.getState();
    const widget = store.currentLayout.widgets[0];

    act(() => {
      store.updateWidgetSize(widget.id, 3, 4);
    });

    const updated = useDashboardStore.getState();
    const updatedWidget = updated.currentLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.w).toBe(3);
    expect(updatedWidget?.h).toBe(4);
  });

  it('should update widget settings', () => {
    const store = useDashboardStore.getState();
    const widget = store.currentLayout.widgets[0];
    const newSettings = { period: 'week', metrics: ['test'] };

    act(() => {
      store.updateWidgetSettings(widget.id, newSettings);
    });

    const updated = useDashboardStore.getState();
    const updatedWidget = updated.currentLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.settings).toEqual(newSettings);
  });

  it('should lock and unlock widgets', () => {
    const store = useDashboardStore.getState();
    const widget = store.currentLayout.widgets[0];

    act(() => {
      store.lockWidget(widget.id);
    });

    let updated = useDashboardStore.getState();
    let updatedWidget = updated.currentLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.locked).toBe(true);

    act(() => {
      store.unlockWidget(widget.id);
    });

    updated = useDashboardStore.getState();
    updatedWidget = updated.currentLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.locked).toBe(false);
  });
});

describe('Dashboard State - History Management', () => {
  beforeEach(() => {
    const defaultLayout = useDashboardStore.getState().currentLayout;
    useDashboardStore.setState({
      currentLayout: defaultLayout,
      allLayouts: [defaultLayout],
      isDirty: false,
      history: { past: [], present: defaultLayout, future: [] },
    });
    vi.clearAllMocks();
  });

  it('should track history when adding widgets', () => {
    const store = useDashboardStore.getState();
    const initialHistoryLength = store.history.past.length;

    act(() => {
      store.addWidget('test-widget-1');
    });

    const updated = useDashboardStore.getState();
    expect(updated.history.past.length).toBeGreaterThan(initialHistoryLength);
  });

  it('should undo layout changes', () => {
    const store = useDashboardStore.getState();
    const initialLayout = { ...store.currentLayout };

    act(() => {
      store.addWidget('test-widget');
    });

    let updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBe(initialLayout.widgets.length + 1);

    act(() => {
      store.undo();
    });

    updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBe(initialLayout.widgets.length);
  });

  it('should redo layout changes', () => {
    const store = useDashboardStore.getState();

    act(() => {
      store.addWidget('test-widget');
    });

    let updated = useDashboardStore.getState();
    const layoutAfterAdd = updated.currentLayout.widgets.length;

    act(() => {
      store.undo();
    });

    updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBeLessThan(layoutAfterAdd);

    act(() => {
      store.redo();
    });

    updated = useDashboardStore.getState();
    expect(updated.currentLayout.widgets.length).toBe(layoutAfterAdd);
  });

  it('should check if undo is available', () => {
    const store = useDashboardStore.getState();
    expect(store.history.past.length).toBe(0);

    act(() => {
      store.addWidget('test');
    });

    const updated = useDashboardStore.getState();
    expect(updated.history.past.length).toBeGreaterThan(0);
  });

  it('should clear history', () => {
    const store = useDashboardStore.getState();

    act(() => {
      store.addWidget('test');
    });

    let updated = useDashboardStore.getState();
    expect(updated.history.past.length).toBeGreaterThan(0);

    act(() => {
      store.clearHistory();
    });

    updated = useDashboardStore.getState();
    expect(updated.history.past.length).toBe(0);
    expect(updated.history.future.length).toBe(0);
  });
});

describe('Dashboard State - Breakpoint Management', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      currentBreakpoint: 'desktop',
      isLoadingAllWidgets: false,
    });
    vi.clearAllMocks();
  });

  it('should set breakpoint', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setBreakpoint('mobile');
    });

    expect(useDashboardStore.getState().currentBreakpoint).toBe('mobile');
  });

  it('should get layout for breakpoint', () => {
    const store = useDashboardStore.getState();
    const layout = store.getLayoutForBreakpoint('desktop');
    // Should return null if no layout for that breakpoint
    expect(layout === null || layout?.breakpoint === 'desktop').toBe(true);
  });
});

describe('Dashboard State - Widget Data Loading', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      widgetData: {},
      isLoadingAllWidgets: false,
    });
    vi.clearAllMocks();
  });

  it('should load single widget data', async () => {
    const mockData = { papers: 42, notes: 100 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData, cached: false }),
    } as Response);

    const store = useDashboardStore.getState();
    const result = await store.loadWidgetData('research-progress');

    await waitFor(() => {
      const updated = useDashboardStore.getState();
      expect(updated.widgetData['research-progress']?.data).toEqual(mockData);
      expect(updated.widgetData['research-progress']?.loading).toBe(false);
      expect(updated.widgetData['research-progress']?.error).toBeNull();
    });
  });

  it('should handle widget data load errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    const store = useDashboardStore.getState();
    const result = await store.loadWidgetData('non-existent');

    await waitFor(() => {
      const updated = useDashboardStore.getState();
      expect(updated.widgetData['non-existent']?.error).toBeDefined();
      expect(updated.widgetData['non-existent']?.loading).toBe(false);
    });
  });

  it('should load multiple widget data in batch', async () => {
    const mockResults = {
      'research-progress': { papers: 42 },
      'quick-stats': { total: 100 },
    };
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults, errors: {} }),
    } as Response);

    const store = useDashboardStore.getState();
    const results = await store.loadAllWidgetData(['research-progress', 'quick-stats']);

    await waitFor(() => {
      const updated = useDashboardStore.getState();
      expect(updated.isLoadingAllWidgets).toBe(false);
      expect(updated.widgetData['research-progress']?.data).toEqual(mockResults['research-progress']);
      expect(updated.widgetData['quick-stats']?.data).toEqual(mockResults['quick-stats']);
    });
  });

  it('should set widget data directly', () => {
    const store = useDashboardStore.getState();
    const mockData = { value: 42 };

    act(() => {
      store.setWidgetData('test-widget', mockData, true);
    });

    const updated = useDashboardStore.getState();
    expect(updated.widgetData['test-widget']?.data).toEqual(mockData);
    expect(updated.widgetData['test-widget']?.isCached).toBe(true);
    expect(updated.widgetData['test-widget']?.error).toBeNull();
  });

  it('should set widget error', () => {
    const store = useDashboardStore.getState();
    const error = new Error('Test error');

    act(() => {
      store.setWidgetError('test-widget', error);
    });

    const updated = useDashboardStore.getState();
    expect(updated.widgetData['test-widget']?.error).toEqual(error);
  });

  it('should clear widget cache for single widget', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setWidgetData('test-widget', { value: 42 });
    });

    act(() => {
      store.clearWidgetCache('test-widget');
    });

    const updated = useDashboardStore.getState();
    expect(updated.widgetData['test-widget']?.data).toBeNull();
    expect(updated.widgetData['test-widget']?.isCached).toBe(false);
  });

  it('should clear all widget cache', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setWidgetData('widget-1', { value: 1 });
      store.setWidgetData('widget-2', { value: 2 });
    });

    act(() => {
      store.clearWidgetCache();
    });

    const updated = useDashboardStore.getState();
    Object.values(updated.widgetData).forEach(state => {
      expect(state?.data).toBeNull();
      expect(state?.isCached).toBe(false);
    });
  });

  it('should refetch widget data', async () => {
    const mockData = { papers: 50 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const store = useDashboardStore.getState();
    const result = await store.refetchWidget('research-progress');

    await waitFor(() => {
      const updated = useDashboardStore.getState();
      expect(updated.widgetData['research-progress']?.data).toEqual(mockData);
      expect(updated.widgetData['research-progress']?.isCached).toBe(false);
    });
  });

  it('should get widget data', () => {
    const store = useDashboardStore.getState();
    const mockData = { value: 42 };

    act(() => {
      store.setWidgetData('test-widget', mockData);
    });

    const result = useDashboardStore.getState().getWidgetData('test-widget');
    expect(result).toEqual(mockData);
  });

  it('should check if widget is loading', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setWidgetData('test-widget', { value: 42 });
    });

    const isLoading = useDashboardStore.getState().isWidgetLoading('test-widget');
    expect(isLoading).toBe(false);
  });

  it('should get widget error', () => {
    const store = useDashboardStore.getState();
    const error = new Error('Test error');

    act(() => {
      store.setWidgetError('test-widget', error);
    });

    const result = useDashboardStore.getState().getWidgetError('test-widget');
    expect(result).toEqual(error);
  });
});

describe('Dashboard State - Custom Hooks', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      currentLayout: useDashboardStore.getState().currentLayout,
      allLayouts: useDashboardStore.getState().allLayouts,
      isDirty: false,
      isSaving: false,
      widgetData: {},
    });
    vi.clearAllMocks();
  });

  it('useWidgetData hook should return widget data state', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setWidgetData('test-widget', { value: 42 }, true);
    });

    const { result } = renderHook(() => useWidgetData('test-widget'));
    expect(result.current.data).toEqual({ value: 42 });
    expect(result.current.isCached).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('useWidgetsData hook should return multiple widget states', () => {
    const store = useDashboardStore.getState();
    act(() => {
      store.setWidgetData('widget-1', { value: 1 });
      store.setWidgetData('widget-2', { value: 2 });
    });

    const { result } = renderHook(() => useWidgetsData(['widget-1', 'widget-2']));
    expect(result.current.data['widget-1']).toEqual({ value: 1 });
    expect(result.current.data['widget-2']).toEqual({ value: 2 });
  });

  it('useDashboardLayout hook should return layout state', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.currentLayout).toBeDefined();
    expect(result.current.addWidget).toBeDefined();
  });

  it('useDashboardHistory hook should return history state', () => {
    const { result } = renderHook(() => useDashboardHistory());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(typeof result.current.undo).toBe('function');
  });

  it('useDashboardSave hook should return save state', () => {
    const { result } = renderHook(() => useDashboardSave());
    expect(typeof result.current.isDirty).toBe('boolean');
    expect(typeof result.current.isSaving).toBe('boolean');
    expect(typeof result.current.saveLayout).toBe('function');
  });
});

describe('Dashboard State - Integration', () => {
  beforeEach(() => {
    const defaultLayout = useDashboardStore.getState().currentLayout;
    useDashboardStore.setState({
      currentLayout: defaultLayout,
      allLayouts: [defaultLayout],
      isDirty: false,
      isSaving: false,
      history: { past: [], present: defaultLayout, future: [] },
      widgetData: {},
    });
    vi.clearAllMocks();
  });

  it('should reset to default layout', () => {
    const store = useDashboardStore.getState();
    const defaultId = store.currentLayout.id;

    act(() => {
      store.createLayout('Custom Layout');
    });

    let updated = useDashboardStore.getState();
    expect(updated.currentLayout.id).not.toBe(defaultId);

    act(() => {
      store.resetToDefault();
    });

    updated = useDashboardStore.getState();
    expect(updated.isDirty).toBe(false);
  });

  it('should maintain dirty state after widget changes', () => {
    const store = useDashboardStore.getState();

    act(() => {
      store.addWidget('test');
    });

    const updated = useDashboardStore.getState();
    expect(updated.isDirty).toBe(true);
  });

  it('should save layout asynchronously', async () => {
    const store = useDashboardStore.getState();
    
    act(() => {
      store.addWidget('test');
    });

    let updated = useDashboardStore.getState();
    expect(updated.isDirty).toBe(true);

    await act(async () => {
      await store.saveLayout();
    });

    updated = useDashboardStore.getState();
    expect(updated.isDirty).toBe(false);
  });
});
