# Puter AI Migration Guide
## Migrating Components to Unified AI Interface

### Quick Start

Replace this:
```tsx
import { usePuterTool } from '@/hooks/usePuterTool';

const { data, execute } = usePuterTool('generate-outline', { topic: 'ML' });
```

With this:
```tsx
import { useAITool } from '@/hooks/useAITool';

const { data, execute } = useAITool('generate-outline', { topic: 'ML' });
```

---

## Migration Patterns

### Pattern 1: Simple Tool Execution

**Before:**
```tsx
import { usePuterTool } from '@/hooks/usePuterTool';

export function OutlineGenerator() {
  const { data, loading, error, execute } = usePuterTool(
    'generate-outline',
    { topic: 'Machine Learning' }
  );

  return (
    <>
      <button onClick={() => execute()}>Generate</button>
      {loading && <Spinner />}
      {error && <ErrorAlert msg={error} />}
      {data && <OutlineDisplay outline={data.outline} />}
    </>
  );
}
```

**After:**
```tsx
import { useAITool } from '@/hooks/useAITool';

export function OutlineGenerator() {
  const { data, loading, error, fallback, execute } = useAITool(
    'generate-outline',
    { topic: 'Machine Learning' }
  );

  return (
    <>
      <button onClick={() => execute()}>Generate</button>
      {loading && <Spinner />}
      {fallback && <Badge>Using offline suggestions</Badge>}
      {error && <ErrorAlert msg={error} />}
      {data && <OutlineDisplay outline={data.outline} />}
    </>
  );
}
```

**Changes:**
- Import from `useAITool` instead of `usePuterTool`
- Optional: Add `fallback` state display
- Everything else works the same

---

### Pattern 2: Batch Operations

**Before:**
```tsx
import { usePuterToolsBatch } from '@/hooks/usePuterTool';

export function DocumentAnalyzer({ text }) {
  const { results, progress, loading, execute } = usePuterToolsBatch([
    { functionName: 'check-grammar', input: { text } },
    { functionName: 'improve-writing', input: { text } },
    { functionName: 'summarize-text', input: { text } }
  ]);

  return (
    <>
      <button onClick={() => execute()}>Analyze</button>
      <ProgressBar value={progress} />
      {results.map(r => r.data && <Result data={r.data} />)}
    </>
  );
}
```

**After:**
```tsx
import { useAIToolsBatch } from '@/hooks/useAITool';

export function DocumentAnalyzer({ text }) {
  const { results, progress, loading, execute } = useAIToolsBatch([
    { toolName: 'check-grammar', input: { text } },
    { toolName: 'improve-writing', input: { text } },
    { toolName: 'summarize-text', input: { text } }
  ]);

  return (
    <>
      <button onClick={() => execute()}>Analyze</button>
      <ProgressBar value={progress} />
      {results.map(r => r.data && <Result data={r.data} />)}
    </>
  );
}
```

**Changes:**
- Import `useAIToolsBatch` instead
- Change `functionName` to `toolName`
- Optional: Use `parallel: false` for sequential execution

---

### Pattern 3: With Custom Configuration

**Before:**
```tsx
const { data, execute } = usePuterTool('generate-outline', input, {
  timeout: 60000,
  retries: 5,
  onError: (err) => toast.error(err)
});
```

**After:**
```tsx
const { data, execute } = useAITool('generate-outline', input, {
  timeout: 60000,
  retries: 5,
  onError: (err) => toast.error(err),
  // New options:
  useCache: true,           // Enable caching
  cacheTTL: 3600000,       // Cache for 1 hour
  provider: 'auto',        // Auto-select best provider
  maxTokens: 2000          // Response length
});
```

**New Options:**
- `useCache` - Enable/disable response caching
- `cacheTTL` - Cache time-to-live in milliseconds
- `provider` - 'puter' | 'openrouter' | 'auto'
- `systemPrompt` - Custom system prompt
- `temperature` - LLM temperature (0-1)
- `maxTokens` - Max response tokens

