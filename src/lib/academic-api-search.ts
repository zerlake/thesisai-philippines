/**
 * Academic API Search Integration
 * Queries real academic databases: CrossRef, OpenAlex, Semantic Scholar, arXiv
 */

import { Paper } from '@/types/paper';
import { generatePaperSummaries } from './paper-summary';

export interface AcademicSearchOptions {
  maxResults?: number;
  timeout?: number;
}

/**
 * Search CrossRef for papers
 */
export async function searchCrossRef(query: string, options: AcademicSearchOptions = {}): Promise<Paper[]> {
  const { maxResults = 10, timeout = 5000 } = options;

  try {
    // CrossRef API endpoint
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.crossref.org/works?query=${encodedQuery}&rows=${maxResults}&sort=score&order=desc`;

    const response = await Promise.race([
      fetch(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('CrossRef timeout')), timeout)
      ),
    ]);

    if (!response.ok) throw new Error(`CrossRef returned ${response.status}`);

    const data = await response.json();
    const papers: Paper[] = [];

    if (data.message?.items) {
      for (const item of data.message.items) {
        if (!item.title) continue;

        papers.push({
          id: item.DOI || `crossref_${Math.random()}`,
          title: Array.isArray(item.title) ? (item.title[0] || 'Untitled') : (item.title || 'Untitled'),
          abstract: item.abstract || '',
          authors: (item.author || []).map((a: any) => ({
            name: `${a.given || ''} ${a.family || ''}`.trim(),
          })),
          year: item.published?.['date-parts']?.[0]?.[0],
          venue: item['container-title']?.[0] || item.type,
          sources: ['crossref'],
          sourceIds: {
            doi: item.DOI,
          },
          metadata: {
            citationCount: item['is-referenced-by-count'] || 0,
            pdfUrl: item.URL,
            url: `https://doi.org/${item.DOI}`,
            isOpenAccess: item['is-oa'] === true,
            tags: item.subject || [],
          },
        });
      }
    }

    console.log(`[CrossRef] Found ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('[CrossRef] Search failed:', error);
    return [];
  }
}

/**
 * Search arXiv for papers
 */
export async function searchArXiv(query: string, options: AcademicSearchOptions = {}): Promise<Paper[]> {
  const { maxResults = 10, timeout = 5000 } = options;

  try {
    // arXiv API endpoint - uses search_query parameter
    const encodedQuery = encodeURIComponent(`all:${query}`);
    const url = `https://export.arxiv.org/api/query?search_query=${encodedQuery}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

    const response = await Promise.race([
      fetch(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('arXiv timeout')), timeout)
      ),
    ]);

    if (!response.ok) throw new Error(`arXiv returned ${response.status}`);

    const xmlText = await response.text();
    const papers: Paper[] = [];

    // Parse XML response
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    for (const entry of entries) {
      const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : null;
      if (!title) continue;

      const idMatch = entry.match(/<id>(.*?arxiv\.org\/abs\/([\d.]+))/);
      const arxivId = idMatch ? idMatch[2] : undefined;

      const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
      const abstract = summaryMatch ? summaryMatch[1].trim() : '';

      const authorMatches = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>/g) || [];
      const authors = authorMatches
        .map((a) => a.match(/<name>(.*?)<\/name>/)?.[1])
        .filter(Boolean)
        .map((name) => ({ name: name || '' }));

      const publishedMatch = entry.match(/<published>([\d-]+)/);
      const year = publishedMatch ? parseInt(publishedMatch[1]) : undefined;

      papers.push({
        id: arxivId || `arxiv_${Math.random()}`,
        title,
        abstract,
        authors,
        year,
        venue: 'arXiv',
        sources: ['arxiv'],
        sourceIds: {
          arxivId,
        },
        metadata: {
          citationCount: 0,
          pdfUrl: idMatch ? `https://arxiv.org/pdf/${arxivId}.pdf` : undefined,
          url: idMatch ? `https://arxiv.org/abs/${arxivId}` : undefined,
          isOpenAccess: true,
          tags: ['arxiv'],
        },
      });
    }

    console.log(`[arXiv] Found ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('[arXiv] Search failed:', error);
    return [];
  }
}

/**
 * Search OpenAlex for papers
 */
export async function searchOpenAlex(query: string, options: AcademicSearchOptions = {}): Promise<Paper[]> {
  const { maxResults = 10, timeout = 5000 } = options;

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.openalex.org/works?search=${encodedQuery}&per-page=${Math.min(maxResults, 100)}&sort=relevance_score:desc`;

    const response = await Promise.race([
      fetch(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OpenAlex timeout')), timeout)
      ),
    ]);

    if (!response.ok) throw new Error(`OpenAlex returned ${response.status}`);

    const data = await response.json();
    const papers: Paper[] = [];

    if (data.results) {
      for (const work of data.results) {
        papers.push({
          id: work.id || `openalex_${Math.random()}`,
          title: work.display_name || work.title || 'Untitled',
          abstract: work.abstract_inverted_index ?
            Object.keys(work.abstract_inverted_index).join(' ') : undefined,
          authors: (work.authorships || []).map((auth: any) => ({
            name: auth.author?.display_name || 'Unknown Author',
          })),
          year: work.publication_year,
          venue: work.host_venue?.display_name,
          sources: ['openalex'],
          sourceIds: {
            openAlexId: work.id,
          },
          metadata: {
            citationCount: work.cited_by_count,
            isOpenAccess: work.open_access?.is_oa,
            url: work.primary_location?.landing_page_url || work.doi,
            pdfUrl: work.primary_location?.pdf_url,
          },
          concepts: (work.concepts || []).map((concept: any) => ({
            id: concept.id,
            name: concept.display_name,
            level: concept.level,
            score: concept.score,
          })),
        });
      }
    }

    console.log(`[OpenAlex] Found ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('[OpenAlex] Search failed:', error);
    return [];
  }
}

/**
 * Search Semantic Scholar for papers
 */
export async function searchSemanticScholar(query: string, options: AcademicSearchOptions = {}): Promise<Paper[]> {
  const { maxResults = 10, timeout = 5000 } = options;

  try {
    const encodedQuery = encodeURIComponent(query);
    const fields = 'title,abstract,year,venue,authors,citationCount,externalIds,fieldsOfStudy,tldr,influentialCitationCount,openAccessPdf';
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=${Math.min(maxResults, 100)}&fields=${fields}`;

    const response = await Promise.race([
      fetch(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Semantic Scholar timeout')), timeout)
      ),
    ]);

    if (!response.ok) throw new Error(`Semantic Scholar returned ${response.status}`);

    const data = await response.json();
    const papers: Paper[] = [];

    if (data.data) {
      for (const paper of data.data) {
        const mappedPaper: Paper = {
          id: paper.paperId || `semantic_scholar_${Math.random()}`,
          title: paper.title || 'Untitled',
          abstract: paper.abstract,
          authors: (paper.authors || []).map((author: any) => ({
            name: author.name || 'Unknown Author',
          })),
          year: paper.year,
          venue: paper.venue,
          sources: ['semantic_scholar'],
          sourceIds: {
            semanticScholarId: paper.paperId,
          },
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
          mappedPaper.sourceIds.doi = paper.externalIds.DOI;
        }

        papers.push(mappedPaper);
      }
    }

    console.log(`[Semantic Scholar] Found ${papers.length} papers`);
    return papers;
  } catch (error) {
    console.error('[Semantic Scholar] Search failed:', error);
    return [];
  }
}

