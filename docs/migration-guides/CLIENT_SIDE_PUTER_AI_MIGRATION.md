# Client-Side Puter AI Migration Plan

## Overview
Migrate all Puter AI calls from server-side Supabase functions to direct client-side calls using `callPuterAI` wrapper.

## Benefits
- ✅ No API latency (direct browser execution)
- ✅ Simplified architecture (no server-side Puter calls)
- ✅ Better error handling (direct user feedback)
- ✅ Reduced Supabase function costs
- ✅ Consistent pattern across all components

---

## Components & Functions to Migrate

### 1. **Topic/Research Generation** (Priority: High)

#### A. Topic Idea Generator
- **Component**: `src/components/topic-idea-generator.tsx`
- **Current**: Calls `generate-topic-ideas` Supabase function
- **Migration**: Direct `callPuterAI()` call
- **Prompt**: Generate 10 thesis topics for given field of study
- **Status**: ❌ Not migrated

#### B. Enterprise Topic Generator  
- **Component**: `src/components/enterprise-topic-generator.tsx`
- **Current**: Calls `generate-topic-ideas-enterprise` Supabase function
- **Migration**: Direct `callPuterAI()` call with enhanced prompt
- **Status**: ❌ Not migrated

#### C. Topic Ideation Tool
- **Component**: `src/components/topic-ideation-tool.tsx`
- **Current**: Calls `generate-topic-ideas` Supabase function + `check-plagiarism` function
- **Migration**: 
  - Topic ideas: Direct `callPuterAI()`
  - Plagiarism check: Keep Supabase (uses external API)
- **Status**: ❌ Partially migrated

#### D. Title Generator ✅
- **Component**: `src/components/title-generator.tsx`
- **Current**: Direct `callPuterAI()` call
- **Status**: ✅ COMPLETED

---

### 2. **Research Question & Hypothesis Generation** (Priority: High)

#### A. Research Question Integration
- **Component**: `src/components/research-question-integration.tsx`
- **Current**: Calls 3 Supabase functions:
  - `generate-research-questions`
  - `generate-hypotheses`
  - `align-questions-with-literature`
- **Migration**: Direct `callPuterAI()` calls for all three
- **Status**: ❌ Not migrated

#### B. Research Question Generator (Standalone)
- **Component**: `src/components/research-question-generator.tsx`
- **Current**: Direct SDK calls via Puter SDK loader
- **Migration**: Switch to `callPuterAI()` wrapper for consistency
- **Status**: ⚠️ Partially done (uses SDK directly)

---

### 3. **Writing & Text Tools** (Priority: Medium)

#### A. Puter AI Tools
- **Component**: `src/components/puter-ai-tools.tsx`
- **Current**: Direct `callPuterAI()` calls
- **Status**: ✅ COMPLETED

#### B. Rich Text Editor
- **Component**: `src/components/rich-text-editor.tsx`
- **Current**: Direct `window.puter.ai.chat()` calls with retry wrapper
- **Migration**: Use standardized `callPuterAI()` wrapper instead of direct calls
- **Status**: ⚠️ Uses direct window.puter calls (needs standardization)

#### C. Grammar Checker
- **Component**: `src/components/grammar-checker.tsx`
- **Current**: Direct `window.puter.ai.chat()` calls
- **Migration**: Use `callPuterAI()` wrapper
- **Status**: ⚠️ Uses direct window.puter calls

#### D. AI Assistant Panel
- **Component**: `src/components/ai-assistant-panel.tsx`
- **Current**: Mix of `callPuterAI()` and Supabase function calls
- **Migration**: Consolidate to all `callPuterAI()` calls
- **Status**: ⚠️ Partially migrated

#### E. Reviewer AI Toolkit
- **Component**: `src/components/reviewer-ai-toolkit.tsx`
- **Current**: Direct `callPuterAI()` calls
- **Status**: ✅ COMPLETED

---

### 4. **Literature & Results Analysis** (Priority: Medium)

#### A. Literature Review
- **Component**: `src/components/literature-review.tsx`
- **Current**: Calls Supabase functions:
  - `call-arxiv-mcp-server` (external integration)
  - `synthesize-literature` (Puter AI)
- **Migration**: 
  - Literature synthesis: Direct `callPuterAI()`
  - arXiv MCP: Keep Supabase (external service)
- **Status**: ❌ Partially migrated

