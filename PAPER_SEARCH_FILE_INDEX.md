# Paper Search System - File Index

## Core Type Definitions

### `src/types/paper.ts`
Unified Paper schema and all TypeScript interfaces
- **Paper** - Main data structure
- **Author** - Author information
- **SourceIds** - Cross-source identifiers
- **PaperMetadata** - Metadata fields
- **PaperSearchQuery** - Search parameters
- **PaperSearchResult** - Search response
- **DeduplicationKey** - Deduplication strategy
- **CrossRefWork, ArxivEntry, PubmedEntry, GoogleScholarEntry** - MCP response types

**Used by**: All other modules

## Service Layer

### `src/lib/mcp/paper-search.ts`
Main paper search orchestration service
- **PaperSearchService** class:
  - `search()` - Orchestrate parallel searches
  - `deduplicatePapers()` - Remove duplicates
  - `scorePapers()` - Rank by relevance
  - `applyFilters()` - Filter results
  - `cacheManagement()` - Cache handling

**Exports**: `paperSearchService` singleton

**Called by**: Hooks, components, API routes

### `src/lib/mcp/puter-paper-adapter.ts`
Puter AI integration and MCP tools configuration
- **PUTER_MCP_TOOLS_CONFIG** - Tool definitions
- **initializePuterMCPTools()** - Setup function
- **PuterPaperSearchAdapter** class:
  - `executePaperSearch()` - Execute search via Puter
  - `getAuthorInfo()` - Author lookup
  - `getWorkMetadata()` - DOI lookup
  - `downloadArxivPDF()` - Get ArXiv paper
  - `downloadPubmedPDF()` - Get PubMed paper

**Exports**: `puterPaperAdapter` singleton, `PUTER_MCP_TOOLS_CONFIG`

**Called by**: Hooks, admin panel

## React Hooks

### `src/hooks/usePaperSearch.ts`
Three custom React hooks for paper management

#### `usePaperSearch(options?)`
Main search hook
- **State**: papers, totalResults, isLoading, error, query, hasSearched
- **Methods**:
  - `search()` - Execute search
  - `debouncedSearch()` - Debounced search
  - `filterPapers()` - Client-side filtering
  - `sortPapers()` - Client-side sorting
  - `getPaperById()` - Find specific paper
  - `clearSearch()` - Reset state
  - `updateFilters()` - Apply new filters

#### `useRelatedPapers(paper)`
Find papers related to a specific paper
- **Methods**:
  - `findSimilar()` - Similar papers by title
  - `findByAuthor()` - Papers by author name
  - `findByYearRange()` - Papers in year range
- **State**: relatedPapers, isLoading, error

#### `usePaperCollection()`
Manage a personal paper collection
- **Methods**:
  - `addToCollection()` - Add paper
  - `removeFromCollection()` - Remove paper
  - `toggleFavorite()` - Mark as favorite
  - `isFavorite()` - Check if favorited
  - `clearCollection()` - Empty collection
- **State**: collection, favorites

**Used by**: FindPapersPage, custom components

## UI Components

### `src/components/paper-search/paper-search-bar.tsx`
Search input component
- **Props**:
  - `onSearch` - Search callback
  - `isLoading` - Loading state
  - `placeholder` - Input hint
  - `value` - Controlled input
  - `onChange` - Input change callback
- **Features**: Clear button, loading indicator

### `src/components/paper-search/paper-search-filters.tsx`
Advanced filtering panel
- **Props**:
  - `onFiltersChange` - Filter update callback
  - `isExpanded` - Expand/collapse state
  - `onExpandChange` - Expansion callback
- **Filters**:
  - Year range slider
  - Citation minimum
  - Source selection (checkboxes)
  - Open access toggle
- **Features**: Clear filters button, filter count badge

### `src/components/paper-search/paper-list-view.tsx`
List of papers with metadata
- **Props**:
  - `papers` - Paper array
  - `isLoading` - Loading state
  - `onPaperSelect` - Selection callback
  - `onFavoriteToggle` - Favorite callback
  - `favorites` - Favorite set
  - `onDownloadPDF` - Download callback
- **Features**: 
  - Paper card with title, abstract, metadata
  - Author list truncation
  - Source badges
  - Action buttons (Save, PDF, View)
  - Skeleton loading

### `src/components/paper-search/paper-map-view.tsx`
Network graph visualization
- **Props**:
  - `papers` - Paper array
  - `isLoading` - Loading state
  - `onPaperSelect` - Selection callback
  - `selectedPaperId` - Selected paper ID
- **Features**:
  - Canvas-based rendering
  - Node size by citations
  - Links by common authors or year
  - Connection count display

### `src/components/paper-search/find-papers-page.tsx`
Main page orchestrating all components
- **Features**:
  - Search bar with debouncing
  - Advanced filters
  - List/Map view toggle
  - Export collection to CSV
  - Error display
  - Empty states
- **Layout**: Sidebar filters + main content

### `src/components/paper-search/index.ts`
Export index for all components
- Exports all 5 UI components
- Simplifies imports in other files

## Admin & Management

### `src/components/admin/paper-search-admin.tsx`
Admin dashboard section with 4 tabs
- **Overview Tab**:
  - Cache statistics
  - Active servers count
  - Configuration summary
- **MCP Servers Tab**:
  - Server status table
  - Last checked timestamp
  - Manual refresh button
