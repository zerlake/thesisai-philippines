# Direct API Paper Search - Troubleshooting Guide

## Common Issues & Solutions

### 1. "Using sample data (search service unavailable)"

**What it means:** One or more APIs failed to respond.

**Why it happens:**
- API server is temporarily down
- Network connection issue
- Rate limit exceeded
- CORS issue in browser

**Solutions:**

```typescript
// Check what's available in your browser console:
// Look for logs like:
// [CrossRef] Search failed: Error...
// [ArXiv] Found 25 papers
// [PubMed] Search failed: Error...

// Try disabling problematic source:
const result = await directPaperSearchService.search({
  query: 'your query',
  filters: {
    sources: ['arxiv', 'pubmed']  // Skip CrossRef
  }
});

// Or wait a moment and retry:
setTimeout(() => search(query), 2000);
```

---

### 2. No Results Returned

**Symptoms:** Search completes but `papers.length === 0`

**Common causes:**

1. **All sources disabled:**
   ```typescript
   // ❌ Don't do this:
   await search(query, { sources: [] });
   
   // ✅ Do this instead:
   await search(query);  // Uses default sources
   ```

2. **Query too specific:**
   ```typescript
   // ❌ Unlikely to find anything:
   await search('xyz-123-abc-specific-paper-id');
   
   // ✅ Better queries:
   await search('machine learning');
   await search('deep neural networks');
   ```

3. **Filters too strict:**
   ```typescript
   // ❌ May exclude all results:
   await search('AI', {
     minYear: 2024,
     minCitations: 1000,
   });
   
   // ✅ More reasonable:
   await search('AI', {
     minYear: 2020,
     minCitations: 10,
   });
   ```

4. **Source doesn't have papers:**
   ```typescript
   // ❌ arXiv has no biomedical papers:
   await search('immunotherapy', {
     sources: ['arxiv']
   });
   
   // ✅ Use the right sources:
   await search('immunotherapy', {
     sources: ['pubmed', 'crossref']
   });
   ```

---

### 3. Slow Search (Taking >3 seconds)

**Why it's slow:**
- All APIs are being queried in parallel
- Slow internet connection
- API responses are large
- Browser is busy with other tasks

**Solutions:**

```typescript
// 1. Reduce max results:
await search(query, { maxResults: 10 });  // Instead of 50

// 2. Query single source:
await search(query, { 
  sources: ['crossref']  // Fastest
});

// 3. Check cache first:
const stats = directPaperSearchService.getCacheStats();
console.log('Recent queries:', stats.keys);
// If your query is cached, next search will be instant

// 4. Increase cache TTL:
directPaperSearchService.setCacheExpiry(30 * 60 * 1000);  // 30 min instead of 5
```

---

### 4. Duplicate Papers in Results

**Symptoms:** Same paper appears multiple times

**Why it happens:**
- Paper is indexed in multiple sources
- Different metadata formats prevent deduplication
- Recent import/update cycles

**Solutions:**

```typescript
// The system deduplicates by default:
// 1. Exact DOI match
// 2. Exact arXiv ID match
// 3. Exact PubMed ID match
// 4. Title + Year match

// If still seeing duplicates, you can filter:
const unique = new Map<string, Paper>();
results.papers.forEach(paper => {
  const key = paper.sourceIds.doi || 
              paper.sourceIds.arxiv || 
              paper.sourceIds.pubmed ||
              `${paper.title}:${paper.year}`;
  if (!unique.has(key)) unique.set(key, paper);
});

// Or report as issue - deduplication can be improved
console.log('Potential duplicate:', paper1, paper2);
```

---

### 5. Missing PDF Links

**Symptoms:** Paper has no `pdfUrl` in metadata

**Why it happens:**
- Not all papers have freely available PDFs
- CrossRef links may require subscription
- arXiv PDFs are always available
- PubMed papers may only have PMC full-text

**Solutions:**

