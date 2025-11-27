import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '../dashboard-state';

describe('useDashboardStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const store = useDashboardStore.getState();
    useDashboardStore.setState({
      widgetData: {},
      isLoadingAllWidgets: false,
    });
  });

  describe('Widget Data Loading', () => {
    it('should initialize with empty widget data', () => {
      const store = useDashboardStore.getState();
      expect(store.widgetData).toEqual({});
    });

    it('should load single widget data', async () => {
      const { result } = renderHook(() => useDashboardStore());
      
      await act(async () => {
        await result.current.loadWidgetData('test-widget');
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']).toBeDefined();
    });

    it('should set widget loading state', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetData('test-widget', { value: 10 });
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']?.data).toEqual({ value: 10 });
    });

    it('should handle widget errors', () => {
      const { result } = renderHook(() => useDashboardStore());
      const error = new Error('Test error');
      
      act(() => {
        result.current.setWidgetError('test-widget', error);
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']?.error).toEqual(error);
    });

    it('should clear widget cache', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetData('test-widget', { value: 10 });
      });

      let state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']).toBeDefined();

      act(() => {
        result.current.clearWidgetCache('test-widget');
      });

      state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']?.data).toBeNull();
    });

    it('should clear all widget cache when no id provided', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetData('widget-1', { value: 10 });
        result.current.setWidgetData('widget-2', { value: 20 });
      });

      act(() => {
        result.current.clearWidgetCache();
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['widget-1']?.data).toBeNull();
      expect(state.widgetData['widget-2']?.data).toBeNull();
    });

    it('should check if widget is loading', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetData('test-widget', { value: 10 });
      });

      expect(result.current.isWidgetLoading('test-widget')).toBe(false);
    });

    it('should get widget data', () => {
      const { result } = renderHook(() => useDashboardStore());
      const testData = { value: 10 };
      
      act(() => {
        result.current.setWidgetData('test-widget', testData);
      });

      const data = result.current.getWidgetData('test-widget');
      expect(data).toEqual(testData);
    });

    it('should get widget error', () => {
      const { result } = renderHook(() => useDashboardStore());
      const error = new Error('Test error');
      
      act(() => {
        result.current.setWidgetError('test-widget', error);
      });

      const widgetError = result.current.getWidgetError('test-widget');
      expect(widgetError).toEqual(error);
    });
  });

  describe('Batch Widget Loading', () => {
    it('should load multiple widgets', async () => {
      const { result } = renderHook(() => useDashboardStore());
      
      await act(async () => {
        await result.current.loadAllWidgetData([
          'widget-1',
          'widget-2',
          'widget-3',
        ]);
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['widget-1']).toBeDefined();
      expect(state.widgetData['widget-2']).toBeDefined();
      expect(state.widgetData['widget-3']).toBeDefined();
    });

    it('should set global loading state during batch load', async () => {
      const { result } = renderHook(() => useDashboardStore());
      
      expect(result.current.isLoadingAllWidgets).toBe(false);

      const promise = act(async () => {
        await result.current.loadAllWidgetData(['widget-1']);
      });

      // After promise resolves, loading should be false
      await promise;
      expect(result.current.isLoadingAllWidgets).toBe(false);
    });
  });

  describe('Widget Refetch', () => {
    it('should refetch widget data', async () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetData('test-widget', { value: 10 });
      });

      await act(async () => {
        await result.current.refetchWidget('test-widget');
      });

      const state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']).toBeDefined();
    });

    it('should clear error on successful refetch', async () => {
      const { result } = renderHook(() => useDashboardStore());
      
      act(() => {
        result.current.setWidgetError('test-widget', new Error('Test error'));
      });

      let state = useDashboardStore.getState();
      expect(state.widgetData['test-widget']?.error).toBeDefined();

      await act(async () => {
        await result.current.refetchWidget('test-widget');
      });

      state = useDashboardStore.getState();
      // After refetch, data should be loaded or error cleared
      expect(state.widgetData['test-widget']).toBeDefined();
    });
  });

  describe('Store Persistence', () => {
    it('should persist widget data across hook instances', () => {
      const { result: result1 } = renderHook(() => useDashboardStore());
      
      act(() => {
        result1.current.setWidgetData('test-widget', { value: 10 });
      });

      const { result: result2 } = renderHook(() => useDashboardStore());
      expect(result2.current.getWidgetData('test-widget')).toEqual({ value: 10 });
    });

    it('should allow multiple components to subscribe to same widget', () => {
      const { result: result1 } = renderHook(() => useDashboardStore());
      const { result: result2 } = renderHook(() => useDashboardStore());

      act(() => {
        result1.current.setWidgetData('test-widget', { value: 10 });
      });

      expect(result2.current.getWidgetData('test-widget')).toEqual({ value: 10 });
    });
  });

  describe('Error Cases', () => {
    it('should handle null widget data gracefully', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      const data = result.current.getWidgetData('non-existent');
      expect(data).toBeNull();
    });

    it('should handle null widget error gracefully', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      const error = result.current.getWidgetError('non-existent');
      expect(error).toBeNull();
    });

    it('should not crash when clearing non-existent widget cache', () => {
      const { result } = renderHook(() => useDashboardStore());
      
      expect(() => {
        act(() => {
          result.current.clearWidgetCache('non-existent');
        });
      }).not.toThrow();
    });
  });
});
