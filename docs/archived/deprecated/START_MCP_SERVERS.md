# How to Start MCP Servers

## Quick Answer

You need to set up Python environments and run the MCP server implementations. Here's the exact process:

---

## Option 1: Using ArXiv MCP Server (You Have This!)

### Step-by-Step Setup

#### 1. Navigate to the ArXiv MCP Server Directory
```bash
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
```

#### 2. Create a Python Virtual Environment
```bash
# Using uv (recommended)
uv venv

# Or using Python's built-in venv
python -m venv .venv
```

#### 3. Activate the Virtual Environment
```bash
# Windows Command Prompt
.venv\Scripts\activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

# Linux/Mac
source .venv/bin/activate
```

#### 4. Install the Package with Test Dependencies
```bash
# Using uv (if installed)
uv pip install -e ".[test]"

# Or using pip
pip install -e ".[test]"
```

#### 5. Run the MCP Server
```bash
# Start the server on default port (5000)
python -m arxiv_mcp_server

# Or specify a custom port
python -m arxiv_mcp_server --port 3001
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:3001 (Press CTRL+C to quit)
```

---

## Option 2: Using Docker (If You Have Docker)

### Docker Approach (Easiest if Docker is installed)

#### 1. Build the Docker Image
```bash
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
docker build -t arxiv-mcp-server:latest .
```

#### 2. Run the Docker Container
```bash
docker run -p 3001:8000 arxiv-mcp-server:latest
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Access at: `http://localhost:3001`

---

## Full Multi-Server Setup (3-Terminal Approach)

### Terminal Setup Diagram
```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│   Terminal 1         │   Terminal 2         │   Terminal 3         │
│   Main App           │   ArXiv MCP Server   │   CrossRef/Other     │
│                      │   (port 3001)        │   (port 3002)        │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ $ pnpm dev           │ $ cd web-app/arxiv   │ $ python -m pip      │
│                      │ $ .venv\Scripts\...  │   install crossref   │
│ Browser opens at:    │ $ python -m arxiv    │ $ python -m crossref │
│ localhost:3000/papers│   --port 3001        │   --port 3002        │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## Step-by-Step: Complete Setup

### Step 1: Setup ArXiv MCP Server (Terminal 2)

```bash
# Navigate to the server directory
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server

# Create virtual environment
uv venv

# Activate it
.venv\Scripts\activate

# Install dependencies
uv pip install -e ".[test]"

# Start the server
python -m arxiv_mcp_server --port 3001
```

**Wait for**: `Uvicorn running on http://0.0.0.0:3001`

### Step 2: Start the Main App (Terminal 1)

```bash
cd c:\Users\Projects\thesis-ai

# Start dev server
pnpm dev
```

**Wait for**: `Ready in XXXms`

### Step 3: Open Browser

Visit: `http://localhost:3000/papers`

### Step 4: Test It

1. Type in search box: "machine learning"
2. Click search
3. Wait 2-5 seconds
4. Results should appear!

---

## Troubleshooting MCP Server Startup

### Problem: "uv: command not found"
**Solution**: Install uv first
```bash
pip install uv
```

Or use pip instead:
```bash
pip install -e ".[test]"
```

### Problem: "ModuleNotFoundError: No module named 'arxiv_mcp_server'"
**Solution**: Make sure you're in the right directory and installed with `-e`
```bash
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
uv pip install -e ".[test]"
```

### Problem: "Port 3001 already in use"
**Solution**: Kill the existing process or use a different port
```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
python -m arxiv_mcp_server --port 3011
```

Then update `.env.local`:
```env
ARXIV_MCP_ENDPOINT=http://localhost:3011
```

### Problem: "No module named 'fastapi'" or other missing dependencies
**Solution**: Reinstall dependencies
```bash
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
pip install --upgrade -e ".[test]"
```

### Problem: Virtual environment not activating
**Solution**: Try PowerShell if using Command Prompt
```bash
# In PowerShell:
.venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.venv\Scripts\Activate.ps1
```

### Problem: "python -m arxiv_mcp_server" command not found
**Solution**: Make sure virtual environment is activated
```bash
# Check if venv is active (should show .venv in prompt)
python --version

# If not active, activate it
.venv\Scripts\activate
```

---

## Checking If Server Is Running

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

### Test 2: Check in Browser
Visit: `http://localhost:3001/docs`

