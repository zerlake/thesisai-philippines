# Paper Search MCP Setup Guide

## Overview
This guide walks you through setting up and configuring the Paper Search feature with MCP (Model Context Protocol) server integration. The system enables searching and fetching academic papers from multiple sources including CrossRef, ArXiv, PubMed, and Google Scholar.

## Completed Steps

### ✅ Step 1: Dependencies Installation
```bash
pnpm install
```
- All dependencies are already up to date
- No additional packages need to be installed

### ✅ Step 2: Configure MCP Server Endpoints

#### Configuration Files Created:
1. **`src/lib/mcp/mcp-config.ts`** - Central MCP server configuration
2. **`.env.local`** - Environment variables for server endpoints
3. **`.env.example`** - Template for environment variables

#### Available MCP Servers to Configure:

| Server | Default Endpoint | Environment Variable |
|--------|------------------|----------------------|
| ArXiv | `http://localhost:3001` | `ARXIV_MCP_ENDPOINT` |
| CrossRef | `http://localhost:3002` | `CROSSREF_MCP_ENDPOINT` |
| PubMed | `http://localhost:3003` | `PUBMED_MCP_ENDPOINT` |
| Google Scholar | `http://localhost:3004` | `GOOGLE_SCHOLAR_MCP_ENDPOINT` |
| Serena | `http://localhost:5000` | `SERENA_MCP_ENDPOINT` |
| Local | `http://localhost:8000` | `LOCAL_MCP_ENDPOINT` |

#### Configuration in `.env.local`:

```env
# ArXiv MCP Server
ARXIV_MCP_ENDPOINT="http://localhost:3001"

# CrossRef API MCP Server
CROSSREF_MCP_ENDPOINT="http://localhost:3002"

# PubMed MCP Server
PUBMED_MCP_ENDPOINT="http://localhost:3003"

# Google Scholar MCP Server
GOOGLE_SCHOLAR_MCP_ENDPOINT="http://localhost:3004"

# Serena MCP Server
SERENA_MCP_ENDPOINT="http://localhost:5000"

# Local MCP Server (for development)
LOCAL_MCP_ENDPOINT="http://localhost:8000"
```

To use a production server, update these endpoints accordingly:
```env
ARXIV_MCP_ENDPOINT="https://arxiv-mcp.example.com"
CROSSREF_MCP_ENDPOINT="https://crossref-mcp.example.com"
PUBMED_MCP_ENDPOINT="https://pubmed-mcp.example.com"
GOOGLE_SCHOLAR_MCP_ENDPOINT="https://scholar-mcp.example.com"
```

### ✅ Step 3: Application Structure

#### Route: `/papers`
The paper search feature is available at the `/papers` route.

**File**: `src/app/papers/page.tsx`

Access in browser: `http://localhost:3000/papers`

#### Key Components:
- **FindPapersPage** (`src/components/paper-search/find-papers-page.tsx`)
  - Main container component
  - Handles layout and state management
  
- **PaperSearchBar** (`src/components/paper-search/paper-search-bar.tsx`)
  - Search input and submission
  
- **PaperSearchFilters** (`src/components/paper-search/paper-search-filters.tsx`)
  - Year range, citation count, source selection
  - Open access filtering
  
- **PaperListView** (`src/components/paper-search/paper-list-view.tsx`)
  - Display results in list format
  - Favorites and collection management
  
- **PaperMapView** (`src/components/paper-search/paper-map-view.tsx`)
  - Network visualization of paper relationships

#### Core Libraries:
- **`src/lib/mcp/mcp-config.ts`**
  - MCP server configuration and health checks
  - Tool registry and endpoints
  
- **`src/lib/mcp/puter-paper-adapter.ts`**
  - Bridges Puter AI to MCP servers
  - Handles tool execution and result mapping
  
- **`src/lib/mcp/paper-search.ts`**
  - Paper search orchestration
  - Deduplication and scoring
  - Cache management
  
