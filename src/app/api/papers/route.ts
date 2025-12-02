import { NextRequest, NextResponse } from 'next/server';
import { generateSamplePapers, generateRandomPapers } from '@/lib/sample-papers-data';

/**
 * GET /api/papers
 * 
 * Returns sample paper data for testing/development
 * 
 * Query parameters:
 * - query: Search query to filter papers
 * - count: Number of papers to return (default: 10, max: 100)
 * - random: If true, generate random papers instead of curated list (default: false)
 * - page: Page number for pagination (default: 1)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const countParam = searchParams.get('count');
    const useRandom = searchParams.get('random') === 'true';
    const pageParam = searchParams.get('page');

    // Parse and validate parameters
    const count = Math.min(parseInt(countParam || '10'), 100);
    const page = Math.max(parseInt(pageParam || '1'), 1);

    // Generate papers
    const papers = useRandom 
      ? generateRandomPapers(count)
      : generateSamplePapers(count, query);

    // Add pagination info
    const totalCount = useRandom ? count : 10;
    const startIndex = (page - 1) * count;
    const paginatedPapers = papers.slice(startIndex, startIndex + count);

    return NextResponse.json({
      papers: paginatedPapers,
      pagination: {
        page,
        pageSize: count,
        totalCount,
        totalPages: Math.ceil(totalCount / count),
        hasMore: startIndex + count < totalCount
      },
      query: query || undefined
    });
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Papers API error:', errorMsg);
    return NextResponse.json(
      { error: `Failed to fetch papers: ${errorMsg}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/papers
 * 
 * Search or filter papers
 * 
 * Body:
 * {
 *   "query": "search terms",
 *   "count": 10,
 *   "filters": {
 *     "year": 2023,
 *     "author": "author name"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, count = 10, filters } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let papers = generateSamplePapers(Math.min(count, 100), query);

    // Apply filters if provided
    if (filters) {
      if (filters.year) {
        papers = papers.filter(p => {
          const pubYear = parseInt(p.publication_info.split('/')[2]);
          return pubYear === filters.year;
        });
      }

      if (filters.author) {
        const authorLower = filters.author.toLowerCase();
        papers = papers.filter(p =>
          p.authors?.toLowerCase().includes(authorLower)
        );
      }
    }

    return NextResponse.json({
      papers,
      query,
      resultCount: papers.length,
      filters: filters || undefined
    });
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Papers search error:', errorMsg);
    return NextResponse.json(
      { error: `Failed to search papers: ${errorMsg}` },
      { status: 500 }
    );
  }
}
