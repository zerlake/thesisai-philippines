import { NextResponse } from 'next/server';
export { ensureError, getErrorMessage as getErrorMessageFromNormalizer, getErrorStatus, isError, hasErrorStatus, safeErrorHandler } from '@/lib/error-normalizer';

/**
 * Base class for all custom application errors.
 * This allows for easily catching and identifying application-specific errors.
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly data: unknown;
  public readonly originalError?: Error;

  constructor(name: string, message: string, data?: { originalError?: Error, [key: string]: any }) {
    super(message);
    this.name = name;
    this.data = data;
    this.originalError = data?.originalError;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Represents an error originating from an AI service call.
 */
export class AIError extends AppError {
  constructor(message: string, data?: { originalError?: Error, [key: string]: any }) {
    super('AIError', message, data);
  }
}

/**
 * Represents a generic error from an external API.
 */
export class APIError extends AppError {
    public readonly status?: number;

    constructor(message: string, data?: { status?: number, originalError?: Error, [key: string]: any }) {
        super('APIError', message, data);
        this.status = data?.status;
    }
}

/**
 * Represents an error related to authentication or authorization.
 */
export class AuthenticationError extends AppError {
  constructor(message: string, data?: { originalError?: Error, [key: string]: any }) {
    super('AuthenticationError', message, data);
  }
}

/**
 * Represents an error due to invalid input from the user or client.
 */
export class ValidationError extends AppError {
    constructor(message: string, data?: { originalError?: Error, [key: string]: any }) {
        super('ValidationError', message, data);
    }
}

/**
 * Represents a network-related error (e.g., DNS failure, connection refused).
 */
export class NetworkError extends AppError {
    constructor(message: string = 'A network error occurred. Please check your connection.', data?: { originalError?: Error, [key: string]: any }) {
        super('NetworkError', message, data);
    }
}

/**
 * Represents a request timeout error.
 */
export class TimeoutError extends AppError {
    constructor(message: string = 'The request timed out.', data?: { originalError?: Error, [key: string]: any }) {
        super('TimeoutError', message, data);
    }
}

/**
 * Represents an error related to a malformed or invalid request/response payload.
 */
export class PayloadError extends AppError {
    constructor(message: string = 'There was an issue with the data payload.', data?: { originalError?: Error, [key: string]: any }) {
        super('PayloadError', message, data);
    }
}

/**
 * Represents an error due to rate limiting.
 */
export class RateLimitError extends AppError {
    public readonly retryAfter?: number; // In seconds

    constructor(message: string = 'Too many requests. Please try again later.', data?: { retryAfter?: number, originalError?: Error, [key: string]: any }) {
        super('RateLimitError', message, data);
        this.retryAfter = data?.retryAfter;
    }
}

/**
 * Represents an error when a user or entity exceeds an allowed quota.
 */
export class QuotaExceededError extends AppError {
  constructor(message: string = 'Usage quota exceeded. Please upgrade your plan or try again later.', data?: { originalError?: Error, [key: string]: any }) {
    super('QuotaExceededError', message, data);
  }
}

/**
 * Represents an error due to content violating moderation policies.
 */
export class ContentModerationError extends AppError {
  constructor(message: string = 'Content violates moderation policies.', data?: { originalError?: Error, [key: string]: any }) {
    super('ContentModerationError', message, data);
  }
}

/**
 * Represents an error with a third-party integration (e.g., external API failure).
 */
export class IntegrationError extends AppError {
  constructor(message: string, data?: { originalError?: Error, [key: string]: any }) {
    super('IntegrationError', message, data);
  }
}

/**
 * Represents an error when an operation cannot be completed due to a conflict with the current state of the resource.
 */
export class ConflictError extends AppError {
  constructor(message: string = 'The requested operation conflicts with the current state of the resource.', data?: { originalError?: Error, [key: string]: any }) {
    super('ConflictError', message, data);
  }
}


/**
 * Type guard to check if an error is an instance of AppError.
 * @param error The error to check.
 * @returns True if the error is an AppError instance, false otherwise.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extracts a user-friendly error message from any error object.
 *
 * @param error The error object, which can be of any type.
 * @returns A string representing the error message.
 */
export function getErrorMessage(error: unknown): string {
    if (isAppError(error)) { // Use type guard
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return 'An unknown error occurred.';
}

/**
 * Converts any thrown value into an instance of AppError.
 * This ensures that we are always dealing with a predictable error structure.
 *
 * @param error The error object to convert.
 * @returns An instance of AppError or its subclasses.
 */
export function toAppError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        // You can add more specific checks here if needed
        return new AppError('GenericError', error.message, { originalError: error });
    }

    // Handle non-Error objects
    const message = getErrorMessage(error);
    return new AppError('UnknownError', message, { originalError: new Error(message) });
}


/**
 * Utility function to standardize creating `NextResponse` for API routes from an `AppError`.
 * Maps specific `AppError` types to appropriate HTTP status codes.
 *
 * @param error The AppError instance to convert into a NextResponse.
 * @param defaultStatusCode The default HTTP status code to use if no specific mapping is found.
 * @returns A NextResponse object.
 */
export function handleErrorResponse(error: AppError, defaultStatusCode: number = 500): NextResponse {
  let statusCode: number = defaultStatusCode;

  switch (error.name) {
    case 'AuthenticationError':
      statusCode = 401;
      break;
    case 'ValidationError':
      statusCode = 400;
      break;
    case 'QuotaExceededError':
    case 'RateLimitError':
      statusCode = 429;
      break;
    case 'NetworkError':
    case 'TimeoutError':
    case 'IntegrationError':
      statusCode = 503; // Service Unavailable for external issues
      break;
    case 'APIError':
      statusCode = (error as APIError).status || 500;
      break;
    case 'ContentModerationError':
      statusCode = 403; // Forbidden
      break;
    case 'ConflictError':
      statusCode = 409; // Conflict
      break;
    case 'PayloadError':
        statusCode = 400; // Bad Request due to malformed payload
        break;
    default:
      statusCode = defaultStatusCode;
  }

  return NextResponse.json(
    {
      error: error.message,
      name: error.name,
      data: error.data,
    },
    { status: statusCode }
  );
}
