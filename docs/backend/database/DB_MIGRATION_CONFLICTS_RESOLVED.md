# Database Migration Conflicts - Resolved

## Problem
When running `supabase db push --include-all`, multiple migrations were failing because:
1. Columns already existed (dashboard_notifications, thesis_phase, status)
2. RLS policies were being recreated without dropping first
3. Constraints already existed

## Resolution

### 1. Fixed `20250106_add_dashboard_notifications.sql`
**Issue:** Column already existed, trying to add it again
**Solution:** Wrapped in IF NOT EXISTS check
```sql
DO $$ 
BEGIN
  IF NOT EXISTS(...) THEN
    ALTER TABLE profiles ADD COLUMN dashboard_notifications JSONB ...
  END IF;
END
$$;
```

### 2. Fixed `32_fix_advisor_requests_rls.sql`
**Issue:** RLS policies already existed, couldn't create duplicates
**Solution:** Added DROP POLICY IF EXISTS for all policies before creating
```sql
DROP POLICY IF EXISTS "Advisors can view their advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can update their advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can delete their advisor requests" ON public.advisor_requests;
-- ... then CREATE POLICY
```

### 3. Fixed `41_add_status_to_documents.sql`
**Issue:** Status column and constraint already existed
**Solution:** Wrapped constraint in IF NOT EXISTS check
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'documents' 
    AND constraint_name = 'documents_status_check'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_status_check ...
  END IF;
END
$$;
```

### 4. Fixed `45_add_thesis_phase_to_documents.sql`
**Issue:** Column already existed from manual SQL applied via dashboard
**Solution:** Wrapped in IF NOT EXISTS check
```sql
DO $$ 
BEGIN
  IF NOT EXISTS(...) THEN
    ALTER TABLE documents ADD COLUMN thesis_phase TEXT ...
  END IF;
END
$$;
```

## Files Modified

1. ✅ `supabase/migrations/20250106_add_dashboard_notifications.sql`
2. ✅ `supabase/migrations/32_fix_advisor_requests_rls.sql`
3. ✅ `supabase/migrations/41_add_status_to_documents.sql`
4. ✅ `supabase/migrations/45_add_thesis_phase_to_documents.sql`

## Result

```
✅ Applying migration 20250106_add_dashboard_notifications.sql...
✅ Applying migration 32_fix_advisor_requests_rls.sql...
✅ Applying migration 41_add_status_to_documents.sql...
✅ Applying migration 44_make_document_id_nullable.sql...
✅ Applying migration 45_add_thesis_phase_to_documents.sql...
✅ Finished supabase db push.
```

## Database State

All required columns now exist with safe idempotent migrations:

| Table | Column | Type | Default | Notes |
|-------|--------|------|---------|-------|
| documents | thesis_phase | TEXT | 'write' | Phase: conceptualize, research, write, or submit |
| documents | status | TEXT | 'draft' | Status: draft, submitted, approved, or rejected |
| profiles | dashboard_notifications | JSONB | {...} | Email notification preferences |
| advisor_student_messages | document_id | UUID | null | Made nullable for group messages |

## Next Steps

1. **Restart dev server:** `pnpm dev`
2. **Verify phase awareness:** Open `http://localhost:3000/drafts/doc-1`
3. **Test phases:**
   - doc-1 → Phase 1 (Blue) ✓
   - doc-2 → Phase 2 (Green) ✓
   - doc-3 → Phase 3 (Purple) ✓

---

## Lessons Learned

✅ Use `IF NOT EXISTS` checks for idempotent migrations
✅ Use `DROP ... IF EXISTS` before CREATE for RLS policies
✅ Check `information_schema` for constraints before adding
✅ Wrap DDL in `DO $$ BEGIN ... END $$;` for conditional logic
✅ Make migrations safe to re-run (they may be run multiple times)

---

**Status:** ✅ All migrations successfully applied and database is ready for phase awareness feature.
