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
  amount: number;
  method: string;
  details: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, method, details } = await req.json() as RequestBody;
    if (!amount || typeof amount !== 'number' || amount <= 0 || !method || !details) {
      throw new Error('A valid amount, payout method, and details are required.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const jwt = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the user's JWT to call the RPC function
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data, error } = await supabase.rpc('request_payout', {
      request_amount: amount,
      method: method,
      details: details
    });

    if (error) throw error;

    // Log the payout request event
    try {
      // Get user info to include in audit log
      const { data: { user } } = await supabase.auth.getUser(jwt);

      // Send audit log request to our API endpoint
      const auditLogResponse = await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_BASE_URL')}/api/admin/audit-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` // Use service role
        },
        body: JSON.stringify({
          action: 'payout_requested',
          userId: user?.id,
          resourceType: 'payout_request',
          resourceId: data?.request_id || 'unknown', // Assuming the RPC returns a request ID
          severity: 'info',
          details: {
            amount: amount,
            payout_method: method,
            payout_details: details,
            target_user_id: user?.id
          },
          ipAddress: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown',
          userAgent: req.headers.get('User-Agent') || 'unknown'
        })
      });

      if (!auditLogResponse.ok) {
        console.error('Failed to log audit event:', await auditLogResponse.text());
      }
    } catch (auditError) {
      console.error('Error logging audit event:', auditError);
    }

    return new Response(JSON.stringify({ message: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in request-payout function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})