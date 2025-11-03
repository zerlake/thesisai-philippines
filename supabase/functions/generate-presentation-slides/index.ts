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

async function generateSlidesWithOpenRouter(chapterContent: string, apiKey: string) {
  const prompt = `You are an expert academic presentation coach. Your task is to analyze the following chapter from a thesis and generate a series of presentation slides.

    For each slide, you must provide:
    1. A clear, concise title.
    2. An array of 3-5 short, impactful bullet points that summarize the key information.
    3. A detailed paragraph of speaker notes that elaborates on the bullet points, suitable for oral delivery.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like \`\`\`json or any text outside of the JSON object.

    The JSON object must be an array of slide objects, with the following structure:
    [
      {
        "title": "Slide Title",
        "bulletPoints": [
          "First bullet point...",
          "Second bullet point...",
          "..."
        ],
        "speakerNotes": "Detailed speaker notes for this slide..."
      }
    ]

    Thesis Chapter Content: "${chapterContent.substring(0, 8000)}"

    Generate the JSON object now.`;

  // Use the fallback system to try different models
  const generatedText = await callOpenRouterWithFallback(
    apiKey,
    prompt,
    "You are a helpful academic assistant that responds in valid JSON format only."
  );

  // Extract JSON from response
  const jsonMatch = generatedText.match(/\[([\s\S]*)\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  } else {
    throw new Error("Failed to extract JSON from OpenRouter response.");
  }
}

interface RequestBody {
  chapterContent: string;
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

    const { chapterContent } = await req.json() as RequestBody;
    if (!chapterContent) {
      return new Response(JSON.stringify({ error: 'Chapter content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const slides = await generateSlidesWithOpenRouter(chapterContent, openrouterApiKey);

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-presentation-slides function (OpenRouter):", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})