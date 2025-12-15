# Database Migration: Add Dashboard Notifications

**Migration ID:** `20250106_add_dashboard_notifications`
**Date:** January 6, 2025
**Purpose:** Add dashboard notification preferences to user profiles
**Status:** Ready to apply

---

## Overview

This migration adds a new column to the `profiles` table to store user notification preferences for dashboard email notifications. Users can control which events (submissions, feedback, milestones, group activity) trigger email notifications.

---

## Migration Details

### Change Summary
- **Table Modified:** `profiles`
- **New Column:** `dashboard_notifications` (JSONB)
- **Default Value:** All notifications enabled
- **Index Created:** `idx_profiles_dashboard_notifications` (GIN index)

### Column Schema

```
Column Name:        dashboard_notifications
Data Type:          JSONB
Nullable:           YES
Default Value:      {
                      "enabled": true,
                      "emailOnSubmission": true,
                      "emailOnFeedback": true,
                      "emailOnMilestone": true,
                      "emailOnGroupActivity": true
                    }
Indexed:            YES (GIN index)
Purpose:            Store user's email notification preferences
```

---

## SQL Statement

```sql
-- Add dashboard notification preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN dashboard_notifications JSONB DEFAULT '{
  "enabled": true,
  "emailOnSubmission": true,
  "emailOnFeedback": true,
  "emailOnMilestone": true,
  "emailOnGroupActivity": true
}'::jsonb;

-- Create index for better query performance
CREATE INDEX idx_profiles_dashboard_notifications ON profiles USING GIN (dashboard_notifications);

-- Add comment to explain the column
COMMENT ON COLUMN profiles.dashboard_notifications IS 'JSON configuration for email notifications across dashboards (student, advisor, critic, group-leader)';
```

---

## Default Configuration

All new profiles will have the following default notification preferences:

```json
{
  "enabled": true,
  "emailOnSubmission": true,
  "emailOnFeedback": true,
  "emailOnMilestone": true,
  "emailOnGroupActivity": true
}
```

### Explanation

| Setting | Description |
|---------|-------------|
| `enabled` | Master toggle - enables/disables all notifications |
| `emailOnSubmission` | Receive emails when documents are submitted (advisors/critics only) |
| `emailOnFeedback` | Receive emails when feedback is provided or revision requested |
| `emailOnMilestone` | Receive emails when milestones are reached |
| `emailOnGroupActivity` | Receive emails about group collaboration activities |

---

## How to Apply

### Method 1: Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd c:\Users\Projects\thesis-ai-fresh

# Apply all pending migrations
supabase migration up
```

### Method 2: Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the SQL statement from this file
6. Paste into the editor
7. Click **Run**

### Method 3: psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://[user]:[password]@[host]:5432/[database]"

# Run the SQL statements
\i supabase/migrations/20250106_add_dashboard_notifications.sql
```

---

## Verification

After applying the migration, verify it was successful:

### Check Column Exists

```sql
-- Verify the new column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'dashboard_notifications';
```

**Expected Output:**
```
 column_name                 | data_type | column_default
-----------------------------|-----------|------------------------------------
 dashboard_notifications     | jsonb     | '{...}'::jsonb
```

### Check Index Exists

```sql
-- Verify the GIN index was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_dashboard_notifications';
```

**Expected Output:**
```
 indexname                              | indexdef
---------------------------------------|---------------------------------------------------
 idx_profiles_dashboard_notifications  | CREATE INDEX idx_profiles_dashboard_notifications ...
```

### Check Default Value

```sql
-- Verify default value on existing profiles
SELECT id, dashboard_notifications 
FROM profiles 
LIMIT 5;
```

**Expected Output:** All rows should have the default JSON structure.

### Check Column Comment

```sql
-- Verify the comment was added
SELECT column_name, col_description 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'dashboard_notifications';
```

---

## Rollback Instructions

If you need to revert this migration:

```sql
-- Remove the index
DROP INDEX IF EXISTS idx_profiles_dashboard_notifications;

-- Remove the column
ALTER TABLE profiles 
DROP COLUMN IF EXISTS dashboard_notifications;
```

---

## Impact Analysis

### Affected Tables
- `profiles` table

### Data Loss
- None - this is an additive change only

### Performance Impact
- **Minimal** - Only adds a new column with GIN index
- Queries that don't use this column are unaffected
- GIN index improves performance for JSONB queries

### Backwards Compatibility
- ✅ Fully backwards compatible
- Existing code continues to work
- No breaking changes
- All existing profiles get default settings

---

## Usage in Application

### Reading Preferences