```typescript
// Check what's available:
console.log('PDF URL:', paper.metadata.pdfUrl);
console.log('Web URL:', paper.metadata.url);
console.log('Sources:', paper.sources);

// Build paper-specific URLs:
if (paper.sourceIds.arxiv) {
  // arXiv always has PDF:
  const pdfUrl = `https://arxiv.org/pdf/${paper.sourceIds.arxiv}.pdf`;
}

if (paper.sourceIds.pubmed && paper.metadata.url?.includes('PMC')) {
  // PubMed Central article
  const pmcId = paper.metadata.url.match(/PMC(\d+)/)?.[1];
  // Can try fetching from: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{id}/
}

if (paper.sourceIds.doi) {
  // Try DOI resolver:
  const pdfUrl = `https://doi.org/${paper.sourceIds.doi}`;
}
```

---

### 6. Rate Limit Errors (429 Too Many Requests)

**Symptoms:** Search fails after multiple queries

**Why it happens:**
- Too many requests to single API in short time
- Each API has rate limits:
  - CrossRef: 50 req/sec (high)
  - arXiv: 3 req/sec (moderate)
  - PubMed: 3 req/sec (moderate)

**Solutions:**

```typescript
// 1. Use caching (default):
// Cached queries don't hit the API
const stats = directPaperSearchService.getCacheStats();
console.log(`${stats.size} queries cached`);

// 2. Increase cache TTL:
directPaperSearchService.setCacheExpiry(10 * 60 * 1000);  // 10 min

// 3. Wait between searches:
async function throttledSearch(query: string, delayMs = 1000) {
  const result = await directPaperSearchService.search({ query });
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return result;
}

// 4. Disable slower sources temporarily:
// arXiv and PubMed are slower, try CrossRef first
await search(query, { sources: ['crossref'] });

// 5. If rate limited anyway, system falls back to sample data
// (shown in error message)
```

---

### 7. CORS Issues (in Browser)

**Error Message:** "Access to XMLHttpRequest blocked by CORS policy"

**Why it happens:**
- API doesn't allow cross-origin requests
- Browser security blocks request
- Development vs production differences

**Solutions:**

```typescript
// 1. All used APIs support CORS from browsers:
// ✅ CrossRef - CORS enabled
// ✅ arXiv - CORS enabled
// ✅ PubMed - CORS enabled

// 2. If CORS error, check:
// - Are you on localhost? Some APIs are stricter with localhost
// - Check Network tab in DevTools - see actual error
// - Try in production deployment

// 3. As fallback, system uses sample data:
// Search still works, just not live data
```

---

### 8. Wrong Paper Metadata

**Symptoms:** Title/author/year is incorrect

**Why it happens:**
- Source data is incomplete
- Multiple versions exist
- Data entry error in source

**Solutions:**

```typescript
// 1. Check all sources:
console.log('Paper from sources:', paper.sources);
console.log('Available IDs:', paper.sourceIds);

// 2. Verify with official source:
if (paper.sourceIds.doi) {
  // CrossRef is usually authoritative for DOI metadata
  window.open(`https://doi.org/${paper.sourceIds.doi}`);
}

if (paper.sourceIds.arxiv) {
  // arXiv entry:
  window.open(`https://arxiv.org/abs/${paper.sourceIds.arxiv}`);
}

if (paper.sourceIds.pubmed) {
  // PubMed entry:
  window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.sourceIds.pubmed}/`);
}

// 3. Use merged metadata approach:
// System merges from multiple sources, picking best available
console.log('Best abstract:', paper.abstract);
```

---

### 9. Search Hangs or Times Out

**Symptoms:** Search starts but never completes

**Why it happens:**
- API server is slow/down
- Network connection is poor
- Browser tab became inactive
- Large result set being processed

**Solutions:**

```typescript
// 1. Set a timeout:
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Search timeout')), 10000)
);

try {
  const result = await Promise.race([
    directPaperSearchService.search(query),
    timeoutPromise
  ]);
} catch (error) {
  if (error.message === 'Search timeout') {
    console.log('Search took too long, using sample data');
  }
}

// 2. Reduce scope:
// Fewer results = faster processing
await search(query, { maxResults: 10 });

// 3. Use single source:
await search(query, { sources: ['crossref'] });

// 4. Check browser console for stuck logs
```

