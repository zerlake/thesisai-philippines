# Paper Search - START HERE

## 🚀 Quick Start (Right Now)

### Prerequisites Check
- You have Node.js and pnpm installed
- You have access to a terminal
- You want to test the paper search feature

### 3 Terminal Windows Approach (Recommended)

#### Terminal 1: Start the Development Server
```bash
cd c:\Users\Projects\thesis-ai
pnpm dev
```
**Expected output**: "Ready in XXX ms"

Then open your browser to: **http://localhost:3000/papers**

#### Terminal 2: Start ArXiv MCP Server
```bash
python -m arxiv_mcp_server --port 3001
```
or
```bash
docker run -p 3001:8000 arxiv-mcp-server:latest
```

#### Terminal 3: Start CrossRef MCP Server
```bash
python -m crossref_mcp_server --port 3002
```
or
```bash
docker run -p 3002:8000 crossref-mcp-server:latest
```

**Once all are running, try a search in your browser!**

---

## 📋 Complete Setup Checklist

### ✅ Already Done (No Action Needed)
- [x] Dependencies installed
- [x] MCP configuration created
- [x] Environment variables configured
- [x] Build verified (no errors)
- [x] Route `/papers` ready
- [x] Components built

### ⏳ You Need To Do

#### Step 1: Start Development Server
```bash
pnpm dev
```
Wait for: "Ready in XXXms"

#### Step 2: Configure MCP Servers
You need at least one MCP server running. Options:

**Option A: Using Python (if you have MCP server implementations)**
```bash
# Each in a separate terminal
python -m arxiv_mcp_server --port 3001
python -m crossref_mcp_server --port 3002
python -m pubmed_mcp_server --port 3003
python -m google_scholar_mcp_server --port 3004
```

**Option B: Using Docker (if you have Docker images)**
```bash
docker run -p 3001:8000 arxiv-mcp-server:latest
docker run -p 3002:8000 crossref-mcp-server:latest
docker run -p 3003:8000 pubmed-mcp-server:latest
docker run -p 3004:8000 google-scholar-mcp-server:latest
```

**Option C: Using Pre-built Services**
If you have MCP servers already deployed elsewhere, update `.env.local`:
```env
ARXIV_MCP_ENDPOINT="https://your-server.com/arxiv"
CROSSREF_MCP_ENDPOINT="https://your-server.com/crossref"
# etc.
```

#### Step 3: Open the Application
Navigate to: **http://localhost:3000/papers**

#### Step 4: Test It
1. Type in the search box: "machine learning"
2. Results should appear
3. Try the filters
4. Add papers to collection
5. Export collection

---

## 🎯 What You Should See

### The Page (http://localhost:3000/papers)
```
┌─────────────────────────────────────────────────────┐
│ Find Research Papers                                 │
│ Search across CrossRef, ArXiv, PubMed, Google Scholar│
├─────────────────────────────────────────────────────┤
│                                                       │
│  [Search box: "Enter search query"]                   │
│                                                       │
│  ┌──────────────┬──────────────────────────────────┐ │
│  │              │                                   │ │
│  │ Filters      │  Results (0 papers)               │ │
│  │              │                                   │ │
│  │ • Year       │  [List of papers]                │ │
│  │ • Citations  │                                   │ │
│  │ • Sources    │  [Add to collection]              │ │
│  │ • Open Acc.  │  [Save to favorites]              │ │
│  │              │  [Download PDF]                   │ │
│  └──────────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### When You Search
1. Page should show "Searching..."
2. Results appear under "Found X papers"
3. Each paper shows:
   - Title
   - Authors
   - Year
   - Citation count
   - Action buttons

---

## 🔧 If Something Goes Wrong

### Problem: "No results found"
**Solution**:
1. Check MCP servers are running
2. Check ports (3001-3004) are correct
3. Check `.env.local` has correct endpoints
4. Open browser console (F12) and check for errors

### Problem: "Connection refused" error
**Solution**:
1. Start MCP server (was it actually running?)
2. Check port is correct
3. Check firewall (port 3001-3004)
4. Test connectivity: `curl http://localhost:3001/health`

### Problem: Build errors
**Solution**:
1. Run: `pnpm install`
2. Run: `pnpm build`
3. Check output for specific error
4. Verify `.env.local` file exists

### Problem: Page shows 404
**Solution**:
1. Check URL: should be `http://localhost:3000/papers` (not `/paper`)
2. Check dev server is running (should see "Ready" in terminal)
3. Refresh browser

### Problem: Search hangs/never completes
**Solution**:
1. Check MCP server is responding
2. Check timeout (default 30 seconds)
3. Try simpler search query
4. Check server logs

---

## 📚 Understanding the Flow

```
Your Browser
    ↓
   /papers Page
    ↓
  FindPapersPage Component
    ↓
  usePaperSearch() Hook
    ↓
  paperSearchService
    ↓
  puterPaperAdapter
    ↓
  MCP Servers (CrossRef, ArXiv, etc.)
    ↓
  External APIs
    ↓
  Results back through same path
    ↓
  Display in browser
```

---

## 🎨 UI Features to Try

### Search Bar
- Type to search
- Auto-debounces (500ms wait)
- Real-time results