```typescript
// Get user's notification preferences
const { data: profile } = await supabase
  .from('profiles')
  .select('dashboard_notifications')
  .eq('id', userId)
  .single();

const preferences = profile.dashboard_notifications;
// {
//   enabled: true,
//   emailOnSubmission: true,
//   emailOnFeedback: true,
//   emailOnMilestone: true,
//   emailOnGroupActivity: true
// }
```

### Updating Preferences

```typescript
// Update user's notification preferences
const { data } = await supabase
  .from('profiles')
  .update({
    dashboard_notifications: {
      enabled: true,
      emailOnSubmission: false,  // Changed
      emailOnFeedback: true,
      emailOnMilestone: true,
      emailOnGroupActivity: true,
    },
    updated_at: new Date().toISOString(),
  })
  .eq('id', userId)
  .select()
  .single();
```

### Query with Conditions

```typescript
// Get profiles where notifications are enabled
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('dashboard_notifications->enabled', true);

// Get profiles with feedback notifications enabled
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('dashboard_notifications->emailOnFeedback', true);
```

---

## API Integration

The notification system uses this column via the API endpoint:

### GET User Preferences
```http
GET /api/user/notification-preferences
Authorization: Bearer <auth_token>
```

**Response:**
```json
{
  "dashboardNotifications": {
    "enabled": true,
    "emailOnSubmission": true,
    "emailOnFeedback": true,
    "emailOnMilestone": true,
    "emailOnGroupActivity": true
  }
}
```

### PUT Update Preferences
```http
PUT /api/user/notification-preferences
Authorization: Bearer <auth_token>
Content-Type: application/json

{
  "dashboardNotifications": {
    "enabled": true,
    "emailOnSubmission": false,
    "emailOnFeedback": true,
    "emailOnMilestone": true,
    "emailOnGroupActivity": true
  }
}
```

---

## Testing Checklist

After applying the migration:

- [ ] Migration runs without errors
- [ ] Column exists in `profiles` table
- [ ] Index was created successfully
- [ ] Existing profiles have default values
- [ ] New profiles get default values
- [ ] API endpoint can read preferences
- [ ] API endpoint can update preferences
- [ ] Settings persist after update
- [ ] Settings show in UI dialog

---

## Related Files

### Code Files
- `src/app/api/user/notification-preferences/route.ts` - API endpoint implementation
- `src/hooks/useDashboardNotifications.ts` - Hook for notifications
- `src/components/dashboard-notification-settings.tsx` - UI component

### Updated Dashboards
- `src/app/thesis-phases/page.tsx` - Student dashboard
- `src/components/advisor-dashboard.tsx` - Advisor dashboard
- `src/components/critic-dashboard.tsx` - Critic dashboard
- `src/app/groups/page.tsx` - Groups dashboard

### Documentation
- `DASHBOARD_NOTIFICATIONS_INDEX.md` - Complete documentation index
- `DASHBOARD_NOTIFICATIONS_NEXT_STEPS.md` - Setup guide
- `DASHBOARD_EMAIL_NOTIFICATIONS_INTEGRATION.md` - Technical docs

---

## Support

### Common Issues

**Column already exists error**
- The migration may have already been applied
- Run verification queries to confirm

**Index creation fails**
- Check if index with same name exists: `DROP INDEX IF EXISTS idx_profiles_dashboard_notifications;`
- Retry the migration

**Default value not applied**
- Existing rows won't have the default value
- They'll have NULL - this is normal and handled by the API

### Troubleshooting

1. **Check migration status:**
   ```bash
   supabase migration list
   ```

2. **View recent migrations:**
   ```bash
   supabase migration list --limit 5
   ```

3. **Check database schema:**
   ```sql
   \d profiles  -- psql command to describe table
   ```

---

## Timeline

| Step | Command | Time |
|------|---------|------|
| 1 | Navigate to project | 1 min |
| 2 | Run migration | < 1 min |
| 3 | Verify success | 2 min |
| 4 | Test in application | 5 min |
| **Total** | | **~10 min** |

---

## Rollback Timeline

If needed:
1. Run rollback SQL - < 1 min
2. Verify removal - 1 min
3. Redeploy application - 2 min
4. **Total:** ~5 min

---

## Notes

- This is a **safe, non-breaking migration**
- Can be applied to production without downtime
- Users won't notice any changes
- All notifications default to enabled
- Users can customize via the UI

---

## Questions?

Refer to:
- Technical docs: `DASHBOARD_EMAIL_NOTIFICATIONS_INTEGRATION.md`
- Next steps: `DASHBOARD_NOTIFICATIONS_NEXT_STEPS.md`
- Index: `DASHBOARD_NOTIFICATIONS_INDEX.md`

---

**Migration Status:** ✅ Ready to Apply
**Last Updated:** January 6, 2025
**Version:** 1.0
