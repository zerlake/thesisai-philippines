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