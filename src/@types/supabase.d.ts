// Type re-exports from @supabase/supabase-js for convenience
// These types are actually from @supabase/auth-js but are re-exported by supabase-js

declare module '@supabase/supabase-js' {
  export type { Session, User } from '@supabase/auth-js';
}
