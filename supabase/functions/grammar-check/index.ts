// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { callPuterAI } from '../_shared/puter-ai.ts';

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

async function analyzeTextWithPuter(text: string) {
  const prompt = `
    You are an expert academic writing coach. Analyze the following text based on multiple criteria.

    CORE CRITERIA (required):
    - Focus: Is the writing centered on a clear, consistent main idea?
    - Development: Are the ideas well-supported with evidence, examples, and details?
    - Audience: Is the tone and language appropriate for an academic audience?
    - Cohesion: Do the ideas flow logically? Are transitions used effectively?
    - Language and Style: Is the grammar correct? Is the sentence structure varied and the word choice precise?

    EXTENDED CRITERIA (provide scores for these as well):
    - Clarity & Precision: How clearly are ideas expressed? Is vocabulary precise and appropriate?
    - Originality & Creativity: Does the writing present unique insights, arguments, or presentation styles?
    - Structure & Organization: Is the text logically organized with clear introduction, body, and conclusion?
    - Grammar & Mechanics: Are grammar, punctuation, spelling, and formatting consistent and correct?
    - Argument Strength & Evidence: How effective are arguments? Is evidence adequate and convincing?
    - Engagement & Tone: Does the writing engage the target audience? Is the tone appropriate for the purpose?
    - Conciseness & Redundancy: Is the writing economical with words? Are there unnecessary repetitions or verbosity?
    - Readability Metrics: What is the overall readability level? Consider sentence length and complexity.

    For each criterion, provide a score from 1 to 5 (can be a decimal like 3.5).
    Provide an overall score which is the average of ALL scores, rounded to one decimal place.
    Provide a concise, actionable "overallFeedback" (2-3 sentences) that summarizes the main strengths and areas for improvement.
    For each criterion, provide a specific, actionable "tip" (1-2 sentences) that directly addresses how to improve that particular aspect.

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
        "clarity": number,
        "originality": number,
        "structure": number,
        "grammar": number,
        "argumentStrength": number,
        "engagement": number,
        "conciseness": number,
        "readability": number,
        "overall": number
      },
      "overallFeedback": "string",
      "tips": {
        "focus": "string",
        "development": "string",
        "audience": "string",
        "cohesion": "string",
        "languageAndStyle": "string",
        "clarity": "string",
        "originality": "string",
        "structure": "string",
        "grammar": "string",
        "argumentStrength": "string",
        "engagement": "string",
        "conciseness": "string",
        "readability": "string"
      }
    }

    Text to analyze: "${text}"

    Generate the JSON object now.
  `;

  const systemPrompt = 'You are an expert academic writing coach specializing in thesis analysis.';

  try {
    const generatedText = await callPuterAI(prompt, {
      systemPrompt,
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!generatedText) {
      throw new Error("Failed to get analysis from Puter AI");
    }

    // Extract JSON from the response (in case it includes additional text)
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonString = jsonStart !== -1 && jsonEnd !== 0 
      ? generatedText.substring(jsonStart, jsonEnd)
      : generatedText;
    
    const result = JSON.parse(jsonString);
    
    // Ensure all required dimensions are present
    const requiredScores = ['focus', 'development', 'audience', 'cohesion', 'languageAndStyle', 
                            'clarity', 'originality', 'structure', 'grammar', 'argumentStrength', 
                            'engagement', 'conciseness', 'readability'];
    
    for (const dimension of requiredScores) {
      if (result.scores[dimension] === undefined) {
        console.warn(`Missing dimension: ${dimension}, assigning default score of 3`);
        result.scores[dimension] = 3;
        result.tips[dimension] = result.tips[dimension] || 'Review this aspect of your writing for improvement.';
      }
    }
    
    // Recalculate overall if needed
    const allScores = Object.entries(result.scores)
      .filter(([key]) => key !== 'overall')
      .map(([_, value]) => value as number);
    
    if (allScores.length > 0) {
      result.scores.overall = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10;
    }
    
    return result;
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw new Error(`Failed to analyze text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface RequestBody {
  text: string;
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
    // Puter API key is optional, will use defaults if not set
    const hasPuterApiKey = !!Deno.env.get("PUTER_API_KEY");
    if (!hasPuterApiKey) {
      console.warn("PUTER_API_KEY not set, using default Puter configuration");
    }

    const { text } = await req.json() as RequestBody;
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text to analyze is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisData = await analyzeTextWithPuter(text);

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