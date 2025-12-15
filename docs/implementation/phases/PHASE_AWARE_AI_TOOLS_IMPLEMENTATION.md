# Phase-Aware AI Tools - Technical Implementation Guide

## Overview

This document describes the technical implementation of phase-aware AI tools in the thesis editor system. The system dynamically shows/hides AI tools based on the thesis phase (Conceptualize, Research, Write & Refine, Submit & Present).

---

## Architecture

### Core Components

#### 1. **Editor Component** (`src/components/editor.tsx`)
- Accepts `phase` prop to determine which tools to show
- Conditionally renders Submit button based on phase
- Passes phase to PuterAITools component

```typescript
export function Editor({ 
  documentId, 
  phase = 'write' 
}: { 
  documentId: string
  phase?: 'conceptualize' | 'research' | 'write' | 'submit'
})
```

#### 2. **PuterAITools Component** (`src/components/puter-ai-tools.tsx`)
- Contains all AI tool implementations
- Reads phase prop and dynamically renders tools
- Implements phase-specific tool logic

```typescript
interface PuterAIToolsProps {
  editor: any;
  session: any;
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
}
```

#### 3. **Thesis Phases** (`src/lib/thesis-phases.ts`)
- Defines all phases with metadata
- Can be extended for future features

---

## Implementation Details

### Phase-Tool Mapping

```typescript
const phaseTools = {
  conceptualize: ['generate'],
  research: ['summarize'],
  write: ['generate', 'improve', 'summarize', 'paraphrase'],
  submit: ['improve', 'summarize', 'paraphrase'],
};
```

### Conditional Rendering

Each tool is wrapped in a conditional render:

```typescript
{toolsToShow.includes('generate') && (
  <DropdownMenu>
    {/* Generate Content Dropdown */}
  </DropdownMenu>
)}

{toolsToShow.includes('improve') && (
  <Button>
    {/* Grammar Button */}
  </Button>
)}
```

### Advanced Options Visibility

```typescript
const showAdvancedOptions = phase === 'submit';

// Later in render:
{showAdvancedOptions && (
  <Button onClick={() => setShowAdvancedOptions(true)}>
    <Settings className="w-4 h-4" />
  </Button>
)}

{showAdvancedOptions && <AdvancedOptionsDialog />}
```

### Submit Button Visibility

```typescript
const showSubmitButton = phase === 'submit';

// Later in render:
{showSubmitButton && session?.user?.id === documentOwnerId && (
  <button onClick={handleSubmitForReview}>
    Submit for Review
  </button>
)}
```

---

## Tool Implementations

### Generate Content Tool

**File:** `src/components/puter-ai-tools.tsx`  
**Function:** `handleGenerateContent(contentType: string)`

**Options:**
- `introduction` - Full introduction with hook, context, problem, thesis
- `section` - Multi-paragraph section with transitions
- `paragraph` - Single academic paragraph (4-6 sentences)

**Configuration:**
```typescript
{
  temperature: 0.7,
  max_tokens: 800,
  tone: options.tone,
  audience: options.audience
}
```

**Available in:** Conceptualize, Write & Refine

### Grammar/Improve Tool

**File:** `src/components/puter-ai-tools.tsx`  
**Function:** `handleImproveText()`

**Improvements:**
- Enhance clarity and readability
- Fix grammar and syntax
- Maintain academic tone
- Respect tone/audience settings (in Submit phase)

**Configuration:**
```typescript
{
  temperature: 0.5,
  max_tokens: 2000,
  tone: options.tone,
  audience: options.audience
}
```

**Available in:** Write & Refine, Submit & Present

### Summarize Tool

**File:** `src/components/puter-ai-tools.tsx`  
**Function:** `handleSummarizeText()`

**Features:**
- Condenses text while preserving meaning
- Maintains key information
- Creates shorter, clearer versions
- Respects tone/audience (in Submit phase)

**Configuration:**
```typescript
{
  temperature: 0.5,
  max_tokens: 1000,
  tone: options.tone,
  audience: options.audience
}
```

**Available in:** Research, Write & Refine, Submit & Present

### Paraphrase/Rewrite Tool

