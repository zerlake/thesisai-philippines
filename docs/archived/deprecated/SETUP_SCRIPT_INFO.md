# Setup Script Information

## Setup Options

The MCP integration includes 3 setup scripts for different platforms:

### 1. **Node.js Script** (Recommended - Cross-Platform)
```bash
npm run setup:mcp
```
- ✅ Works on Windows, macOS, Linux
- ✅ Uses Node.js (no PowerShell needed)
- ✅ Creates directories and environment file
- File: `scripts/setup-mcp-simple.js`

### 2. **PowerShell Script** (Windows)
```powershell
.\scripts\setup-mcp.ps1
```
- ✅ Full-featured setup
- ✅ Health checks for Puter.js
- ⚠️ Windows only
- File: `scripts/setup-mcp.ps1`

### 3. **Bash Script** (macOS/Linux)
```bash
bash scripts/setup-mcp.sh
```
- ✅ Full-featured setup
- ✅ Cross-platform compatible
- ⚠️ Not native Windows
- File: `scripts/setup-mcp.sh`

## Recommended Setup Flow

### For Everyone:
```bash
npm run setup:mcp
```

This uses the Node.js script which works everywhere.

### If npm Script Doesn't Work:

Follow the [Manual Setup Guide](./MCP_MANUAL_SETUP.md) - takes 5 minutes:

```bash
# 1. Install dependencies
pnpm install

# 2. Create directories
mkdir -p src/lib/mcp src/hooks src/components/mcp

# 3. Create .env.local
echo 'PUTER_LOCAL_ENDPOINT=http://localhost:8000' >> .env.local
echo 'SERENA_URL=http://localhost:3000' >> .env.local

# 4. Done! Start developing
npm run dev
```

## What Each Script Does

### Node.js Script (setup-mcp-simple.js)
- ✓ Installs dependencies via pnpm
- ✓ Creates required directories
- ✓ Creates/updates .env.local
- ✓ Creates amp.json if missing
- ✓ Displays success message

**Time:** ~30 seconds - 2 minutes (depending on dependencies)

### PowerShell Script (setup-mcp.ps1)
- ✓ All features of Node.js script
- ✓ Checks for uvx installation
- ✓ Installs uv via Python pip
- ✓ Tests Puter.js endpoint connectivity
- ✓ Checks TypeScript configuration

**Time:** ~1-5 minutes (includes checks and installs)

### Bash Script (setup-mcp.sh)
- ✓ All features of Node.js script
- ✓ Tests endpoints with curl (if available)
- ✓ Cross-platform compatible

**Time:** ~1-2 minutes

## Manual Setup Checklist

If you prefer to do it manually or scripts fail:

- [ ] Run `pnpm install`
- [ ] Create `src/lib/mcp/` directory
- [ ] Create `src/hooks/` directory
- [ ] Create `src/components/mcp/` directory
- [ ] Create `.checkpoints/` directory
- [ ] Create `.env.local` with:
  - `PUTER_LOCAL_ENDPOINT=http://localhost:8000`
  - `SERENA_URL=http://localhost:3000`
- [ ] Verify `amp.json` exists
- [ ] Verify `puter.config.ts` exists
- [ ] Run `npm run test:mcp` to verify

**Total time:** ~5 minutes

## Troubleshooting

### Issue: "Command not found: npm"
**Solution:** Install Node.js from https://nodejs.org

### Issue: "Command not found: pnpm"
**Solution:** Install pnpm: `npm install -g pnpm`

### Issue: Script execution error on Windows
**Solution:** Use manual setup guide instead, or run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-mcp.ps1
```

### Issue: File already exists errors
**Solution:** This is normal! Scripts skip existing files.

### Issue: .env.local not created
**Solution:** Create manually:
```
Windows: Create file in editor or: type nul > .env.local
macOS/Linux: touch .env.local
```

### Issue: pnpm not found
**Solution:** Use npm instead:
```bash
npm install
# instead of
pnpm install
```

## Configuration Files

After setup, verify these files exist:

### amp.json (13 lines)
- AMP CLI configuration
- Serena MCP server definition
- Should be in project root

### puter.config.ts (25 lines)
- Puter.js runtime configuration
- Model definitions
- Should be in project root

### .env.local (2 lines)
- Environment variables
- PUTER_LOCAL_ENDPOINT
- SERENA_URL
- Created during setup

## Next Steps After Setup

```bash
# 1. Start development server
npm run dev

# 2. Test MCP integration
npm run test:mcp

# 3. Read quick start guide
cat MCP_QUICKSTART.md

# 4. Try example component
# See src/components/mcp/ExampleMCPComponent.tsx

# 5. Build your features!
```

## Support

If you encounter issues:

1. Check [MCP_MANUAL_SETUP.md](./MCP_MANUAL_SETUP.md)
2. Review [MCP_QUICKSTART.md](./MCP_QUICKSTART.md)
3. See [SERENA_MCP_INTEGRATION.md](./SERENA_MCP_INTEGRATION.md) for troubleshooting

---

**Status:** All setup options are available and tested

Choose one:
- **Easy:** `npm run setup:mcp`
- **Manual:** Follow [MCP_MANUAL_SETUP.md](./MCP_MANUAL_SETUP.md)
- **Detailed:** See [SERENA_MCP_INTEGRATION.md](./SERENA_MCP_INTEGRATION.md)
