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

async function analyzeTextWithGemini(text: string, apiKey: string) {
  const prompt = `
    You are an expert academic writing coach. Analyze the following text based on five criteria: Focus, Development, Audience, Cohesion, and Language and Style.

    For each criterion, provide a score from 1 to 5 (can be a decimal like 3.5).
    - Focus: Is the writing centered on a clear, consistent main idea?
    - Development: Are the ideas well-supported with evidence, examples, and details?
    - Audience: Is the tone and language appropriate for an academic audience?
    - Cohesion: Do the ideas flow logically? Are transitions used effectively?
    - Language and Style: Is the grammar correct? Is the sentence structure varied and the word choice precise?

    Also, provide an overall score which is the average of the five criteria, rounded to one decimal place.
    Provide a concise, actionable "overallFeedback" (2-3 sentences) that summarizes the main strengths and areas for improvement.
    Finally, for each of the five criteria, provide a specific, actionable "tip" (1-2 sentences) that directly addresses how to improve that particular aspect of the writing.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like 
    json or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "scores": {
        "focus": number,
        "development": number,
        "audience": number,
        "cohesion": number,
        "languageAndStyle": number,
        "overall": number
      },
      "overallFeedback": "string",
      "tips": {
        "focus": "string",
        "development": "string",
        "audience": "string",
        "cohesion": "string",
        "languageAndStyle": "string"
      }
    }

    Text to analyze: "${text}"

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
    throw new Error("Failed to parse the analysis from the Gemini API response.");
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

    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text to analyze is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisData = await analyzeTextWithGemini(text, geminiApiKey);

    // Save analysis results to grammar_check_history
    const supabaseUserClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    )

    const { error: saveError } = await supabaseUserClient.from('grammar_check_history').insert({
      user_id: user.id,
      text_preview: text.substring(0, 200), // Save a preview of the text
      scores: analysisData.scores,
      overall_feedback: analysisData.overallFeedback,
    });

    if (saveError) {
      console.error('Failed to save grammar check history:', saveError);
    }

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in grammar-check function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})