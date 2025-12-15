# ThesisAI Code Wiki

**Central knowledge base for the ThesisAI project** - Architecture, implementation details, patterns, and decision logs.

## Quick Navigation

- **[Getting Started](./Getting-Started)** - Setup, development, first time contributor guide
- **[Architecture Overview](./Architecture-Overview)** - System design, data flow, components
- **[Technology Stack](./Technology-Stack)** - Libraries, frameworks, and tools
- **[API Reference](./API-Reference)** - All API endpoints and usage
- **[Database Schema](./Database-Schema)** - Data models and migrations
- **[UI Components](./UI-Components)** - Component library and patterns
- **[Integration Guides](./Integration-Guides)** - Puter, MCP, Supabase, external services
- **[Feature Implementation](./Feature-Implementation)** - How to add new features
- **[Testing Guide](./Testing-Guide)** - Testing strategies and examples
- **[Deployment Guide](./Deployment-Guide)** - Production deployment process
- **[Troubleshooting](./Troubleshooting)** - Common issues and solutions
- **[Code Standards](./Code-Standards)** - Conventions, patterns, best practices
- **[Contributing](./Contributing)** - Development workflow, PRs, reviews
- **[Decision Log](./Decision-Log)** - Architecture decisions and rationale
- **[Performance Guide](./Performance-Guide)** - Optimization and monitoring
- **[Security](./Security)** - Security practices and considerations

---

## Project Overview

**ThesisAI** is an intelligent thesis writing assistant platform that helps students:
- Generate research topics with AI
- Identify research gaps in existing literature
- Get AI-powered feedback and suggestions
- Collaborate with advisors
- Track thesis progress through 5 phases
- Generate presentation decks and defense materials

### Tech Stack at a Glance

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| AI/ML | Puter SDK, Model Context Protocol (MCP), arXiv integration |
| DevOps | Docker, GitHub Actions, Vercel |
| Database | PostgreSQL with migrations |
| Testing | Vitest, @testing-library/react |

---

## Key Statistics

- **Language:** TypeScript (strict mode)
- **Framework:** Next.js 16 (app directory)
- **Features:** 20+ major features implemented
- **Implementation Phases:** 5 completed
- **Documentation:** 575+ markdown files
- **Test Coverage:** Comprehensive (Vitest)

---

## Core Concepts

### Thesis Phases
The platform structures thesis work into 5 distinct phases:
1. **Phase 1:** Topic Discovery & Research
2. **Phase 2:** Literature Review & Gap Analysis
3. **Phase 3:** Research Methodology
4. **Phase 4:** Analysis & Findings
5. **Phase 5:** Conclusions & Defense

### Key Features

**AI-Powered Tools**
- Grammar checking with Puter AI
- Paraphrasing engine
- Topic suggestion
- Research gap identification
- Title generation
- Defense presentation coach

**Collaboration**
- Advisor feedback system
- Real-time messaging
- Customized suggestions
- Email notifications
- Author network visualization

**Tracking & Analytics**
- Thesis progress tracking
- Research validity assessment
- Performance metrics
- Lighthouse audits

---

## Development Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

For detailed setup, see [Getting Started](./Getting-Started).

---

## Important Files & Directories

```
src/
├── app/              # Next.js routes (pages, layouts)
├── components/       # React components (Radix UI + Tailwind)
├── lib/              # Utilities, MCP integration, CDN
├── contexts/         # React contexts (auth, theme)
├── api/              # API route handlers
└── __tests__/        # Test files

supabase/
├── migrations/       # Database schema migrations
└── functions/        # Edge functions

docs/
├── getting-started/  # Setup guides
├── features/         # Feature documentation
├── implementation/   # Implementation details
└── wiki/             # This knowledge base
```

---

## Essential Documents

**Start with these:**
1. [Getting Started](./Getting-Started) - Development setup
2. [Architecture Overview](./Architecture-Overview) - System design
3. [Code Standards](./Code-Standards) - Development conventions
4. [Contributing](./Contributing) - How to contribute

**For specific topics:**
- Adding a feature? → [Feature Implementation](./Feature-Implementation)
- Debugging? → [Troubleshooting](./Troubleshooting)
- Deploying? → [Deployment Guide](./Deployment-Guide)
- Testing? → [Testing Guide](./Testing-Guide)

---

## Development Workflow

1. **Create branch** - `git checkout -b feature/your-feature`
2. **Make changes** - Follow code standards
3. **Test locally** - `pnpm test`
4. **Build check** - `pnpm build`
5. **Commit** - Clear, descriptive messages
6. **Push & PR** - Create pull request with details
7. **Review** - Address feedback
8. **Merge** - Squash and merge to main

See [Contributing](./Contributing) for details.

---

## External Resources

- **[Next.js Docs](https://nextjs.org/docs)**
- **[React Docs](https://react.dev)**
- **[Tailwind CSS](https://tailwindcss.com)**
- **[Radix UI](https://radix-ui.com)**
- **[Supabase Docs](https://supabase.com/docs)**
- **[Puter SDK](https://docs.puter.com)**

---

## Getting Help

**Can't find an answer?**
1. Check [Troubleshooting](./Troubleshooting)
2. Search this wiki
3. Check `/docs/` directory
4. Ask in team discussions

**Found a bug or issue?**
1. Document the issue clearly
2. Check if it's already reported
3. Create an issue with reproduction steps
4. Reference relevant code/docs

---

## Wiki Navigation

**All wiki pages:**
- Main: [Home](./Home) (this page)
- Fundamentals: [Getting Started](./Getting-Started), [Architecture](./Architecture-Overview)
- Development: [Code Standards](./Code-Standards), [Feature Implementation](./Feature-Implementation)
- Operations: [Deployment](./Deployment-Guide), [Troubleshooting](./Troubleshooting)
- Management: [Decision Log](./Decision-Log), [Contributing](./Contributing)

---

## Recent Updates

- ✅ Wiki structure created
- ✅ Core pages initialized
- ✅ Architecture documented
- ✅ Integration guides added
- ✅ API reference started

---

**Last Updated:** December 2024

**Wiki Status:** In Active Development

**Questions?** Check [Troubleshooting](./Troubleshooting) or review related sections.
