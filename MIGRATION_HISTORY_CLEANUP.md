# Migration History Cleanup Guide

## Problem
The Supabase migration history has duplicate entries causing sync issues between local and remote.

---

## Solution: Supabase AI Cleanup Process

### Step 1: Backup Created ✅

A backup table was created:
```sql
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations_backup
AS TABLE supabase_migrations.schema_migrations WITH NO DATA;

INSERT INTO supabase_migrations.schema_migrations_backup
SELECT * FROM supabase_migrations.schema_migrations;

-- Validate backup row count
SELECT 'backup_row_count' AS label, count(*) AS count
FROM supabase_migrations.schema_migrations_backup;
```

---

### Step 2: Delete Duplicate Rows

**Proposed SQL** (execute after confirming):

```sql
WITH duplicates AS (
  SELECT ctid
  FROM (
    SELECT
      ctid,
      ROW_NUMBER() OVER (
        PARTITION BY version, name, array_to_string(statements, E'\n')
        ORDER BY ctid
      ) AS rn
    FROM supabase_migrations.schema_migrations
  ) t
  WHERE rn > 1
)
DELETE FROM supabase_migrations.schema_migrations
WHERE ctid IN (SELECT ctid FROM duplicates);
```

**What this does:**
| Step | Action |
|------|--------|
| 1 | Groups migrations by `version`, `name`, and `statements` |
| 2 | Assigns row numbers within each group |
| 3 | Keeps the first occurrence (`rn = 1`) |
| 4 | Deletes all subsequent duplicates (`rn > 1`) |

---

## Recommendation

**Type `YES` to proceed** with the duplicate deletion in Supabase AI chat.

### Why it's safe:
- ✅ Backup was created first
- ✅ Uses standard PostgreSQL `ctid` for duplicate handling
- ✅ Preserves one copy of each unique migration
- ✅ Non-destructive to actual database schema

---

## After Cleanup

Run these commands to verify:

```bash
# Check migration list
supabase migration list

# If still mismatched, repair specific versions
supabase migration repair <version> --status applied
# or
supabase migration repair <version> --status reverted
```

---

## Restore from Backup (if needed)

If something goes wrong, restore from backup:

```sql
-- Clear current table
TRUNCATE supabase_migrations.schema_migrations;

-- Restore from backup
INSERT INTO supabase_migrations.schema_migrations
SELECT * FROM supabase_migrations.schema_migrations_backup;

-- Verify restoration
SELECT count(*) FROM supabase_migrations.schema_migrations;
```

---

## Cleanup Backup (after verification)

Once everything is working:

```sql
DROP TABLE IF EXISTS supabase_migrations.schema_migrations_backup;
```
