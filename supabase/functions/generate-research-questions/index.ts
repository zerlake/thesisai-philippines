// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { callPuterAIWithFallback } from '../_shared/puter-ai.ts';

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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

interface RequestBody {
  topic: string;
  field: string;
  researchType: string;
  literatureContext?: string;
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
    console.log("Processing generate-research-questions request...");
    
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
    
    console.log("Environment variables checked successfully");

    const { topic, field, researchType, literatureContext } = await req.json() as RequestBody;
    
    if (!topic || !field || !researchType) {
      return new Response(JSON.stringify({ error: 'Topic, field, and research type are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert academic research consultant specializing in Philippine university thesis standards. 
Your task is to generate comprehensive, well-structured research questions that align with the 5-chapter thesis format commonly used in the Philippines.`;

    const userPrompt = `You are an expert academic research consultant specializing in Philippine university thesis standards.

Generate research questions for a ${researchType} research study on the following topic:

**Topic:** ${topic}
**Field of Study:** ${field}
${literatureContext ? `**Literature Context:** ${literatureContext}` : ''}

Generate 5-7 research questions that:
1. Align with specific chapters of a thesis (Chapter I: Problem, Chapter II: Literature, Chapter III: Methodology, Chapter IV: Results, Chapter V: Conclusions)
2. Are appropriate for ${researchType} research
3. Progress from broad to specific
4. Include a mix of question types (descriptive, exploratory, explanatory, evaluative)
5. Are clear, measurable, and achievable

Here is an example format with filled content (use this structure but with content specific to the topic above):

[
  {
    "question": "What is the current state of online learning adoption in Filipino universities post-pandemic?",
    "type": "descriptive",
    "chapter": "Chapter I",
    "rationale": "This question establishes the baseline understanding of the phenomenon being studied."
  },
  {
    "question": "How do different online learning platforms affect student engagement in Philippine higher education?",
    "type": "explanatory", 
    "chapter": "Chapter III",
    "rationale": "This question helps design the methodology to examine cause-effect relationships."
  }
]

Generate 5-7 meaningful research questions with specific content related to the provided topic. Do NOT return any blank or generic fields.

Return ONLY the JSON array with no other text before or after. Every field must be filled with specific, meaningful content based on the topic and field provided.`;

    console.log("Calling OpenRouter...");
    const responseText = await callOpenRouterWithFallback(openrouterApiKey, userPrompt, systemPrompt);
    
    // Extract JSON from the response
    let questions;
    try {
      console.log("Raw response from OpenRouter:", responseText);
      
      // Try to find JSON array in the response using a more robust method
      // This looks for content between square brackets, handling nested objects
      const jsonRegex = /\[[\s\S]*?\]/g;
      let match;
      let matchedText = null;
      while ((match = jsonRegex.exec(responseText)) !== null) {
        try {
          const potentialQuestions = JSON.parse(match[0]);
          console.log("Potential questions from regex:", potentialQuestions);
          
          // Verify this looks like our expected questions format
          if (Array.isArray(potentialQuestions) && potentialQuestions.length > 0 && 
              potentialQuestions[0].hasOwnProperty('question')) {
            questions = potentialQuestions;
            matchedText = match[0];
            break; // Found valid questions array
          }
        } catch (e) {
          console.log("Regex match failed to parse as JSON:", e);
          // Continue to next match if this one is not valid JSON
          continue;
        }
      }
      
      // If we couldn't extract from brackets, try parsing the whole response
      if (!questions) {
        try {
          questions = JSON.parse(responseText);
          console.log("Parsed full response as questions:", questions);
        } catch (e) {
          console.log("Full response parsing failed, trying code block extraction");
          // If that fails, try to extract JSON from code block if present
          const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            questions = JSON.parse(codeBlockMatch[1]);
          } else {
            throw new Error("No valid JSON found in response. Raw response: " + responseText);
          }
        }
      }
      
      // Validate that we have proper research questions with all required fields
      if (questions && Array.isArray(questions)) {
        questions.forEach((q, index) => {
          console.log(`Question ${index} keys:`, Object.keys(q));
          
          // Ensure all required fields exist
          if (!q.question) q.question = "No question provided";
          if (!q.type) q.type = "unknown";
          if (!q.chapter) q.chapter = "Chapter X";
          if (!q.rationale) q.rationale = "No rationale provided";
        });
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.error("Response text was:", responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    console.log("Research questions generated successfully");

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-research-questions function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})