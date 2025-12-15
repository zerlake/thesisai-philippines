# Puter.js AI Integration for Student Dashboard

## Overview

This document provides a complete guide to the Puter.js AI integration for the ThesisAI student dashboard. The integration includes:

- **22+ AI Tools** for thesis writing and research
- **Automatic Fallback System** when AI is unavailable
- **Intelligent Caching** to reduce API calls
- **Retry Logic** with exponential backoff
- **Comprehensive Testing** suite
- **React Hooks** for easy component integration

## Quick Start

### 1. Install Dependencies

All dependencies are already included in `package.json`. The integration uses:
- `@supabase/supabase-js` - For backend functions
- `vitest` - For testing
- React hooks and state management

### 2. Basic Usage

```tsx
import { usePuterTool } from '@/hooks/usePuterTool';

function MyComponent() {
  const { data, loading, error, execute } = usePuterTool(
    'generate-outline',
    { topic: 'Machine Learning', level: 'thesis' }
  );

  return (
    <div>
      <button onClick={() => execute()}>Generate Outline</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### 3. Run Tests

```bash
# Run all integration tests
npm run test

# Run Puter integration tests specifically
npm run test -- student-dashboard-tools

# Run with verbose output
npm run test -- student-dashboard-tools --reporter=verbose

# Run example tests
npm run test -- puter-ai-example
```

## File Structure

```
thesis-ai/
├── src/
│   ├── lib/
│   │   └── puter-ai-integration.ts          # Core integration logic
│   ├── hooks/
│   │   └── usePuterTool.ts                  # React hooks
│   └── components/
│       └── puter-tool-example.tsx           # Example components
├── __tests__/
│   └── integration/
│       ├── student-dashboard-tools.test.ts  # Main test suite
│       ├── puter-ai-example.test.ts         # Example tests
│       └── puter-ai-helpers.ts              # Test utilities
└── PUTER_AI_INTEGRATION_GUIDE.md            # Detailed guide
```

## Core Components

### 1. Integration Module (`src/lib/puter-ai-integration.ts`)

**Main Features:**
- `executeTool()` - Execute a single AI tool
- `executeToolsBatch()` - Execute multiple tools in parallel
- `PuterAIIntegration` class - Manages caching, retries, and fallbacks

**Usage:**
```typescript
import { executeTool, puterAIIntegration } from '@/lib/puter-ai-integration';

// Execute a tool
const response = await executeTool(supabase, 'generate-outline', {
  topic: 'AI',
  level: 'thesis'
});

// Check AI availability
const isAvailable = await puterAIIntegration.checkAIAvailability(supabase);

// Clear cache
puterAIIntegration.clearCache();
```

### 2. React Hooks (`src/hooks/usePuterTool.ts`)

**Available Hooks:**
- `usePuterTool()` - Single tool execution
- `usePuterToolsBatch()` - Batch execution with progress
- `usePuterToolStream()` - Streaming responses
- `usePuterCache()` - Cache management

**Example:**
```typescript
const { data, loading, error, execute } = usePuterTool('tool-name', input);
```

### 3. Example Components (`src/components/puter-tool-example.tsx`)

**Components Included:**
- `PuterToolExample` - Basic single tool usage
- `PuterBatchToolExample` - Batch execution example
- `PuterToolStatusIndicator` - Tool status display
- `PuterToolsDashboard` - Overview of all tools

## Available Tools

### Topic & Research Generation
| Tool | Function Name | Input | Output |
|------|---------------|-------|--------|
| Topic Idea Generator | `generate-topic-ideas` | `{ field, level }` | `{ ideas: [] }` |
| Research Questions | `generate-research-questions` | `{ topic, context }` | `{ questions: [] }` |
| Outline Generator | `generate-outline` | `{ topic, level }` | `{ outline: [] }` |

### Writing & Text Processing
| Tool | Function Name | Input | Output |
|------|---------------|-------|--------|
| Paraphrasing | `paraphrase-text` | `{ text, mode }` | `{ paraphrased }` |
| Writing Improvement | `improve-writing` | `{ text }` | `{ improved, suggestions }` |
| Grammar Check | `check-grammar` | `{ text }` | `{ corrections, suggestions }` |
| Text Summarization | `summarize-text` | `{ text }` | `{ summary }` |

### Analysis & Quality
| Tool | Function Name | Input | Output |
|------|---------------|-------|--------|
| Plagiarism Check | `check-plagiarism` | `{ text }` | `{ similarity, score }` |
| Document Analysis | `analyze-document` | `{ content, type }` | `{ analysis, insights }` |
| Format Checker | `check-format-compliance` | `{ content, university }` | `{ compliance, issues }` |

### Presentation & Defense
| Tool | Function Name | Input | Output |
|------|---------------|-------|--------|
| Presentation Maker | `generate-presentation-slides` | `{ content, slides }` | `{ slides: [] }` |
| Defense Q&A | `generate-defense-questions` | `{ content, difficulty }` | `{ questions, answers }` |
| Flashcards | `generate-flashcards` | `{ content, topic }` | `{ cards: [] }` |

### Advanced Tools
| Tool | Function Name | Input | Output |
|------|---------------|-------|--------|
| Research Gap Identifier | `identify-research-gaps` | `{ topic, literature }` | `{ gaps, opportunities }` |
| Variable Mapper | `map-variables` | `{ variables, framework }` | `{ mapping }` |
| Statistical Analysis | `analyze-statistics` | `{ data, test }` | `{ results }` |

## Integration Points

### With Student Dashboard

The integration works seamlessly with the existing student dashboard:

```tsx
import { StudentDashboard } from '@/components/student-dashboard';
import { PuterToolExample } from '@/components/puter-tool-example';

