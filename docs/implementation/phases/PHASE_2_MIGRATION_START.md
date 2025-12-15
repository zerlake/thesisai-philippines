# Phase 2: Component Migration - Getting Started

## Overview
Migrate the 5 high-priority components from old `usePuterTool` / direct Puter calls to new unified `useAITool` interface.

**Time Required**: 4-6 hours total  
**Components**: 5 high-priority  
**Status**: Ready to start

---

## High-Priority Components (Ordered by Complexity)

### 1. puter-tool-example.tsx ✨ START HERE (Easiest)
**Location**: `src/components/puter-tool-example.tsx`  
**Current Usage**: Already uses `usePuterTool` and `usePuterToolsBatch`  
**Migration**: Rename imports, update hook names  
**Time**: 15 minutes

**Changes:**
```tsx
// Before
import { usePuterTool } from '@/hooks/usePuterTool';
import { usePuterToolsBatch } from '@/hooks/usePuterTool';

// After
import { useAITool, useAIToolsBatch } from '@/hooks/useAITool';
```

**Status**: ⏳ TODO

---

### 2. puter-ai-tools.tsx (Medium)
**Location**: `src/components/puter-ai-tools.tsx`  
**Current Usage**: Calls `callPuterAIWithRetry()` directly  
**Migration**: Replace with `useAITool()` hook  
**Time**: 45 minutes - 1 hour

**Key Functions to Replace**:
- `handleImproveText()` → Use `useAITool('improve-writing', ...)`
- `handleSummarizeText()` → Use `useAITool('summarize-text', ...)`
- `handleRewriteText()` → Use `useAITool('improve-writing', ...)`

**Status**: ⏳ TODO

---

### 3. paraphrasing-tool.tsx (Medium)
**Location**: `src/components/paraphrasing-tool.tsx`  
**Current Usage**: Calls `window.puter.ai.chat()` directly  
**Migration**: Replace with `useAITool('paraphrase-text', ...)`  
**Time**: 45 minutes

**Status**: ⏳ TODO

---

### 4. outline-generator.tsx (Medium-Hard)
**Location**: `src/components/outline-generator.tsx`  
**Current Usage**: Likely uses Supabase function invoke  
**Migration**: Use `useAITool('generate-outline', ...)`  
**Time**: 1 hour

**Status**: ⏳ TODO

---

### 5. editor.tsx (Hard)
**Location**: `src/components/editor.tsx`  
**Current Usage**: Imports `PuterAITools` component  
**Migration**: Update imported component + ensure AI tools work  
**Time**: 1.5 hours

**Status**: ⏳ TODO

---

## Migration Checklist

### Pre-Migration Setup
- [ ] Read `PUTER_GLOBAL_AI_QUICK_START.md`
- [ ] Read `PUTER_AI_MIGRATION_GUIDE.md`
- [ ] Understand `useAITool` hook from `src/hooks/useAITool.ts`

### Component 1: puter-tool-example.tsx
- [ ] Open file in editor
- [ ] Update imports (3 lines)
- [ ] Update hook names (2-3 lines)
- [ ] Test component
- [ ] Run tests: `npm run test -- puter-tool-example`
- [ ] Commit changes

### Component 2: puter-ai-tools.tsx
- [ ] Open file in editor
- [ ] Understand current implementation
- [ ] Replace `callPuterAIWithRetry` with `useAITool` hook
- [ ] Update error handling
- [ ] Update loading states
- [ ] Add fallback display (optional)
- [ ] Test all three functions (improve, summarize, rewrite)
- [ ] Run tests
- [ ] Commit changes

### Component 3: paraphrasing-tool.tsx
- [ ] Open file in editor
- [ ] Replace `window.puter.ai.chat()` call
- [ ] Use `useAITool('paraphrase-text', ...)`
- [ ] Update loading/error states
- [ ] Test component
- [ ] Run tests
- [ ] Commit changes

### Component 4: outline-generator.tsx
- [ ] Open file in editor
- [ ] Identify current AI call
- [ ] Replace with `useAITool('generate-outline', ...)`
- [ ] Test outline generation
- [ ] Test fallback response
- [ ] Run tests
- [ ] Commit changes

### Component 5: editor.tsx
- [ ] Open file in editor
- [ ] Update `PuterAITools` import if needed
- [ ] Ensure all AI features work
- [ ] Test editor with AI tools
- [ ] Test loading states
- [ ] Run tests
- [ ] Commit changes

---

## Template for Each Component

### Step 1: Analyze Current Code
```bash
# Open the file
cat src/components/COMPONENT_NAME.tsx | head -50
```

### Step 2: Identify AI Calls
Look for:
- `usePuterTool(` or `usePuterToolsBatch(`
- `callPuterAIWithRetry(`
- `window.puter.ai.chat(`
- `supabase.functions.invoke(`

### Step 3: Replace with New Hook
```tsx
// Old
import { usePuterTool } from '@/hooks/usePuterTool';
const { data, execute } = usePuterTool('tool', input);

// New
import { useAITool } from '@/hooks/useAITool';
const { data, execute } = useAITool('tool', input);
```

