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

  console.log('ensure-demo-user: Function invoked.');

  try {
    const { email, password, firstName, lastName, role } = await req.json() as RequestBody;
    console.log('ensure-demo-user: Received request for email:', email, 'role:', role);

    if (!email || !password || !firstName || !lastName || !role) {
      console.error('ensure-demo-user: Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Delete existing user to ensure a clean state
    console.log('ensure-demo-user: Listing users to check for existing user...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('ensure-demo-user: Error listing users:', listError);
      throw listError;
    }
    const existingUser = users.find((u: { email?: string }) => u.email === email);
    if (existingUser) {
      console.log('ensure-demo-user: Deleting existing user:', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id, true); // true to hard-delete
      console.log('ensure-demo-user: Existing user deleted.');
    } else {
      console.log('ensure-demo-user: No existing user found.');
    }

    // 2. Create new auth user
    console.log('ensure-demo-user: Creating new auth user...');
    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error('ensure-demo-user: Error creating user:', createError);
      throw createError;
    }
    if (!newUser) {
      console.error('ensure-demo-user: User creation did not return a user object.');
      throw new Error("User creation did not return a user object.");
    }
    console.log('ensure-demo-user: New user created:', newUser.id);

    // 3. Upsert the profile to avoid race condition with the trigger
    console.log('ensure-demo-user: Upserting profile for new user...');
    const profileData = {
      id: newUser.id,
      first_name: firstName,
      last_name: lastName,
      role: role,
      plan: 'pro_plus_advisor', // Assign the top-tier plan to all demo users
      free_student_slots: role === 'advisor' ? 2 : 0,
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error('ensure-demo-user: Error upserting profile:', profileError);
      // Clean up the created auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.id, true);
      throw profileError;
    }
    console.log('ensure-demo-user: Profile upserted successfully.');

    return new Response(JSON.stringify({ message: "Demo user ensured successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("ensure-demo-user: Full error in ensure-demo-user:", error);
    
    let message = "An unknown error occurred.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      if ('message' in error) {
        message = String((error as { message: unknown }).message);
      } else {
        message = `Non-standard error object: ${JSON.stringify(error)}`;
      }
    } else {
      message = `Unexpected error type: ${String(error)}`;
    }

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})