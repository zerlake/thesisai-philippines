// src/lib/auth-utils.ts
import { createBrowserClient } from '@supabase/ssr';

/**
 * Utility functions for handling authentication in a way that's compatible
 * with both client-side and server-side rendering
 */

// Function to get the Supabase client in a way that's compatible with both CSR and SSR
export function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    // Client-side: use browser client
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } else {
    // Server-side: return null or throw error since we can't access browser storage server-side
    return null;
  }
}

// Function to verify if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') {
    // On the server, we can't check auth state directly
    // This should be handled by server-side session management
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: { session } } = await supabase.auth.getSession();
  
  return !!session && !(!session || (session.expires_at && Date.now() >= session.expires_at * 1000));
}

// Function to check if user has admin role
export async function isAdminUser(): Promise<boolean> {
  if (!(await isAuthenticated())) {
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return false;

  // Get user role from database
  const { data, error } = await supabase
    .from('profiles') // Assuming there's a profiles table
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }

  return data?.role === 'admin';
}

// Function to get session token (only available on the client)
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Retrieve token from localStorage, cookie, or other client-side storage
  return (
    localStorage.getItem('sb-access-token') ||
    sessionStorage.getItem('sb-access-token') ||
    null
  );
}

// Function that abstracts auth checking with proper error handling
export async function withAuthValidation<T>(
  fn: (token: string) => Promise<T>,
  requireAdmin: boolean = false
): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('Authentication can only be validated on the client side');
  }

  const token = getSessionToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  if (requireAdmin && !(await isAdminUser())) {
    throw new Error('Admin access required');
  }

  return fn(token);
}