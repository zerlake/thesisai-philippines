# MCP Integration - Command Reference Card

## Installation & Setup

```bash
# Initial setup (automated)
npm run setup:mcp

# Manual dependency installation
npm install
# or
pnpm install

# Install uv for Serena (if needed)
pip install uv

# Install Puter.js locally (if using local endpoint)
# Follow https://puter.com installation guide
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code (if eslint has format)
npm run lint -- --fix
```

## Testing

```bash
# Run all tests
npm run test

# Run MCP tests only
npm run test:mcp

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode (continuous testing)
npm run test -- --watch
```

## Verification & Debugging

```bash
# Verify AMP configuration
npm run verify-amp

# Check MCP health (if endpoint is running)
curl http://localhost:3000/health

# Check Puter.js health (if running locally)
curl http://localhost:8000/health

# Test Serena MCP server
uvx --from git+https://github.com/oraios/serena serena start-mcp-server
```

## React Integration - Code Snippets

### Basic Setup

```typescript
// In your root layout (app/layout.tsx)
'use client';

import { MCPProvider } from '@/components/mcp/MCPProvider';

export default function RootLayout({ children }) {
  return (
    <MCPProvider>
      {children}
    </MCPProvider>
  );
}
```

### Using MCP Hook

```typescript
'use client';

import { useMCP } from '@/hooks/useMCP';

export function MyComponent() {
  const { executeTask, isLoading, result, error } = useMCP();

  return (
    <div>
      <button 
        onClick={() => executeTask('Your prompt')}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Execute'}
      </button>
      {result && <p>{JSON.stringify(result)}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Workflow Execution

```typescript
import { useMCP } from '@/hooks/useMCP';
import { createResearchWorkflow } from '@/lib/mcp/utils';

const { executeWorkflow } = useMCP();

const steps = createResearchWorkflow('Your topic');
const results = await executeWorkflow(steps);
```

### Task Chaining

```typescript
const { chainTasks } = useMCP();

const output = await chainTasks([
  { prompt: 'Step 1 prompt' },
  { prompt: 'Step 2 prompt' }
]);
```

## Configuration

### Environment Variables (.env.local)

```bash
# Puter.js Configuration
PUTER_LOCAL_ENDPOINT=http://localhost:8000
PUTER_REMOTE_ENDPOINT=https://api.puter.ai

# Serena MCP Configuration
SERENA_URL=http://localhost:3000

# Optional: Other MCP settings
MCP_DEBUG=false
MCP_LOG_LEVEL=info
```

### amp.json Configuration

```json
{
  "selectedAuthType": "none",
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    }
  },
  "settings": {
    "serverPort": 3000,
    "mcpDebug": false,
    "logLevel": "info"
  }
}
```

### puter.config.ts

```typescript
import { type PuterConfig } from './puter.config';

const config: PuterConfig = {
  models: {
    default: 'local-llm',
    available: ['local-llm', 'qwen', 'context7']
  },
  endpoints: {
    local: process.env.PUTER_LOCAL_ENDPOINT || 'http://localhost:8000',
    remote: process.env.PUTER_REMOTE_ENDPOINT
  },
  timeout: 30000,
  retries: 3,
  cache: {
    enabled: true,
    ttl: 3600000
  }
};
```

## Common Workflow Patterns

### Pattern 1: Simple Task

```typescript
const { executeTask } = useMCP();
const result = await executeTask('Summarize this text');
```

### Pattern 2: Research Workflow

```typescript
const { executeWorkflow } = useMCP();
const steps = createResearchWorkflow('AI in Education');
const results = await executeWorkflow(steps);
```

### Pattern 3: Multi-Step Analysis

```typescript
const { executeWorkflow } = useMCP();
const results = await executeWorkflow([
  {
    name: 'extract',
    task: 'Extract key information'
  },
  {
    name: 'analyze',
    task: 'Analyze the extracted information'
  },
  {
    name: 'suggest',
    task: 'Suggest improvements'
  }
]);
```

### Pattern 4: Context Chaining

```typescript
const { chainTasks } = useMCP();
const result = await chainTasks([
  {
    prompt: 'Identify gaps in current research',
    systemPrompt: 'You are a research analyst'
  },
  {
    prompt: 'Based on gaps, suggest 3 research directions',
    temperature: 0.7
  }
]);
```

### Pattern 5: Context Management

```typescript
const { 
  setMetadata, 
  getContext, 
  clearHistory 
} = useMCP();

// Store information
setMetadata('userId', 'user123');
setMetadata('documentId', 'doc456');

// Retrieve context
const context = getContext();
console.log(context.conversationHistory);
console.log(context.metadata);

// Clear for new session
clearHistory();
```

## Utility Functions

```typescript
import {
  createWorkflowStep,
  createTextAnalysisWorkflow,
  createResearchWorkflow,
  createCodeReviewWorkflow,
  buildPrompt,
  parseWorkflowResponse,
  formatExecutionResults,
  withTimeout,
  sanitizeTaskName
} from '@/lib/mcp/utils';

// Create custom step
const step = createWorkflowStep(
  'myTask',
  'Do something',
  { param1: 'value1' },
  'local-llm'
);

