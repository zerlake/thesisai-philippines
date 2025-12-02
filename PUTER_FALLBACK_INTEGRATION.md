# Puter with Fallback Integration

Complete fallback system that automatically uses mock data when Puter is unavailable.

## Quick Start

### Usage in Components

```tsx
import { usePuterWithFallback } from '@/hooks/usePuterWithFallback';

export function MyComponent() {
  const { 
    generate, 
    isLoading, 
    result, 
    isFallback,
    cacheHit 
  } = usePuterWithFallback({
    useMockData: true,        // Always have fallback ready
    cacheResponses: true,     // Cache results
    showFallbackNotice: true, // Notify when using fallback
  });

  const handleGenerate = async () => {
    const text = await generate(
      'Write a thesis abstract on AI in education',
      'default'
    );
    console.log(text);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      
      {result && (
        <div>
          <p>{result}</p>
          {isFallback && <span className="text-yellow-600">Using fallback data</span>}
          {cacheHit && <span className="text-green-600">From cache</span>}
        </div>
      )}
    </div>
  );
}
```

### Streaming with Fallback

```tsx
const { stream, isStreaming, streamedText } = usePuterWithFallback();

const handleStream = async () => {
  await stream(
    'Write a thesis introduction',
    (chunk, fullText) => {
      console.log('Chunk:', chunk);
      // Update UI in real-time
      setDisplayText(fullText);
    }
  );
};
```

### Check Fallback Status

```tsx
const { isFallback, cacheHit, getFailureLog } = usePuterWithFallback();

// In your component
{isFallback && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Puter service is unavailable. Using offline fallback data.
    </AlertDescription>
  </Alert>
)}

{cacheHit && (
  <Badge>Cached</Badge>
)}

// Get failure history
const failures = getFailureLog();
console.log('Failed requests:', failures);
```

## Features

### 1. Automatic Fallback
- Detects Puter unavailability
- Automatically uses mock/sample data
- Seamless experience without manual intervention

### 2. Intelligent Caching
- Caches successful responses
- TTL-based expiration (default: 1 hour)
- Reduces requests to Puter
- Faster subsequent requests

### 3. Smart Detection
- Identifies response type (abstract, questions, methodology, etc.)
- Returns appropriate mock data
- Expandable to token count

### 4. Failure Tracking
- Logs all failures with timestamps
- Useful for debugging
- Can be used to trigger alerts

### 5. Configurable Behavior
```tsx
const fallbackConfig = {
  useMockData: true,          // Use fallback data
  cacheResponses: true,       // Cache results
  cacheTTL: 3600000,         // 1 hour TTL
  logFailures: true,         // Log failures
  retryAttempts: 3,          // Retry 3 times
  showToast: true,           // Show notifications
  showFallbackNotice: true,  // Notify of fallback
};
```

## Mock Data Templates

The fallback system includes templates for:

- **Abstract**: Research summary and findings
- **Questions**: Interview/defense questions
- **Introduction**: Topic context and background
- **Methodology**: Research design and approach
- **Conclusion**: Findings and implications
- **Default**: Generic academic response

### Customizing Mock Data

```tsx
// Override mock response generation
import { getPuterWithFallback } from '@/lib/puter-with-fallback';

const fallback = getPuterWithFallback();
// The system will detect prompt type and return appropriate mock
```

## Architecture

```
User Component
    ↓
usePuterWithFallback Hook
    ↓
├─→ Try Puter API
│   ├─→ Check Cache (hit = return cached)
│   ├─→ Request Puter Service
│   └─→ Cache result
│
├─→ On Failure
│   ├─→ Log failure
│   └─→ Fall back to mock data
│
└─→ Return response + status
    ├─→ isFallback (boolean)
    ├─→ cacheHit (boolean)
    └─→ result (string)
```

## Response Types

The system automatically detects what type of response to generate:

```typescript
// Abstract generation
await generate('Generate abstract for thesis on machine learning')
→ Returns abstract-style content

// Questions generation  
await generate('Generate defense questions for my thesis')
→ Returns question-style content

// Methodology
await generate('Describe research methodology')
→ Returns methodology-style content
```

