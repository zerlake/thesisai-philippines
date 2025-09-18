// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, method, details } = await req.json();
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