---

### 10. Empty Abstract/Metadata

**Symptoms:** Paper has no abstract, few authors, etc.

**Why it happens:**
- Source doesn't include that data
- Paper is very old
- Metadata is incomplete

**Solutions:**

```typescript
// 1. Check source availability:
if (!paper.abstract && paper.sources.includes('arxiv')) {
  // Try fetching arXiv page directly
  const arxivId = paper.sourceIds.arxiv;
  // Often arXiv has better abstracts
}

// 2. Use what's available:
const displayAbstract = paper.abstract || 'Abstract not available';

// 3. Request from other sources:
// arXiv usually has good abstracts
// CrossRef may have full abstract
// PubMed abstracts are usually complete

// 4. Build summary from metadata:
const summary = [
  paper.title,
  paper.authors.map(a => a.name).join(', '),
  `Published: ${paper.year}`,
  `Venue: ${paper.venue}`,
].filter(Boolean).join('\n');
```

---

### 11. Different Results Each Search

**Symptoms:** Same query returns different papers

**Why it happens:**
- Cache expired (5 min default)
- Different random order
- APIs updated their indexes
- Network timeout caused partial results

**Solutions:**

```typescript
// 1. Check cache:
const stats = directPaperSearchService.getCacheStats();
console.log('Is query cached?', 
  stats.keys.includes(JSON.stringify(query))
);

// 2. Lengthen cache TTL:
directPaperSearchService.setCacheExpiry(60 * 60 * 1000);  // 1 hour

// 3. Disable cache refresh:
// Cache is automatic, but you can manually clear if needed
// directPaperSearchService.clearCache();

// 4. Sort results consistently:
const sorted = results.papers.sort((a, b) => 
  a.title.localeCompare(b.title)
);
```

---

### 12. Can't Debug Search Issues

**Symptoms:** Unclear what went wrong

**Solutions:**

```typescript
// 1. Check browser console:
// Filter for [PaperSearch] logs
console.log('[PaperSearch] messages show:');
// - Query initiated
// - Papers found per source
// - Deduplication results
// - Final count

// 2. Use service directly for debugging:
const startTime = performance.now();
try {
  const result = await directPaperSearchService.search({
    query: 'test query',
    maxResults: 5,
  });
  console.log(`Completed in ${performance.now() - startTime}ms`);
  console.log('Results:', result);
} catch (error) {
  console.error('Search error:', error);
}

// 3. Check network tab:
// Open DevTools → Network tab
// Look for requests to:
// - api.crossref.org
// - export.arxiv.org
// - eutils.ncbi.nlm.nih.gov

// 4. Enable cache stats:
setInterval(() => {
  const stats = directPaperSearchService.getCacheStats();
  console.table(stats);
}, 5000);
```

---

## Quick Checklist

When troubleshooting:

- [ ] Check browser console for `[PaperSearch]` logs
- [ ] Verify internet connection
- [ ] Clear browser cache: `directPaperSearchService.clearCache()`
- [ ] Try single source: `{ sources: ['crossref'] }`
- [ ] Try simpler query: instead of author names, use keywords
- [ ] Check DevTools Network tab for API responses
- [ ] Verify filters aren't too restrictive
- [ ] Try again after 30 seconds (rate limit recovery)
- [ ] Check if feature works on `/admin/paper-search`

## Still Stuck?

Check these files for implementation details:
- `/src/lib/direct-paper-search.ts` - Service implementation
- `/src/hooks/usePaperSearch.ts` - Hook implementation
- `/src/components/admin/paper-search-admin.tsx` - Admin test UI
- `/src/types/paper.ts` - Type definitions

Enable debug logging:
```typescript
// Add to your component:
useEffect(() => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0]?.includes?.('[PaperSearch]')) {
      logs.push(JSON.stringify(args));
    }
    originalLog(...args);
  };
  
  return () => { console.log = originalLog; };
}, []);
```

---

**Version:** Direct API Implementation v1.0  
**Last Updated:** 2025-11-29
