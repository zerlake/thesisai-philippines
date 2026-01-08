// supabase/functions/assign-demo-users-premium/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

interface DemoUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  plan_type: string;
  subscription_status: string;
  is_pro_user: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  updatedUsers?: DemoUser[];
  error?: string;
}

async function assignDemoUsersPremium() {
  try {
    // Query to find all demo users
    const { data: demoUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, role, plan, plan_type, subscription_status, is_pro_user')
      .or('email.ilike.%demo%,email.ilike.%admin%,email.ilike.%advisor%,email.ilike.%critic%');

    if (fetchError) {
      throw new Error(`Error fetching demo users: ${fetchError.message}`);
    }

    if (!demoUsers || demoUsers.length === 0) {
      return {
        success: true,
        message: 'No demo users found to update',
        updatedUsers: []
      };
    }

    // Prepare updates for each demo user
    const updates = demoUsers.map(user => {
      // Determine role based on email pattern
      let newRole = 'user'; // Default to user
      if (user.email.includes('demo-admin') || user.email.includes('admin@thesisai')) {
        newRole = 'admin';
      } else if (user.email.includes('advisor') || user.email.includes('demo-advisor')) {
        newRole = 'advisor';
      } else if (user.email.includes('critic')) {
        newRole = 'critic';
      }
      // For all other demo users, keep as 'user' which will be set below

      return {
        id: user.id,
        role: newRole,
        plan: 'premium', // Set to premium for all demo users
        plan_type: 'premium', // Required for premium access
        subscription_status: 'active', // Required for premium access
        is_pro_user: true, // Required for premium access
        updated_at: new Date().toISOString()
      };
    });

    // Update all demo users in a single operation
    const { data: updatedUsers, error: updateError } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' })
      .select('id, email, role, plan, plan_type, subscription_status, is_pro_user');

    if (updateError) {
      throw new Error(`Error updating demo users: ${updateError.message}`);
    }

    return {
      success: true,
      message: `Successfully updated ${updatedUsers?.length || 0} demo users to premium access`,
      updatedUsers: updatedUsers as DemoUser[]
    };
  } catch (error) {
    console.error('Error in assignDemoUsersPremium:', error);
    return {
      success: false,
      message: 'Failed to assign premium access to demo users',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main request handler
async function handleRequest(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      }
    });
  }

  try {
    // Verify the request is authorized (you might want to add authentication here)
    // For now, we'll just proceed with the update

    const result = await assignDemoUsersPremium();

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        status: result.success ? 200 : 500
      }
    );
  } catch (error) {
    console.error('Unexpected error in handler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        status: 500
      }
    );
  }
}

// Start the server
serve(handleRequest);