'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

/**
 * Hook to get current authenticated user from Supabase
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoaded: false,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setState(prev => ({
        ...prev,
        isLoaded: true,
        error: new Error('Supabase configuration missing'),
      }));
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let isMounted = true;

    const getUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (isMounted) {
          if (session?.user) {
            setState({
              user: {
                id: session.user.id,
                email: session.user.email,
                ...session.user.user_metadata,
              },
              isLoaded: true,
              isAuthenticated: true,
              error: null,
            });
          } else {
            setState({
              user: null,
              isLoaded: true,
              isAuthenticated: false,
              error: null,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoaded: true,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email,
              ...session.user.user_metadata,
            },
            isLoaded: true,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setState({
            user: null,
            isLoaded: true,
            isAuthenticated: false,
            error: null,
          });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return state;
}
