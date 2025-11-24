# Puter SDK Integration Reference

## Quick Start: Using Puter AI in Components

### Basic Pattern

```typescript
// Check if Puter is available
const puter = (window as any).puter;
if (!puter?.ai?.chat) {
  throw new Error("Puter AI SDK is not available");
}

// Make a request
const result = await puter.ai.chat({
  prompt: "Your prompt here",
  temperature: 0.7,
  max_tokens: 2000,
});

// Parse response (handles multiple formats)
let text = '';
if (typeof result === 'string') {
  text = result.trim();
} else if (result && typeof result === 'object') {
  text = 
    result.choices?.[0]?.message?.content?.trim() ||
    result.choices?.[0]?.text?.trim() ||
    result.response?.trim() ||
    result.text?.trim() ||
    result.content?.trim() ||
    String(result).trim();
}
```

## Implementation Examples

### Example 1: Simple Paraphrase

```typescript
async function paraphraseText(text: string): Promise<string> {
  const puter = (window as any).puter;
  
  if (!puter?.ai?.chat) {
    throw new Error("Puter AI not available");
  }

  const result = await puter.ai.chat({
    prompt: `Paraphrase: "${text}"`,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return extractText(result);
}
```

### Example 2: With Timeout Protection

```typescript
async function paraphraseWithTimeout(
  text: string,
  timeoutMs: number = 30000
): Promise<string> {
  const puter = (window as any).puter;
  
  if (!puter?.ai?.chat) {
    throw new Error("Puter AI not available");
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );

  const chatPromise = puter.ai.chat({
    prompt: `Paraphrase: "${text}"`,
    temperature: 0.7,
    max_tokens: 2000,
  });

  const result = await Promise.race([chatPromise, timeoutPromise]);
  return extractText(result);
}
```

### Example 3: With Loading State

```typescript
async function paraphraseWithUI(text: string): Promise<string> {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleParaphrase = async () => {
    setIsLoading(true);
    setOutput("Processing...");

    try {
      const puter = (window as any).puter;
      if (!puter?.ai?.chat) {
        throw new Error("Puter AI not available");
      }

      const result = await puter.ai.chat({
        prompt: `Paraphrase: "${text}"`,
        temperature: 0.7,
        max_tokens: 2000,
      });

      setOutput(extractText(result));
    } catch (error) {
      setOutput("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, output, handleParaphrase };
}
```

## Response Parsing Helper

```typescript
function extractText(result: any): string {
  if (typeof result === 'string') {
    return result.trim();
  }

  if (result && typeof result === 'object') {
    // Try OpenAI format
    const openAI = result.choices?.[0]?.message?.content?.trim();
    if (openAI) return openAI;

    // Try alternative formats
    const alternatives = [
      result.choices?.[0]?.text?.trim(),
      result.response?.trim(),
      result.text?.trim(),
      result.content?.trim(),
      result.answer?.trim(),
      result.result?.trim(),
    ];

    for (const alt of alternatives) {
      if (alt) return alt;
    }
  }

  // Fallback
  const fallback = String(result).trim();
  if (!fallback) {
    throw new Error("No response text found");
  }
  return fallback;
}
```

## Configuration Options

### Temperature (Creativity)
```
0.0 - Deterministic (always same output)
0.5 - Balanced
1.0 - Creative (varied outputs)
```

### Max Tokens (Length)
```
100   - Short responses
500   - Medium responses
2000  - Long responses
```

## Error Handling Patterns

### Pattern 1: Basic Try-Catch

```typescript
try {
  const result = await puter.ai.chat({ ... });
  setOutput(extractText(result));
} catch (error) {
  toast.error(error.message);
}
```

### Pattern 2: With Error Categorization

```typescript
try {
  const result = await puter.ai.chat({ ... });
  setOutput(extractText(result));
} catch (error) {
  if (error.message.includes('timeout')) {
    toast.error('Request took too long');
  } else if (error.message.includes('available')) {
    toast.error('Puter AI is unavailable');
  } else if (error.message.includes('401')) {
    toast.error('Authentication required');
  } else {
    toast.error('An error occurred');
  }
}
```

