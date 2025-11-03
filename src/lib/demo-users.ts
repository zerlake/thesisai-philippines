import { supabase } from "@/integrations/supabase/client";

// Function to create demo users in the local Supabase database
export async function createDemoUsers() {
  // First check if we're in a browser environment (client-side only)
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called from the browser');
  }

  // The ensure-demo-user Edge Function currently only supports student, advisor, and critic roles
  // Admin needs to be handled separately or the function needs to be updated
  const demoUserRoles = ["student", "advisor", "critic", "admin"];

  const results = [];

  for (const role of demoUserRoles) {
    try {
      // Use the Edge Function which has service role privileges
      // The ensure-demo-user function expects just the role parameter
      const { data, error, status } = await supabase.functions.invoke("ensure-demo-user", {
        body: {
          role: role
        },
        method: "POST",
      });

      if (error) {
        // Handle network errors specifically
        if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
          console.warn(`Network error creating ${role} user via Edge Function:`, error.message);
          results.push({ 
            email: `demo-${role}@thesis.ai`, 
            role,
            success: false, 
            error: `Network error: Unable to connect to ensure-demo-user function (${error.message})`
          });
          continue;
        }
        
        console.error(`Error creating ${role} user via Edge Function:`, error);
        console.error(`Status code: ${status}`);
        
        // More specific error message for the FunctionsHttpError
        let errorMessage = `Edge Function error: ${error.message || 'Unknown error'}`;
        if (status === 404) {
          errorMessage += ' (ensure-demo-user function not found - make sure your Supabase functions are deployed)';
        } else if (status >= 500) {
          errorMessage += ' (server error - check your Supabase function logs)';
        } else if (status >= 400) {
          errorMessage += ` (client error - status code: ${status})`;
        }
        
        results.push({ 
          email: `demo-${role}@thesis.ai`, 
          role,
          success: false, 
          error: errorMessage
        });
        continue;
      }

      if (!data || !data.message) {
        const error = 'No response data returned from Edge Function after user creation';
        console.error(`Error creating ${role} user:`, error);
        results.push({ 
          email: `demo-${role}@thesis.ai`, 
          role,
          success: false, 
          error 
        });
        continue;
      }

      console.log(`Successfully created ${role} user:`, data.message);
      results.push({ 
        email: `demo-${role}@thesis.ai`, 
        role,
        success: true, 
        error: null 
      });
    } catch (error: any) {
      console.error(`Unexpected error creating ${role} user via Edge Function:`, error);
      results.push({ 
        email: `demo-${role}@thesis.ai`, 
        role,
        success: false, 
        error: error.message || (typeof error === 'object' && error !== null 
          ? JSON.stringify(error, Object.getOwnPropertyNames(error)) 
          : error || 'Unknown error') 
      });
    }
  }

  return results;
}