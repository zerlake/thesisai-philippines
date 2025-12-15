# Paper Search - Quick Start Guide

## What's Ready ✅

1. **Route**: `/papers` - accessible at `http://localhost:3000/papers`
2. **Build**: Production build succeeds
3. **Configuration**: MCP server endpoints configured in `.env.local`
4. **Components**: All UI components completed and typed
5. **Hooks**: React hooks for state management created
6. **Adapter**: Puter MCP adapter for tool invocation ready

## Quick Setup (5 Minutes)

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Configure MCP Servers
Edit `.env.local` to point to your MCP server endpoints:
```env
ARXIV_MCP_ENDPOINT="http://localhost:3001"
CROSSREF_MCP_ENDPOINT="http://localhost:3002"
PUBMED_MCP_ENDPOINT="http://localhost:3003"
GOOGLE_SCHOLAR_MCP_ENDPOINT="http://localhost:3004"
```

### 3. Start MCP Servers (in separate terminals)
```bash
# Terminal 1: ArXiv
python -m arxiv_mcp_server --port 3001

# Terminal 2: CrossRef
python -m crossref_mcp_server --port 3002

# Terminal 3: PubMed
python -m pubmed_mcp_server --port 3003

# Terminal 4: Google Scholar
python -m google_scholar_mcp_server --port 3004
```

### 4. Visit the Page
Navigate to: `http://localhost:3000/papers`

## Key Features

### Search
- Real-time paper search across all configured sources
- Debounced input (500ms default)
- Smart result aggregation

### Filters
- Year range (2000-present)
- Minimum citations
- Source selection
- Open access only toggle

### Views
- **List View**: Detailed paper information with actions
- **Network Map**: Relationship visualization

### Collections
- Add papers to collection
- Mark favorites
- Export as CSV

## Configuration Files

### `.env.local` (Runtime)
Endpoints for all MCP servers

### `src/lib/mcp/mcp-config.ts` (Code)
Server definitions and configuration logic

### `src/app/papers/page.tsx` (Route)
Page entry point

## Core Components

| Component | File | Purpose |
|-----------|------|---------|
| Page | `src/app/papers/page.tsx` | Route handler |
| Container | `src/components/paper-search/find-papers-page.tsx` | Main layout |
| Search Bar | `src/components/paper-search/paper-search-bar.tsx` | Input field |
| Filters | `src/components/paper-search/paper-search-filters.tsx` | Filter panel |
| List View | `src/components/paper-search/paper-list-view.tsx` | Results display |
| Map View | `src/components/paper-search/paper-map-view.tsx` | Network viz |

## Core Hooks

```typescript
// Main search hook
const {
  papers,
  totalResults,
  isLoading,
  error,
  query,
  search,
  updateFilters
} = usePaperSearch();

// Paper collection management
const {
  collection,
  addToCollection,
  toggleFavorite
} = usePaperCollection();

// Related papers
const {
  relatedPapers,
  findSimilar,
  findByAuthor
} = useRelatedPapers(paper);
```

## Core Services

### PaperSearchService
```typescript
import { paperSearchService } from '@/lib/mcp/paper-search';

const result = await paperSearchService.search(query, mcpTools);
```

### Puter MCP Adapter
```typescript
import { puterPaperAdapter } from '@/lib/mcp/puter-paper-adapter';

const result = await puterPaperAdapter.executePaperSearch(
  searchQuery,
  puterAI
);
```

### MCP Config
```typescript
import { getActiveMCPServers, checkMCPServerHealth } from '@/lib/mcp/mcp-config';

const servers = getActiveMCPServers();
const isHealthy = await checkMCPServerHealth('arxiv');
```

## Test Queries

Try these searches to test the feature:

```
- "machine learning"
- "neural networks"
- "artificial intelligence"
- "deep learning"
- "natural language processing"
- "computer vision"
- "data science"
```

## Troubleshooting

### "No results found"
1. Check MCP servers are running
2. Verify `.env.local` endpoints are correct
3. Check browser console for errors

### "Connection refused"
1. Start MCP servers first
2. Verify ports are correct (3001-3004)
3. Check firewall settings

### "Build errors"
1. Run `pnpm install` to ensure dependencies
2. Check `.env.local` file exists
3. Verify all type imports are correct

## Admin Dashboard (Optional)

Monitor paper search from admin:
```
http://localhost:3000/admin → "Paper Search" tab
```

Shows:
- MCP server health status
- Cache statistics
- Recent searches

## Environment Variables

### Required
```env
ARXIV_MCP_ENDPOINT=http://localhost:3001
CROSSREF_MCP_ENDPOINT=http://localhost:3002
PUBMED_MCP_ENDPOINT=http://localhost:3003
GOOGLE_SCHOLAR_MCP_ENDPOINT=http://localhost:3004
```

### Optional
```env
PAPER_SEARCH_CACHE_TTL=300000        # 5 minutes
PAPER_SEARCH_MAX_RESULTS=50
PAPER_SEARCH_DEFAULT_SOURCES=crossref,arxiv,pubmed,google_scholar
DEBUG_MCP_SERVERS=false
LOG_MCP_CALLS=false
```

## Build & Test

### Build
```bash
pnpm build
```

### Run Tests
```bash
pnpm test
```

### ESLint Check
```bash
pnpm lint
```

## Next Steps

1. ✅ Start dev server
2. ✅ Configure endpoints
3. ✅ Start MCP servers
4. ✅ Visit `/papers`
5. ⏭️ Add navigation link (optional)
6. ⏭️ Monitor admin dashboard (optional)

## Helpful Commands

```bash
# Check if ports are in use
netstat -ano | findstr :3001

# Kill a process on port 3001
taskkill /PID <PID> /F

# Rebuild project
pnpm build

# Type check
pnpm exec tsc --noEmit

# Format code
pnpm exec prettier --write src/

# Run specific test
pnpm exec vitest src/__tests__/paper-search.test.ts
```

## File Locations

```
src/
├── app/
│   └── papers/
│       └── page.tsx                    # /papers route
├── components/
│   └── paper-search/                   # All UI components
│       ├── find-papers-page.tsx
│       ├── paper-search-bar.tsx
│       ├── paper-search-filters.tsx
│       ├── paper-list-view.tsx
│       └── paper-map-view.tsx
├── hooks/
│   └── usePaperSearch.ts               # React hooks
├── lib/
│   └── mcp/
│       ├── mcp-config.ts               # MCP configuration
│       ├── puter-paper-adapter.ts      # Puter integration
│       └── paper-search.ts             # Search logic
└── types/
    └── paper.ts                        # TypeScript types
```

## Key Files You Edited

1. `src/lib/mcp/puter-paper-adapter.ts` - MCP tool definitions
2. `src/lib/mcp/paper-search.ts` - Paper search service
3. `src/lib/mcp/mcp-config.ts` - **NEW** Server configuration
4. `src/components/paper-search/paper-search-filters.tsx` - Type fixes
5. `src/components/admin/paper-search-admin.tsx` - Type fixes
6. `src/hooks/usePaperSearch.ts` - Removed auth dependency
7. `.env.local` - **NEW** Configuration file
8. `.env.example` - Updated with MCP variables

## Status Summary

| Item | Status |
|------|--------|
| Dependencies | ✅ Installed |
| Build | ✅ Successful |
| Route `/papers` | ✅ Created |
| UI Components | ✅ Complete |
| Hooks | ✅ Created |
| MCP Config | ✅ Created |
| Environment Setup | ✅ Ready |
| Navigation Link | ⏳ Optional |
| Admin Dashboard | ⏳ Optional |

---

**Ready to go!** Start with Step 1: Start Development Server