### Pattern 3: With Retry Logic

```typescript
async function paraphraseWithRetry(
  text: string,
  maxRetries: number = 3
): Promise<string> {
  const puter = (window as any).puter;
  if (!puter?.ai?.chat) {
    throw new Error("Puter AI not available");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await puter.ai.chat({
        prompt: `Paraphrase: "${text}"`,
        temperature: 0.7,
        max_tokens: 2000,
      });
      return extractText(result);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
      );
    }
  }
}
```

## Mode-Specific Prompts

### Paraphrase (Standard)
```
You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text.

Text: "${text}"
```

### Make Formal
```
You are an expert academic editor. Your task is to rewrite the following text to make it more formal.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text.

Text: "${text}"
```

### Simplify
```
You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text.

Text: "${text}"
```

### Expand
```
You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples.
- The length should be slightly longer but not excessive.
- Maintain a consistent academic tone.
- Return only the expanded text.

Text: "${text}"
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "SDK not available" | Reload page, check Puter loaded |
| Empty response | Check prompt format, reduce text length |
| Timeout | Increase timeout, reduce text size |
| Auth failed | Re-sign in, clear cache |
| Rate limited | Wait, reduce frequency |

## Type Definitions

```typescript
interface PuterAIChatConfig {
  prompt: string;
  temperature?: number;  // 0-1
  max_tokens?: number;   // Default: 2000
}

interface PuterAIResponse {
  choices?: Array<{
    message?: { content?: string };
    text?: string;
  }>;
  response?: string;
  text?: string;
  content?: string;
  answer?: string;
  result?: string;
}

interface PuterAI {
  chat(config: PuterAIChatConfig): Promise<PuterAIResponse | string>;
}

declare global {
  interface Window {
    puter?: {
      ai: PuterAI;
      auth?: {
        getUser(): Promise<any>;
        signIn(): Promise<any>;
      };
    };
  }
}
```

## Testing Utilities

```typescript
// Check if Puter is ready
function isPuterReady(): boolean {
  return (window as any).puter?.ai?.chat !== undefined;
}

// Get current user
async function getCurrentUser(): Promise<any> {
  return (window as any).puter?.auth?.getUser();
}

// Test API call
async function testPuterAPI(): Promise<boolean> {
  try {
    const puter = (window as any).puter;
    if (!puter?.ai?.chat) return false;
    
    const result = await puter.ai.chat({
      prompt: "Say 'hello'",
      max_tokens: 10,
    });
    
    return !!extractText(result);
  } catch (error) {
    console.error('Puter test failed:', error);
    return false;
  }
}
```

## Browser Console Testing

```javascript
// Check Puter status
window.puter?.ai?.chat ? console.log('✓ Ready') : console.log('✗ Not ready')

// Test auth
window.puter?.auth?.getUser().then(u => console.log('User:', u))

// Make test request
window.puter.ai.chat({
  prompt: 'Paraphrase: The cat sat on the mat.',
  temperature: 0.7,
  max_tokens: 100
}).then(r => {
  console.log('Response:', r);
  console.log('Type:', typeof r);
  console.log('Keys:', Object.keys(r || {}));
})
```

## Deployment Checklist

- [ ] Puter SDK loaded in layout
- [ ] Components use direct SDK calls
- [ ] Response parsing handles all formats
- [ ] Error handling implemented
- [ ] Timeout protection added
- [ ] Loading states show correctly
- [ ] Toast notifications working
- [ ] Browser console clean (no errors)
- [ ] Works in production environment
- [ ] Works in development environment

## Resources

- **Puter SDK Docs**: https://docs.puter.com
- **AI Chat API**: https://docs.puter.com/api/ai/chat
- **Authentication**: https://docs.puter.com/api/auth
- **GitHub Issues**: https://github.com/HeyPuter/puter
