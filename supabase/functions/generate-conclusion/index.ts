// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function generateConclusionWithGemini(findings: string, apiKey: string) {
  const prompt = `
    You are an expert academic writing assistant. Your task is to write the key sections of a thesis's final chapter (Chapter V) based on a provided summary of research findings.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like \`\`\`json or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "summary": "A concise summary of the key findings provided.",
      "conclusion": "A logical conclusion drawn from these findings, explaining their broader significance.",
      "recommendations": "A set of 2-3 specific, actionable recommendations for future researchers, practitioners, or policymakers based on the conclusion."
    }

    Provided Research Findings: "${findings}"

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
    throw new Error("Failed to parse the conclusion from the Gemini API response.");
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

    const { findings } = await req.json();
    if (!findings) {
      return new Response(JSON.stringify({ error: 'Research findings are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conclusionData = await generateConclusionWithGemini(findings, geminiApiKey);

    return new Response(JSON.stringify(conclusionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-conclusion function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})