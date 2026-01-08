/**
 * API Route: ArXiv Search (Server-side to avoid CORS)
 *
 * Proxies requests to arXiv API to avoid browser CORS issues
 * Includes rate limiting based on user plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit-middleware';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, {
    feature: 'paper_search',
    planLimits: true,
    perMinute: 20,
  });

  if (!rateLimitResult.allowed && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const maxResults = Number(searchParams.get('max') ?? '20');

    if (!query.trim()) {
      const errorResponse = NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );

      // Add rate limit headers
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          errorResponse.headers.set(key, value);
        }
      });

      return errorResponse;
    }

    // Build arXiv search query
    const searchQuery = `all:${query.split(' ').join(' AND ')}`;
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}&max_results=${Math.min(maxResults, 100)}&sortBy=relevance&sortOrder=descending`;

    console.log(`[API] ArXiv search: ${query}, max: ${maxResults}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const arxivResponse = await fetch(arxivUrl, {
      headers: { 'User-Agent': 'ThesisAI/1.0' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!arxivResponse.ok) {
      console.error(`[API] ArXiv returned ${arxivResponse.status}`);
      return NextResponse.json(
        { error: `ArXiv API error: ${arxivResponse.status}`, entries: [] },
        { status: arxivResponse.status }
      );
    }

    const text = await arxivResponse.text();

    // Parse XML entries - using regex matching which is safe in server environment
    const entryMatches = text.match(/<entry[^>]*>([\s\S]*?)<\/entry>/g) || [];
    const entries = [];

    for (const entryText of entryMatches) {
      // Extract entry properties using regex
      const id = extractXMLTagContent(entryText, 'id') || '';
      const title = extractXMLTagContent(entryText, 'title') || '';
      const summary = extractXMLTagContent(entryText, 'summary') || '';
      const published = extractXMLTagContent(entryText, 'published') || '';
      const updated = extractXMLTagContent(entryText, 'updated') || '';

      // Extract authors
      const authorMatches = entryText.match(/<author>([\s\S]*?)<\/author>/g) || [];
      const authors = authorMatches.map(authorText => {
        const name = extractXMLTagContent(authorText, 'name');
        return { name };
      }).filter(author => author.name);

      // Extract categories
      const categoryMatches = entryText.match(/<category[^>]*\/?>/g) || [];
      const categories = categoryMatches.map(cat => {
        const match = cat.match(/term=["']([^"']*)["']/);
        return match ? match[1] : null;
      }).filter(Boolean);

      // Extract links
      const linkMatches = entryText.match(/<link[^>]*\/?>/g) || [];
      const links = linkMatches.map(link => {
        const hrefMatch = link.match(/href=["']([^"']*)["']/);
        const relMatch = link.match(/rel=["']([^"']*)["']/);
        const typeMatch = link.match(/type=["']([^"']*)["']/);

        if (hrefMatch) {
          return {
            href: hrefMatch[1],
            rel: relMatch ? relMatch[1] : undefined,
            type: typeMatch ? typeMatch[1] : undefined
          };
        }
        return null;
      }).filter(Boolean);

      entries.push({
        id: id,
        title: title,
        summary: summary,
        published: published,
        updated: updated,
        authors: authors,
        categories: categories,
        links: links
      });
    }

    console.log(`[API] ArXiv found ${entries.length} papers`);

    const successResponse = NextResponse.json({
      entries,
      count: entries.length,
      query: query,
    });

    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        successResponse.headers.set(key, value);
      }
    });

    return successResponse;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API] ArXiv search error:', msg);

    const errorResponse = NextResponse.json(
      { error: `ArXiv search failed: ${msg}`, entries: [] },
      { status: 500 }
    );

    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        errorResponse.headers.set(key, value);
      }
    });

    return errorResponse;
  }
}

/**
 * Helper function to extract content from XML tags
 */
function extractXMLTagContent(xml: string, tagName: string): string | null {
  const startTag = `<${tagName}>`;
  const endTag = `</${tagName}>`;

  const startIndex = xml.indexOf(startTag);
  if (startIndex === -1) return null;

  const contentStart = startIndex + startTag.length;
  const endIndex = xml.indexOf(endTag, contentStart);
  if (endIndex === -1) return null;

  return xml.substring(contentStart, endIndex).trim();
}