---

### Pattern 4: Server-Side Usage

**For Supabase Functions:**

```typescript
// Instead of calling Supabase functions directly:
// const response = await supabase.functions.invoke('generate-outline', { body: input });

// Use the facade directly:
import { puterAIFacade } from '@/lib/puter-ai-facade';

const response = await puterAIFacade.call(
  'generate-outline',
  { topic: 'AI Ethics' },
  supabase,
  { timeout: 60000 }
);

if (response.success) {
  // Use response.data
} else {
  // Use fallback or handle error
}
```

---

### Pattern 5: Error Handling

**Unified Error Handling:**

```tsx
const { data, error, fallback, provider, execute } = useAITool(
  'check-grammar',
  { text },
  {
    onError: (error) => {
      if (error.includes('timeout')) {
        toast.warn('Request timed out, using offline mode');
      } else if (error.includes('unavailable')) {
        toast.info('AI service unavailable, offline mode active');
      } else {
        toast.error(`Error: ${error}`);
      }
    }
  }
);

return (
  <>
    {fallback && <OfflineBanner provider={provider} />}
    {error && <ErrorAlert message={error} />}
    {data && <ResultsDisplay data={data} />}
  </>
);
```

---

### Pattern 6: Metrics and Monitoring

**New capability:**

```tsx
import { useAIMetrics } from '@/hooks/useAITool';

export function AIMetricsPanel() {
  const { metrics, clearCache } = useAIMetrics();

  return (
    <div>
      <p>Total calls: {metrics.totalCalls}</p>
      <p>Success rate: {(metrics.successfulCalls / metrics.totalCalls * 100).toFixed(1)}%</p>
      <p>Cache hits: {metrics.cacheHits}</p>
      <p>Fallback used: {metrics.fallbackUsed} times</p>
      <p>Avg response: {metrics.averageResponseTime.toFixed(0)}ms</p>
      <button onClick={() => clearCache()}>Clear Cache</button>
    </div>
  );
}
```

---

## Component-by-Component Migration

### High Priority Components (Week 1)

1. **editor.tsx**
   ```tsx
   // Replace AI tool calls
   - import { usePuterTool }
   + import { useAITool }
   ```

2. **student-dashboard.tsx**
   ```tsx
   // Update all tool integrations
   - usePuterTool('generate-*')
   + useAITool('generate-*')
   ```

3. **outline-generator.tsx**
   ```tsx
   // Batch operations
   - usePuterToolsBatch
   + useAIToolsBatch
   ```

4. **grammar-checker.tsx**
   ```tsx
   // Real-time checking
   - usePuterTool('check-grammar')
   + useAITool('check-grammar', input, { useCache: true })
   ```

5. **research-gap-identifier.tsx**
   ```tsx
   // Long-running operation
   - usePuterTool with custom timeout
   + useAITool with timeout: 60000
   ```

### Medium Priority Components (Week 2)

6. **improve-writing-panel.tsx**
7. **bibliography-generator.tsx**
8. **citation-manager.tsx**
9. **document-analyzer.tsx**
10. **presentation-generator.tsx**

### Low Priority Components (Week 3+)

11. Other analytical components
12. Report generators
13. Utility components

---

## Configuration Examples

### Example 1: Fast Responses with Caching
```tsx
const { data, execute } = useAITool('summarize-text', { text }, {
  timeout: 15000,      // Short timeout
  useCache: true,      // Always use cache
  cacheTTL: 86400000,  // Cache for 24 hours
  retries: 2
});
```

### Example 2: High Quality Responses
```tsx
const { data, execute } = useAITool('generate-outline', { topic }, {
  timeout: 60000,      // Long timeout
  retries: 5,          // More retries
  temperature: 0.5,    // More focused
  maxTokens: 3000,     // Longer response
  provider: 'auto'     // Best available
});
```

### Example 3: Offline-Capable
```tsx
const { data, fallback, execute } = useAITool('check-grammar', { text }, {
  timeout: 10000,
  retries: 1,
  onError: () => {
    // Handle gracefully
  }
});

if (fallback) {
  return <OfflineMessage />;
}
```

