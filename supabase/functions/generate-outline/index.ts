// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.ts';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function generateOutlineWithGemini(topic: string, field: string, apiKey: string) {
  const prompt = `
    You are an expert academic assistant specializing in Philippine university standards for thesis writing.
    Your task is to generate a detailed thesis outline based on the provided topic and field of study.
    The structure must be appropriate for the specified academic discipline and strictly follow the standard 5-chapter format used in the Philippines where applicable.

    The general structure is:
    - CHAPTER I: THE PROBLEM AND ITS BACKGROUND
    - CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES
    - CHAPTER III: RESEARCH METHODOLOGY
    - CHAPTER IV: PRESENTATION, ANALYSIS, AND INTERPRETATION OF DATA
    - CHAPTER V: SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

    Adapt the specific sub-headings within each chapter to be highly relevant to the given field of study. For example, a 'Computer Science' thesis might have a 'System Architecture' section in Methodology, while a 'Sociology' thesis might have 'Case Study Analysis'.

    The output must be plain text, formatted clearly. Do not include any markdown like \`\`\` or explanations outside of the outline itself.

    Field of Study: "${field}"
    Thesis Topic: "${topic}"

    Generate the customized outline now.
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
    throw new Error("Failed to parse the outline from the Gemini API response.");
  }

  return generatedText;
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
      throw new Error("GEMINI_API_KEY is not set in Supabase project secrets. Please add it in your project settings.");
    }

    const { topic, field } = await req.json();
    if (!topic || !field) {
      return new Response(JSON.stringify({ error: 'Topic and field of study are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const outline = await generateOutlineWithGemini(topic, field, geminiApiKey);

    return new Response(JSON.stringify({ outline }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-outline function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})