**File:** `src/components/puter-ai-tools.tsx`  
**Function:** `handleRewriteText(mode: string)`

**Modes:**
- `standard` - Paraphrase with different vocabulary
- `formal` - Elevate tone for academic work
- `simple` - Simplify for clarity
- `expand` - Add detail and elaboration

**Configuration:**
```typescript
{
  temperature: 0.7,
  max_tokens: 2000,
  tone: options.tone,
  audience: options.audience
}
```

**Available in:** Write & Refine, Submit & Present

---

## State Management

### PuterAITools Internal State

```typescript
const [isProcessing, setIsProcessing] = useState({
  improve: false,
  summarize: false,
  rewrite: false,
  generateContent: false
});

const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

const [options, setOptions] = useState<AdvancedOptions>({
  tone: 'academic',
  audience: 'academic',
  complexity: 'intermediate'
});

const [isAppending, setIsAppending] = useState(false);
```

### Editor Component State

```typescript
const [showSubmitButton, setShowSubmitButton] = useState(phase === 'submit');
```

---

## Phase Configuration

### Phase 1: Conceptualize

```typescript
{
  id: "conceptualize",
  phaseNumber: 1,
  phase: "01. Conceptualize",
  title: "Research Planning",
  // ... phase metadata
}

// Tools: ['generate']
// Submit button: false
// Advanced options: false
```

### Phase 2: Research

```typescript
{
  id: "research",
  phaseNumber: 2,
  phase: "02. Research",
  title: "Literature & Analysis",
  // ... phase metadata
}

// Tools: ['summarize']
// Submit button: false
// Advanced options: false
```

### Phase 3: Write & Refine

```typescript
{
  id: "write",
  phaseNumber: 3,
  phase: "03. Write & Refine",
  title: "Content Creation",
  // ... phase metadata
}

// Tools: ['generate', 'improve', 'summarize', 'paraphrase']
// Submit button: false
// Advanced options: false
```

### Phase 4: Submit & Present

```typescript
{
  id: "submit",
  phaseNumber: 4,
  phase: "04. Submit & Present",
  title: "Finalization & Defense",
  // ... phase metadata
}

// Tools: ['improve', 'summarize', 'paraphrase']
// Submit button: true
// Advanced options: true
```

---

## Integration Points

### Using Editor with Phases

**From Draft Page:**
```typescript
import { Editor } from "@/components/editor";

export default function DraftsPage() {
  return <Editor documentId={documentId} phase="write" />;
}
```

**From Phase-Specific Pages:**
```typescript
export default function Chapter1Page() {
  return <Editor documentId={documentId} phase="submit" />;
}
```

### Determining Phase Dynamically

Future enhancement - currently phase is passed explicitly:

```typescript
// TODO: Auto-detect phase from document metadata
const determinePhase = (document: Document): Phase => {
  // Logic to determine phase based on:
  // - Document metadata
  // - Submission status
  // - Advisor feedback
  // - Phase completion status
};
```

---

## Advanced Options Dialog

**File:** `src/components/puter-ai-tools.tsx`  
**Component:** `AdvancedOptionsDialog()`

**State Variables:**
```typescript
tone: 'formal' | 'professional' | 'conversational' | 'academic'
audience: 'academic' | 'professional' | 'general' | 'expert'
complexity: 'advanced' | 'intermediate' | 'beginner'
```

**Instructions Generated by Phase:**

```typescript
const getToneInstruction = (tone: WritingTone): string => {
  const toneMap = {
    formal: 'Use formal, professional language with sophisticated vocabulary.',
    professional: 'Use professional language suitable for business or academic contexts.',
    conversational: 'Use conversational, accessible language that is easy to understand.',
    academic: 'Use academic, research-oriented language with appropriate citations.',
  };
  return toneMap[tone];
};

const getAudienceInstruction = (audience: TargetAudience): string => {
  const audienceMap = {
    academic: 'Write for academic researchers and scholars.',
    professional: 'Write for professionals in the field.',
    general: 'Write for educated general audience.',
    expert: 'Write for expert practitioners in the field.',
  };
  return audienceMap[audience];
};

const getComplexityInstruction = (complexity: ComplexityLevel): string => {
  const complexityMap = {
    beginner: 'Use simple language and explain concepts thoroughly.',
    intermediate: 'Use standard academic language with moderate detail.',
    advanced: 'Use sophisticated language and assume strong domain knowledge.',
  };
  return complexityMap[complexity];
};
```

