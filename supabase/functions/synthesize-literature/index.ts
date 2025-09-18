// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function synthesizeWithGemini(papers: any[], apiKey: string) {
  const sourcesText = papers.map(p => `- Title: "${p.title}"\n  Snippet: "${p.snippet}"`).join('\n');

  const prompt = `
    You are an expert academic writing assistant. Based on the following titles and snippets from several research papers, write a single, cohesive paragraph that synthesizes the key themes.

    Your task is to:
    1. Identify the main, recurring ideas or concepts across the sources.
    2. Weave these ideas together into a smooth, narrative paragraph.
    3. Highlight any potential connections, supporting arguments, or subtle disagreements if apparent.
    4. Do NOT simply list or summarize each source individually. The goal is synthesis, not summary.
    5. The tone should be academic and objective.
    6. Return only the synthesized paragraph, with no additional comments or explanations.

    Here are the sources:
    ${sourcesText}

    Synthesized Paragraph:
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
  const synthesizedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!synthesizedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the synthesized text from the Gemini API response.");
  }

  return synthesizedText.trim();
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

    const { papers } = await req.json();
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return new Response(JSON.stringify({ error: 'An array of papers is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const synthesizedText = await synthesizeWithGemini(papers, geminiApiKey);

    return new Response(JSON.stringify({ synthesizedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in synthesize-literature function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})