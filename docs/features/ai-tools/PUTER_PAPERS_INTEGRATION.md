# Puter.js Client-Side Integration for Papers Search

Integrated Puter.js client-side AI with the papers search page, following the same pattern as other AI tools in the application.

## What Was Added

### 1. **Puter.js SDK Loading** (`src/lib/puter-sdk.ts`)
- Loads Puter.js from CDN: `https://js.puter.com/v2/`
- No API keys required (client-side authentication)
- Handles initialization and auth flow

### 2. **Puter AI Wrapper** (`src/lib/puter-ai-wrapper.ts`)
- `callPuterAI()` - Direct AI chat interface
- Handles retries with exponential backoff
- Timeout management (120s default)
- Response parsing for various formats

### 3. **Papers Page Integration** (`src/components/paper-search/find-papers-page.tsx`)

#### New Features:
- **"AI Search" Button** - Generates search queries using Puter.js AI
- **Puter SDK Initialization** - Auto-loads on component mount
- **Auth Flow** - Uses `ensurePuterAuth()` for sign-in
- **Smart Query Generation** - Contextual search query generation

#### How it Works:
1. User clicks "AI Search" button
2. Component loads Puter.js SDK
3. User signs in with Puter (first time only)
4. Puter AI generates a research paper search query
5. Results populated automatically

## Usage

### For Users

1. **Visit Papers Search Page** - Navigate to `/papers`
2. **Click "AI Search"** button
3. **Sign in with Puter** (first time only)
4. **Get AI-generated search query** automatically
5. **View results** from multiple sources

### For Developers

#### Basic Usage

```typescript
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { loadPuterSDK } from '@/lib/puter-sdk';
import { ensurePuterAuth } from '@/lib/puter-sdk';

// Initialize
await loadPuterSDK();
await ensurePuterAuth();

// Generate
const result = await callPuterAI('Your prompt here', {
  temperature: 0.7,
  max_tokens: 2000,
  timeout: 120000,
});

console.log(result); // AI response
```

#### In React Component

```tsx
import { useState, useEffect } from 'react';
import { callPuterAI, isPuterAIAvailable } from '@/lib/puter-ai-wrapper';
import { loadPuterSDK } from '@/lib/puter-sdk';

export function MyComponent() {
  const [puterReady, setPuterReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPuterSDK()
      .then(() => setPuterReady(true))
      .catch(err => console.error(err));
  }, []);

  const handleGenerate = async () => {
    if (!puterReady) return;
    
    setIsLoading(true);
    try {
      const result = await callPuterAI('Your prompt');
      console.log(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={!puterReady || isLoading}>
      {isLoading ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

## Architecture

```
Papers Search Page
  ├─ useEffect: Load Puter SDK
  │   └─ setPuterReady(true)
  │
  ├─ "AI Search" Button
  │   └─ handleGenerateSearchQuery()
  │       ├─ Check puterReady
  │       ├─ ensurePuterAuth() - User sign-in
  │       ├─ callPuterAI() - Generate query
  │       ├─ search() - Execute search
  │       └─ Display results
  │
  └─ "Load Sample Data" Button
      └─ generateSamplePapers() - Offline fallback
```

## Key Features

✅ **Client-Side Only** - No backend API needed  
✅ **Built-in Auth** - Puter handles authentication  
✅ **No API Keys** - Uses user's Puter account  
✅ **Auto-Retry** - Handles timeouts gracefully  
✅ **Fallback** - Sample data available offline  
✅ **Easy Integration** - Simple hook-and-use pattern  

## How Puter.js Works

### 1. **SDK Loading**
```typescript
// Loads https://js.puter.com/v2/
const puter = await loadPuterSDK();
// window.puter is now available
```

### 2. **Authentication**
```typescript
// First time: opens sign-in dialog
await puter.auth.signIn();

// Subsequently: automatic
const user = await puter.auth.getUser();
```

### 3. **AI Chat**
```typescript
// Simple prompt
const response = await puter.ai.chat("Your prompt");

