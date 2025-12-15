# Global Puter AI Implementation - Quick Start

## What Changed?

### Before (Old Way)
```tsx
import { usePuterTool } from '@/hooks/usePuterTool';

const { data, execute } = usePuterTool('generate-outline', { topic: 'AI' });
```

### After (New Way)
```tsx
import { useAITool } from '@/hooks/useAITool';

const { data, execute } = useAITool('generate-outline', { topic: 'AI' });
```

**That's it!** Everything else is the same.

---

## The Three Hooks

### 1. `useAITool` - Single Tool
```tsx
const { data, loading, error, fallback, execute } = useAITool(
  'generate-outline',
  { topic: 'ML' },
  { timeout: 60000, retries: 5 }
);
```

### 2. `useAIToolsBatch` - Multiple Tools
```tsx
const { results, progress, loading, execute } = useAIToolsBatch([
  { toolName: 'check-grammar', input: { text } },
  { toolName: 'improve-writing', input: { text } }
]);
```

### 3. `useAIMetrics` - Monitoring
```tsx
const { metrics, clearCache } = useAIMetrics();
// metrics: { totalCalls, successRate, cacheHits, ... }
```

---

## Copy & Paste Examples

### Example 1: Generate Outline
```tsx
import { useAITool } from '@/hooks/useAITool';

export function OutlineGenerator() {
  const { data, loading, error, execute } = useAITool(
    'generate-outline',
    { topic: 'Climate Change', level: 'thesis' }
  );

  return (
    <>
      <button onClick={() => execute()} disabled={loading}>
        Generate Outline
      </button>
      {loading && <Spinner />}
      {error && <ErrorAlert>{error}</ErrorAlert>}
      {data?.outline && <OutlineView outline={data.outline} />}
    </>
  );
}
```

### Example 2: Check Grammar
```tsx
import { useAITool } from '@/hooks/useAITool';

export function GrammarChecker({ text }) {
  const { data, execute, cacheHit } = useAITool(
    'check-grammar',
    { text },
    { 
      autoExecute: true,  // Run when text changes
      useCache: true      // Cache results
    }
  );

  return (
    <>
      <Badge>{cacheHit ? 'Cached' : 'Fresh'}</Badge>
      <ErrorCount>{data?.errors?.length ?? 0}</ErrorCount>
      {data?.suggestions?.map(s => <Suggestion key={s}>{s}</Suggestion>)}
    </>
  );
}
```

### Example 3: Batch Analysis
```tsx
import { useAIToolsBatch } from '@/hooks/useAITool';

export function DocumentAnalyzer({ document }) {
  const { results, progress, loading, execute } = useAIToolsBatch([
    { toolName: 'check-grammar', input: { text: document } },
    { toolName: 'improve-writing', input: { text: document } },
    { toolName: 'analyze-document', input: { text: document } }
  ]);

  return (
    <>
      <button onClick={() => execute()}>Analyze Document</button>
      <ProgressBar value={progress} max={100} />
      {results.map((r, i) => r.success && (
        <ResultPanel key={i} data={r.data} />
      ))}
    </>
  );
}
```

### Example 4: With Fallback Handling
```tsx
import { useAITool } from '@/hooks/useAITool';

export function SmartOutlineGenerator() {
  const { data, fallback, provider, execute } = useAITool(
    'generate-outline',
    { topic },
    { timeout: 60000 }
  );

  return (
    <div>
      <button onClick={() => execute()}>Generate</button>
      
      {fallback && (
        <InfoBanner>
          Using {provider} (offline mode)
        </InfoBanner>
      )}
      
      {data && <OutlineView outline={data.outline} />}
    </div>
  );
}
```

---

## All Available Tools

### Content Generation
- `generate-outline` - Thesis structure
- `generate-topic-ideas` - Topic suggestions
- `generate-research-questions` - Research questions
- `generate-abstract` - Abstract writing
- `generate-conclusion` - Conclusion writing
- `generate-introduction` - Introduction writing
- `generate-methodology` - Methodology section
- `generate-hypotheses` - Hypothesis generation
- `generate-titles` - Title suggestions

### Writing Tools
- `improve-writing` - Enhance text
- `check-grammar` - Grammar checking
- `paraphrase-text` - Paraphrase content
- `summarize-text` - Summarize content

### Analysis
- `analyze-document` - Document analysis
- `analyze-research-gaps` - Research gap identification
- `check-plagiarism` - Plagiarism detection
- `check-originality` - Originality checking

### Content Creation
- `generate-flashcards` - Study materials
- `generate-defense-questions` - Defense preparation
- `generate-presentation-slides` - Slide creation
- `generate-feedback` - Contextual feedback

### Search
- `search-web` - Web search
- `search-google-scholar` - Academic search

---

## Configuration Options

