# Direct API Implementation for Paper Search

## Overview
Replaced MCP-dependent paper search with a direct API implementation that:
- ✅ Directly calls public academic APIs without MCP server dependency
- ✅ Works with Puter.js unavailable or not initialized
- ✅ Supports CrossRef, arXiv, and PubMed APIs
- ✅ Includes caching, deduplication, and filtering
- ✅ Provides fallback to sample data on failure

## Changes Made

### 1. **Updated `src/hooks/usePaperSearch.ts`**
- Removed dependency on `puterPaperAdapter`
- Now imports `directPaperSearchService` directly
- Removed `puterAI` parameter from all hook options
- Uses direct API calls via `directPaperSearchService.search()`
- Gracefully falls back to sample data on API errors
- Works entirely on client-side with public APIs

**Key Changes:**
```typescript
// Before
import { puterPaperAdapter } from '@/lib/mcp/puter-paper-adapter';
const result = await puterPaperAdapter.executePaperSearch(searchQuery, puterAI);

// After
import { directPaperSearchService } from '@/lib/direct-paper-search';
const result = await directPaperSearchService.search(searchQuery);
```

### 2. **Enhanced `src/lib/direct-paper-search.ts`**
Already implemented with:
- **DirectPaperSearchService class** with methods for:
  - `search()` - Main search orchestration across all sources
  - `searchCrossRef()` - CrossRef API integration
  - `searchArxiv()` - arXiv API integration
  - `searchPubMed()` - PubMed NCBI API integration
  - `deduplicatePapers()` - Intelligent deduplication
  - `applyFilters()` - Filter by year, citations, etc.
  - `clearCache()` - Clear search cache
  - `getCacheStats()` - Get cache information
  - `setCacheExpiry()` - Configure cache TTL

**Added logging:**
- Query search initiation with sources
- Count of results from each source
- Deduplication statistics

### 3. **Updated `src/components/admin/paper-search-admin.tsx`**
- Removed import of `PUTER_MCP_TOOLS_CONFIG`
- Changed service imports to `directPaperSearchService`
- Updated test search to actually call the direct API
- Updated configuration summary to show API sources instead of MCP tools
- Added proper error handling and logging

## Supported APIs

### CrossRef
- **Endpoint:** `https://api.crossref.org/v1/works`
- **Features:** DOI metadata, citation counts, publication info
- **Auth:** Public (with User-Agent header)

### arXiv
- **Endpoint:** `https://export.arxiv.org/api/query`
- **Features:** Physics/math/CS papers, abstracts, PDF URLs
- **Auth:** Public (no auth required)
- **Format:** Atom XML

### PubMed
- **Endpoint:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Features:** Biomedical literature, PMID, journal info
- **Auth:** Public (with email/tool identifiers)
- **Two-step:** esearch (get IDs) → esummary (get details)

## How It Works

### Search Flow
1. User enters search query via `usePaperSearch` hook
2. Hook calls `directPaperSearchService.search(query)`
3. Service parallelizes searches across CrossRef, arXiv, PubMed
4. Results are deduplicated by DOI, arXiv ID, or title+year
5. Papers filtered by year/citations if requested
6. Results sorted by citation count (relevance)
7. Results cached for 5 minutes
8. On API failure, falls back to sample data

### Deduplication Strategy
1. **By DOI** (exact match) - Best for scholarly papers
2. **By arXiv ID** - For preprints
3. **By PubMed ID** - For biomedical papers
4. **By Title + Year** - Fallback for cross-source matches
5. **Merge papers** - Combine metadata from multiple sources

### Caching
- **TTL:** 5 minutes (configurable via `setCacheExpiry()`)
- **Key:** Query string + filter JSON
- **Storage:** In-memory `Map`
- **Clear:** Via `clearCache()` method

## Error Handling

### Graceful Degradation
```typescript
try {
  // Try real search first using direct API
  const result = await directPaperSearchService.search(searchQuery);
  setState({ papers: result.papers, ... });
} catch (apiError) {
  // Fallback to sample data if API fails
  const samplePapers = generateSamplePapers(10, query);
  setState({ papers: samplePapers, error: 'Using sample data...' });
}
```

