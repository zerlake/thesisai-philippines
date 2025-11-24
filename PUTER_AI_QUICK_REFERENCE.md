# Puter AI Quick Reference for Developers

## How to Use Puter AI in Supabase Functions

### Basic Pattern

```typescript
import { callPuterAI } from '../_shared/puter-ai.ts';

async function myCustomFunction(topic: string) {
  const prompt = `Your prompt here: ${topic}`;
  
  const systemPrompt = 'You are a helpful assistant.';
  
  const response = await callPuterAI(prompt, {
    systemPrompt,
    temperature: 0.7,
    max_tokens: 2000,
    timeout: 30000
  });
  
  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const result = JSON.parse(jsonMatch?.[0] || response);
  
  return result;
}
```

### With Error Handling

```typescript
async function myFunction(topic: string) {
  try {
    const response = await callPuterAI(prompt, {
      systemPrompt: 'You are an expert...',
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    // Extract and parse JSON
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    const jsonString = jsonStart !== -1 && jsonEnd !== 0 
      ? response.substring(jsonStart, jsonEnd)
      : response;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### With Fallback

```typescript
import { callPuterAIWithFallback } from '../_shared/puter-ai.ts';

async function myFunction(topic: string) {
  const fallbackResponse = JSON.stringify({
    data: [{
      title: "Default " + topic,
      description: "Fallback response for " + topic
    }]
  });
  
  const response = await callPuterAIWithFallback(
    prompt,
    fallbackResponse,
    { systemPrompt: '...', temperature: 0.7 }
  );
  
  return JSON.parse(response);
}
```

---

## API Reference

### `callPuterAI(prompt, options)`

Calls Puter AI API and returns the response text.

**Parameters:**
- `prompt: string` - The user prompt to send
- `options?: PuterAIOptions`
  - `temperature?: number` (default: 0.7) - Creativity vs coherence
  - `max_tokens?: number` (default: 2000) - Max response length
  - `timeout?: number` (default: 30000) - Request timeout in ms
  - `systemPrompt?: string` (default: "You are a helpful assistant.") - System message

**Returns:** `Promise<string>` - The AI response text

**Throws:** Error if the request fails

**Example:**
```typescript
const response = await callPuterAI("Explain quantum computing", {
  temperature: 0.5,
  max_tokens: 1000,
  systemPrompt: "You are a physics expert"
});
```

---

### `callPuterAIWithFallback(prompt, fallbackResponse, options)`

Calls Puter AI but returns fallback if the API fails.

**Parameters:**
- `prompt: string` - The user prompt
- `fallbackResponse: string` - Fallback response if API fails
- `options?: PuterAIOptions` - Same as above

**Returns:** `Promise<string>` - AI response or fallback

**Never throws** - Always returns a valid response

**Example:**
```typescript
const response = await callPuterAIWithFallback(
  prompt,
  '{"status": "fallback"}',
  { temperature: 0.7 }
);
```

---

## Common Patterns

### JSON-based Tasks (Most Common)

```typescript
const prompt = `Generate a JSON object with this structure:
{
  "items": [
    {
      "title": "...",
      "description": "..."
    }
  ]
}

Topic: ${topic}`;

const response = await callPuterAI(prompt, {
  systemPrompt: 'You are a data generator.',
  max_tokens: 1500
});

// Extract JSON
const jsonMatch = response.match(/\{[\s\S]*\}/);
const data = JSON.parse(jsonMatch[0]);
```

### Structured Analysis

```typescript
const prompt = `Analyze this text and provide:
1. Key points
2. Themes
3. Recommendations

Text: "${textContent.substring(0, 3000)}"`;

const response = await callPuterAI(prompt, {
  systemPrompt: 'You are an expert analyst.',
  temperature: 0.6,
  max_tokens: 2000
});
```

### Multiple Choice Generation

```typescript
const prompt = `Generate 5 multiple choice questions about ${topic}.
Format as JSON array:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}`;

const response = await callPuterAI(prompt);
const jsonMatch = response.match(/\{[\s\S]*\}/);
return JSON.parse(jsonMatch[0]);
```

---

## Best Practices

### 1. **System Prompts**
Use descriptive system prompts for better results:
```typescript
// ✅ Good
systemPrompt: "You are an expert thesis advisor specializing in Philippine universities."

// ❌ Vague
systemPrompt: "You are a helpful assistant."
```

### 2. **Temperature Selection**
- `0.3-0.5`: Factual, consistent answers (research, data)
- `0.5-0.7`: Balanced (most tasks)
- `0.7-0.9`: Creative, varied answers (brainstorming)

```typescript
// Data generation
{ temperature: 0.5 }

