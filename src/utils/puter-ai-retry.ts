/**
 * Puter AI Service Retry and Error Handling Utility
 * Provides exponential backoff retry logic and error categorization
 */

import { normalizeError, ErrorType, isRetryableError } from './error-utilities';

export enum PuterErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface PuterRetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
}

const DEFAULT_CONFIG: Required<PuterRetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
};

/**
 * Categorize Puter AI errors to determine if retry is appropriate
 */
export function categorizePuterError(error: any): PuterErrorType {
  const normalized = normalizeError(error, 'categorizePuterError');

  // Map normalized error types to PuterErrorType
  switch (normalized.type) {
    case ErrorType.AUTH:
      return PuterErrorType.AUTH_ERROR;
    case ErrorType.NETWORK:
      return PuterErrorType.NETWORK_ERROR;
    case ErrorType.TIMEOUT:
      return PuterErrorType.TIMEOUT_ERROR;
    case ErrorType.SERVICE:
    case ErrorType.EMPTY_OBJECT:
      return PuterErrorType.SERVICE_ERROR;
    case ErrorType.UNDEFINED:
    default:
      return PuterErrorType.UNKNOWN_ERROR;
  }
}

/**
 * Check if an error should trigger a retry attempt
 */
export function shouldRetryPuterCall(errorType: PuterErrorType): boolean {
  // Retry on network, timeout, and service errors
  // Don't retry on auth errors or unknown errors
  return [
    PuterErrorType.NETWORK_ERROR,
    PuterErrorType.TIMEOUT_ERROR,
    PuterErrorType.SERVICE_ERROR,
  ].includes(errorType);
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attemptNumber: number,
  config: Required<PuterRetryConfig>
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Wrap a Puter AI chat call with retry logic and timeout
 */
export async function callPuterAIWithRetry(
  chatFn: () => Promise<any>,
  userConfig?: PuterRetryConfig,
  onRetry?: (attempt: number, error: any) => void
): Promise<any> {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add timeout wrapper
      const result = await Promise.race([
        chatFn(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Puter AI call timed out after ${config.timeoutMs}ms`)),
            config.timeoutMs
          )
        ),
      ]);

      // Log successful retry
      if (attempt > 0) {
      }

      return result;
    } catch (error: any) {
      lastError = error;
      const errorType = categorizePuterError(error);

      const normalized = normalizeError(error, `PuterAI.attempt${attempt + 1}`);
      console.debug(
        `[Puter AI] Attempt ${attempt + 1}/${config.maxRetries + 1} failed:`,
        {
          errorType,
          message: normalized.message,
          retriable: shouldRetryPuterCall(errorType),
        }
      );

      // Check if we should retry
      if (!shouldRetryPuterCall(errorType)) {
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay and wait
      const delayMs = calculateBackoffDelay(attempt, config);
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Puter AI call failed');
}

/**
 * Get user-friendly error message based on error type
 */
export function getPuterErrorMessage(error: any, attempt: number = 1): string {
  const errorType = categorizePuterError(error);
  const normalized = normalizeError(error, 'getPuterErrorMessage');

  switch (errorType) {
    case PuterErrorType.AUTH_ERROR:
      return 'Authentication error with AI service. Please log out and back in to refresh your credentials.';

    case PuterErrorType.TIMEOUT_ERROR:
      return attempt > 1
        ? 'AI service is taking too long to respond. Please try again.'
        : 'AI service request timed out. Please try again.';

    case PuterErrorType.NETWORK_ERROR:
      return 'Network error connecting to AI service. Please check your internet connection and try again.';

    case PuterErrorType.SERVICE_ERROR:
      return attempt > 1
        ? 'AI service is temporarily unavailable. Please try again in a moment.'
        : 'AI service encountered an error. Please try again.';

    case PuterErrorType.UNKNOWN_ERROR:
    default:
      return normalized.message || 'An unexpected error occurred with the AI service.';
  }
}

/**
 * Check if Puter AI is available and ready
 */
export function isPuterAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.puter && window.puter.ai && window.puter.ai.chat);
}
