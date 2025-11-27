import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  const mockAction = jest.fn();

  beforeEach(() => {
    mockAction.mockClear();
  });

  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
      />
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display')).toBeInTheDocument();
  });

  it('renders default inbox icon when no custom icon provided', () => {
    const { container } = render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
      />
    );

    // Check for SVG icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
        icon={<div data-testid="custom-icon">Custom Icon</div>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button when action is provided', () => {
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
        action={{
          label: 'Create Item',
          onClick: mockAction,
        }}
      />
    );

    expect(screen.getByText('Create Item')).toBeInTheDocument();
  });

  it('does not render action button when action is not provided', () => {
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
      />
    );

    expect(screen.queryByText('Create Item')).not.toBeInTheDocument();
  });

  it('calls action callback when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
        action={{
          label: 'Create Item',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByText('Create Item');
    await user.click(button);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('has proper styling classes', () => {
    const { container } = render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
      />
    );

    const emptyStateContainer = container.querySelector('.bg-white');
    expect(emptyStateContainer).toBeInTheDocument();

    const textContainer = container.querySelector('.text-center');
    expect(textContainer).toBeInTheDocument();
  });

  it('renders arrow icon in action button', () => {
    const { container } = render(
      <EmptyState
        title="No Data"
        description="There is no data to display"
        action={{
          label: 'Create Item',
          onClick: mockAction,
        }}
      />
    );

    // Check for arrow icon in button
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('handles long text content properly', () => {
    const longDescription =
      'This is a very long description that explains what the user should do when there is no data to display.';
    render(
      <EmptyState
        title="No Data"
        description={longDescription}
      />
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('renders with different titles and descriptions', () => {
    const { rerender } = render(
      <EmptyState
        title="No Results"
        description="Try adjusting your search"
      />
    );

    expect(screen.getByText('No Results')).toBeInTheDocument();

    rerender(
      <EmptyState
        title="No Items"
        description="Create your first item"
      />
    );

    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('Create your first item')).toBeInTheDocument();
  });
});
