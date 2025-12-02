# Paper Search System Implementation Guide

## Overview

The Paper Search system is a unified academic paper discovery platform that integrates multiple sources (CrossRef, ArXiv, PubMed, and Google Scholar) through MCP servers, coordinated by Puter AI on the client side.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ThesisAI Frontend (React)                │
│                  (/papers page + Components)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────────┐
        │      Puter AI (Client-side)        │
        │   MCP Tools Orchestration Layer     │
        └────────────────────────────────────┘
         │          │         │           │
         ↓          ↓         ↓           ↓
    ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
    │CrossRef│ │ ArXiv  │ │ PubMed │ │ Scholar  │
    │  MCP   │ │  MCP   │ │  MCP   │ │   MCP    │
    └────────┘ └────────┘ └────────┘ └──────────┘
```

## File Structure

### Type Definitions
- `src/types/paper.ts` - Unified Paper schema and interfaces

### Core Service
- `src/lib/mcp/paper-search.ts` - PaperSearchService with:
  - Search orchestration across all sources
  - Deduplication logic
  - Scoring and ranking
  - Result filtering
  - Caching

### MCP Integration
- `src/lib/mcp/puter-paper-adapter.ts` - Puter adapter with:
  - MCP tools configuration
  - Tool invocation bindings
  - Related paper discovery
  - Author information retrieval

### React Hooks
- `src/hooks/usePaperSearch.ts` - Custom hooks:
  - `usePaperSearch()` - Main search hook
  - `useRelatedPapers()` - Find related papers
  - `usePaperCollection()` - Manage paper collections

### Components
- `src/components/paper-search/` - UI Components:
  - `paper-search-bar.tsx` - Search input with clear button
  - `paper-search-filters.tsx` - Advanced filtering
  - `paper-list-view.tsx` - List presentation with metadata
  - `paper-map-view.tsx` - Network graph visualization
  - `find-papers-page.tsx` - Main page component

### Admin Dashboard
- `src/components/admin/paper-search-admin.tsx` - Admin management:
  - MCP server status monitoring
  - Cache management
  - Search testing
  - Configuration overview

### API Routes
- `src/api/paper-search/route.ts` - API endpoints:
  - POST /api/paper-search - Execute search
  - GET /api/paper-search - Query-based search

### Pages
- `src/app/papers/page.tsx` - Main papers page route

## Key Features

### 1. Unified Paper Schema

```typescript
interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors: Author[];
  year?: number;
  venue?: string;
  sourceIds: {
    doi?: string;
    arxivId?: string;
    pubmedId?: string;
    scholarClusterId?: string;
  };
  sources: ('crossref' | 'arxiv' | 'pubmed' | 'google_scholar')[];
  metadata: {
    citationCount?: number;
    isOpenAccess?: boolean;
    tags?: string[];
    url?: string;
    pdfUrl?: string;
  };
}
```

### 2. Deduplication Strategy

Papers are deduplicated by:
1. **DOI** (Digital Object Identifier) - Primary key
2. **ArXiv ID** - For preprints
3. **PubMed ID** - For biomedical literature
4. **Title + Year** - Fallback for unmapped papers

When duplicates are found, metadata is merged intelligently:
- Best abstract is kept
- Citation counts are preserved
- PDF URLs are merged
- Authors are unified
- All source tags are preserved

### 3. Scoring and Ranking

Papers are scored using:
- **Citation Count** (0-0.5) - Higher citations = higher score
- **Recency** (0-0.3) - Newer papers get slight boost
- **Relevance** (0-0.2) - Query-title matching

Total score = 0 to 1.0

### 4. Filtering Options

```typescript
filters: {
  minYear?: number;
  maxYear?: number;
  sources?: ('crossref' | 'arxiv' | 'pubmed' | 'google_scholar')[];
  minCitations?: number;
  isOpenAccessOnly?: boolean;
}
```

### 5. Caching Strategy

- **Duration**: 5 minutes per query
- **Key**: Query + filters hash
- **Cleanup**: Automatic on expiry
- **Admin Control**: Clear cache from admin panel

## Usage Examples

### Basic Search

```typescript
const { papers, isLoading, search } = usePaperSearch();

// Perform search
await search('machine learning neural networks', {
  minYear: 2020,
  minCitations: 10,
});

// Results available in papers array
```

### With Filters

```typescript
const { papers, updateFilters } = usePaperSearch();