export function Page() {
  return (
    <>
      <StudentDashboard />
      <PuterToolExample />
    </>
  );
}
```

### With Existing Tools

Each dashboard tool can be enhanced with Puter integration:

```tsx
// Before: Document Analyzer component
function DocumentAnalyzer() {
  // Uses local processing only
}

// After: With Puter integration
function DocumentAnalyzer() {
  const { data: analysis } = usePuterTool('analyze-document', {
    content: document.content,
    documentType: 'thesis'
  });
  // Combines AI analysis with local processing
}
```

## Error Handling

### Automatic Fallback

When AI services are unavailable:

```tsx
const { data, fallback } = usePuterTool('generate-outline', input);

if (fallback) {
  console.log('Using fallback suggestions');
  // Show user-friendly message
}
```

### Retry Logic

Automatic retries with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay

```tsx
const { error } = usePuterTool('tool', input, {
  retries: 5,  // Increase retry attempts
  timeout: 60000  // Increase timeout to 60s
});
```

### Custom Error Handling

```tsx
const { error, execute } = usePuterTool('tool', input, {
  onError: (error) => {
    if (error.includes('timeout')) {
      // Handle timeout
    } else if (error.includes('unavailable')) {
      // Show offline mode
    } else {
      // Generic error
    }
  }
});
```

## Performance Optimization

### Caching

Responses are automatically cached based on function name and input:

```typescript
// First call - hits API
const result1 = await executeTool(supabase, 'generate-outline', { topic: 'ML' });

// Second call - returns cached result
const result2 = await executeTool(supabase, 'generate-outline', { topic: 'ML' });
```

Clear cache when needed:

```typescript
puterAIIntegration.clearCache();  // Clear all
puterAIIntegration.clearCache('generate-');  // Clear pattern
```

### Batch Execution

Execute multiple tools in parallel:

```tsx
const { results, progress } = usePuterToolsBatch([
  { functionName: 'check-grammar', input: { text } },
  { functionName: 'improve-writing', input: { text } },
  { functionName: 'summarize-text', input: { text } }
]);
```

### Network Optimization

```typescript
// Configure timeouts
puterAIIntegration.setTimeouts(
  60000,  // 60 second timeout
  500     // 500ms initial retry delay
);
```

## Testing

### Run Test Suite

```bash
# All tests
npm run test

# Specific test file
npm run test -- student-dashboard-tools

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

### Test Structure

The test suite includes:

1. **Connectivity Tests** - Verify all tools are accessible
2. **Functionality Tests** - Test tool execution with sample inputs
3. **Performance Tests** - Measure response times
4. **Error Handling Tests** - Verify fallback behavior
5. **Integration Tests** - Test batch execution and caching

### Example Test

```typescript
import { usePuterTool } from '@/hooks/usePuterTool';

it('should generate research questions', async () => {
  const { data, execute } = usePuterTool('generate-research-questions', {
    topic: 'Machine Learning'
  });

  await execute();

  expect(data).toHaveProperty('questions');
  expect(Array.isArray(data.questions)).toBe(true);
});
```

