// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Inlined CORS utility
const ALLOWED_ORIGINS = [
  'https://thesisai-philippines.vercel.app',
  'http://localhost:3000', // For local development
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]; // Default to Vercel URL

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
  };
}

// Note: The plagiarism-utils functions are copied here because Edge Functions are self-contained.
// In a real-world scenario with shared code, Deno Deploy supports import maps.

// --- Utility Functions ---
function preprocess(text: string): string {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function getShingles(text: string, k = 5): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const shingles = new Set<string>();
  if (words.length < k) {
    if (words.length > 0) {
      shingles.add(words.join(' '));
    }
    return Array.from(shingles);
  }
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return Array.from(shingles);
}

function jaccardSimilarity(setA: string[], setB: string[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
// --- End Utility Functions ---

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, sourceDocumentId } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let query = supabaseAdmin.from('documents').select('id, title, content').limit(100);
    if (sourceDocumentId) {
      query = query.neq('id', sourceDocumentId);
    }
    
    const { data: documents, error: dbError } = await query;

    if (dbError) throw dbError;

    const preprocessedSource = preprocess(text);
    const sourceShingles = getShingles(preprocessedSource);

    const results = [];
    for (const doc of documents) {
      const preprocessedTarget = preprocess(doc.content || '');
      const targetShingles = getShingles(preprocessedTarget);
      const similarity = jaccardSimilarity(sourceShingles, targetShingles);

      if (similarity > 0.1) { // 10% similarity threshold
        results.push({
          documentId: doc.id,
          title: doc.title || 'Untitled Document',
          similarity: Math.round(similarity * 100),
        });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    const highestScore = results.length > 0 ? results[0].similarity : 0;

    return new Response(JSON.stringify({
      highestScore,
      matches: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Internal plagiarism check error:', error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});