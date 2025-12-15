# Sample Data Quick Test Guide

## One-Line Summary
Student dashboard now has sample documents with content that matches advisor feedback notifications and supports "Jump to Section" functionality.

## What Changed
- Added document content (`html`) to mock data
- Created auto-seeding function for demo accounts
- Integrated seeding into auth provider on login
- Verified build compiles successfully

## Quick Test Steps

### 1. Start Dev Server
```bash
pnpm dev
```

### 2. Log In as Demo Student
- Email: `student@demo.thesisai.local`
- Password: `demo123456`

### 3. Check Drafts Page
Navigate to: http://localhost:3000/drafts

**Expected:**
- Two document cards visible
- "Chapter 1 - Introduction" (status: submitted)
- "Chapter 2 - Literature Review" (status: draft)
- Both show "Open" button

### 4. Open Chapter 2
Click "Open" on "Chapter 2 - Literature Review"

**Expected:**
- Editor loads with content
- Content includes sections:
  - Historical Context
  - Evolution of AI
  - Key Findings
  - Critical Analysis
- Content has `<h1 id="literature-review">` tag

### 5. Test Jump-To (Optional)
If testing the notification sidebar:
- Open editor notifications panel
- View "Feedback on Chapter II" message
- Button shows "Jump to 'Literature Review'"
- Clicking should scroll/highlight that section

### 6. Verify Advisor Dashboard
Log in as: `advisor@demo.thesisai.local`

Navigate to: http://localhost:3000/advisor/sample-data

**Expected:**
- Demo Student visible in assigned students
- Can see documents: Chapter 1 (submitted), Chapter 2 (draft)
- Feedback shown matches the documents

## Database Check (Optional)

If you want to verify data was inserted:

```bash
# In Supabase dashboard
SELECT id, title, status, user_id 
FROM documents 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'student@demo.thesisai.local')
ORDER BY created_at DESC;
```

Should show:
- demo-doc-1: Chapter 1 - Introduction (submitted)
- demo-doc-2: Chapter 2 - Literature Review (draft)

## Troubleshooting

### Documents Not Appearing
1. Clear browser cache/localStorage
2. Check browser console for errors
3. Verify demo account email is exact: `student@demo.thesisai.local`
4. Check Supabase logs for insertion errors

### Content Not Displaying
1. Open browser DevTools → Network tab
2. Check if document fetch is successful (200 status)
3. Verify content field in database has HTML

### Jump-To Not Working
1. Check that editor has `<h1 id="literature-review">` element
2. Verify notification sidebar component renders correctly
3. Test manually: search for text "Literature Review" in editor

## Key Files to Review

```
src/lib/seed-demo-documents.ts         ← Seeding logic
src/lib/mock-relationships.ts          ← Mock data with content
src/components/auth-provider.tsx       ← Seeding trigger on auth
src/components/new-document-list.tsx   ← Document listing
src/components/editor.tsx              ← Editor with jump-to feature
```

## Success Criteria

- [ ] Demo student sees 2 documents in /drafts
- [ ] Both documents have proper titles and timestamps
- [ ] Clicking "Open" loads editor with content
- [ ] Content includes "Literature Review" section with ID
- [ ] Advisor dashboard shows same documents
- [ ] No console errors on auth or document fetch

## Next Steps

Once verified, this enables:
1. **Full demo workflow testing** - All 3 dashboards work together
2. **Feedback notification testing** - Jump-to features work
3. **Sample data consistency** - Same data across dashboards
4. **User onboarding** - Demo accounts have instant usable content

## Related Documentation
- See `SAMPLE_DATA_ALIGNMENT.md` for architecture details
- See `mock-relationships.ts` for mock data structure
- See `seed-demo-documents.ts` for seeding implementation