### Step 4: Update JSX
```tsx
// Check for these and update if needed:
- { fallback && <Badge>Offline</Badge> }    // Optional
- { cacheHit && <span>From cache</span> }   // Optional
- { provider && <small>{provider}</small> } // Optional
```

### Step 5: Test
```bash
# Run component tests
npm run test -- COMPONENT_NAME

# Or run all tests
npm run test

# Build to check for TypeScript errors
npm run build
```

---

## Quick Reference: useAITool Usage

### Single Tool
```tsx
import { useAITool } from '@/hooks/useAITool';

const { data, loading, error, fallback, execute } = useAITool(
  'tool-name',
  { param: value },
  { timeout: 30000, retries: 3 }
);
```

### Batch Tools
```tsx
import { useAIToolsBatch } from '@/hooks/useAITool';

const { results, progress, loading, execute } = useAIToolsBatch([
  { toolName: 'tool1', input: { param: value } },
  { toolName: 'tool2', input: { param: value } }
]);
```

### In JSX
```tsx
<button onClick={() => execute()}>Generate</button>
{loading && <Spinner />}
{fallback && <Badge>Offline Mode</Badge>}
{error && <ErrorAlert>{error}</ErrorAlert>}
{data && <ResultDisplay data={data} />}
```

---

## Tool Names Reference

### Available AI Tools (20+)
**Content Generation:**
- `generate-outline`
- `generate-topic-ideas`
- `generate-research-questions`
- `generate-abstract`
- `generate-titles`

**Writing Tools:**
- `improve-writing`
- `check-grammar`
- `paraphrase-text`
- `summarize-text`

**Analysis:**
- `analyze-document`
- `analyze-research-gaps`
- `check-plagiarism`

See `PUTER_GLOBAL_AI_QUICK_START.md` for complete list.

---

## Common Issues & Solutions

### Issue: "usePuterTool is not found"
**Solution**: Make sure you import from correct location:
```tsx
import { useAITool } from '@/hooks/useAITool';  // Correct
// NOT from @/hooks/usePuterTool
```

### Issue: "Missing Supabase context"
**Solution**: Ensure component is wrapped in AuthProvider (usually in root layout)

### Issue: "Tool name not recognized"
**Solution**: Check exact tool name from registry (it's case-sensitive)

### Issue: "Loading never completes"
**Solution**: Call `execute()` function to trigger the API call:
```tsx
const { data, execute } = useAITool('tool', input);
return <button onClick={() => execute()}>Run</button>;
```

---

## Testing Each Component

### Test 1: Component Renders
```bash
npm run test -- COMPONENT_NAME.test.ts
```

### Test 2: AI Tool Works
- Click "Generate" button
- Check that data appears
- Verify loading state shows
- Check error handling

### Test 3: Fallback Works
- Stop API service (or set timeout: 1)
- Verify fallback response shows
- Check for offline badge
- Verify user can still interact

### Test 4: No TypeScript Errors
```bash
npm run build
# Should complete with no errors
```

---

## Commit Strategy

Commit after each component:
```bash
git add src/components/COMPONENT_NAME.tsx
git commit -m "chore: migrate COMPONENT_NAME to useAITool hook"
```

---

## Timeline Estimate

| Component | Time | Start | End |
|-----------|------|-------|-----|
| Setup & reading | 30 min | - | - |
| puter-tool-example.tsx | 15 min | - | - |
| puter-ai-tools.tsx | 1 hour | - | - |
| paraphrasing-tool.tsx | 45 min | - | - |
| outline-generator.tsx | 1 hour | - | - |
| editor.tsx | 1.5 hours | - | - |
| Testing all | 1 hour | - | - |
| **Total** | **5.5 hours** | - | - |

---

## Next Steps

1. **Read** the quick start guide
2. **Pick** puter-tool-example.tsx as first component
3. **Follow** the migration steps
4. **Test** thoroughly
5. **Commit** changes
6. **Repeat** for other components

---

## Success Criteria

✅ All 5 components using `useAITool`  
✅ All components compile without errors  
✅ All components render without errors  
✅ AI tools respond (or show fallback)  
✅ Tests passing  
✅ No regressions  

---

## Resources

- **Quick Start**: `PUTER_GLOBAL_AI_QUICK_START.md`
- **Migration Guide**: `PUTER_AI_MIGRATION_GUIDE.md`
- **Code Files**:
  - `src/lib/puter-ai-facade.ts` - Core logic
  - `src/hooks/useAITool.ts` - React hooks

---

**Ready to start Phase 2?**

Begin with `puter-tool-example.tsx` - it's the easiest one!

```bash
# Open the file
code src/components/puter-tool-example.tsx

# Or view it
cat src/components/puter-tool-example.tsx
```

---

**Status**: Ready to begin migration  
**Date**: November 21, 2025  
**Phase**: 2 of 4
