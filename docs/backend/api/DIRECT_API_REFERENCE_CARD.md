# Direct API Paper Search - Reference Card

## ⚡ Quick Commands

```typescript
// Search papers
const { papers, search } = usePaperSearch();
await search('machine learning');

// With filters
await search('AI', {
  minYear: 2020,
  sources: ['arxiv', 'crossref'],
});

// Clear cache
directPaperSearchService.clearCache();

// Check cache
console.log(directPaperSearchService.getCacheStats());
```

## 📋 Hook API

```typescript
const {
  papers,           // Paper[]
  totalResults,     // number
  isLoading,        // boolean
  error,            // string | null
  query,            // string
  hasSearched,      // boolean
  
  search,           // (query, filters?) => Promise
  debouncedSearch,  // (query, filters?) => void
  filterPapers,     // (fn) => Paper[]
  sortPapers,       // (fn) => Paper[]
  getPaperById,     // (id) => Paper?
  clearSearch,      // () => void
  updateFilters,    // (filters) => void
} = usePaperSearch({
  debounceMs: 300,  // optional
  cacheResults: true, // optional
});
```

## 📚 Paper Object

```typescript
{
  id: string,                    // UUID
  title: string,
  abstract?: string,
  authors: { name: string }[],
  year?: number,
  venue?: string,
  
  sources: ['crossref'|'arxiv'|'pubmed'][],
  sourceIds: {
    doi?: string,
    arxiv?: string,
    pubmed?: string,
  },
  
  metadata: {
    citationCount?: number,
    pdfUrl?: string,
    url?: string,
    openAccess?: boolean,
    tags?: string[],
  },
}
```

## 🔍 Search Query

```typescript
{
  query: string,           // "machine learning"
  maxResults?: number,     // default: 20
  filters?: {
    minYear?: number,
    maxYear?: number,
    sources?: ['crossref'|'arxiv'|'pubmed'][],
    minCitations?: number,
    openAccessOnly?: boolean,
  },
}
```

## 🛠️ Service Methods

```typescript
import { directPaperSearchService } from '@/lib/direct-paper-search';

// Main search
const result = await directPaperSearchService.search({
  query: 'neural networks',
  maxResults: 20,
});

// Cache management
directPaperSearchService.clearCache();
const { size, keys } = directPaperSearchService.getCacheStats();
directPaperSearchService.setCacheExpiry(600000); // 10 min
```

## 🌐 Supported Sources

| Source | Speed | Coverage | PDFs |
|--------|-------|----------|------|
| **CrossRef** | Fast | General academic | Some |
| **arXiv** | Moderate | Physics/Math/CS | All |
| **PubMed** | Moderate | Biomedical | Some |

## ✨ Common Patterns

### Basic Search Component
```typescript
'use client';
import { usePaperSearch } from '@/hooks/usePaperSearch';

export function PaperSearch() {
  const { papers, isLoading, search } = usePaperSearch();
  
  return (
    <div>
      <input 
        onKeyDown={e => e.key === 'Enter' && search(e.target.value)}
        placeholder="Search papers..."
      />
      {isLoading && <p>Loading...</p>}
      {papers.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  );
}
```

### Filter Results
```typescript
const { papers, filterPapers } = usePaperSearch();

// By year
const recent = filterPapers(p => (p.year || 0) >= 2020);

// By citation count
const cited = filterPapers(p => (p.metadata.citationCount || 0) > 100);

// By source
const arxivOnly = filterPapers(p => p.sources.includes('arxiv'));
```

### Sort Results
```typescript
const { papers, sortPapers } = usePaperSearch();

// By citations
const byCitations = sortPapers((a, b) => 
  (b.metadata.citationCount || 0) - (a.metadata.citationCount || 0)
);

// By year
const byYear = sortPapers((a, b) => (b.year || 0) - (a.year || 0));

// By title
const byTitle = sortPapers((a, b) => a.title.localeCompare(b.title));
```

### Related Papers
```typescript
import { useRelatedPapers } from '@/hooks/usePaperSearch';

const { relatedPapers, findSimilar, findByAuthor } = 
  useRelatedPapers(selectedPaper);

await findSimilar();              // Similar by title
await findByAuthor('John Doe');   // All papers by author
```

