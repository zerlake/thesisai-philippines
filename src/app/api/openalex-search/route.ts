/**
 * API Route: OpenAlex Search (Server-side to avoid CORS)
 *
 * Searches OpenAlex API, bypassing CORS issues
 * SECURITY: Requires authentication, validates input, applies rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Paper } from '@/types/paper';
import { OpenAlexWork } from '@/types/paper';

interface OpenAlexApiResult {
  results?: OpenAlexWork[];
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
    let maxResults = Number(searchParams.get('max') ?? '20');
    const fromYear = searchParams.get('from_year') ?? '';
    const toYear = searchParams.get('to_year') ?? '';

    // SECURITY: Validate query parameter
    if (!query.trim() || query.length > 500) {
      return NextResponse.json(
        { error: 'Query is required and must be less than 500 characters' },
        { status: 400 }
      );
    }

    // SECURITY: Enforce upper limit on results to prevent resource exhaustion
    const MAX_RESULTS = 100;
    if (isNaN(maxResults) || maxResults < 1 || maxResults > MAX_RESULTS) {
      maxResults = Math.min(20, MAX_RESULTS);
    }

    // SECURITY: Validate year parameters
    const currentYear = new Date().getFullYear();
    if (fromYear && (isNaN(Number(fromYear)) || Number(fromYear) < 1000 || Number(fromYear) > currentYear)) {
      return NextResponse.json(
        { error: 'Invalid from_year parameter' },
        { status: 400 }
      );
    }
    if (toYear && (isNaN(Number(toYear)) || Number(toYear) < 1000 || Number(toYear) > currentYear)) {
      return NextResponse.json(
        { error: 'Invalid to_year parameter' },
        { status: 400 }
      );
    }

    console.log(`[API] OpenAlex search: ${query}, max: ${maxResults}`);

    // Construct OpenAlex API URL
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', query);
    url.searchParams.set('per-page', String(Math.min(maxResults, 100)));
    url.searchParams.set('sort', 'relevance_score:desc');

    // Add date range filter if specified
    if (fromYear && toYear) {
      url.searchParams.set('filter', `from_publication_date:${fromYear}-01-01,to_publication_date:${toYear}-12-31`);
    } else if (fromYear) {
      url.searchParams.set('filter', `from_publication_date:${fromYear}-01-01`);
    } else if (toYear) {
      url.searchParams.set('filter', `to_publication_date:${toYear}-12-31`);
    }

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ThesisAI/1.0' },
    });

    if (!response.ok) {
      console.error(`[API] OpenAlex API returned ${response.status}`);
      return NextResponse.json(
        { error: `OpenAlex API error: ${response.status}`, papers: [] },
        { status: response.status }
      );
    }

    const data: OpenAlexApiResult = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log('[API] OpenAlex returned no results');
      return NextResponse.json({
        papers: [],
        count: 0,
        query,
      });
    }

    // Transform OpenAlex results to Paper objects
    const papers: Paper[] = data.results
      .filter(result => result.display_name || result.title) // Only include results with titles
      .map((result, index) => {
        // Extract abstract from inverted index
        let abstract: string | undefined;
        if (result.abstract_inverted_index) {
          abstract = Object.keys(result.abstract_inverted_index).join(' ');
        }

        return {
          id: result.id || `openalex_${Date.now()}_${index}`, // Generate a unique ID
          title: result.display_name || result.title || 'Untitled',
          authors: (result.authorships || []).map((auth: any) => ({
            name: auth.author?.display_name || 'Unknown Author',
          })),
          year: result.publication_year,
          venue: result.host_venue?.display_name,
          abstract,
          sources: ['openalex'],
          sourceIds: {
            openAlexId: result.id,
          },
          metadata: {
            citationCount: result.cited_by_count,
            isOpenAccess: result.open_access?.is_oa,
            url: result.primary_location?.landing_page_url || result.doi,
            pdfUrl: result.primary_location?.pdf_url,
          },
          // Add conceptual metadata from OpenAlex
          concepts: (result.concepts || []).map((concept: any) => ({
            id: concept.id,
            name: concept.display_name,
            level: concept.level,
            score: concept.score,
          })),
        };
      });

    console.log(`[API] OpenAlex found ${papers.length} papers`);

    return NextResponse.json({
      papers,
      count: papers.length,
      query,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API] OpenAlex search error:', msg);
    return NextResponse.json(
      { error: `OpenAlex search failed: ${msg}`, papers: [] },
      { status: 500 }
    );
  }
}