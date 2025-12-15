# MCP Manual Setup Guide

If `npm run setup:mcp` doesn't work on your system, follow these manual steps.

## Step 1: Install Dependencies (1 min)

```bash
pnpm install
# or
npm install
```

## Step 2: Create Directories (1 min)

```bash
# Windows (PowerShell)
mkdir src\lib\mcp
mkdir src\hooks
mkdir src\components\mcp
mkdir .checkpoints

# OR Windows (Command Prompt)
md src\lib\mcp
md src\hooks
md src\components\mcp
md .checkpoints

# OR macOS/Linux
mkdir -p src/lib/mcp src/hooks src/components/mcp .checkpoints
```

## Step 3: Configure Environment Variables (1 min)

### Option A: Create .env.local Manually

1. Open your favorite text editor
2. Create a file named `.env.local` in the project root
3. Add these lines:
   ```
   PUTER_LOCAL_ENDPOINT=http://localhost:8000
   SERENA_URL=http://localhost:3000
   ```
4. Save the file

### Option B: Command Line

```bash
# macOS/Linux/WSL
echo 'PUTER_LOCAL_ENDPOINT=http://localhost:8000' >> .env.local
echo 'SERENA_URL=http://localhost:3000' >> .env.local

# Windows PowerShell
Add-Content -Path .env.local -Value 'PUTER_LOCAL_ENDPOINT=http://localhost:8000'
Add-Content -Path .env.local -Value 'SERENA_URL=http://localhost:3000'

# Windows Command Prompt
echo PUTER_LOCAL_ENDPOINT=http://localhost:8000 >> .env.local
echo SERENA_URL=http://localhost:3000 >> .env.local
```

## Step 4: Verify amp.json (1 min)

Check if `amp.json` exists in the project root. If not, create it:

```json
{
  "selectedAuthType": "none",
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    }
  },
  "settings": {
    "serverPort": 3000,
    "mcpDebug": false,
    "logLevel": "info"
  }
}
```

## Step 5: Verify puter.config.ts

Check if `puter.config.ts` exists in the project root. It should contain:

```typescript
import type { PuterConfig } from './src/lib/mcp';

const config: PuterConfig = {
  models: {
    default: 'local-llm',
    available: ['local-llm', 'qwen', 'context7'],
  },
  endpoints: {
    local: process.env.PUTER_LOCAL_ENDPOINT || 'http://localhost:8000',
    remote: process.env.PUTER_REMOTE_ENDPOINT,
  },
  timeout: 30000,
  retries: 3,
  cache: {
    enabled: true,
    ttl: 3600000,
  },
};

export default config;
```

## Step 6: Verify All Files Exist

```bash
# These files should exist:
ls src/lib/mcp/serena-client.ts
ls src/lib/mcp/puter-adapter.ts
ls src/lib/mcp/orchestrator.ts
ls src/lib/mcp/utils.ts
ls src/lib/mcp/index.ts
ls src/hooks/useMCP.ts
ls src/components/mcp/MCPProvider.tsx
ls src/components/mcp/ExampleMCPComponent.tsx
```

If any files are missing, check the MCP_IMPLEMENTATION_FILES.md for the complete list.

## Step 7: Test Your Setup (1 min)

```bash
# Run MCP tests
npm run test:mcp

# Start development server
npm run dev

# Visit http://localhost:3000 and look for any errors
```

## Step 8: Verify Environment

```bash
# Check that .env.local was created correctly
cat .env.local
# Should show:
# PUTER_LOCAL_ENDPOINT=http://localhost:8000
# SERENA_URL=http://localhost:3000
```

## Step 9: Ready to Use!

All files are in place. You can now:

```bash
# Start development
npm run dev

# Test MCP functionality
npm run test:mcp

# Use MCP in your components (see MCP_QUICKSTART.md)
```

---

## Troubleshooting

### ".env.local not created"
- Windows: Use `Add-Content` command or create file manually
- macOS/Linux: Use `echo` command or create file manually

### "Directory already exists"
- This is fine! The `mkdir -p` command only creates if needed

### "npm run setup:mcp failed"
- Run manual steps above instead
- Check that pnpm/npm is installed: `npm --version`

### "Files missing"
- Run `npm run setup:mcp` or manually verify all files exist
- Check MCP_IMPLEMENTATION_FILES.md for complete file list

### "TypeScript errors"
- Run `npm install` to ensure all dependencies are installed
- TypeScript should work out of the box

---

## What Was Installed

```
thesis-ai/
├── amp.json                    ← Configuration
├── puter.config.ts             ← Model runtime
├── .env.local                  ← Environment (created)
├── scripts/
│   ├── setup-mcp.ps1          ← PowerShell setup
│   ├── setup-mcp.sh           ← Bash setup
│   └── setup-mcp-simple.js    ← Node.js setup
├── src/
│   ├── lib/mcp/               ← Core libraries
│   ├── hooks/                 ← React hooks
│   └── components/mcp/        ← React components
└── Documentation files
```

## Next Steps

1. ✅ Setup complete
2. 📖 Read [MCP_QUICKSTART.md](./MCP_QUICKSTART.md)
3. 🔧 Try example component
4. 🚀 Build your first feature!

---

**Setup Time:** ~5 minutes (manual) or ~1 minute (automated)

All files are production-ready!