You should see the API documentation with available endpoints.

### Test 3: Test Search
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"machine learning","max_results":5}'
```

---

## Understanding the Server Structure

### What's in arxiv-mcp-server?

```
web-app/arxiv-mcp-server/
├── src/
│   └── arxiv_mcp_server/
│       ├── __main__.py           # Entry point for "python -m"
│       ├── server.py             # MCP server implementation
│       ├── tools/
│       │   ├── search.py         # Search tool
│       │   ├── download.py       # Download tool
│       │   ├── list_papers.py    # List tool
│       │   └── read_paper.py     # Read tool
│       └── resources/
│           └── papers.py         # Paper storage management
├── pyproject.toml                # Python dependencies
├── README.md                     # Documentation
└── Dockerfile                    # Docker configuration
```

### How "python -m arxiv_mcp_server" Works

1. Python finds `src/arxiv_mcp_server/__main__.py`
2. Runs the main entry point
3. Starts an HTTP server on specified port
4. Listens for MCP requests
5. Forwards them to actual tools (search, download, etc.)

---

## Configuration Options

### Environment Variables

```bash
# Paper storage location (where downloaded PDFs go)
set ARXIV_STORAGE_PATH=C:\Users\Projects\thesis-ai\papers

# Search result timeout
set ARXIV_REQUEST_TIMEOUT=60

# Max results per search
set ARXIV_MAX_RESULTS=50
```

### Starting with Config

```bash
# Set env vars then start
set ARXIV_STORAGE_PATH=C:\Users\Projects\thesis-ai\papers
python -m arxiv_mcp_server --port 3001
```

---

## Multiple Servers (Advanced)

If you want to run all four sources:

### Terminal 2A: ArXiv (port 3001)
```bash
cd web-app\arxiv-mcp-server
.venv\Scripts\activate
python -m arxiv_mcp_server --port 3001
```

### Terminal 2B: CrossRef (port 3002)
Would need: crossref-mcp-server package
```bash
pip install crossref-mcp-server
python -m crossref_mcp_server --port 3002
```

### Terminal 2C: PubMed (port 3003)
Would need: pubmed-mcp-server package
```bash
pip install pubmed-mcp-server
python -m pubmed_mcp_server --port 3003
```

### Terminal 2D: Google Scholar (port 3004)
Would need: google-scholar-mcp-server package
```bash
pip install google-scholar-mcp-server
python -m google_scholar_mcp_server --port 3004
```

**Note**: Only ArXiv server is available in your project. For others, you'd need to:
1. Create them (or find existing implementations)
2. Install them
3. Run each on a different port
4. Update `.env.local` with all endpoints

---

## Quick Commands Reference

```bash
# Setup (one time)
cd c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server
uv venv
.venv\Scripts\activate
uv pip install -e ".[test]"

# Run server (every time)
python -m arxiv_mcp_server --port 3001

# Or with Docker (if available)
docker build -t arxiv-mcp:latest .
docker run -p 3001:8000 arxiv-mcp:latest

# Test server
curl http://localhost:3001/health

# Kill server
# Ctrl+C in the terminal running it
```

---

## What Happens When Connected

1. **Your Browser** visits `/papers`
2. **Frontend** makes request to NextJS API
3. **NextJS** forwards to MCP adapter
4. **MCP Adapter** calls MCP server endpoint (e.g., `http://localhost:3001`)
5. **MCP Server** (ArXiv) processes request
6. **ArXiv API** returns papers
7. Results bubble back up the chain
8. **Browser** displays results

---

## Files You'll Need

- **Main App**: `c:\Users\Projects\thesis-ai\`
- **ArXiv Server**: `c:\Users\Projects\thesis-ai\web-app\arxiv-mcp-server\`
- **Config**: `c:\Users\Projects\thesis-ai\.env.local`

---

## Next Steps

1. Follow "Option 1: Using ArXiv MCP Server" above
2. In another terminal, start: `pnpm dev`
3. Visit: `http://localhost:3000/papers`
4. Search for papers!

**Total setup time**: 5-10 minutes (first time only)

---

## Help & Support

- ArXiv Server Docs: See `web-app/arxiv-mcp-server/README.md`
- Main App Docs: See `PAPER_SEARCH_START_HERE.md`
- Issues: Check terminal output for error messages
