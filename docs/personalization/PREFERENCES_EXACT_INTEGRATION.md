# Preferences Panel - Exact Integration Location

## Current Layout Structure

The editor uses this grid layout (line 221 in `editor-old.tsx`):

```
┌────────────────────────────────────────────────────┐
│  Grid: lg:grid-cols-[1fr_350px]                    │
│                                                    │
│  Column 1 (1fr)          │  Column 2 (350px)      │
│                          │                         │
│  - Alert                 │  EditorAICompanion     │
│  - EditorHeader          │  (Left-side buttons)   │
│  - RichTextEditor        │                         │
│                          │  CommentSidebar        │
│                          │  (Floating, top-right) │
└────────────────────────────────────────────────────┘
```

## The Problem

**EditorAICompanion is currently positioned as a LEFT-SIDE VERTICAL BUTTON BAR** (lines 38-92):

```typescript
return (
  <>
    <div>
      <div className="flex flex-col gap-4 pt-20">  {/* ← This is a vertical button bar on LEFT */}
        <Button>Comments</Button>
        <Button>AI Assistant</Button>
        <Button>Smart AI</Button>
        {isAdvisorViewing && (
          <div className="hidden lg:block space-y-6">
            <ReviewerAiToolkit />
            <AdvisorReviewPanel />  {/* ← Review panel hidden on mobile, shown on desktop */
          </div>
        )}
      </div>
    </div>
    
    {/* Floating comment sidebar on RIGHT */}
    {isCommentSidebarOpen && (
      <div className="fixed top-16 right-0 h-[calc(100vh-64px)] w-80">
        <CommentSidebar />
      </div>
    )}
  </>
);
```

## Where the Review Panels Actually Are

**AdvisorReviewPanel and CriticReviewPanel are HIDDEN inside EditorAICompanion's vertical button layout.**

They appear as:
```
Left side of screen:
┌─────────────┐
│  •          │  Comment button
│  •          │  AI Assistant
│  •          │  Smart AI
│             │
│  ReviewerAI │  
│  Toolkit    │
│             │
│  Advisor    │  ← AdvisorReviewPanel (shown if isAdvisorViewing && reviewStatus === 'submitted')
│  Review     │
│  Panel      │
└─────────────┘
```

## The Proper Layout Should Be

We need to restructure it to show review panels on the **RIGHT SIDEBAR instead**:

```
┌──────────────────────────────────────────────────┐
│  Main Editor         │  Right Sidebar           │
│                      │                          │
│  Document Header     │  Review/Comments Panel   │
│  Rich Text Editor    │  (300-350px wide)        │
│  (Full width)        │                          │
│                      │  ─────────────────       │
│                      │                          │
│                      │  Preferences Panel       │
│                      │  (Embedded section)      │
│                      │                          │
│  Left Buttons ──[>>] │                          │
│  (Floating, fixed)   │                          │
└──────────────────────────────────────────────────┘
```

## Solution: Restructure EditorAICompanion

### Current Code (Lines 38-92):
```typescript
return (
  <>
    <div>
      <div className="flex flex-col gap-4 pt-20">  {/* ← Vertical button bar */}
        {/* Buttons here */}
        {isAdvisorViewing && (
          <div className="hidden lg:block space-y-6">
            <ReviewerAiToolkit />
            <AdvisorReviewPanel />  {/* ← Hidden in left sidebar */}
          </div>
        )}
      </div>
    </div>
    {/* Floating comment sidebar */}
  </>
);
```

### What We Need to Do

Move the review panels OUT of the EditorAICompanion and into the main layout as a **right sidebar component**.

---

## Correct Implementation

The review panels should be rendered at the **right column of the main grid** (line 221 in editor-old.tsx), not inside EditorAICompanion.

**File:** `src/components/editor-old.tsx`

**Current Grid (Line 221):**
```typescript
<div className={`grid ${isAdvisorViewing || doc.isCriticViewing ? 'lg:grid-cols-[1fr_350px]' : 'lg:grid-cols-[1fr_auto]'} gap-8 max-w-7xl mx-auto`}>
  
  {/* Left column: Main editor content */}
  <div className="space-y-4">
    {/* ... */}
    <EditorAICompanion ... />  {/* ← Vertical buttons on LEFT */}
  </div>
  
  {/* RIGHT COLUMN - Currently empty! */}
  
</div>
```

### What's Actually Needed

