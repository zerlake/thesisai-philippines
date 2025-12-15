# Serena MCP Server Setup with Puter AI

## Overview
Serena is an AI-powered MCP (Model Context Protocol) server running on `http://127.0.0.1:24282` that provides thesis analysis and research tools. This setup uses **Puter AI** as the LLM provider instead of Claude.

## Current Setup

### Environment Variables
```
SERENA_URL=http://127.0.0.1:24282
NEXT_PUBLIC_SERENA_URL=http://127.0.0.1:24282
PUTER_LOCAL_ENDPOINT=http://localhost:8000
LLM_PROVIDER=puter
```

### Serena Dashboard
Access the Serena dashboard at: http://127.0.0.1:24282/dashboard/index.html

## Features

Serena MCP Server provides:
- Thesis analysis and structure verification
- Research gap identification
- Document processing and analysis
- AI-powered context protocol tools

## Integration with Thesis AI

### Admin Dashboard
The admin dashboard (`/admin`) includes an "MCP Servers" tab showing:
1. **Serena MCP Server** - Status, model info, and connection controls
2. **Quick Access** - Links to MCP demo and tools
3. **Composio Playground** - Additional AI workflow tools

### API Endpoints

#### Check Serena Status
```
GET /api/mcp/serena-status
```
Returns current connection status of Serena MCP Server.

#### Connect to Serena
```
POST /api/mcp/serena-connect
Body: { "action": "connect" | "disconnect" }
```
Establishes or closes connection to Serena.

## How to Use

### 1. Start Serena with Puter AI
Ensure Serena is running on port 24282 with Puter AI as the LLM provider:
```bash
# Using uvx with Puter AI
uvx --from git+https://github.com/oraios/serena serena start-mcp-server \
  --llm-provider puter \
  --puter-endpoint http://localhost:8000

# Or with your local Serena installation
serena start-mcp-server --llm-provider puter --puter-endpoint http://localhost:8000
```

**Important:** Ensure Puter is running on port 8000 before starting Serena.

### 2. Verify Connection
Go to `/admin` and click the **MCP Servers** tab:
- Click **Refresh** to check status
- Click **Connect** to establish connection
- Status should show as "Connected" (green)

### 3. Use Serena Tools
Once connected, use Serena tools through:
- Puter AI console (http://localhost:8000)
- IDE extensions (Cursor, Windsurf, etc. - with Puter AI MCP config)
- The admin dashboard at `/admin`
- Claude Desktop (with Puter API key configured)

## Configuration Files

### Next.js Environment
File: `.env.local`
```
SERENA_URL=http://127.0.0.1:24282
NEXT_PUBLIC_SERENA_URL=http://127.0.0.1:24282
```

### MCP Server Config
File: `mcp-servers-config.json`
Contains Serena MCP server configuration for clients.

## Troubleshooting

### Connection Shows "Disconnected"
1. Check if Serena is running on port 24282
2. Verify `http://127.0.0.1:24282/dashboard/index.html` is accessible in browser
3. Check for firewall blocking port 24282
4. Restart your dev server: `npm run dev`

### Dashboard Not Loading
1. Ensure Serena process is still running
2. Check Serena logs for errors
3. Try accessing dashboard directly: `http://127.0.0.1:24282/dashboard/index.html`

### MCP Server Tab Not Showing
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear Next.js cache: `rm -r .next`
3. Restart dev server: `npm run dev`

## References
- [Serena GitHub](https://github.com/oraios/serena)
- [MCP Specification](https://mcp-spec.io/)
- Local Dashboard: http://127.0.0.1:24282/dashboard/index.html
