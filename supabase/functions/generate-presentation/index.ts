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

async function generateSlidesWithGemini(topic: string, apiKey: string) {
  const prompt = `
    You are an expert academic assistant. Your task is to generate a standard thesis defense presentation outline based on a given topic, following the typical structure used in Philippine universities.

    The presentation should include slides for:
    1. Title Slide
    2. Chapter I: The Problem and Its Background
    3. Chapter II: Review of Related Literature
    4. Chapter III: Methodology
    5. Chapter IV: Results and Discussion (with placeholder points for key findings)
    6. Chapter V: Summary, Conclusions, and Recommendations
    7. Thank You / Q&A Slide

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like 
    or any text outside of the JSON object.

    The JSON object must be an array of slide objects, with the following structure:
    [
      {
        "title": "Slide Title",
        "content": [
          "Bullet point 1",
          "Bullet point 2",
          "..."
        ]
      }
    ]

    Thesis Topic: "${topic}"

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
    throw new Error("Failed to parse the presentation from the Gemini API response.");
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

    const { topic } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const slides = await generateSlidesWithGemini(topic, geminiApiKey);

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-presentation function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})