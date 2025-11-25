// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || Deno.env.get('NEXT_PUBLIC_VERCEL_URL') || 'http://localhost:3000',
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

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  return new Response(JSON.stringify({ 
    error: 'Title generation feature is not available. Please use the paraphrasing tool instead.' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 503,
  });
})
