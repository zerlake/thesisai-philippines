# Component Refactoring Guide - Puter.js Migration

## Overview
This guide shows the step-by-step process to refactor any component from Supabase Edge Functions to direct Puter.js calls.

## Generic Pattern

### Step 1: Identify Current Implementation
Look for patterns like:
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* input data */ }
});
```

### Step 2: Update Imports
Replace:
```typescript
// OLD - Supabase-only
import { useAuth } from "./auth-provider";
```

With:
```typescript
// NEW - Add Puter utilities
import { useAuth } from "./auth-provider";
import { 
  loadPuterSDK, 
  ensurePuterAuth,
  generateFlashcards,  // Or other needed function
  chatWithPuter 
} from "@/lib/puter-sdk";
```

### Step 3: Replace Function Call
Replace:
```typescript
// OLD
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { prompt: inputText, /* other fields */ }
});

if (error) throw new Error(error.message);
if (data.error) throw new Error(data.error);

setResults(data);
```

With:
```typescript
// NEW - Using specialized helper
const results = await generateFlashcards(topic);
setResults(results);

// OR - Using generic chat
const puter = await loadPuterSDK();
await ensurePuterAuth();
const response = await puter.ai.chat(prompt);
const results = parsePuterJsonResponse(response);
setResults(results);
```

### Step 4: Update Error Handling
Replace:
```typescript
// OLD
} catch (err: any) {
  const errorMessage = err.message || 'An unknown error occurred.';
  setError(errorMessage);
  toast.error(errorMessage);
}
```

With:
```typescript
// NEW
} catch (err: any) {
  const errorMessage = err.message || 'An unknown error occurred.';
  setError(errorMessage);
  
  if (errorMessage.includes('auth')) {
    toast.error('Please sign in to your Puter account.');
  } else if (errorMessage.includes('JSON')) {
    toast.error('Invalid response format from AI.');
  } else {
    toast.error(errorMessage);
  }
}
```

## Component-Specific Refactoring

### 1. flashcards-generator.tsx
**Current:** Calls `generate-flashcards` Supabase function
**New:** Uses `generateFlashcards()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('generate-flashcards', {
  body: { topic: topic }
});

// NEW
const flashcards = await generateFlashcards(topic);
setFlashcards(flashcards);
```

---

### 2. qa-simulator.tsx (Defense Questions)
**Current:** Calls `generate-defense-questions` Supabase function
**New:** Uses `generateDefenseQuestions()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('generate-defense-questions', {
  body: { topic: researchTopic }
});

// NEW
const questions = await generateDefenseQuestions(researchTopic);
setQuestions(questions);
```

---

### 3. research-question-generator.tsx
**Current:** Calls multiple Supabase functions
**New:** Uses multiple Puter helpers

```typescript
// OLD - Multiple separate function calls
const { data: qData } = await supabase.functions.invoke('generate-research-questions', {
  body: { topic }
});
const { data: hData } = await supabase.functions.invoke('generate-hypotheses', {
  body: { topic }
});
const { data: aData } = await supabase.functions.invoke('align-questions-with-literature', {
  body: { questions: qData.questions, topic }
});

// NEW - Use helpers
const qResults = await generateResearchQuestions(topic);
const hResults = await generateHypotheses(topic);
const aResults = await alignQuestionsWithLiterature(qResults.questions, topic);
```

---

### 4. paraphrasing-tool.tsx
**Current:** Calls `paraphrase-text` Supabase function
**New:** Uses `paraphraseText()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('paraphrase-text', {
  body: { text: inputText, mode: selectedMode }
});

// NEW
const paraphrased = await paraphraseText(inputText, selectedMode);
setOutput(paraphrased);
```

---

### 5. outline-generator.tsx
**Current:** Calls `generate-outline` Supabase function
**New:** Uses `generateOutline()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('generate-outline', {
  body: { topic: thesisTopic }
});

// NEW
const outline = await generateOutline(thesisTopic);
setOutline(outline);
```

---

### 6. conclusion-generator.tsx
**Current:** Calls `generate-conclusion` Supabase function
**New:** Uses `generateConclusion()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('generate-conclusion', {
  body: { findings: researchFindings }
});

// NEW
const conclusion = await generateConclusion(researchFindings);
setConclusion(conclusion);
```

---

### 7. originality-check-panel.tsx
**Current:** Calls multiple plagiarism/citation functions
**New:** Uses `checkPlagiarism()` helper

```typescript
// OLD
const { data, error } = await supabase.functions.invoke('check-plagiarism', {
  body: { text: selectedText }
});

