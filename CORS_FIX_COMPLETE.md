# CORS Issue Fix - Complete Solution

## Problem
The browser was making direct HTTP requests to external APIs (arXiv, PubMed), which failed due to:
- CORS (Cross-Origin Resource Sharing) restrictions
- Browser/extension environment limitations
- "Failed to fetch" errors

## Root Cause
The `mcp-paper-search.ts` file was attempting to make direct browser-side fetches:
```javascript
// ❌ This fails in browser due to CORS
const url = `https://export.arxiv.org/api/query?search_query=${...}`;
const response = await fetch(url);
```

## Solution
Implemented server-side API proxies that:
1. Run on Node.js (server-side), not in the browser
2. Can freely access external APIs without CORS restrictions
3. Return JSON results back to the client

### Files Created

#### 1. `/src/app/api/arxiv-search/route.ts`
- Proxies arXiv API requests
- Handles XML→JSON conversion
- 15-second timeout with AbortController
- Returns: `{ entries: [...], count: number, query: string }`

#### 2. `/src/app/api/pubmed-search/route.ts`
- Proxies PubMed API requests (esearch + esummary)
- Fetches article UIDs first, then summaries
- 15-second timeout per request
- Returns: `{ articles: [...], count: number, query: string }`

### Files Modified

#### `/src/lib/mcp-paper-search.ts`
Updated all tool functions to use server-side APIs:

**Before:**
```javascript
mcpTools.arxivSearch = async (q: string, maxRes?: number) => {
  const url = `https://export.arxiv.org/api/query?search_query=${...}`;
  const response = await fetch(url); // ❌ Browser CORS fails
};
```

**After:**
```javascript
mcpTools.arxivSearch = async (q: string, maxRes?: number) => {
  const url = `/api/arxiv-search?q=${encodeURIComponent(q)}&max=${maxRes || 20}`;
  const response = await fetch(url); // ✅ Server handles request
  const data = await response.json();
  return data.entries || [];
};
```

## Architecture

```
Browser
  ↓
/api/arxiv-search (Node.js)
  ↓
export.arxiv.org (external API)
```

Instead of:
```
Browser ❌→ export.arxiv.org (CORS blocked)
```

## Benefits

✅ **No CORS errors** - Server makes the request, not the browser  
✅ **Error handling** - Timeouts and failures handled server-side  
✅ **Consistent API** - All searches go through Next.js routes  
✅ **Easy monitoring** - Server logs show which searches are used  
✅ **Rate limiting ready** - Can add rate limiting at API level  

## Testing

Search for papers with any query - should now work without CORS errors.

Expected flow:
1. User searches for "machine learning"
2. Browser calls `/api/arxiv-search?q=machine%20learning`
3. Server fetches from arXiv
4. Results returned as JSON
5. UI displays papers

## Future Enhancements

- Add rate limiting to `/api/arxiv-search` and `/api/pubmed-search`
- Cache results to reduce external API calls
- Add retry logic with exponential backoff
- Monitor API response times for performance tracking