### Logging
All services log to console with `[SourceName]` prefix:
- `[PaperSearch]` - Main service
- `[CrossRef]` - CrossRef API
- `[ArXiv]` - arXiv API
- `[PubMed]` - PubMed API

## Usage Examples

### Basic Search
```typescript
import { directPaperSearchService } from '@/lib/direct-paper-search';

const result = await directPaperSearchService.search({
  query: 'machine learning',
  maxResults: 20,
});
```

### With Filters
```typescript
const result = await directPaperSearchService.search({
  query: 'neural networks',
  maxResults: 50,
  filters: {
    minYear: 2020,
    maxYear: 2024,
    sources: ['arxiv', 'crossref'],
    minCitations: 10,
  },
});
```

### In React Component
```typescript
import { usePaperSearch } from '@/hooks/usePaperSearch';

function MyComponent() {
  const { papers, isLoading, error, search } = usePaperSearch();
  
  const handleSearch = async (query: string) => {
    await search(query);
  };
  
  return (
    <div>
      {isLoading && <p>Searching...</p>}
      {error && <p>Error: {error}</p>}
      {papers.map(paper => (
        <div key={paper.id}>
          <h3>{paper.title}</h3>
          <p>{paper.abstract}</p>
        </div>
      ))}
    </div>
  );
}
```

## Configuration

### Change Cache TTL
```typescript
// Cache results for 10 minutes instead of 5
directPaperSearchService.setCacheExpiry(10 * 60 * 1000);
```

### Clear Cache
```typescript
directPaperSearchService.clearCache();
```

### Check Cache Stats
```typescript
const stats = directPaperSearchService.getCacheStats();
console.log(`${stats.size} cached queries`);
stats.keys.forEach(key => console.log(key));
```

## Type Safety

All results are fully typed:
```typescript
interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors: Author[];
  year?: number;
  venue?: string;
  sourceIds: SourceIds;
  sources: ('crossref' | 'arxiv' | 'pubmed')[];
  metadata: PaperMetadata;
}

interface PaperSearchResult {
  papers: Paper[];
  totalResults: number;
  query: string;
  timestamp: number;
}
```

## Benefits Over MCP Approach

| Feature | MCP | Direct API |
|---------|-----|-----------|
| Server startup | Required | ❌ Not needed |
| Puter.js required | Yes | ❌ No |
| Setup complexity | High | ✅ Low |
| Latency | Higher | ✅ Lower |
| Reliability | Depends on MCP | ✅ Direct to APIs |
| Client-side | ❌ No | ✅ Yes |
| Public APIs | Optional | ✅ Always available |
| Fallback support | ❌ No | ✅ Sample data |

## Testing

The admin panel (`/admin/paper-search`) provides:
- ✅ Real-time cache monitoring
- ✅ Search query testing
- ✅ Source breakdown reporting
- ✅ Cache management tools

## Next Steps

Optional enhancements:
- [ ] Add semantic scholar API integration
- [ ] Implement paper recommendation algorithm
- [ ] Add PDF fulltext search
- [ ] Create paper collection persistence
- [ ] Add export (BibTeX, JSON, etc.)

## Migration Guide

For existing components using `puterPaperAdapter`:

**Before:**
```typescript
import { puterPaperAdapter } from '@/lib/mcp/puter-paper-adapter';

const result = await puterPaperAdapter.executePaperSearch(query, puterAI);
```

**After:**
```typescript
import { directPaperSearchService } from '@/lib/direct-paper-search';

const result = await directPaperSearchService.search(query);
```

No other changes needed - the `usePaperSearch` hook already handles this!

## Files Modified

1. ✅ `/src/hooks/usePaperSearch.ts` - Now uses direct API
2. ✅ `/src/components/admin/paper-search-admin.tsx` - Updated imports & test
3. ✅ `/src/lib/direct-paper-search.ts` - Enhanced with better logging

## Files Unchanged (Still Available)

- `/src/lib/mcp/paper-search.ts` - MCP version (fallback if needed)
- `/src/lib/mcp/puter-paper-adapter.ts` - MCP adapter (legacy)
- `/src/types/paper.ts` - Shared types

---

**Status:** ✅ Implementation Complete - Ready for Testing
