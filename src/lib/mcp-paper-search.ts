/**
 * MCP-Based Paper Search Service
 * Uses direct APIs to query real academic databases
 * Only returns results from CrossRef, arXiv, OpenAlex, and Semantic Scholar
 * No mock data
 */

import { Paper, PaperSearchQuery, PaperSearchResult } from '@/types/paper';
import { paperSearchService } from '@/lib/mcp/paper-search';

/**
 * Test if we can connect to APIs
 */
export async function testMCPConnection(): Promise<{
  connected: boolean;
  errors: string[];
}> {
  console.log('[API Test] Testing API connectivity...');
  const errors: string[] = [];

  try {
    // Test CrossRef API
    const response = await fetch('https://api.crossref.org/v1/works?query=test&rows=1');
    if (response.ok) {
      console.log('[API Test] CrossRef connection OK');
      return { connected: true, errors: [] };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[API Test] Connection failed:', msg);
    errors.push(`API Error: ${msg}`);
  }

  return { connected: false, errors };
}

/**
 * Search CrossRef only (for testing)
 */
export async function searchCrossRefOnly(
  query: string,
  maxResults: number = 20
): Promise<PaperSearchResult> {
  console.log('[CrossRef Only] Searching for:', query);

  try {
    const url = new URL('https://api.crossref.org/v1/works');
    url.searchParams.set('query', query);
    url.searchParams.set('rows', String(Math.min(maxResults, 100)));
    url.searchParams.set('sort', 'relevance');
    url.searchParams.set('order', 'desc');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ThesisAI/1.0' },
    });

    if (!response.ok) {
      throw new Error(`CrossRef API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.message || !data.message.items) {
      console.warn('[CrossRef] No works returned');
      return {
        papers: [],
        totalResults: 0,
        query,
        timestamp: Date.now(),
      };
    }

    // Convert CrossRef results to Paper objects
    const papers = data.message.items.map((item: any) => ({
      id: item.DOI || `crossref_${Math.random()}`,
      title: item.title?.[0] || 'Unknown',
      abstract: item.abstract,
      authors: (item.author || []).map((a: any) => ({
        name: `${a.given || ''} ${a.family || ''}`.trim(),
      })),
      year: item.published?.['date-parts']?.[0]?.[0],
      venue: item['container-title']?.[0],
      sources: ['crossref'],
      sourceIds: { doi: item.DOI },
      metadata: {
        citationCount: item['is-referenced-by-count'],
        url: `https://doi.org/${item.DOI}`,
        isOpenAccess: item['is-oa'] === true,
      },
    }));

    console.log(`[CrossRef] Found ${papers.length} papers`);
    return {
      papers,
      totalResults: papers.length,
      query,
      timestamp: Date.now(),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[CrossRef] Search failed:', msg);
    return {
      papers: [],
      totalResults: 0,
      query,
      timestamp: Date.now(),
    };
  }
}

/**
 * Search for academic papers using direct APIs
 * Queries: CrossRef, arXiv, PubMed, Google Scholar
 */