/**
 * Combined search across all academic databases
 */
export async function searchAcademicDatabases(
  query: string,
  options: AcademicSearchOptions = {}
): Promise<Paper[]> {
  console.log(`[AcademicSearch] Searching for: ${query}`);

  // Run all searches in parallel
  const [crossRefPapers, arxivPapers, openAlexPapers, semanticScholarPapers] = await Promise.all([
    searchCrossRef(query, options).catch(() => []),
    searchArXiv(query, options).catch(() => []),
    searchOpenAlex(query, options).catch(() => []),
    searchSemanticScholar(query, options).catch(() => []),
  ]);

  // Combine and deduplicate
  const allPapers = [...crossRefPapers, ...arxivPapers, ...openAlexPapers, ...semanticScholarPapers];

  // Deduplicate by title (case-insensitive)
  const seen = new Set<string>();
  const unique = allPapers.filter((paper) => {
    let titleString = 'untitled paper';
    if (paper.title) {
      if (Array.isArray(paper.title)) {
        titleString = paper.title[0] || 'untitled paper';
      } else {
        titleString = paper.title;
      }
    }
    const key = titleString.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by citation count and year
  unique.sort((a, b) => {
    const citeDiff = (b.metadata.citationCount || 0) - (a.metadata.citationCount || 0);
    if (citeDiff !== 0) return citeDiff;
    return (b.year || 0) - (a.year || 0);
  });

  // Generate summaries for papers without abstracts
  const papersWithSummaries = await generatePaperSummaries(unique);

  console.log(`[AcademicSearch] Total results: ${papersWithSummaries.length} (CrossRef: ${crossRefPapers.length}, arXiv: ${arxivPapers.length}, OpenAlex: ${openAlexPapers.length}, Semantic Scholar: ${semanticScholarPapers.length})`);

  return papersWithSummaries.slice(0, options.maxResults || 20);
}
