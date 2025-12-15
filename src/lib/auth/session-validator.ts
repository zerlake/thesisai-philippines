/**
 * Session Validator Utility
 *
 * Provides robust session validation and token refresh handling to prevent
 * 401 Unauthorized errors in API calls.
 */

import { SupabaseClient, Session } from '@supabase/supabase-js';
import { logger } from '../logger';

export class SessionValidator {
  private static instance: SessionValidator;
  private refreshPromise: Promise<Session | null> | null = null;

  private constructor() {}

  static getInstance(): SessionValidator {
    if (!SessionValidator.instance) {
      SessionValidator.instance = new SessionValidator();
    }
    return SessionValidator.instance;
  }

  /**
   * Validates if the current session is valid and not expired
   */
  async validateSession(supabase: SupabaseClient): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.warn('Session validation error', { error: error.message });
        return false;
      }

      if (!session) {
        logger.debug('No active session found');
        return false;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiryTime = expiresAt * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;
        const fiveMinutes = 5 * 60 * 1000;

        if (timeUntilExpiry < fiveMinutes) {
          logger.info('Session expiring soon, refreshing token', {
            timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + 's'
          });
          await this.refreshSession(supabase);
          return true;
        }
      }

      logger.debug('Session is valid');
      return true;
    } catch (error) {
      logger.error('Session validation failed', error as Error);
      return false;
    }
  }

  /**
   * Refreshes the session token
   * Uses a singleton promise to prevent multiple simultaneous refresh attempts
   */
  async refreshSession(supabase: SupabaseClient): Promise<Session | null> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      logger.debug('Refresh already in progress, waiting for existing refresh');
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = (async () => {
      try {
        logger.info('Starting session refresh');

        const { data: { session }, error } = await supabase.auth.refreshSession();

        if (error) {
          logger.error('Session refresh failed', { error: error.message });
          throw error;
        }

        if (!session) {
          logger.warn('Session refresh returned no session');
          return null;
        }

        logger.info('Session refreshed successfully');
        return session;
      } catch (error) {
        logger.critical('Session refresh error', error as Error);
        throw error;
      } finally {
        // Clear the promise after completion
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Ensures a valid session exists before making an API call
   * Automatically refreshes if needed
   */
  async ensureValidSession(supabase: SupabaseClient): Promise<boolean> {
    try {
      const isValid = await this.validateSession(supabase);

      if (!isValid) {
        logger.warn('Session invalid, attempting refresh');
        const session = await this.refreshSession(supabase);
        return session !== null;
      }

      return true;
    } catch (error) {
      logger.error('Failed to ensure valid session', error as Error);
      return false;
    }
  }

  /**
   * Gets the current session with automatic refresh if needed
   */
  async getValidSession(supabase: SupabaseClient): Promise<Session | null> {
    const isValid = await this.ensureValidSession(supabase);

    if (!isValid) {
      logger.error('Unable to get valid session');
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}

// Export a singleton instance
export const sessionValidator = SessionValidator.getInstance();

/**
 * Wrapper for API calls that automatically ensures valid session
 */
export async function withValidSession<T>(
  supabase: SupabaseClient,
  operation: () => Promise<T>,
  operationName: string = 'API operation'
): Promise<T> {
  const isValid = await sessionValidator.ensureValidSession(supabase);

  if (!isValid) {
    logger.error(`${operationName}: No valid session available`);
    throw new Error('Authentication required. Please sign in again.');
  }

  try {
    logger.debug(`${operationName}: Executing with valid session`);
    return await operation();
  } catch (error: any) {
    // Check if it's a 401 error
    if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      logger.warn(`${operationName}: Received 401, attempting session refresh`);

      // Try to refresh and retry once
      const session = await sessionValidator.refreshSession(supabase);

      if (session) {
        logger.info(`${operationName}: Retrying after session refresh`);
        return await operation();
      } else {
        logger.error(`${operationName}: Session refresh failed, cannot retry`);
        throw new Error('Session expired. Please sign in again.');
      }
    }

    // For other errors, just rethrow
    throw error;
  }
}
