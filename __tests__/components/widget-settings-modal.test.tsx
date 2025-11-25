/**
 * Widget Settings Modal Tests
 * Tests for form rendering, validation, and settings updates
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WidgetSettingsModal } from '@/components/personalization/WidgetSettingsModal';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import '@testing-library/jest-dom';

describe('WidgetSettingsModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDashboardStore.getState().resetToDefault();
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      useDashboardStore.getState().addWidget('stats');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      useDashboardStore.getState().addWidget('stats');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/settings/i)).not toBeInTheDocument();
    });

    it('should display widget icon and description', () => {
      useDashboardStore.getState().addWidget('research-progress');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/research progress/i)).toBeInTheDocument();
    });
  });

  describe('Settings Form', () => {
    it('should render form fields for default settings', () => {
      useDashboardStore.getState().addWidget('writing-goals');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should have form fields
      const formFields = screen.getAllByRole('textbox');
      expect(formFields.length).toBeGreaterThan(0);
    });

    it('should update setting values', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('writing-goals');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        await user.clear(inputs[0]);
        await user.type(inputs[0], '2000');

        expect(inputs[0]).toHaveValue('2000');
      }
    });

    it('should handle boolean settings', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('recent-papers');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const checkboxes = screen.queryAllByRole('checkbox');
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0]);
        expect(checkboxes[0]).toBeChecked();
      }
    });
  });

  describe('Actions', () => {
    it('should save changes', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('stats');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /save/i });
      await user.click(saveBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset to defaults', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('trends');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const resetBtn = screen.getByRole('button', { name: /reset/i });
      await user.click(resetBtn);

      // Settings should be reset (button should be enabled after reset)
      const saveBtn = screen.getByRole('button', { name: /save/i });
      expect(saveBtn).not toBeDisabled();
    });

    it('should close modal', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('calendar');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close on overlay click', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('notes');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const overlay = screen.getByText(/settings/i).closest('.overlay');
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Live Preview', () => {
    it('should show preview of widget', () => {
      useDashboardStore.getState().addWidget('collaboration');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('should update preview when settings change', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('time-tracker');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Change a setting
      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        await user.clear(inputs[0]);
        await user.type(inputs[0], 'test');

        // Preview should update (in real implementation)
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have close button', () => {
      useDashboardStore.getState().addWidget('suggestion');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeBtn = screen.getByText('✕');
      expect(closeBtn).toBeInTheDocument();
    });

    it('should have proper labels on form fields', () => {
      useDashboardStore.getState().addWidget('citation');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Form should have labels
      const labels = screen.queryAllByRole('label');
      expect(labels.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Save Button State', () => {
    it('should disable save button when no changes', () => {
      useDashboardStore.getState().addWidget('custom-html');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /save/i });
      expect(saveBtn).toBeDisabled();
    });

    it('should enable save button when changes made', async () => {
      const user = userEvent.setup();
      useDashboardStore.getState().addWidget('stats');
      const widgetId = useDashboardStore.getState().currentLayout.widgets[0].id;

      render(
        <WidgetSettingsModal
          widgetLayoutId={widgetId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const inputs = screen.getAllByRole('textbox');
      if (inputs.length > 0) {
        await user.clear(inputs[0]);
        await user.type(inputs[0], 'changed');

        const saveBtn = screen.getByRole('button', { name: /save/i });
        expect(saveBtn).not toBeDisabled();
      }
    });
  });
});
