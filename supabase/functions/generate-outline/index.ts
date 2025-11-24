// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Define the OpenRouter response interface
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Define the fallback mechanism directly in this function
const FREE_MODELS = [
  "google/gemini-flash-2.0-free",   // Google's free Gemini model
  "openchat/openchat-7b:free",      // Alternative free model
  "undi95/free-v1",                 // Another free option
  "deepseek/deepseek-chat",         // DeepSeek free model
  "microsoft/rewardmodel-deberta-v3-base", // Backup model
];

async function callOpenRouterWithFallback(
  apiKey: string,
  prompt: string,
  systemPrompt: string = "You are a helpful academic assistant that specializes in Philippine university thesis standards."
): Promise<string> {
  // Try each model in sequence until one succeeds
  for (const model of FREE_MODELS) {
    try {
      console.log(`Attempting OpenRouter call with model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://thesisai-philippines.vercel.app",
          "X-Title": "THESISAI PHILIPPINES"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => `Error reading error body`);
        console.warn(`Model ${model} failed with status ${response.status}:`, errorData);
        continue; // Try next model
      }

      const data: OpenRouterResponse = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        console.log(`Successfully used model: ${model}`);
        return data.choices[0].message.content;
      } else {
        console.warn(`Model ${model} returned invalid response format`);
        continue; // Try next model
      }
    } catch (error) {
      console.warn(`Model ${model} failed with error:`, error);
      continue; // Try next model
    }
  }

  // If all models failed, throw an error
  throw new Error(`All OpenRouter models failed. Please try again later.`);
}

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    'https://thesis-ai-iota.vercel.app/',
    'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

async function generateOutlineWithOpenRouter(topic: string, field: string, apiKey: string) {
  const prompt = `You are an expert academic assistant specializing in Philippine university standards for thesis writing.
    Your task is to generate a detailed thesis outline based on the provided topic and field of study.
    The structure must be appropriate for the specified academic discipline and strictly follow the standard 5-chapter format used in the Philippines where applicable.

    The general structure is:
    - CHAPTER I: THE PROBLEM AND ITS BACKGROUND
    - CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES
    - CHAPTER III: RESEARCH METHODOLOGY
    - CHAPTER IV: PRESENTATION, ANALYSIS, AND INTERPRETATION OF DATA
    - CHAPTER V: SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

    Adapt the specific sub-headings within each chapter to be highly relevant to the given field of study. For example, a 'Computer Science' thesis might have a 'System Architecture' section in Methodology, while a 'Sociology' thesis might have 'Case Study Analysis'.

    Field of Study: "${field}"
    Thesis Topic: "${topic}"

    Generate the customized outline now.`;

  // Use the shared fallback system to try different models
  return await callOpenRouterWithFallback(
    apiKey,
    prompt,
    "You are a helpful academic assistant that specializes in Philippine university thesis standards."
  );
}

interface RequestBody {
  topic: string;
  field: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Length': '0'
      }
    })
  }

  try {
    console.log("Processing generate-outline request...");
    
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error('Missing authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')
    console.log("JWT extracted, verifying user...");

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      console.error("Invalid JWT - no user found");
      throw new Error('Invalid JWT')
    }
    console.log("User authenticated:", user.id);

    // @ts-ignore
    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterApiKey) {
      console.error("OPENROUTER_API_KEY is not set");
      throw new Error("OPENROUTER_API_KEY is not set in Supabase project secrets. Please add it in your project settings.");
    }
    console.log("OpenRouter API key found");

    const { topic, field } = await req.json() as RequestBody;
    console.log("Received topic:", topic, "and field:", field);
    
    if (!topic || !field) {
      console.error("Missing required fields - topic:", !!topic, "field:", !!field);
      return new Response(JSON.stringify({ error: 'Topic and field of study are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Calling generateOutlineWithOpenRouter function...");
    const outline = await generateOutlineWithOpenRouter(topic, field, openrouterApiKey);
    console.log("Outline generated successfully");

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