### Filters Sidebar
- **Year Range**: Slide to select years
- **Minimum Citations**: Select citation threshold
- **Sources**: Toggle CrossRef, ArXiv, PubMed, Google Scholar
- **Open Access**: Filter for free papers only
- **Clear Filters**: Reset all

### Results View
- **List View**: Detailed paper cards with actions
- **Map View**: Network visualization
- Switch with tabs

### Actions
- **❤️ Favorite**: Toggle favorite status
- **📊 View Details**: See more information
- **📥 Add to Collection**: Save to your collection
- **📄 Download**: Get the PDF

### Collection
- **Saved papers**: Shows count of saved papers
- **Export CSV**: Download your collection as CSV

---

## 🔑 Important Files Reference

### Configuration
- `.env.local` - Where your MCP endpoints go
- `.env.example` - Template with all options

### Where Your Search Feature Lives
- Route: `src/app/papers/page.tsx`
- Page Component: `src/components/paper-search/find-papers-page.tsx`

### How It Works
- Service: `src/lib/mcp/paper-search.ts`
- Adapter: `src/lib/mcp/puter-paper-adapter.ts`
- Config: `src/lib/mcp/mcp-config.ts`

### React Hooks
- `src/hooks/usePaperSearch.ts`

### Type Definitions
- `src/types/paper.ts`

---

## 📝 Configuration Quick Reference

### Default MCP Endpoints (in `.env.local`)
```
ARXIV_MCP_ENDPOINT=http://localhost:3001
CROSSREF_MCP_ENDPOINT=http://localhost:3002
PUBMED_MCP_ENDPOINT=http://localhost:3003
GOOGLE_SCHOLAR_MCP_ENDPOINT=http://localhost:3004
```

### Optional Settings
```
PAPER_SEARCH_CACHE_TTL=300000              # Cache for 5 minutes
PAPER_SEARCH_MAX_RESULTS=50                # Max results per query
PAPER_SEARCH_DEFAULT_SOURCES=crossref,arxiv,pubmed,google_scholar
DEBUG_MCP_SERVERS=false                    # Enable debug logging
```

---

## 🧪 Test Queries

Try these searches to verify everything works:

```
1. "machine learning"
   - Should return results from all sources
   
2. "neural networks 2023"
   - Use filters to limit to 2023 only
   
3. "deep learning"
   - Try the different view modes (list vs map)
   
4. "artificial intelligence"
   - Try exporting results to CSV
   
5. Your own topic of interest!
   - See what papers are available
```

---

## ✅ Success Checklist

When everything is working, you should be able to:

- [ ] Access http://localhost:3000/papers without errors
- [ ] Type in search box and get debounced input
- [ ] See results appear after 2-5 seconds
- [ ] Results show title, authors, year, citations
- [ ] Add papers to collection
- [ ] Toggle favorites
- [ ] Filter by year range
- [ ] Filter by minimum citations
- [ ] Filter by source (crossref, arxiv, pubmed, scholar)
- [ ] Filter by open access only
- [ ] View results in list view
- [ ] View results in network map view
- [ ] Export collection to CSV
- [ ] See error message if MCP server is down (graceful)

---

## 📞 Quick Help

| Problem | Command to Debug |
|---------|-----------------|
| Port in use | `netstat -ano \| findstr :3001` |
| Kill process | `taskkill /PID <PID> /F` |
| Check build | `pnpm build` |
| Type check | `pnpm exec tsc --noEmit` |
| Run tests | `pnpm test` |
| View logs | Terminal where you ran the server |

---

## 🎓 Learning Resources

### Complete Setup Guide
Read: `MCP_PAPER_SEARCH_SETUP_GUIDE.md`

### Quick Reference
Read: `MCP_PAPER_SEARCH_QUICKSTART.md`

### Completion Summary
Read: `MCP_SETUP_COMPLETION_SUMMARY.txt`

---

## 📍 Current Status

| Component | Status |
|-----------|--------|
| Codebase | ✅ Ready |
| Build | ✅ Successful |
| Route | ✅ Created |
| Components | ✅ Built |
| Configuration | ✅ Done |
| Dev Server | ⏳ Start it |
| MCP Servers | ⏳ Start them |
| Testing | ⏳ You do this |

---

## 🚦 Next Action

1. **Right now**: Start the dev server
   ```bash
   pnpm dev
   ```

2. **In another terminal**: Start at least one MCP server
   ```bash
   python -m arxiv_mcp_server --port 3001
   ```

3. **Open browser**: http://localhost:3000/papers

4. **Try a search**: "machine learning"

5. **Enjoy**: See your results!

---

## 💡 Pro Tips

- **Faster searches**: Fewer sources = faster results (uncheck unused sources)
- **Better results**: Use year filters to find recent papers
- **Save time**: Add papers to collection as you find them
- **Export anytime**: You can export partial collections
- **Auto-refresh**: Search updates automatically when you change filters
- **Clear cache**: If results seem stale, refresh the page

---

**Everything is set up. Now go test it! 🎉**

Questions? See the detailed guides:
- `MCP_PAPER_SEARCH_SETUP_GUIDE.md` - Complete documentation
- `MCP_PAPER_SEARCH_QUICKSTART.md` - Quick reference
