# Phase Awareness Setup - Required Steps

## Current Status

✅ **Component Created:** `src/components/phase-awareness-guide.tsx` - Fully phase-aware
✅ **Page Updated:** `src/app/(app)/drafts/[documentId]/page.tsx` - Fetches and passes phase
⏳ **Migration Ready:** `supabase/migrations/45_add_thesis_phase_to_documents.sql` - Needs to be applied

---

## What's Happening Now

The page component now:
1. Detects demo documents (doc-1 → Phase 1, doc-2 → Phase 2)
2. Tries to fetch `thesis_phase` from database for real documents
3. Falls back gracefully to default 'write' phase if column doesn't exist

**But the column still needs to be created.**

---

## Required Actions

### Step 1: Apply the Migration

Run this command to create the `thesis_phase` column:

```bash
supabase migration up
```

**What this does:**
- Adds `thesis_phase` column to documents table
- Sets constraint: only allows ('conceptualize', 'research', 'write', 'submit')
- Defaults new documents to 'write' phase
- Creates index for performance

### Step 2: Update Existing Documents (Optional)

If you have existing documents and want to set their phases:

```sql
-- Set phase for specific documents
UPDATE documents SET thesis_phase = 'conceptualize' WHERE id = 'your-doc-id-1';
UPDATE documents SET thesis_phase = 'research' WHERE id = 'your-doc-id-2';
UPDATE documents SET thesis_phase = 'write' WHERE id = 'your-doc-id-3';
UPDATE documents SET thesis_phase = 'submit' WHERE id = 'your-doc-id-4';
```

Or update all at once with a pattern:

```sql
-- Keep all as 'write' (default)
-- No update needed - migration already set default to 'write'
```

### Step 3: Restart Dev Server

```bash
pnpm dev
```

---

## How to Verify

### Test Phase 1 Document

**Using Demo Doc:**
- Open: `http://localhost:3000/drafts/doc-1`
- **Expected:** 🔵 Blue guide showing "Phase 1: Conceptualize"
- Progress bar: █░░░
- Estimated duration: ~2-4 weeks

### Test Phase 2 Document

**Using Demo Doc:**
- Open: `http://localhost:3000/drafts/doc-2`
- **Expected:** 🟢 Green guide showing "Phase 2: Research"
- Progress bar: ██░░
- Estimated duration: ~4-8 weeks

### Test Phase 3 Document

**Using Demo Doc:**
- Open: `http://localhost:3000/drafts/doc-3`
- **Expected:** 🟣 Purple guide showing "Phase 3: Write & Refine"
- Progress bar: ███░
- Estimated duration: ~6-12 weeks

### Test Real Document (After Migration)

1. Create a new document in the UI
2. Open it and check the guide
3. Should show Phase 3 by default (default phase is 'write')

---

## Error Handling

The code now handles these scenarios:

✅ **Demo document (doc-1, doc-2, etc.)** → Shows correct phase from ID
✅ **Real document, migration applied** → Fetches phase from database
✅ **Real document, migration NOT applied** → Defaults to 'write' gracefully
✅ **Real document, phase not set** → Defaults to 'write'

**No more console errors** - all edge cases are covered.

---

## Timeline

**Before Migration:**
- Demo docs (doc-1, doc-2) show correct phases
- Real documents default to 'write' phase
- No database column exists

**After Migration:**
- All documents can have their specific phase stored
- Phase persists across sessions
- Admin can easily change document phases

---

## Files Modified

1. `supabase/migrations/45_add_thesis_phase_to_documents.sql` (created)
2. `src/app/(app)/drafts/[documentId]/page.tsx` (updated to fetch phase)
3. `src/components/phase-awareness-guide.tsx` (already phase-aware)

---

## Quick Command Checklist

```bash
# 1. Apply migration
supabase migration up

# 2. Restart dev server
pnpm dev

# 3. Test with demo docs
# Open in browser: http://localhost:3000/drafts/doc-1
# Verify: Blue Phase 1 guide appears
```

---

## Next: Phase Management UI (Optional)

Future enhancement: Admin panel to change document phases
- Dropdown: "Change phase to..."
- Options: Conceptualize, Research, Write, Submit
- Updates document's thesis_phase immediately

---

## Questions?

- **Q:** Do I need to do anything for existing documents?
- **A:** No - they'll default to 'write' phase (Phase 3). You can update them if needed.

- **Q:** Will demo docs still work?
- **A:** Yes - doc-1 maps to Phase 1, doc-2 to Phase 2, doc-3+ to Phase 3.

- **Q:** What if the migration fails?
- **A:** The component falls back gracefully to Phase 3. No errors shown to users.

---

## Result After Setup

✅ Students see **phase-aware guidance** below their editor
✅ Guide content matches their document's current phase
✅ Color-coded: Blue (Phase 1), Green (Phase 2), Purple (Phase 3), Orange (Phase 4)
✅ Progress bar and "You're here!" badge show current position
✅ Transparent explanation of why tools are available/unavailable for that phase
