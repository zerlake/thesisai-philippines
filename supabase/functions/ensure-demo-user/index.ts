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

  console.log('ensure-demo-user function invoked for:', req.url); // Added logging

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, firstName, lastName, role } = await req.json() as RequestBody;

    // 1. Delete existing user to ensure a clean state
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find((u: { email?: string }) => u.email === email);
    if (existingUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id, true); // hard-delete
    }

    // 2. Create new auth user
    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;
    if (!newUser) throw new Error("User creation did not return a user object.");

    // 3. Upsert the profile
    const profileData = {
      id: newUser.id,
      first_name: firstName,
      last_name: lastName,
      role: role,
      plan: 'pro_complete', // Assign top-tier plan
      free_student_slots: role === 'advisor' ? 2 : 0,
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ message: "Demo user ensured successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in ensure-demo-user function:", error)
    
    let message = "An unknown error occurred.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = String((error as { message: unknown }).message || JSON.stringify(error));
    }

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})