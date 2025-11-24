// src/lib/errors.ts

/**
 * Base class for all custom application errors.
 * This allows for easily catching and identifying application-specific errors.
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly data: unknown;

  constructor(name: string, message: string, data?: unknown) {
    super(message);
    this.name = name;
    this.data = data;
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
  constructor(message: string, data?: unknown) {
    super('AIError', message, data);
  }
}

/**
 * Represents a generic error from an external API.
 */
export class APIError extends AppError {
  constructor(message: string, data?: unknown) {
    super('APIError', message, data);
  }
}

/**
 * Represents an error related to authentication or authorization.
 */
export class AuthenticationError extends AppError {
  constructor(message: string, data?: unknown) {
    super('AuthenticationError', message, data);
  }
}

/**
 * Represents an error due to invalid input from the user or client.
 */
export class ValidationError extends AppError {
    constructor(message: string, data?: unknown) {
        super('ValidationError', message, data);
    }
}
