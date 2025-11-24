/**
 * Unified Error Handling Utilities
 * Provides consistent error normalization, logging, and message generation across the application
 */

/**
 * Normalized error object with consistent structure
 */
export interface NormalizedError {
  message: string;
  code?: string;
  statusCode?: number;
  type: ErrorType;
  originalError: any;
  context?: Record<string, any>;
  timestamp: number;
}

export enum ErrorType {
  EMPTY_OBJECT = 'EMPTY_OBJECT',
  UNDEFINED = 'UNDEFINED',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVICE = 'SERVICE',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Normalize any error into a consistent structure
 * Handles empty objects, undefined, strings, Error objects, and custom errors
 */
export function normalizeError(
  error: any,
  context?: string,
  additionalContext?: Record<string, any>
): NormalizedError {
  let message = 'An unexpected error occurred';
  let code: string | undefined;
  let statusCode: number | undefined;
  let type = ErrorType.UNKNOWN;
  
  // Safely merge context
  const mergedContext = { 
    ...(additionalContext || {}), 
    errorContext: context 
  };

  // Handle null/undefined
  if (error === null || error === undefined) {
    type = ErrorType.UNDEFINED;
    message = 'Error: undefined or null was thrown';
    return {
      message,
      type,
      originalError: error,
      context: mergedContext,
      timestamp: Date.now(),
    };
  }

  // Handle empty objects (common with SDK errors)
  if (typeof error === 'object' && Object.keys(error).length === 0) {
    type = ErrorType.EMPTY_OBJECT;
    message = 'An error occurred but no details were provided. The service may be temporarily unavailable.';
    return {
      message,
      type,
      originalError: error,
      context: mergedContext,
      timestamp: Date.now(),
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    message = error;
    type = classifyErrorType(error);
    return {
      message,
      type,
      originalError: error,
      context: mergedContext,
      timestamp: Date.now(),
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    message = error.message;
    code = (error as any).code;
    statusCode = (error as any).statusCode;
    type = classifyErrorType(message, code, statusCode);
    return {
      message,
      code,
      statusCode,
      type,
      originalError: error,
      context: { ...mergedContext, stack: error.stack },
      timestamp: Date.now(),
    };
  }

  // Handle objects with error properties
  if (typeof error === 'object') {
    // Try common error property names
    message =
      error.message ||
      error.msg ||
      error.error ||
      error.detail ||
      error.description ||
      error.toString?.() ||
      'An unknown error occurred';

    code = error.code || error.errorCode || error.status;
    statusCode = error.statusCode || error.status || error.status_code;

    type = classifyErrorType(message, code, statusCode);

    return {
      message,
      code,
      statusCode,
      type,
      originalError: error,
      context: mergedContext,
      timestamp: Date.now(),
    };
  }

  // Fallback for primitive types
  message = String(error);
  type = classifyErrorType(message);
  return {
    message,
    type,
    originalError: error,
    context: mergedContext,
    timestamp: Date.now(),
  };
}

/**
 * Classify error type based on message, code, or status code
 */
function classifyErrorType(
  message: string = '',
  code?: string | number,
  statusCode?: number
): ErrorType {
  const lower = String(message).toLowerCase();
  const codeStr = String(code).toLowerCase();

  // Check status code first
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) return ErrorType.AUTH;
    if (statusCode === 404) return ErrorType.NOT_FOUND;
    if (statusCode === 409) return ErrorType.CONFLICT;
    if (statusCode >= 500) return ErrorType.SERVICE;
    if (statusCode >= 400) return ErrorType.VALIDATION;
  }

  // Check message patterns
  if (
    lower.includes('unauthorized') ||
    lower.includes('authentication') ||
    lower.includes('invalid token') ||
    lower.includes('permission') ||
    lower.includes('forbidden')
  ) {
    return ErrorType.AUTH;
  }

  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('deadline exceeded')
  ) {
    return ErrorType.TIMEOUT;
  }

