# Reference Documentation

Quick reference guides, guidelines, and important development information.

## Key Reference Files

### Development Guidelines
- **AGENTS.md** - Development commands, testing, and project structure (symlinked from root)
- **AI_RULES.md** - AI integration rules and patterns
- **DOCUMENTATION_ORGANIZATION_PLAN.md** - This documentation structure

### Guides & References
- **QUICK_REFERENCE_*.md** - Quick reference cards
- ***_QUICK_REFERENCE.md** - Feature-specific quick references

## Development Commands

### Main Project
```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm lint          # ESLint check
pnpm test          # Run tests
pnpm test:ui       # Vitest with UI
pnpm test:coverage # Coverage report
```

### Database
```bash
supabase migration up              # Apply migrations
supabase migration new <name>      # Create migration
supabase migration list            # View status
```

### MCP Server (Python subproject)
```bash
uv venv && source .venv/bin/activate
uv pip install -e ".[test]"
python -m pytest
python -m arxiv_mcp_server
```

## Project Structure

```
src/
├── app/          # Next.js app directory
├── api/          # API routes
├── components/   # React components
├── lib/          # Utilities & MCP integration
├── contexts/     # Context providers
supabase/
├── migrations/   # Database schemas
├── functions/    # Supabase Edge Functions
docs/             # This documentation
```

## Quick Links

- **Getting Started:** See `/docs/getting-started/`
- **Features:** See `/docs/features/`
- **Bug Fixes:** See `/docs/bug-fixes/completed/`
- **Implementation Status:** See `/docs/implementation/completed/`
- **Performance Metrics:** See `/docs/performance/`

## Key Technologies

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Supabase PostgreSQL, Edge Functions
- **AI Integration:** Puter SDK, MCP (Model Context Protocol)
- **Testing:** Vitest, @testing-library/react
- **Database:** PostgreSQL with migrations

## Important Notes

1. **TypeScript:** Strict mode enabled - use proper types
2. **Imports:** Alphabetical order, grouped by type
3. **Naming:** PascalCase for components, camelCase for functions
4. **Error Handling:** Try-catch in async functions
5. **Styling:** Tailwind CSS + Radix UI components

---

For detailed information on any topic, navigate to the appropriate documentation folder.
