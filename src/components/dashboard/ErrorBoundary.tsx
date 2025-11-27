import React, { ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Dashboard error:', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.reset) || (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 mb-4 max-w-md text-center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
