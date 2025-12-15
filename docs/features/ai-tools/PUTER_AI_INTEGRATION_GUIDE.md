# Puter AI Integration Guide

## Overview

This guide explains how to use the Puter.js AI integration for the ThesisAI student dashboard. The integration provides:

- **Seamless AI Tool Execution**: Execute AI functions with automatic retry logic
- **Fallback Support**: Graceful degradation when AI services are unavailable
- **Caching**: Reduce API calls by caching responses
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance Monitoring**: Track response times and tool availability

## Quick Start

### Basic Usage with Hooks

```tsx
import { usePuterTool } from '@/hooks/usePuterTool';

export function MyComponent() {
  const { data, error, loading, execute } = usePuterTool(
    'generate-research-questions',
    { topic: 'Machine Learning' }
  );

  return (
    <div>
      <button onClick={() => execute()}>Generate Questions</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Direct Function Usage

```tsx
import { executeTool } from '@/lib/puter-ai-integration';
import { useAuth } from '@/components/auth-provider';

export function MyComponent() {
  const { supabase } = useAuth();

  async function handleExecute() {
    const response = await executeTool(
      supabase,
      'generate-outline',
      { topic: 'Machine Learning', level: 'thesis' },
      { timeout: 30000, retries: 3 }
    );

    if (response.success) {
      console.log('Result:', response.data);
      if (response.fallback) {
        console.log('Using fallback response');
      }
    } else {
      console.error('Error:', response.error);
    }
  }

  return <button onClick={handleExecute}>Generate Outline</button>;
}
```

## Available Tools

### Topic & Idea Generation
- `generate-topic-ideas` - Generate thesis topic ideas
- `generate-research-questions` - Generate research questions

### Writing Tools
- `generate-outline` - Generate thesis outline
- `generate-introduction` - Generate introduction section
- `generate-methodology` - Generate methodology section
- `generate-results-section` - Generate results section
- `generate-conclusion` - Generate conclusion section

### Text Processing
- `paraphrase-text` - Paraphrase text content
- `improve-writing` - Improve writing quality
- `check-grammar` - Check grammar and syntax
- `summarize-text` - Summarize long text

### Analysis Tools
- `analyze-document` - Analyze document structure and content
- `analyze-article` - Analyze research articles
- `check-plagiarism` - Check for originality/plagiarism
- `map-variables` - Map research variables

### Presentation & Defense
- `generate-presentation-slides` - Generate presentation slides
- `generate-defense-questions` - Generate practice defense questions
- `generate-flashcards` - Generate flashcards

### Advanced Tools
- `identify-research-gaps` - Identify research gaps
- `analyze-statistics` - Perform statistical analysis
- `check-format-compliance` - Check university format compliance

## API Reference

### usePuterTool Hook

```typescript
const {
  data,           // Response data from the tool
  error,          // Error message if failed
  loading,        // Loading state
  fallback,       // Whether fallback was used
  execute,        // Function to execute the tool
  reset           // Function to reset state
} = usePuterTool(
  functionName,   // Name of the AI function
  input,          // Input parameters (optional)
  {
    timeout: 30000,           // Request timeout in ms
    retries: 3,               // Number of retry attempts
    required: false,          // If true, won't use fallback
    autoExecute: false,       // Execute on mount
    onSuccess: (data) => {},  // Success callback
    onError: (error) => {}    // Error callback
  }
);
```

### usePuterToolsBatch Hook

Execute multiple tools in parallel:

```typescript
const {
  results,        // Array of responses
  error,          // Error message if batch failed
  loading,        // Loading state
  progress,       // Progress percentage (0-100)
  execute,        // Function to execute the batch
  reset           // Function to reset state
} = usePuterToolsBatch([
  {
    functionName: 'check-grammar',
    input: { text: content },
    options: { retries: 2 }
  },
  {
    functionName: 'improve-writing',
    input: { text: content },
    options: { retries: 2 }
  }
]);
```

### executeTool Function

```typescript
const response: PuterAIResponse = await executeTool(
  supabaseClient,
  'function-name',
  { param1: 'value1' },
  {
    timeout: 30000,
    retries: 3,
    required: false
  }
);

// Response structure
if (response.success) {
  const data = response.data;           // Tool output
  const wasFallback = response.fallback; // Was fallback used?
  const retries = response.retryCount;   // Number of retries
} else {
  const error = response.error; // Error message
}
```

## Error Handling

### Automatic Fallback

When AI services are unavailable, the system automatically uses fallback responses:

```tsx
const { data, fallback } = usePuterTool('generate-topic-ideas', { field: 'CS' });

if (fallback) {
  console.log('Using cached/fallback suggestions');
}
```

### Retry Logic

The integration includes automatic retry logic with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 seconds delay
Attempt 4: 4 seconds delay
```

### Error Messages

```tsx
const { error } = usePuterTool('generate-outline', { topic });

if (error) {
  if (error.includes('timeout')) {
    // Handle timeout
  } else if (error.includes('unavailable')) {
    // Handle service unavailable
  } else {
    // Handle other errors
  }
}
```

## Caching

### How Caching Works

Responses are cached based on function name and input parameters. The same input will return cached results without making a new API call.

```tsx
// First call - makes API request
const response1 = await executeTool(supabase, 'generate-outline', { topic: 'ML' });

// Second call - returns cached result
const response2 = await executeTool(supabase, 'generate-outline', { topic: 'ML' });
```

