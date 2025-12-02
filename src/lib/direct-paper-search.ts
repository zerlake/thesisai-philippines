/**
 * Direct Paper Search Service
 * 
 * Searches real academic databases directly without MCP dependency.
 * Supports: CrossRef, ArXiv, PubMed, and Google Scholar APIs
 */

import { Paper, PaperSearchQuery, PaperSearchResult } from '@/types/paper';

export class DirectPaperSearchService {
  private cache: Map<string, { results: Paper[]; timestamp: number }> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Search all sources in parallel
   */
  async search(query: PaperSearchQuery): Promise<PaperSearchResult> {
    const cacheKey = `${query.query}_${JSON.stringify(query.filters || {})}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[PaperSearch] Returning cached results');
      return {
        papers: cached.results,
        totalResults: cached.results.length,
        query: query.query,
        timestamp: Date.now(),
      };
    }

    const maxResults = query.maxResults || 20;
    const sources = query.filters?.sources || ['crossref', 'arxiv'];

    try {
      const results: Paper[] = [];
      const searches = [];

      console.log(`[PaperSearch] Searching for: "${query.query}" in sources:`, sources);

      if (sources.includes('crossref')) {
        searches.push(
          this.searchCrossRef(query.query, maxResults)
            .then((papers) => {
              console.log(`[CrossRef] Found ${papers.length} papers`);
              results.push(...papers);
            })
            .catch((err) => console.warn('[CrossRef] Search failed:', err.message))
        );
      }

      if (sources.includes('arxiv')) {
        searches.push(
          this.searchArxiv(query.query, maxResults)
            .then((papers) => {
              console.log(`[ArXiv] Found ${papers.length} papers`);
              results.push(...papers);
            })
            .catch((err) => console.warn('[ArXiv] Search failed:', err.message))
        );
      }



      // Wait for all searches
      await Promise.allSettled(searches);

      // Deduplicate by DOI/ID
      const deduplicated = this.deduplicatePapers(results);

      // Apply filters
      const filtered = this.applyFilters(deduplicated, query.filters);

      // Sort by relevance
      const sorted = filtered.sort((a, b) => {
        const citesA = a.metadata.citationCount || 0;
        const citesB = b.metadata.citationCount || 0;
        return citesB - citesA;
      });

      // Cache results
      this.cache.set(cacheKey, {
        results: sorted,
        timestamp: Date.now(),
      });

      console.log(
        `[PaperSearch] Found ${sorted.length} papers from ${results.length} candidates after deduplication`
      );

      return {
        papers: sorted,
        totalResults: sorted.length,
        query: query.query,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[PaperSearch] Search failed:', error);
      throw error;
    }
  }

  /**
   * Search CrossRef API
   */
  private async searchCrossRef(query: string, maxResults: number): Promise<Paper[]> {
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
            pdfUrl: this.extractPdfUrl(item),
          },
        });
      }

      return papers;
    } catch (error) {
      console.error('[CrossRef] Search error:', error);
      throw error;
    }
  }

  /**
   * Search ArXiv API
   */
  private async searchArxiv(query: string, maxResults: number): Promise<Paper[]> {
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
        throw new Error(`ArXiv API returned ${response.status}`);
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
          authors: Array.from(authorMatches).map(m => ({
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
          },
        });
      }

      return papers;
    } catch (error) {
      console.error('[ArXiv] Search error:', error);
      throw error;
    }
  }



  /**
   * Deduplicate papers by DOI/ID
   */
  private deduplicatePapers(papers: Paper[]): Paper[] {
    const seen = new Set<string>();
    const deduplicated: Paper[] = [];

    for (const paper of papers) {
      const key = paper.sourceIds.doi || paper.id;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(paper);
      }
    }

    return deduplicated;
  }

  /**
   * Apply filters
   */
  private applyFilters(
    papers: Paper[],
    filters?: PaperSearchQuery['filters']
  ): Paper[] {
    if (!filters) return papers;

    return papers.filter(paper => {
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
   * Extract PDF URL from CrossRef item
   */
  private extractPdfUrl(item: any): string | undefined {
    // Try to find PDF link in the links array
    const link = item.link?.find((l: any) => l['content-type'] === 'application/pdf');
    if (link) return link.URL;

    // Some items have PDF URL in URL field
    if (item.URL?.includes('.pdf')) return item.URL;

    return undefined;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[PaperSearch] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Set cache expiry time (in milliseconds)
   */
  setCacheExpiry(ms: number): void {
    this.cacheExpiry = ms;
    console.log(`[PaperSearch] Cache expiry set to ${ms}ms`);
  }
}

export const directPaperSearchService = new DirectPaperSearchService();
