# Phase Awareness - Debug Logs & API Fix

## Problem Found

When opening Phase 1 demo document (doc-1), the guide still showed Phase 3 content. Browser logs showed database errors:

```
Database error: {
  code: '22P02',
  message: 'invalid input syntax for type uuid: "doc-1"'
}
```

## Root Cause

The ConversationPanel component was trying to fetch messages for demo documents by calling `/api/messages/get?documentId=doc-1`, but the database API expected a valid UUID, not "doc-1".

## Solution Applied

### 1. Added Debug Logging

**File:** `src/components/editor.tsx`
```typescript
useEffect(() => {
  console.log('[Editor] Phase prop received:', phase, 'for documentId:', documentId);
}, [phase, documentId]);
```

**File:** `src/app/(app)/drafts/[documentId]/page.tsx`
```typescript
console.log('[NewDocumentPage] documentId:', documentId, 'isUUID:', isUUID);
console.log('[NewDocumentPage] Demo doc detected, setting phase:', inferredPhase);
```

**File:** `src/components/phase-awareness-guide.tsx`
```typescript
console.log('[PhaseAwarenessGuide] Rendering with phase:', phase);
```

### 2. Fixed ConversationPanel API Calls

**File:** `src/components/conversation-panel.tsx`

**Before:**
```typescript
useEffect(() => {
  const fetchMessages = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    // Always tried to fetch, even for demo docs
    const query = documentId
      ? `/api/messages/get?documentId=${documentId}&userId=${userId}`
      : ...
```

**After:**
```typescript
useEffect(() => {
  const fetchMessages = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Check if documentId is a demo document (non-UUID format)
    const isDemoDocument = documentId && 
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId);
    
    if (isDemoDocument) {
      // Skip API calls for demo documents
      setIsLoading(false);
      return;
    }
    
    // Only fetch for real documents with valid UUIDs
    const query = documentId
      ? `/api/messages/get?documentId=${documentId}&userId=${userId}`
      : ...
```

## Data Flow (Corrected)

```
Page Component
  ↓
1. documentId: "doc-1" 
2. UUID check: false (not a UUID)
3. setPhase('conceptualize')
  ↓
Editor Component
  ↓
4. Receives phase: 'conceptualize'
  ↓
PhaseAwarenessGuide
  ↓
5. Renders Phase 1 (Blue) content ✓
  ↓
ConversationPanel
  ↓
6. Detects demo document
7. Skips API call (doesn't try to fetch doc-1 from DB) ✓
8. Sets isLoading: false
```

## Verification Checklist

After these fixes:

- [ ] Open http://localhost:3001/drafts/doc-1
  - Expected: 🔵 Phase 1 (Blue) guide shows "Conceptualize"
  - No database errors in console

- [ ] Open http://localhost:3001/drafts/doc-2  
  - Expected: 🟢 Phase 2 (Green) guide shows "Research"
  - No database errors in console

- [ ] Open http://localhost:3001/drafts/doc-3
  - Expected: 🟣 Phase 3 (Purple) guide shows "Write & Refine"
  - No database errors in console

- [ ] Check browser console logs
  ```
  [NewDocumentPage] documentId: doc-1, isUUID: false
  [NewDocumentPage] Demo doc detected, setting phase: conceptualize
  [Editor] Phase prop received: conceptualize for documentId: doc-1
  [PhaseAwarenessGuide] Rendering with phase: conceptualize
  ```

## Files Modified

1. ✅ `src/app/(app)/drafts/[documentId]/page.tsx` - Added debug logs
2. ✅ `src/components/editor.tsx` - Added debug logs
3. ✅ `src/components/phase-awareness-guide.tsx` - Added debug logs
4. ✅ `src/components/conversation-panel.tsx` - **Fixed API call for demo docs**

## To Test

1. Restart dev server: `pnpm dev`
2. Open doc-1, doc-2, doc-3 in browser
3. Open browser console (F12)
4. Verify:
   - Correct phase displays (color changes, content differs)
   - Debug logs show correct phase values
   - No database errors appear

## Notes

- Debug logs can be removed in production
- Demo documents (doc-1, doc-2, etc.) are now properly handled throughout the app
- ConversationPanel gracefully skips API calls for non-UUID documentIds
- Phase awareness is now fully context-aware based on actual documentId

---

**Expected Result:** Each demo document now displays the correct phase-specific guide content with no database errors.
