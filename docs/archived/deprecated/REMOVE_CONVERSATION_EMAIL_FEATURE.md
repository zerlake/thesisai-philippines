# Remove "Conversation" Email Notification Feature - Complete Plan

## Root Cause
The "Conversation" email notification feature is embedded in two main components and needs to be completely removed and rebuilt:

1. **`src/components/advisor-email-notifications.tsx`** - Used in advisor dashboard
   - Displays conversation thread with advisor-student messages
   - Located in advisor-dashboard.tsx line 436

2. **`src/components/editor-email-notifications-sidebar.tsx`** - Used in draft/editor view
   - Shows conversation sidebar in /drafts/[documentId]
   - Located in editor.tsx line 20 & 398

## Why These Need Removal & Rebuild

These components:
- Have accumulated mock/test logic
- May have hardcoded test emails or data
- Need to be completely rewritten with production-only code
- Should only show REAL conversations from real advisor-student interactions

## Removal Plan

### Phase 1: Delete Components
Delete these component files:
- `src/components/advisor-email-notifications.tsx`
- `src/components/editor-email-notifications-sidebar.tsx`

### Phase 2: Remove Imports & Usage
Remove these lines:
1. **In `src/components/advisor-dashboard.tsx` (line 24)**
   ```typescript
   import { AdvisorEmailNotifications } from "./advisor-email-notifications";
   ```
   And remove line 436:
   ```tsx
   <AdvisorEmailNotifications />
   ```

2. **In `src/components/editor.tsx` (line 20)**
   ```typescript
   import { EditorEmailNotificationsSidebar } from './editor-email-notifications-sidebar';
   ```
   And remove line 398:
   ```tsx
   <EditorEmailNotificationsSidebar documentId={documentId} />
   ```

### Phase 3: Rebuild (After Cleanup)
After removing:
1. Verify build succeeds
2. Test that advisor/student dashboards still work
3. Then rebuild conversation feature properly with REAL data only

## Files to Delete
1. `src/components/advisor-email-notifications.tsx` - Complete file
2. `src/components/editor-email-notifications-sidebar.tsx` - Complete file

## Files to Modify
1. `src/components/advisor-dashboard.tsx` - Remove import and component usage
2. `src/components/editor.tsx` - Remove import and component usage

## Verification Steps
After cleanup:
```bash
# Search for any remaining references
grep -r "AdvisorEmailNotifications\|EditorEmailNotificationsSidebar" src/

# Should return: 0 results

# Build check
pnpm build

# Should complete successfully
```

## After Cleanup
Once removed and build verified:
1. Rebuild conversation feature with REAL database queries only
2. No hardcoded test data
3. No mock messages
4. Fetch actual advisor-student conversations from `advisor_student_messages` table

---

## Timeline
1. **Now:** Delete the two component files
2. **Now:** Remove imports from advisor-dashboard and editor
3. **Now:** Verify build passes
4. **Next:** Rebuild conversation feature properly (separate task)
