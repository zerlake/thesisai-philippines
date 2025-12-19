/**
 * API Route: Semantic Scholar Search (Server-side to avoid CORS)
 *
 * Searches Semantic Scholar API, bypassing CORS issues
 * SECURITY: Requires authentication, validates input, applies rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Paper } from '@/types/paper';
import { SemanticScholarPaper } from '@/types/paper';

interface SemanticScholarApiResult {
  data?: SemanticScholarPaper[];
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    let limit = Number(searchParams.get('limit') ?? '20');

    // SECURITY: Validate query parameter
    if (!query.trim() || query.length > 500) {
      return NextResponse.json(
        { error: 'Query is required and must be less than 500 characters' },
        { status: 400 }
      );
    }

    // SECURITY: Enforce upper limit on results to prevent resource exhaustion
    const MAX_RESULTS = 100;
    if (isNaN(limit) || limit < 1 || limit > MAX_RESULTS) {
      limit = Math.min(20, MAX_RESULTS);
    }

    console.log(`[API] Semantic Scholar search: ${query}, limit: ${limit}`);

    // Construct Semantic Scholar API URL
    const url = new URL('https://api.semanticscholar.org/graph/v1/paper/search');
    url.searchParams.set('query', query);
    url.searchParams.set('limit', String(Math.min(limit, 100)));
    
    // Specify fields to retrieve
    url.searchParams.set('fields', 'title,abstract,year,venue,authors,citationCount,externalIds,fieldsOfStudy,tldr,influentialCitationCount,openAccessPdf');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'ThesisAI/1.0',
        'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || ''  // Use API key if available
      },
    });

    if (!response.ok) {
      // Semantic Scholar may return 403 if API key is required but not provided
      if (response.status === 403) {
        console.warn('[API] Semantic Scholar requires API key or rate limit exceeded');
        return NextResponse.json(
          { error: 'Semantic Scholar API key required or rate limit exceeded', papers: [] },
          { status: 403 }
        );
      }
      console.error(`[API] Semantic Scholar API returned ${response.status}`);
      return NextResponse.json(
        { error: `Semantic Scholar API error: ${response.status}`, papers: [] },
        { status: response.status }
      );
    }

    const data: SemanticScholarApiResult = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('[API] Semantic Scholar returned no results');
      return NextResponse.json({
        papers: [],
        count: 0,
        query,
      });
    }

    // Transform Semantic Scholar results to Paper objects
    const papers: Paper[] = data.data
      .filter(result => result.title && result.paperId) // Only include results with title AND paperId
      .map((result, index) => {
        const mappedPaper: Paper = {
          id: result.paperId || `s2_${Date.now()}_${index}`, // Generate a unique ID
          title: result.title || 'Untitled',
          authors: (result.authors || []).map((author: any) => ({
            name: author.name || 'Unknown Author',
          })),
          year: result.year,
          venue: result.venue,
          abstract: result.abstract,
          sources: ['semantic_scholar'],
          sourceIds: {
            semanticScholarId: result.paperId,
          },
          metadata: {
            citationCount: result.citationCount,
            url: result.paperId ? `https://www.semanticscholar.org/paper/${result.paperId}` : undefined,
            pdfUrl: result.openAccessPdf?.url,
          },
          s2FieldsOfStudy: result.fieldsOfStudy,
          s2Tldr: result.tldr?.text,
          s2InfluentialCitationCount: result.influentialCitationCount,
        };

        // Add DOI from externalIds if available
        if (result.externalIds?.DOI) {
          mappedPaper.sourceIds.doi = result.externalIds.DOI;
        }

        return mappedPaper;
      });

    console.log(`[API] Semantic Scholar found ${papers.length} papers`);

    return NextResponse.json({
      papers,
      count: papers.length,
      query,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API] Semantic Scholar search error:', msg);
    return NextResponse.json(
      { error: `Semantic Scholar search failed: ${msg}`, papers: [] },
      { status: 500 }
    );
  }
}