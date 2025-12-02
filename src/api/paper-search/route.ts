/**
 * API Route for Paper Search
 * POST /api/paper-search - Execute paper search
 */

import { NextRequest, NextResponse } from 'next/server';
import { paperSearchService } from '@/lib/mcp/paper-search';
import { PaperSearchQuery } from '@/types/paper';

// Mock MCP tool implementations for demonstration
const mockTools = {
  crossrefSearch: async (q: string, rows: number = 20) => {
    // In production, this would call the actual CrossRef MCP server
    return [];
  },
  arxivSearch: async (q: string, maxResults: number = 20) => {
    // In production, this would call the actual ArXiv MCP server
    return [];
  },
  pubmedSearch: async (q: string, maxResults: number = 20) => {
    // In production, this would call the actual PubMed MCP server
    return [];
  },
  scholarSearch: async (q: string, numResults: number = 20) => {
    // In production, this would call the actual Google Scholar MCP server
    return [];
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PaperSearchQuery;

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Execute search through paper search service
    const result = await paperSearchService.search(body, mockTools);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('Paper search error:', error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const maxResults = parseInt(searchParams.get('maxResults') || '20', 10);
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!, 10) : undefined;
    const maxYear = searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!, 10) : undefined;
    const minCitations = searchParams.get('minCitations') ? parseInt(searchParams.get('minCitations')!, 10) : undefined;
    const isOpenAccessOnly = searchParams.get('isOpenAccessOnly') === 'true';

    const searchQuery: PaperSearchQuery = {
      query,
      maxResults,
      filters: {
        minYear,
        maxYear,
        minCitations,
        isOpenAccessOnly,
      },
    };

    const result = await paperSearchService.search(searchQuery, mockTools);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('Paper search error:', error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