export async function searchAcademicPapersViaMCP(
  query: string,
  options: { maxResults?: number; timeout?: number; sourcesOnly?: string[] } = {}
): Promise<PaperSearchResult & { error?: string }> {
  const { maxResults = 50, timeout = 30000, sourcesOnly = [] } = options;

  console.log('[Paper Search] Searching for:', query);
  console.log('[Paper Search] Options:', { maxResults, sourcesOnly });

  try {
    // For testing: if sourcesOnly is specified, use only those sources
    if (sourcesOnly.length > 0 && sourcesOnly[0] === 'crossref') {
      console.log('[Paper Search] Testing CrossRef only');
      return searchCrossRefOnly(query, maxResults);
    }

    // Build tool functions using direct APIs
    const mcpTools: any = {};

    // CrossRef: Direct API call
    mcpTools.crossrefSearch = async (q: string, rows?: number) => {
      try {
        console.log(`[API Tool] Calling CrossRef with query="${q}", rows=${rows || maxResults}`);
        const url = new URL('https://api.crossref.org/v1/works');
        url.searchParams.set('query', q);
        url.searchParams.set('rows', String(Math.min(rows || maxResults, 100)));
        
        const response = await fetch(url.toString(), {
          headers: { 'User-Agent': 'ThesisAI/1.0' },
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        console.log('[API Tool] CrossRef response:', data.message?.items?.length || 0, 'items');
        return data.message?.items || [];
      } catch (e) {
        console.error('[API Tool] CrossRef failed:', e);
        return [];
      }
    };

    // ArXiv: Call via server-side API route to avoid CORS
    mcpTools.arxivSearch = async (q: string, maxRes?: number) => {
      try {
        console.log(`[API Tool] Calling arXiv via /api/arxiv-search with query="${q}", max_results=${maxRes || 20}`);
        const url = `/api/arxiv-search?q=${encodeURIComponent(q)}&max=${maxRes || 20}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`[API Tool] arXiv API returned ${response.status}`);
          return [];
        }
        const data = await response.json();
        const entries = data.entries || [];
        console.log('[API Tool] arXiv response:', entries.length, 'items');
        return entries;
      } catch (e) {
        console.error('[API Tool] arXiv failed:', e);
        return [];
      }
    };

    // OpenAlex: Call via server-side API route to avoid CORS
    mcpTools.openalexSearch = async (q: string, maxRes?: number) => {
      try {
        console.log(`[API Tool] Calling OpenAlex via /api/openalex-search with query="${q}", max_results=${maxRes || 20}`);
        const url = `/api/openalex-search?q=${encodeURIComponent(q)}&max=${maxRes || 20}`;

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[API Tool] OpenAlex API returned ${response.status}`);
          return [];
        }
        const data = await response.json();
        console.log('[API Tool] OpenAlex response:', data.count || 0, 'items');
        return data.papers || [];
      } catch (e) {
        console.error('[API Tool] OpenAlex failed:', e);
        return [];
      }
    };

    // Semantic Scholar: Call via server-side API route to avoid CORS
    mcpTools.semanticScholarSearch = async (q: string, maxRes?: number) => {
      try {
        console.log(`[API Tool] Calling Semantic Scholar via /api/semantic-scholar-search with query="${q}", max_results=${maxRes || 20}`);
        const url = `/api/semantic-scholar-search?q=${encodeURIComponent(q)}&max=${maxRes || 20}`;

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[API Tool] Semantic Scholar API returned ${response.status}`);
          return [];
        }
        const data = await response.json();
        console.log('[API Tool] Semantic Scholar response:', data.count || 0, 'items');
        return data.papers || [];
      } catch (e) {
        console.error('[API Tool] Semantic Scholar failed:', e);
        return [];
      }
    };

    // Use the paper search service with API tools
    const searchQuery: PaperSearchQuery = {
      query,
      maxResults,
      filters: {
        sources: (sourcesOnly.length > 0 ? sourcesOnly : ['crossref', 'arxiv', 'openalex', 'semantic_scholar']) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
      },
    };

    console.log('[Paper Search] Starting search with sources:', searchQuery.filters?.sources);

    // Wrap in timeout
    const result = await Promise.race([
      paperSearchService.search(searchQuery, mcpTools),
      new Promise<PaperSearchResult>((_, reject) =>
        setTimeout(() => reject(new Error('Paper search timeout')), timeout)
      ),
    ]);

    console.log(`[Paper Search] Found ${result.papers.length} papers`);

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Paper Search] Search error:', msg);

    return {
      papers: [],
      totalResults: 0,
      query,
      timestamp: Date.now(),
      error: msg,
    };
  }
}

/**
 * Get paper details from CrossRef
 */
export async function getPaperDetailsViaMCP(paperId: string): Promise<Paper | null> {
  try {
    // If paperId is a DOI, fetch from CrossRef
    if (paperId.includes('10.')) {
      const response = await fetch(`https://api.crossref.org/v1/works/${encodeURIComponent(paperId)}`, {
        headers: { 'User-Agent': 'ThesisAI/1.0' },
      });
      if (response.ok) {
        const data = await response.json();
        const item = data.message;
        return {
          id: paperId,
          title: item.title?.[0] || 'Unknown',
          abstract: item.abstract,
          authors: (item.author || []).map((a: any) => ({
            name: `${a.given || ''} ${a.family || ''}`.trim(),
          })),
          year: item.published?.['date-parts']?.[0]?.[0],
          sources: ['crossref'],
          sourceIds: { doi: paperId },
          metadata: {
            citationCount: item['is-referenced-by-count'],
            url: `https://doi.org/${paperId}`,
            isOpenAccess: item['is-oa'] === true,
          },
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[Paper Details] Failed to get details:', error);
    return null;
  }
}

/**
 * Get related papers via CrossRef
 */
export async function getRelatedPapersViaMCP(paperId: string): Promise<Paper[]> {
  try {
    // Use CrossRef API to find related papers (citing or cited by)
    if (paperId.includes('10.')) {
      const response = await fetch(`https://api.crossref.org/v1/works/${encodeURIComponent(paperId)}/related`, {
        headers: { 'User-Agent': 'ThesisAI/1.0' },
      });
      if (response.ok) {
        const data = await response.json();
        return (data.message?.items || []).map((item: any) => ({
          id: item.DOI || `crossref_${Math.random()}`,
          title: item.title?.[0] || 'Unknown',
          abstract: item.abstract,
          authors: (item.author || []).map((a: any) => ({
            name: `${a.given || ''} ${a.family || ''}`.trim(),
          })),
          year: item.published?.['date-parts']?.[0]?.[0],
          sources: ['crossref'],
          sourceIds: { doi: item.DOI },
          metadata: {
            citationCount: item['is-referenced-by-count'],
            url: `https://doi.org/${item.DOI}`,
            isOpenAccess: item['is-oa'] === true,
          },
        }));
      }
    }
    return [];
  } catch (error) {
    console.error('[Related Papers] Failed to get related papers:', error);
    return [];
  }
}
