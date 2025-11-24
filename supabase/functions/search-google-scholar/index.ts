// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Security utilities
function validateURL(url: string, allowedDomains: string[] = ['serpapi.com']): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  let sanitized = input.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized.trim();
}

function validateJWT(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64urlRegex.test(part));
}

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

interface SerpApiResult {
  organic_results?: Array<{
    result_id: string;
    title: string;
    link: string;
    publication_info?: { summary: string };
    snippet: string;
  }>;
}

interface RequestBody {
  query: string;
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

    // Validate JWT format
    if (!validateJWT(jwt)) {
      throw new Error('Invalid JWT format')
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      throw new Error('Invalid JWT')
    }

    // @ts-ignore
    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      throw new Error("SERPAPI_KEY is not set in Supabase project secrets.");
    }

    const { query } = await req.json() as RequestBody;
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and validate query to prevent injection
    const sanitizedQuery = sanitizeInput(query, 500);

    const searchUrl = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(sanitizedQuery)}&api_key=${serpApiKey}`;
    
    // Validate URL to prevent SSRF attacks
    if (!validateURL(searchUrl)) {
      throw new Error('Invalid search URL');
    }
    
    const serpApiResponse = await fetch(searchUrl);
    if (!serpApiResponse.ok) {
      const errorBody = await serpApiResponse.json() as { error?: string };
      throw new Error(`SerpApi request failed: ${errorBody.error || 'Unknown error'}`);
    }

    const results = await serpApiResponse.json() as SerpApiResult;
    const papers = results.organic_results?.map((result: any) => ({
      id: result.result_id,
      title: result.title,
      link: result.link,
      publication_info: result.publication_info?.summary,
      snippet: result.snippet,
    })) || [];

    return new Response(JSON.stringify({ papers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in search-google-scholar function:", error);
    
    // Create safe error message for production
    let message = "An error occurred processing your request";
    if (error instanceof Error) {
      if (error.message.includes('JWT') || error.message.includes('auth')) {
        message = 'Authentication failed';
      } else if (error.message.includes('validation') || error.message.includes('Input')) {
        message = 'Invalid search query provided';
      } else if (error.message.includes('API')) {
        message = 'External service error';
      }
    }
    
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})