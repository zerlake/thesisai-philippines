// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function improveTextWithGemini(text: string, apiKey: string) {
  const prompt = `
    You are an expert academic editor. Your task is to revise the following text to improve its clarity, conciseness, and academic tone.
    - Correct any grammatical errors.
    - Rephrase awkward sentences.
    - Ensure the language is formal and objective.
    - Do not change the core meaning of the text.
    - Return only the improved text, with no additional comments or explanations.

    Original text: "${text}"

    Improved text:
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
  const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!improvedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the improved text from the Gemini API response.");
  }

  return improvedText.trim();
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // @ts-ignore
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase project secrets.");
    }

    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text to improve is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const improvedText = await improveTextWithGemini(text, geminiApiKey);

    return new Response(JSON.stringify({ improvedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in improve-writing function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})