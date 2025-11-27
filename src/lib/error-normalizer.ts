/**
 * Error Normalization Utilities
 * 
 * Provides safe, type-safe methods for handling errors of type 'unknown'.
 * Useful in catch blocks and error handling scenarios.
 * 
 * @module lib/error-normalizer
 */

/**
 * Safely converts any value to an Error instance.
 * Handles: Error objects, strings, objects with message property, and any other values.
 * 
 * @param value The value to convert to an Error
 * @returns An Error instance with a meaningful message
 * 
 * @example
 * ```ts
 * try {
 *   // some operation
 * } catch (err) {
 *   const error = ensureError(err);
 *   console.error(error.message);
 * }
 * ```
 */
export function ensureError(value: unknown): Error {
    if (value instanceof Error) {
        return value;
    }
    
    if (typeof value === 'string') {
        return new Error(value);
    }
    
    if (value && typeof value === 'object') {
        if ('message' in value && typeof value.message === 'string') {
            return new Error(value.message);
        }
        if ('error' in value && typeof value.error === 'string') {
            return new Error(value.error);
        }
    }
    
    return new Error(String(value ?? 'Unknown error'));
}

/**
 * Extracts a safe message string from any error value.
 * Returns a fallback message if extraction fails.
 * 
 * @param error The error value to extract a message from
 * @param fallback Optional fallback message
 * @returns A string message
 * 
 * @example
 * ```ts
 * try {
 *   // some operation
 * } catch (err) {
 *   const msg = getErrorMessage(err, 'Operation failed');
 *   toast.error(msg);
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallback = 'An unknown error occurred'): string {
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
        if ('error' in error && typeof error.error === 'string') {
            return error.error;
        }
    }
    
    return fallback;
}

/**
 * Safely extracts a status code from an error value.
 * Handles APIError, fetch Response errors, and other status-containing errors.
 * 
 * @param error The error value to extract a status code from
 * @returns A status code number, or undefined if not found
 * 
 * @example
 * ```ts
 * try {
 *   await fetch('/api/data');
 * } catch (err) {
 *   const status = getErrorStatus(err);
 *   if (status === 401) {
 *     // handle auth error
 *   }
 * }
 * ```
 */
export function getErrorStatus(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
        if ('status' in error && typeof error.status === 'number') {
            return error.status;
        }
        if ('statusCode' in error && typeof error.statusCode === 'number') {
            return error.statusCode;
        }
        if ('code' in error && typeof error.code === 'number') {
            return error.code;
        }
    }
    
    return undefined;
}

/**
 * Type guard to check if a value is an Error instance.
 * 
 * @param value The value to check
 * @returns True if the value is an Error
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Type guard to check if an error has a specific status code.
 * 
 * @param error The error to check
 * @param status The status code to match
 * @returns True if the error has the specified status
 * 
 * @example
 * ```ts
 * if (hasErrorStatus(err, 401)) {
 *   // handle unauthorized
 * }
 * ```
 */
export function hasErrorStatus(error: unknown, status: number): boolean {
    return getErrorStatus(error) === status;
}

/**
 * Creates a safe error handler callback.
 * Converts any error to Error type before passing to handler.
 * 
 * @param handler The error handler function
 * @returns A function that accepts unknown errors and handles them safely
 * 
 * @example
 * ```ts
 * const handleError = safeErrorHandler((err) => {
 *   console.error(err.message);
 * });
 * 
 * promise.catch(handleError);
 * ```
 */
export function safeErrorHandler(handler: (error: Error) => void): (error: unknown) => void {
    return (error: unknown) => {
        try {
            handler(ensureError(error));
        } catch (handlerError) {
            console.error('Error handler failed:', handlerError);
        }
    };
}