- **Cache Management Tab**:
  - Cached queries list
  - Clear cache button
  - Cache expiry info
- **Testing Tab**:
  - Test search input
  - Results breakdown by source
  - Query performance display

### `src/components/admin-dashboard.tsx`
Updated with Paper Search integration
- Added import for `PaperSearchAdmin`
- Added "Paper Search" tab to tabs list
- Added TabsContent for paper-search

## API Routes

### `src/api/paper-search/route.ts`
RESTful API for paper search

#### POST /api/paper-search
Full-featured search endpoint
- **Body**: PaperSearchQuery object
- **Response**: PaperSearchResult
- **Headers**: Cache-Control: public, s-maxage=300

#### GET /api/paper-search
Query parameter-based search
- **Params**:
  - `q` - Query string (required)
  - `maxResults` - Result limit (default: 20)
  - `minYear` - Minimum year
  - `maxYear` - Maximum year
  - `minCitations` - Minimum citations
  - `isOpenAccessOnly` - Boolean flag
- **Response**: PaperSearchResult
- **Headers**: Cache-Control headers

**Error Handling**: Validation, try-catch, JSON responses

## Pages & Routing

### `src/app/papers/page.tsx`
Main papers page route
- **Route**: /papers
- **Component**: FindPapersPage
- **Metadata**: Title and description for SEO

## Configuration Files

### `package.json` (modified)
Added dependencies:
- `uuid` ^9.0.1 - For unique paper IDs
- `@types/uuid` ^9.0.7 - TypeScript types

## Documentation

### `PAPER_SEARCH_IMPLEMENTATION.md`
Comprehensive implementation guide
- Architecture overview
- File structure walkthrough
- Feature descriptions
- Usage examples
- Configuration options
- Error handling
- Future enhancements
- Testing guide

### `PAPER_SEARCH_QUICK_START.md`
Developer quick-start guide
- Installation steps
- Navigation integration
- Basic usage examples
- Component reference
- Configuration changes
- Common tasks
- API integration
- Debugging tips
- Mobile & accessibility info
- Troubleshooting

### `PAPER_SEARCH_DELIVERY_SUMMARY.md`
Project delivery summary
- What was delivered
- Implementation checklist
- Integration points
- Getting started steps
- Architecture highlights
- Performance metrics
- Browser & accessibility support
- Deployment checklist
- Success criteria

### `PAPER_SEARCH_FILE_INDEX.md` (this file)
Complete file reference
- Description of every file
- What each exports
- What uses each file
- Dependencies between files

## File Dependencies

```
paper.ts (types)
  ↓
  ├→ paper-search.ts (service)
  │   ↓
  │   ├→ usePaperSearch.ts (hooks)
  │   │   ↓
  │   │   ├→ find-papers-page.tsx
  │   │   └→ (other components)
  │   │
  │   └→ paper-search/route.ts (API)
  │
  ├→ puter-paper-adapter.ts (MCP)
  │   ↓
  │   └→ usePaperSearch.ts (hooks)
  │
  └→ All UI components
      ↓
      └→ find-papers-page.tsx
          ↓
          └→ papers/page.tsx
              ↓
              └→ Route: /papers
```

## Component Hierarchy

```
FindPapersPage (Main)
├─ PaperSearchBar
├─ PaperSearchFilters
├─ Tabs
│  ├─ TabsContent (list)
│  │  └─ PaperListView
│  │     └─ PaperListItem (repeated)
│  └─ TabsContent (map)
│     └─ PaperMapView
└─ Alert (error display)
```

## State Management

```
FindPapersPage (Local State)
├─ usePaperSearch() Hook
│  ├─ papers state
│  ├─ isLoading state
│  ├─ error state
│  └─ query state
├─ usePaperCollection() Hook
│  ├─ collection state
│  └─ favorites state
└─ Local State
   ├─ viewMode (list/map)
   ├─ selectedPaper
   └─ searchInput
```

## Data Flow

```
User Input
  ↓
PaperSearchBar.onSearch()
  ↓
FindPapersPage.search()
  ↓
usePaperSearch.search()
  ↓
PaperSearchService.search()
  ↓
PuterPaperAdapter → MCP Calls
  ├→ CrossRef
  ├→ ArXiv
  ├→ PubMed
  └→ Scholar
  ↓
Results Deduplication
  ↓
Scoring & Ranking
  ↓
Filtering
  ↓
Caching
  ↓
State Update
  ↓
Component Render
  ↓
PaperListView or PaperMapView
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm
- Existing ThesisAI installation

### Setup Steps
1. Copy all files from this delivery
2. Run `pnpm install` (for new dependencies)
3. Configure MCP servers in `puter-paper-adapter.ts`
4. Build: `pnpm build`
5. Run: `pnpm dev`
6. Access: `http://localhost:3000/papers`

## Testing

### Files to Test
- `src/lib/mcp/paper-search.ts` - Core logic
- `src/lib/mcp/puter-paper-adapter.ts` - Integration
- `src/hooks/usePaperSearch.ts` - Hooks
- `src/api/paper-search/route.ts` - API

### Test Commands
```bash
pnpm test                    # All tests
pnpm test:ui                # With UI
pnpm test:coverage          # Coverage report
pnpm test src/lib/mcp       # MCP tests only
```

---

**Last Updated**: 2025-11-29
**Version**: 1.0.0
**Status**: Production Ready
