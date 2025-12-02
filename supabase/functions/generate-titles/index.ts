// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || Deno.env.get('NEXT_PUBLIC_VERCEL_URL') || 'http://localhost:3000',
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
    console.log("Processing generate-titles request...");

    // Authentication
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

    // Parse request body
    const bodyText = await req.text();
    let requestBody: any;
    try {
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Failed to parse JSON body:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { summary } = requestBody;

    // Validate input
    if (!summary || typeof summary !== "string") {
      return new Response(
        JSON.stringify({
          error: "Summary is required and must be a string",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (summary.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Summary must be at least 50 characters long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate titles using intelligent pattern-based approach
    const titles = generateTitlesFallback(summary);

    return new Response(
      JSON.stringify({
        success: true,
        titles: titles || [],
        generated_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-titles:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Extract the main research topic from summary
 */
function extractMainResearchTopic(summary: string): string {
  // First sentence usually contains the main topic
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 0) {
    return sentences[0].trim();
  }
  return summary.substring(0, 100);
}

/**
 * Extract key findings or results
 */
function extractKeyFindings(summary: string): string {
  // Look for findings/results/conclusion sections
  const findingsMatch = summary.match(/(?:finding|result|conclusion|show|demonstrate|suggest|indicate)[s]?[^.]*[.!?]/i);
  if (findingsMatch) {
    return findingsMatch[0].replace(/^(?:finding|result|conclusion|show|demonstrate|suggest|indicate)[s]?\s*/i, '').trim();
  }
  
  // Look for quantitative results
  const quantMatch = summary.match(/(?:increase|improve|enhance|significant|percent|%).*?(?:in|of|among)[^.]*[.!?]/i);
  if (quantMatch) {
    return quantMatch[0].trim();
  }

  return "";
}

/**
 * Extract research methodology if mentioned
 */
function extractMethodology(summary: string): string {
  const methodMatch = summary.match(/(?:using|employing|utilizing|through|via|with|a)?\s*(?:mixed[- ]?method|qualitative|quantitative|experimental|case[- ]?study|survey|interview|ethnograph)[^.]*(?:approach|method|study|design|analysis)?/i);
  if (methodMatch) {
    return methodMatch[0].trim();
  }
  return "";
}

/**
 * Extract domain/field of research
 */
function extractDomain(summary: string): string {
  const lowerSummary = summary.toLowerCase();
  
  const domains = [
    { keywords: ['education', 'student', 'learning', 'academic', 'teaching', 'school', 'university'], domain: 'Education' },
    { keywords: ['health', 'medical', 'patient', 'disease', 'treatment', 'clinical', 'healthcare', 'nursing'], domain: 'Healthcare' },
    { keywords: ['sustainable', 'environmental', 'climate', 'ecological', 'green', 'renewable'], domain: 'Environmental Science' },
    { keywords: ['business', 'economic', 'market', 'organizational', 'corporate', 'enterprise'], domain: 'Business' },
    { keywords: ['psychology', 'behavior', 'mental', 'emotional', 'social', 'cognitive'], domain: 'Psychology' },
    { keywords: ['technology', 'ai', 'artificial intelligence', 'machine learning', 'digital', 'data', 'algorithm'], domain: 'Computer Science' },
    { keywords: ['agriculture', 'farming', 'crop', 'agricultural', 'soil'], domain: 'Agriculture' },
    { keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'infrastructure'], domain: 'Engineering' },
  ];

  for (const { keywords, domain } of domains) {
    if (keywords.some(kw => lowerSummary.includes(kw))) {
      return domain;
    }
  }
  
  return "";
}

/**
 * Intelligent fallback title generation
 */
function generateTitlesFallback(summary: string): string[] {
  const mainTopic = extractMainResearchTopic(summary);
  const keyFindings = extractKeyFindings(summary);
  const methodology = extractMethodology(summary);
  const domain = extractDomain(summary);

  const titles: string[] = [];

  // Title 1: Direct main topic
  if (mainTopic.length > 10) {
    titles.push(mainTopic);
  }

  // Title 2: "An Analysis/Examination of [topic]"
  const topicPhrase = extractFirstNounPhrase(mainTopic);
  if (topicPhrase) {
    titles.push(`An Analysis of ${topicPhrase}`);
  }

  // Title 3: Include methodology if available
  if (methodology) {
    const methodClean = methodology.replace(/^(?:using|employing|utilizing|through|via|with|a)?\s*/i, '').trim();
    if (topicPhrase) {
      titles.push(`${methodClean} of ${topicPhrase}`);
    } else {
      titles.push(`${methodClean}`);
    }
  }

  // Title 4: Focus on impact/effectiveness
  if (summary.toLowerCase().includes('effectiveness') || summary.toLowerCase().includes('impact')) {
    titles.push(`Examining the Effectiveness of ${topicPhrase || "Contemporary Approaches"}`);
  } else if (keyFindings) {
    titles.push(`Key Findings and Implications of ${topicPhrase || "the Research"}`);
  } else {
    titles.push(`Understanding ${topicPhrase || "the Research Area"}`);
  }

  // Title 5: Forward-looking title
  if (domain) {
    titles.push(`Advancing ${domain} Through Analysis of ${topicPhrase || "Key Issues"}`);
  } else {
    titles.push(`Contemporary Perspectives on ${topicPhrase || "Academic Research"}`);
  }

  // Clean, deduplicate, and filter
  const uniqueTitles = [...new Set(titles)]
    .filter(t => {
      // Remove very short titles
      if (t.length < 15) return false;
      // Remove titles longer than reasonable
      if (t.length > 150) return false;
      // Remove titles with undefined or empty content
      if (t.includes('undefined') || t.includes('null')) return false;
      return true;
    })
    .map(t => t.trim().replace(/\s+/g, ' '));

  // If we don't have enough valid titles, add generic ones
  if (uniqueTitles.length < 3) {
    uniqueTitles.push(
      `Research on ${topicPhrase || "Contemporary Topics"}`,
      `A Study of ${topicPhrase || "Current Issues"}`,
      `Exploring ${topicPhrase || "Academic Research Frontiers"}`
    );
  }

  return uniqueTitles.slice(0, 5);
}

/**
 * Extract the first meaningful noun phrase from text
 */
function extractFirstNounPhrase(text: string): string {
  // Remove common prefixes
  let cleaned = text
    .replace(/^(?:this|the|a|an)\s+(?:research|study|investigation|analysis|examination)\s+(?:aims?\s+to\s+|seeks?\s+to\s+)?(?:about|on|into|regarding|investigating|examining|exploring|analyzing|focusing\s+on|studies?|examines?|analyzes?|investigates?)\s+(?:the\s+)?/i, '')
    .trim();

  // If still too long, take first clause before "and", "in", "of"
  const match = cleaned.match(/^([^,\n]+?)(?:\s+(?:and|in|of|from|with)\s+|$)/i);
  if (match) {
    return match[1].trim();
  }

  return cleaned.substring(0, 80);
}
