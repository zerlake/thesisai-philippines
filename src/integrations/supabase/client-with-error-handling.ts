import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Global flag to track if we've already shown a network error toast recently
// to prevent spamming the user with multiple toasts for the same network issue
let lastNetworkErrorTime = 0;
const NETWORK_ERROR_THROTTLE_MS = 30000; // 30 seconds

// Create the base Supabase client
export const baseSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Create a wrapper that handles network errors globally
const createSupabaseClientWithErrorHandling = (): SupabaseClient => {
  // This is a simplified approach - in practice, Supabase client methods can't be easily wrapped
  // So instead, we'll set up global error handling for the base client
  return baseSupabase;
};

// Set up global error handling for network errors
const setupGlobalErrorHandling = () => {
  // Capture unhandled Promise rejections, which might include network errors
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    // Check if the error is a network error related to Supabase
    if (reason && 
        (reason.message || reason.toString()) && 
        ((reason.message && (reason.message.includes("Failed to fetch") || reason.message.includes("NetworkError"))) ||
         (reason.toString().includes("Failed to fetch") || reason.toString().includes("NetworkError")))) {
      
      const now = Date.now();
      // Only show toast every 30 seconds to avoid spam
      if (now - lastNetworkErrorTime > NETWORK_ERROR_THROTTLE_MS) {
        lastNetworkErrorTime = now;
        console.warn("Network error detected (likely Supabase connection):", reason.message || reason);
        toast.warning("You are currently offline. Some features may not work until connection is restored.", {
          id: "network-error-warning",
          duration: 5000
        });
      }
      
      // Prevent the default browser behavior for unhandled rejections
      event.preventDefault();
    }
  });

  // Set up a more direct approach: override fetch to catch network errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (error: any) {
      // Check if this is a network error related to Supabase
      if (error && 
          (error.message || error.toString()) && 
          ((error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) ||
           (error.toString().includes("Failed to fetch") || error.toString().includes("NetworkError")))) {
        
        const now = Date.now();
        // Only show toast every 30 seconds to avoid spam
        if (now - lastNetworkErrorTime > NETWORK_ERROR_THROTTLE_MS) {
          lastNetworkErrorTime = now;
          console.warn("Network error in fetch:", error.message || error);
          toast.warning("Connection to server failed. Working in offline mode.", {
            id: "network-error-warning",
            duration: 5000
          });
        }
      }
      // Re-throw the error so the calling code can handle it appropriately
      throw error;
    }
  };
};

// Initialize global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}

export const supabase = baseSupabase;