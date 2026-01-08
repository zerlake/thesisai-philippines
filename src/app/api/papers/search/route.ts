/**
 * API Route: Paper Search
 *
 * Bypasses CORS issues by handling API calls on the server side
 * Clients make requests to this endpoint instead of directly to external APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { Paper, PaperSearchQuery } from '@/types/paper';
import { generatePaperSummaries } from '@/lib/paper-summary';
import { withRateLimit } from '@/lib/rate-limit-middleware';
import { withAuth } from '@/lib/jwt-validator';

export const maxDuration = 30; // Allow up to 30 seconds for search

/**
 * POST /api/papers/search
 *
 * Request body: PaperSearchQuery
 * Returns: { papers: Paper[], totalResults: number, query: string, timestamp: number }
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, {
    feature: 'paper_search',
    planLimits: true,
    perMinute: 20, // Fallback: 20 searches/minute
  });

  if (!rateLimitResult.allowed && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const query: PaperSearchQuery = await request.json();

    if (!query.query || query.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const maxResults = query.maxResults || 20;
    const sources = query.filters?.sources || ['crossref', 'arxiv', 'openalex', 'semantic_scholar'];

    const results: Paper[] = [];
    const searches = [];

    console.log(`[API] Searching for: "${query.query}" in sources:`, sources);

    // Search CrossRef
    if (sources.includes('crossref')) {
      searches.push(
        searchCrossRef(query.query, maxResults)
          .then((papers) => {
            console.log(`[API] CrossRef found ${papers.length} papers`);
            results.push(...papers);
          })
          .catch((err) => console.warn('[API] CrossRef failed:', err.message))
      );
    }

    // Search arXiv (server-side CORS workaround)
    if (sources.includes('arxiv')) {
      searches.push(
        searchArxiv(query.query, maxResults)
          .then((papers) => {
            console.log(`[API] arXiv found ${papers.length} papers`);
            results.push(...papers);
          })
          .catch((err) => console.warn('[API] arXiv failed:', err.message))
      );
    }

    // Search OpenAlex
    if (sources.includes('openalex')) {
      searches.push(
        searchOpenAlex(query.query, maxResults)
          .then((papers) => {
            console.log(`[API] OpenAlex found ${papers.length} papers`);
            results.push(...papers);
          })
          .catch((err) => console.warn('[API] OpenAlex failed:', err.message))
      );
    }

    // Search Semantic Scholar
    if (sources.includes('semantic_scholar')) {
      searches.push(
        searchSemanticScholar(query.query, maxResults)
          .then((papers) => {
            console.log(`[API] Semantic Scholar found ${papers.length} papers`);
            results.push(...papers);
          })
          .catch((err) => console.warn('[API] Semantic Scholar failed:', err.message))
      );
    }

    // Wait for all searches
    await Promise.allSettled(searches);

    // Deduplicate
    const deduplicated = deduplicatePapers(results);

    // Apply filters
    const filtered = applyFilters(deduplicated, query.filters);

    // Sort by citations
    const sorted = filtered.sort((a, b) => {
      const citesA = a.metadata.citationCount || 0;
      const citesB = b.metadata.citationCount || 0;
      return citesB - citesA;
    });

    // Generate summaries for papers that lack abstracts
    const papersWithSummaries = await generatePaperSummaries(sorted);

    console.log(
      `[API] Found ${papersWithSummaries.length} papers from ${results.length} candidates`
    );

    // Create response with rate limit headers
    const response = NextResponse.json({
      papers: papersWithSummaries,
      totalResults: papersWithSummaries.length,
      query: query.query,
      timestamp: Date.now(),
    }, {
      headers: rateLimitResult.headers,
    });

    return response;
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Search CrossRef API
 */
async function searchCrossRef(query: string, maxResults: number): Promise<Paper[]> {
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
    const papers: Paper[] = [];

    for (const item of data.message.items || []) {
      papers.push({
        id: item.DOI || `crossref_${item.URL}`,
        title: item.title?.[0] || 'Untitled',
        authors: (item.author || []).map((a: any) => ({
          name: `${a.given || ''} ${a.family || ''}`.trim(),
          affiliation: a.affiliation?.[0]?.name,
        })),
        year: item.published?.['date-parts']?.[0]?.[0],
        abstract: item.abstract,
        sources: ['crossref'],
        sourceIds: {
          doi: item.DOI,
        },
        metadata: {
          citationCount: item['is-referenced-by-count'] || 0,
          pdfUrl: extractPdfUrl(item),
        },
      });
    }

    return papers;
  } catch (error) {
    console.error('[API] CrossRef error:', error);
    throw error;
  }
}

