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

async function generateFlashcardsWithOpenRouter(topic: string, apiKey: string) {
  const prompt = `You are an expert academic assistant. Your task is to generate a set of flashcards for key terms related to a given thesis topic.

    Identify 4-5 of the most important keywords or concepts from the topic. For each term, provide a clear and concise definition suitable for a flashcard.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like \`\`\`json or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "flashcards": [
        {
          "term": "...",
          "definition": "..."
        }
      ]
    }

    Thesis Topic: "${topic}"

    Generate the JSON object now.`;

  // Use the fallback system to try different models
  const generatedText = await callOpenRouterWithFallback(
    apiKey,
    prompt,
    "You are a helpful academic assistant that responds in valid JSON format only."
  );

  // Extract JSON from response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  } else {
    throw new Error("Failed to extract JSON from OpenRouter response.");
  }
}

interface RequestBody {
  topic: string;
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

    const { topic } = await req.json() as RequestBody;
    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const flashcardData = await generateFlashcardsWithOpenRouter(topic, openrouterApiKey);

    return new Response(JSON.stringify(flashcardData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-flashcards function (OpenRouter):", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})