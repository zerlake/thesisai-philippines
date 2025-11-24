"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface PuterContextType {
  puterReady: boolean;
  puterUser: Record<string, any> | null;
  isAuthenticated: boolean;
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

  // Wait for SDK to load
  useEffect(() => {
    // Check if Puter SDK is already available (e.g., loaded in layout.tsx)
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
      // Check if error is an empty object
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        setPuterUser(null);
        return null;
      }
      setPuterUser(null);
      return null;
    }
  }, [puterReady]);

  return (
    <PuterContext.Provider value={{
      puterReady,
      puterUser,
      isAuthenticated: !!puterUser,
      signIn,
      signOut,
      loading,
      checkAuth
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
