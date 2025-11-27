import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock component that throws an error
const ErrorThrowingComponent = () => {
  throw new Error('Test error message');
};

const WorkingComponent = () => <div>Working content</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('displays error message when child throws', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('recovers when retry button is clicked', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('accepts custom fallback render function', () => {
    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <p>Custom error: {error.message}</p>
            <button onClick={reset}>Custom retry</button>
          </div>
        )}
      >
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error message')).toBeInTheDocument();
    expect(screen.getByText('Custom retry')).toBeInTheDocument();
  });
});
