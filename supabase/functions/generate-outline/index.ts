// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;

  if (!allowOrigin) {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

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
    const errorBody = await response.json() as { error?: { message: string } };
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini API request failed: ${errorBody.error?.message || 'Unknown error'}`);
  }

  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>, outline?: string };
  
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the outline from the Gemini API response.");
  }

  return generatedText;
}

interface RequestBody {
  topic: string;
  field: string;
}

const MAX_TOPIC_LENGTH = 500;
const MAX_FIELD_LENGTH = 200;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }
  
  record.count += 1;
  return { allowed: true };
}

function sanitizeInput(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return input.trim();
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
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimit.retryAfter 
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfter)
        },
      });
    }

    // @ts-ignore
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json() as RequestBody;
    
    if (!body.topic || !body.field) {
      return new Response(JSON.stringify({ error: 'Topic and field of study are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const topic = sanitizeInput(body.topic, MAX_TOPIC_LENGTH);
    const field = sanitizeInput(body.field, MAX_FIELD_LENGTH);

    const outline = await generateOutlineWithGemini(topic, field, geminiApiKey);

    return new Response(JSON.stringify({ outline }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-outline function:", error);
    const message = process.env.NODE_ENV === 'development' && error instanceof Error 
      ? error.message 
      : "An error occurred while processing your request.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})