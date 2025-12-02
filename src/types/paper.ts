/**
 * Unified Paper Schema for ThesisAI
 * Consolidates metadata from CrossRef, ArXiv, OpenAlex, and Semantic Scholar
 */

export interface Author {
  name: string;
  orcid?: string;
}

export interface SourceIds {
  doi?: string;
  arxivId?: string;
  openAlexId?: string;  // e.g., https://openalex.org/W123…
  semanticScholarId?: string;  // paperId from Semantic Scholar API
}

export interface PaperMetadata {
  citationCount?: number;
  isOpenAccess?: boolean;
  tags?: string[];
  url?: string;
  pdfUrl?: string;
}

export interface Paper {
  id: string; // internal UUID
  title: string;
  abstract?: string;
  authors: Author[];
  year?: number;
  venue?: string;

  sourceIds: SourceIds;
  sources: ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[];

  metadata: PaperMetadata;

  // Conceptual and quality metadata from OpenAlex and Semantic Scholar
  concepts?: { id: string; name: string; level?: number; score?: number }[]; // from OpenAlex
  s2FieldsOfStudy?: string[]; // from Semantic Scholar
  s2Tldr?: string; // short summary (if present)
  s2InfluentialCitationCount?: number; // from Semantic Scholar

  // Generated content for papers with missing abstracts
  generatedSummary?: string; // 3-5 sentence summary when abstract is missing
}

export interface PaperSearchQuery {
  query: string;
  maxResults?: number;
  filters?: {
    minYear?: number;
    maxYear?: number;
    sources?: ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[];
    minCitations?: number;
    isOpenAccessOnly?: boolean;
  };
}

export interface PaperSearchResult {
  papers: Paper[];
  totalResults: number;
  query: string;
  timestamp: number;
}

export interface DeduplicationKey {
  type: 'doi' | 'arxiv' | 'openalex' | 'semantic_scholar' | 'title_year';
  value: string;
}

// Scoring for ranking papers
export interface PaperScore {
  paperId: string;
  relevance: number; // 0-1
  recency: number; // 0-1, based on year
  citations: number; // 0-1, normalized
  totalScore: number; // weighted sum
}

// MCP Server Response Types
export interface CrossRefWork {
  DOI?: string;
  title?: string;
  author?: Array<{ given?: string; family?: string }>;
  issued?: { 'date-parts': number[][] };
  'container-title'?: string;
  URL?: string;
  type?: string;
}

export interface ArxivEntry {
  id?: string;
  title?: string;
  summary?: string;
  author?: Array<{ name?: string }>;
  published?: string;
  pdf?: string;
  arxiv_url?: string;
}

export interface OpenAlexWork {
  id?: string;  // OpenAlex ID (e.g., https://openalex.org/W123…)
  display_name?: string;
  title?: string;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: Array<{
    author?: {
      display_name?: string;
    };
  }>;
  publication_year?: number;
  host_venue?: {
    display_name?: string;
  };
  open_access?: {
    is_oa?: boolean;
  };
  cited_by_count?: number;
  concepts?: Array<{
    id?: string;
    display_name?: string;
    level?: number;
    score?: number;
  }>;
  primary_location?: {
    landing_page_url?: string;
    pdf_url?: string;
  };
  doi?: string;
}

export interface SemanticScholarPaper {
  paperId?: string;  // paperId from Semantic Scholar API
  title?: string;
  abstract?: string;
  year?: number;
  venue?: string;
  authors?: Array<{ name?: string }>;
  citationCount?: number;
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
  };
  fieldsOfStudy?: string[];
  tldr?: {
    text?: string; // short summary
  };
  influentialCitationCount?: number;
  openAccessPdf?: {
    url?: string;
  };
}

// Deduplication result
export interface DeduplicatedPapers {
  papers: Paper[];
  mergedCount: number;
  deduplicationStats: {
    byDoi: number;
    byArxivId: number;
    byOpenAlexId: number;
    bySemanticScholarId: number;
    byTitleYear: number;
  };
}

// Search cache for performance
export interface SearchCache {
  query: string;
  filters?: PaperSearchQuery['filters'];
  results: Paper[];
  timestamp: number;
  ttl: number; // time to live in ms
}
