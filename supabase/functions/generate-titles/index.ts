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

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function generateTitlesWithGemini(summary: string, apiKey: string) {
  const prompt = `
    You are an expert academic editor. Your task is to generate 5 creative and academic thesis titles based on the provided summary or abstract.

    Provide a mix of title styles:
    - A descriptive title
    - An interrogative (question-based) title
    - A declarative title making a clear statement

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like 
    or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "titles": [
        "Title 1...",
        "Title 2...",
        "..."
      ]
    }

    Thesis Summary: "${summary}"

    Generate the JSON object now.
  `;

  const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini API request failed: ${errorBody.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the titles from the Gemini API response.");
  }

  return JSON.parse(generatedText);
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
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase project secrets.");
    }

    const { summary } = await req.json();
    if (!summary) {
      return new Response(JSON.stringify({ error: 'Summary is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const titleData = await generateTitlesWithGemini(summary, geminiApiKey);

    return new Response(JSON.stringify(titleData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-titles function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})