// Build structured prompt
const prompt = buildPrompt(
  'You are an expert analyst',
  'Analyze this text',
  'Context from previous step'
);

// Parse response
const parsed = parseWorkflowResponse(response);

// Format results for display
const formatted = formatExecutionResults(results);

// Add timeout to long operations
const result = await withTimeout(
  executeWorkflow(steps),
  30000 // 30 seconds
);

// Sanitize task names
const taskName = sanitizeTaskName('My Task!@#');
// Result: 'my-task'
```

## Direct API Usage (Advanced)

### SerenaClient

```typescript
import { getSerenaClient } from '@/lib/mcp';

const client = getSerenaClient();

// Send request
const response = await client.sendRequest({
  task: 'Your task',
  params: { key: 'value' }
});

// Execute workflow
const results = await client.executeWorkflow([
  { name: 'step1', task: 'Do something' }
]);

// Get context
const context = client.getContext();

// Manage metadata
client.setMetadata('key', 'value');
client.clearHistory();

// Cleanup
client.disconnect();
```

### PuterAdapter

```typescript
import { getPuterAdapter } from '@/lib/mcp';

const adapter = getPuterAdapter();

// Execute single request
const response = await adapter.execute({
  model: 'local-llm',
  prompt: 'Your prompt',
  temperature: 0.7,
  maxTokens: 1024
});

// Execute multiple requests
const responses = await adapter.executeMultiple([
  { model: 'local-llm', prompt: 'Prompt 1' },
  { model: 'local-llm', prompt: 'Prompt 2' }
]);

// Change endpoint
adapter.setEndpoint('http://localhost:8000');

// Get config
const config = adapter.getConfig();
```

### MCPOrchestrator

```typescript
import { getOrchestrator } from '@/lib/mcp';

const orchestrator = getOrchestrator();

// Execute workflow
const result = await orchestrator.executeWorkflow([
  { name: 'step1', task: 'Do something' }
]);

// Chain tasks with context
const output = await orchestrator.chainTasks([
  { prompt: 'Step 1' },
  { prompt: 'Step 2' }
]);

// Manage context
const context = orchestrator.getSerenaContext();
orchestrator.setSerenaMetadata('key', 'value');
orchestrator.clearSerenaHistory();

// Cleanup
orchestrator.disconnect();
```

## Error Handling

```typescript
import { useMCP } from '@/hooks/useMCP';

export function MyComponent() {
  const { executeTask, error, result } = useMCP();

  const handleExecute = async () => {
    try {
      const result = await executeTask('Prompt');
      console.log('Success:', result);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}
      {result && <pre>{JSON.stringify(result)}</pre>}
    </div>
  );
}
```

## Monitoring & Debugging

```typescript
// Check execution time
const result = await executeTask('Prompt');
console.log(`Execution time: ${result.executionTime}ms`);

// Monitor context size
const context = getContext();
console.log(`History items: ${context.conversationHistory.length}`);

// Check metadata
console.log('Metadata:', context.metadata);

// Track workflow execution
const result = await executeWorkflow(steps);
console.log(`Total time: ${result.totalExecutionTime}ms`);
result.steps.forEach(step => {
  console.log(`${step.name}: ${step.status}`);
});
```

## Performance Optimization

```typescript
// Use batch operations for multiple tasks
const responses = await adapter.executeMultiple(requests);

// Implement caching
setMetadata('cache-key', { data: 'cached' });

// Use appropriate timeouts
import { withTimeout } from '@/lib/mcp/utils';
const result = await withTimeout(executeTask('Prompt'), 10000);

// Monitor slow operations
if (result.executionTime > 5000) {
  console.warn('Slow execution:', result.executionTime);
}
```

## Troubleshooting Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check ESLint
npm run lint

# Test specific MCP test file
npm run test:mcp -- serena-client.test

# Check Serena connectivity
curl -X GET http://localhost:3000/health

# Check Puter.js connectivity
curl -X GET http://localhost:8000/health

# View available models
curl -X GET http://localhost:8000/models

# Test Puter.js execution
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"local-llm","prompt":"Hello"}'
```

## File Reference

| File | Purpose | Import |
|------|---------|--------|
| `serena-client.ts` | Serena communication | `import { getSerenaClient } from '@/lib/mcp'` |
| `puter-adapter.ts` | Model execution | `import { getPuterAdapter } from '@/lib/mcp'` |
| `orchestrator.ts` | Workflow engine | `import { getOrchestrator } from '@/lib/mcp'` |
| `utils.ts` | Helpers | `import { createResearchWorkflow } from '@/lib/mcp/utils'` |
| `useMCP.ts` | React hook | `import { useMCP } from '@/hooks/useMCP'` |
| `MCPProvider.tsx` | Context provider | `import { MCPProvider } from '@/components/mcp/MCPProvider'` |

## Quick Links

- [Quick Start Guide](./MCP_QUICKSTART.md)
- [Complete Integration Guide](./SERENA_MCP_INTEGRATION.md)
- [Implementation Checklist](./MCP_IMPLEMENTATION_CHECKLIST.md)
- [Implementation Summary](./SERENA_MCP_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** November 22, 2025  
**Status:** Ready for use in thesis-ai