// Creative writing
{ temperature: 0.8 }
```

### 3. **Token Management**
```typescript
// Short responses
{ max_tokens: 500 }

// Medium responses
{ max_tokens: 1000, 1500 }

// Long analyses
{ max_tokens: 2000, 3000 }
```

### 4. **JSON Extraction**
Always handle JSON extraction carefully:
```typescript
try {
  // Method 1: Regex (most reliable)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const data = JSON.parse(jsonMatch[0]);
  
  // Method 2: Direct parse (if response is pure JSON)
  const data = JSON.parse(response);
} catch (error) {
  console.error("JSON parse error:", error);
  // Use fallback or retry
}
```

### 5. **Error Handling**
```typescript
try {
  const response = await callPuterAI(prompt, options);
  // Process response
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      // Handle timeout
    } else if (error.message.includes('401')) {
      // Invalid API key
    } else {
      // Other error
    }
  }
}
```

---

## Examples from Production

### Topic Idea Generator
```typescript
async function generateIdeasWithPuter(field: string) {
  const prompt = `You are an expert academic advisor...
Generate 3 thesis topics for field: ${field}...`;
  
  const response = await callPuterAI(prompt, {
    systemPrompt: 'You are an expert academic advisor...',
    temperature: 0.7,
    max_tokens: 2000
  });
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}
```

### Grammar Check
```typescript
async function analyzeTextWithPuter(text: string) {
  const prompt = `Analyze text for: focus, development, audience...
Return JSON with scores object...`;
  
  const response = await callPuterAI(prompt, {
    systemPrompt: 'You are an academic writing coach...',
    max_tokens: 2000
  });
  
  const jsonString = extractJSON(response);
  const result = JSON.parse(jsonString);
  
  // Ensure all required fields
  for (const dimension of requiredScores) {
    if (result.scores[dimension] === undefined) {
      result.scores[dimension] = 3;
    }
  }
  
  return result;
}
```

---

## Troubleshooting

### "Puter API error: 401"
- Missing or invalid `PUTER_API_KEY`
- Check Supabase project secrets
- Verify token hasn't expired

### "Request timed out"
- Increase timeout: `{ timeout: 60000 }`
- Reduce max_tokens
- Simplify prompt
- Try again (might be rate limited)

### "Unexpected response format"
- Check what response you're getting
- Add logging: `console.error('Response:', response);`
- Try using fallback for debugging
- Verify system prompt isn't confusing the model

### "JSON parse error"
- Response might not contain JSON
- Use regex to extract: `/\{[\s\S]*\}/`
- Add quotes escaping if needed
- Check if response is split across multiple lines

---

## Configuration

### Environment Variables
```bash
# .env.local or Supabase secrets
PUTER_API_KEY=your_puter_api_token_here
```

### Per-Tool Settings
Recommended configurations for each tool type:

**Fast Generation (Topics, Titles)**
```typescript
{ temperature: 0.7, max_tokens: 1000, timeout: 15000 }
```

**Moderate Tasks (Flashcards, Questions)**
```typescript
{ temperature: 0.6, max_tokens: 1500, timeout: 20000 }
```

**Complex Analysis (Grammar Check, Defense Questions)**
```typescript
{ temperature: 0.5, max_tokens: 2000, timeout: 30000 }
```

---

## Next Steps for New Tools

To add a new tool using Puter AI:

1. **Create function:**
   ```typescript
   import { callPuterAI } from '../_shared/puter-ai.ts';
   
   async function myNewTool(input: string) {
     // Your implementation
   }
   ```

2. **Call Puter AI:**
   ```typescript
   const response = await callPuterAI(prompt, options);
   ```

3. **Parse response:**
   ```typescript
   const data = JSON.parse(extractedJSON);
   ```

4. **Handle errors:**
   ```typescript
   try {
     // ...
   } catch (error) {
     // ...
   }
   ```

5. **Test locally:**
   - With PUTER_API_KEY set
   - Without PUTER_API_KEY (fallback)
   - Various edge cases

6. **Deploy and monitor:**
   - Check logs for errors
   - Monitor performance metrics
   - Gather user feedback

---

## Support & Resources

- **Wrapper Location:** `supabase/functions/_shared/puter-ai.ts`
- **Example Tools:** `generate-topic-ideas`, `grammar-check`, `generate-flashcards`
- **Docs:** `PUTER_AI_MIGRATION_COMPLETE.md`
- **Issues:** Check error logs in Supabase Edge Functions

---

**Version:** 1.0
**Last Updated:** 2024
**Status:** Production Ready