---

## Testing After Migration

### Unit Test Template
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAITool } from '@/hooks/useAITool';
import { AuthProvider } from '@/components/auth-provider';

describe('useAITool', () => {
  it('should call AI tool and return data', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(
      () => useAITool('generate-outline', { topic: 'AI' }),
      { wrapper }
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });
});
```

### Integration Test Template
```typescript
test('batch operations work correctly', async () => {
  const { result } = renderHook(
    () => useAIToolsBatch([
      { toolName: 'check-grammar', input: { text: 'Sample text' } },
      { toolName: 'improve-writing', input: { text: 'Sample text' } }
    ]),
    { wrapper: AuthProvider }
  );

  await act(async () => {
    await result.current.execute();
  });

  expect(result.current.results).toHaveLength(2);
  expect(result.current.results[0].success).toBe(true);
});
```

---

## Fallback Responses

When AI services are unavailable, components automatically use fallback responses:

| Tool | Fallback Behavior |
|------|------------------|
| generate-outline | Template structure provided |
| generate-topic-ideas | Generic suggestions offered |
| check-grammar | Returns "no errors" state |
| improve-writing | Returns original text marked as fallback |
| summarize-text | Returns condensed version |
| paraphrase-text | Returns original with confidence 0 |

All fallback responses have `fallback: true` in the response.

---

## Performance Optimization

### Caching Strategy
```tsx
// First call - API request (~2-10s)
const result1 = await useAITool('tool', { param: 'value' });

// Second call with same params - From cache (<10ms)
const result2 = await useAITool('tool', { param: 'value' });

// Different params - New API request
const result3 = await useAITool('tool', { param: 'different' });
```

### Batch Processing
```tsx
// Parallel (faster)
const { results } = useAIToolsBatch(tools, { parallel: true });

// Sequential (if needed)
const { results } = useAIToolsBatch(tools, { parallel: false });
```

---

## Troubleshooting

### Issue: "Tool not found"
**Solution:** Check tool name matches exactly (see Tool Registry in implementation guide)

### Issue: "Timeout after 30s"
**Solution:** Increase timeout in options
```tsx
useAITool('tool', input, { timeout: 60000 })
```

### Issue: "Using fallback response"
**Solution:** Normal - AI service temporarily unavailable. Automatic retry will occur.

### Issue: "Supabase not initialized"
**Solution:** Ensure `useAuth()` is available from parent context

---

## Files Changed Summary

### New Files (2)
- `src/lib/puter-ai-facade.ts` - Main facade
- `src/hooks/useAITool.ts` - React hooks

### Modified Files
- `src/lib/puter-ai-integration.ts` - Add facade support
- `src/components/*.tsx` - Import updates (50+ files)
- `supabase/functions/**/*.ts` - Function updates (30+ files)
- Test files - Update tool names

### No Breaking Changes
- Old hooks still work
- Gradual migration possible
- Backward compatible

---

## Rollback Plan

If issues occur:

1. Revert component imports:
```tsx
- import { useAITool }
+ import { usePuterTool }
```

2. Revert function names:
```tsx
- useAITool('tool', input)
+ usePuterTool('tool', input)
```

3. Old functionality remains available

---

## Success Criteria

✅ All AI calls use unified facade  
✅ Fallback responses working  
✅ Cache hits improving performance  
✅ Tests passing  
✅ No TypeScript errors  
✅ User-facing functionality unchanged  

---

## Resources

- **Implementation**: `PUTER_GLOBAL_AI_IMPLEMENTATION.md`
- **Reference**: `PUTER_QUICK_REFERENCE.md`
- **Documentation**: `PUTER_INTEGRATION_README.md`
- **Technical**: `PUTER_AI_INTEGRATION_GUIDE.md`

---

**Version:** 1.0.0  
**Date:** November 21, 2025  
**Status:** Ready for Implementation
