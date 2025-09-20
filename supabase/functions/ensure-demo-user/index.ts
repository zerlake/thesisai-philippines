// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, firstName, lastName, role } = await req.json();

    if (!email || !password || !firstName || !lastName || !role) {
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
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    const existingUser = users.find((u: { email?: string }) => u.email === email);
    if (existingUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id, true); // true to hard-delete
    }

    // 2. Create new auth user
    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;
    if (!newUser) throw new Error("User creation did not return a user object.");

    // 3. Upsert the profile to avoid race condition with the trigger
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
      // Clean up the created auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.id, true);
      throw profileError;
    }

    return new Response(JSON.stringify({ message: "Demo user ensured successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Full error in ensure-demo-user:", error);
    
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