### Cache Management

```typescript
import { puterAIIntegration } from '@/lib/puter-ai-integration';

// Clear all cache
puterAIIntegration.clearCache();

// Clear cache for specific pattern
puterAIIntegration.clearCache('generate-');

// Get cache statistics
const stats = puterAIIntegration.getCacheStats();
console.log(`Cached items: ${stats.size}`);
console.log(stats.keys);
```

## Performance Optimization

### Set Custom Timeouts

```typescript
puterAIIntegration.setTimeouts(
  60000,  // Timeout in ms
  500     // Retry delay in ms
);
```

### Batch Execution

Use batch execution for better performance when running multiple tools:

```tsx
const tools = [
  { functionName: 'check-grammar', input: { text } },
  { functionName: 'improve-writing', input: { text } },
  { functionName: 'summarize-text', input: { text } }
];

const { results } = usePuterToolsBatch(tools);
```

## Integration Testing

Run the integration test suite:

```bash
# Run all tests
npm run test

# Run only Puter integration tests
npm run test -- student-dashboard-tools

# Run with verbose output
npm run test -- student-dashboard-tools --reporter=verbose
```

### Test Coverage

The test suite includes:

- **Connectivity Tests**: Verify all tools are accessible
- **Functionality Tests**: Test tool execution with sample inputs
- **Fallback Tests**: Verify fallback behavior when services are unavailable
- **Performance Tests**: Measure response times
- **Batch Tests**: Test parallel execution

## Troubleshooting

### Tool Returns Fallback Response

This means the AI service is temporarily unavailable:

1. Check your internet connection
2. Verify Supabase credentials are correct
3. Check if the Supabase function is deployed
4. Review recent errors in Supabase dashboard

```tsx
if (response.fallback) {
  // Show UI indicator
  <Badge variant="outline">Using offline suggestions</Badge>
}
```

### Timeout Errors

Increase timeout for slow connections:

```tsx
const { execute } = usePuterTool('generate-outline', input, {
  timeout: 60000  // 60 seconds instead of default 30
});
```

### Retry Limit Exceeded

Increase retry attempts:

```tsx
const { execute } = usePuterTool('generate-outline', input, {
  retries: 5  // Try up to 5 times
});
```

## Best Practices

### 1. Always Handle Errors

```tsx
const { data, error, fallback } = usePuterTool('tool', input);

if (error) {
  toast.error('Tool failed, showing suggestions');
} else if (fallback) {
  toast.info('Using offline mode');
} else {
  // Use AI-generated data
}
```

### 2. Show Loading State

```tsx
const { loading } = usePuterTool('tool', input);

if (loading) {
  return <Skeleton />;
}
```

### 3. Cache Frequently Used Tools

```tsx
// This will be cached automatically
const { data: outline1 } = usePuterTool('generate-outline', { topic: 'ML' });
const { data: outline2 } = usePuterTool('generate-outline', { topic: 'ML' });
// outline2 comes from cache
```

### 4. Use Batch for Multiple Tools

```tsx
// Better than sequential calls
const { results } = usePuterToolsBatch([
  { functionName: 'check-grammar', input },
  { functionName: 'improve-writing', input },
  { functionName: 'summarize-text', input }
]);
```

### 5. Mark Required Tools

```tsx
// This tool is essential - won't use fallback
const { data } = usePuterTool('generate-outline', input, {
  required: true
});
```

## Architecture

### Component Diagram

```
┌─────────────────────────────────────┐
│    React Components                 │
│  (use usePuterTool hook)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    usePuterTool Hook                │
│  (handles state & callbacks)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Puter AI Integration              │
│  (executeTool function)             │
│  - Caching                          │
│  - Retry logic                      │
│  - Fallback handling                │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ┌───▼───┐    ┌───▼────┐
    │Supabase   │Fallback│
    │Functions  │Cache   │
    └─────────┘ └────────┘
```

### Data Flow

1. Component calls `usePuterTool` or `executeTool`
2. Check if result is cached
3. If cached, return immediately
4. If not cached, attempt API call with timeout
5. If API fails, retry with exponential backoff
6. If all retries fail, use fallback response
7. Cache successful response
8. Return response to component

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Default Settings

```typescript
// Can be customized via puterAIIntegration.setTimeouts()
timeout: 30000           // 30 seconds
retryDelay: 1000        // 1 second initial delay
maxRetries: 3           // Try up to 3 times
cacheEnabled: true      // Cache responses
```

## Migration from Old System

If migrating from an older implementation:

```tsx
// Old way
const result = await supabase.functions.invoke('tool', { body: input });

// New way
const result = await executeTool(supabase, 'tool', input);

// With hook
const { data, execute } = usePuterTool('tool', input);
```

## Contributing

To add a new tool to the fallback responses:

1. Add entry to `FALLBACK_RESPONSES` in `puter-ai-integration.ts`
2. Add test case in `student-dashboard-tools.test.ts`
3. Update this documentation
4. Run tests to verify

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review test results in test output
3. Check Supabase function logs
4. Create GitHub issue with detailed information

## Version History

- **v1.0.0** (Nov 2025): Initial Puter.js integration with fallback support
  - Automatic retry logic
  - Caching system
  - React hooks
  - Comprehensive test suite

