# Puter AI Client-Side Migration - Quick Reference

## One-Minute Setup

### Import
```typescript
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { useState } from "react";
import { toast } from "sonner";
```

### Basic Implementation
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleGenerate = async () => {
  setIsLoading(true);
  try {
    const result = await callPuterAI(
      `Your prompt here...`,
      { temperature: 0.8, max_tokens: 2000, timeout: 30000 }
    );
    
    // Handle result
    setData(result);
    toast.success("Generated successfully!");
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Component Checklist

### For Each Component
- [ ] Import `callPuterAI` and `useState`
- [ ] Remove old Supabase function imports
- [ ] Remove `useApiCall` hook
- [ ] Create local `isLoading` state
- [ ] Update prompt with clear requirements
- [ ] Add JSON parsing with error handling
- [ ] Update error handling with toast
- [ ] Test with sample data
- [ ] Verify loading states
- [ ] Check mobile responsiveness

---

## Common Patterns

### 1. Simple Text Generation
```typescript
const result = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 1000 });
// result is a string
```

### 2. JSON Response Parsing
```typescript
const result = await callPuterAI(prompt, { max_tokens: 2000 });
const data = JSON.parse(result);
```

### 3. List Generation
```typescript
const result = await callPuterAI(prompt, { max_tokens: 1500 });
const items = result.split('\n').filter(line => line.trim().length > 0);
```

### 4. With Error Handling
```typescript
try {
  const result = await callPuterAI(prompt);
  // Process result
} catch (error) {
  if (error.message.includes('timeout')) {
    toast.error("Request took too long. Try again.");
  } else {
    toast.error(error.message);
  }
}
```

---

## Temperature & Max Tokens Guide

| Use Case | Temperature | Max Tokens |
|----------|-------------|-----------|
| **Creative** (brainstorming, ideas) | 0.8-1.0 | 2500 |
| **Balanced** (summaries, rewrites) | 0.5-0.7 | 2000 |
| **Precise** (grammar, corrections) | 0.3-0.5 | 1500 |
| **Constrained** (titles, lists) | 0.7-0.8 | 1000 |

---

## Prompt Engineering Tips

### ✅ DO
- Be specific about format (JSON, list, etc.)
- State "EXACTLY X items" if needed
- Include context about Philippine education
- Specify academic language level
- Request only what's needed

### ❌ DON'T
- Ask for vague "good ideas"
- Mix multiple tasks in one prompt
- Forget to specify output format
- Include sensitive information
- Use multiple instructions without clarity

### Example Good Prompt
```
Generate EXACTLY 5 unique research questions for: "${topic}"

Requirements:
- Each question must be 8-15 words
- Must be answerable through research
- Should relate to Philippines context
- Format: Return ONLY a JSON array of strings

Return only the JSON, no other text.
```

---

## Debugging Checklist

### Issue: "SDK failed to load"
- ✅ Ensure Puter SDK is in layout
- ✅ Check internet connection
- ✅ Verify timeout is sufficient (30s default)
- ✅ Clear browser cache

### Issue: "Invalid JSON"
- ✅ Check prompt includes proper JSON format
- ✅ Verify AI isn't adding markdown
- ✅ Try parsing with error handling
- ✅ Increase max_tokens if response is cut off

### Issue: "Timeout after 30s"
- ✅ Reduce max_tokens
- ✅ Simplify prompt
- ✅ Increase timeout value
- ✅ Check AI service status

### Issue: "Empty or incomplete results"
- ✅ Increase max_tokens
- ✅ Make prompt more specific
- ✅ Reduce temperature (more focused)
- ✅ Add examples to prompt

---

## Testing Template

```typescript
// Component Test
describe("YourComponent", () => {
  it("should generate content with Puter AI", async () => {
    render(<YourComponent />);
    
    // Trigger generation
    const button = screen.getByText("Generate");
    await userEvent.click(button);
    
    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/Generated/)).toBeInTheDocument();
    });
  });
});
```

---

## Before & After Example

### BEFORE (Supabase Function)
```typescript
const { data, error } = await supabase.functions.invoke('generate-titles', {
  body: { summary },
  headers: { Authorization: `Bearer ${token}` }
});
if (error) toast.error(error.message);
else setTitles(data.titles);
```

### AFTER (Client-Side Puter AI)
```typescript
try {
  const result = await callPuterAI(`Generate 5 titles for: ${summary}`);
  const parsed = JSON.parse(result);
  setTitles(parsed.titles);
} catch (error) {
  toast.error(error.message);
}
```

**Reduction**: ~40 lines → ~8 lines (80% less code)

---

## Recommended Temperature Values by Component

| Component | Temperature | Reason |
|-----------|-------------|--------|
| Title Generator | 0.8 | Varied but academic |
| Topic Ideas | 0.8 | Creative brainstorming |
| Questions | 0.6 | Structured, diverse |
| Hypotheses | 0.5 | Scientifically precise |
| Grammar Check | 0.3 | Consistent corrections |
| Summaries | 0.5 | Balanced accuracy |
| Paraphrasing | 0.7 | Varied phrasing |

---

## Common Response Formats

### JSON Array
```typescript
const result = await callPuterAI(prompt);
const items = JSON.parse(result); // Expect array
```

### JSON Object
```typescript
const result = await callPuterAI(prompt);
const data = JSON.parse(result); // Expect object
```

### CSV/Pipe-Separated
```typescript
const result = await callPuterAI(prompt);
const items = result.split('\n').map(line => line.split(','));
```

### Plain Text Lines
```typescript
const result = await callPuterAI(prompt);
const lines = result.split('\n').filter(l => l.trim());
```

---

## Timeout Strategy

```typescript
// Quick responses (< 5s)
timeout: 5000,

// Normal responses (5-15s)
timeout: 15000,

// Long responses (15-30s)
timeout: 30000,

// Very long responses (> 30s) - use caution
timeout: 60000,
```

---

## Files to Reference

- **Implementation**: `src/components/title-generator.tsx`
- **Wrapper**: `src/lib/puter-ai-wrapper.ts`
- **Full Plan**: `CLIENT_SIDE_PUTER_AI_MIGRATION.md`
- **Status**: `PUTER_AI_MIGRATION_STATUS.md`

---

## Migration Checklist for New Component

```typescript
// 1. Remove these
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";
const { execute, loading } = useApiCall({...});

// 2. Add these
import { callPuterAI } from "@/lib/puter-ai-wrapper";
const [isLoading, setIsLoading] = useState(false);

// 3. Replace function call with
try {
  const result = await callPuterAI(prompt, options);
  // Handle result
} catch (error) {
  toast.error(error.message);
} finally {
  setIsLoading(false);
}

// 4. Test thoroughly
// 5. Update documentation
// 6. Commit and push
```

---

## Support

**Questions?** Check:
1. This quick reference
2. `CLIENT_SIDE_PUTER_AI_MIGRATION.md`
3. `src/components/title-generator.tsx` (reference implementation)
4. `PUTER_AI_MIGRATION_STATUS.md` (full status)
