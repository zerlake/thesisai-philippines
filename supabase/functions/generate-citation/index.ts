// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.ts'

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function generateCitationWithGemini(description: string, style: string, apiKey: string) {
  const prompt = `
    You are an expert academic librarian. Your task is to generate a single, fully-formatted academic citation based on a brief description and a specified citation style. The citation should be fictional but highly realistic and plausible.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like \`\`\`json or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "citation": "..."
    }

    Description: "${description}"
    Style: "${style}"

    Generate the JSON object now.
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18-second timeout

  try {
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
      signal: controller.signal,
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
      throw new Error("Failed to parse the citation from the Gemini API response.");
    }

    // Attempt to parse the JSON, with a fallback for markdown-wrapped JSON
    try {
      return JSON.parse(generatedText);
    } catch (e) {
      console.warn("Gemini did not return valid JSON, attempting to extract from markdown.");
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e2) {
          console.error("Failed to parse extracted JSON:", e2);
          throw new Error("Failed to parse JSON from the Gemini API response, even after extraction.");
        }
      }
      // If no markdown block, throw original error
      throw new Error("The AI returned an invalid format. Please try again.");
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The request to the AI model timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

interface RequestBody {
  description: string;
  style: string;
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

    const { description, style } = await req.json() as RequestBody;
    if (!description || !style) {
      return new Response(JSON.stringify({ error: 'Description and style are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const citationData = await generateCitationWithGemini(description, style, geminiApiKey);

    return new Response(JSON.stringify(citationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-citation function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})