// NEW
const plagiarismResults = await checkPlagiarism(selectedText);
setResults(plagiarismResults);
```

---

## Complete Example: flashcards-generator.tsx

### Before (Original)
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export function FlashcardsGenerator() {
  const { supabase, session } = useAuth();
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-flashcards',
        { body: { topic } }
      );

      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);

      setFlashcards(data);
      toast.success('Flashcards generated!');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate flashcards';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Flashcards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter thesis topic..."
          disabled={loading}
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Flashcards'}
        </Button>
        
        {error && <div className="text-red-500">{error}</div>}
        
        {flashcards.length > 0 && (
          <div className="space-y-2">
            {flashcards.map((card, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded">
                <p className="font-semibold">{card.question}</p>
                <p className="text-sm text-gray-600">{card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### After (Refactored)
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { generateFlashcards } from '@/lib/puter-sdk';

export function FlashcardsGenerator() {
  const { session } = useAuth();
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cards = await generateFlashcards(topic);
      setFlashcards(Array.isArray(cards) ? cards : [cards]);
      toast.success('Flashcards generated!');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate flashcards';
      setError(msg);
      
      if (msg.includes('auth')) {
        toast.error('Please sign in to your Puter account');
      } else if (msg.includes('JSON')) {
        toast.error('Invalid response format. Please try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Flashcards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter thesis topic..."
          disabled={loading}
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Flashcards'}
        </Button>
        
        {error && <div className="text-red-500">{error}</div>}
        
        {flashcards.length > 0 && (
          <div className="space-y-2">
            {flashcards.map((card, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded">
                <p className="font-semibold">{card.question}</p>
                <p className="text-sm text-gray-600">{card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Key Changes
1. ✅ Removed Supabase function invoke
2. ✅ Added `generateFlashcards` import
3. ✅ Removed Supabase from dependencies (still imported for session if needed)
4. ✅ Updated error handling for auth and parsing errors
5. ✅ Simplified data handling (no error unpacking needed)

---

## Checklist for Each Component

- [ ] Identify current Supabase function call
- [ ] Add Puter SDK imports
- [ ] Replace function invoke with Puter helper
- [ ] Update response handling
- [ ] Update error handling
- [ ] Test with actual data
- [ ] Verify database save (if applicable)
- [ ] Test error scenarios
- [ ] Update component documentation

---

## Common Gotchas

### 1. Response Format
Puter returns `ChatResponse` object, not raw data:
```typescript
// ❌ WRONG
const data = await puter.ai.chat(prompt);
console.log(data.field); // undefined

// ✅ RIGHT
const response = await puter.ai.chat(prompt);
const text = response.message.content;
const data = JSON.parse(text);
```

### 2. Auth Errors
Auth errors need special handling:
```typescript
// ❌ WRONG - Crashes on auth error
await puter.auth.getUser();

// ✅ RIGHT - Handles auth gracefully
try {
  await puter.auth.getUser();
} catch {
  await puter.auth.signIn(); // Shows dialog
}
```

### 3. Async Operations
Puter SDK loads asynchronously:
```typescript
// ❌ WRONG - puter undefined
const puter = window.puter;
puter.ai.chat(prompt);

// ✅ RIGHT - Load and wait
const puter = await loadPuterSDK();
puter.ai.chat(prompt);
```

### 4. JSON Parsing
Not all responses are pure JSON:
```typescript
// ❌ WRONG - May fail
JSON.parse(response);

// ✅ RIGHT - Extract JSON properly
const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
JSON.parse(jsonStr);
```

---

## Testing Each Component

### Manual Testing Steps
1. Open component in browser
2. Enter test input
3. Click action button
4. Verify:
   - Puter sign-in appears (first time)
   - Loading state shows
   - Results display
   - No console errors
   - Error handling works (try invalid input)

### Console Debugging
```javascript
// Check SDK loaded
console.log(window.puter);

// Check auth
puter.auth.getUser();

// Test AI call manually
puter.ai.chat("test prompt").then(console.log);
```

---

## Next Steps

1. Start with Phase 3a components (highest priority)
2. Follow this guide for each component
3. Test thoroughly before moving to next
4. Collect any issues or edge cases
5. Update helpers as needed
6. Document any special handling

---

**Last Updated:** 2025-11-28
**Status:** Ready for Component Refactoring
