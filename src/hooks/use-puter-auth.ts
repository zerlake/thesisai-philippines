import { useEffect, useState, useCallback } from "react";
import { normalizeError, isAuthError } from "@/utils/error-utilities";

// Module-level variable to track if the initial auth check has been performed globally
// to prevent multiple API calls from different instances of this hook
let globalHasCheckedAuth = false;

// Track last auth check time to debounce calls
let lastAuthCheckTime = 0;
const AUTH_CHECK_DEBOUNCE_MS = 2000; // 2 seconds debounce

// Track the last time a 401 error occurred to implement backoff
let last401ErrorTime = 0;
const ERROR_BACKOFF_MS = 10000; // 10 seconds backoff after 401 error

// Custom hook to ensure puter is loaded and manage user auth state
export function usePuterAuth() {
  const [puterReady, setPuterReady] = useState(false);
  const [puterUser, setPuterUser] = useState<null | Record<string, any>>(null);
  const [loading, setLoading] = useState(false);

  // Wait for SDK to load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number | null = null;

    // Check if Puter SDK is already available (e.g., loaded in _document.tsx)
    if (typeof window !== 'undefined' && window.puter && window.puter.auth) {
      setPuterReady(true);
      // Only check auth if we haven't done so globally already
      // and if we're not in an error backoff period
      const now = Date.now();
      if (!globalHasCheckedAuth && now - last401ErrorTime >= ERROR_BACKOFF_MS) {
        globalHasCheckedAuth = true;
        // Get current user status
        window.puter.auth.getUser()
          .then((user: Record<string, any>) => {
            // Reset error backoff timer on success
            last401ErrorTime = 0;
            // Check if user is an empty object
            if (user && typeof user === 'object' && Object.keys(user).length === 0) {
              setPuterUser(null);
            } else {
              setPuterUser(user);
            }
          })
          .catch(() => {
            // Set error time if it was a 401
            const currentErrorTime = Date.now();
            last401ErrorTime = currentErrorTime;
            setPuterUser(null);
          });
      } else if (globalHasCheckedAuth) {
        // If we already checked globally, just use the current state
        // but don't make another API call during backoff period
      }
    } else {
      // Wait for SDK to load with exponential backoff approach
      const checkForSDK = () => {
        if (typeof window !== 'undefined' && window.puter && window.puter.auth) {
          setPuterReady(true);
          // Only check auth if we haven't done so globally already
          // and if we're not in an error backoff period
          const now = Date.now();
          if (!globalHasCheckedAuth && now - last401ErrorTime >= ERROR_BACKOFF_MS) {
            globalHasCheckedAuth = true;
            // Get current user status
            window.puter.auth.getUser()
              .then((user: Record<string, any>) => {
                // Reset error backoff timer on success
                last401ErrorTime = 0;
                // Check if user is an empty object
                if (user && typeof user === 'object' && Object.keys(user).length === 0) {
                  setPuterUser(null);
                } else {
                  setPuterUser(user);
                }
              })
              .catch(() => {
                // Set error time if it was a 401
                const currentErrorTime = Date.now();
                last401ErrorTime = currentErrorTime;
                setPuterUser(null);
              });
          } else if (globalHasCheckedAuth) {
            // If we already checked globally, just use the current state
            // but don't make another API call during backoff period
          }
        } else {
          // Try again with longer interval to avoid excessive polling
          timeoutId = setTimeout(checkForSDK, 500); // Increased from 200ms to 500ms
        }
      };

      timeoutId = setTimeout(checkForSDK, 100); // Initial delay before first check

      // Clean up timeout
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, []);

  const signIn = useCallback(async (): Promise<Record<string, any> | null | undefined> => {
    if (!puterReady) {
      console.error("Puter SDK not ready");
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
       const normalized = normalizeError(error, 'usePuterAuth.signIn');
       console.error("Sign in failed:", normalized.message);
       throw error;
     } finally {
       setLoading(false);
     }
  }, [puterReady]);

  const signOut = useCallback(async () => {
    if (!puterReady) {
      console.error("Puter SDK not ready");
      return;
    }

    setLoading(true);
    try {
      await window.puter.auth.signOut();
      setPuterUser(null);
    } catch (error: any) {
      const normalized = normalizeError(error, 'usePuterAuth.signOut');
      console.error("Sign out failed:", normalized.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [puterReady]);

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
      return null;
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
      const normalized = normalizeError(error, 'usePuterAuth.checkAuth');

      // Don't log authentication errors as they're expected when user isn't authenticated
      if (isAuthError(normalized)) {
        setPuterUser(null);
        // Track when this 401 error occurred for backoff
        last401ErrorTime = now;
        return null;
      }

      setPuterUser(null);
      return null;
    }
  }, [puterReady, puterUser]);

  return {
    puterReady,
    puterUser,
    signIn,
    signOut,
    loading,
    isAuthenticated: !!puterUser,
    checkAuth
  };
}