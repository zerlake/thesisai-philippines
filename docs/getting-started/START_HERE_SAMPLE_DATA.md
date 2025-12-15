# START HERE: Sample Data Setup

## What You Need to Do

You want sample documents to appear in the student dashboard so you can test the "Jump to Literature Review" feature.

**Solution:** Use the test page to seed documents.

---

## Quick Start (2 minutes)

### 1. Go to Test Page
```
http://localhost:3000/test-sample-data
```

### 2. Click "Seed Documents"

The page will insert 2 sample documents to your database:
- Chapter 1 - Introduction (submitted)
- Chapter 2 - Literature Review (draft)

### 3. Click "Check Status"

Verify documents were created and have content.

### 4. Click "View Documents in Drafts"

Navigate to `/drafts` and see your documents.

### 5. Test Jump-To Feature

1. Click "Open" on Chapter 2
2. Editor shows content
3. Click "Jump to 'Literature Review'" in notifications
4. Editor scrolls to that section

---

## If It Doesn't Work

### Error: Empty object `{}`

This means RLS policy issue. Check:

```bash
# Verify migrations applied
supabase migration list
# Should show: 02_documents_table.sql - Applied

# If not:
supabase migration up
```

Then try again.

### Error: "Not authenticated"

Log out and back in:
1. Click profile menu → Logout
2. Refresh page
3. Log in: `student@demo.thesisai.local` / `demo123456`
4. Try seeding again

### Error: "No documents found"

Even after seeding succeeded? Try:

1. Hard refresh: `Ctrl+F5`
2. Or close and reopen browser tab
3. Or check browser console for errors

---

## What Gets Created

### Document 1: Chapter 1 - Introduction
```
Title: Chapter 1 - Introduction
Status: submitted
Size: ~1,200 characters

Content includes:
- Background
- Problem Statement
- Research Objectives
```

### Document 2: Chapter 2 - Literature Review
```
Title: Chapter 2 - Literature Review
Status: draft
Size: ~2,900 characters

Content includes:
- Historical Context
- Evolution of AI
- Key Findings
- Critical Analysis

Contains: <h1 id="literature-review"> for jump-to linking
```

---

## Files Reference

| What | Where |
|------|-------|
| Test Page | `src/app/(app)/test-sample-data/page.tsx` |
| Sample Data | `src/lib/seed-demo-documents.ts` |
| Full Guide | `SAMPLE_DATA_DOCS_INDEX.md` |
| Troubleshooting | `SAMPLE_DATA_TROUBLESHOOTING.md` |
| Implementation | `FINAL_SAMPLE_DATA_SETUP.md` |

---

## How It Works

```
Click "Seed Documents"
        ↓
Checks if documents already exist
        ↓
If not: Inserts 2 documents to database
        ↓
Shows success notification
        ↓
You now see documents in /drafts
```

All data stored in Supabase `documents` table.

---

## Key Features

✅ **Automatic on login** - Demo accounts auto-seed on first login
✅ **Idempotent** - Won't create duplicates
✅ **RLS-safe** - Uses authenticated Supabase client
✅ **Full content** - Documents have real HTML content
✅ **Jump-To ready** - Sections have IDs for linking

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

## Next Steps After Seeding

1. ✅ Documents appear in `/drafts`
2. ✅ Can open document in editor
3. ✅ Content displays with "Literature Review" section
4. ✅ Jump-To feature works in notifications
5. Test advisor dashboard sees same documents
6. Test critic dashboard sees assignments

---

## Console Debugging

If something goes wrong, open browser console (F12) and look for:

```
Seeding documents for user: [UUID]
Inserting documents: 2
Documents inserted: [...]

-- or error --

Insert error: [specific error message]
Fetch error: [specific error message]
```

Copy exact error and check `SAMPLE_DATA_TROUBLESHOOTING.md`.

---

## Build Status

✅ Code compiles successfully
✅ No TypeScript errors
✅ Ready to use

---

## Still Have Questions?

Read one of these guides:

- **Quick overview:** `FINAL_SAMPLE_DATA_SETUP.md`
- **Detailed UI guide:** `TEST_SAMPLE_DATA_PAGE.md`
- **How it works:** `SAMPLE_DATA_ALIGNMENT.md`
- **Troubleshooting:** `SAMPLE_DATA_TROUBLESHOOTING.md`
- **Everything:** `SAMPLE_DATA_DOCS_INDEX.md`

---

**That's it!** Go to `/test-sample-data` and click "Seed Documents".