```typescript
<div className={`grid lg:grid-cols-[1fr_350px] gap-8 max-w-7xl mx-auto`}>
  
  {/* Left Column: Editor + Buttons */}
  <div className="space-y-4">
    {/* EditorHeader */}
    {/* RichTextEditor */}
    
    {/* Floating buttons sidebar */}
    <EditorAICompanion 
      showOnlyButtons={true}  {/* Only show button bar, not review panels */}
      ...
    />
  </div>
  
  {/* RIGHT COLUMN: Review Panels + Preferences */}
  {(isAdvisorViewing || isCriticViewing) && (
    <div className="border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-120px)] overflow-y-auto">
      {/* Review Panel */}
      {isAdvisorViewing && reviewStatus === 'submitted' && (
        <AdvisorReviewPanel documentId={documentId} onReviewSubmit={onReviewSubmit} />
      )}
      {isCriticViewing && (
        <CriticReviewPanel documentId={documentId} onReviewSubmit={onReviewSubmit} />
      )}
      
      {/* Preferences Panel */}
      {isAdvisorViewing && (
        <AdvisorPreferencesPanel isEmbedded={true} />
      )}
      {isCriticViewing && (
        <CriticPreferencesPanel isEmbedded={true} />
      )}
    </div>
  )}
  
</div>
```

## Step-by-Step Fix

### Step 1: Move Review Panels OUT of EditorAICompanion

**File:** `src/components/editor-ai-companion.tsx`

Remove these lines (64-75):
```typescript
{isAdvisorViewing && (
  <div className="hidden lg:block space-y-6">
    <ReviewerAiToolkit editor={editor} />
    {reviewStatus === 'submitted' && <AdvisorReviewPanel documentId={documentId} onReviewSubmit={onReviewSubmit} />}
  </div>
)}
{isCriticViewing && (
  <div className="hidden lg:block space-y-6">
    <ReviewerAiToolkit editor={editor} />
    <CriticReviewPanel documentId={documentId} onReviewSubmit={onReviewSubmit} />
  </div>
)}
```

Keep only the button bar functionality.

### Step 2: Add Right Sidebar in editor-old.tsx

**File:** `src/components/editor-old.tsx` (after line 252)

Add these imports:
```typescript
import { AdvisorReviewPanel } from "./advisor-review-panel";
import { CriticReviewPanel } from "./critic-review-panel";
import { AdvisorPreferencesPanel } from "./advisor-preferences-panel";
import { CriticPreferencesPanel } from "./critic-preferences-panel";
```

Modify the grid (around line 221):
```typescript
<div className={`grid ${isAdvisorViewing || doc.isCriticViewing ? 'lg:grid-cols-[1fr_350px]' : 'lg:grid-cols-[1fr_auto]'} gap-8 max-w-7xl mx-auto`}>
  
  <div className="space-y-4">
    {/* ... existing content ... */}
  </div>
  
  {/* ← Add this right sidebar */}
  {(isAdvisorViewing || doc.isCriticViewing) && (
    <div className="hidden lg:flex flex-col border-l border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[calc(100vh-200px)]">
      
      {/* Review Panel */}
      {isAdvisorViewing && doc.reviewStatus === 'submitted' && (
        <AdvisorReviewPanel 
          documentId={documentId} 
          onReviewSubmit={doc.fetchDocumentData} 
        />
      )}
      {doc.isCriticViewing && (
        <CriticReviewPanel 
          documentId={documentId} 
          onReviewSubmit={doc.fetchDocumentData} 
        />
      )}
      
      {/* Preferences Panel */}
      {isAdvisorViewing && (
        <AdvisorPreferencesPanel isEmbedded={true} />
      )}
      {doc.isCriticViewing && (
        <CriticPreferencesPanel isEmbedded={true} />
      )}
    </div>
  )}
  
</div>
```

## Visual Result After Fix

```
┌──────────────────────────────────────┬─────────────────┐
│                                      │                 │
│  Document Title                      │ Advisor Review  │
│  ──────────────────────────────────  │ Panel           │
│                                      │                 │
│  [Formatting toolbar]                │ ─────────────── │
│  ──────────────────────────────────  │                 │
│                                      │ Suggestion      │
│  Rich Text Editor                    │ Preferences     │
│  (Full width, no buttons blocking)   │                 │
│                                      │ Tone: [Sel]     │
│                                      │ Detail: [Sel]   │
│                                      │ [Save]          │
│                                      │                 │
│ [Buttons]                            │                 │
│ Floating on left                     │                 │
│ Comments                             │                 │
│ AI Assistant                         │                 │
└──────────────────────────────────────┴─────────────────┘
```

## Summary

1. **EditorAICompanion** should only contain the **left-side button bar**
2. **Review panels** should move to the **right sidebar** in the main grid
3. **Preferences panels** should sit **below review panels** in the same right sidebar
4. Both should only appear when `isAdvisorViewing` or `isCriticViewing` is true

---

**Next Step:** Should I make these changes? This will properly position everything.
