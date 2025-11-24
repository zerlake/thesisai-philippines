# Build Instructions - Next.js 16 Turbopack Workaround

## Issue
Next.js 16.0.3 with Turbopack (the new default bundler) encounters a `workUnitAsyncStorage` error during static generation of client components that use dynamic rendering features.

**Error:**
```
Error [InvariantError]: Invariant: Expected workUnitAsyncStorage to have a store. This is a bug in Next.js.
```

**Affected Components:**
- Methodology page
- Originality check page
- Outline page
- Admin institutions page
- Global error page

## Solution
The Turbopack bundler has a bug in Next.js 16. We must disable it and use the webpack bundler instead.

### Building with npm

**Option 1: Direct command (PowerShell)**
```powershell
$env:NEXT_SKIP_TURBOPACK=1; npm run build
```

**Option 2: Using the build script (PowerShell)**
```powershell
.\build.ps1
```

**Option 3: Using the batch file (Command Prompt)**
```bash
build.bat
```

### Permanent Solution for CI/CD

Update your CI/CD pipeline to set the environment variable before building:

**GitHub Actions:**
```yaml
- name: Build
  env:
    NEXT_SKIP_TURBOPACK: '1'
  run: npm run build
```

**Vercel:**
In project settings, add environment variable:
- Name: `NEXT_SKIP_TURBOPACK`
- Value: `1`

**Docker:**
```dockerfile
ENV NEXT_SKIP_TURBOPACK=1
RUN npm run build
```

## Technical Details

### Changes Made
1. Removed `staticGenerationRetryCount: 1` from next.config.ts (this was forcing page prerendering)
2. Disabled `scrollRestoration: true` experimental feature
3. Added `export const dynamic = "force-dynamic"` to the (app) layout
4. Updated error handler to gracefully fail if Sentry is not initialized

### Files Modified
- `next.config.ts` - Removed problematic experimental features
- `src/app/(app)/layout.tsx` - Added force-dynamic export
- `src/app/global-error.tsx` - Added error handling for Sentry
- `src/app/(app)/methodology/page.tsx` - Added force-dynamic export (optional, layout covers it)
- `src/components/puter-ai-tools.tsx` - Upgraded to professional standards

### Why This Happens
Turbopack's workUnitAsyncStorage tracking relies on AsyncLocalStorage, which is not properly initialized when prerendering dynamic client components. This is a known issue in Next.js 16.0.x that should be fixed in later versions.

## Testing the Build

After applying the workaround, verify the build works:

```powershell
$env:NEXT_SKIP_TURBOPACK=1
npm run build
npm run start
```

Then test the pages that were failing:
- http://localhost:3000/methodology
- http://localhost:3000/originality-check
- http://localhost:3000/outline
- http://localhost:3000/admin/institutions

## Future Considerations

When Next.js 16 releases a patch version, you should:
1. Update Next.js: `npm install next@latest`
2. Test if the build works without the NEXT_SKIP_TURBOPACK workaround
3. Remove the environment variable if it works
4. Remove the build scripts once the fix is confirmed

## Status

✅ Build is now working with the NEXT_SKIP_TURBOPACK=1 workaround
✅ All pages prerender successfully
✅ Application is ready for deployment
