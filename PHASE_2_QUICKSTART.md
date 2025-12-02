# Phase 2: Text Processing Standardization - Quickstart

**Phase:** 2 of 4
**Current Status:** Ready to begin
**Target Completion Time:** 2-3 sessions
**Components to Migrate:** 4-5

---

## 📊 Phase 2 Overview

Phase 2 focuses on text processing and transformation tools. Unlike Phase 1 (generation), these tools take user-written text as input and improve/analyze it.

### Components to Migrate

| Component | File | Current State | Priority | Est. Time |
|-----------|------|---------------|----------|-----------|
| **Grammar Checker** | `src/components/grammar-checker.tsx` | Partial (using window.puter) | HIGH | 30 min |
| **Text Editor Enhancements** | `src/components/text-editor.tsx` | Unknown | HIGH | 45 min |
| **Paraphraser** | `src/components/paraphraser.tsx` | Unknown | MEDIUM | 40 min |
| **Abstract Generator** | `src/components/abstract-generator.tsx` | Unknown | MEDIUM | 35 min |
| **Citation Generator** | `src/components/citation-generator.tsx` | Unknown | LOW | 30 min |

---

## 🎯 Phase 2 Strategy

### Common Pattern for Phase 2 Components
```typescript
// Input: User-provided text
// Processing: Transform/analyze using Puter AI
// Output: Improved/analyzed text with explanations

const handleProcess = async (inputText: string) => {
  if (!inputText.trim()) {
    toast.error("Please provide text to process");
    return;
  }
  if (!session) {
    toast.error("You must be logged in");
    return;
  }

  setIsProcessing(true);
  try {
    const result = await callPuterAI(prompt, {
      temperature: 0.3-0.5,  // Lower for text correction/analysis
      max_tokens: Math.min(inputText.length * 1.5, 3000),
      timeout: 30000
    });

    setResult(JSON.parse(result));
    toast.success("Processing complete!");
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsProcessing(false);
  }
};
```

### Temperature Guidelines for Phase 2
- **Grammar Check & Corrections:** 0.2-0.3 (very precise)
- **Paraphrasing:** 0.6-0.7 (more variation while maintaining meaning)
- **Abstract Generation:** 0.4-0.5 (balanced, academic tone)
- **Citation Generation:** 0.2-0.3 (structured, precise)

### Token Calculation for Text Processing
```typescript
// For each component, estimate max_tokens based on input length
const estimateTokens = (text: string) => {
  const baseTokens = 500;
  const inputTokens = Math.ceil(text.length / 4);  // Rough estimate: 4 chars per token
  const outputTokens = Math.ceil(inputTokens * 1.5);  // Output usually 50% longer
  return Math.min(baseTokens + outputTokens, 3000);  // Cap at 3000
};
```

---

## 📋 Component-by-Component Migration Plan

### 1. Grammar Checker (HIGHEST PRIORITY)
**File:** `src/components/grammar-checker.tsx`  
**Current Status:** Partially migrated (uses `window.puter` directly)

**Action Items:**
1. Replace `window.puter` calls with `callPuterAI`
2. Maintain 14-dimension analysis (focus, development, audience, etc.)
3. Keep score normalization logic
4. Preserve history chart visualization
5. Test with various text lengths (25 word minimum)

**Key Metrics:**
- Temperature: 0.3 (precise analysis)
- Max tokens: ~2000
- Timeout: 30 seconds

**Prompt Structure:**
```
Analyze text on 14 dimensions:
1. Focus, 2. Development, 3. Audience, 4. Cohesion, 5. Language & Style
6. Clarity, 7. Originality, 8. Structure, 9. Grammar, 10. Argument Strength
11. Engagement, 12. Conciseness, 13. Readability, 14. Academic Rigor

Return JSON with scores (1-5) and tips for each dimension
```

---

### 2. Text Editor Enhancements
**File:** `src/components/text-editor.tsx`  
**Status:** Need to investigate

**Expected Features:**
- Real-time suggestions
- Tone adjustment
- Clarity improvements
- Consistency checking

**Action:** Locate and assess current implementation

---

### 3. Paraphraser
**File:** `src/components/paraphraser.tsx`  
**Status:** Need to investigate