```tsx
useAITool('tool', input, {
  // Timing
  timeout: 30000,          // Request timeout (ms)
  retries: 3,              // Retry attempts

  // Caching
  useCache: true,          // Enable caching
  cacheTTL: 3600000,       // Cache time (1 hour)

  // Provider
  provider: 'auto',        // 'auto' | 'puter' | 'openrouter'
  
  // LLM Settings
  temperature: 0.7,        // Creativity (0-1)
  maxTokens: 2000,         // Response length
  systemPrompt: 'You are...' // Custom instructions

  // Callbacks
  required: false,         // Fail if unavailable
  onSuccess: (data) => {}, // Success handler
  onError: (err) => {},    // Error handler

  // Auto-execution
  autoExecute: false       // Run on mount
});
```

---

## Common Patterns

### Pattern: Real-time Input Validation
```tsx
const { data, loading } = useAITool(
  'check-grammar',
  { text: userInput },
  { autoExecute: true, useCache: true }
);

return (
  <>
    <TextArea value={userInput} onChange={e => setUserInput(e.target.value)} />
    {loading && <Spinner size="sm" />}
    {data?.errors?.length === 0 && <SuccessBadge />}
  </>
);
```

### Pattern: Lazy Loading
```tsx
const { data, execute, loading } = useAITool(
  'generate-outline',
  { topic },
  { autoExecute: false }  // Don't run until user clicks
);

return <button onClick={() => execute()}>Generate Outline</button>;
```

### Pattern: Multiple Providers
```tsx
const { data, provider } = useAITool('tool', input);

return (
  <div>
    {data && <Results data={data} />}
    <small>Powered by {provider}</small>
  </div>
);
```

---

## Error Handling

### Simple
```tsx
const { error } = useAITool('tool', input);
if (error) return <ErrorAlert>{error}</ErrorAlert>;
```

### Advanced
```tsx
const { error, fallback, provider } = useAITool('tool', input);

if (error) {
  if (fallback) return <OfflineMessage provider={provider} />;
  return <ErrorAlert>{error}</ErrorAlert>;
}
```

### With Retry
```tsx
const { error, execute, loading } = useAITool('tool', input, {
  onError: (err) => {
    if (err.includes('timeout')) {
      setTimeout(() => execute(), 3000);
    }
  }
});
```

---

## Monitoring & Debugging

### View Metrics
```tsx
const { metrics } = useAIMetrics();

console.log('AI Service Metrics:', {
  totalCalls: metrics.totalCalls,
  successRate: metrics.successfulCalls / metrics.totalCalls,
  cacheHitRate: metrics.cacheHits / metrics.totalCalls,
  avgResponseTime: metrics.averageResponseTime + 'ms'
});
```

### Clear Cache
```tsx
const { clearCache } = useAIMetrics();

// Clear all
clearCache();

// Clear pattern
clearCache('generate-');
```

---

## TypeScript Support

### Type Safety
```tsx
interface OutlineResponse {
  outline: {
    sections: Array<{ title: string; description: string }>;
  };
}

const { data } = useAITool<OutlineResponse>('generate-outline', input);
// data is properly typed!
```

---

## Testing

### Jest Template
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAITool } from '@/hooks/useAITool';

describe('useAITool', () => {
  it('generates outline', async () => {
    const { result } = renderHook(() =>
      useAITool('generate-outline', { topic: 'AI' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Tool not found" | Check tool name in the list above |
| "Timeout" | Increase timeout: `{ timeout: 60000 }` |
| "Supabase not initialized" | Ensure within AuthProvider |
| "Always using fallback" | Check network, check Supabase keys |
| "Cache not working" | Enable with: `{ useCache: true }` |
| "Response is slow" | Use `{ useCache: true }` for fast responses |

---

## Migration Checklist

For each component using AI:

- [ ] Import `useAITool` instead of `usePuterTool`
- [ ] Change `functionName` to `toolName` (if using batch)
- [ ] Test with sample data
- [ ] Verify loading states
- [ ] Verify error handling
- [ ] Check performance
- [ ] Deploy

---

## Performance Tips

1. **Use Caching**
   ```tsx
   useAITool('tool', input, { useCache: true })
   ```

2. **Batch Requests**
   ```tsx
   useAIToolsBatch(tools)  // Parallel execution
   ```

3. **Lazy Load**
   ```tsx
   useAITool('tool', input, { autoExecute: false })
   ```

4. **Adjust Timeout**
   ```tsx
   useAITool('tool', input, { timeout: 15000 })
   ```

---

## Need Help?

- **Quick Ref**: `PUTER_QUICK_REFERENCE.md`
- **Migration**: `PUTER_AI_MIGRATION_GUIDE.md`
- **Full Guide**: `PUTER_INTEGRATION_README.md`
- **Technical**: `PUTER_AI_INTEGRATION_GUIDE.md`

---

**Status:** Ready to Use  
**Version:** 1.0.0  
**Date:** November 21, 2025

Start with the examples above and migrate components one by one!
