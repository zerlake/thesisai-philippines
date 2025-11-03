// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { callOpenRouterWithFallback } from '../_shared/openrouter.ts'

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

async function generateAbstractWithOpenRouter(content: string, apiKey: string) {
  const prompt = `You are an expert academic editor. Your task is to generate a concise, structured abstract for the following thesis document.
    The abstract should be a single paragraph and must include:
    1. A brief introduction to the topic and problem.
    2. An overview of the methodology used.
    3. A summary of the key findings.
    4. The main conclusions and implications of the research.

    Return only the generated abstract text, with no additional comments or explanations.

    Original Document Content: "${content.substring(0, 4000)}..."

    Generated Abstract:`;

  // Use the fallback system to try different models
  const abstract = await callOpenRouterWithFallback(
    apiKey,
    prompt,
    "You are a helpful academic assistant that specializes in academic writing."
  );

  return abstract.trim();
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

    // @ts-ignore
    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterApiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in Supabase project secrets.");
    }

    const { content } = await req.json() as RequestBody;
    if (!content) {
      return new Response(JSON.stringify({ error: 'Document content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const abstract = await generateAbstractWithOpenRouter(content, openrouterApiKey);

    return new Response(JSON.stringify({ abstract }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-abstract function (OpenRouter):", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})