**Expected Features:**
- Multiple paraphrasing styles (formal, simple, expand, standard)
- Tone adjustment
- Academic language enhancement

**Implementation Pattern:**
```typescript
const modes = {
  formal: "Rewrite in formal academic language",
  simple: "Rewrite using simpler, more accessible language",
  expand: "Expand text with more details (2-3x longer)",
  standard: "Rewrite naturally while maintaining original meaning"
};
```

**Temperature:** 0.6-0.7 (more creative than grammar check)

---

### 4. Abstract Generator
**File:** `src/components/abstract-generator.tsx`  
**Status:** Need to investigate

**Expected Features:**
- 150-300 word abstracts
- Structured (purpose, methodology, findings, implications)
- Academic publication quality

**Temperature:** 0.4-0.5 (balanced between creative and precise)

---

### 5. Citation Generator (OPTIONAL)
**File:** `src/components/citation-generator.tsx`  
**Status:** Need to investigate

**Expected Features:**
- Multiple citation formats (APA, MLA, Chicago, etc.)
- Structured citation generation
- Reference list creation

**Temperature:** 0.2-0.3 (very precise, consistent format)

---

## ✅ Migration Checklist Template

For each component, complete:

```markdown
## [Component Name]

### Phase 2.X Implementation

**File:** `src/components/[name].tsx`
**Status:** ✅ / ⏳ / ❌
**Duration:** 30-45 minutes

### Changes Made
- [ ] Replaced old API calls with `callPuterAI`
- [ ] Updated temperature settings
- [ ] Adjusted max_tokens for input size
- [ ] Added authentication checks
- [ ] Updated error handling
- [ ] Fixed TypeScript types
- [ ] Tested with sample inputs

### Build Status
- [ ] No TypeScript errors
- [ ] No linting issues
- [ ] Build successful

### Testing
- [ ] Component renders correctly
- [ ] Generation works with valid input
- [ ] Error handling works
- [ ] Loading states display
- [ ] Results display properly
```

---

## 🚀 Quick Migration Guide

### Step 1: Prepare
```bash
# Ensure everything is built
pnpm build

# Create a backup branch
git checkout -b phase-2-migration
```

### Step 2: Migrate Each Component
For each component:
1. Read the current implementation
2. Identify the API/function being used
3. Replace with `callPuterAI` pattern
4. Update prompt with clear requirements
5. Test locally
6. Commit

### Step 3: Verify
```bash
# Build again
pnpm build

# Test components manually in browser
```

### Step 4: Commit
```bash
git add .
git commit -m "Phase 2: Migrate [Component] to client-side Puter AI"
```

---

## 📊 Expected Results After Phase 2

| Metric | Target |
|--------|--------|
| Components Migrated | 4-5 |
| Code Reduction | 25-35% |
| API Calls Reduced | 100% (all client-side) |
| Build Time | Same or faster |
| Error Handling | Improved |
| User Experience | Seamless |

---

## 🎯 Success Criteria

Phase 2 is complete when:
- ✅ All 4-5 text processing components migrated
- ✅ All use `callPuterAI` from wrapper
- ✅ Build passes without errors
- ✅ Each component tested with sample input
- ✅ Documentation updated
- ✅ Ready for Phase 3

---

## 🔗 Related Documentation

- **Quick Reference:** `PUTER_AI_QUICK_REFERENCE.md`
- **Full Guide:** `CLIENT_SIDE_PUTER_AI_MIGRATION.md`
- **Phase 1 Status:** `PHASE_1_MIGRATION_STATUS.md`
- **Puter Wrapper:** `src/lib/puter-ai-wrapper.ts`

---

## 📝 Notes

- Temperature settings are critical for Phase 2 components
  - Lower temp (0.2-0.3) for grammar/corrections
  - Higher temp (0.6-0.7) for paraphrasing
  - Medium temp (0.4-0.5) for generation

- Consider text length when calculating max_tokens
  - Minimum input: Usually 25-50 words
  - Maximum input: Usually 2000-5000 words
  - Output: Usually 1.2-2x input size

- All Phase 2 components should have authentication checks
  - User must be logged in
  - Session from `useAuth()`

---

**Ready to start Phase 2. Begin with Grammar Checker for highest impact.**