  if (
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound')
  ) {
    return ErrorType.NETWORK;
  }

  if (
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('service unavailable') ||
    lower.includes('internal server error') ||
    lower.includes('cannot read properties')
  ) {
    return ErrorType.SERVICE;
  }

  if (
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('does not exist')
  ) {
    return ErrorType.NOT_FOUND;
  }

  if (
    lower.includes('409') ||
    lower.includes('conflict') ||
    lower.includes('already exists')
  ) {
    return ErrorType.CONFLICT;
  }

  if (
    lower.includes('validation') ||
    lower.includes('invalid') ||
    lower.includes('required') ||
    lower.includes('malformed')
  ) {
    return ErrorType.VALIDATION;
  }

  // Check code patterns
  if (codeStr.includes('auth') || codeStr.includes('401') || codeStr.includes('403')) {
    return ErrorType.AUTH;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(normalized: NormalizedError): string {
  switch (normalized.type) {
    case ErrorType.EMPTY_OBJECT:
    case ErrorType.UNDEFINED:
      return 'An error occurred. Please try again or contact support if the problem persists.';

    case ErrorType.AUTH:
      return 'Authentication error. Please log out and log back in to refresh your credentials.';

    case ErrorType.TIMEOUT:
      return 'The request took too long to complete. Please try again.';

    case ErrorType.NETWORK:
      return 'Network error. Please check your internet connection and try again.';

    case ErrorType.SERVICE:
      return 'The service is temporarily unavailable. Please try again in a moment.';

    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';

    case ErrorType.CONFLICT:
      return 'There was a conflict processing your request. Please try again.';

    case ErrorType.VALIDATION:
      return `Invalid input: ${normalized.message}`;

    case ErrorType.UNKNOWN:
    default:
      return normalized.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error with structured format and context
 * DISABLED: Console logging causing issues with some libraries
 */
export function logError(
  _normalized: NormalizedError,
  _prefix: string = 'Error'
): void {
  // Logging disabled to avoid conflicts with other libraries that may override console
  // Error information is still captured and processed, just not logged to console
  // If you need debugging, check the browser's network tab and application state
  return;
}

/**
 * Safe error handler for try-catch blocks
 * Returns both the message and the normalized error for flexible handling
 */
export function handleError(
  error: any,
  context: string,
  additionalContext?: Record<string, any>
): { message: string; normalized: NormalizedError } {
  try {
    const normalized = normalizeError(error, context, additionalContext);
    const message = getUserFriendlyMessage(normalized);
    
    // Attempt to log, but don't fail if logging breaks
    try {
      logError(normalized, context);
    } catch {
      // Logging failed, continue without it
    }
    
    return { message, normalized };
  } catch (e) {
    // Fallback if something goes wrong in error handling itself
    const fallbackMessage = 'An unexpected error occurred. Please try again.';
    return {
      message: fallbackMessage,
      normalized: {
        message: fallbackMessage,
        type: ErrorType.UNKNOWN,
        originalError: error,
        timestamp: Date.now(),
      },
    };
  }
}

/**
 * Check if an error is retryable based on type
 */
export function isRetryableError(error: any): boolean {
  const normalized = normalizeError(error);
  return [
    ErrorType.TIMEOUT,
    ErrorType.NETWORK,
    ErrorType.SERVICE,
    ErrorType.EMPTY_OBJECT,
  ].includes(normalized.type);
}

/**
 * Check if an error is authentication-related
 */
export function isAuthError(error: any): boolean {
  const normalized = normalizeError(error);
  return normalized.type === ErrorType.AUTH;
}

/**
 * Get error details for debugging (safe to send to logging service)
 */
export function getErrorDetails(
  normalized: NormalizedError
): Record<string, any> {
  return {
    message: normalized.message,
    type: normalized.type,
    code: normalized.code,
    statusCode: normalized.statusCode,
    timestamp: normalized.timestamp,
    context: normalized.context,
    // Don't include the full original error object as it may contain sensitive data
  };
}
