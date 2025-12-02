# How to Run Everything - Complete Guide

## The Easiest Way (Recommended)

### Step 1: Start the MCP Server

Navigate to the arxiv server folder and run the startup script:

**PowerShell:**
```powershell
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
.\start-server.ps1
```

**Command Prompt:**
```cmd
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
start-server.bat
```

**Wait for output:**
```
INFO:     Uvicorn running on http://0.0.0.0:3001
```

### Step 2: Start the Main App

Open a **NEW terminal** and run:

```powershell
cd c:\Users\Projects\thesis-ai
pnpm dev
```

**Wait for output:**
```
Ready in 1234ms
```

### Step 3: Open Your Browser

Visit: **http://localhost:3000/papers**

### Step 4: Search!

Type in the search box: **"machine learning"**

Results should appear in 2-5 seconds!

---

## What Each Terminal Is Doing

```
Terminal 1 (MCP Server)              Terminal 2 (App)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                      
cd arxiv-mcp-server                  cd c:\Users\Projects\thesis-ai
.\start-server.ps1                   pnpm dev

Waiting for requests...               Ready to serve app...
                                      
http://0.0.0.0:3001                  http://localhost:3000
(Backend)                             (Frontend)
                                      
When you search...                    When you search...
- Gets query                          - Sends to frontend
- Calls ArXiv API                     - Shows results
- Returns papers                      - Displays in browser
```

---

## If Scripts Don't Work - Manual Method

### Terminal 1: Start MCP Server

```powershell
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
```

Press Enter.

```powershell
.venv\Scripts\activate
```

Press Enter. You should see `(.venv)` in the prompt.

```powershell
uv pip install -e ".[test]"
```

Press Enter. Wait for it to complete.

```powershell
python -m arxiv_mcp_server --port 3001
```

Press Enter. You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:3001
```

### Terminal 2: Start the App

Open a **new terminal** window.

```powershell
cd c:\Users\Projects\thesis-ai
pnpm dev
```

You should see:
```
Ready in XXXms
```

### Terminal 3: Open Browser

Copy and paste into address bar:
```
http://localhost:3000/papers
```

---

## Checking If It's Working

### Is the MCP Server running?

Visit in browser: `http://localhost:3001/health`

Should show: `{"status":"ok"}`

### Is the app running?

Visit in browser: `http://localhost:3000/papers`

Should show: Paper search page

### Are they connected?

1. Go to `http://localhost:3000/papers`
2. Search for "machine learning"
3. Wait 2-5 seconds
4. Should see results

If you see results, **everything is working!**

---

## Common Issues & Fixes

### Error: "uv: command not found"

**Fix:**
```powershell
pip install uv
```

Then try again.

### Error: Port 3001 already in use

**Check what's using it:**
```powershell
netstat -ano | findstr :3001
```

**Kill it:**
```powershell
taskkill /PID <PID_NUMBER> /F
```

Or use a different port:
```powershell
python -m arxiv_mcp_server --port 3011
```

Then edit `.env.local`:
```
ARXIV_MCP_ENDPOINT=http://localhost:3011
```

### Error: "ModuleNotFoundError: No module named 'arxiv_mcp_server'"

**Fix:**
- Make sure you're IN the `arxiv-mcp-server` folder
- Make sure you ran: `uv pip install -e ".[test]"`
- Make sure virtual environment is activated (should see `(.venv)` in prompt)

### Error: Execution policy error in PowerShell

**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

### Search results not appearing

**Checklist:**
1. Is Terminal 1 showing `Uvicorn running on http://0.0.0.0:3001`? (Server running)
2. Is Terminal 2 showing `Ready in XXXms`? (App running)
3. Is browser at correct URL? `http://localhost:3000/papers`
4. Did you type the search query?
5. Check browser console (F12) for errors

