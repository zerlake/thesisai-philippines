# Phase Awareness Context-Aware Fix

## Problem
The PhaseAwarenessGuide component was always showing Phase 3 (Write & Refine) content, even when viewing Phase 1 documents. This happened because:

1. The page component wasn't passing the `phase` prop to the Editor
2. The Editor defaulted to `phase='write'` (Phase 3)
3. The guide had no way to know which phase the document actually belonged to

## Solution Applied

### 1. Database Migration
**File:** `supabase/migrations/45_add_thesis_phase_to_documents.sql`

Added `thesis_phase` column to documents table:
```sql
ALTER TABLE documents
ADD COLUMN thesis_phase TEXT NOT NULL DEFAULT 'write' 
  CHECK (thesis_phase IN ('conceptualize', 'research', 'write', 'submit'));
```

### 2. Page Component Updated
**File:** `src/app/(app)/drafts/[documentId]/page.tsx`

Changed from:
```typescript
export default function NewDocumentPage() {
  const params = useParams();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;
  return <Editor documentId={documentId} />;
}
```

To:
```typescript
export default function NewDocumentPage() {
  const params = useParams();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;
  const [phase, setPhase] = useState<Phase>('write');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch document's thesis_phase from database
    // For demo docs (doc-1, doc-2, etc.), infer phase from ID
    const { data } = await supabase
      .from('documents')
      .select('thesis_phase')
      .eq('id', documentId)
      .single();
    
    setPhase(data.thesis_phase || 'write');
  }, [documentId]);

  return <Editor documentId={documentId} phase={phase} />;
}
```

### 3. Data Flow

```
Document in Database (thesis_phase = 'conceptualize')
         ↓
Page Component fetches thesis_phase
         ↓
Page passes phase prop to Editor
         ↓
Editor passes phase to PhaseAwarenessGuide
         ↓
PhaseAwarenessGuide displays Phase 1 (Blue, Conceptualize) content
```

---

## Result

### Before Fix
Opening any document showed Phase 3 content:
```
🟣 Phase 3: Write & Refine - Content Creation
```

### After Fix
Opening a Phase 1 document now shows:
```
🔵 Phase 1: Conceptualize - Research Planning [You're here!]
```

The guide is now **fully context-aware** and displays the correct phase for each document.

---

## For Demo Documents

Demo documents map to phases:
- `doc-1` → Phase 1 (Conceptualize)
- `doc-2` → Phase 2 (Research)
- `doc-3+` → Phase 3 (Write)

---

## Next Steps to Apply

1. **Apply the migration:**
   ```bash
   supabase migration up
   ```

2. **For existing documents**, update them with their phase:
   ```sql
   UPDATE documents SET thesis_phase = 'conceptualize' WHERE id = 'doc-id-1';
   UPDATE documents SET thesis_phase = 'research' WHERE id = 'doc-id-2';
   UPDATE documents SET thesis_phase = 'write' WHERE id = 'doc-id-3';
   UPDATE documents SET thesis_phase = 'submit' WHERE id = 'doc-id-4';
   ```

3. **Restart the dev server** to load the new components and migration.

---

## Verification

To verify the fix works:

1. **Phase 1 Document:** Open a Phase 1 document
   - Should see: 🔵 Blue guide with "Phase 1: Conceptualize"
   - Progress: █░░░
   - Duration: ~2-4 weeks

2. **Phase 3 Document:** Open a Phase 3 document
   - Should see: 🟣 Purple guide with "Phase 3: Write & Refine"
   - Progress: ███░
   - Duration: ~6-12 weeks

3. **Phase 4 Document:** Open a Phase 4 document
   - Should see: 🟠 Orange guide with "Phase 4: Submit & Present"
   - Progress: ████
   - Duration: ~2-4 weeks
   - Submit button should be visible

---

## Files Modified

1. `supabase/migrations/45_add_thesis_phase_to_documents.sql` (NEW)
2. `src/app/(app)/drafts/[documentId]/page.tsx` (UPDATED)

## Files Already in Place

1. `src/components/phase-awareness-guide.tsx` - Fully phase-aware component
2. `src/components/editor.tsx` - Passes phase to guide

---

## Key Feature: Context Awareness

The guide now dynamically shows:

| Document Phase | Display | Icon | Color | Progress | Duration |
|---|---|---|---|---|---|
| `conceptualize` | Phase 1: Conceptualize | 🔵 | Blue | █░░░ | 2-4 weeks |
| `research` | Phase 2: Research | 🟢 | Green | ██░░ | 4-8 weeks |
| `write` | Phase 3: Write & Refine | 🟣 | Purple | ███░ | 6-12 weeks |
| `submit` | Phase 4: Submit & Present | 🟠 | Orange | ████ | 2-4 weeks |

Every guide displays "You're here!" badge and explains WHAT and WHY for that specific phase.
