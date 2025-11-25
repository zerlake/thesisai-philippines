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

const OPENROUTER_API_URL = Deno.env.get("OPENROUTER_API_ENDPOINT") || "https://openrouter.ai/api/v1/chat/completions";

async function generateSlidesWithOpenRouter(chapterContent: string, apiKey: string) {
  const prompt = `
    You are an expert academic presentation coach. Your task is to analyze the following chapter from a thesis and generate a series of presentation slides.

    For each slide, you must provide:
    1. A clear, concise title.
    2. An array of 3-5 short, impactful bullet points that summarize the key information.
    3. A detailed paragraph of speaker notes that elaborates on the bullet points, suitable for oral delivery.

    Your entire response must be a single, valid JSON object. Do not include any markdown formatting like 
    json or any text outside of the JSON object.

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

    Generate the JSON object now.
  `;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://thesisai-philippines.vercel.app',
      'X-Title': 'ThesisAI Philippines',
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json() as { error?: { message: string } };
    console.error("OpenRouter API Error:", errorBody);
    throw new Error(`OpenRouter API request failed: ${errorBody.error?.message || 'Unknown error'}`);
  }

  const data = await response.json() as { 
    choices?: Array<{ message?: { content?: string } }> 
  };
  
  const generatedText = data.choices?.[0]?.message?.content;

  if (!generatedText) {
    console.error("Invalid response structure from OpenRouter:", data);
    throw new Error("Failed to parse the presentation from the OpenRouter API response.");
  }

  // Extract the JSON from the response (in case it includes other text)
  const jsonStart = generatedText.indexOf('[');
  const jsonEnd = generatedText.lastIndexOf(']') + 1;
  const jsonString = jsonStart !== -1 && jsonEnd !== 0 
    ? generatedText.substring(jsonStart, jsonEnd)
    : generatedText;
  
  return JSON.parse(jsonString);
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
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in Supabase project secrets.");
    }

    const { chapterContent } = await req.json() as RequestBody;
    if (!chapterContent) {
      return new Response(JSON.stringify({ error: 'Chapter content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const slides = await generateSlidesWithOpenRouter(chapterContent, openRouterApiKey);

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-presentation-slides function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})