**Test the server:**
```powershell
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

---

## What the Startup Scripts Do

### start-server.ps1 (PowerShell)

1. Checks if virtual environment exists
2. Creates it if needed
3. Activates it
4. Installs/updates dependencies
5. Starts the MCP server on port 3001

### start-server.bat (Command Prompt)

Same as above but for Command Prompt.

---

## Directory Structure

```
c:\Users\Projects\thesis-ai\
│
├── src/
│   ├── app/
│   │   └── papers/
│   │       └── page.tsx        ← Paper search page
│   ├── components/
│   │   └── paper-search/       ← UI components
│   ├── lib/
│   │   └── mcp/                ← MCP integration
│   ├── hooks/
│   │   └── usePaperSearch.ts   ← React hooks
│   └── types/
│       └── paper.ts             ← TypeScript types
│
├── web-app/
│   └── arxiv-mcp-server/       ← MCP Server Code
│       ├── src/
│       ├── .venv/              ← Virtual environment
│       ├── start-server.ps1    ← PowerShell startup
│       ├── start-server.bat    ← Command Prompt startup
│       └── RUN_ME.txt          ← Instructions
│
├── .env.local                   ← Configuration
├── pnpm-lock.yaml
├── package.json
└── [other project files]
```

---

## Understanding the Flow

```
Your Browser
    ↓
http://localhost:3000/papers
    ↓
NextJS App (Terminal 2: pnpm dev)
    ↓
Search for "machine learning"
    ↓
Frontend calls /api/search
    ↓
Calls http://localhost:3001 (Terminal 1: arxiv_mcp_server)
    ↓
MCP Server processes request
    ↓
Calls ArXiv API
    ↓
ArXiv returns papers
    ↓
MCP Server formats results
    ↓
Results sent back to browser
    ↓
Browser displays papers
```

---

## Quick Reference

| Item | Port | URL |
|------|------|-----|
| NextJS App | 3000 | http://localhost:3000 |
| Paper Search | 3000 | http://localhost:3000/papers |
| MCP Server | 3001 | http://localhost:3001 |
| API Docs | 3001 | http://localhost:3001/docs |
| Health Check | 3001 | http://localhost:3001/health |

---

## Keyboard Shortcuts

**In PowerShell/Command Prompt:**
- `Ctrl+C` - Stop the server
- `Clear-Host` (PowerShell) or `cls` (Command Prompt) - Clear screen
- `Up Arrow` - Previous command
- `Tab` - Autocomplete

---

## Next Steps After It Works

1. **Try different searches:**
   - "neural networks"
   - "deep learning"
   - "machine learning 2023"

2. **Use filters:**
   - Year range: adjust to 2020-2025
   - Minimum citations: set to 100
   - Sources: uncheck unused ones

3. **Add papers to collection:**
   - Click heart icon to favorite
   - Click "Add to Collection"

4. **Export results:**
   - Click "Export" button
   - Save CSV file

5. **View network map:**
   - Click "Network Map" tab
   - See citation relationships

---

## Getting Help

1. **Quick issues**: Check the "Common Issues & Fixes" section above
2. **Setup help**: Read `START_MCP_SERVERS.md`
3. **App help**: Read `PAPER_SEARCH_START_HERE.md`
4. **Full docs**: Read `MCP_PAPER_SEARCH_SETUP_GUIDE.md`

---

## Important Files to Know

- **Main config**: `.env.local`
- **MCP Server startup**: `web-app/arxiv-mcp-server/start-server.ps1`
- **App startup**: `pnpm dev`
- **Paper route**: `src/app/papers/page.tsx`
- **Paper search**: `src/lib/mcp/paper-search.ts`

---

## Keeping Servers Running

Once running, they'll keep serving requests until you:
1. Close the terminal
2. Press `Ctrl+C`
3. Restart your computer
4. Kill the process (port already in use error)

To run again, just repeat Step 1 & 2 above.

---

**You're all set! Follow Step 1 above to get started.** 🚀
