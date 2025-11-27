# Puter.js Quick Reference Card

## Import the SDK Loader
```typescript
import { loadPuterSDK } from '@/lib/puter-sdk';
```

## Basic Usage Pattern

### Load SDK and Get Instance
```typescript
const puter = await loadPuterSDK();
```

### Ensure User is Authenticated
```typescript
await ensurePuterAuth();
// If not signed in, shows sign-in dialog
```

### Call AI Chat
```typescript
const response = await puter.ai.chat(prompt);
// Returns: ChatResponse { message: { content: "..." } }

// Extract content
const text = response.message.content;
```

## API Methods

### SDK Loader Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `loadPuterSDK()` | Load Puter SDK from CDN | Promise<Puter> |
| `ensurePuterAuth()` | Ensure user is authenticated | Promise<void> |
| `signInWithPuter()` | Force sign-in dialog | Promise<void> |
| `signOutFromPuter()` | Log out user | Promise<void> |
| `getPuterUser()` | Get current user info | Promise<User> |
| `isPuterAuthenticated()` | Check auth status | Promise<boolean> |
| `chatWithPuter(prompt, options?)` | Call AI directly | Promise<string> |

### Puter.js AI Methods

| Method | Purpose | Options |
|--------|---------|---------|
| `puter.ai.chat(prompt)` | Chat with AI | `{model, temperature, max_tokens, stream}` |
| `puter.ai.txt2img(text)` | Generate images | `{model, quality}` |
| `puter.ai.img2txt(imageUrl)` | Analyze images | - |
| `puter.ai.txt2speech(text)` | Convert to audio | `{model, voice, speed}` |
| `puter.ai.speech2txt(audio)` | Transcribe audio | - |

## Common Patterns

### 1. Get Puter Instance
```typescript
const puter = await loadPuterSDK();
```

### 2. Ensure Auth Before Using AI
```typescript
const puter = await loadPuterSDK();
try {
  await puter.auth.getUser();
} catch {
  await puter.auth.signIn();
}
```

### 3. Call AI and Get Response
```typescript
try {
  const response = await puter.ai.chat(prompt);
  const text = response.message.content;
  console.log(text);
} catch (error) {
  console.error('AI call failed:', error);
}
```

### 4. Parse JSON Response
```typescript
const response = await puter.ai.chat(jsonPrompt);
const text = response.message.content;
const json = JSON.parse(text);
```

### 5. Stream Response
```typescript
const response = await puter.ai.chat(prompt, {stream: true});
for await (const chunk of response) {
  if (chunk?.text) {
    console.log(chunk.text); // Incremental response
  }
}
```

### 6. Use Different Model
```typescript
const response = await puter.ai.chat(prompt, {
  model: 'claude-sonnet-4'
});
```

### 7. Analyze Image
```typescript
const response = await puter.ai.chat(
  "What's in this image?",
  "https://example.com/image.jpg"
);
```

## Response Formats

### Standard Response
```typescript
ChatResponse {
  message: {
    content: "The AI response text here..."
  }
}
```

### With Model Info
```typescript
ChatResponse {
  message: {
    content: "Response..."
  },
  model: "gpt-5-nano",
  usage: {
    input_tokens: 10,
    output_tokens: 100
  }
}
```

### Stream Response (per chunk)
```typescript
ChatResponseChunk {
  text: "Partial response...",
  delta: "Partial response..."
}
```

## Error Handling

### SDK Load Error
```typescript
try {
  const puter = await loadPuterSDK();
} catch (error) {
  console.error('Failed to load Puter SDK:', error);
}
```

### Auth Error
```typescript
try {
  const user = await puter.auth.getUser();
} catch (error) {
  console.error('Not authenticated:', error);
  await puter.auth.signIn();
}
```

### AI Error
```typescript
try {
  const response = await puter.ai.chat(prompt);
} catch (error) {
  console.error('AI call failed:', error);
  // Handle gracefully - maybe use fallback
}
```

## Configuration Options

### Chat Options
```typescript
{
  model: 'gpt-5-nano',        // AI model to use
  temperature: 0.7,            // 0-2, higher = more random
  max_tokens: 2000,            // Max response length
  stream: false,               // Enable streaming
  tools: [...],                // Function definitions
}
```

### Available Models
- OpenAI: `gpt-5`, `gpt-5-nano`, `gpt-4o`, `o1`, `o3`
- Anthropic: `claude-opus-4`, `claude-sonnet-4`
- Google: `google/gemini-2.0-flash`
- Open Source: `llama-2`, `mistral`
- And 400+ more...

## Component Example

```typescript
import { useState } from 'react';
import { loadPuterSDK } from '@/lib/puter-sdk';

export function MyComponent() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    try {
      const puter = await loadPuterSDK();
      await puter.auth.getUser(); // or use ensurePuterAuth()
      
      const response = await puter.ai.chat(text);
      setResult(response.message.content);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleAnalyze('analyze this')}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      <p>{result}</p>
    </div>
  );
}
```

## Debugging

### Check SDK Loaded
```javascript
console.log(window.puter); // Should not be undefined
```

### Test Auth
```javascript
puter.auth.getUser().then(u => console.log('User:', u));
```

### Test AI
```javascript
puter.ai.chat("Test").then(r => console.log('Response:', r));
```

### View Logs
Look for `[puter-sdk]` or `[grammar-check]` prefixes in console

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ v90+ |
| Firefox | ✅ v88+ |
| Safari | ✅ v15+ |
| Edge | ✅ v90+ |
| Mobile | ✅ iOS Safari, Chrome Mobile |

## Common Mistakes

❌ **Wrong:** Assuming response is a string
```typescript
const text = response; // ❌ Wrong
```

✅ **Right:** Access message.content
```typescript
const text = response.message.content; // ✅ Correct
```

❌ **Wrong:** Not handling auth errors
```typescript
const user = await puter.auth.getUser(); // May throw
```

✅ **Right:** Catch and handle auth errors
```typescript
try {
  const user = await puter.auth.getUser();
} catch {
  await puter.auth.signIn();
}
```

❌ **Wrong:** Forgetting to load SDK first
```typescript
const response = await puter.ai.chat(text); // puter undefined
```

✅ **Right:** Always load SDK first
```typescript
const puter = await loadPuterSDK();
const response = await puter.ai.chat(text);
```

## Performance Tips

1. **Load SDK once** - Cache the Puter instance
2. **Don't reload on every call** - SDK caches in window
3. **Use streaming** for long responses - Better UX
4. **Set appropriate timeout** - Default 30s for AI calls
5. **Handle errors gracefully** - Always have fallback

## Resources

- [Puter.js Docs](https://docs.puter.com)
- [AI API Tutorial](https://developer.puter.com/tutorials/free-unlimited-ai-api/)
- [Playground](https://docs.puter.com/playground/)
- [GitHub](https://github.com/HeyPuter/puter)
- [Discord Community](https://discord.gg/PQcx7Teh8u)

---

**Last Updated:** 2025-11-28
**SDK Version:** Puter.js v2
**Status:** ✅ Production Ready
