"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { loadPuterSDK, isPuterSDKLoaded } from '@/utils/puter-sdk-loader';

// Module-level variable to track if the initial auth check has been performed globally
let hasPerformedInitialAuthCheck = false;

// Track last auth check time to debounce calls
let lastAuthCheckTime = 0;
const AUTH_CHECK_DEBOUNCE_MS = 2000; // 2 seconds debounce

// Track the last time a 401 error occurred to implement backoff
let last401ErrorTime = 0;
const ERROR_BACKOFF_MS = 10000; // 10 seconds backoff after 401 error

interface PuterContextType {
  puterReady: boolean;
  puterUser: Record<string, any> | null;
  isAuthenticated: boolean;
  initializePuter: () => Promise<boolean>;
  signIn: () => Promise<Record<string, any> | null | undefined>;
  signOut: () => Promise<void>;
  loading: boolean;
  checkAuth: () => Promise<Record<string, any> | null>;
}

const PuterContext = createContext<PuterContextType | undefined>(undefined);

export function PuterProvider({ children }: { children: ReactNode }) {
  const [puterReady, setPuterReady] = useState(false);
  const [puterUser, setPuterUser] = useState<null | Record<string, any>>(null);
  const [loading, setLoading] = useState(false);

    // Don't automatically load the SDK on component mount
  // Instead, make SDK loading lazy and only when needed

  // Function to initialize the SDK when actually needed
  const initializePuterSDK = useCallback(async (): Promise<boolean> => {
    if (puterReady) return true; // Already initialized

    try {
      // Load the Puter SDK dynamically
      await loadPuterSDK();

      // Check if Puter SDK is available after loading
      if (typeof window !== 'undefined' && window.puter && window.puter.auth) {
        setPuterReady(true);
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Failed to initialize Puter SDK:", error);
      return false;
    }
  }, []);

  const signIn = useCallback(async (): Promise<Record<string, any> | null | undefined> => {
    // Initialize SDK if not ready
    const sdkReady = await initializePuterSDK();
    if (!sdkReady) {
      console.error("Puter SDK not ready after initialization attempt");
      return;
    }

    setLoading(true);
    try {
      const user = await window.puter.auth.signIn();
      // Check if user is an empty object
      if (user && typeof user === 'object' && Object.keys(user).length === 0) {
        setPuterUser(null);
        return null;
      }
      setPuterUser(user);
      return user;
    } catch (error: any) {
      // Check if error is an empty object
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.error("Sign in failed: Empty object error received");
        throw new Error("Sign in failed due to service unavailability. Please try again later.");
      }
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [puterReady, initializePuterSDK]);

  const signOut = useCallback(async () => {
    if (!puterReady) {
      // Initialize SDK if not ready, but we can't sign out if there's no SDK
      const sdkReady = await initializePuterSDK();
      if (!sdkReady) {
        console.error("Puter SDK not available for sign out");
        return;
      }
    }

    setLoading(true);
    try {
      await window.puter.auth.signOut();
      setPuterUser(null);
    } catch (error: any) {
      // Check if error is an empty object
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.error("Sign out failed: Empty object error received");
        setPuterUser(null);
        throw new Error("Sign out failed due to service unavailability. Please try again later.");
      }
      console.error("Sign out failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [puterReady, initializePuterSDK]);

  const checkAuth = useCallback(async (bypassDebounce = false) => {
    const now = Date.now();

    // Check if we're in an error backoff period after a 401
    if (now - last401ErrorTime < ERROR_BACKOFF_MS && !bypassDebounce) {
      // Return current state during backoff period
      return puterUser;
    }

    // Debounce check to prevent rapid API calls, unless explicitly bypassed
    if (!bypassDebounce && now - lastAuthCheckTime < AUTH_CHECK_DEBOUNCE_MS) {
      // Return current state if called too recently
      return puterUser;
    }
    lastAuthCheckTime = now;

    if (!puterReady) {
      const sdkReady = await initializePuterSDK();
      if (!sdkReady) {
        console.warn("Puter SDK not available for auth check");
        setPuterUser(null);
        return null;
      }
    }

    try {
      const user = await window.puter.auth.getUser();
      // Reset the error backoff timer on successful response
      last401ErrorTime = 0;

      // Check if user is an empty object
      if (user && typeof user === 'object' && Object.keys(user).length === 0) {
        setPuterUser(null);
        return null;
      }
      setPuterUser(user);
      return user;
    } catch (error: any) {
      // Check if error is an empty object or is an auth error
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        setPuterUser(null);
        return null;
      }

      // Don't log authentication errors as warnings since they're expected
      // when user is not authenticated with Puter (401 Unauthorized is normal)
      if (error?.status === 401 || error?.message?.includes?.('401') || error?.message?.includes?.('Unauthorized')) {
        setPuterUser(null);
        // Track when this 401 error occurred for backoff
        last401ErrorTime = now;
        return null;
      }

      // Log other errors that are not auth-related
      console.warn("Error in Puter auth check:", error);
      setPuterUser(null);
      return null;
    }
  }, [puterReady, puterUser, initializePuterSDK]);

  useEffect(() => {
    initializePuterSDK();
  }, [initializePuterSDK]);

  return (
    <PuterContext.Provider value={{
      puterReady,
      puterUser,
      isAuthenticated: !!puterUser,
      initializePuter: initializePuterSDK,
      signIn,
      signOut,
      loading,
      checkAuth  // Use the original checkAuth function for consumers
    }}>
      {children}
    </PuterContext.Provider>
  );
}

export function usePuterContext() {
  const context = useContext(PuterContext);
  if (!context) {
    throw new Error('usePuterContext must be used within PuterProvider');
  }
  return context;
}