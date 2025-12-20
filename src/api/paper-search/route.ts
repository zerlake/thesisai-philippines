/**
 * API Route for Paper Search
 * POST /api/paper-search - Execute paper search
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paperSearchService } from '@/lib/mcp/paper-search';
import { PaperSearchQuery } from '@/types/paper';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';

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

// Validation schema
const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query required')
    .max(500, 'Query too long')
    .trim(),
  maxResults: z.number().int().min(1).max(100).optional().default(20),
  filters: z.object({
    minYear: z.number().int().optional(),
    maxYear: z.number().int().optional(),
    minCitations: z.number().int().optional(),
    isOpenAccessOnly: z.boolean().optional(),
  }).optional(),
});

// Get user ID from request (from session/auth context)
function getUserId(request: NextRequest): string {
  // In production, extract from session/JWT token
  // For now, use a placeholder based on IP
  return request.ip || 'anonymous';
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    // Rate limiting: 100 searches per minute per user
    if (!checkRateLimit(userId, 100, 60000)) {
      const { remaining, resetAt } = getRemainingRequests(userId, 100, 60000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          remaining,
          resetAt: new Date(resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const body = await request.json() as PaperSearchQuery;

    // Validate input
    const validation = searchQuerySchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const validatedBody = validation.data as PaperSearchQuery;

    // Execute search through paper search service
    const result = await paperSearchService.search(validatedBody, mockTools);

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
    const userId = getUserId(request);
    
    // Rate limiting: 100 searches per minute per user
    if (!checkRateLimit(userId, 100, 60000)) {
      const { remaining, resetAt } = getRemainingRequests(userId, 100, 60000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          remaining,
          resetAt: new Date(resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

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