// With options
const response = await puter.ai.chat({
  prompt: "Your prompt",
  temperature: 0.7,
  max_tokens: 2000,
});
```

## File Structure

```
src/
├── lib/
│   ├── puter-sdk.ts               // SDK loader
│   ├── puter-ai-wrapper.ts        // AI wrapper
│   ├── sample-papers-data.ts      // Fallback data
│   └── ...
├── components/
│   └── paper-search/
│       ├── find-papers-page.tsx   // Integrated page
│       ├── paper-search-bar.tsx
│       └── ...
└── hooks/
    ├── usePaperSearch.ts
    └── ...
```

## Error Handling

```typescript
try {
  await ensurePuterAuth();
  const result = await callPuterAI(prompt);
} catch (error) {
  if (error.message.includes('timed out')) {
    // Automatic retry in callPuterAI
  } else if (error.message.includes('auth')) {
    // User not signed in or auth failed
  } else {
    // Other errors
  }
  toast.error(error.message);
}
```

## Configuration

### Puter SDK URL
Default: `https://js.puter.com/v2/`

Override in `src/lib/puter-sdk.ts`:
```typescript
script.src = 'https://js.puter.com/v2/';
```

### AI Request Options

```typescript
interface PuterAIOptions {
  temperature?: number;    // 0-2, default: 0.7
  max_tokens?: number;     // default: 2000
  timeout?: number;        // ms, default: 120000
  systemPrompt?: string;   // optional instruction
}
```

### Retry Configuration

In `callPuterAI()`:
```typescript
retries: number = 2  // Number of retry attempts
```

Exponential backoff: `1000ms * (attempt + 1)`

## Testing

### Test Puter Availability

```typescript
import { isPuterAIAvailable } from '@/lib/puter-ai-wrapper';

if (isPuterAIAvailable()) {
  console.log('Puter.js is ready');
} else {
  console.log('Puter.js not loaded yet');
}
```

### Test Generation

```typescript
const result = await callPuterAI(
  'Generate a test response',
  { max_tokens: 50 }
);
console.log(result);
```

## Fallback Strategy

If Puter.js unavailable:
1. "AI Search" button is disabled
2. "Load Sample Data" button available
3. Shows sample papers for demo

Future: Can add OpenAI fallback if needed.

## Integration with Other Tools

All AI tools follow same pattern:

```
✓ Grammar Checker - callPuterAI()
✓ Outline Generator - callPuterAI()
✓ Paraphrasing Tool - callPuterAI()
✓ Title Generator - callPuterAI()
✓ Abstract Generator - callPuterAI()
✓ Papers Search - callPuterAI()
```

Same authentication, same UI pattern, same error handling.

## Browser Requirements

- Modern browser with ES6 support
- Network access to:
  - `https://js.puter.com` (SDK)
  - Puter API endpoints
- Popup blocker disabled for auth (first time)

## Performance Notes

- SDK load: ~500ms (cached after first load)
- Auth check: ~100ms (cached)
- AI generation: 2-10s (depends on prompt)
- Automatic retry on timeout

## Future Enhancements

- [ ] Add streaming support
- [ ] Cache responses
- [ ] Offline queue
- [ ] Analytics tracking
- [ ] Advanced parameters UI
- [ ] Custom system prompts
- [ ] Multi-turn conversation

## Troubleshooting

### "Puter AI is not ready"
- Page loading - wait a moment
- Browser console: check for SDK load errors
- Try refreshing page

### "Sign in dialog not appearing"
- Check popup blocker
- Check network connection
- Try incognito mode

### "Request timed out"
- Auto-retry happens 2x
- Long prompts may need more time
- Try simpler prompt

### "Empty response"
- Puter AI returned empty
- Try different prompt
- Check token limits

## Support

For issues with:
- **Puter.js SDK** - See https://puter.com
- **Papers Search** - Check integration
- **AI Generation** - Review prompt format
