# Serena MCP Server Integration Guide

## Overview

This project now integrates Serena MCP Server with Puter.js and AMP CLI, enabling:
- Multi-agent AI workflows
- Context-aware conversational interactions
- Local/remote model execution via Puter.js
- Session state management and history tracking

## Architecture

```
AMP CLI
   ↓
Serena MCP Server
   ├─ Agent Routing
   ├─ Context Management
   └─ Session State
        ↓
    Puter.js (Model Runtime)
   ├─ Local Models
   ├─ Remote Models
   └─ Model Orchestration
```

## Configuration Files

### 1. amp.json
Main AMP CLI configuration file. Configures Serena as the MCP server.

```json
{
  "selectedAuthType": "none",
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    }
  }
}
```

### 2. puter.config.ts
Puter.js runtime configuration. Define available models and endpoints.

```typescript
const config: PuterConfig = {
  models: {
    default: 'local-llm',
    available: ['local-llm', 'qwen', 'context7'],
  },
  endpoints: {
    local: 'http://localhost:8000',
  },
  timeout: 30000,
  retries: 3,
};
```

## Core Modules

### SerenaClient (src/lib/mcp/serena-client.ts)
Handles communication with Serena MCP Server.

```typescript
import { getSerenaClient } from '@/lib/mcp';

const client = getSerenaClient();
const response = await client.sendRequest({
  task: 'Analyze this text',
  params: { text: 'sample' }
});
```

### PuterAdapter (src/lib/mcp/puter-adapter.ts)
Executes requests against Puter.js model runtime.

```typescript
import { getPuterAdapter } from '@/lib/mcp';

const adapter = getPuterAdapter();
const response = await adapter.execute({
  model: 'local-llm',
  prompt: 'Your prompt here',
  temperature: 0.7
});
```

### MCPOrchestrator (src/lib/mcp/orchestrator.ts)
Coordinates between AMP CLI, Serena, and Puter.js.

```typescript
import { getOrchestrator } from '@/lib/mcp';

const orchestrator = getOrchestrator();
const result = await orchestrator.executeWorkflow([
  {
    name: 'analyze',
    task: 'Analyze the document',
    model: 'local-llm'
  },
  {
    name: 'summarize',
    task: 'Create a summary',
  }
]);
```

## React Integration

### useMCP Hook
Use MCP in React components with automatic state management.

```typescript
'use client';

import { useMCP } from '@/hooks/useMCP';

export function MyComponent() {
  const { executeTask, isLoading, result, error } = useMCP();

  const handleAnalyze = async () => {
    await executeTask('Analyze this text');
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && <p>{JSON.stringify(result)}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### MCPProvider
Wrap your app to provide MCP context.

```typescript
import { MCPProvider } from '@/components/mcp/MCPProvider';

export default function RootLayout() {
  return (
    <MCPProvider>
      <YourApp />
    </MCPProvider>
  );
}
```

## Usage Examples

### Simple Task Execution
```typescript
const { executeTask } = useMCP();
const result = await executeTask('Summarize this research paper');
```

### Multi-Step Workflow
```typescript
const { executeWorkflow } = useMCP();
const result = await executeWorkflow([
  {
    name: 'extract',
    task: 'Extract key findings from the paper'
  },
  {
    name: 'analyze',
    task: 'Analyze the methodology'
  },
  {
    name: 'critique',
    task: 'Provide critical assessment'
  }
]);
```

### Task Chaining with Context
```typescript
const { chainTasks } = useMCP();
const result = await chainTasks([
  {
    prompt: 'Identify research gaps in AI education',
    systemPrompt: 'You are a research analyst'
  },
  {
    prompt: 'Based on the gaps, suggest study directions',
  }
]);
```

### Context Management
```typescript
const { getContext, setMetadata, clearHistory } = useMCP();

// Store metadata
setMetadata('userId', 'user123');
setMetadata('documentId', 'doc456');

// Get current context
const context = getContext();
console.log(context.conversationHistory);

// Clear history between sessions
clearHistory();
```

## Environment Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Puter.js
```bash
# Install Puter.js locally or configure remote endpoint
# For local setup, ensure it's running on http://localhost:8000
```

### 3. Install and Configure Serena
```bash
# Serena will be installed via uvx when AMP CLI invokes it
# Ensure uvx is installed: pip install uv
```

### 4. Environment Variables
Add to `.env.local`:
```
PUTER_LOCAL_ENDPOINT=http://localhost:8000
PUTER_REMOTE_ENDPOINT=https://api.puter.ai
SERENA_URL=http://localhost:3000
```

## Workflow Builder Utilities

Create predefined workflows quickly:

```typescript
import {
  createTextAnalysisWorkflow,
  createResearchWorkflow,
  createCodeReviewWorkflow
} from '@/lib/mcp/utils';

// Text analysis
const textSteps = createTextAnalysisWorkflow('Your text here');

// Research
const researchSteps = createResearchWorkflow('Your topic');

// Code review
const codeSteps = createCodeReviewWorkflow('Your code');
```

## Best Practices

1. **Use the Hook in Components**: Always use `useMCP()` instead of direct client access in React
2. **Error Handling**: Always catch and handle promises from MCP operations
3. **Context Management**: Use `setMetadata()` to track important session data
4. **Resource Cleanup**: Call `clearHistory()` when appropriate to manage memory
5. **Model Selection**: Specify model explicitly when you have specific requirements
6. **Timeout Handling**: Use `withTimeout()` utility for long-running operations
7. **Task Naming**: Use `sanitizeTaskName()` for consistent task identification

## Troubleshooting

### Serena Connection Issues
- Ensure `uvx` is installed: `pip install uv`
- Check that Serena repository is accessible: `https://github.com/oraios/serena`
- Verify MCP server is running: Check logs for startup messages

### Puter.js Connection Issues
- Verify endpoint is correct in `puter.config.ts`
- Check that Puter.js service is running (local or remote)
- Ensure network connectivity and firewall rules allow connection

### Context Not Persisting
- Use `MCPProvider` at top level of app
- Don't create new orchestrator instances; use singletons via `getOrchestrator()`
- Verify `setMetadata()` is called before operations

## Integration with Thesis-AI Features

### Research Gap Identifier
```typescript
const result = await executeWorkflow(
  createResearchWorkflow('Your research topic')
);
```

### Document Analysis
```typescript
const result = await chainTasks([
  { prompt: `Extract insights from: ${document}` },
  { prompt: 'Suggest improvements based on the insights' }
]);
```

### AI Assistant
```typescript
const { chainTasks } = useMCP();
// Use for intelligent question-answering and content generation
```

## Performance Monitoring

Monitor execution times:
```typescript
const result = await executeWorkflow(steps);
console.log(`Total execution: ${result.totalExecutionTime}ms`);
result.steps.forEach(step => {
  console.log(`${step.name}: ${step.result?.executionTime}ms`);
});
```

## Security Considerations

1. **API Keys**: Store all sensitive keys in `.env.local`
2. **Session Isolation**: Each session has unique ID; use for audit trails
3. **Context Sanitization**: Be careful with PII in conversation history
4. **Rate Limiting**: Implement rate limiting for Puter.js calls if needed

## Next Steps

1. Test integration with `npm run test`
2. Configure production endpoints in deployment
3. Implement monitoring/logging for production
4. Create domain-specific workflow builders for your use cases
5. Integrate with existing thesis-ai components

## References

- [Serena MCP Server](https://github.com/oraios/serena)
- [Puter.js Documentation](https://puter.com)
- [MCP Protocol](https://modelcontextprotocol.io)
