# Side Panel Preferences Integration Guide

## Overview

The suggestion/review preferences have been redesigned as **collapsible right-side panels** that appear alongside document review interfaces, eliminating navigation complexity and keeping preferences accessible without context switching.

## Architecture

### Components Created

1. **AdvisorPreferencesPanel** (`src/components/advisor-preferences-panel.tsx`)
   - Compact right-side panel for advisor preferences
   - Collapsible with button toggle
   - Blue color scheme (matches advisor theme)
   - Shows only essential settings in compact format

2. **CriticPreferencesPanel** (`src/components/critic-preferences-panel.tsx`)
   - Compact right-side panel for critic preferences
   - Collapsible with button toggle
   - Purple color scheme (matches critic theme)
   - Optimized for review workflow

## UI/UX Design

### Panel Structure
```
┌─────────────────────────────┐
│ Suggestion Preferences      │ [X] Close
├─────────────────────────────┤
│                             │
│  Tone: [Dropdown]           │
│  Detail: [Dropdown]         │
│                             │
│  Focus Areas:               │
│  ☑ Research Gap             │
│  ☑ Literature Review        │
│  ☑ Methodology              │
│  ☐ ...                      │
│                             │
│  ☑ Auto-generate            │
│                             │
│  Custom Notes:              │
│  [Textarea]                 │
│                             │
├─────────────────────────────┤
│ [Reset] [Save]              │
└─────────────────────────────┘

When closed, shows a button on the right edge:
    [>] (Click to open)
```

### Responsive Design
- Fixed position on right edge of viewport
- Width: 320px (fixed)
- Height: Full viewport height
- Z-index: 50 (above content, below modals)
- Smooth toggle animation

## Integration Steps

### 1. Import in Review Pages

**For Advisor** - Add to any page where advisors review documents:
```typescript
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";

// In your JSX, render it anywhere on the page (it's fixed position):
<AdvisorPreferencesPanel />
```

**For Critic** - Add to any page where critics review documents:
```typescript
import { CriticPreferencesPanel } from "@/components/critic-preferences-panel";

// In your JSX, render it:
<CriticPreferencesPanel />
```

### 2. Suggested Integration Locations

#### Advisor Review Workflow
- ✅ `src/app/(app)/advisor/students/[studentId]/page.tsx` - Student detail view
- ✅ Editor/document viewer where advisor provides feedback
- ✅ `src/components/advisor-review-panel.tsx` - Review dialog/modal
- ✅ Dashboard when reviewing pending documents

#### Critic Review Workflow
- ✅ `src/app/(app)/critic/students/page.tsx` - My students view
- ✅ Document certification interface
- ✅ `src/components/critic-review-panel.tsx` - Review dialog/modal
- ✅ Review queue interface

### 3. Integration Example

**Simple Integration in a Page:**
```typescript
"use client";

import { AdvisorReviewPanel } from "@/components/advisor-review-panel";
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";

export function StudentReviewPage({ studentId }: { studentId: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Document viewer/editor */}
        <DocumentViewer />
        
        {/* Review panel */}
        <AdvisorReviewPanel 
          documentId={documentId} 
          onReviewSubmit={() => {}} 
        />
      </div>
      
      {/* Side panel - automatically positioned */}
      <AdvisorPreferencesPanel />
    </div>
  );
}
```

## Features

### Advisor Panel Features
- **Tone Selection**: Formal, Encouraging, or Balanced
- **Detail Level**: Brief, Moderate, or Comprehensive  
- **Focus Areas**: 8 multi-select categories
- **Auto-generate**: Toggle automatic suggestions
- **Custom Notes**: Free-text instructions for AI
- **Persistent Storage**: localStorage + Supabase
- **Reset Button**: Restore defaults with confirmation

### Critic Panel Features
- **Feedback Style**: Constructive, Critical, or Supportive
- **Review Depth**: Surface, Moderate, or Deep
- **Focus Areas**: 8 multi-select categories
- **Auto-generate**: Toggle automatic feedback
- **Custom Guidelines**: Free-text review criteria
- **Persistent Storage**: localStorage + Supabase
- **Reset Button**: Restore defaults with confirmation

## Behavior

### Opening/Closing
- Closed state shows minimalist button on right edge: `[>]`
- Button text/color matches panel type (blue for advisor, purple for critic)
- Click button to open full panel
- Click `[X]` or the collapse button to minimize
- Panel state persists during session (not persisted across sessions)

### Data Persistence
- **Auto-save on Changes**: Every change triggers save
- **localStorage**: Demo/dev mode fallback
- **Supabase**: Production storage with RLS
- **Toast Notifications**: Success/error feedback
- **Loading State**: Shows "Loading..." while fetching

### Mobile Responsiveness
- On small screens: Panel may overlap content (acceptable for rarely-used feature)
- Panel is always accessible via toggle button
- Can be closed to free up space if needed

## Database Integration

### Tables Used
- `advisor_suggestion_preferences` - Stores advisor settings
- `critic_suggestion_preferences` - Stores critic settings

### RLS Policies
- Users can only see/modify their own preferences
- Automatic user isolation via `advisor_id`/`critic_id`

