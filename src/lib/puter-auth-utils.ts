/**
 * LEGACY Puter.js authentication utilities - DEPRECATED
 *
 * This file contains the old authentication approach that extracted tokens from localStorage
 * and passed them to backend APIs. This approach is no longer recommended as Puter.js has
 * updated their security model to keep authentication tokens within the SDK.
 *
 * Use the new hook-based authentication in `src/hooks/use-puter-auth.ts` instead.
 */

/**
 * LEGACY: Get the Puter.js authentication token from localStorage
 * @deprecated Use the new usePuterAuth hook instead
 * @returns The Puter auth token or null if not available
 */
export function getPuterAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try the primary storage key first
  let token = localStorage.getItem('puter.auth.token');
  if (token) return token;

  // Try alternative storage key
  token = localStorage.getItem('puter_user_token');
  if (token) return token;

  return null;
}

/**
 * LEGACY: Check if user is Puter.js authenticated
 * @deprecated Use the new usePuterAuth hook instead
 * @returns Boolean indicating authentication status
 */
export function isPuterAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for legacy authentication tokens
  if (getPuterAuthToken()) {
    return true;
  }

  // Check for modern SDK-based authentication marker
  const sdkAuthMarker = localStorage.getItem('puter.auth.user');
  if (sdkAuthMarker) {
    return true;
  }

  return false;
}

/**
 * LEGACY: Asynchronously verify Puter.js authentication status
 * @deprecated Use the new usePuterAuth hook instead
 * @returns Promise<boolean> indicating authentication status
 */
export async function verifyPuterAuthentication(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.puter || !window.puter.auth) {
    return false;
  }

  try {
    // Try to get user data from the SDK
    const userData = await window.puter.auth.getUser();
    return !!userData;
  } catch (error) {
    return false;
  }
}

/**
 * LEGACY: Validate and refresh Puter token if needed
 * @deprecated Use the new usePuterAuth hook instead
 * @returns Promise that resolves to a valid token or null if unable to refresh
 */
export async function validateAndRefreshPuterToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // First, try to get the current token
  const currentToken = getPuterAuthToken();
  if (!currentToken) return null;

  // If refresh isn't possible, return current token
  return currentToken;
}

