# Component 2: puter-ai-tools.tsx Migration Plan

## Current State Analysis

### File Location
`src/components/puter-ai-tools.tsx`

### Current Implementation
- Uses `callPuterAIWithRetry()` helper function
- Calls `window.puter.ai.chat()` directly
- Has 3 main functions:
  1. `handleImproveText()` - Improves selected text
  2. `handleSummarizeText()` - Summarizes text
  3. `handleRewriteText()` - Rewrites text

### Current Structure
```
PuterAITools component
├── Props: { editor, session }
├── State: { improve, summarize, rewrite } (isProcessing)
├── Functions:
│   ├── checkEditorAndAuth() - Validates editor and auth
│   ├── handleImproveText() - Uses callPuterAIWithRetry
│   ├── handleSummarizeText() - Uses callPuterAIWithRetry
│   └── handleRewriteText() - Uses callPuterAIWithRetry
└── Render: Button dropdown with 3 options
```

---

## Migration Strategy

### Approach: Gradual Refactor
Instead of rewriting everything, we'll:
1. Keep the component structure
2. Replace `callPuterAIWithRetry` with `useAITool` hooks
3. Keep error handling and editor integration
4. Simplify state management

### Before vs After

#### Before (Current)
```tsx
const result = await callPuterAIWithRetry(
  () => window.puter.ai.chat({ prompt, temperature: 0.5, max_tokens: 2000 }),
  { maxRetries: 2, timeoutMs: 30000 },
  (attempt) => { /* ... */ }
);
```

#### After (Proposed)
```tsx
const { data, execute } = useAITool(
  'improve-writing',
  { text: originalText },
  { timeout: 30000, retries: 2 }
);

await execute();
const improvedText = data?.improved || data?.response;
```

---

## Migration Steps

### Step 1: Update Imports
```tsx
// Add
import { useAITool } from '@/hooks/useAITool';

// Remove (keep others)
// import { callPuterAIWithRetry, ... } from '@/utils/puter-ai-retry';
```

### Step 2: Add useAITool Hooks
```tsx
// Add to component
const improveToolState = useAITool('improve-writing', undefined, {
  timeout: 30000,
  retries: 2
});

const summarizeToolState = useAITool('summarize-text', undefined, {
  timeout: 30000,
  retries: 2
});

const rewriteToolState = useAITool('improve-writing', undefined, {
  timeout: 30000,
  retries: 2
});
```

### Step 3: Refactor handleImproveText()
```tsx
const handleImproveText = async () => {
  try {
    const canProceed = await checkEditorAndAuth();
    if (!canProceed) return;

    const { from, to } = editor.state.selection;
    let originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) {
      toast.info("Please select some text to improve.");
      return;
    }

    setIsProcessing(prev => ({ ...prev, improve: true }));

    // Call the tool with input
    const response = await improveToolState.execute({ text: originalText });

    if (!response?.success) {
      throw new Error(response?.error || 'Failed to improve text');
    }

    const improvedText = response.data?.improved || response.data?.response;
    if (!improvedText?.trim()) {
      throw new Error("AI returned empty response");
    }

    editor.chain().focus().deleteRange({ from, to }).insertContent(improvedText).run();
    toast.success("Text improved with AI!");

  } catch (error: any) {
    const message = error.message || 'Failed to improve text';
    toast.error(message);
  } finally {
    setIsProcessing(prev => ({ ...prev, improve: false }));
  }
};
```

### Step 4: Refactor Similar Functions
Same pattern for `handleSummarizeText()` and `handleRewriteText()`

---

## Challenge: Async/Await Pattern

### Current Issue
The new hooks use React state, which needs re-renders.

### Solution: Convert to Async Pattern
```tsx
// The facade.call() method returns a Promise
const response = await puterAIFacade.call(
  'improve-writing',
  { text: originalText },
  supabase
);
```

### Implementation
We can call the facade directly instead of using the hook:
```tsx
import { puterAIFacade } from '@/lib/puter-ai-facade';

// In the handler
const response = await puterAIFacade.call(
  'improve-writing',
  { text: originalText },
  supabase,
  { timeout: 30000, retries: 2 }
);
```

---

## Revised Migration Plan

### Use Facade Directly (Simpler)
Instead of using hooks (which are for React components), use the facade directly in async functions:

```tsx
import { puterAIFacade } from '@/lib/puter-ai-facade';

const handleImproveText = async () => {
  try {
    const canProceed = await checkEditorAndAuth();
    if (!canProceed) return;

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    if (!text.trim()) {
      toast.info("Please select text to improve.");
      return;
    }

    setIsProcessing(prev => ({ ...prev, improve: true }));

    // Call the facade directly
    const response = await puterAIFacade.call(
      'improve-writing',
      { text },
      supabase,
      { timeout: 30000, retries: 2 }
    );

    if (!response.success) {
      throw new Error(response.error || 'AI request failed');
    }

    const improvedText = response.data?.improved || response.data?.response;
    if (!improvedText?.trim()) {
      throw new Error("Empty response from AI");
    }

    editor.chain().focus().deleteRange({ from, to }).insertContent(improvedText).run();
    toast.success("Text improved!");

  } catch (error: any) {
    toast.error(error.message || 'Failed to improve text');
  } finally {
    setIsProcessing(prev => ({ ...prev, improve: false }));
  }
};
```

---

## Benefits of This Approach

✅ Simpler - No hook state management needed  
✅ Cleaner - Direct async/await pattern  
✅ Faster - No re-renders while processing  
✅ Compatible - Preserves all existing error handling  
✅ Testable - Can test async functions directly  

---

## Files to Modify

1. **src/components/puter-ai-tools.tsx**
   - Update imports
   - Import `puterAIFacade`
   - Refactor 3 handler functions
   - Update error handling

### Changes Summary
- Lines 1-18: Update imports
- Lines 74-150: Refactor `handleImproveText()`
- Lines ~151-200: Refactor `handleSummarizeText()`
- Lines ~201-250: Refactor `handleRewriteText()`

---

## Testing Checklist

- [ ] Component renders without errors
- [ ] "Improve Text" button works
- [ ] "Summarize Text" button works
- [ ] "Rewrite Text" button works
- [ ] Loading state shows during processing
- [ ] Error messages display properly
- [ ] Offline/fallback response works
- [ ] No TypeScript errors: `npm run build`

---

## Estimated Time: 45-60 minutes

1. **Analyze**: 10 minutes
2. **Update imports**: 5 minutes
3. **Refactor handleImproveText**: 15 minutes
4. **Refactor handleSummarizeText**: 10 minutes
5. **Refactor handleRewriteText**: 10 minutes
6. **Test**: 15 minutes
7. **Commit**: 5 minutes

---

## Command References

```bash
# View the file
cat src/components/puter-ai-tools.tsx

# Run specific tests
npm run test -- puter-ai-tools

# Build to check TypeScript
npm run build

# Lint check
npm run lint
```

---

## Ready to Start?

1. Review this plan
2. Open `src/components/puter-ai-tools.tsx`
3. Follow the migration steps above
4. Test each function
5. Commit when complete

---

**Next**: Review current implementation in detail, then execute migration.
