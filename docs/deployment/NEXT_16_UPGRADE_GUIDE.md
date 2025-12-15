# Next.js 15 to 16 Upgrade Guide

## Overview
This guide walks you through upgrading your Next.js app from v15 to v16 safely with rollback options.

## Pre-Upgrade Safety

### Option 1: Create a Git Branch (Recommended)
```bash
git checkout -b upgrade/next-16
```
This keeps your main branch untouched. If anything breaks, switch back:
```bash
git checkout main
```

### Option 2: Direct Upgrade with Rollback Ready
If upgrading on main, ensure you can rollback with:
```bash
git reset --hard HEAD
```
This reverts all changes to the last commit. Use only if upgrade fails.

## Step-by-Step Upgrade

### 1. Clear Next.js Cache
Before starting, remove the build cache:
```powershell
rm -r ".\.next\cache" -Force
```

### 2. Check Next.js 16 Breaking Changes
Review the official migration guide:
- https://nextjs.org/docs/upgrading/version-16

### 3. Run the Codemod
Next.js provides automated fixes for most changes:
```bash
npx @next/codemod@latest upgrade next
```
This handles:
- API deprecations
- Import statement changes
- Server/Client component migrations
- Middleware updates

### 4. Update Dependencies
Edit `package.json` and change:
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

Then install:
```bash
pnpm install
```

### 5. Build and Test
```bash
pnpm build
```
Watch for errors and warnings. Common issues:
- TypeScript type errors
- Middleware configuration changes
- Dynamic import patterns
- API route structure changes

### 6. Run Dev Server
```bash
pnpm dev
```
Test critical flows:
- Authentication/Login
- Navigation between pages
- API calls
- Real-time features
- File uploads

## If Something Breaks

### Rollback Everything
```bash
git reset --hard HEAD
```
This undoes all changes to the last commit.

### Rollback Specific Files
```bash
git restore <file-path>
```

### See What Changed
```bash
git diff
```

## Checking for Breaking Changes Manually

If codemod misses something, check:

1. **App Router vs Pages Router** - Next.js 16 deprecates Pages Router further
2. **Middleware** - File location and exports changed
3. **Dynamic Routes** - Syntax changes
4. **Environment Variables** - Prefix requirements
5. **Server Components** - Default behavior changes
6. **API Routes** - `/pages/api` → `/app/api`

## Recommended Testing Checklist

- [ ] Build succeeds (`pnpm build`)
- [ ] Dev server starts (`pnpm dev`)
- [ ] Login/authentication works
- [ ] Main pages load without errors
- [ ] Navigation works
- [ ] API requests work
- [ ] Real-time features work (if any)
- [ ] No console errors
- [ ] No TypeScript errors

## Cleanup

Once everything works:

```bash
# If on upgrade branch, merge back
git checkout main
git merge upgrade/next-16

# Delete the branch
git branch -d upgrade/next-16
```

## Emergency Rollback Command
If you need to quickly undo and start over:
```bash
git reset --hard HEAD~1
rm -r node_modules pnpm-lock.yaml
pnpm install
```

## Resources
- Next.js 16 Docs: https://nextjs.org/docs
- Migration Guide: https://nextjs.org/docs/upgrading/version-16
- Breaking Changes: https://nextjs.org/docs/upgrading/version-16-migration-guide
