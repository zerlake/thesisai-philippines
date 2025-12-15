# AI Service Provider Setup

Complete guide to set up AI generation with multiple providers and automatic fallback.

## Overview

The system supports 3 AI providers with automatic fallback:

1. **Puter** (local/remote) - Primary choice
2. **OpenAI** - High-quality fallback
3. **Mock Data** - Offline fallback

## Quick Start (No Setup Required)

The system works out of the box with mock data:

```tsx
import { useAIService } from '@/hooks/useAIService';

export function MyComponent() {
  const { generate, isLoading, response, lastProvider } = useAIService();

  const handleGenerate = async () => {
    await generate('Write a thesis abstract');
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>Generate</button>
      {response && <p>{response.text}</p>}
      <p>Provider: {lastProvider}</p>
    </div>
  );
}
```

This will use mock data by default.

## Option 1: Use OpenAI (Recommended for Production)

### 1. Get OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy key

### 2. Configure Environment

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-...your-api-key...
```

### 3. The system will automatically:
- Enable OpenAI provider
- Use it as fallback if Puter unavailable
- Use mock data if OpenAI also fails

### 4. Usage (No code changes needed!)

```tsx
const { generate, lastProvider } = useAIService();
await generate('Write abstract');
console.log(lastProvider); // 'openai' or 'mock'
```

## Option 2: Set Up Local Puter Instance

### Method 1: Docker (Recommended)

```bash
# 1. Create docker-compose.yml
version: '3.8'
services:
  puter:
    image: puter/puter-mcp-server:latest
    ports:
      - "8000:8000"
    environment:
      - MODEL=llama2  # or another model
    volumes:
      - puter-data:/app/data

volumes:
  puter-data:
```

```bash
# 2. Start
docker-compose up -d

# 3. Test
curl http://localhost:8000/health
```

### Method 2: Python Installation

```bash
# 1. Install
pip install puter-mcp-server

# 2. Run
python -m puter_mcp_server

# 3. Access at http://localhost:8000
```

### Method 3: From Source

```bash
git clone https://github.com/shayne/puter.git
cd puter
python -m puter_mcp_server
```

### 4. Configure Environment

Add to `.env.local`:

```env
NEXT_PUBLIC_PUTER_API_URL=http://localhost:8000
# PUTER_API_KEY=optional-if-auth-required
```

### 5. Usage (No code changes!)

```tsx
const { generate, lastProvider } = useAIService();
await generate('Write abstract');
console.log(lastProvider); // 'puter' if available, else 'openai'/'mock'
```

## Option 3: Deploy Puter to Cloud

### Heroku

```bash
# 1. Create app
heroku create your-puter-app

# 2. Set buildpack
heroku buildpacks:set heroku/python

# 3. Deploy
git push heroku main

# 4. Configure
NEXT_PUBLIC_PUTER_API_URL=https://your-puter-app.herokuapp.com
```

### Railway

```bash
# 1. Connect repo to Railway
railway link

# 2. Deploy
railway up

# 3. Get public URL from Railway dashboard
# 4. Set environment variable
NEXT_PUBLIC_PUTER_API_URL=https://your-railway-app.railway.app
```

### AWS Lambda + API Gateway

```bash
# Use serverless framework
serverless deploy

# Get API endpoint and configure
NEXT_PUBLIC_PUTER_API_URL=https://api.example.com
```

## Configuration Priority

System checks providers in order:

```
NEXT_PUBLIC_PUTER_API_URL set?
  ├─ Yes → Enable Puter (primary)
  │         └─ Available?
  │           ├─ Yes → Use Puter ✓
  │           └─ No → Fall to next
  │
  └─ No → Check OpenAI
           OPENAI_API_KEY set?
           ├─ Yes → Enable OpenAI
           │         └─ Available?
           │           ├─ Yes → Use OpenAI ✓
           │           └─ No → Fall to next
           │
           └─ No → Check Mock
                   └─ Always available ✓
```

## Advanced Configuration

### Custom Provider Setup

```tsx
import { getAIServiceProvider } from '@/lib/ai-service-provider';

const aiService = getAIServiceProvider({
  primaryProvider: 'openai',
  fallbackProviders: ['puter', 'mock'],
  providers: {
    puter: {
      apiUrl: 'https://custom-puter.example.com',
      apiKey: 'custom-key',
      enabled: true,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      enabled: !!process.env.OPENAI_API_KEY,
    },
    mock: {
      enabled: true,
    },
  },
});
```

### Check Provider Availability

```tsx
const { checkProviders, lastProvider } = useAIService();

const status = await checkProviders();
// { puter: true, openai: false, mock: true }

