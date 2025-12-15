# Getting Started

Quick start guides for setting up and running the ThesisAI application.

## Essential Files

1. **HOW_TO_RUN_EVERYTHING.md** - Comprehensive guide for running all aspects of the project
2. **BUILD_INSTRUCTIONS.md** - Build process and compilation steps
3. **DEPLOYMENT_VERIFICATION.md** - Verification checklist for deployments
4. **START_HERE.md** - Quick start orientation

## Key Commands

### Development
```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm lint          # ESLint check
pnpm test          # Run all tests
```

### Database
```bash
supabase migration up       # Apply migrations
supabase migration new name # Create new migration
```

### MCP Servers (if using)
```bash
python -m arxiv_mcp_server  # Run arXiv MCP server
```

## Setup Overview

1. Install dependencies: `pnpm install`
2. Configure environment variables (check `.env` file)
3. Apply database migrations: `supabase migration up`
4. Start development server: `pnpm dev`
5. Access application at `http://localhost:3000`

## Next Steps

After setup, explore:
- Feature documentation in `/docs/features/`
- Backend setup in `/docs/backend/`
- Frontend customization in `/docs/frontend/`