/**
 * Search arXiv API (server-side to avoid CORS)
 */
async function searchArxiv(query: string, maxResults: number): Promise<Paper[]> {
  try {
    const searchQuery = encodeURIComponent(
      `all:${query.split(' ').join(' AND ')}`
    );
    const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&max_results=${Math.min(
      maxResults,
      100
    )}&sortBy=relevance&sortOrder=descending`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ThesisAI/1.0' },
    });

    if (!response.ok) {
      throw new Error(`arXiv API returned ${response.status}`);
    }

    const text = await response.text();
    const papers: Paper[] = [];

    // Parse Atom XML response
    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

    for (const entry of entries) {
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1];
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1];
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1];
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
      const authorMatches = entry.matchAll(/<name>(.*?)<\/name>/g);

      const arxivId = id?.replace('http://arxiv.org/abs/', '') || '';

      papers.push({
        id: arxivId,
        title: title?.trim() || 'Untitled',
        authors: Array.from(authorMatches).map((m) => ({
          name: m[1],
        })),
        year: new Date(published || '').getFullYear(),
        abstract: summary?.trim().replace(/\n\s+/g, ' '),
        sources: ['arxiv'],
        sourceIds: {
          arxivId,
        },
        metadata: {
          pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
          url: `https://arxiv.org/abs/${arxivId}`,
        },
      });
    }

    return papers;
  } catch (error) {
    console.error('[API] arXiv error:', error);
    throw error;
  }
}


/**
 * Deduplicate papers by DOI, ArXiv ID, OpenAlex ID, Semantic Scholar ID, or Title+Year
 */
