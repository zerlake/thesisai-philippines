# Sample Data Testing Quick Start

## 30-Second Overview

Demo documents were not appearing in the student dashboard. This guide shows you how to seed and verify them.

**Solution:** Use the Test Sample Data page to insert documents into the database.

**URL:** `http://localhost:3000/test-sample-data`

---

## Quick Steps

### Step 1: Start Dev Server
```bash
pnpm dev
```

### Step 2: Log In as Demo Student
```
Email: student@demo.thesisai.local
Password: demo123456
```

### Step 3: Go to Test Page
Navigate to: `http://localhost:3000/test-sample-data`

### Step 4: Seed Documents
1. Verify email is: `student@demo.thesisai.local`
2. Click **"Seed Documents"** button
3. Wait for green notification: "✓ Successfully seeded 2 documents"

### Step 5: Verify
1. Click **"Check Status"** button
2. Should show "Documents Found (2)"
3. Both have "Content: ✓ Present"

### Step 6: View in Drafts
1. Click **"View Documents in Drafts"** button
2. You're now at `/drafts`
3. See two document cards:
   - Chapter 1 - Introduction
   - Chapter 2 - Literature Review

### Step 7: Test Jump-To
1. Click "Open" on "Chapter 2 - Literature Review"
2. Editor opens with content
3. Look for "Literature Review" heading in the content
4. In notification sidebar, find "Feedback on Chapter II"
5. Click button "Jump to 'Literature Review'"
6. Editor scrolls to that section

---

## What Gets Seeded

### Chapter 1 - Introduction
- Status: `submitted`
- Content: 1,247 characters
- Sections: Background, Problem Statement, Research Objectives

### Chapter 2 - Literature Review
- Status: `draft`
- Content: 2,891 characters
- Sections: Historical Context, Evolution of AI, Key Findings
- **Important:** Has `<h1 id="literature-review">` tag for jump-to feature

---

## Common Issues & Fixes

### "No documents in /drafts"
**Fix:**
1. Go back to `/test-sample-data`
2. Click "Seed Documents" again
3. Wait for success notification
4. Return to `/drafts` (F5 to refresh)

### "Seed Documents button disabled"
**Fix:** Enter an email in the input field (should auto-fill)

### "Failed to seed documents" error
**Fix:**
1. Check browser console (F12)
2. Verify you're logged in (should see email at top)
3. Try different email: `student@demo.thesisai.local`
4. Ensure Supabase is running: `supabase status`

### "Check Status shows 0 documents"
**Fix:**
1. Verify email spelling is exact
2. Click "Seed Documents" to insert
3. Documents may not exist yet - that's OK, seed them

### "Jump-To button doesn't work"
**Fix:**
1. Open DevTools (F12) → Elements tab
2. Search for: `id="literature-review"`
3. If not found, content wasn't seeded
4. Go back to test page and re-seed
5. Close and re-open the editor

---

## File Locations

| What | Where |
|------|-------|
| Test Page | `src/app/(app)/test-sample-data/page.tsx` |
| API Endpoint | `src/app/api/admin/seed-demo-docs/route.ts` |
| Seeding Library | `src/lib/seed-demo-documents.ts` |
| Documentation | See files below |

---

## Complete Documentation

For detailed information, see:

1. **TEST_SAMPLE_DATA_PAGE.md**
   - Full UI guide
   - Step-by-step scenarios
   - Troubleshooting

2. **SEED_DEMO_DOCS_API.md**
   - API reference
   - Request/response formats
   - cURL examples

3. **SAMPLE_DATA_ALIGNMENT.md**
   - Architecture overview
   - Data flow diagrams
   - How dashboards sync

4. **SAMPLE_DATA_IMPLEMENTATION_SUMMARY.md**
   - What was changed
   - Files modified
   - Build status

---

## API Usage (Alternative)

If you prefer not to use the UI:

### Via cURL
```bash
# Seed documents
curl -X POST http://localhost:3000/api/admin/seed-demo-docs \
  -H "Content-Type: application/json" \
  -d '{"email": "student@demo.thesisai.local"}'

# Check status
curl "http://localhost:3000/api/admin/seed-demo-docs?email=student@demo.thesisai.local"
```

### Via JavaScript
```javascript
// In browser console
fetch('/api/admin/seed-demo-docs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@demo.thesisai.local' })
}).then(r => r.json()).then(console.log);
```

---

## Testing Checklist

- [ ] Go to `/test-sample-data`
- [ ] Click "Seed Documents"
- [ ] See success notification
- [ ] Click "View Documents in Drafts"
- [ ] See 2 document cards in `/drafts`
- [ ] Click "Open" on Chapter 2
- [ ] Editor shows content with "Literature Review"
- [ ] Verify section has `id="literature-review"` (DevTools)
- [ ] Test Jump-To in notification sidebar

---

## Demo Accounts

```
Student:
  Email: student@demo.thesisai.local
  Password: demo123456

Advisor:
  Email: advisor@demo.thesisai.local
  Password: demo123456

Critic:
  Email: critic@demo.thesisai.local
  Password: demo123456
```

---

## Next: Test Other Dashboards

Once student dashboard has documents:

### Advisor Dashboard
1. Log out
2. Log in as `advisor@demo.thesisai.local`
3. Go to `/advisor/sample-data`
4. See the student with seeded documents

### Critic Dashboard
1. Log out
2. Log in as `critic@demo.thesisai.local`
3. Go to `/critic/sample-data`
4. See assigned student with documents

---

## Still Having Issues?

1. **Read the detailed docs** above (TEST_SAMPLE_DATA_PAGE.md)
2. **Check browser console** (F12)
3. **Check Supabase logs** (`supabase logs` in terminal)
4. **Verify database** - check if documents table has content field

---

## Summary

**Problem:** No sample data in student dashboard

**Solution:** Use `/test-sample-data` to seed documents

**Result:** Two documents appear in `/drafts` with content that supports "Jump to Literature Review" functionality

**Time to test:** ~2 minutes

---

## Related Commands

```bash
# Start development server
pnpm dev

# Check Supabase status
supabase status

# Apply migrations
supabase migration up

# View logs
supabase logs
```

---

## What Happens Behind the Scenes

When you click "Seed Documents":

```
1. Page sends email to /api/admin/seed-demo-docs (POST)
2. API looks up user by email in auth.users
3. API checks if documents already exist
4. If not: Inserts 2 documents from DEMO_DOCUMENTS template
5. Returns success with document IDs
6. Page displays list of what was created
7. You can now see them in /drafts
8. Editor shows content with ID anchors for jump-to
```

---

## Success Indicators

✅ Test page loads at `/test-sample-data`
✅ Can enter email in "Seed Documents" section
✅ Clicking "Seed Documents" shows success notification
✅ "Documents Found (2)" appears below
✅ Both documents show "Content: ✓ Present"
✅ Navigating to `/drafts` shows 2 document cards
✅ Clicking "Open" loads editor with content
✅ Content includes jumpable sections with IDs

---

## Cleanup

To remove seeded documents:

1. Go to `/test-sample-data`
2. (Currently no delete button - would need manual DB cleanup)
3. Or delete from Supabase dashboard: documents table → delete rows

---

## Production Notes

⚠️ **Important:** The `/test-sample-data` page and `/api/admin/seed-demo-docs` endpoint are for **development only**.

In production:
- Remove these pages/endpoints
- Or protect with admin authentication
- Or convert to one-time setup script

---

**Questions?** See the detailed documentation files listed above.
