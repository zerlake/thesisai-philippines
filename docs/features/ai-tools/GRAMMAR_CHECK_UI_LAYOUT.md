# Grammar Check UI Layout & Component Structure

## Overall Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Grammar & Writing Check                                         │
│ Get AI-powered feedback on your writing's focus, development... │
│                                                                   │
│ [Text Input Area]                                               │
│ [Add Sample] [Analyze Text] (25 words)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Your Feedback                                                   │
│                                                                   │
│ Overall Feedback summary text (2-3 sentences describing the    │
│ main strengths and areas for improvement)                       │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Overall Score                                               │ │
│ │                                                      4.2     │ │
│ │ Average of all 13 writing dimensions                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Detailed Breakdown (1-5 Scale)                                  │
│ Comprehensive analysis across all writing quality dimensions   │
│                                                                   │
│ Core Dimensions                                                 │
│ ┌────────────────────────┐ ┌────────────────────────┐          │
│ │ Focus             3.5/5 │ │ Development       3.8/5 │          │
│ │ ████████░░░░░░░░░░░░ │ │ █████████░░░░░░░░░░░ │          │
│ │ Description...         │ │ Description...         │          │
│ │ Tip: ...              │ │ Tip: ...              │          │
│ └────────────────────────┘ └────────────────────────┘          │
│ ┌────────────────────────┐ ┌────────────────────────┐          │
│ │ Audience          3.2/5 │ │ Cohesion          2.9/5 │          │
│ │ ███████░░░░░░░░░░░░░░ │ │ ██░░░░░░░░░░░░░░░░░ │          │
│ │ Description...         │ │ Description...         │          │
│ │ Tip: ...              │ │ Tip: ...              │          │
│ └────────────────────────┘ └────────────────────────┘          │
│ ┌────────────────────────┐                                      │
│ │ Language & Style  4.1/5 │                                      │
│ │ ████████░░░░░░░░░░░░░ │                                      │
│ │ Description...         │                                      │
│ │ Tip: ...              │                                      │
│ └────────────────────────┘                                      │
│                                                                   │
│ Extended Dimensions (Advanced Analysis)                         │
│                                                                   │
│ ▼ Clarity & Precision                               3.4/5       │
│   ═══════════════════════════════════════════════════════════  │
│   ████████░░░░░░░░░░░░░░░░                                     │
│   What this measures:                                           │
│   How clearly are ideas expressed? Is vocabulary precise...   │
│   Improvement tip:                                             │
│   Enhance clarity by removing jargon and using simpler words. │
│   ═══════════════════════════════════════════════════════════  │
│                                                                   │
│ ▶ Originality & Creativity                         3.1/5       │
│                                                                   │
│ ▶ Structure & Organization                         3.6/5       │
│                                                                   │
│ ▶ Grammar & Mechanics                              4.2/5       │
│                                                                   │
│ ▶ Argument Strength & Evidence                     3.3/5       │
│                                                                   │
│ ▶ Engagement & Tone                                3.7/5       │
│                                                                   │
│ ▶ Conciseness & Redundancy                         2.8/5       │
│                                                                   │
│ ▶ Readability Metrics                              3.5/5       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Next Steps                                                      │
│                                                                   │
│ Consider using the AI tools in the editor to improve specific  │
│ sections. Highlight text to get suggestions for improving,    │
│ summarizing, or rewriting. Focus on the dimensions with       │
│ lower scores for the most impact.                             │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Core Dimensions Grid
- **Layout**: 2-column responsive grid on desktop, 1-column on mobile
- **Items**: 5 cards (Focus, Development, Audience, Cohesion, Language & Style)
- **Each Card Contains**:
  - Dimension name (left)
  - Score (right) - e.g., "3.5/5"
  - Progress bar (blue color)
  - Improvement tip text

### 2. Extended Dimensions Accordion
- **Layout**: Vertical stacked list
- **Items**: 8 collapsible sections
- **Header Button** (clickable):
  - Chevron icon (▶/▼ with rotation animation)
  - Dimension name
  - Score display (right-aligned)
  - Hover state: slightly darker background
- **Expanded Content** (shown when clicked):
  - Progress bar (green color)
  - "What this measures:" section with description
  - "Improvement tip:" section with actionable advice
  - Divider line between header and content

## Dimensions Display

### Core Dimensions (Always Visible)
1. Focus
2. Development
3. Audience
4. Cohesion
5. Language & Style

### Extended Dimensions (Accordion - Click to Expand)
6. Clarity & Precision
7. Originality & Creativity
8. Structure & Organization
9. Grammar & Mechanics
10. Argument Strength & Evidence
11. Engagement & Tone
12. Conciseness & Redundancy
13. Readability Metrics

## Color Scheme

- **Core dimension progress bars**: Blue (#8884d8)
- **Extended dimension progress bars**: Green (#22c55e)
- **Overall score highlight**: Primary color
- **Background**: Muted for accordion headers
- **Text**: Primary for scores, muted-foreground for descriptions

## Interactive States

### Accordion Button
- **Default**: Hover effect with subtle background color change
- **Expanded**: Chevron rotated 180 degrees, content visible
- **Collapsed**: Chevron in default position, content hidden

### Progress Bars
- **Animation**: Smooth transition when scores change
- **Width**: Based on percentage of 5-point scale

## Responsive Behavior

### Desktop (md and above)
- Core dimensions: 2-column grid
- Extended dimensions: Full-width accordion
- Optimal viewing of all content

### Mobile (sm and below)
- Core dimensions: Single column stacked
- Extended dimensions: Full-width accordion
- Clean, scannable layout

## Performance Considerations

1. **Lazy Rendering**: Extended dimensions only render content when expanded
2. **Smooth Animations**: CSS transitions for chevron rotation and progress bars
3. **Efficient State Management**: Single `expandedAccordion` state for all accordion items
4. **No Unnecessary Re-renders**: Conditional rendering only updates expanded item
