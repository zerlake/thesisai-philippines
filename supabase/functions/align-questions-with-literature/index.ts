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
  researchQuestions: string[];
  literatureContext: string;
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
    console.log("Processing align-questions-with-literature request...");
    
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

    const { researchQuestions, literatureContext, field } = await req.json() as RequestBody;
    
    if (!researchQuestions || researchQuestions.length === 0 || !literatureContext) {
      return new Response(JSON.stringify({ error: 'Research questions and literature context are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert academic research consultant specializing in literature review analysis and research question alignment. 
You help researchers identify how their research questions connect to existing literature and identify research gaps.`;

    const userPrompt = `You are an expert academic research consultant specializing in literature review analysis and research question alignment.

Analyze the alignment between the following research questions and literature context:

**Field of Study:** ${field}

**Research Questions:**
${researchQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Literature Context:**
${literatureContext}

For each research question, provide specific analysis based on the literature context provided:

Here is an example format with filled content (use this structure but with content specific to the questions and literature above):

[
  {
    "question": "What is the impact of social media usage on academic performance among college students?",
    "aligned_literature": [
      "Several studies indicate a negative correlation between excessive social media use and GPA",
      "Research shows that multitasking with social media during study time reduces comprehension"
    ],
    "gaps_identified": [
      "Limited research on the long-term effects of social media on learning retention",
      "Lack of studies focusing specifically on Filipino college students' social media habits"
    ],
    "methodology_implications": "A quantitative survey approach would be appropriate to measure social media usage patterns and correlate with academic performance metrics."
  }
]

For each research question, provide:
1. How it aligns with existing literature (cite specific themes or findings from the context)
2. Research gaps it addresses
3. Implications for methodology

Do NOT return any blank or generic fields. Base all responses on the specific literature context provided.

Return ONLY the JSON array with no other text before or after. Every field must be filled with specific, meaningful content based on the questions and literature provided.`;

    console.log("Calling OpenRouter...");
    const responseText = await callOpenRouterWithFallback(openrouterApiKey, userPrompt, systemPrompt);
    
    // Extract JSON from the response
    let alignments;
    try {
      console.log("Raw response from OpenRouter:", responseText);
      
      // Try to find JSON array in the response using a more robust method
      // This looks for content between square brackets, handling nested objects
      const jsonRegex = /\[[\s\S]*?\]/g;
      let match;
      let matchedText = null;
      while ((match = jsonRegex.exec(responseText)) !== null) {
        try {
          const potentialAlignments = JSON.parse(match[0]);
          console.log("Potential alignments from regex:", potentialAlignments);
          
          // Verify this looks like our expected alignments format
          if (Array.isArray(potentialAlignments) && potentialAlignments.length > 0 && 
              potentialAlignments[0].hasOwnProperty('question')) {
            alignments = potentialAlignments;
            matchedText = match[0];
            break; // Found valid alignments array
          }
        } catch (e) {
          console.log("Regex match failed to parse as JSON:", e);
          // Continue to next match if this one is not valid JSON
          continue;
        }
      }
      
      // If we couldn't extract from brackets, try parsing the whole response
      if (!alignments) {
        try {
          alignments = JSON.parse(responseText);
          console.log("Parsed full response as alignments:", alignments);
        } catch (e) {
          console.log("Full response parsing failed, trying code block extraction");
          // If that fails, try to extract JSON from code block if present
          const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            alignments = JSON.parse(codeBlockMatch[1]);
          } else {
            throw new Error("No valid JSON found in response. Raw response: " + responseText);
          }
        }
      }
      
      // Validate that we have proper alignments with all required fields
      if (alignments && Array.isArray(alignments)) {
        alignments.forEach((a, index) => {
          console.log(`Alignment ${index} keys:`, Object.keys(a));
          
          // Ensure all required fields exist
          if (!a.question) a.question = "No question provided";
          if (!a.aligned_literature) a.aligned_literature = [];
          if (!a.gaps_identified) a.gaps_identified = [];
          if (!a.methodology_implications) a.methodology_implications = "No methodology implications provided";
        });
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.error("Response text was:", responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    console.log("Alignment analysis completed successfully");

    return new Response(JSON.stringify({ alignments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in align-questions-with-literature function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