function deduplicatePapers(papers: Paper[]): Paper[] {
  const groups: Map<string, Paper[]> = new Map();

  // Group papers by various identifiers
  for (const paper of papers) {
    let key: string | null = null;

    // Priority order for grouping keys:
    if (paper.sourceIds.doi) {
      key = `doi:${paper.sourceIds.doi}`;
    } else if (paper.sourceIds.arxivId) {
      key = `arxiv:${paper.sourceIds.arxivId}`;
    } else if (paper.sourceIds.openAlexId) {
      key = `openalex:${paper.sourceIds.openAlexId}`;
    } else if (paper.sourceIds.semanticScholarId) {
      key = `semantic_scholar:${paper.sourceIds.semanticScholarId}`;
    } else if (paper.title && paper.year) {
      // Fallback to normalized title + year
      const normalizedTitle = paper.title.toLowerCase().replace(/\s+/g, ' ').trim();
      key = `title_year:${normalizedTitle}:${paper.year}`;
    } else {
      // If no other identifiers available, use the internal ID
      key = `id:${paper.id}`;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(paper);
  }

  const deduplicated: Paper[] = [];

  for (const paperGroup of groups.values()) {
    // For each group of potentially duplicate papers, merge them into a single paper
    let mergedPaper = paperGroup[0]; // Start with the first paper in the group

    for (let i = 1; i < paperGroup.length; i++) {
      const currentPaper = paperGroup[i];

      // Combine sources
      mergedPaper.sources = [...new Set([...mergedPaper.sources, ...currentPaper.sources])];

      // Prefer longer or more complete titles
      if (currentPaper.title && currentPaper.title.length > (mergedPaper.title?.length || 0)) {
        mergedPaper.title = currentPaper.title;
      }

      // Prefer longer or more complete abstracts
      if (currentPaper.abstract && (!mergedPaper.abstract || currentPaper.abstract.length > mergedPaper.abstract.length)) {
        mergedPaper.abstract = currentPaper.abstract;
      }

      // Merge authors list, avoiding duplicates
      if (currentPaper.authors) {
        const authorNames = new Set(mergedPaper.authors.map(a => a.name));
        for (const author of currentPaper.authors) {
          if (!authorNames.has(author.name)) {
            mergedPaper.authors.push(author);
            authorNames.add(author.name);
          }
        }
      }

      // Use the latest year if there's a conflict
      if (currentPaper.year && (!mergedPaper.year || currentPaper.year > mergedPaper.year)) {
        mergedPaper.year = currentPaper.year;
      }

      // Merge venue
      if (currentPaper.venue && !mergedPaper.venue) {
        mergedPaper.venue = currentPaper.venue;
      }

      // Update source IDs if not already set
      if (currentPaper.sourceIds.doi && !mergedPaper.sourceIds.doi) {
        mergedPaper.sourceIds.doi = currentPaper.sourceIds.doi;
      }
      if (currentPaper.sourceIds.arxivId && !mergedPaper.sourceIds.arxivId) {
        mergedPaper.sourceIds.arxivId = currentPaper.sourceIds.arxivId;
      }
      if (currentPaper.sourceIds.openAlexId && !mergedPaper.sourceIds.openAlexId) {
        mergedPaper.sourceIds.openAlexId = currentPaper.sourceIds.openAlexId;
      }
      if (currentPaper.sourceIds.semanticScholarId && !mergedPaper.sourceIds.semanticScholarId) {
        mergedPaper.sourceIds.semanticScholarId = currentPaper.sourceIds.semanticScholarId;
      }

      // Merge metadata, preferring more complete data
      if (currentPaper.metadata.citationCount !== undefined &&
          (mergedPaper.metadata.citationCount === undefined ||
           currentPaper.metadata.citationCount > (mergedPaper.metadata.citationCount || 0))) {
        mergedPaper.metadata.citationCount = currentPaper.metadata.citationCount;
      }

      if (currentPaper.metadata.isOpenAccess) {
        mergedPaper.metadata.isOpenAccess = currentPaper.metadata.isOpenAccess;
      }

      if (currentPaper.metadata.url && !mergedPaper.metadata.url) {
        mergedPaper.metadata.url = currentPaper.metadata.url;
      }

      if (currentPaper.metadata.pdfUrl && !mergedPaper.metadata.pdfUrl) {
        mergedPaper.metadata.pdfUrl = currentPaper.metadata.pdfUrl;
      }

      // Merge conceptual metadata
      if (currentPaper.concepts && !mergedPaper.concepts) {
        mergedPaper.concepts = currentPaper.concepts;
      } else if (currentPaper.concepts && mergedPaper.concepts) {
        // Merge concepts, avoiding duplicates by ID
        const conceptIds = new Set(mergedPaper.concepts.map(c => c.id));
        for (const concept of currentPaper.concepts) {
          if (!conceptIds.has(concept.id)) {
            mergedPaper.concepts.push(concept);
            conceptIds.add(concept.id);
          }
        }
      }

      if (currentPaper.s2FieldsOfStudy && !mergedPaper.s2FieldsOfStudy) {
        mergedPaper.s2FieldsOfStudy = currentPaper.s2FieldsOfStudy;
      } else if (currentPaper.s2FieldsOfStudy && mergedPaper.s2FieldsOfStudy) {
        // Merge fields of study
        const fieldsSet = new Set([...mergedPaper.s2FieldsOfStudy, ...currentPaper.s2FieldsOfStudy]);
        mergedPaper.s2FieldsOfStudy = Array.from(fieldsSet);
      }

      if (currentPaper.s2Tldr && !mergedPaper.s2Tldr) {
        mergedPaper.s2Tldr = currentPaper.s2Tldr;
      }

      if (currentPaper.s2InfluentialCitationCount !== undefined &&
          (mergedPaper.s2InfluentialCitationCount === undefined ||
           currentPaper.s2InfluentialCitationCount > (mergedPaper.s2InfluentialCitationCount || 0))) {
        mergedPaper.s2InfluentialCitationCount = currentPaper.s2InfluentialCitationCount;
      }

      // Preserve generated summary if one paper has it
      if (currentPaper.generatedSummary && !mergedPaper.generatedSummary) {
        mergedPaper.generatedSummary = currentPaper.generatedSummary;
      }
    }

    deduplicated.push(mergedPaper);
  }

  return deduplicated;
}

/**
 * Apply filters
 */
function applyFilters(
  papers: Paper[],
  filters?: PaperSearchQuery['filters']
): Paper[] {
  if (!filters) return papers;

  return papers.filter((paper) => {
    if (filters.minYear && paper.year && paper.year < filters.minYear) {
      return false;
    }
    if (filters.maxYear && paper.year && paper.year > filters.maxYear) {
      return false;
    }
    if (filters.minCitations && (paper.metadata.citationCount || 0) < filters.minCitations) {
      return false;
    }
    if (filters.isOpenAccessOnly && !paper.metadata.isOpenAccess) {
      return false;
    }
    return true;
  });
}

/**
 * Search OpenAlex API
 */
async function searchOpenAlex(query: string, maxResults: number): Promise<Paper[]> {
  try {
    // Build the OpenAlex API URL
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', query);
    url.searchParams.set('per-page', String(Math.min(maxResults, 100)));
    url.searchParams.set('sort', 'relevance_score:desc');

    // Add date range filter if specified in filters
    if (maxResults > 0) {
      url.searchParams.set('sample', String(Math.min(maxResults, 100)));
    }

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ThesisAI/1.0' },
    });

    if (!response.ok) {
      throw new Error(`OpenAlex API returned ${response.status}`);
    }

    const data = await response.json();
    const papers: Paper[] = [];

    for (const work of data.results || []) {
      // Map OpenAlex result to Paper
      const paper: Paper = {
        id: work.id || `openalex_${Date.now()}_${papers.length}`,
        title: work.display_name || work.title || 'Untitled',
        abstract: work.abstract_inverted_index ?
          Object.keys(work.abstract_inverted_index).join(' ') : undefined,
        authors: (work.authorships || []).map((auth: any) => ({
          name: auth.author?.display_name || 'Unknown Author',
        })),
        year: work.publication_year,
        venue: work.host_venue?.display_name,
        sourceIds: {
          openAlexId: work.id,
        },
        sources: ['openalex'],
        metadata: {
          citationCount: work.cited_by_count,
          isOpenAccess: work.open_access?.is_oa,
          url: work.primary_location?.landing_page_url || work.doi,
          pdfUrl: work.primary_location?.pdf_url,
        },
        // Add conceptual metadata from OpenAlex
        concepts: (work.concepts || []).map((concept: any) => ({
          id: concept.id,
          name: concept.display_name,
          level: concept.level,
          score: concept.score,
        })),
      };

      papers.push(paper);
    }

    return papers;
  } catch (error) {
    console.error('[API] OpenAlex error:', error);
    throw error;
  }
}

