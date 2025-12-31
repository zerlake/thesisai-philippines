// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || 'https://thesisai-philippines.vercel.app',
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
  request_id: string;
  action: 'approve' | 'decline';
  rejection_reason?: string;
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

    const { request_id, action } = await req.json() as RequestBody;
    if (!request_id || !['approve', 'decline'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch the request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('payout_requests')
      .select('user_id, amount, status')
      .eq('id', request_id)
      .single()
    if (requestError || !request) throw new Error('Request not found.')
    if (request.status !== 'pending') throw new Error('This request has already been processed.')

    if (action === 'decline') {
      // Refund the credits to the user
      const { error: refundError } = await supabaseAdmin.rpc('increment_credit_balance', {
        user_id_to_update: request.user_id,
        amount_to_add: request.amount
      })
      if (refundError) throw new Error(`Failed to refund credits: ${refundError.message}`)
    }

    // 3. Update the request status
    const newStatus = action === 'approve' ? 'processed' : 'declined';
    const { error: updateError } = await supabaseAdmin
      .from('payout_requests')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', request_id)
    if (updateError) throw updateError

    // 4. Get user profile to send notification
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', request.user_id)
      .single();

    if (profileError || !userProfile) {
      console.error('Could not fetch user profile for notification:', profileError);
    } else {
      // 5. Create notification for the user
      const notificationTitle = action === 'approve'
        ? 'Payout Request Approved'
        : 'Payout Request Rejected';

      const notificationMessage = action === 'approve'
        ? `Your payout request for ₱${request.amount} has been approved and will be processed within 3-5 business days.`
        : `Your payout request for ₱${request.amount} has been rejected. Reason: ${reqBody.rejection_reason || 'General review'}. You may contact support or contest this decision.`;

      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: request.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: action === 'approve' ? 'success' : 'error',
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    // TODO: In a full implementation, log this action to the audit trail
    // For now, audit logging happens in the client-side code

    return new Response(JSON.stringify({ message: `Request ${newStatus}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in manage-payout-request function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})