/**
 * Dashboard API Error Handler
 * Handles different types of API errors with recovery suggestions
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = true,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorContext {
  widgetId?: string;
  endpoint?: string;
  method?: string;
  timestamp?: Date;
}

export interface UserMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  actions?: Array<{
    label: string;
    action: () => Promise<void> | void;
  }>;
}

export interface RecoveryAction {
  label: string;
  action: () => Promise<void> | void;
  description?: string;
}

export class DashboardApiErrorHandler {
  private errorLog: Array<{
    error: Error;
    context: ErrorContext;
    timestamp: Date;
  }> = [];

  /**
   * Handle network error
   */
  handleNetworkError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      type: 'error',
      actions: [
        {
          label: 'Retry',
          action: () => Promise.resolve()
        }
      ]
    };
  }

  /**
   * Handle timeout error
   */
  handleTimeoutError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Request Timeout',
      message: 'The server took too long to respond. Please try again.',
      type: 'error',
      actions: [
        {
          label: 'Retry',
          action: () => Promise.resolve()
        }
      ]
    };
  }

  /**
   * Handle validation error
   */
  handleValidationError(
    error: Error,
    validationErrors?: string[],
    context?: ErrorContext
  ): UserMessage {
    this.logError(error, context);

    const errorList = validationErrors?.length
      ? validationErrors.slice(0, 3).join('\n')
      : 'Data validation failed';

    return {
      title: 'Invalid Data',
      message: `The server returned unexpected data:\n${errorList}${validationErrors && validationErrors.length > 3 ? '\n...' : ''}`,
      type: 'warning'
    };
  }

  /**
   * Handle authentication error
   */
  handleAuthError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Authentication Failed',
      message: 'Your session has expired. Please log in again.',
      type: 'error',
      actions: [
        {
          label: 'Log In',
          action: () => {
            // Navigation to login would be handled by the component
            window.location.href = '/auth/login';
          }
        }
      ]
    };
  }

  /**
   * Handle authorization error
   */
  handleAuthorizationError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Permission Denied',
      message: 'You do not have permission to access this resource.',
      type: 'error'
    };
  }

  /**
   * Handle not found error
   */
  handleNotFoundError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      type: 'error',
      actions: [
        {
          label: 'Go Back',
          action: () => window.history.back()
        }
      ]
    };
  }

  /**
   * Handle rate limiting error
   */
  handleRateLimitError(error: Error, retryAfter?: number, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    const waitTime = retryAfter ? `${Math.ceil(retryAfter / 1000)}s` : 'a moment';

    return {
      title: 'Too Many Requests',
      message: `Please wait ${waitTime} before trying again.`,
      type: 'warning'
    };
  }

  /**
   * Handle server error
   */
  handleServerError(error: Error, context?: ErrorContext): UserMessage {
    this.logError(error, context);

    return {
      title: 'Server Error',
      message: 'An unexpected server error occurred. Please try again later.',
      type: 'error',
      actions: [
        {
          label: 'Retry',
          action: () => Promise.resolve()
        },
        {
          label: 'Report',
          action: () => this.reportError(error, context)
        }
      ]
    };
  }

  /**
   * Handle generic error with status code
   */
  handleError(statusCode: number, error: Error, context?: ErrorContext): UserMessage {
    if (statusCode === 0 || statusCode === undefined) {
      return this.handleNetworkError(error, context);
    }

    if (statusCode === 408) {
      return this.handleTimeoutError(error, context);
    }

    if (statusCode === 400) {
      return this.handleValidationError(error, undefined, context);
    }

    if (statusCode === 401) {
      return this.handleAuthError(error, context);
    }

    if (statusCode === 403) {
      return this.handleAuthorizationError(error, context);
    }

    if (statusCode === 404) {
      return this.handleNotFoundError(error, context);
    }

    if (statusCode === 429) {
      return this.handleRateLimitError(error, undefined, context);
    }

    if (statusCode >= 500) {
      return this.handleServerError(error, context);
    }

    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      type: 'error'
    };
  }

  /**
   * Get suggested recovery actions for an error
   */
  getSuggestedActions(error: Error, statusCode?: number): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Network errors - suggest retry
    if (statusCode === 0 || !statusCode) {
      actions.push({
        label: 'Check Connection',
        description: 'Verify your internet connection and try again',
        action: () => location.reload()
      });
    }

    // Auth errors - suggest login
    if (statusCode === 401) {
      actions.push({
        label: 'Log In Again',
        description: 'Your session has expired',
        action: () => (window.location.href = '/auth/login')
      });
    }

    // Server errors - suggest retry
    if (statusCode && statusCode >= 500) {
      actions.push({
        label: 'Try Again',
        description: 'The server may be temporarily unavailable',
        action: () => location.reload()
      });

      actions.push({
        label: 'Check Status',
        description: 'View service status page',
        action: () => window.open('/status', '_blank')
      });
    }

    // Generic retry action
    if (actions.length === 0) {
      actions.push({
        label: 'Retry',
        description: 'Try the operation again',
        action: () => Promise.resolve()
      });
    }

    return actions;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(statusCode?: number, error?: Error): boolean {
    if (!statusCode) return true; // Network errors are retryable

    // Don't retry client errors (except 408, 429)
    if (statusCode >= 400 && statusCode < 500) {
      return statusCode === 408 || statusCode === 429;
    }

    // Retry server errors
    return statusCode >= 500;
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay(attempt: number, maxDelay: number = 30000): number {
    const baseDelay = 1000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitterDelay = exponentialDelay + Math.random() * 1000;
    return Math.min(jitterDelay, maxDelay);
  }

  /**
   * Log error for analysis
   */
  private logError(error: Error, context?: ErrorContext): void {
    const timestamp = new Date();
    this.errorLog.push({
      error,
      context: context || {},
      timestamp
    });

    // Keep last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[DashboardError]', error, context);
    }
  }

  /**
   * Get error logs
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Report error to monitoring service
   */
  async reportError(error: Error, context?: ErrorContext): Promise<void> {
    try {
      // In production, send to error tracking service (Sentry, etc.)
      if (process.env.NODE_ENV === 'production') {
        // await sendToErrorTracker(error, context);
      }

      console.log('Error reported:', error.message);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<string, number>,
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(({ error }) => {
      const type = error.name || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const dashboardErrorHandler = new DashboardApiErrorHandler();

/**
 * Helper function to handle fetch errors
 */
export async function handleFetchError(
  response: Response,
  context?: ErrorContext
): Promise<never> {
  let errorData: any;
  let errorMessage = `HTTP ${response.status}`;

  try {
    errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
  } catch {
    // Response is not JSON
  }

  const error = new ApiError(
    errorMessage,
    response.status,
    dashboardErrorHandler.isRetryable(response.status),
    context
  );

  throw error;
}

/**
 * Helper to wrap API calls with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext,
  onError?: (error: Error, message: UserMessage) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const statusCode = err instanceof ApiError ? err.statusCode : undefined;
    const message = dashboardErrorHandler.handleError(statusCode || 0, err, context);

    onError?.(err, message);
    return null;
  }
}
