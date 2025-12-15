# Test Sample Data Page

## Overview
The Test Sample Data page is an interactive tool to seed, verify, and test demo documents for the student dashboard.

**Location:** `src/app/(app)/test-sample-data/page.tsx`

**URL:** `http://localhost:3000/test-sample-data`

## Features

### 1. Current User Info
Displays the currently logged-in user:
- Email address
- User ID (UUID)

Helps verify you're testing with the correct account.

### 2. Seed Documents
Insert sample demo documents into the database for a specified email address.

**How it works:**
1. Enter an email (default: `student@demo.thesisai.local`)
2. Click "Seed Documents"
3. API inserts 2 documents:
   - Chapter 1 - Introduction (submitted)
   - Chapter 2 - Literature Review (draft)
4. Success notification shows number of documents created

**What gets seeded:**
```
Title: Chapter 1 - Introduction
Status: submitted
Content: Full HTML with sections (Background, Problem Statement, Research Objectives)

Title: Chapter 2 - Literature Review
Status: draft
Content: Full HTML with jumpable sections (Historical Context, Evolution of AI, Key Findings)
ID: <h1 id="literature-review">
```

### 3. Check Status
Verify documents exist and have content without re-seeding.

**What it shows:**
- Total number of documents found
- For each document:
  - Title
  - Document ID (UUID)
  - Status (submitted/draft)
  - Whether content exists (✓/✗)
  - Content length in characters
  - Created timestamp
  - Updated timestamp

**Example output:**
```
Documents Found (2)

Chapter 1 - Introduction
ID: 123e4567-e89b-12d3-a456-426614174000
Status: submitted
Content: ✓ Present (1,247 chars)
Created: 12/7/2025, 10:30:00 AM

Chapter 2 - Literature Review
ID: 987f6543-e89b-12d3-a456-426614174999
Status: draft
Content: ✓ Present (2,891 chars)
Created: 12/6/2025, 10:30:00 AM
```

### 4. View Documents in Drafts
One-click navigation to `/drafts` to see your seeded documents in the student dashboard.

## Step-by-Step Testing Guide

### Scenario 1: Seed Documents for Demo Student

```
1. Navigate to http://localhost:3000/test-sample-data

2. Verify Current User section shows you're logged in
   (Or log in first if not authenticated)

3. In "Seed Documents" section:
   - Email field shows: student@demo.thesisai.local
   - Click "Seed Documents" button

4. Wait for success notification:
   "✓ Successfully seeded 2 documents"

5. Click "Check Status" button
   - See "Documents Found (2)"
   - Verify both documents show:
     * Chapter 1 - Introduction (submitted)
     * Chapter 2 - Literature Review (draft)
     * Content: ✓ Present
     * Content length > 1000 chars

6. Click "View Documents in Drafts"
   - Redirects to /drafts
   - See 2 document cards
```

### Scenario 2: Verify Content in Editor

```
1. After seeding, you're on /drafts with 2 documents

2. Click "Open" on "Chapter 2 - Literature Review"

3. Editor opens with document content

4. Verify you see:
   - Title: "Chapter II: Literature Review"
   - Sections like:
     * "Historical Context of Academic Writing Support"
     * "Evolution of AI in Education"
     * "Key Findings"
     * "Critical Analysis"

5. Open browser DevTools (F12)
   - Go to Elements tab
   - Search for: id="literature-review"
   - Verify the h1 element exists

6. In notification sidebar:
   - View "Feedback on Chapter II" message
   - Button shows "Jump to 'Literature Review'"
   - Click button
   - Editor scrolls to that section
```

### Scenario 3: Test Multiple Demo Accounts

