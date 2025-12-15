# Serena MCP Server - Quick Start Guide

## What You Get

- **Serena MCP Server**: Context-aware AI orchestration
- **Puter.js Integration**: Local/remote model execution
- **AMP CLI Support**: Conversational AI agent workflows
- **React Hooks & Components**: Easy integration in Next.js

## 5-Minute Setup

### 1. Run Setup Script (Optional)
```bash
# Automatic setup (Node.js)
npm run setup:mcp

# OR Manual setup (3 minutes):
pnpm install
mkdir -p src/lib/mcp src/hooks src/components/mcp .checkpoints
echo 'PUTER_LOCAL_ENDPOINT=http://localhost:8000' >> .env.local
echo 'SERENA_URL=http://localhost:3000' >> .env.local
```

What this does:
- ✓ Installs dependencies
- ✓ Creates required directories
- ✓ Configures environment variables

### 2. Configure Environment
Edit `.env.local`:
```
PUTER_LOCAL_ENDPOINT=http://localhost:8000
SERENA_URL=http://localhost:3000
```

### 3. Start Puter.js (if using local)
```bash
# Ensure Puter.js is running on localhost:8000
# Or use a remote endpoint
```

## Usage Patterns

### Pattern 1: Simple Component Integration
```typescript
'use client';

import { useMCP } from '@/hooks/useMCP';

export default function AnalysisComponent() {
  const { executeTask, isLoading, result } = useMCP();

  return (
    <div>
      <button 
        onClick={() => executeTask('Analyze this text')}
        disabled={isLoading}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### Pattern 2: Multi-Step Workflow
```typescript
const { executeWorkflow } = useMCP();

const steps = [
  { name: 'extract', task: 'Extract key points' },
  { name: 'summarize', task: 'Create summary' },
  { name: 'critique', task: 'Provide feedback' }
];

const results = await executeWorkflow(steps);
```

### Pattern 3: Task Chaining
```typescript
const { chainTasks } = useMCP();

const output = await chainTasks([
  { prompt: 'Identify research gaps in AI education' },
  { prompt: 'Suggest 3 research directions based on gaps' }
]);
```

### Pattern 4: Context Management
```typescript
const { getContext, setMetadata } = useMCP();

// Store user/document info
setMetadata('userId', 'user123');
setMetadata('documentId', 'doc456');

// Access context later
const context = getContext();
console.log(context.conversationHistory); // All previous interactions
```

## Common Use Cases for thesis-ai

### 1. Research Gap Identifier
```typescript
import { createResearchWorkflow } from '@/lib/mcp/utils';
import { useMCP } from '@/hooks/useMCP';

const { executeWorkflow } = useMCP();
const steps = createResearchWorkflow('Your research topic');
const results = await executeWorkflow(steps);
```

### 2. Document Analysis
```typescript
const { chainTasks } = useMCP();

const analysis = await chainTasks([
  {
    prompt: `Analyze this document: ${documentText}`,
    systemPrompt: 'You are a document analyst'
  },
  {
    prompt: 'Identify main themes and provide recommendations'
  }
]);
```

### 3. Grammar & Style Check
```typescript
const { executeTask } = useMCP();

const feedback = await executeTask(
  `Check grammar and style for: ${text}`,
  'local-llm' // Specify model
);
```

### 4. Topic Generation
```typescript
const { executeTask } = useMCP();

const topics = await executeTask(
  'Generate 5 research topics related to: ' + domain
);
```

## Testing Integration

```bash
# Run MCP tests
npm run test:mcp

# Run all tests
npm run test

# Test with UI
npm run test:ui
```

## File Structure
```
thesis-ai/
├── amp.json                          # AMP CLI config
├── puter.config.ts                   # Puter.js config
├── src/
│   ├── lib/mcp/
│   │   ├── serena-client.ts         # Serena communication
│   │   ├── puter-adapter.ts         # Model execution
│   │   ├── orchestrator.ts          # Workflow coordination
│   │   ├── utils.ts                 # Helper functions
│   │   ├── index.ts                 # Exports
│   │   └── __tests__/               # Tests
│   ├── hooks/
│   │   └── useMCP.ts                # React hook
│   └── components/mcp/
│       └── MCPProvider.tsx          # Context provider
└── scripts/
    └── setup-mcp.ps1               # Setup script
```

## Workflow Examples

### Text Analysis Pipeline
```typescript
const workflow = [
  {
    name: 'tokenize',
    task: 'Break down text into semantic units'
  },
  {
    name: 'analyze',
    task: 'Analyze tone, clarity, and structure'
  },
  {
    name: 'improve',
    task: 'Suggest improvements'
  }
];

const results = await executeWorkflow(workflow);
```

### Research Pipeline
```typescript
const workflow = createResearchWorkflow('AI in Education');
// Automatically:
// 1. Identifies gaps
// 2. Summarizes literature  
// 3. Provides recommendations
```

## Debugging

### Check Puter.js Connection
```typescript
import { getPuterAdapter } from '@/lib/mcp';

const adapter = getPuterAdapter();
const response = await adapter.execute({
  model: 'local-llm',
  prompt: 'Hello, is this working?'
});
console.log(response);
```

### Check Serena Connection
```typescript
import { getSerenaClient } from '@/lib/mcp';

const client = getSerenaClient();
const context = client.getContext();
console.log('Session ID:', context.sessionId);
```

### Monitor Execution
```typescript
const { executeTask } = useMCP();

try {
  const result = await executeTask('Test prompt');
  console.log('Execution time:', result.executionTime);
  console.log('Result:', result.result);
} catch (error) {
  console.error('Execution failed:', error);
}
```

## Troubleshooting

### "Serena not reachable"
- Check uvx installation: `where uvx`
- Verify network connectivity
- Check amp.json configuration

### "Puter.js endpoint not responding"
- Ensure Puter.js service is running
- Check endpoint in .env.local
- Verify firewall allows connection

### "Context not persisting"
- Use `MCPProvider` at app root
- Don't create new orchestrator instances
- Use `getOrchestrator()` for singleton access

### "Model not found"
- Check available models in `puter.config.ts`
- Verify model is installed/available
- Try default model first

## Next Steps

1. **Integrate with Components**
   - Wrap root layout with `MCPProvider`
   - Use `useMCP` hook in components

2. **Build Domain Workflows**
   - Create custom workflow builders
   - Test with your specific use cases

3. **Deploy**
   - Configure production endpoints
   - Set up monitoring/logging
   - Security audit for production

4. **Optimize**
   - Cache frequent queries
   - Implement rate limiting
   - Monitor performance

## Resources

- [Serena MCP Server Docs](https://github.com/oraios/serena)
- [Puter.js Documentation](https://puter.com)
- [Full Integration Guide](./SERENA_MCP_INTEGRATION.md)

## Support

For issues or questions:
1. Check [SERENA_MCP_INTEGRATION.md](./SERENA_MCP_INTEGRATION.md) for detailed docs
2. Review test files in `src/lib/mcp/__tests__/`
3. Check component examples in `src/components/mcp/`
