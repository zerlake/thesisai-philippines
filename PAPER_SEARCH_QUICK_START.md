# Paper Search System - Quick Start Guide

## Installation

```bash
# Install dependencies
pnpm install

# The system is ready to use - no additional setup needed
```

## Adding the Paper Search Page to Navigation

### Update Navigation Menu

Add to your main navigation component (e.g., `src/components/header.tsx` or `src/components/sidebar.tsx`):

```tsx
import Link from 'next/link';

<Link href="/papers" className="...">
  <FileText className="h-4 w-4" />
  Find Papers
</Link>
```

### Add to App Routing

The `/papers` route is already configured at `src/app/papers/page.tsx`

## Basic Usage

### 1. In a Component

```tsx
'use client';

import { usePaperSearch } from '@/hooks/usePaperSearch';

export function MyPaperSearch() {
  const { papers, isLoading, search } = usePaperSearch();

  const handleSearch = async (query: string) => {
    await search(query, {
      minYear: 2020,
      minCitations: 5,
    });
  };

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search papers..."
      />
      {papers.map(paper => (
        <div key={paper.id}>{paper.title}</div>
      ))}
    </div>
  );
}
```

### 2. In Admin Dashboard

Already integrated! Navigate to `/admin` → "Paper Search" tab

## Accessing Features

### View Paper Search
- URL: `/papers`
- Features: Search, filter, list view, network map, favorites

### Manage in Admin
- URL: `/admin` → "Paper Search" tab
- Features: MCP status, cache management, testing

## Key Components

### Search Bar
```tsx
import { PaperSearchBar } from '@/components/paper-search';

<PaperSearchBar 
  onSearch={(query) => search(query)}
  isLoading={isLoading}
/>
```

### Filters
```tsx
import { PaperSearchFilters } from '@/components/paper-search';

<PaperSearchFilters 
  onFiltersChange={(filters) => updateFilters(filters)}
/>
```

### Results List
```tsx
import { PaperListView } from '@/components/paper-search';

<PaperListView 
  papers={papers}
  isLoading={isLoading}
  onFavoriteToggle={toggleFavorite}
  favorites={favorites}
/>
```

### Results Map
```tsx
import { PaperMapView } from '@/components/paper-search';

<PaperMapView 
  papers={papers}
  onPaperSelect={(paper) => setPaper(paper)}
/>
```

## Configuration

### MCP Tools Config
Located in: `src/lib/mcp/puter-paper-adapter.ts`

Edit `PUTER_MCP_TOOLS_CONFIG` to add/remove MCP servers:

```typescript
{
  id: 'your_mcp_server',
  type: 'mcp',
  tools: [
    {
      name: 'tool_name',
      schema: { /* ... */ }
    }
  ]
}
```

### Paper Search Service Config
Located in: `src/lib/mcp/paper-search.ts`

- `cacheExpiry`: Change cache duration (default 5 min)
- `maxResults`: Default limit per search
- Scoring weights in `scorePapers()`

## Common Tasks

### Change Cache Duration

```typescript
// In paper-search.ts
private cacheExpiry: number = 10 * 60 * 1000; // 10 minutes
```

### Add Custom Filter

```typescript
// In paper-search.ts, applyFilters method
if (filters.myCustomFilter && condition) return false;
```

### Modify Scoring Algorithm

```typescript
// In paper-search.ts, scorePapers method
const myScore = ...;
score = citationScore + recencyScore + myScore;
```

### Export Collection Format

Modify `handleExportCollection()` in `FindPapersPage`:

```typescript
const csv = [
  ['Title', 'Authors', 'DOI', 'Year'].join(','),
  ...collection.map(p => [
    `"${p.title}"`,
    // Add more fields
  ].join(','))
].join('\n');
```

## API Integration

### Direct API Call

```typescript
const response = await fetch('/api/paper-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'machine learning',
    maxResults: 20,
    filters: { minYear: 2020 }
  })
});

const { papers } = await response.json();
```

### With Query Params

```typescript
const params = new URLSearchParams({
  q: 'neural networks',
  minYear: '2019',
  maxYear: '2024',
  minCitations: '5'
});

const response = await fetch(`/api/paper-search?${params}`);
```

## Debugging

### Enable Console Logging

The system logs search progress to console. Check browser dev tools:

```
Console → paper-search → search operations
```

### Check Cache Status

```typescript
import { paperSearchService } from '@/lib/mcp/paper-search';

const stats = paperSearchService.getCacheStats();
console.log(stats); // { size: 5, keys: [...] }
```

### Monitor MCP Calls

In admin panel → "Paper Search" → "Testing" tab:
- Enter test query
- See results breakdown by source
- Verify MCP server connectivity

## Mobile Responsive

The system is fully responsive:
- Filters collapse on mobile
- List view optimized for small screens
- Map view available on larger screens

## Accessibility

Features:
- ARIA labels on all inputs
- Keyboard navigation support
- High contrast badges
- Clear focus states
- Semantic HTML

## Performance Tips

1. **Use filters** - Reduce result set before displaying
2. **Debounce input** - Default 500ms (configurable)
3. **Cache results** - 5-minute TTL (configurable)
4. **Lazy load** - Components load on demand
5. **Parallel calls** - All sources queried simultaneously

## Troubleshooting

### Papers not appearing
- Check MCP servers are online
- Verify query has results
- Check citation filter isn't too high
- Clear cache: Admin → Paper Search → Clear All

### Search is slow
- Second search should be instant (cached)
- Check network inspector for MCP calls
- Reduce `maxResults` parameter

### Filters not working
- Verify filter values are valid
- Check `applyFilters()` method
- Ensure sources are in config

## Next Steps

1. Add `/papers` to your main navigation menu
2. Train your team on the search interface
3. Monitor admin panel for server health
4. Customize filters for your use case
5. Integrate with your existing workflows
