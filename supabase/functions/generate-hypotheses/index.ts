// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { callOpenRouterWithFallback } from '../_shared/openrouter.ts';

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || 'https://thesisai-philippines.vercel.app',
    Deno.env.get('NEXT_PUBLIC_VERCEL_ENV') === 'preview' ? 'https://thesis-ai-iota.vercel.app/' : '',
    'http://localhost:3000',
    'http://localhost:32100',
  ].filter(Boolean);
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

interface RequestBody {
  topic: string;
  field: string;
  researchQuestions: string[];
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
    console.log("Processing generate-hypotheses request...");
    
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
    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterApiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const { topic, field, researchQuestions } = await req.json() as RequestBody;
    
    if (!topic || !field) {
      return new Response(JSON.stringify({ error: 'Topic and field are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert research methodologist specializing in hypothesis formulation for academic research. 
You understand the requirements for testable, falsifiable hypotheses in quantitative research.`;

    const questionsContext = researchQuestions && researchQuestions.length > 0 
      ? `\n\n**Research Questions:**\n${researchQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const userPrompt = `You are an expert in academic research and hypothesis formulation for thesis writing.

Based on the following research topic and field:
**Topic:** ${topic}
**Field of Study:** ${field}${questionsContext}

Generate 2-4 testable hypotheses with specific, meaningful content. Do NOT return any blank or generic fields.

Here is an example format with filled content (use this structure but with content specific to the topic above):

[
  {
    "null_hypothesis": "There is no significant relationship between study habits and academic performance among Filipino college students.",
    "alternative_hypothesis": "There is a significant relationship between study habits and academic performance among Filipino college students.",
    "variables": {
      "independent": ["Study habits (frequency, techniques, environment)"],
      "dependent": ["Academic performance (grades, GPA)"]
    },
    "testable": true
  },
  {
    "null_hypothesis": "Time management skills do not affect academic achievement in Filipino college students.",
    "alternative_hypothesis": "Time management skills have a significant impact on academic achievement among Filipino college students.",
    "variables": {
      "independent": ["Time management skills"],
      "dependent": ["Academic achievement"]
    },
    "testable": true
  }
]

Generate 2-4 hypotheses that:
1. Are clearly stated in null (H₀) and alternative (H₁) forms with specific content from the topic
2. Identify specific independent and dependent variables based on the topic
3. Are testable and falsifiable with specific variables
4. Align with quantitative research standards
5. Follow Philippine thesis conventions

Return ONLY the JSON array with no other text before or after. Every field must be filled with specific, meaningful content based on the topic and field provided.`;

    console.log("Calling OpenRouter...");
    const responseText = await callOpenRouterWithFallback(openrouterApiKey, userPrompt, systemPrompt);
    
    // Extract JSON from the response
    let hypotheses;
    try {
      console.log("Raw response from OpenRouter:", responseText);
      
      // Try to find JSON array in the response using a more robust method
      // This looks for content between square brackets, handling nested objects
      const jsonRegex = /\[[\s\S]*?\]/g;
      let match;
      let matchedText = null;
      while ((match = jsonRegex.exec(responseText)) !== null) {
        try {
          const potentialHypotheses = JSON.parse(match[0]);
          console.log("Potential hypotheses from regex:", potentialHypotheses);
          
          // Verify this looks like our expected hypotheses format
          if (Array.isArray(potentialHypotheses) && potentialHypotheses.length > 0 && 
              potentialHypotheses[0].hasOwnProperty('null_hypothesis')) {
            hypotheses = potentialHypotheses;
            matchedText = match[0];
            break; // Found valid hypotheses array
          }
        } catch (e) {
          console.log("Regex match failed to parse as JSON:", e);
          // Continue to next match if this one is not valid JSON
          continue;
        }
      }
      
      // If we couldn't extract from brackets, try parsing the whole response
      if (!hypotheses) {
        try {
          hypotheses = JSON.parse(responseText);
          console.log("Parsed full response as hypotheses:", hypotheses);
        } catch (e) {
          console.log("Full response parsing failed, trying code block extraction");
          // If that fails, try to extract JSON from code block if present
          const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            hypotheses = JSON.parse(codeBlockMatch[1]);
          } else {
            throw new Error("No valid JSON found in response. Raw response: " + responseText);
          }
        }
      }
      
      // Validate that we have proper hypotheses with all required fields
      if (hypotheses && Array.isArray(hypotheses)) {
        hypotheses.forEach((h, index) => {
          console.log(`Hypothesis ${index} keys:`, Object.keys(h));
          
          // Ensure all required fields exist
          if (!h.null_hypothesis) h.null_hypothesis = "No null hypothesis provided";
          if (!h.alternative_hypothesis) h.alternative_hypothesis = "No alternative hypothesis provided";
          if (!h.variables) h.variables = { independent: [], dependent: [] };
          if (!h.variables.independent) h.variables.independent = [];
          if (!h.variables.dependent) h.variables.dependent = [];
          if (typeof h.testable === 'undefined') h.testable = false;
        });
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.error("Response text was:", responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    console.log("Hypotheses generated successfully");

    return new Response(JSON.stringify({ hypotheses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-hypotheses function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