## Cache Management

### View Cache Stats
```tsx
const { getCacheInfo } = usePuterWithFallback();
const stats = getCacheInfo();
// {
//   size: 5,
//   entries: [
//     { key: 'default:generate abstract...', age: 12345 },
//     ...
//   ]
// }
```

### Clear Cache
```tsx
const { clearCache } = usePuterWithFallback();
clearCache();
```

## Error Handling

```tsx
const { error, getFailureLog } = usePuterWithFallback();

if (error) {
  console.error('Failed:', error.message);
}

// Get history
const failures = getFailureLog();
failures.forEach(({ prompt, error, timestamp }) => {
  console.log(`Failed at ${new Date(timestamp)}: ${error}`);
});
```

## Fallback Notifications

The system can notify users:

```tsx
// Automatic toast notifications
showToast: true    // "Using fallback (Puter unavailable)"
                   // "Result from cache"
                   // "Generated successfully"

// Show notice in UI
showFallbackNotice: true

// Custom handling
const { isFallback } = usePuterWithFallback();
if (isFallback) {
  // Show notice or disable certain features
}
```

## Testing

### Test Fallback Behavior
```tsx
// Force fallback (disable Puter)
const { generate } = usePuterWithFallback({
  useMockData: true,
});

const result = await generate('Test prompt');
// Will always use fallback data
```

### Test Caching
```tsx
const { 
  generate, 
  getCacheInfo, 
  cacheHit 
} = usePuterWithFallback({
  cacheResponses: true,
});

// First call
await generate('Same prompt');
console.log('Cache hit:', cacheHit); // false

// Second call
await generate('Same prompt');
console.log('Cache hit:', cacheHit); // true

// View cache
const { size, entries } = getCacheInfo();
console.log('Cached items:', size);
```

## Integration with Existing Code

### Before (Puter SDK)
```tsx
import { usePuterAI } from '@/hooks/usePuterAI';

const { generate } = usePuterAI();
const result = await generate(prompt);
// Fails if Puter unavailable ❌
```

### After (With Fallback)
```tsx
import { usePuterWithFallback } from '@/hooks/usePuterWithFallback';

const { generate, isFallback } = usePuterWithFallback();
const result = await generate(prompt);
// Works always with fallback ✓
```

## Performance Tips

1. **Enable Caching** - Reduces unnecessary requests
   ```tsx
   { cacheResponses: true, cacheTTL: 3600000 }
   ```

2. **Batch Requests** - Cache helps with repeated prompts
   ```tsx
   // Second request is instant (from cache)
   await generate('Same prompt');
   ```

3. **Monitor Failures** - Know when Puter is down
   ```tsx
   const failures = getFailureLog();
   if (failures.length > 5) {
     // Alert ops team
   }
   ```

4. **Clear Old Cache** - Memory management
   ```tsx
   const cache = getCacheInfo();
   if (cache.size > 100) {
     clearCache();
   }
   ```

## Production Checklist

- [ ] Configure cache TTL appropriate for your use case
- [ ] Set up monitoring for failure log
- [ ] Test fallback data quality
- [ ] Configure toast notifications
- [ ] Add fallback notice in UI
- [ ] Monitor cache hit rates
- [ ] Set up Puter health checks
- [ ] Document fallback behavior for users

## Troubleshooting

### "Always returning fallback"
1. Check Puter service is running
2. Verify `NEXT_PUBLIC_PUTER_API_URL`
3. Check network connectivity

### "Cache not working"
1. Verify `cacheResponses: true`
2. Check `cacheTTL` hasn't expired
3. Ensure prompts are identical

### "Fallback data quality"
1. Review mock response templates
2. Customize for your domain
3. Add more specific templates

### "Too many notifications"
1. Disable `showToast` if not needed
2. Adjust `showFallbackNotice`
3. Batch requests to reduce notifications

## Future Enhancements

- [ ] Multiple fallback sources (APIs)
- [ ] A/B testing fallback vs Puter
- [ ] User-provided fallback data
- [ ] Analytics on fallback usage
- [ ] Smart retry with circuit breaker
- [ ] Fallback quality metrics