## Troubleshooting

### Tool Returns Fallback

**Cause:** AI service is temporarily unavailable

**Solution:**
1. Check internet connection
2. Verify Supabase credentials
3. Check Supabase function logs
4. Wait and retry

### Timeout Errors

**Cause:** Slow connection or slow AI service

**Solution:**
```typescript
const { execute } = usePuterTool('tool', input, {
  timeout: 60000  // Increase from default 30000
});
```

### All Retries Failed

**Cause:** Persistent service issue

**Solution:**
```typescript
const { fallback, execute } = usePuterTool('tool', input, {
  retries: 5  // Increase retry attempts
});

if (fallback) {
  // Show offline mode message
}
```

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Default Settings

```typescript
// In puter-ai-integration.ts
const defaults = {
  timeout: 30000,        // 30 seconds
  maxRetries: 3,         // Retry 3 times
  retryDelay: 1000,      // Start with 1 second delay
  cacheEnabled: true,    // Cache responses
  checkInterval: 60000   // Health check every minute
};
```

## Best Practices

### 1. Always Handle Loading State
```tsx
const { loading, data } = usePuterTool('tool', input);

if (loading) return <Skeleton />;
return <div>{data}</div>;
```

### 2. Show Fallback Indicator
```tsx
const { fallback } = usePuterTool('tool', input);

if (fallback) {
  return <Badge>Using offline suggestions</Badge>;
}
```

### 3. Use Batch for Multiple Tools
```tsx
// Good
const { results } = usePuterToolsBatch([...]);

// Avoid
const result1 = await executeTool(...);
const result2 = await executeTool(...);
```

### 4. Cache Frequently Used Tools
```tsx
// Automatically cached
const {data: outline} = usePuterTool('generate-outline', topic);
const {data: outline2} = usePuterTool('generate-outline', topic);
// Second call uses cache
```

### 5. Set Reasonable Timeouts
```tsx
const { execute } = usePuterTool('tool', input, {
  timeout: 45000  // 45 seconds for large documents
});
```

## Integration with Existing Features

### 1. Student Dashboard

Puter tools can enhance the quick access items:

```tsx
// In student-dashboard.tsx
const quickAccessItems = [
  {
    icon: BrainCircuit,
    title: "Topic Idea Generator",
    tool: 'generate-topic-ideas'
  },
  // ... more tools
];
```

### 2. Editor Integration

Add AI tools to the rich text editor:

```tsx
// In editor component
const { data: improved } = usePuterTool('improve-writing', {
  text: selectedText
});
```

### 3. Review Tools

Enhance review panels with AI analysis:

```tsx
// In critic-review-panel.tsx
const { data: analysis } = usePuterTool('analyze-document', {
  content: document.content
});
```

## Monitoring & Analytics

### Check Tool Availability

```typescript
const isAvailable = await puterAIIntegration.checkAIAvailability(supabase);
```

### Get Cache Statistics

```typescript
const stats = puterAIIntegration.getCacheStats();
console.log(`${stats.size} items cached`);
```

### Performance Tracking

The test suite includes performance metrics:

```bash
npm run test -- student-dashboard-tools --reporter=verbose
# Shows response times and performance stats
```

## FAQ

**Q: What happens if AI service is down?**
A: The system automatically uses fallback responses while maintaining full functionality.

**Q: How long are responses cached?**
A: Responses are cached for the lifetime of the component/page. Clear with `clearCache()`.

**Q: Can I increase retry attempts?**
A: Yes, pass `retries: 5` to the hook options.

**Q: How do I test tool availability?**
A: Use `checkAIAvailability()` or check the `fallback` flag on responses.

**Q: Can I use this offline?**
A: Yes, fallback responses enable offline functionality.

## Support & Contribution

For issues:
1. Check test output: `npm run test -- student-dashboard-tools`
2. Review Supabase logs for function errors
3. Check network tab in browser DevTools
4. Create GitHub issue with test output

## Version Information

- **Version:** 1.0.0
- **Release Date:** November 19, 2025
- **Node.js:** 18+
- **Next.js:** 15.3.4
- **Supabase:** ^0.7.0

## License

This integration is part of ThesisAI and follows the same license as the main project.
