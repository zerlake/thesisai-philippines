# Supabase AI Chat Instructions

## Current Status
- ✅ Backup created
- ✅ Duplicate rows deleted
- ⏳ Need to verify no data was lost

---

## Next Step: Safety Check

**Copy and paste this to Supabase AI:**

```
Run option 2 - safety check to ensure no unintended versions were lost.
```

---

## What This Does

The safety check will:

1. Compare distinct versions in **backup table** vs **current table**
2. Verify all unique migration versions still exist
3. Confirm only duplicate rows were removed (not unique migrations)

---

## Expected Result

You should see something like:

| Check | Result |
|-------|--------|
| Versions in backup | X |
| Versions in current | X |
| Missing versions | 0 |

If "Missing versions" is **0**, the cleanup was successful.

---

## After Safety Check Passes

### Optional: Run Vacuum/Analyze

Tell Supabase AI:

```
Run option 3 - vacuum/analyze the table to reclaim space.
```

### Verify in Terminal

Run this command locally:

```bash
supabase migration list
```

Check if local and remote are now in sync.

---

## If Something Went Wrong

### Restore from Backup

```sql
-- Clear current table
TRUNCATE supabase_migrations.schema_migrations;

-- Restore from backup
INSERT INTO supabase_migrations.schema_migrations
SELECT * FROM supabase_migrations.schema_migrations_backup;

-- Verify
SELECT count(*) FROM supabase_migrations.schema_migrations;
```

---

## Final Cleanup (After Everything Works)

Remove the backup table:

```sql
DROP TABLE IF EXISTS supabase_migrations.schema_migrations_backup;
```
