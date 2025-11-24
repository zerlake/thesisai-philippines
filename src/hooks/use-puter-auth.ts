import { useEffect, useState, useCallback } from "react";
import { normalizeError, isAuthError } from "@/utils/error-utilities";

// Custom hook to ensure puter is loaded and manage user auth state
export function usePuterAuth() {
  const [puterReady, setPuterReady] = useState(false);
  const [puterUser, setPuterUser] = useState<null | Record<string, any>>(null);
  const [loading, setLoading] = useState(false);

  // Wait for SDK to load
  useEffect(() => {
    // Check if Puter SDK is already available (e.g., loaded in _document.tsx)
    if (typeof window !== 'undefined' && window.puter && window.puter.auth) {
      setPuterReady(true);
      // Get current user status
      window.puter.auth.getUser()
        .then((user: Record<string, any>) => {
          // Check if user is an empty object
          if (user && typeof user === 'object' && Object.keys(user).length === 0) {
            setPuterUser(null);
          } else {
            setPuterUser(user);
          }
        })
        .catch(() => setPuterUser(null));
    } else {
      // Wait for SDK to load
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.puter && window.puter.auth) {
          setPuterReady(true);
          // Get current user status
          window.puter.auth.getUser()
            .then((user: Record<string, any>) => {
              // Check if user is an empty object
              if (user && typeof user === 'object' && Object.keys(user).length === 0) {
                setPuterUser(null);
              } else {
                setPuterUser(user);
              }
            })
            .catch(() => setPuterUser(null));
          clearInterval(interval);
        }
      }, 200);

      // Clean up interval
      return () => clearInterval(interval);
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

  const checkAuth = useCallback(async () => {
    if (!puterReady) {
      return null;
    }

    try {
      const user = await window.puter.auth.getUser();
      // Check if user is an empty object
      if (user && typeof user === 'object' && Object.keys(user).length === 0) {
        setPuterUser(null);
        return null;
      }
      setPuterUser(user);
      return user;
    } catch (error: any) {
      const normalized = normalizeError(error, 'usePuterAuth.checkAuth');
      if (isAuthError(normalized)) {
      } else {
      }
      setPuterUser(null);
      return null;
    }
  }, [puterReady]);

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