console.log('Last used:', lastProvider); // 'puter'
```

## API Reference

### `useAIService(options)`

```typescript
const {
  // State
  isLoading,       // boolean
  error,           // Error | null
  response,        // AIResponse | null
  lastProvider,    // 'puter' | 'openai' | 'mock'

  // Methods
  generate,        // (prompt: string, model?: string) => Promise<string>
  checkProviders,  // () => Promise<Record<string, boolean>>
  getLastProvider, // () => string
  clearResponse,   // () => void
} = useAIService();
```

### `useGenerate()`

Simplified hook:

```typescript
const {
  generate,      // (prompt: string) => Promise<string>
  isGenerating,  // boolean
  result,        // string
} = useGenerate();
```

## Usage Examples

### Basic Generation

```tsx
const { generate } = useAIService();
const text = await generate('Write thesis introduction');
console.log(text);
```

### With Status Monitoring

```tsx
const { 
  generate, 
  isLoading, 
  lastProvider,
  error 
} = useAIService({
  showToast: true,
  onSuccess: (response) => {
    console.log('Provider used:', response.provider);
  },
});

const handleClick = async () => {
  await generate('Generate abstract');
};
```

### Check Available Providers

```tsx
const { checkProviders } = useAIService();

useEffect(() => {
  const checkAvailable = async () => {
    const status = await checkProviders();
    console.log('Available providers:', status);
    // { puter: false, openai: true, mock: true }
  };
  checkAvailable();
}, []);
```

### Fallback Behavior Example

```
Scenario: User generates thesis abstract

1. Try Puter
   ├─ Not configured? Skip
   └─ Configured but down? Try next

2. Try OpenAI
   ├─ Key missing? Skip
   ├─ API call fails? Try next
   └─ Success? Return (show "Generated with OPENAI")

3. Use Mock
   ├─ Always available ✓
   └─ Return mock response (show "Using offline fallback")

Result: User always gets a response!
```

## Environment Variables

### Required (pick one)

```env
# Option A: Use local Puter
NEXT_PUBLIC_PUTER_API_URL=http://localhost:8000

# Option B: Use OpenAI
OPENAI_API_KEY=sk-...

# Option C: Use both (Puter primary, OpenAI fallback)
NEXT_PUBLIC_PUTER_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-...
```

### Optional

```env
# Puter API authentication (if required)
PUTER_API_KEY=your-api-key

# Default OpenAI model
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
```

## Monitoring

### Check Provider Status

```tsx
const { checkProviders } = useAIService();

const status = await checkProviders();
if (status.puter) console.log('✓ Puter available');
if (status.openai) console.log('✓ OpenAI available');
if (status.mock) console.log('✓ Mock available');
```

### Get Failure Information

```tsx
import { getAIServiceProvider } from '@/lib/ai-service-provider';

const aiService = getAIServiceProvider();
const failures = aiService.getFailureLog();

failures.forEach(({ provider, error, timestamp }) => {
  console.log(`${provider} failed at ${new Date(timestamp)}: ${error}`);
});
```

## Cost Estimation

### OpenAI Pricing (as of 2024)

- gpt-3.5-turbo: ~$0.001 per 1K tokens
- gpt-4: ~$0.03 per 1K tokens

For typical thesis generation (2000 token response):
- gpt-3.5-turbo: ~$0.006 per request
- gpt-4: ~$0.06 per request

### Puter Pricing

- Self-hosted (Docker): Free
- Cloud deployment: Depends on provider

## Troubleshooting

### Always Getting Mock Data

Check provider configuration:
```tsx
const aiService = getAIServiceProvider();
const status = await aiService.getProviderStatus();
console.log(status);
```

### OpenAI API Errors

1. Verify API key: `echo $OPENAI_API_KEY`
2. Check key is valid: https://platform.openai.com/account/api-keys
3. Check rate limits: https://platform.openai.com/account/billing/limits
4. Verify environment variable is set

### Puter Connection Issues

1. Check service running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_PUTER_API_URL` is set
3. Check network connectivity
4. Review Puter logs

### Performance Issues

1. **Slow responses?**
   - OpenAI: Check API rate limits
   - Puter: Check server resources
   - Use mock: Responses are instant

2. **High costs?**
   - Switch to gpt-3.5-turbo (cheaper)
   - Cache responses
   - Use Puter/mock for development

## Production Checklist

- [ ] Decide which providers to use
- [ ] Set up environment variables
- [ ] Test each provider
- [ ] Configure fallback chain
- [ ] Monitor provider availability
- [ ] Set up error alerts
- [ ] Document for team
- [ ] Test offline fallback works
- [ ] Monitor costs (if using OpenAI)

## Migration from Old System

Old code:
```tsx
// This might fail if Puter unavailable
import { usePuterAI } from '@/hooks/usePuterAI';
```

New code (works with any provider):
```tsx
import { useAIService } from '@/hooks/useAIService';
// Works with Puter, OpenAI, or mock!
```

No other changes needed! ✓
