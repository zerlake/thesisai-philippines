# Migration Sync Options

## Current Status

After duplicate cleanup, there's still a mismatch between local and remote migrations.

**Problem:** Local migration files exist that aren't tracked in remote history.

---

## Option A: Mark Local Migrations as Applied (Recommended)

If the database already has these changes applied, mark them as applied in the migration history.

### Recent Migrations to Mark as Applied

```bash
supabase migration repair 20251219000000 20251219152120 20251219180000 20251220000000 --status applied
```

### What This Does

| Migration | Description |
|-----------|-------------|
| `20251219000000` | ensure_demo_users |
| `20251219152120` | disable_rls_on_auth_users |
| `20251219180000` | create_all_demo_users |
| `20251220000000` | create_review_notes_table |

This tells Supabase: "These migrations are already applied to the database, add them to the history."

---

## Option B: Clean Up Old Migration Files

The old numbered migrations (26, 27, 28, etc.) in local may be duplicates of properly timestamped ones.

### Files to Review for Deletion

Located in `supabase/migrations/`:

```
26_create_logs_table.sql
27_advisor_critic_rls_policies.sql
28_advisor_critic_rls_policies.sql
29_advisor_critic_rls_policies.sql
30_advisor_critic_rls_reset.sql
31_fix_advisor_critic_rls_comprehensive.sql
32_fix_advisor_requests_rls.sql
40_advisor_critic_suggestion_preferences.sql
41_add_status_to_documents.sql
42_advisor_student_messages.sql
44_make_document_id_nullable.sql
45_add_thesis_phase_to_documents.sql
46_document_versions_and_checkpoints.sql
50_allow_demo_documents.sql
51_add_content_json_column.sql
52_change_documents_id_to_text.sql
53_change_documents_user_id_to_text.sql
54_dynamic_work_context.sql
55_enhanced_next_action_rpc.sql
56_add_sample_messaging_demo_data.sql
99_create_demo_users.sql
```

### Before Deleting

1. Check if these are duplicates of remote migrations
2. Backup the files first
3. Delete only if confirmed redundant

---

## Recommended Steps

### Step 1: Run Option A First

```bash
supabase migration repair 20251219000000 20251219152120 20251219180000 20251220000000 --status applied
```

### Step 2: Verify

```bash
supabase migration list
```

### Step 3: If Still Mismatched

Consider cleaning up old numbered migration files (Option B) or marking them as reverted:

```bash
supabase migration repair 26 27 28 29 30 31 32 40 41 42 44 45 46 50 51 52 53 54 55 56 99 --status reverted
```

---

## Goal

The migration list should show matching Local and Remote columns:

```
   Local          | Remote         | Time (UTC)
  ----------------|----------------|---------------------
   20251220000000 | 20251220000000 | 2025-12-20 00:00:00
```

When both columns match, migrations are in sync.
