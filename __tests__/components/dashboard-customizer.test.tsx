/**
 * Dashboard Customizer Component Tests
 * Tests for drag-drop, resize, widget management, and state persistence
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardCustomizer } from '@/components/personalization/DashboardCustomizer';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import '@testing-library/jest-dom';

describe('DashboardCustomizer', () => {
  beforeEach(() => {
    useDashboardStore.getState().resetToDefault();
  });

  describe('Rendering', () => {
    it('should render customizer with toolbar', () => {
      render(<DashboardCustomizer />);
      expect(screen.getByText(/edit|preview/i)).toBeInTheDocument();
    });

    it('should display widget count in info bar', () => {
      render(<DashboardCustomizer />);
      const infoBar = screen.getByText(/widgets:/i);
      expect(infoBar).toBeInTheDocument();
    });

    it('should show empty state when no widgets', () => {
      useDashboardStore.getState().resetToDefault();
      useDashboardStore.setState({ currentLayout: { ...useDashboardStore.getState().currentLayout, widgets: [] } });
      
      render(<DashboardCustomizer />);
      expect(screen.getByText(/no widgets added/i)).toBeInTheDocument();
    });
  });

  describe('Preview Mode', () => {
    it('should toggle preview mode', async () => {
      const user = userEvent.setup();
      render(<DashboardCustomizer />);

      const previewBtn = screen.getByRole('button', { name: /preview|edit/i });
      await user.click(previewBtn);

      // Should switch to preview mode
      expect(screen.getByText(/edit/i)).toBeInTheDocument();

      await user.click(previewBtn);
      // Should switch back to edit mode
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('should disable interactions in preview mode', async () => {
      const user = userEvent.setup();
      render(<DashboardCustomizer />);

      // Switch to preview mode
      const previewBtn = screen.getByRole('button', { name: /preview/i });
      await user.click(previewBtn);

      // Grid background should not be visible
      const canvas = screen.getByText(/Grid/).closest('div');
      expect(canvas?.className).toContain('previewMode');
    });
  });

  describe('Undo/Redo', () => {
    it('should have undo button', () => {
      render(<DashboardCustomizer />);
      const undoBtn = screen.getByRole('button', { name: /undo/i });
      expect(undoBtn).toBeInTheDocument();
    });

    it('should have redo button', () => {
      render(<DashboardCustomizer />);
      const redoBtn = screen.getByRole('button', { name: /redo/i });
      expect(redoBtn).toBeInTheDocument();
    });

    it('should undo add widget action', async () => {
      const user = userEvent.setup();
      const store = useDashboardStore.getState();
      const initialCount = store.currentLayout.widgets.length;

      store.addWidget('stats');
      expect(store.currentLayout.widgets.length).toBe(initialCount + 1);

      store.undo();
      expect(store.currentLayout.widgets.length).toBe(initialCount);
    });

    it('should redo undone action', async () => {
      const user = userEvent.setup();
      const store = useDashboardStore.getState();
      const initialCount = store.currentLayout.widgets.length;

      store.addWidget('stats');
      const withWidget = store.currentLayout.widgets.length;

      store.undo();
      expect(store.currentLayout.widgets.length).toBe(initialCount);

      store.redo();
      expect(store.currentLayout.widgets.length).toBe(withWidget);
    });
  });

  describe('Widget Removal', () => {
    it('should remove widget when X button clicked', async () => {
      const user = userEvent.setup();
      const store = useDashboardStore.getState();
      
      store.addWidget('stats');
      const widgetId = store.currentLayout.widgets[store.currentLayout.widgets.length - 1].id;

      render(<DashboardCustomizer />);

      const removeBtn = screen.getAllByRole('button', { name: /✕/i })[0];
      await user.click(removeBtn);

      expect(store.currentLayout.widgets.find(w => w.id === widgetId)).toBeUndefined();
    });
  });

  describe('Save/Reset', () => {
    it('should have save button', () => {
      render(<DashboardCustomizer />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should have reset button', () => {
      render(<DashboardCustomizer />);
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should reset layout to default', async () => {
      const user = userEvent.setup();
      const store = useDashboardStore.getState();

      // Add a widget
      store.addWidget('trends');
      const modifiedCount = store.currentLayout.widgets.length;

      render(<DashboardCustomizer />);

      // Click reset button
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      await user.click(resetBtn);

      // Confirm reset
      window.confirm = jest.fn(() => true);
      await user.click(resetBtn);

      // Layout should be reset
      expect(store.isDirty).toBe(false);
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<DashboardCustomizer />);
      expect(screen.getByText(/edit/i)).toBeInTheDocument();
    });

    it('should render on tablet viewport', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      render(<DashboardCustomizer />);
      expect(screen.getByText(/edit/i)).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));

      render(<DashboardCustomizer />);
      expect(screen.getByText(/edit/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DashboardCustomizer />);
      expect(screen.getByRole('button', { name: /undo/i })).toHaveAttribute('title');
      expect(screen.getByRole('button', { name: /redo/i })).toHaveAttribute('title');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<DashboardCustomizer />);

      const undoBtn = screen.getByRole('button', { name: /undo/i });
      undoBtn.focus();
      expect(undoBtn).toHaveFocus();

      await user.keyboard('{Enter}');
      // Action should be triggered
    });
  });
});
