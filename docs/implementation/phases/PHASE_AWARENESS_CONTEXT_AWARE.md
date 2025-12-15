# Phase-Aware Context Guide

## Overview

The **Phase Awareness Guide** is fully **context-aware** and dynamically adjusts its appearance, content, and positioning based on the phase of the document being edited.

---

## How It Works

### 1. Phase Detection
The component receives the `phase` prop from the Editor component:

```typescript
<PhaseAwarenessGuide phase={phase} />
```

The phase can be:
- `'conceptualize'` → Phase 1: Conceptualize
- `'research'` → Phase 2: Research
- `'write'` → Phase 3: Write & Refine
- `'submit'` → Phase 4: Submit & Present

---

## Visual Context Awareness

### Color Scheme (Dynamically Applied)

The guide background, border, and badge colors change based on current phase:

| Phase | Background | Border | Badge Color | Icon |
|-------|-----------|--------|-------------|------|
| **Phase 1** (Conceptualize) | Blue-50 / Dark: Blue-950 | Blue-200 / Dark: Blue-800 | Blue badge | 🔵 AlertCircle |
| **Phase 2** (Research) | Green-50 / Dark: Green-950 | Green-200 / Dark: Green-800 | Green badge | 🟢 HelpCircle |
| **Phase 3** (Write & Refine) | Purple-50 / Dark: Purple-950 | Purple-200 / Dark: Purple-800 | Purple badge | 🟣 CheckCircle2 |
| **Phase 4** (Submit & Present) | Orange-50 / Dark: Orange-950 | Orange-200 / Dark: Orange-800 | Orange badge | 🟠 Target |

### Status Badge

Every guide displays:
```
[Phase Title] [You're here!]
```

The "You're here!" badge is color-coded to match the phase and clearly indicates the student's current position.

---

## Content Context Awareness

### Phase 1: Conceptualize Example

```
┌─────────────────────────────────────────────────────┐
│ 🔵 Phase 1: Conceptualize - Research Planning        │
│                                          [You're here!] │
│                                                       │
│ ● What You're Doing                                   │
│   This is your ideation and planning stage. You're   │
│   answering fundamental questions: "What do I want   │
│   to study?" "Why does it matter?"...               │
│                                                       │
│ ● Why These Tools                                     │
│   • You need creative generation to explore ideas    │
│   • Grammar checking isn't yet relevant              │
│   • Generate helps you brainstorm questions...       │
│                                                       │
│ ● The Goal                                            │
│   ✓ A clearly defined research question              │
│   ✓ A gap identified in existing literature          │
│   ✓ A thesis statement (1-3 sentences)               │
│   ✓ An outline of proposed chapters                  │
│   ✓ A solid foundation to begin research             │
│                                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ Phase 1 of 4                              ~2-4 weeks │
└─────────────────────────────────────────────────────┘
```

### Phase 3: Write & Refine Example

```
┌─────────────────────────────────────────────────────┐
│ 🟣 Phase 3: Write & Refine - Content Creation        │
│                                          [You're here!] │
│                                                       │
│ ● What You're Doing                                   │
│   This is your active writing and development stage. │
│   You're converting research and ideas into chapters.│
│   You're developing your unique academic voice...   │
│                                                       │
│ ● Why These Tools                                     │
│   • You have a full writing toolkit (Generate,       │
│     Grammar, Summarize, Paraphrase)                  │
│   • Writing is messy and iterative...                │
│   • Advanced Options NOT available yet               │
│                                                       │
│ ● The Goal                                            │
│   ✓ Completed draft of all major chapters            │
│   ✓ Clear, well-supported arguments                  │
│   ✓ Proper paraphrasing and citations                │
│   ✓ Developing academic voice (consistent)           │
│   ✓ Content ready for critical review                │
│                                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ Phase 3 of 4                              ~6-12 weeks │
└─────────────────────────────────────────────────────┘
```

---

## Progress Visualization

### Phase Progress Bar

The guide displays a visual progress bar showing:
- **Filled bars** (colored) = completed/current phase
- **Empty bars** (gray) = upcoming phases

**Examples:**

**Phase 1:**
```
█░░░
```

**Phase 2:**
```
██░░
```

**Phase 3:**
```
███░
```

**Phase 4:**
```
████
```

---

## Estimated Duration

The guide also shows estimated duration for each phase:

- **Phase 1 (Conceptualize):** ~2-4 weeks
- **Phase 2 (Research):** ~4-8 weeks
- **Phase 3 (Write & Refine):** ~6-12 weeks
- **Phase 4 (Submit & Present):** ~2-4 weeks

This helps students understand whether they're on track for their phase.

---

## How Students Benefit

### ✅ Clear Position Awareness
- **"You're here!"** badge clearly marks current phase
- Color-coded design matches phase throughout app
- Progress bar shows journey through thesis

### ✅ Contextual Content
- Content updates based on actual phase
- Explanations are relevant to current work stage
- Tool availability explained for THIS phase specifically

### ✅ Motivation & Pacing
- Duration estimates help students plan
- Progress bar shows advancement through thesis
- Clear goals for current phase keep focus narrow

### ✅ Transparency
- **Why tools are available/unavailable in THIS phase**
- No guessing about constraints
- Pedagogical reasoning made explicit

---

## Integration Points

### 1. Editor Component
```typescript
<PhaseAwarenessGuide phase={phase} />
```
- Located below editor content
- Receives phase from Editor props
- Always visible to students

### 2. Phase Prop Flow
```
Page/Component (specifies phase)
    ↓
Editor (receives phase prop)
    ↓
PhaseAwarenessGuide (displays context-aware content)
```

### 3. Example Usage
```typescript
// Phase 1 document
<Editor documentId="doc-123" phase="conceptualize" />

// Phase 3 document
<Editor documentId="doc-456" phase="write" />

// Phase 4 document
<Editor documentId="doc-789" phase="submit" />
```

---

## Real-World Example

### Scenario: Student in Phase 1

**Student sees:**
- Blue-themed guide
- "Phase 1: Conceptualize" title with "You're here!" badge
- Content about ideation and research questions
- Explanation of why only "Generate" tool is available
- Goal: Define research question and thesis
- Progress: Phase 1 of 4 (~2-4 weeks)

**When they advance to Phase 2:**
- Component automatically updates
- Green theme appears
- New content about research gathering
- Explanation of Summarize tool
- Different goals for this phase
- Progress: Phase 2 of 4 (~4-8 weeks)

---

## Technical Details

### Props
```typescript
interface PhaseAwarenessGuideProps {
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
}
```

### State Management
- No internal state needed (fully controlled via props)
- Re-renders when phase changes
- Smooth color transitions via CSS

### Performance
- Minimal re-renders (phase changes only)
- Static content (no API calls)
- Lightweight icon rendering via Lucide

---

## Customization Options

The component can be enhanced with:

- [ ] Collapsible/minimizable guide
- [ ] Sticky positioning while scrolling
- [ ] Phase transition recommendations
- [ ] Quick links to relevant documentation
- [ ] Tool usage statistics for current phase
- [ ] Auto-hide/show based on user preference
- [ ] Phase-specific tips based on student progress
- [ ] Integration with advisor feedback system

---

## Files Involved

1. **Component:** `src/components/phase-awareness-guide.tsx`
2. **Integration:** `src/components/editor.tsx` (line 207)
3. **Documentation:** `PHASE_AWARE_AI_TOOLS_GUIDE.md`
4. **Implementation Reference:** `PHASE_AWARENESS_GUIDE_INTEGRATION.md`
