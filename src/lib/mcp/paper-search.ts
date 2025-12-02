/**
 * Paper Search MCP Integration
 * Coordinates searches across CrossRef, ArXiv, OpenAlex, and Semantic Scholar
 */

import {
  Paper,
  PaperSearchQuery,
  PaperSearchResult,
  DeduplicatedPapers,
  CrossRefWork,
  ArxivEntry,
  OpenAlexWork,
  SemanticScholarPaper,
  SourceIds,
  Author,
  PaperMetadata,
} from '@/types/paper';
import { v4 as uuidv4 } from 'uuid';

export class PaperSearchService {
  private cache: Map<string, { results: Paper[]; timestamp: number }> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Main search orchestration - calls all sources in parallel
   */
  async search(
    query: PaperSearchQuery,
    mcpTools: {
      crossrefSearch?: (q: string, rows?: number) => Promise<CrossRefWork[]>;
      arxivSearch?: (q: string, maxResults?: number) => Promise<ArxivEntry[]>;
      openalexSearch?: (q: string, maxResults?: number) => Promise<OpenAlexWork[]>;
      semanticScholarSearch?: (q: string, maxResults?: number) => Promise<SemanticScholarPaper[]>;
    }
  ): Promise<PaperSearchResult> {
    const cacheKey = this.getCacheKey(query);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        papers: cached,
        totalResults: cached.length,
        query: query.query,
        timestamp: Date.now(),
      };
    }

    const maxResults = query.maxResults || 20;
    const sources = query.filters?.sources || ['crossref', 'arxiv', 'openalex', 'semantic_scholar'];

    try {
      // Call all sources in parallel
      const [crossrefResults, arxivResults, openAlexResults, semanticScholarResults] = await Promise.all([
        sources.includes('crossref') && mcpTools.crossrefSearch
          ? this.searchCrossRef(query.query, mcpTools.crossrefSearch, maxResults)
          : Promise.resolve([]),
        sources.includes('arxiv') && mcpTools.arxivSearch
          ? this.searchArxiv(query.query, mcpTools.arxivSearch, maxResults)
          : Promise.resolve([]),
        sources.includes('openalex') && mcpTools.openalexSearch
          ? this.searchOpenAlex(query.query, mcpTools.openalexSearch, maxResults)
          : Promise.resolve([]),
        sources.includes('semantic_scholar') && mcpTools.semanticScholarSearch
          ? this.searchSemanticScholar(query.query, mcpTools.semanticScholarSearch, maxResults)
          : Promise.resolve([]),
      ]);

      // Merge and deduplicate
      const allPapers = [
        ...crossrefResults,
        ...arxivResults,
        ...openAlexResults,
        ...semanticScholarResults,
      ];

      const deduplicated = this.deduplicatePapers(allPapers);
      const scored = this.scorePapers(deduplicated.papers, query);
      const sorted = scored.sort((a, b) => (b.metadata.citationCount || 0) - (a.metadata.citationCount || 0));

      // Apply filters
      const filtered = this.applyFilters(sorted, query.filters);

      // Cache results
      this.setCache(cacheKey, filtered);

      return {
        papers: filtered,
        totalResults: filtered.length,
        query: query.query,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Paper search error:', error);
      throw error;
    }
  }

  /**
   * Search CrossRef
   */
  private async searchCrossRef(
    query: string,
    searchFn: (q: string, rows?: number) => Promise<CrossRefWork[]>,
    maxResults: number
  ): Promise<Paper[]> {
    try {
      const results = await searchFn(query, maxResults);
      return results.map((work) => this.convertCrossRefToPaper(work));
    } catch (error) {
      console.error('CrossRef search failed:', error);
      return [];
    }
  }

  /**
   * Search ArXiv
   */
  private async searchArxiv(
    query: string,
    searchFn: (q: string, maxResults?: number) => Promise<ArxivEntry[]>,
    maxResults: number
  ): Promise<Paper[]> {
    try {
      const results = await searchFn(query, maxResults);
      return results.map((entry) => this.convertArxivToPaper(entry));
    } catch (error) {
      console.error('ArXiv search failed:', error);
      return [];
    }
  }

  /**
   * Search OpenAlex
   */
  private async searchOpenAlex(
    query: string,
    searchFn: (q: string, maxResults?: number) => Promise<OpenAlexWork[]>,
    maxResults: number
  ): Promise<Paper[]> {
    try {
      const results = await searchFn(query, maxResults);
      return results.map((work) => this.convertOpenAlexToPaper(work));
    } catch (error) {
      console.error('OpenAlex search failed:', error);
      return [];
    }
  }

  /**
   * Search Semantic Scholar
   */
  private async searchSemanticScholar(
    query: string,
    searchFn: (q: string, maxResults?: number) => Promise<SemanticScholarPaper[]>,
    maxResults: number
  ): Promise<Paper[]> {
    try {
      const results = await searchFn(query, maxResults);
      return results.map((paper) => this.convertSemanticScholarToPaper(paper));
    } catch (error) {
      console.error('Semantic Scholar search failed:', error);
      return [];
    }
  }

  /**
   * Convert CrossRef work to Paper
   */
  private convertCrossRefToPaper(work: CrossRefWork): Paper {
    const authors = work.author?.map((a) => ({
      name: `${a.given || ''} ${a.family || ''}`.trim(),
    })) || [];

    const year = work.issued?.['date-parts']?.[0]?.[0];

    return {
      id: uuidv4(),
      title: work.title || 'Unknown Title',
      abstract: undefined, // CrossRef does not provide abstracts in API
      authors,
      year,
      venue: work['container-title'],
      sourceIds: {
        doi: work.DOI,
      },
      sources: ['crossref'],
      metadata: {
        url: work.URL,
        isOpenAccess: undefined,
      },
    };
  }

  /**
   * Convert ArXiv entry to Paper
   */
  private convertArxivToPaper(entry: ArxivEntry): Paper {
    const authors = entry.author?.map((a) => ({
      name: a.name || '',
    })) || [];

    const year = entry.published ? new Date(entry.published).getFullYear() : undefined;

    return {
      id: uuidv4(),
      title: entry.title || 'Unknown Title',
      abstract: entry.summary,
      authors,
      year,
      sourceIds: {
        arxivId: entry.id,
      },
      sources: ['arxiv'],
      metadata: {
        pdfUrl: entry.pdf,
        url: entry.arxiv_url,
        isOpenAccess: true,
      },
    };
  }

  /**
   * Convert OpenAlex work to Paper
   */
  private convertOpenAlexToPaper(work: OpenAlexWork): Paper {
    const authors = (work.authorships || []).map((auth) => ({
      name: auth.author?.display_name || 'Unknown Author',
    })) || [];

    const year = work.publication_year;
    const venue = work.host_venue?.display_name;

    return {
      id: uuidv4(),
      title: work.display_name || work.title || 'Unknown Title',
      abstract: work.abstract_inverted_index ?
        Object.keys(work.abstract_inverted_index).join(' ') : undefined, // OpenAlex provides abstract as inverted index (word positions)
      authors,
      year,
      venue,
      sourceIds: {
        openAlexId: work.id,
        doi: work.doi,
      },
      sources: ['openalex'],
      metadata: {
        citationCount: work.cited_by_count,
        isOpenAccess: work.open_access?.is_oa,
        url: work.primary_location?.landing_page_url || work.doi,
        pdfUrl: work.primary_location?.pdf_url,
      },
      concepts: (work.concepts || [])
        .filter((concept): concept is { id: string; display_name: string; level?: number; score?: number } => 
          !!concept.id && !!concept.display_name
        )
        .map((concept) => ({
          id: concept.id,
          name: concept.display_name,
          level: concept.level,
          score: concept.score,
        })),
    };
  }

  /**
   * Convert Semantic Scholar paper to Paper
   */
  private convertSemanticScholarToPaper(paper: SemanticScholarPaper): Paper {
    const authors = (paper.authors || []).map((author) => ({
      name: author.name || 'Unknown Author',
    })) || [];

    const year = paper.year;

    const convertedPaper: Paper = {
      id: uuidv4(),
      title: paper.title || 'Unknown Title',
      abstract: paper.abstract,
      authors,
      year,
      venue: paper.venue,
      sourceIds: {
        semanticScholarId: paper.paperId,
        doi: paper.externalIds?.DOI,
      },
      sources: ['semantic_scholar'],
      metadata: {
        citationCount: paper.citationCount,
        url: paper.paperId ? `https://www.semanticscholar.org/paper/${paper.paperId}` : undefined,
        pdfUrl: paper.openAccessPdf?.url,
      },
      s2FieldsOfStudy: paper.fieldsOfStudy,
      s2Tldr: paper.tldr?.text,
      s2InfluentialCitationCount: paper.influentialCitationCount,
    };

    // Add DOI from externalIds if available
    if (paper.externalIds?.DOI) {
      convertedPaper.sourceIds.doi = paper.externalIds.DOI;
    }

    return convertedPaper;
  }

  /**
   * Deduplicate papers by DOI, ArXiv ID, OpenAlex ID, Semantic Scholar ID, or title+year
   */
  private deduplicatePapers(papers: Paper[]): DeduplicatedPapers {
    const seen = new Map<string, Paper>();
    const stats = {
      byDoi: 0,
      byArxivId: 0,
      byOpenAlexId: 0,
      bySemanticScholarId: 0,
      byTitleYear: 0,
    };

    for (const paper of papers) {
      let key: string | null = null;

      // Try DOI first
      if (paper.sourceIds.doi) {
        key = `doi:${paper.sourceIds.doi}`;
        if (seen.has(key)) {
          stats.byDoi++;
          this.mergePapers(seen.get(key)!, paper);
          continue;
        }
      }

      // Try ArXiv ID
      if (paper.sourceIds.arxivId) {
        key = `arxiv:${paper.sourceIds.arxivId}`;
        if (seen.has(key)) {
          stats.byArxivId++;
          this.mergePapers(seen.get(key)!, paper);
          continue;
        }
      }

      // Try OpenAlex ID
      if (paper.sourceIds.openAlexId) {
        key = `openalex:${paper.sourceIds.openAlexId}`;
        if (seen.has(key)) {
          stats.byOpenAlexId++;
          this.mergePapers(seen.get(key)!, paper);
          continue;
        }
      }

      // Try Semantic Scholar ID
      if (paper.sourceIds.semanticScholarId) {
        key = `semantic_scholar:${paper.sourceIds.semanticScholarId}`;
        if (seen.has(key)) {
          stats.bySemanticScholarId++;
          this.mergePapers(seen.get(key)!, paper);
          continue;
        }
      }

      // Fallback to title + year
      if (paper.title && paper.year) {
        let titleString = '';
        if (Array.isArray(paper.title)) {
          titleString = paper.title[0] || '';
        } else {
          titleString = paper.title;
        }
        key = `title_year:${titleString}:${paper.year}`;
        if (seen.has(key)) {
          stats.byTitleYear++;
          this.mergePapers(seen.get(key)!, paper);
          continue;
        }
      }

      // New paper
      if (key) {
        seen.set(key, paper);
      }
    }

    return {
      papers: Array.from(seen.values()),
      mergedCount: papers.length - seen.size,
      deduplicationStats: stats,
    };
  }

  /**
   * Merge two Paper objects, taking the best of each
   */
  private mergePapers(existing: Paper, incoming: Paper): void {
    // Merge sources
    const sourceSet = new Set([...existing.sources, ...incoming.sources]);
    existing.sources = Array.from(sourceSet) as Paper['sources'];

    // Merge source IDs
    existing.sourceIds = {
      ...existing.sourceIds,
      ...incoming.sourceIds,
    };

    // Use best abstract
    if (!existing.abstract && incoming.abstract) {
      existing.abstract = incoming.abstract;
    } else if (existing.abstract && incoming.abstract && incoming.abstract.length > existing.abstract.length) {
      existing.abstract = incoming.abstract;
    }

    // Merge metadata
    if (incoming.metadata.citationCount !== undefined &&
        (existing.metadata.citationCount === undefined || incoming.metadata.citationCount > (existing.metadata.citationCount || 0))) {
      existing.metadata.citationCount = incoming.metadata.citationCount;
    }
    if (incoming.metadata.pdfUrl && !existing.metadata.pdfUrl) {
      existing.metadata.pdfUrl = incoming.metadata.pdfUrl;
    }
    if (incoming.metadata.url && !existing.metadata.url) {
      existing.metadata.url = incoming.metadata.url;
    }
    if (incoming.metadata.isOpenAccess && !existing.metadata.isOpenAccess) {
      existing.metadata.isOpenAccess = incoming.metadata.isOpenAccess;
    }

    // Merge authors
    const authorNames = new Set(existing.authors.map((a) => a.name));
    for (const author of incoming.authors) {
      if (!authorNames.has(author.name)) {
        existing.authors.push(author);
        authorNames.add(author.name);
      }
    }

    // Merge OpenAlex and Semantic Scholar specific fields
    if (incoming.concepts && !existing.concepts) {
      existing.concepts = incoming.concepts;
    } else if (incoming.concepts && existing.concepts) {
      // Merge concepts avoiding duplicates by ID
      const conceptIds = new Set(existing.concepts.map(c => c.id));
      for (const concept of incoming.concepts) {
        if (!conceptIds.has(concept.id)) {
          existing.concepts.push(concept);
          conceptIds.add(concept.id);
        }
      }
    }

    if (incoming.s2FieldsOfStudy && !existing.s2FieldsOfStudy) {
      existing.s2FieldsOfStudy = incoming.s2FieldsOfStudy;
    } else if (incoming.s2FieldsOfStudy && existing.s2FieldsOfStudy) {
      // Merge fields of study
      existing.s2FieldsOfStudy = Array.from(new Set([...existing.s2FieldsOfStudy, ...incoming.s2FieldsOfStudy]));
    }

    if (incoming.s2Tldr && !existing.s2Tldr) {
      existing.s2Tldr = incoming.s2Tldr;
    }

    if (incoming.s2InfluentialCitationCount !== undefined &&
        (existing.s2InfluentialCitationCount === undefined ||
         incoming.s2InfluentialCitationCount > (existing.s2InfluentialCitationCount || 0))) {
      existing.s2InfluentialCitationCount = incoming.s2InfluentialCitationCount;
    }

    // Merge generated summary if one paper has it
    if (incoming.generatedSummary && !existing.generatedSummary) {
      existing.generatedSummary = incoming.generatedSummary;
    }
  }

  /**
   * Score papers for ranking
   */
  private scorePapers(papers: Paper[], query: PaperSearchQuery): Paper[] {
    const now = new Date().getFullYear();
    const scoreMultiplier = query.filters?.minCitations ? 0.3 : 0.2; // Adjust if citation filter is active

    return papers.map((paper) => {
      let score = 0;

      // Validate paper has required fields
      if (!paper || !(paper.title && (typeof paper.title === 'string' || Array.isArray(paper.title)))) {
        console.warn('[PaperSearch] Skipping malformed paper:', paper);
        return paper;
      }

      // Citation boost (0-0.5)
      const citations = paper.metadata.citationCount || 0;
      const citationScore = Math.min(citations / 100, 1) * 0.5;

      // Recency boost (0-0.3)
      const recencyScore = paper.year ? ((paper.year - 2000) / (now - 2000)) * 0.3 : 0.15;

      // Basic relevance (0-0.2)
      let titleString = '';
      if (Array.isArray(paper.title)) {
        titleString = paper.title[0] || '';
      } else {
        titleString = paper.title || '';
      }
      const relevanceScore = query.query.toLowerCase().includes(titleString.toLowerCase()) ? 0.2 : 0.1;

      score = citationScore + recencyScore + relevanceScore;

      // Store score in metadata for sorting
      return {
        ...paper,
        metadata: {
          ...paper.metadata,
          tags: [...(paper.metadata.tags || []), `score:${score.toFixed(2)}`],
        },
      };
    });
  }

  /**
   * Apply filters to papers
   */
  private applyFilters(papers: Paper[], filters?: PaperSearchQuery['filters']): Paper[] {
    if (!filters) return papers;

    return papers.filter((paper) => {
      if (filters.minYear && paper.year && paper.year < filters.minYear) return false;
      if (filters.maxYear && paper.year && paper.year > filters.maxYear) return false;
      if (filters.minCitations && (paper.metadata.citationCount || 0) < filters.minCitations)
        return false;
      if (filters.isOpenAccessOnly && !paper.metadata.isOpenAccess) return false;
      return true;
    });
  }

  /**
   * Cache helpers
   */
  private getCacheKey(query: PaperSearchQuery): string {
    return JSON.stringify({ query: query.query, filters: query.filters });
  }

  private getFromCache(key: string): Paper[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.results;
  }

  private setCache(key: string, results: Paper[]): void {
    this.cache.set(key, { results, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const paperSearchService = new PaperSearchService();
