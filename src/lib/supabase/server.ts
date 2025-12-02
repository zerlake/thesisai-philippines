// This file provides a server-side Supabase client for use in Next.js API routes
// It's an alias to the actual implementation to maintain compatibility with different import styles
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

// Export the same client creation function with a different name to match expected import
export const createClient = createServerSupabaseClient;

// Also export the original function for consistency
export { createServerSupabaseClient };