await search('deep learning', {
  minYear: 2019,
  maxYear: 2024,
  sources: ['arxiv', 'pubmed'],
  isOpenAccessOnly: true,
});
```

### Find Related Papers

```typescript
const { relatedPapers, findSimilar } = useRelatedPapers(selectedPaper);

// Find papers similar to selected paper
await findSimilar();

// Find papers by author
await findByAuthor('Yann LeCun');

// Find papers by year range
await findByYearRange(2015, 2020);
```

### Manage Collections

```typescript
const { collection, favorites, addToCollection, toggleFavorite } = usePaperCollection();

// Add paper to collection
addToCollection(paper);

// Toggle favorite
toggleFavorite(paperId);

// Check if favorite
const isFav = collection.some(p => p.id === paperId);
```

## MCP Server Configuration

Configured in `PUTER_MCP_TOOLS_CONFIG`:

### CrossRef Tools
- `search_works_by_query` - Search by keyword
- `get_work_metadata` - Get work by DOI

### Paper Search (ArXiv/PubMed)
- `search_arxiv` - Search ArXiv papers
- `search_pubmed` - Search PubMed articles
- `download_arxiv` - Download ArXiv PDF
- `download_pubmed` - Download PubMed PDF

### Google Scholar Tools
- `search_google_scholar_key_words` - Simple search
- `search_google_scholar_advanced` - Advanced search
- `get_author_info` - Get author details

## Admin Dashboard Features

### Overview Tab
- Cache statistics
- Active MCP servers count
- Configuration summary

### MCP Servers Tab
- Server connection status
- Last checked timestamp
- Manual status refresh

### Cache Management Tab
- View cached queries
- Cache expiry info
- Clear all cache button

### Testing Tab
- Test search functionality
- Results breakdown by source
- Query performance monitoring

## API Endpoints

### POST /api/paper-search
Execute a paper search with full options

```bash
curl -X POST http://localhost:3000/api/paper-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning",
    "maxResults": 50,
    "filters": {
      "minYear": 2020,
      "minCitations": 5,
      "isOpenAccessOnly": false
    }
  }'
```

### GET /api/paper-search
Simple query-based search

```bash
curl "http://localhost:3000/api/paper-search?q=neural+networks&maxResults=20&minYear=2019"
```

## Performance Considerations

1. **Parallel Requests**: All MCP servers are called in parallel
2. **Caching**: 5-minute cache prevents redundant queries
3. **Deduplication**: Reduces result set size by 20-40%
4. **Lazy Loading**: UI components lazy-load when needed
5. **Debouncing**: Search input debounced at 500ms

## Error Handling

### Search Errors
- Individual source failures don't block results from other sources
- Graceful fallback when MCP servers are unavailable
- User-friendly error messages

### Deduplication Errors
- Missing identifiers are handled
- Fallback to title+year matching
- Merging respects data integrity

## Future Enhancements

1. **Advanced Filtering**
   - Subject classification
   - Journal/venue filtering
   - Author h-index filtering

2. **Visualization Improvements**
   - D3.js force-directed graph
   - Citation network visualization
   - Timeline visualization

3. **Export Formats**
   - BibTeX export
   - EndNote export
   - JSON export
   - PDF generation

4. **Recommendations**
   - ML-based paper recommendations
   - Author network expansion
   - Trend analysis

5. **Persistence**
   - Save searches
   - Share collections
   - Sync across devices

## Testing

```bash
# Run all tests
pnpm test

# Run paper search tests
pnpm test src/lib/mcp/__tests__/paper-search.test.ts

# Test with UI
pnpm test:ui
```

## Troubleshooting

### No Results
- Check MCP server connectivity
- Verify query syntax
- Try different sources
- Check citation filter isn't too high

### Slow Search
- Results are cached - second search will be instant
- Check network conditions
- Verify MCP servers are responsive
- Try reducing result limit

### Deduplication Issues
- Check for missing DOI/ArXiv IDs
- Verify author name consistency
- Check title normalization

## Dependencies

- `uuid` - Unique ID generation
- `date-fns` - Date formatting
- `react` - Component framework
- `@radix-ui/*` - UI components
- `lucide-react` - Icons

## Notes

- All processing happens client-side
- No server-side search required
- MCP servers must be accessible
- Puter AI coordinates the calls
