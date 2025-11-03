// Path: src/services/userPreferences.ts
// Usage: import { getUserPreference } from '@/services/userPreferences';

// Adjust import path if you don't use the '@' alias.

import { supabase } from "../integrations/supabase/client-with-error-handling";
export async function getUserPreference(userId: string | null) {
  if (!userId) return null;
  
  // Validate UUID format to prevent malformed requests
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn("Invalid UUID format for user preferences query:", userId);
    return null;
  }
  
  try {
    const { data: preference, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      // Handle the 406 error specifically and other common errors
      if (error.status === 406 || error.status === 404 || error.code === 'PGRST116') {
        // User doesn't have preferences yet, which is fine
        console.debug("No user preferences found for user:", userId);
        return null;
      }
      // Handle network errors specifically
      if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
        console.warn("Network error fetching user preferences:", error.message);
        return null; // Return null instead of throwing on network errors
      }
      console.error("Error fetching user preferences:", error);
      return null; // Don't throw, just return null for any error
    }
    return preference;
  } catch (error: any) {
    console.error("Unexpected error in getUserPreference:", error);
    return null; // Return null for any unexpected errors
  }
}
