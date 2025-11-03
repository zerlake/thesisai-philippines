// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

interface RequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('ensure-demo-user function invoked for:', req.url); // Added logging

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase configuration environment variables');
      throw new Error('Missing Supabase configuration environment variables');
    }

    console.log('Creating Supabase client with provided URLs'); // Debug logging
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, firstName, lastName, role } = await req.json() as RequestBody;

    console.log(`Attempting to ensure demo user: ${email}, role: ${role}`); // Debug logging

    // 1. Check for existing user with the same email
    // Only proceed with user listing if needed for cleanup
    let existingUser = null;
    
    // Try to get existing user by email - Supabase doesn't have a direct search by email,
    // so we'll try to list all users and find by email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.warn("Could not list users: ", listError.message);
      // Continue without cleanup if we can't list users
    } else if (listData && Array.isArray(listData.users)) {
      existingUser = listData.users.find((u: any) => u.email === email) || null;
      if (existingUser) {
        console.log(`Found existing user to delete: ${existingUser.id}`); // Debug logging
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id, true); // hard-delete
        if (deleteError) {
          console.warn("Could not delete existing user: ", deleteError.message);
        } else {
          console.log(`Successfully deleted existing user: ${existingUser.id}`); // Debug logging
        }
      }
    }

    // 2. Create new auth user
    console.log('Creating new user...'); // Debug logging
    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }
    
    if (!newUser) {
      throw new Error("User creation did not return a user object.");
    }

    console.log(`User created successfully: ${newUser.id}`); // Debug logging

    // 3. Upsert the profile
    const profileData = {
      id: newUser.id,
      first_name: firstName,
      last_name: lastName,
      role: role,
      plan: 'pro_complete', // Assign top-tier plan
      free_student_slots: role === 'advisor' ? 2 : 0,
    };

    console.log('Upserting profile...'); // Debug logging
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error("Error upserting profile:", profileError);
      throw profileError;
    }

    console.log("Demo user created successfully:", newUser.id);
    
    return new Response(JSON.stringify({ 
      message: "Demo user ensured successfully",
      userId: newUser.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ensure-demo-user function:", error);
    
    let message = "An unknown error occurred.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle potential non-Error objects
      message = String((error as { message?: string }).message || JSON.stringify(error));
    }

    return new Response(JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})