- **`src/hooks/usePaperSearch.ts`**
  - React hooks for paper search
  - State management and API calls

#### Types:
- **`src/types/paper.ts`**
  - Paper, PaperSearchQuery, PaperSearchResult
  - Source-specific types (CrossRef, ArXiv, PubMed, Google Scholar)

### ✅ Step 4: Build Verification

Build command:
```bash
pnpm build
```

Status: ✅ **BUILD SUCCESS**

Output:
```
✓ Compiled successfully in 45s
```

## Next Steps

### Step 5: Start the Application

#### Development Server:
```bash
pnpm dev
```

Then navigate to: `http://localhost:3000/papers`

### Step 6: Configure and Start MCP Servers

You need to start the MCP servers for the paper search to work. Each server should be running on its configured endpoint.

#### Option A: Using Docker (Recommended)
If you have Docker installed, you can run MCP servers as containers:

```bash
# Start ArXiv MCP server
docker run -p 3001:8000 arxiv-mcp-server:latest

# Start CrossRef MCP server
docker run -p 3002:8000 crossref-mcp-server:latest

# Start PubMed MCP server
docker run -p 3003:8000 pubmed-mcp-server:latest

# Start Google Scholar MCP server
docker run -p 3004:8000 google-scholar-mcp-server:latest
```

#### Option B: Running Locally
If you have MCP server implementations, start them individually:

```bash
# Terminal 1
python arxiv_mcp_server --port 3001

# Terminal 2
python crossref_mcp_server --port 3002

# Terminal 3
python pubmed_mcp_server --port 3003

# Terminal 4
python google_scholar_mcp_server --port 3004
```

### Step 7: Test the Feature

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

2. **Navigate to** `http://localhost:3000/papers`

3. **Try a search**:
   - Enter a search query (e.g., "machine learning")
   - Results should appear from available sources
   - Use filters to refine results

4. **Test features**:
   - Add papers to collection
   - Toggle favorites
   - Filter by year, citations, source
   - Export collection as CSV
   - View network map visualization

### Step 8: Monitor Admin Dashboard (Optional)

1. Navigate to `http://localhost:3000/admin` (if you have admin access)
2. Go to "Paper Search" tab
3. Monitor:
   - MCP server health status
   - Cache statistics
   - Search history

## Configuration Details

### MCP Config Structure

The `src/lib/mcp/mcp-config.ts` file defines:

```typescript
interface MCPServerConfig {
  id: string;              // Unique server ID
  name: string;            // Display name
  description: string;     // Server description
  endpoint: string;        // HTTP endpoint
  transport: 'local' | 'remote';  // Transport type
  enabled: boolean;        // Enable/disable server
  tools: string[];         // Available tools
  timeout: number;         // Request timeout (ms)
  retries: number;         // Retry attempts
}
```

### Available Functions

**Health Check**:
```typescript
const isHealthy = await checkMCPServerHealth('arxiv');
```

**Get Active Servers**:
```typescript
const activeServers = getActiveMCPServers();
```

**Get All Tools**:
```typescript
const toolMap = getAllMCPTools();
// Returns: { arxiv: [...], crossref: [...], ... }
```

**Build Tool Call**:
```typescript
const call = buildMCPToolCall('arxiv', 'search_arxiv', {
  query: 'machine learning',
  max_results: 20
});
```

## Paper Search Data Flow

```
User Input (FindPapersPage)
        ↓
usePaperSearch Hook
        ↓
PaperSearchService
        ↓
Puter MCP Adapter
        ↓
MCP Server Endpoints
        ↓
API Sources (CrossRef, ArXiv, PubMed, Google Scholar)
        ↓
Result Deduplication & Scoring
        ↓
Display Results
```

## Troubleshooting

### Issue: Build fails with type errors
**Solution**: Ensure all files are saved and run `pnpm install` again

