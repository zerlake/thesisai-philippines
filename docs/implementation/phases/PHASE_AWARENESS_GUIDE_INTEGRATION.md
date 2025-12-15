# Phase Awareness Guide Integration

## Overview

The **Phase Awareness Guide** component has been integrated directly **below the text editor** to provide students with real-time, phase-specific strategic guidance as they work on their thesis documents.

---

## Component Details

### File Location
- **Component:** `src/components/phase-awareness-guide.tsx`
- **Integration:** `src/components/editor.tsx` (line 207)

### What It Displays

For each phase, the guide shows:

1. **What You're Doing** - Context of the current phase and its purpose
2. **Why These Tools** - Explanation of tool availability and relevance to the phase
3. **The Goal** - Concrete deliverables expected by phase end

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Document Title              [Submit for Review Button]      │
├─────────────────────────────────────────────────────────────┤
│ EditorToolbar (Heading, Bold, Italic, Lists, etc.)          │
├─────────────────────────────────────────────────────────────┤
│ PuterAITools (Generate, Grammar, Summarize, Paraphrase)     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              EDITOR CONTENT AREA                             │
│          (TipTap Rich Text Editor)                           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   PHASE AWARENESS GUIDE (NEW)                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🎯 Phase 3: Write & Refine - Content Creation            │ │
│  │    Strategic guidance for your current phase             │ │
│  │                                                          │ │
│  │ ● What You're Doing                                      │ │
│  │   This is your active writing and development stage...  │ │
│  │                                                          │ │
│  │ ● Why These Tools                                        │ │
│  │   • You have a full writing toolkit...                   │ │
│  │   • Generate new sections and arguments                  │ │
│  │   • Grammar to polish and improve readability            │ │
│  │                                                          │ │
│  │ ● The Goal                                               │ │
│  │   ✓ Completed draft of all major chapters                │ │
│  │   ✓ Clear, well-supported arguments                      │ │
│  │   ✓ Proper paraphrasing and citations                    │ │
│  │                                                          │ │
│  │ Phase 3 of 4                                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
        Main Editor Column (responsive width)
```

---

## Phase-Specific Content

### Phase 1: Conceptualize
**Icon:** 🔵 (AlertCircle - Blue)
- **Focus:** Ideation and planning
- **Available Tools:** Generate only
- **Key Goal:** Define research question and thesis statement

### Phase 2: Research
**Icon:** 🟢 (HelpCircle - Green)
- **Focus:** Evidence gathering and analysis
- **Available Tools:** Summarize only
- **Key Goal:** Build comprehensive literature foundation

### Phase 3: Write & Refine
**Icon:** 🟣 (CheckCircle2 - Purple)
- **Focus:** Active writing and development
- **Available Tools:** Generate, Grammar, Summarize, Paraphrase
- **Key Goal:** Complete draft of all chapters

### Phase 4: Submit & Present
**Icon:** 🟠 (Target - Orange)
- **Focus:** Final polish and defense prep
- **Available Tools:** All tools + Advanced Options + Submit button
- **Key Goal:** Publication-ready thesis with defense prep

---

## Implementation

### Props
```typescript
<PhaseAwarenessGuide phase={phase} />
```

### Supported Phase Values
- `'conceptualize'` - Phase 1
- `'research'` - Phase 2
- `'write'` - Phase 3 (default)
- `'submit'` - Phase 4

### Dynamic Rendering
The component automatically displays content based on the `phase` prop passed from the Editor component. As students progress through phases, the guidance updates in real-time.

---

## Student Benefits

✅ **Clear Context** - Students understand exactly what they should be doing at each phase
✅ **Transparency** - Clear explanation of WHY certain tools are available/unavailable
✅ **Goal Alignment** - Concrete deliverables help students self-assess progress
✅ **Reduced Friction** - No need to search for guidance elsewhere
✅ **Phase Awareness** - Visual progress indicator (e.g., "Phase 3 of 4")

---

## Styling

- **Light Mode:** Slate-50 to Slate-100 background
- **Dark Mode:** Slate-900 to Slate-800 background
- **Responsive:** Full width on mobile, constrained to editor width on desktop
- **Icons:** Color-coded by phase using Lucide React icons
- **Typography:** Clear hierarchy with section dividers

---

## Related Documentation

- `PHASE_AWARE_AI_TOOLS_GUIDE.md` - Comprehensive phase documentation
- `src/components/editor.tsx` - Editor component integration
- `src/lib/thesis-phases.ts` - Phase definitions and metadata

---

## Future Enhancements

- [ ] Collapsible guide (minimize when working)
- [ ] Sticky positioning option
- [ ] Progress completion indicators
- [ ] Phase transition recommendations
- [ ] Tool usage statistics for the phase
- [ ] Quick links to relevant documentation
