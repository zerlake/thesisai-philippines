# Direct Puter Connection Setup

This guide sets up direct connection to Puter services without relying on the Puter AI SDK.

## Quick Start

### 1. Environment Variables

Add to `.env.local`:

```env
# Puter API Configuration
NEXT_PUBLIC_PUTER_API_URL=http://localhost:8000
PUTER_API_KEY=your-api-key-if-needed
```

Or for remote Puter instance:

```env
NEXT_PUBLIC_PUTER_API_URL=https://puter-instance.example.com
PUTER_API_KEY=your-api-key
```

### 2. Basic Usage in Components

#### Using the Hook (Recommended)

```tsx
import { usePuterDirect } from '@/hooks/usePuterDirect';

export function MyComponent() {
  const { request, isLoading, error, response } = usePuterDirect({
    showToast: true,
    autoHealthCheck: true,
  });

  const handleGenerate = async () => {
    const result = await request({
      prompt: 'Write a thesis abstract',
      maxTokens: 1024,
      temperature: 0.7,
    });
    
    if (result) {
      console.log(result.text);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Using Streaming

```tsx
const { streamRequest, isStreaming, streamedText } = usePuterDirect();

const handleStream = async () => {
  await streamRequest(
    {
      prompt: 'Write a thesis introduction',
      maxTokens: 2048,
    },
    (chunk, fullText) => {
      console.log('Chunk:', chunk);
      console.log('Full text so far:', fullText);
    }
  );
};
```

#### Using Utility Functions

```tsx
import { generateWithPuter, isPuterAvailable } from '@/lib/puter-compatibility';

// Simple generation
const text = await generateWithPuter({
  prompt: 'Generate thesis questions',
  maxTokens: 1024,
});

// Check availability
const available = await isPuterAvailable();
if (available) {
  console.log('Puter is available');
}

// Stream generation
const text = await generateWithPuter({
  prompt: 'Long generation',
  stream: true,
  onStream: (chunk) => {
    process.stdout.write(chunk);
  },
});

// Batch generation
const results = await batchGenerate([
  'Prompt 1',
  'Prompt 2',
  'Prompt 3',
]);
```

### 3. Configuration

Configure Puter connection globally:

```tsx
import { getPuterConnection } from '@/lib/puter-direct-connection';

// In your app initialization
const puter = getPuterConnection({
  apiBaseUrl: 'http://localhost:8000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});
```

Or in hook:

```tsx
const { updateConfig } = usePuterDirect();

updateConfig({
  apiBaseUrl: 'https://puter.example.com',
  timeout: 60000,
});
```

## API Reference

### `PuterDirectConnection`

Main class for Puter connections.

#### Methods

```typescript
// Make a request
async request(input: PuterRequest): Promise<PuterResponse>

// Stream response
async *stream(input: PuterRequest): AsyncGenerator<string>

// Health check
async healthCheck(): Promise<boolean>

// Get configuration
getConfig(): PuterConnectionConfig

// Update configuration
updateConfig(newConfig: Partial<PuterConnectionConfig>): void

// Check health status
isHealthy(): boolean
```

### `usePuterDirect` Hook

React hook for Puter integration.

#### Returns

```typescript
{
  // State
  isLoading: boolean
  isStreaming: boolean
  error: Error | null
  response: PuterResponse | null
  isHealthy: boolean
  streamedText: string

  // Methods
  request(input: PuterRequest): Promise<PuterResponse | null>
  streamRequest(input: PuterRequest, onChunk?: (chunk: string, fullText: string) => void): Promise<void>
  checkHealth(): Promise<boolean>
  updateConfig(config: Partial<PuterConnectionConfig>): void
  clearError(): void
  clearResponse(): void
}
```

### `usePuterGenerate` Hook

Simplified hook for generation tasks.

```typescript
{
  generate(prompt: string, model?: string): Promise<string>
  isGenerating: boolean
  result: string
  error: Error | null
}
```

## Request Options

```typescript
interface PuterRequest {
  model?: string;           // Model name (default: 'default')
  prompt: string;           // The prompt text
  maxTokens?: number;       // Max tokens (default: 2048)
  temperature?: number;     // Temperature 0-2 (default: 0.7)
  topP?: number;           // Top P sampling (default: 0.9)
  stream?: boolean;        // Enable streaming
}
```

## Response Structure

```typescript
interface PuterResponse {
  id: string;              // Response ID
  text: string;            // Generated text
  model?: string;          // Model used
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;       // Response timestamp
}
```

## Error Handling

All methods include automatic retry with exponential backoff:

```typescript
const { request, error } = usePuterDirect({
  onError: (err) => {
    console.error('Request failed:', err.message);
    // Handle error
  },
});
```

Errors include:
- `Network errors` - Connection failed
- `Timeout` - Request exceeded timeout
- `API errors` - Server returned error status
- `Parsing errors` - Invalid response format

## Health Checks

Automatic health checks are performed:

```typescript
// Manual health check
const { checkHealth, isHealthy } = usePuterDirect();
await checkHealth();

// Health check on request (automatic if autoHealthCheck: true)
const { isHealthy } = usePuterDirect({ autoHealthCheck: true });
```

Health check caches for 5 seconds to avoid excessive requests.

## Debugging

Enable detailed logging:

```typescript
// Environment variable
NEXT_PUBLIC_DEBUG_PUTER=true

// In code
const puter = getPuterConnection();
console.log(puter.getConfig());
```

Check service status:

```typescript
import { getPuterStatus } from '@/lib/puter-compatibility';

const status = await getPuterStatus();
console.log(status);
// { available: true, lastChecked: 1234567890, error?: undefined }
```

## Deployment

### Docker Setup (Puter Local Instance)

```dockerfile
FROM python:3.10

RUN pip install puter-mcp-server

EXPOSE 8000

CMD ["python", "-m", "puter_mcp_server"]
```

### Environment for Production

```env
NEXT_PUBLIC_PUTER_API_URL=https://puter-api.example.com
PUTER_API_KEY=sk-...your-secure-key...
```

### Testing Connection

```bash
# Test endpoint
curl -X GET http://localhost:8000/health

# Test generation
curl -X POST http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello","max_tokens":100}'
```

## Troubleshooting

### "Puter service may be unavailable"

1. Check if Puter service is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_PUTER_API_URL` environment variable
3. Check network connectivity to Puter service

### Timeout errors

1. Increase `timeout` in configuration (default: 30s)
2. Reduce `maxTokens` in request
3. Check Puter service performance

### Streaming not working

1. Ensure response body is readable
2. Check for `stream: true` in request
3. Verify server supports streaming

### API key authentication

1. Set `PUTER_API_KEY` environment variable
2. Or pass in `PuterConnectionConfig`
3. Verify API key is valid

## Migration from Puter SDK

If migrating from Puter AI SDK:

**Before:**
```typescript
import puter from 'puter.js';

const response = await puter.ai.generate(prompt);
```

**After:**
```typescript
import { generateWithPuter } from '@/lib/puter-compatibility';

const text = await generateWithPuter({ prompt });
```

Or with hook:
```typescript
const { request } = usePuterDirect();
const response = await request({ prompt });
```

## Support

For issues with:
- **Direct connection**: Check network and service health
- **Integration**: Review examples above
- **Puter service**: See Puter documentation
