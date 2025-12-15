# Documentation Index

Welcome to the ThesisAI documentation hub. All documentation has been organized into logical categories for easy navigation.

## Quick Navigation

- **[Wiki](./wiki/)** - 📚 Code wiki: Architecture, patterns, guides (START HERE)
- **[Getting Started](./getting-started/)** - Setup, build, and deployment guides
- **[Features](./features/)** - Feature-specific documentation by category
- **[Implementation](./implementation/)** - Phase-based implementation docs and session summaries
- **[Bug Fixes](./bug-fixes/)** - Completed bug fixes and resolution guides
- **[Performance](./performance/)** - Lighthouse audits and optimization guides
- **[Accessibility](./accessibility/)** - Accessibility improvements and audit reports
- **[Frontend](./frontend/)** - Landing page, components, and editor documentation
- **[Backend](./backend/)** - API routes, database migrations, and integrations
- **[Deployment](./deployment/)** - CDN configuration and deployment checklists
- **[Error Handling](./error-handling/)** - Error handling patterns and fixes
- **[Testing](./testing/)** - Test guides and integration test suites
- **[Migration Guides](./migration-guides/)** - Migration documentation and guides
- **[Personalization](./personalization/)** - User preferences and personalization system
- **[Premium Features](./premium-features/)** - Enterprise and premium feature docs
- **[Reference](./reference/)** - Quick reference cards and guidelines
- **[Archived](./archived/)** - Deprecated and historical documentation
- **[Reports & Logs](./reports-logs/)** - Build logs, performance reports, Lighthouse audits

## Wiki Sections

The **[Code Wiki](./wiki/)** contains:
- **[Home](./wiki/Home)** - Wiki overview
- **[Getting Started](./wiki/Getting-Started)** - Development setup
- **[Architecture Overview](./wiki/Architecture-Overview)** - System design
- **[Code Standards](./wiki/Code-Standards)** - Development conventions
- Plus 13+ additional pages on features, testing, deployment, and more

## Key Files (Root Level)

- **AGENTS.md** - Development guidelines and commands (not moved to preserve root access)
- **README.md** - Main project README

---

## Documentation Organization

### By Category

#### Features (/features/)
- **ai-tools/** - Puter AI, Grammar Check, MCP, Paper Search integration
- **dashboard/** - Dashboard features and notifications
- **messaging/** - Real-time messaging and email notifications
- **advisor/** - Advisor dashboard and critic features
- **thesis-phases/** - Thesis phase implementation and research gap identifier
- **other-features/** - Validity Defender, Defense PPT, Author Network, Topic Generator

#### Implementation (/implementation/)
- **completed/** - Completion status reports and final deliverables
- **phases/** - Phase 1-5 implementation documentation
- **sessions/** - Session summaries and deliverables

#### Bug Fixes (/bug-fixes/)
- **completed/** - All resolved issues organized by category
  - AUTH fixes
  - DASHBOARD fixes
  - INFINITE_LOADING fixes
  - And more...

#### Development (/frontend/, /backend/)
- **frontend/landing-page/** - Landing page design and optimization
- **frontend/components/** - Component implementation guides
- **frontend/editor/** - Editor interface and grammar check UI
- **backend/api/** - Direct API documentation
- **backend/database/** - Database migrations and schemas
- **backend/integrations/** - Puter, MCP, and Serena integrations

#### Reports & Data (/reports-logs/)
- **Build logs** - Build process outputs and errors
- **Lighthouse audits** - Performance, accessibility, and best practices reports
- **Performance analysis** - JSON metrics and summaries
- **Session reports** - Session completion summaries
- **Error logs** - TypeScript, linting, and build errors

---

## File Counts

- **Total .md files organized:** 575
- **Total .txt files organized:** 72
- **Total .json files (reports):** 17
- **Configuration .json files (kept in root):** 6 (package.json, tsconfig.json, etc.)
- **Files kept in root:** 2 (AGENTS.md, README.md)
- **Directories created:** 30+
- **Major categories:** 17

---

## How to Use This Documentation

1. **Start here first:** Check [Getting Started](./getting-started/) for setup and build instructions
2. **Looking for a feature?** Browse [Features](./features/) by product area
3. **Debugging an issue?** Check [Bug Fixes](./bug-fixes/completed/) for solutions
4. **Need reference?** See [Reference](./reference/) for quick guides
5. **Reviewing implementation?** [Implementation](./implementation/) has phase-by-phase details

---

## Recent Documentation Structure

All files (`.md`, `.txt`, `.json` reports) have been organized from the cluttered root directory into a hierarchical structure. This improves:

✅ **Navigation** - Find docs by feature/layer/function
✅ **Discoverability** - Self-documenting folder names
✅ **Scalability** - Easy to add new documentation
✅ **Maintenance** - Clear organization reduces duplication
✅ **History** - Old docs and logs archived but preserved
✅ **Configuration Safety** - Essential config files (.json) remain in root

---

## Configuration Files (Root Only)

These critical configuration files remain in the root directory and should NOT be moved:

- `package.json` - npm dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `components.json` - UI component registry
- `mcp-servers-config.json` - MCP server configuration
- `amp.json` - Amp tool configuration

---

Last updated: December 2024