---

## Error Handling

### Tool-Level Error Handling

```typescript
try {
  const result = await callPuterAI(prompt, options);
  // Process result
} catch (error: any) {
  const message = error instanceof AIError ? error.message : 
                  error instanceof AuthenticationError ? error.message :
                  error instanceof ValidationError ? error.message :
                  error?.message || 'Failed to process';
  toast.error(message);
} finally {
  setIsProcessing(prev => ({ ...prev, toolName: false }));
}
```

### Phase Validation

```typescript
// Validate phase is valid
if (!['conceptualize', 'research', 'write', 'submit'].includes(phase)) {
  console.warn(`Invalid phase: ${phase}, defaulting to 'write'`);
  phase = 'write';
}
```

---

## Performance Considerations

### Conditional Rendering
- Tools only render if in `toolsToShow` array
- Advanced Options dialog only mounts if `phase === 'submit'`
- Reduces DOM size for earlier phases

### State Updates
- Minimal state updates during tool operations
- Uses `setIsProcessing` object for batch updates
- Avoids unnecessary re-renders

### API Calls
- Debounced in tool handlers
- Respects user's current selection (don't call if not in viewport)
- Caches editor state to prevent redundant calls

---

## Testing Checklist

- [ ] Tool visibility correct for each phase
- [ ] Submit button only shows in phase 4
- [ ] Advanced Options only accessible in phase 4
- [ ] Tool functions execute correctly
- [ ] No errors when switching phases
- [ ] State properly reset on phase change
- [ ] Temperature/token limits appropriate
- [ ] Tone/audience instructions applied correctly
- [ ] Error messages display properly
- [ ] Loading states show correctly

---

## Future Enhancements

### 1. Dynamic Phase Detection
```typescript
const phase = detectPhaseFromDocument(document);
```

### 2. Phase Progression Logic
```typescript
const canAdvanceToNextPhase = (completionCriteria) => {
  return checklistCompleted && deadlineMet && advisorApproved;
};
```

### 3. Tool Usage Analytics
```typescript
logToolUsage({
  phase,
  tool,
  timestamp,
  duration,
  success
});
```

### 4. Phase-Specific Templates
```typescript
const getTemplateForPhase = (phase) => {
  return phaseTemplates[phase];
};
```

### 5. Collaborative Phase Management
```typescript
notifyAdvisorOfPhaseCompletion(phase, document);
```

---

## Troubleshooting

### Tools Not Showing
1. Check `phase` prop is passed correctly
2. Verify phase value matches allowed values
3. Check browser console for errors
4. Ensure component is re-rendering

### Submit Button Not Appearing
1. Verify `phase === 'submit'`
2. Check `session?.user?.id === documentOwnerId`
3. Ensure user is logged in

### Advanced Options Not Working
1. Verify `phase === 'submit'`
2. Check Advanced Options dialog mounts
3. Verify state updates after option selection
4. Check instructions are being generated

---

## Code References

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/puter-ai-tools.tsx` | 39-51 | Phase configuration |
| `src/components/puter-ai-tools.tsx` | 194-360 | Tool implementations |
| `src/components/puter-ai-tools.tsx` | 465+ | Conditional rendering |
| `src/components/editor.tsx` | 25-35 | Phase prop definition |
| `src/components/editor.tsx` | 182-192 | Submit button logic |
| `src/lib/thesis-phases.ts` | 45-233 | Phase definitions |

---

## Related Documentation

- `PHASE_AWARE_AI_TOOLS_GUIDE.md` - User-facing guide
- `PHASE_AWARE_AI_TOOLS_QUICK_REFERENCE.md` - Quick reference card
- `src/lib/thesis-phases.ts` - Phase configuration
- `src/components/puter-ai-tools.tsx` - Component implementation

---

*Last Updated: December 2024*