```
1. Log in as student@demo.thesisai.local
2. Go to /test-sample-data
3. Seed documents (see Scenario 1)

4. Log out, then log in as advisor@demo.thesisai.local
5. Navigate to /advisor/sample-data
6. Verify you see the student in your list
7. Check that the student's documents match what you just seeded

8. Log out, then log in as critic@demo.thesisai.local
9. Navigate to /critic/sample-data
10. Verify the student is assigned to you
11. Confirm document counts match
```

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│ Test Sample Data                                     │
│ Seed and verify demo documents for testing          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Current User                                         │
├─────────────────────────────────────────────────────┤
│ Email: student@demo.thesisai.local                  │
│ User ID: 550e8400-e29b-41d4-a716-446655440000     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Seed Documents                                       │
│ Insert demo documents for a demo account            │
├─────────────────────────────────────────────────────┤
│ Email Address                                        │
│ [student@demo.thesisai.local        ]               │
│                                                      │
│ [Seed Documents]  [Check Status]                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Documents Found (2)                                  │
├─────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │ Chapter 1 - Introduction         [submitted]  │ │
│ │ ID: 123e4567-e89b-12d3-a456...                │ │
│ │ Content: ✓ Present (1,247 chars)              │ │
│ │ Created: 12/7/2025, 10:30:00 AM               │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Chapter 2 - Literature Review    [draft]      │ │
│ │ ID: 987f6543-e89b-12d3-a456...                │ │
│ │ Content: ✓ Present (2,891 chars)              │ │
│ │ Created: 12/6/2025, 10:30:00 AM               │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [View Documents in Drafts]                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ How to Test                                          │
├─────────────────────────────────────────────────────┤
│ 1. Seed: Click "Seed Documents"                     │
│ 2. Verify: Click "Check Status"                     │
│ 3. View: Click "View Documents in Drafts"           │
│ 4. Open: Click "Open" on Chapter 2                  │
│ 5. Test: Verify editor shows content                │
│                                                      │
│ Demo Accounts:                                       │
│ student@demo.thesisai.local                         │
│ advisor@demo.thesisai.local                         │
│ critic@demo.thesisai.local                          │
└─────────────────────────────────────────────────────┘
```

## Buttons Explained

### Seed Documents
- **State:** Disabled if no email entered
- **Action:** POST to `/api/admin/seed-demo-docs`
- **Success:** Toast notification + document list appears
- **Error:** Toast error message + check browser console
- **Takes:** 1-2 seconds

### Check Status
- **State:** Disabled if no email entered
- **Action:** GET from `/api/admin/seed-demo-docs?email=...`
- **Success:** Lists documents with details
- **Error:** Toast error message
- **Takes:** 1 second
- **Use:** Verify seeding worked without re-seeding

### View Documents in Drafts
- **Action:** Navigates to `/drafts`
- **Shows:** All documents for current user
- **Documents clickable:** "Open" button leads to editor

## Troubleshooting

### "Failed to seed documents"
**Cause:** API error or database issue
**Fix:**
1. Check browser console (F12) for details
2. Verify Supabase is running
3. Check email is valid format
4. Ensure user exists in auth.users table

**Check logs:**
```
POST /api/admin/seed-demo-docs
Response body will show:
{
  "error": "Specific error message",
  "details": { ... }
}
```

### "Documents Found (0)"
**Cause:** Seeding didn't work or documents were deleted
**Fix:**
1. Click "Seed Documents" again
2. Wait for success notification
3. Click "Check Status" to verify

### Content shows as "Missing" (✗)
**Cause:** Document inserted but `content` field is NULL
**Fix:**
1. Check if database migration ran: `supabase migration list`
2. Verify `content` column exists in documents table
3. Re-seed documents

### Jump-To not working in Editor
**Cause:** Section ID missing from content
**Fix:**
1. Open browser DevTools (F12)
2. In Elements tab, search for `id="literature-review"`
3. If not found, content wasn't seeded properly
4. Re-seed and check "Check Status" shows high content length (>2000 chars)

### "User not found" error
**Cause:** Email doesn't exist in auth.users
**Fix:**
1. Create user first at `/signup` or `/login`
2. Use exact email including domain
3. Or provide `userId` instead of `email`

## Demo Credentials

```
Student Account:
Email: student@demo.thesisai.local
Password: demo123456

Advisor Account:
Email: advisor@demo.thesisai.local
Password: demo123456

Critic Account:
Email: critic@demo.thesisai.local
Password: demo123456
```

## Related Pages

- **Drafts:** `/drafts` - View documents
- **Editor:** `/drafts/[id]` - Edit document
- **Advisor Dashboard:** `/advisor/sample-data` - See students and feedback
- **Critic Dashboard:** `/critic/sample-data` - See assigned students
- **API Endpoint:** `/api/admin/seed-demo-docs` - Direct seeding

## Environment Requirements

- Supabase running locally or connected
- Authentication provider working
- Database migrations applied (`supabase migration up`)
- Next.js dev server running (`pnpm dev`)

## Performance Notes

- Seeding 2 documents: ~500-1000ms
- Checking status: ~200-300ms
- Database queries use indexed `user_id` field
- No N+1 queries
- Safe concurrent seeding (idempotent)

## Security Notes

- Endpoint requires service role key (server-side only)
- No authentication check (admin endpoint)
- In production, add auth/permission checks
- Only use on development/staging environments

## Code Example

```typescript
// Manual seeding from code
import { seedDemoDocs } from '@/lib/seed-demo-documents';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const success = await seedDemoDocs(supabase, userId);
```

## Next Steps After Testing

1. ✅ Verify documents appear in `/drafts`
2. ✅ Verify content displays in editor
3. ✅ Verify "Jump to Literature Review" works
4. ✅ Verify advisor sees same documents
5. ✅ Verify critic dashboard shows documents
6. ✅ Test feedback notification flow
7. Delete test page from production

## Related Documentation

- `SAMPLE_DATA_ALIGNMENT.md` - Architecture overview
- `SAMPLE_DATA_IMPLEMENTATION_SUMMARY.md` - What was changed
- `seed-demo-docs/route.ts` - API endpoint source
- `seed-demo-documents.ts` - Seeding library
