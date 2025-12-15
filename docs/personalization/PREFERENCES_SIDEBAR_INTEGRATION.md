# Preferences Panel - Sidebar Integration Guide

## Quick Summary

The preferences panels now support **two modes**:
- **Embedded Mode** (default): Appears in the right sidebar alongside review panel
- **Floating Mode**: Fixed button on right edge (for standalone use)

## How to Integrate

### Into EditorAICompanion (Advisor)

The advisor preferences should appear **below** the review panel in the right sidebar.

**File:** `src/components/editor-ai-companion.tsx`

**Add this import:**
```typescript
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";
```

**Add this JSX** (after the review panel):
```typescript
<div className="flex-1 overflow-y-auto">
  <EditorReviewPanel />
  {/* Add this right after review panel */}
  <AdvisorPreferencesPanel isEmbedded={true} />
</div>
```

**Result:**
```
┌─────────────────────────────────────┐
│  Document Editor                    │
└─────────────────────────────────────┘
                                    │
                    Right Sidebar ─→ │
                                    │
                  ┌────────────────┐ │
                  │ Advisor Feedback│ │
                  │ ────────────────│ │
                  │ Comments:      │ │
                  │ [Textarea]     │ │
                  │ [Approve]      │ │
                  │ [Revise]       │ │
                  └────────────────┘ │
                  ┌────────────────┐ │
                  │ Suggestions    │ │
                  │ ────────────────│ │
                  │ Tone: [Select] │ │
                  │ Detail: [Select]│ │
                  │ Auto-gen: [ ]  │ │
                  │ [Save]         │ │
                  └────────────────┘ │
                                    │
```

### Into CriticReviewPage (Critic)

The critic preferences should appear **below** the certification panel.

**Add this import:**
```typescript
import { CriticPreferencesPanel } from "@/components/critic-preferences-panel";
```

**Add this JSX** (after the review panel):
```typescript
<div className="flex-1 overflow-y-auto">
  <CriticReviewPanel />
  {/* Add this right after review panel */}
  <CriticPreferencesPanel isEmbedded={true} />
</div>
```

## Component Props

### AdvisorPreferencesPanel
```typescript
interface AdvisorPreferencesPanelProps {
  isEmbedded?: boolean;  // true = sidebar mode, false = floating button
}

// Default usage (embedded in sidebar)
<AdvisorPreferencesPanel />

// Floating mode
<AdvisorPreferencesPanel isEmbedded={false} />
```

### CriticPreferencesPanel
```typescript
interface CriticPreferencesPanelProps {
  isEmbedded?: boolean;  // true = sidebar mode, false = floating button
}

// Default usage (embedded in sidebar)
<CriticPreferencesPanel />

// Floating mode
<CriticPreferencesPanel isEmbedded={false} />
```

## Styling Notes

### Embedded Mode
- Takes up space in the sidebar
- Condensed layout with smaller text
- Always visible (no toggle button)
- Clean borders between sections
- Fits nicely below review panel

### Floating Mode
- Fixed position on right edge
- Minimal footprint when closed (`[>]` button)
- Full-width panel when open (320px)
- Can be used anywhere on the page

## Default Behavior

**When `isEmbedded` is NOT specified:**
```typescript
<AdvisorPreferencesPanel />
// Defaults to isEmbedded={true}
// Appears in sidebar, always visible
```

**When `isEmbedded={true}` explicitly:**
```typescript
<AdvisorPreferencesPanel isEmbedded={true} />
// Embedded sidebar mode
```

**When `isEmbedded={false}` explicitly:**
```typescript
<AdvisorPreferencesPanel isEmbedded={false} />
// Floating button mode
```

## Layout Integration Pattern

### For EditorAICompanion (Right Sidebar)

```typescript
"use client";

import { AdvisorReviewPanel } from "@/components/advisor-review-panel";
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";

export function EditorAICompanion({ documentId, isAdvisorViewing }) {
  return (
    <div className="border-l border-gray-200 dark:border-gray-800 flex flex-col h-full w-80 bg-white dark:bg-slate-950">
      {/* Review Panel at top */}
      {isAdvisorViewing && (
        <AdvisorReviewPanel 
          documentId={documentId}
          onReviewSubmit={() => {}}
        />
      )}
      
      {/* Preferences Panel below */}
      {isAdvisorViewing && (
        <AdvisorPreferencesPanel isEmbedded={true} />
      )}
      
      {/* Other sidebar content */}
    </div>
  );
}
```

## Visual Layout Examples

### Advisor Review Page
```
┌──────────────────────────────────────────────────┐
│ Document Editor                    │ Right Sidebar
│                                    │
│                                    │ ┌─────────────┐
│                                    │ │ Comments    │
│ (Document content here)            │ │ [Approve]   │
│                                    │ │ [Revise]    │
│                                    │ └─────────────┘
│                                    │ ┌─────────────┐
│                                    │ │ Suggestions │
│                                    │ │ Tone: [sel] │
│                                    │ │ [Save]      │
│                                    │ └─────────────┘
└──────────────────────────────────────────────────┘
```

### Critic Certification Page
```
┌──────────────────────────────────────────────────┐
│ Document Viewer                    │ Right Sidebar
│                                    │
│                                    │ ┌─────────────┐
│                                    │ │ Certify     │
│ (Document content here)            │ │ [Certify]   │
│                                    │ │ [Revise]    │
│                                    │ └─────────────┘
│                                    │ ┌─────────────┐
│                                    │ │ Review Prefs│
│                                    │ │ Style: [sel]│
│                                    │ │ [Save]      │
│                                    │ └─────────────┘
└──────────────────────────────────────────────────┘
```

## Step-by-Step Integration

### Step 1: Find Editor AI Companion
```
File: src/components/editor-ai-companion.tsx
Look for: AdvisorReviewPanel component
```

### Step 2: Add Import
```typescript
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";
```

### Step 3: Add Component After Review Panel
```typescript
{isAdvisorViewing && (
  <>
    <AdvisorReviewPanel documentId={documentId} onReviewSubmit={handleReview} />
    <AdvisorPreferencesPanel isEmbedded={true} />
  </>
)}
```

### Step 4: Test
1. Load advisor document review page
2. Should see preferences section below review panel
3. Click Save when changing settings
4. Preferences persist after refresh

## Benefits of This Approach

✅ **No Navigation Needed** - Always visible alongside document
✅ **No Context Switching** - Advisor stays in review workflow
✅ **Quick Adjustments** - Change tone/detail mid-review if needed
✅ **Cleaner UI** - Sidebar keeps related items grouped
✅ **Responsive** - Works on various screen sizes
✅ **Flexible** - Can switch to floating mode if needed

## Troubleshooting

### Preferences Panel Doesn't Appear
- Check import statement
- Verify component is rendered below review panel
- Check browser console for errors

### Panel Takes Up Too Much Space
- Use `isEmbedded={true}` - it's more compact
- Only essential settings shown in embedded mode
- Scrollable if content overflows

### Settings Not Persisting
- Check localStorage is enabled
- Verify browser allows localStorage
- Check for TypeScript errors in console

## Files to Modify

1. **Editor Component**
   - `src/components/editor-ai-companion.tsx` - Add advisor panel
   - OR find equivalent in your UI

2. **Critic Component**
   - Find critic review/certification page
   - Add critic preferences panel

## Summary

The preferences panels now **fit perfectly in the sidebar** next to document review panels. Just import and render them with `isEmbedded={true}` to get a clean, integrated experience.

---

**Status:** ✅ Ready to Integrate
**Integration Time:** ~5-10 minutes per component
**Difficulty:** Easy
