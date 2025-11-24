// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { callPuterAI } from '../_shared/puter-ai.ts';

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    'https://thesisai-philippines.vercel.app',
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

async function generateFlashcardsWithPuter(topic: string) {
  const prompt = `You are an expert academic assistant. Your task is to generate a comprehensive set of flashcards for key terms related to a given thesis topic.

Identify 12 of the most important keywords and concepts from the topic. Include a mix of foundational terms, methods, theories, findings, and applications. For each term, provide a clear and concise definition suitable for a flashcard.

Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting or any text outside of the JSON object.

The JSON object must have the following structure:
{
  "flashcards": [
    {
      "term": "...",
      "definition": "..."
    }
  ]
}

Thesis Topic: "${topic}"

Generate the complete JSON object with 12 flashcards now.`;

  const systemPrompt = 'You are an expert academic assistant specializing in thesis study materials.';

  try {
    const generatedText = await callPuterAI(prompt, {
      systemPrompt,
      temperature: 0.7,
      max_tokens: 1500,
    });

    if (!generatedText) {
      throw new Error("Failed to generate flashcards from Puter AI");
    }

    // Extract JSON from the response
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonString = jsonStart !== -1 && jsonEnd !== 0 
      ? generatedText.substring(jsonStart, jsonEnd)
      : generatedText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface RequestBody {
  topic: string;
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

    const { topic } = await req.json() as RequestBody;
    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const flashcardData = await generateFlashcardsWithPuter(topic);

    return new Response(JSON.stringify(flashcardData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-flashcards function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
