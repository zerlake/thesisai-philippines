// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || Deno.env.get('NEXT_PUBLIC_VERCEL_URL') || 'http://localhost:3000',
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
    title: string;
    link: string;
    publication_info?: { summary: string };
    snippet: string;
  }>;
}

interface MatchResult {
  sentence: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
}

interface PlagiarismResult {
  score: number;
  totalSentences: number;
  matchedSentences: number;
  matches: MatchResult[];
  wordCount: number;
}

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RequestBody {
  text: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
    if (!user) throw new Error('Invalid JWT');

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.plan === 'free') {
      return new Response(
        JSON.stringify({ error: 'This feature requires a Pro plan. Please upgrade your account.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text } = await req.json() as RequestBody;

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanText = text.replace(/\s+/g, ' ').trim();
    const totalWords = cleanText.split(' ').length;
    let sentences = cleanText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.split(' ').length > 5);

    // Aggressive sub-splitting for long chunks
    sentences = sentences.flatMap(s => {
      if (s.split(' ').length > 25) {
        return s.split(/[,;]+| and /).map(sub => sub.trim()).filter(sub => sub.length > 20 && sub.split(' ').length > 5);
      }
      return [s];
    }).slice(0, 30);

    if (sentences.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid sentences found for analysis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const matches: MatchResult[] = [];
    // @ts-ignore
    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) throw new Error('SERPAPI_KEY is not set in Supabase project secrets.');

    const batchSize = 2;
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      const searchPromises = batch.map(async (sentence, index) => {
        await delay(index * 1000);
        
        let data: SerpApiResult | null = null;
        let retries = 0;
        while (!data && retries < 2) {
          try {
            const query = `"${sentence}"`;
            const serpApiEndpoint = Deno.env.get("SERPAPI_ENDPOINT") || "https://serpapi.com";
            const searchUrl = `${serpApiEndpoint}/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=10`;

            const response = await fetch(searchUrl);
            if (!response.ok) {
              console.error(`SerpApi error for sentence (retry ${retries}): ${response.status}`);
              throw new Error(`SerpApi responded with status ${response.status}`);
            }
            data = await response.json() as SerpApiResult;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`Retry ${retries + 1} for sentence: ${sentence.substring(0, 50)} - Error: ${message}`);
            retries++;
            await delay(1000);
          }
        }

        if (data && data.organic_results && data.organic_results.length > 0) {
          const relevantResults = data.organic_results.filter(result => {
            const snippetLower = (result.snippet || '').toLowerCase();
            const sentenceLower = sentence.toLowerCase();
            const sentenceWords = new Set(sentenceLower.split(' '));
            if (sentenceWords.size === 0) return false;
            const snippetWords = snippetLower.split(' ');
            const overlap = snippetWords.filter(word => sentenceWords.has(word)).length;
            const overlapRatio = overlap / sentenceWords.size;
            console.log(`Overlap for "${sentence.substring(0, 50)}...": ${overlapRatio}`);
            return overlapRatio > 0.3 || snippetLower.includes(sentenceLower.substring(0, 50));
          });

          if (relevantResults.length > 1) { // Require >1 source to reduce false positives
            return {
              sentence,
              sources: relevantResults.map(r => ({ title: r.title, url: r.link })),
            };
          }
        }
        return null;
      });

      const settledResults = await Promise.allSettled(searchPromises);
      
      settledResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          matches.push(result.value);
        }
      });

      if (i + batchSize < sentences.length) {
        await delay(2000);
      }
    }

    const matchedWords = matches.reduce((sum, m) => sum + m.sentence.split(' ').length, 0);
    const score = totalWords > 0 ? Math.round((matchedWords / totalWords) * 100) : 0;

    const result: PlagiarismResult = {
      score,
      totalSentences: sentences.length,
      matchedSentences: matches.length,
      matches,
      wordCount: totalWords
    };

    const supabaseUserClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    )

    const { error: saveError } = await supabaseUserClient.rpc('save_originality_check', {
      p_plagiarism_percent: result.score,
      p_word_count: result.wordCount,
      p_total_sentences: result.totalSentences,
      p_matched_sentences: result.matchedSentences,
      p_results: { matches: result.matches },
      p_text_preview: text.substring(0, 200)
    });

    if (saveError) {
      console.error('Failed to save originality check:', saveError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ error: 'An internal error occurred.', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})