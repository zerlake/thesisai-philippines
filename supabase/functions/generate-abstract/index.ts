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

async function generateAbstractWithPuter(content: string): Promise<string> {
  const prompt = `You are an expert academic writer. Generate a concise, professional abstract (150-250 words) for the following thesis content:

"${content}"

Provide only the abstract text, without any preamble or explanation.`;

  try {
    const response = await Promise.race([
      fetch('https://api.puter.com/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: 0.5,
          max_tokens: 500,
        }),
      }).then(r => r.json()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      ),
    ]) as any;

    if (typeof response === 'string') {
      return response;
    }
    
    if (response.response) {
      return response.response;
    }
    
    if (response.text) {
      return response.text;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw new Error(`Failed to generate abstract: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface RequestBody {
  content: string;
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
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      throw new Error('Invalid JWT')
    }

    const { content } = await req.json() as RequestBody;
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const abstract = await generateAbstractWithPuter(content);

    return new Response(JSON.stringify({ abstract }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-abstract function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