### Migration Required
```bash
supabase migration up
```
(Migration file: `supabase/migrations/40_advisor_critic_suggestion_preferences.sql`)

## Files Summary

### New Components
- `src/components/advisor-preferences-panel.tsx` (250 lines)
- `src/components/critic-preferences-panel.tsx` (270 lines)

### Removed Files
- ❌ `src/app/(app)/advisor/suggestion-engine/page.tsx`
- ❌ `src/app/(app)/critic/suggestion-engine/page.tsx`
- ❌ `src/components/advisor-suggestion-engine.tsx` (old full-page version)
- ❌ `src/components/critic-suggestion-engine.tsx` (old full-page version)

### Updated Files
- ✅ `src/lib/navigation.ts` (removed navigation items)

## Implementation Checklist

### Phase 1: Core Integration ✅ DONE
- [x] Create advisor preferences panel component
- [x] Create critic preferences panel component
- [x] Implement collapsible UI
- [x] Add localStorage persistence
- [x] Add Supabase integration
- [x] Remove old full-page routes
- [x] Remove old navigation items

### Phase 2: Integration Points
- [ ] Add AdvisorPreferencesPanel to advisor student detail page
- [ ] Add AdvisorPreferencesPanel to document editor/viewer
- [ ] Add CriticPreferencesPanel to critic review queue
- [ ] Add CriticPreferencesPanel to document certification interface
- [ ] Test with actual document review workflows
- [ ] Verify preferences apply to generated suggestions

### Phase 3: Polish
- [ ] Add animation transitions
- [ ] Mobile UX testing
- [ ] Accessibility audit (keyboard nav, ARIA labels)
- [ ] Performance optimization if needed
- [ ] User documentation

## Usage Examples

### Adding to a Document Editor
```typescript
import { EditorComponent } from "./editor";
import { AdvisorPreferencesPanel } from "@/components/advisor-preferences-panel";

export function AdvisorEditor() {
  return (
    <div>
      <EditorComponent />
      <AdvisorPreferencesPanel />
    </div>
  );
}
```

### Adding to a Review Interface
```typescript
import { CriticReviewPanel } from "@/components/critic-review-panel";
import { CriticPreferencesPanel } from "@/components/critic-preferences-panel";

export function ReviewCertificationPage() {
  return (
    <div>
      <CriticReviewPanel documentId={id} onReviewSubmit={() => {}} />
      <CriticPreferencesPanel />
    </div>
  );
}
```

## Styling Details

### Advisor Panel (Blue)
- Open button: `bg-blue-600 hover:bg-blue-700`
- Border: `border-gray-200 dark:border-gray-800`
- Header: Semibold font, slightly larger
- Compact spacing for density

### Critic Panel (Purple)
- Open button: `bg-purple-600 hover:bg-purple-700`
- Border: `border-gray-200 dark:border-gray-800`
- Header: Semibold font, slightly larger
- Compact spacing for density

### Dark Mode Support
- Full dark mode support built-in
- Uses `dark:` Tailwind utilities
- Consistent with app theme

## Performance Considerations

- Minimal component size (~250 lines each)
- Lazy loading preferences on mount
- Debounced saves (optional enhancement)
- No unnecessary re-renders
- Efficient localStorage key structure

## Testing

### Manual Testing
1. Open document review interface
2. Click `[>]` button on right edge
3. Panel should slide in from right
4. Change settings and click Save
5. Refresh page - settings should persist
6. Close panel by clicking `[X]` or collapse button
7. Button should reappear on right edge

### Integration Testing
- Test with actual advisor document review workflow
- Test with actual critic certification workflow
- Verify preferences apply to AI-generated suggestions
- Test on mobile devices
- Test with slow network (ensure loading state visible)

## Known Limitations

- Panel doesn't shrink on very small screens (acceptable - rarely used on mobile)
- No preference presets/templates
- No analytics on setting usage
- No keyboard shortcuts for opening/closing

## Future Enhancements

- Add animation transitions
- Add preset configurations
- Add keyboard shortcut (Ctrl+Shift+P) to toggle
- Add analytics dashboard
- Add preference templates for different roles
- Add scheduling/time-based rules

## Troubleshooting

### Panel Doesn't Appear
- Check that component is imported and rendered
- Verify z-index isn't being overridden (should be 50)
- Check browser console for errors

### Settings Not Saving
- Check browser localStorage is enabled
- Verify Supabase connection (if in production)
- Check network tab for save requests

### Preferences Not Being Used
- Verify preferences are being saved
- Check that suggestion generation code reads preferences
- Verify integration with AI system

## Architecture Decision

**Why right-side panel instead of separate page?**
1. ✅ No context switching away from document being reviewed
2. ✅ Always accessible without navigation
3. ✅ Cleaner UX - preferences available while working
4. ✅ No blind spots in editing
5. ✅ Can quickly adjust settings and re-generate suggestions
6. ✅ Minimal space usage when collapsed

---

**Status:** Ready for Integration
**Date:** December 7, 2025
**Components Ready:** 2
**Integration Points:** TBD