### Paper Collection
```typescript
import { usePaperCollection } from '@/hooks/usePaperSearch';

const { 
  collection, 
  addToCollection, 
  removeFromCollection, 
  toggleFavorite,
  isFavorite,
} = usePaperCollection();

addToCollection(paper);
if (isFavorite(paper.id)) {
  toggleFavorite(paper.id);
}
```

## 🐛 Debug Tips

```typescript
// Enable detailed logging
// (filter by [PaperSearch] in console)

// Check what's cached
directPaperSearchService.getCacheStats();

// Monitor performance
const start = performance.now();
const result = await directPaperSearchService.search(query);
console.log(`Search took ${performance.now() - start}ms`);

// Verify API calls
// Open DevTools → Network → filter by:
// crossref.org
// arxiv.org
// ncbi.nlm.nih.gov
```

## ⚠️ Common Gotchas

```typescript
// ❌ DON'T: Pass null/undefined puterAI
const { search } = usePaperSearch({ puterAI: null });

// ✅ DO: Just use the hook as-is
const { search } = usePaperSearch();

// ❌ DON'T: Expect sample data to have accurate metadata
if (error?.includes('sample')) {
  // Use these results with caution
}

// ✅ DO: Check sources to know reliability
papers.forEach(p => {
  console.log(`From: ${p.sources.join(', ')}`);
});

// ❌ DON'T: Query more than 100 results at once
await search(query, { maxResults: 1000 });

// ✅ DO: Paginate or reduce scope
await search(query, { maxResults: 50 });
```

## 🚀 Performance Tips

1. **Use debouncing** - Default 300ms for search input
2. **Leverage caching** - Same query = instant results
3. **Reduce max results** - Fewer results = faster
4. **Use single source** - CrossRef is fastest
5. **Clear old cache** - Large cache slows things down
6. **Filter early** - Apply filters in search query

```typescript
// Good: Uses defaults (debounce + cache)
const { debouncedSearch } = usePaperSearch();
onInputChange(q => debouncedSearch(q));

// Better: Specify smaller result set
await search(query, { maxResults: 20 });

// Best: Single fast source
await search(query, { 
  maxResults: 10,
  sources: ['crossref'],
});
```

## 📦 Required Imports

```typescript
// Hook usage
import { usePaperSearch, useRelatedPapers, usePaperCollection } 
  from '@/hooks/usePaperSearch';

// Direct service usage
import { directPaperSearchService } 
  from '@/lib/direct-paper-search';

// Types
import { Paper, PaperSearchQuery, PaperSearchResult } 
  from '@/types/paper';
```

## 🔗 Related Resources

| Resource | Purpose |
|----------|---------|
| `/admin/paper-search` | Test UI & monitoring |
| `DIRECT_API_QUICKSTART.md` | Full examples |
| `DIRECT_API_TROUBLESHOOTING.md` | Issue solutions |
| `DIRECT_API_IMPLEMENTATION_SUMMARY.md` | Technical details |

## 📞 API Rate Limits

| Source | Limit | Retry |
|--------|-------|-------|
| CrossRef | 50/sec | Yes, auto-fallback |
| arXiv | 3/sec | Yes, auto-fallback |
| PubMed | 3/sec | Yes, auto-fallback |

**Note:** Caching helps avoid hitting limits

## ✅ Checklist

- [ ] Imported `usePaperSearch` hook
- [ ] Called `search()` method
- [ ] Displayed `papers` array
- [ ] Added loading state (`isLoading`)
- [ ] Added error handling (`error`)
- [ ] Applied filters if needed
- [ ] Tested via `/admin/paper-search`
- [ ] Checked browser console logs

## 🆘 If Nothing Works

1. Open browser DevTools (F12)
2. Go to Console tab
3. Filter by: `[PaperSearch]`
4. Look for error messages
5. Check Network tab for API responses
6. Read `DIRECT_API_TROUBLESHOOTING.md`

---

**Save this reference card for quick lookup!**
