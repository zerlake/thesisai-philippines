# Getting Started

Complete guide to setting up and developing ThesisAI locally.

## Prerequisites

- **Node.js:** 18.17+
- **pnpm:** 8.0+ (or npm/yarn)
- **Git:** Latest version
- **PostgreSQL:** 13+ (for local Supabase)
- **Docker:** Optional (for Supabase)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/zerlake/thesisai-philippines.git
cd thesisai-philippines
```

### 2. Install Dependencies

```bash
pnpm install
# or: npm install
# or: yarn install
```

### 3. Environment Setup

Create `.env.local` file:

```bash
cp .env.example .env.local  # if example exists
# OR create manually:
```

**.env.local** should include:

```env
# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>

# Puter AI Integration
NEXT_PUBLIC_PUTER_API_URL=<puter-api-endpoint>
PUTER_API_KEY=<your-puter-key>

# Email Service (if needed)
RESEND_API_KEY=<your-resend-key>

# Optional: Analytics
NEXT_PUBLIC_GA_ID=<google-analytics-id>
```

### 4. Database Setup

#### Option A: Local Supabase (Docker)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase migration up

# Link to remote (optional)
supabase link --project-ref <project-id>
```

#### Option B: Remote Supabase

```bash
# Use cloud instance
# Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

# Apply migrations
supabase migration up
```

### 5. Verify Setup

```bash
# Check Node version
node --version      # Should be 18.17+

# Check pnpm version
pnpm --version      # Should be 8.0+

# Test environment
pnpm build          # Should compile without errors
```

## Development Server

### Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

**Development server features:**
- Hot module reloading (HMR)
- Auto-save on file changes
- Error overlay in browser
- TypeScript checking

### File Watching

The development server automatically reloads when you modify:
- React components (`.tsx`, `.jsx`)
- Styles (`.css`, `.ts` with CSS)
- Configuration files (`.env.local`)

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── (auth)/          # Auth routes
│   ├── (dashboard)/     # Dashboard routes
│   └── api/             # API routes
│
├── components/          # React components
│   ├── ui/              # Radix UI wrappers
│   ├── features/        # Feature components
│   └── common/          # Shared components
│
├── lib/                 # Utilities & integrations
│   ├── supabase.ts      # Supabase client
│   ├── mcp/             # MCP integration
│   ├── cdn/             # CDN utilities
│   └── utils.ts         # Helper functions
│
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication
│   ├── ThemeContext.tsx # Dark/Light mode
│   └── AppContext.tsx   # Global app state
│
└── __tests__/           # Test files

docs/
├── getting-started/     # Setup guides (you are here)
├── features/            # Feature documentation
├── implementation/      # Implementation details
└── wiki/                # Code wiki

supabase/
├── migrations/          # Database schema
└── functions/           # Edge functions
```

## Common Commands

### Development

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # ESLint check
pnpm type-check       # TypeScript check
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:ui          # Vitest UI
pnpm test:coverage    # Coverage report
pnpm test path/to/test.ts  # Single test file
```

### Database

```bash
supabase migration up              # Apply migrations
supabase migration new <name>      # Create migration
supabase db push                   # Push schema changes
supabase migration list            # View status
```

### Formatting & Cleanup

```bash
pnpm format           # Format code
pnpm clean-imports    # Remove unused imports
```

## Verification Steps

After setup, verify everything works:

### 1. Code Compiles

```bash
pnpm build
# Should complete without errors
```

### 2. Tests Pass

```bash
pnpm test
# All tests should pass
```

### 3. Linting Passes

```bash
pnpm lint
# Should have no critical errors
```

### 4. Server Starts

```bash
pnpm dev
# Should start on port 3000 with no errors
```

### 5. Database Connected

```bash
# In browser, log in and verify:
# - User profile loads
# - Dashboard shows data
# - Queries execute without errors
```

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public auth key | `eyJxxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key | `eyJxxx...` |
| `NEXT_PUBLIC_PUTER_API_URL` | Puter API endpoint | `https://api.puter.com` |
| `PUTER_API_KEY` | Puter authentication | `xxxxx` |
| `RESEND_API_KEY` | Email service (optional) | `re_xxx` |

## Troubleshooting Setup

### Port 3000 Already in Use

```bash
# Kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Won't Install

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Fails

```bash
# Check TypeScript errors
pnpm type-check

# View full error
pnpm build --verbose

# Clear Next.js cache
rm -rf .next
pnpm build
```

### Database Connection Failed

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test Supabase connection
supabase status

# Restart local Supabase
supabase stop
supabase start
```

### Hot Reload Not Working

```bash
# Check file watcher limits (Linux)
cat /proc/sys/fs/inotify/max_user_watches

# Increase if needed
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Next Steps

After successful setup:

1. **Understand Architecture** → Read [Architecture Overview](./Architecture-Overview)
2. **Learn Code Standards** → Review [Code Standards](./Code-Standards)
3. **Find Your Task** → Check [Feature Implementation](./Feature-Implementation)
4. **Contribute** → Follow [Contributing](./Contributing) workflow

## IDE Setup

### VS Code (Recommended)

**Extensions:**
```json
{
  "ms-vscode.vscode-typescript-next": "latest",
  "dbaeumer.vscode-eslint": "latest",
  "esbenp.prettier-vscode": "latest",
  "bradlc.vscode-tailwindcss": "latest",
  "supabase.supabase-js": "latest"
}
```

**settings.json:**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm/IntelliJ

- Enable ESLint inspection
- Enable TypeScript language service
- Configure Tailwind CSS plugin
- Set Node interpreter to local version

## Getting Help

**Setup issues?**
- Check [Troubleshooting](./Troubleshooting) page
- Review `.env.local` configuration
- Check database connection
- Verify Node/pnpm versions

**Still stuck?**
- Search `/docs/` directory
- Check wiki pages
- Review error messages carefully
- Ask for help in team channel

---

**Next:** [Architecture Overview](./Architecture-Overview)

**Last Updated:** December 2024