#### B. Results Interpreter
- **Component**: `src/components/results-tools/results-interpreter.tsx`
- **Current**: Calls `interpret-results` Supabase function
- **Migration**: Direct `callPuterAI()` call
- **Status**: ❌ Not migrated

---

### 5. **Educational Tools** (Priority: Low)

#### A. Survey Question Generator
- **Component**: `src/components/methodology-tools/survey-question-generator.tsx`
- **Current**: Calls `generate-survey-questions` Supabase function
- **Migration**: Direct `callPuterAI()` call
- **Status**: ❌ Not migrated

#### B. Presentation Generator
- **Component**: `src/components/presentation-generator.tsx`
- **Current**: Calls `generate-presentation-slides` Supabase function
- **Migration**: Direct `callPuterAI()` call
- **Status**: ❌ Not migrated

#### C. Citation Manager
- **Component**: `src/components/citation-manager.tsx`
- **Current**: Calls `generate-citation` Supabase function
- **Migration**: Direct `callPuterAI()` call
- **Status**: ❌ Not migrated

---

### 6. **Admin & Management Functions** (Priority: Low)
These should remain server-side as they handle authentication, database writes, billing, etc.
- ✅ Billing management
- ✅ Advisor requests
- ✅ Role management
- ✅ Notification sending
- ✅ Payout requests

---

### 7. **External Service Integrations** (Priority: Keep Server-Side)
These must remain on server-side for security and external API access:
- ✅ `check-plagiarism` (SerpAPI integration)
- ✅ `run-statistical-analysis` (External API calls)
- ✅ `call-arxiv-mcp-server` (MCP server integration)
- ✅ `create-coinbase-charge` (Payment processing)
- ✅ `coinbase-webhook` (Webhook handling)

---

## Migration Implementation Plan

### Phase 1: Direct Puter AI Wrappers (Week 1)
1. Topic idea generator
2. Enterprise topic generator
3. Research question integration (3 functions)
4. Literature synthesis
5. Results interpreter

### Phase 2: Text Processing Standardization (Week 2)
1. Rich text editor (standardize to `callPuterAI`)
2. Grammar checker (standardize to `callPuterAI`)
3. AI assistant panel (consolidate mixed calls)

### Phase 3: Educational Tools (Week 3)
1. Survey question generator
2. Presentation generator
3. Citation manager

### Phase 4: Cleanup & Optimization (Week 4)
1. Remove deprecated Supabase functions
2. Test all integrated components
3. Update documentation
4. Performance monitoring

---

## Code Pattern Example

### OLD (Supabase Function Call)
```typescript
const { data, error } = await supabase.functions.invoke('generate-topic-ideas', {
  body: { field },
  headers: { Authorization: `Bearer ${session.access_token}` }
});

if (error) {
  toast.error(error.message);
} else {
  setTopics(data.topicIdeas);
}
```

### NEW (Client-Side Puter AI)
```typescript
try {
  const prompt = `Generate 10 unique thesis topics for ${field}...`;
  
  const result = await callPuterAI(prompt, {
    temperature: 0.8,
    max_tokens: 2000,
    timeout: 30000,
  });
  
  // Parse JSON response
  const parsed = JSON.parse(result);
  setTopics(parsed.topicIdeas);
  toast.success(`Generated ${parsed.topicIdeas.length} topics!`);
} catch (error) {
  toast.error(error.message);
}
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Latency** | 200-500ms (server round-trip) | 50-100ms (direct) |
| **Complexity** | Higher (Deno + SDK) | Lower (direct SDK) |
| **Error Handling** | Server-side only | Real-time client feedback |
| **Scaling** | Limited by Supabase functions | Unlimited (client-side) |
| **Cost** | Function invocations | Zero additional cost |
| **Consistency** | Mixed patterns | Single pattern |

---

## Testing Checklist

- [ ] Generate 10 topic ideas successfully
- [ ] Generate research questions with proper formatting
- [ ] Generate hypotheses with statistical context
- [ ] Align questions with literature
- [ ] Generate titles from abstracts
- [ ] Improve and summarize text
- [ ] Check grammar and rewrite text
- [ ] Interpret research results
- [ ] Generate survey questions
- [ ] Generate presentation slides
- [ ] Timeout handling works properly
- [ ] Error messages display correctly
- [ ] Loading states show appropriately
- [ ] Mobile responsiveness maintained

---

## Notes
- Always use `callPuterAI()` wrapper for consistency
- Ensure proper error handling with meaningful messages
- Add loading states during generation
- Keep external API integrations on server-side
- Test with actual Puter SDK availability
