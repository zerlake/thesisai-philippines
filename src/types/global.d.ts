// Global type definitions for the application

import { Database } from '@/types/database.types';

// Extend the Supabase client types
declare global {
  // Supabase types
  type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
  type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
  type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
  type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

  // Add any other global types that might be needed
  interface Window {
    pdfjsLib: any;
  }
}

export {};