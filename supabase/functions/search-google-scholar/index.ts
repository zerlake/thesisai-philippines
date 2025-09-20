// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.ts';

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
    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      throw new Error("SERPAPI_KEY is not set in Supabase project secrets.");
    }

    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const searchUrl = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
    
    const serpApiResponse = await fetch(searchUrl);
    if (!serpApiResponse.ok) {
      const errorBody = await serpApiResponse.json();
      throw new Error(`SerpApi request failed: ${errorBody.error || 'Unknown error'}`);
    }

    const results = await serpApiResponse.json();
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
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})