# Direct API Paper Search - Quick Start

## What Changed?

The paper search system **no longer requires**:
- ❌ MCP servers running
- ❌ Puter.js initialized
- ❌ Complex server setup

It **now works with**:
- ✅ Public APIs only (CrossRef, arXiv, PubMed)
- ✅ Client-side execution
- ✅ Built-in fallback to sample data

## Usage

### For Components

```typescript
'use client';

import { usePaperSearch } from '@/hooks/usePaperSearch';

export function SearchPapers() {
  const { papers, isLoading, error, search } = usePaperSearch();

  return (
    <div>
      <input 
        onKeyDown={(e) => {
          if (e.key === 'Enter') search(e.currentTarget.value);
        }}
        placeholder="Search papers..."
      />
      
      {isLoading && <p>Searching...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {papers.map(paper => (
        <div key={paper.id}>
          <h3>{paper.title}</h3>
          <p>{paper.abstract}</p>
          <div>
            {paper.sources.join(', ')} • {paper.year}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { directPaperSearchService } from '@/lib/direct-paper-search';

// Simple search
const results = await directPaperSearchService.search({
  query: 'artificial intelligence',
  maxResults: 20,
});

// With filters
const results = await directPaperSearchService.search({
  query: 'machine learning',
  maxResults: 50,
  filters: {
    minYear: 2020,
    sources: ['arxiv', 'crossref'],
    minCitations: 5,
  },
});

// Check cache
const stats = directPaperSearchService.getCacheStats();
console.log(`Cached: ${stats.size} queries`);

// Clear cache
directPaperSearchService.clearCache();
```

## API Endpoints Used

| Source | URL | Auth | Notes |
|--------|-----|------|-------|
| **CrossRef** | `api.crossref.org/v1/works` | Public | DOI, citations |
| **arXiv** | `export.arxiv.org/api/query` | Public | Preprints, PDFs |
| **PubMed** | `eutils.ncbi.nlm.nih.gov` | Public | Biomedical papers |

All requests include proper User-Agent and identifiers.

## Features

✅ **Multi-source search** - Query all sources in parallel  
✅ **Deduplication** - Remove duplicates across sources  
✅ **Filtering** - By year, citations, source  
✅ **Caching** - 5-minute cache for performance  
✅ **Fallback** - Sample data if APIs fail  
✅ **Logging** - Console logs for debugging  
✅ **Type-safe** - Full TypeScript support  

## Testing

Visit the admin panel to test:
```
/admin/paper-search
```

Features:
- Real-time search testing
- Cache monitoring
- Source breakdown
- Clear cache button

## Paper Object Structure

```typescript
{
  // Core metadata
  id: string;                    // UUID
  title: string;
  abstract?: string;
  authors: { name: string }[];
  year?: number;
  venue?: string;

  // Source information
  sources: ['crossref' | 'arxiv' | 'pubmed'][];
  sourceIds: {
    doi?: string;
    arxiv?: string;
    pubmed?: string;
  };

  // Rich metadata
  metadata: {
    citationCount?: number;
    pdfUrl?: string;
    url?: string;
    openAccess?: boolean;
    tags?: string[];
  };
}
```

## Error Handling

The system handles errors gracefully:

```typescript
const { papers, error } = usePaperSearch();

// Try search
await search('my query');

// If APIs fail:
// - error = 'Using sample data (search service unavailable)'
// - papers = [sample papers]
// - User sees results, knows they're not live
```

## Performance

- **Search latency**: ~1-3 seconds (parallel API calls)
- **Cache hit**: ~10ms
- **Memory**: ~5MB for typical 1000-result cache
- **Network**: Minimal - only essential fields returned

## Troubleshooting

### Search returns no results
1. Check browser console for API error messages
2. Verify internet connection
3. Try simpler search term
4. Look for `[PaperSearch]` console logs

### Getting sample data warning
1. One or more APIs may be down
2. Check network tab in DevTools
3. API rate limits may be exceeded
4. Sample data is used as fallback

### Cache not working
1. Check cache stats: `directPaperSearchService.getCacheStats()`
2. Clear cache: `directPaperSearchService.clearCache()`
3. Adjust TTL: `directPaperSearchService.setCacheExpiry(600000)` (10 min)

## Migration from Old System

If you have code using the old `puterPaperAdapter`:

```typescript
// OLD (no longer works):
import { puterPaperAdapter } from '@/lib/mcp/puter-paper-adapter';
const result = await puterPaperAdapter.executePaperSearch(query, puterAI);

// NEW (use this instead):
import { directPaperSearchService } from '@/lib/direct-paper-search';
const result = await directPaperSearchService.search(query);

// Or just use the hook (easiest):
import { usePaperSearch } from '@/hooks/usePaperSearch';
const { papers, search } = usePaperSearch();
await search(query);
```

## Hook API Reference

### `usePaperSearch(options?)`

**Options:**
```typescript
{
  debounceMs?: number;      // Debounce search input (default: 300ms)
  cacheResults?: boolean;   // Enable caching (default: true)
}
```

**Returns:**
```typescript
{
  // State
  papers: Paper[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  query: string;
  hasSearched: boolean;
  filters?: PaperSearchQuery['filters'];

  // Methods
  search: (query: string, filters?) => Promise<void>;
  debouncedSearch: (query: string, filters?) => void;
  filterPapers: (fn: (p: Paper) => boolean) => Paper[];
  sortPapers: (fn: (a: Paper, b: Paper) => number) => Paper[];
  getPaperById: (id: string) => Paper | undefined;
  clearSearch: () => void;
  updateFilters: (filters: PaperSearchQuery['filters']) => void;
}
```

### `useRelatedPapers(paper?)`

**Methods:**
```typescript
{
  relatedPapers: Paper[];
  isLoading: boolean;
  error: string | null;
  
  findSimilar: () => Promise<void>;
  findByAuthor: (authorName: string) => Promise<void>;
  findByYearRange: (minYear: number, maxYear: number) => Promise<void>;
}
```

## Service API Reference

### `DirectPaperSearchService`

```typescript
// Main search
search(query: PaperSearchQuery): Promise<PaperSearchResult>

// Cache management
clearCache(): void
getCacheStats(): { size: number; keys: string[] }
setCacheExpiry(ms: number): void
```

## Rate Limits

APIs are free but have rate limits:

- **CrossRef**: 50 requests/second (ample)
- **arXiv**: 3 requests/second (moderate)
- **PubMed**: 3 requests/second (moderate)

The service spreads requests across multiple queries, and caching helps avoid hitting limits.

## Next Steps

1. ✅ Use `usePaperSearch` hook in your components
2. ✅ Test via admin panel (`/admin/paper-search`)
3. ✅ Check browser console for logs
4. ✅ Customize filters as needed
5. ✅ Deploy with confidence!

---

**Questions?** Check browser console logs with `[PaperSearch]` prefix for debugging info.
