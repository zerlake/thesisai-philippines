# Manual Migration: Apply Thesis Phase Column

## Issue
Docker Desktop is not available, so we can't use `supabase db push` directly. We need to apply the migration manually through Supabase dashboard.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com
   - Go to your project
   - Click **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click **New Query**
   - Paste the SQL from `APPLY_THESIS_PHASE_MIGRATION.sql`

3. **Run the Query**
   - Click **RUN**
   - Wait for success message

**SQL to Run:**
```sql
ALTER TABLE documents
ADD COLUMN thesis_phase TEXT NOT NULL DEFAULT 'write' 
  CHECK (thesis_phase IN ('conceptualize', 'research', 'write', 'submit'));

CREATE INDEX IF NOT EXISTS idx_documents_phase ON documents(user_id, thesis_phase);

COMMENT ON COLUMN documents.thesis_phase IS 'Current phase of the thesis: conceptualize, research, write, or submit';
```

### Option 2: Using psql Command Line

If you have PostgreSQL tools installed:

```bash
psql "postgresql://postgres:password@localhost:5432/postgres" -f APPLY_THESIS_PHASE_MIGRATION.sql
```

Replace with your actual connection details.

---

## After Migration Applied

✅ The `thesis_phase` column will be added to documents table
✅ New documents default to 'write' phase
✅ Existing documents will also default to 'write' phase

### Then Restart Dev Server

```bash
pnpm dev
```

---

## Verify It Worked

After applying migration and restarting:

1. Open `http://localhost:3000/drafts/doc-1`
   - Should see: 🔵 **Phase 1: Conceptualize** (Blue guide)

2. Open `http://localhost:3000/drafts/doc-2`
   - Should see: 🟢 **Phase 2: Research** (Green guide)

3. Open `http://localhost:3000/drafts/doc-3`
   - Should see: 🟣 **Phase 3: Write & Refine** (Purple guide)

If guides show different colors and phases, the migration worked! ✅

---

## What This Migration Does

```sql
ALTER TABLE documents
ADD COLUMN thesis_phase TEXT NOT NULL DEFAULT 'write' 
```

**Adds a new column to documents table:**
- Column name: `thesis_phase`
- Data type: TEXT
- Default value: `'write'` (Phase 3)
- Constraint: Only allows ('conceptualize', 'research', 'write', 'submit')

```sql
CREATE INDEX IF NOT EXISTS idx_documents_phase ON documents(user_id, thesis_phase);
```

**Creates an index for fast queries** when filtering documents by phase

---

## File Location

The SQL is in: `APPLY_THESIS_PHASE_MIGRATION.sql`

You can also find it in: `supabase/migrations/45_add_thesis_phase_to_documents.sql`

---

## After This is Done

The phase awareness system will be fully functional:

✅ **Phase Detection** - System knows which phase each document is in
✅ **Dynamic Guide** - Shows correct phase-specific guidance below editor
✅ **Color Coding** - Blue/Green/Purple/Orange based on phase
✅ **Progress Bar** - Shows advancement (Phase 1 of 4, etc.)
✅ **Context Awareness** - "You're here!" badge and phase-specific content

---

## Questions?

- **Q:** Can I apply this later?
- **A:** Yes, but the phase awareness guide will default to Phase 3 until applied.

- **Q:** Will this affect existing documents?
- **A:** No - all documents will get the column with 'write' as default value.

- **Q:** Can I change a document's phase later?
- **A:** Yes, update the column: `UPDATE documents SET thesis_phase = 'conceptualize' WHERE id = '...'`
