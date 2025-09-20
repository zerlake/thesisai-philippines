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

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function interpretWithGemini(testLabel: string, values: Record<string, string>, isSignificant: boolean, apiKey: string) {
  const statsString = Object.entries(values).map(([key, value]) => `${key}=${value}`).join(', ');

  const prompt = `
    You are an expert academic statistician. Your task is to write a single, concise paragraph interpreting the results of a statistical test in formal APA 7th edition style.

    The interpretation should be suitable for the "Results" chapter of a thesis. It must be written in the third person and present the findings objectively. Do not add placeholders like "[variable 1]". Instead, create a plausible and generic example context for the interpretation.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like 
    or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "interpretation": "The full paragraph interpreting the results."
    }

    Statistical Test: "${testLabel}"
    Statistical Values: ${statsString}
    Is the result statistically significant (p < .05)? ${isSignificant}

    Generate the JSON object now.
  `;

  const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      "generationConfig": { "responseMimeType": "application/json" }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json() as { error?: { message: string } };
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini API request failed: ${errorBody.error?.message || 'Unknown error'}`);
  }

  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the interpretation from the Gemini API response.");
  }

  return JSON.parse(generatedText);
}

interface RequestBody {
  testLabel: string;
  values: Record<string, string>;
  isSignificant: boolean;
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

    const { testLabel, values, isSignificant } = await req.json() as RequestBody;
    if (!testLabel || !values || isSignificant === undefined) {
      return new Response(JSON.stringify({ error: 'testLabel, values, and isSignificant are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await interpretWithGemini(testLabel, values, isSignificant, geminiApiKey);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in interpret-results function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})