/**
 * Search Semantic Scholar API
 */
async function searchSemanticScholar(query: string, maxResults: number): Promise<Paper[]> {
  try {
    const url = new URL('https://api.semanticscholar.org/graph/v1/paper/search');
    url.searchParams.set('query', query);
    url.searchParams.set('limit', String(Math.min(maxResults, 100)));

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
        return [];
      }
      throw new Error(`Semantic Scholar API returned ${response.status}`);
    }

    const data = await response.json();
    const papers: Paper[] = [];

    for (const paper of data.data || []) {
      const mappedPaper: Paper = {
        id: paper.paperId || `s2_${Date.now()}_${papers.length}`,
        title: paper.title || 'Untitled',
        abstract: paper.abstract,
        authors: (paper.authors || []).map((author: any) => ({
          name: author.name || 'Unknown Author',
        })),
        year: paper.year,
        venue: paper.venue,
        sourceIds: {
          semanticScholarId: paper.paperId,
        },
        sources: ['semantic_scholar'],
        metadata: {
          citationCount: paper.citationCount,
          url: `https://www.semanticscholar.org/paper/${paper.paperId}`,
          pdfUrl: paper.openAccessPdf?.url,
        },
        s2FieldsOfStudy: paper.fieldsOfStudy,
        s2Tldr: paper.tldr?.text,
        s2InfluentialCitationCount: paper.influentialCitationCount,
      };

      // Add DOI from externalIds if available
      if (paper.externalIds?.DOI) {
        mappedPaper.sourceIds.doi = paper.externalIds.DOI;
      }

      papers.push(mappedPaper);
    }

    return papers;
  } catch (error) {
    console.error('[API] Semantic Scholar error:', error);
    throw error;
  }
}

/**
 * Extract PDF URL from CrossRef item
 */
function extractPdfUrl(item: any): string | undefined {
  const link = item.link?.find((l: any) => l['content-type'] === 'application/pdf');
  if (link) return link.URL;

  if (item.URL?.includes('.pdf')) return item.URL;

  return undefined;
}
