// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    Finally, provide a concise, actionable "Writing Strength" feedback (2-3 sentences) that identifies the single most important area for improvement.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like \`\`\`json or any text outside of the JSON object.

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
      "writingStrength": "string"
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
      "generationConfig": {
        "responseMimeType": "application/json",
      }
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
      return new Response(JSON.stringify({ error: 'Text to analyze is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisData = await analyzeTextWithGemini(text, geminiApiKey);

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