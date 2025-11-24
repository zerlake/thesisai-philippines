/**
 * Supabase error handling utilities
 * Helps suppress expected errors and handle authentication failures gracefully
 */

import { normalizeError, ErrorType } from './error-utilities';

/**
 * Check if an error is a known Realtime authentication error
 */
export function isRealtimeAuthError(error: any): boolean {
  const normalized = normalizeError(error, 'RealtimeAuthCheck');
  if (normalized.type === ErrorType.AUTH) return true;

  const message = error?.message || error?.toString() || '';
  return (
    message.includes('Refresh Token') ||
    message.includes('Invalid') ||
    message.includes('JWT') ||
    message.includes('unauthorized') ||
    message.includes('401')
  );
}

/**
 * Check if an error is a Realtime connection error
 */
export function isRealtimeConnectionError(error: any): boolean {
  const normalized = normalizeError(error, 'RealtimeConnectionCheck');
  if (normalized.type === ErrorType.NETWORK) return true;

  const message = error?.message || error?.toString() || '';
  return (
    message.includes('WebSocket') ||
    message.includes('connection') ||
    message.includes('CHANNEL_ERROR') ||
    message.includes('TIMED_OUT')
  );
}

/**
 * Check if an error should be suppressed from console
 */
function shouldSuppressError(error: any): boolean {
  const normalized = normalizeError(error);
  const message = error?.message || error?.toString() || '';
  
  // Suppress Realtime auth and connection errors as they're expected
  // Also suppress "Refresh Token Not Found" as it's handled gracefully by auth provider
  return (
    isRealtimeAuthError(error) ||
    isRealtimeConnectionError(error) ||
    message.includes('Refresh Token Not Found') ||
    (normalized.message ? normalized.message.includes('WebSocket is closed') : false)
  );
}

/**
 * Suppress expected console errors during development
 * This prevents noise in dev console for known, expected errors
 * DISABLED: Causes issues with console function context
 */
export function setupErrorSuppression() {
  // Error suppression disabled to avoid breaking console functionality
  // Expected errors like "Refresh Token Not Found" are handled gracefully by the auth provider
  return;
}
