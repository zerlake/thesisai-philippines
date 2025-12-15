# Puter AI Standardized Implementation Pattern

## Overview
This document outlines the standardized pattern for implementing Puter AI calls across the application. The pattern has been refined based on testing and ensures consistent, reliable AI functionality.

## Key Improvements

### 1. **SDK Loading**
- Automatically waits for Puter SDK to load before making calls
- Timeout of 2 seconds (configurable)
- Retries with 100ms intervals

### 2. **Authentication**
- Uses Puter's built-in authentication
- No need to manually pass tokens to the backend
- SDK handles auth internally

### 3. **Correct API Signature**
- Call `puter.ai.chat(prompt)` with **string parameter only**
- Previously was trying to pass options object (incorrect)
- SDK handles all configuration internally

### 4. **Response Format**
- Puter returns: `{message: {content: "..."}, ...}`
- Correctly extracts using: `result.message.content`
- Fallback chain handles alternate formats

## Implementation Pattern

### For Client-Side Components

```typescript
import { callPuterAI } from '@/lib/puter-ai-wrapper';

const handleAICall = async () => {
  try {
    const prompt = "Your prompt here";
    
    const result = await callPuterAI(prompt, {
      temperature: 0.7,
      max_tokens: 2000,
      timeout: 30000
    });
    
    // result is already a clean string
    console.log(result);
  } catch (error) {
    toast.error(error.message);
  }
};
```

### For Direct SDK Calls (Not Recommended)

If you need to call SDK directly:

```typescript
// INCORRECT - Don't do this anymore
const result = await puter.ai.chat({
  prompt: text,
  temperature: 0.7,
  max_tokens: 2000
});

// CORRECT
const result = await puter.ai.chat(text);
// Extract: result.message.content
```

## Files Updated

### Core Libraries
- ✅ `src/lib/puter-ai-wrapper.ts` - Unified Puter AI interface
  - Updated `callPuterAI()` to wait for SDK
  - Fixed response parsing for correct format
  - Added detailed error handling for various error types

### Components Updated
- ✅ `src/components/paraphrasing-tool.tsx` - Calls SDK directly
- ✅ `src/components/puter-ai-tools.tsx` - Uses `callPuterAI()` wrapper
  - `handleImproveText()` - Fixed
  - `handleSummarizeText()` - Fixed
  - `handleRewriteText()` - Fixed
- ✅ `src/components/reviewer-ai-toolkit.tsx` - Refactored to use Puter AI
  - Removed non-existent Supabase function calls
  - `handleAiAction()` - improve, summarize, paraphrase
  - `handleGenerateFeedback()` - JSON parsing for structured feedback
- ✅ `src/components/ai-assistant-panel.tsx` - Refactored to use Puter AI
  - `handleImprove()` - Fixed
  - `handleSummarize()` - Fixed

## Components to Update Next

### High Priority (Frequently Used)
1. `src/components/rich-text-editor.tsx` - Text editing tools
2. `src/components/grammar-checker.tsx` - Grammar checking
3. `src/components/outline-generator.tsx` - Outline generation
4. `src/components/flashcards-generator.tsx` - Flashcard generation
5. `src/components/SmartAIAssistant.tsx` - Advanced AI assistant

### Medium Priority (Generation Tools)
6. `src/components/title-generator.tsx`
7. `src/components/presentation-generator.tsx`
8. `src/components/conclusion-generator.tsx`
9. `src/components/topic-idea-generator.tsx`

### Research Tools
10. `src/components/research-question-generator.tsx`
11. `src/components/research-gap-identifier.tsx`
12. `src/components/research-problem-identifier.tsx`

### Backend Functions (Supabase) - For complex operations only
- `generate-abstract` - If complex, migrate to callPuterAI
- `generate-feedback` - If complex, migrate to callPuterAI
- Other complex operations that need backend processing

## Testing Checklist

For each component, test:
- [ ] SDK loads before call
- [ ] Authentication works
- [ ] Prompt is sent correctly
- [ ] Response is parsed correctly
- [ ] Error handling shows user-friendly messages
- [ ] No "empty object" errors
- [ ] Text extraction works for all response formats

## Common Issues & Fixes

### Issue: "Puter SDK not available"
**Fix:** Ensure `<script src="https://js.puter.com/v2/" async />` is in layout.tsx

### Issue: Empty object error `{}`
**Fix:** Check that:
- SDK is fully loaded
- Authentication is valid
- Response parsing extracts from correct path

### Issue: Response parsing fails
**Fix:** Check response format:
```javascript
// Correct Puter format
{
  message: { content: "..." },
  index: 0,
  finish_reason: 'stop',
  ...
}
```

## Rollout Plan

1. **Phase 1 (Done)** ✅
   - ✅ Core wrapper updated with error handling
   - ✅ Paraphrasing tool professional upgrade
   - ✅ Puter AI tools component updated
   - ✅ ReviewerAiToolkit completely refactored
   - ✅ AIAssistantPanel updated

2. **Phase 2 (In Progress)**
   - Update SmartAIAssistant
   - Update outline-generator
   - Update flashcards-generator
   - Update grammar-checker
   - Update research tools

3. **Phase 3 (Pending)**
   - Create missing Supabase functions (if needed)
   - Clean up legacy code
   - Performance optimization
   - Advanced feature additions

## Notes for Developers

- Always use `callPuterAI()` from `puter-ai-wrapper.ts` for consistency
- Never manually construct Puter API calls to backends
- SDK handles auth internally - don't try to pass tokens
- Test with actual Puter authentication before merging
- Clear error messages are important for UX

## References

- Puter SDK: `https://js.puter.com/v2/`
- Response format: `{message: {content: string}, ...}`
- Call signature: `puter.ai.chat(prompt: string)`