### Issue: `/papers` route returns 404
**Solution**: Verify `src/app/papers/page.tsx` exists and check your routing configuration

### Issue: No search results
**Solutions**:
1. Verify MCP server endpoints are running
2. Check `.env.local` has correct endpoints
3. Monitor browser console for errors
4. Check MCP server logs for connection issues

### Issue: MCP server connection refused
**Solutions**:
1. Verify server is running on configured port: `netstat -ano | findstr :PORT`
2. Check firewall settings
3. Verify endpoint URL format (must include protocol: `http://`)
4. Check server logs for startup errors

### Issue: Timeout errors
**Solutions**:
1. Increase timeout in `mcp-config.ts` (default: 30000ms)
2. Verify MCP server is responding
3. Check network connectivity

## API Integration

### Puter AI Integration

The `puterPaperAdapter` handles Puter AI integration:

```typescript
const adapter = puterPaperAdapter;

const result = await adapter.executePaperSearch(
  {
    query: 'machine learning',
    maxResults: 50,
    filters: {
      minYear: 2020,
      sources: ['arxiv', 'crossref']
    }
  },
  puterAI // Puter instance
);
```

### Direct API Usage

You can also call the paper search service directly:

```typescript
import { paperSearchService } from '@/lib/mcp/paper-search';

const result = await paperSearchService.search(query, mcpTools);
```

## Performance Optimization

### Caching
- Default cache TTL: 5 minutes
- Configurable in `paper-search.ts`
- Clear cache from admin dashboard

### Deduplication
Papers are deduplicated by:
1. DOI (most reliable)
2. ArXiv ID
3. PubMed ID
4. Title + Year combination

## Security Considerations

1. **MCP Server Authentication**
   - Add authentication headers to fetch calls if needed
   - Implement API key validation

2. **Rate Limiting**
   - Implement request throttling
   - Consider per-IP rate limits

3. **Data Privacy**
   - No personal data stored in cache
   - Search history is ephemeral
   - Configure GDPR compliance as needed

## File Summary

### Configuration Files
- `.env.local` - Runtime environment variables
- `.env.example` - Configuration template
- `src/lib/mcp/mcp-config.ts` - MCP server configuration

### Component Files
- `src/app/papers/page.tsx` - Route page
- `src/components/paper-search/find-papers-page.tsx` - Main component
- `src/components/paper-search/paper-search-bar.tsx` - Search input
- `src/components/paper-search/paper-search-filters.tsx` - Filter panel
- `src/components/paper-search/paper-list-view.tsx` - List display
- `src/components/paper-search/paper-map-view.tsx` - Network visualization

### Service Files
- `src/lib/mcp/paper-search.ts` - Search orchestration
- `src/lib/mcp/puter-paper-adapter.ts` - Puter integration
- `src/lib/mcp/mcp-config.ts` - MCP configuration

### Hook Files
- `src/hooks/usePaperSearch.ts` - Paper search hooks

### Type Files
- `src/types/paper.ts` - TypeScript definitions

## Maintenance

### Regular Tasks
1. **Monitor cache size** - Clear if it grows too large
2. **Update MCP endpoints** - If servers move
3. **Test health checks** - Verify all servers are responsive
4. **Review error logs** - Track failed requests

### Updates
- Keep MCP server implementations updated
- Regularly test with new paper sources
- Monitor for API changes from paper repositories

## Support & Resources

### Documentation References
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [CrossRef API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [ArXiv API](https://arxiv.org/help/api)
- [PubMed API](https://www.ncbi.nlm.nih.gov/books/NBK25498/)
- [Google Scholar](https://scholar.google.com/)

### Development
- Check `AGENTS.md` for build and test commands
- Review component patterns in `src/components/`
- Follow TypeScript strict mode requirements

---

**Setup Status**: ✅ Complete - Ready for development
**Build Status**: ✅ Successful
**Route Status**: ✅ Available at `/papers`
