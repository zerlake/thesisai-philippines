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

interface CreateRequestPayload {
  critic_email: string;
}

interface RespondRequestPayload {
  request_id: string;
}

interface RequestBody {
  action: 'create' | 'accept' | 'decline';
  critic_email?: string;
  request_id?: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    const { action, ...payload } = await req.json() as RequestBody;

    // Student action: create a request
    if (action === 'create') {
      const { critic_email } = payload as CreateRequestPayload;
      if (!critic_email) throw new Error("Critic email is required.");

      // Check if critic exists and has the correct role
      const { data: criticUser } = await supabaseAdmin.auth.admin.getUserByEmail(critic_email);
      if (!criticUser || !criticUser.user) throw new Error("No critic found with this email.");
      
      const { data: criticProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', criticUser.user.id).single();
      if (!criticProfile || criticProfile.role !== 'critic') throw new Error("This user is not registered as a critic.");

      // Create the request
      const { error } = await supabaseAdmin.from('critic_requests').insert({ student_id: user.id, critic_email });
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Request sent successfully' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Critic action: accept or decline a request
    if (action === 'accept' || action === 'decline') {
      const { request_id } = payload as RespondRequestPayload;
      if (!request_id) throw new Error("Request ID is required.");

      // Verify the user is the intended critic
      const { data: request, error: requestError } = await supabaseAdmin.from('critic_requests').select('*').eq('id', request_id).single();
      if (requestError || !request) throw new Error("Request not found.");
      if (user.email !== request.critic_email) throw new Error("You are not authorized to respond to this request.");

      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      
      if (newStatus === 'accepted') {
        // Remove any existing relationship for this student
        await supabaseAdmin.from('critic_student_relationships').delete().eq('student_id', request.student_id);
        
        // Create the new relationship
        const { error: insertError } = await supabaseAdmin.from('critic_student_relationships').insert({ student_id: request.student_id, critic_id: user.id });
        if (insertError) throw insertError;
      }

      // Update the request status
      const { error: updateError } = await supabaseAdmin.from('critic_requests').update({ status: newStatus }).eq('id', request_id);
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ message: `Request ${newStatus}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in manage-critic-request function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})