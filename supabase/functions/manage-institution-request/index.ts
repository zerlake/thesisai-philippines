// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Inlined CORS utility
const ALLOWED_ORIGINS = [
  'https://thesisai-philippines.vercel.app',
  'http://localhost:3000', // For local development
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]; // Default to Vercel URL

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
  };
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

    // 1. Admin check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (callerError || !callerProfile || callerProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { request_id, action } = await req.json()
    if (!request_id || !['approve', 'decline'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch the request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('institution_requests')
      .select('*')
      .eq('id', request_id)
      .single()
    if (requestError || !request) throw new Error('Request not found.')

    if (action === 'approve') {
      // 3a. Create the new institution
      const { data: newInstitution, error: createError } = await supabaseAdmin
        .from('institutions')
        .insert({ name: request.name })
        .select('id')
        .single()
      if (createError) throw createError

      // 3b. Update the requesting user's profile
      if (request.requested_by) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ institution_id: newInstitution.id })
          .eq('id', request.requested_by)
        if (profileError) console.error('Failed to link user to new institution:', profileError)
      }
    }

    // 4. Update the request status
    const newStatus = action === 'approve' ? 'approved' : 'declined';
    const { error: updateError } = await supabaseAdmin
      .from('institution_requests')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', request_id)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: `Request ${newStatus}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in manage-institution-request function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})