# AGENTS.md

Guidance for agentic coding tools working on this codebase.

## Build & Test Commands

**Main Next.js project:**
```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm lint          # ESLint check
pnpm test          # Run all Vitest tests
pnpm test:ui       # Vitest with UI
pnpm test:coverage # Coverage report
```

**Single test files:**
```bash
pnpm exec vitest src/__tests__/path/to/test.test.ts
```

**Database Migrations:**
```bash
# Apply all pending migrations
supabase migration up

# Create new migration
supabase migration new <migration_name>

# View migration status
supabase migration list
```

**Cleanup & Verification:**
```bash
# Verify function usage (before cleanup)
grep -r "functions.invoke" src/ | grep -o "'[^']*'" | sort -u

# List Supabase functions
dir supabase\functions /B
```

**Validity Defender Feature:**
```bash
# After implementing Validity Defender feature:
# 1. Apply migration
supabase migration up

# 2. Test endpoints
curl -X POST http://localhost:3000/api/instruments/validate \
  -H "Content-Type: application/json" \
  -d '{"thesisId": "uuid", "instrumentName": "Survey", ...}'

# 3. Run tests
pnpm exec vitest src/__tests__/validity-defender/

# 4. Access UI at
# /thesis-phases/chapter-3/validity-defender
```

**MCP server subproject** (Python, `web-app/arxiv-mcp-server/`):
```bash
uv venv && source .venv/bin/activate
uv pip install -e ".[test]"
python -m pytest                    # All tests
python -m pytest tests/tools/test_search.py  # Single file
python -m arxiv_mcp_server         # Run server
```

## Architecture & Structure

**Main project**: Next.js 16 frontend with TypeScript, Supabase auth, and Puter.js AI integration.

**Key directories:**
- `src/` - Main application code (components, pages, API routes, hooks, utilities)
- `src/app/` - Next.js app directory (pages and layouts)
- `src/api/` - API route handlers
- `src/components/` - React components (Radix UI + Tailwind)
- `src/lib/` - Shared utilities, MCP integration, CDN metrics
- `src/contexts/` - React context providers (auth, theme, etc.)
- `web-app/arxiv-mcp-server/` - Python MCP server for arXiv integration (separate project with its own CLAUDE.md)

**Database**: Supabase PostgreSQL (schema in `supabase/migrations/`)

**Key integrations**: Puter AI SDK, Supabase Auth, Recharts, TipTap editor, PDF.js

## Code Style & Conventions

**TypeScript**: Strict mode enabled. Use proper types, avoid `any`. Path alias: `@/*` maps to `src/`.

**Imports**: Alphabetical order, group by: React → external libs → relative paths. Remove unused imports (`unused-imports` ESLint plugin enforces this).

**Naming**: PascalCase for components/types, camelCase for functions/variables. Prefix private/unused params with `_`.

**React**: Functional components, hooks pattern. Use `use` prefix for custom hooks.

**Error handling**: Try-catch blocks in async functions. Return structured error responses with proper HTTP status codes in API routes.

**Formatting**: Next.js ESLint config with `eslint-config-next`. Tailwind + PostCSS for styling.

**UI Components**: Radix UI primitives + Tailwind classes. Follow existing component patterns in `src/components/`.

**Testing**: Vitest + @testing-library/react. Test files co-locate with source or in `src/__tests__/`.

## CI/CD Pipeline

**GitHub Actions Workflows:**
```bash
# View all workflows
# https://github.com/zerlake/thesisai-philippines/actions

# Main CI workflows:
# ci-tests.yml              - Unit & integration tests (on push/PR)
# lint-code.yml             - ESLint & TypeScript (on code changes)
# e2e-tests.yml             - Critical path E2E tests
# performance-tests.yml     - Lighthouse audits & bundle analysis
# pr-checks.yml             - PR validation & coverage
# scheduled-tests.yml       - Nightly tests & maintenance
# deployment.yml            - Build artifacts & security scan
```

**CI/CD Local Pre-flight Check:**
```bash
# Before pushing changes, run:
pnpm lint                                # ESLint
pnpm exec tsc --noEmit                   # TypeScript
pnpm test -- --run                       # Tests
pnpm build                               # Build verification

# Or in one command:
pnpm lint && pnpm exec tsc --noEmit && pnpm test -- --run && pnpm build
```

**Performance & Coverage:**
```bash
pnpm test:coverage -- --run              # Generate coverage report
# Coverage targets: Lines >80%, Branches >75%, Functions >80%
```

**Documentation:**
- [CI/CD Setup Guide](./CI_CD_SETUP_GUIDE.md) - Comprehensive documentation
- [CI/CD Quick Reference](./CI_CD_QUICK_REFERENCE.md) - Quick lookup