import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WidgetError } from '../WidgetError';

describe('WidgetError', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('renders error message when error is a string', () => {
    render(
      <WidgetError
        widgetId="test-widget"
        error="Test error message"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders error message when error is an Error object', () => {
    const error = new Error('Error object message');
    render(
      <WidgetError
        widgetId="test-widget"
        error={error}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('renders widget error title', () => {
    render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Widget Error')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('has yellow styling for warnings', () => {
    const { container } = render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    const errorDiv = container.querySelector('.bg-yellow-50');
    expect(errorDiv).toBeInTheDocument();
  });

  it('displays alert icon', () => {
    const { container } = render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    // Check for the AlertTriangle icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has proper spacing and layout', () => {
    const { container } = render(
      <WidgetError
        widgetId="test-widget"
        error="Test error"
        onRetry={mockOnRetry}
      />
    );

    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
  });

  it('handles very long error messages', () => {
    const longError = 'A'.repeat(200);
    const { container } = render(
      <WidgetError
        widgetId="test-widget"
        error={longError}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText(longError)).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it('can be rendered multiple times without issues', () => {
    const { rerender } = render(
      <WidgetError
        widgetId="widget-1"
        error="Error 1"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Error 1')).toBeInTheDocument();

    rerender(
      <WidgetError
        widgetId="widget-2"
        error="Error 2"
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });
});
