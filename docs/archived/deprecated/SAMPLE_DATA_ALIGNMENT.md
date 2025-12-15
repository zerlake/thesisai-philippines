# Sample Data Alignment: Student, Advisor & Critic Dashboards

## Problem Statement
The three dashboards (student, advisor, critic) were not showing consistent sample data, making it impossible to test end-to-end features like "Jump to Literature Review" feedback functionality.

**Issue:** 
- Advisor's dashboard shows: "Feedback on Chapter II" with action "Jump to Literature Review"
- Student's dashboard had NO documents to jump to
- Critic's dashboard showed reviews but no matching student content

## Solution Architecture

### 1. **Mock Data Foundation** (`src/lib/mock-relationships.ts`)
The mock-relationships file now contains:
- User definitions (students, advisors, critics)
- Complete document objects with:
  - `id`, `user_id`, `title`, `status`
  - **NEW:** `content` field with actual HTML/editor content
  - Review status tracking (`advisor_review_status`, `critic_review_status`)
  - Feedback references
- Sample feedback that references specific documents

**Sample Documents:**
```
1. Chapter 1 - Introduction
   - ID: demo-doc-1 or doc-1-mock
   - Status: submitted
   - Content: Includes "Background", "Problem Statement", "Research Objectives"

2. Chapter 2 - Literature Review
   - ID: demo-doc-2 or doc-2-mock
   - Status: draft
   - Content: Includes "Historical Context", "Evolution of AI", "Key Findings"
   - Has section with id="literature-review" for jump-to functionality
```

### 2. **Database Seeding** (`src/lib/seed-demo-documents.ts`)
New seeding module that:
- Detects demo account logins (checks for `@demo.thesisai.local` email)
- Inserts sample documents into the database on first login
- Ensures consistency between mock data and actual database
- Prevents duplicate seeding (checks if documents already exist)

```typescript
export const DEMO_DOCUMENTS = [
  {
    title: 'Chapter 1 - Introduction',
    content: '...' // Full HTML content
  },
  {
    title: 'Chapter 2 - Literature Review',
    content: '...' // Includes h1#literature-review for jump-to
  }
]
```

### 3. **Auth Integration** (`src/components/auth-provider.tsx`)
The authentication provider now:
- Imports `seedDemoDocs` and `isDemoAccount`
- Calls seeding after profile is loaded or created
- Executes asynchronously without blocking auth flow
- Logs warnings if seeding fails (doesn't break login)

```typescript
if (isDemoAccount(user.email)) {
  seedDemoDocs(supabase, user.id).catch(err => 
    console.warn("[Auth] Failed to seed demo documents:", err)
  );
}
```

## Data Flow

### Student Dashboard Flow:
```
Demo Student Logs In
  ↓
Auth Provider detects demo account
  ↓
Seeds documents to database
  ↓
Student navigates to /drafts
  ↓
NewDocumentList fetches documents from database
  ↓
Displays: "Chapter 1 - Introduction" and "Chapter 2 - Literature Review"
  ↓
Student clicks "Open" on Chapter 2
  ↓
Editor opens with content including h1#literature-review
```

### Advisor Dashboard Flow:
```
Advisor logs in
  ↓
Views sample students and their documents
  ↓
Sees feedback: "Your literature review is comprehensive..."
  ↓
Notification includes actionUrl: "#literature-review"
```

### Jump-To Integration:
```
Student receives feedback notification:
"Your literature review is comprehensive. 
Please add more recent studies from 2024."
  ↓
Student clicks "Jump to Literature Review"
  ↓
Editor finds h1#literature-review section
  ↓
Scrolls to section and highlights it
```

## Key Features

### 1. Content Includes Jumpable Sections
Each document has:
- `<h1 id="literature-review">Chapter II: Literature Review</h1>`
- Sections that match the notification action URLs
- Realistic academic content for testing

### 2. Automatic Seeding
- Happens on first demo account login
- Non-blocking (runs async)
- Idempotent (won't duplicate if already exists)
- Works for multiple demo accounts

### 3. Database Alignment
- Mock data structure matches database schema
- Dates are consistent (staggered appropriately)
- Status fields align across all tables

## Testing Checklist

### ✅ Student Dashboard
- [ ] Log in as `student@demo.thesisai.local`
- [ ] Navigate to /drafts
- [ ] See two documents: "Chapter 1 - Introduction" and "Chapter 2 - Literature Review"
- [ ] Click "Open" on Chapter 2
- [ ] Editor shows content with "Literature Review" section

### ✅ Jump-To Functionality
- [ ] Editor shows sample content
- [ ] Verify `<h1 id="literature-review">` exists in content
- [ ] Test section jumping in notifications sidebar
- [ ] Verify smooth scroll and highlight effect

### ✅ Advisor Dashboard
- [ ] Log in as `advisor@demo.thesisai.local`
- [ ] Navigate to /advisor/sample-data
- [ ] See student with submitted documents
- [ ] View feedback referencing "Literature Review"

### ✅ Critic Dashboard
- [ ] Log in as `critic@demo.thesisai.local`
- [ ] Navigate to /critic/sample-data
- [ ] See assigned students with documents
- [ ] Verify document counts match student dashboard

## Files Modified

1. **src/lib/mock-relationships.ts**
   - Added `content` fields to mockDocuments
   - Added content to demo setup function

2. **src/lib/seed-demo-documents.ts** (NEW)
   - Core seeding logic
   - DEMO_DOCUMENTS with full content
   - Helper functions

3. **src/components/auth-provider.tsx**
   - Added seeding calls after profile load/create
   - Imported seeding functions

## Implementation Notes

### Content Structure
Documents use standard HTML headers with IDs for sections:
```html
<h1 id="literature-review">Chapter II: Literature Review</h1>
<h2>Historical Context of Academic Writing Support</h2>
<p>Content...</p>
```

This matches what the `jumpToSection` function expects in the notification sidebar.

### Seeding Strategy
- Runs after profile is fully loaded/created
- Checks for existing documents to prevent duplication
- Converts dates to ISO strings for database compatibility
- Handles demo accounts via email pattern matching

### Why This Matters
1. **End-to-End Testing**: Can now test the entire feedback workflow
2. **Consistency**: All three dashboards see the same data
3. **Realistic Demo**: Sample data shows actual use case scenarios
4. **Verification**: Easier to confirm features work together

## Future Enhancements

1. **Customizable Sample Data**: Allow different thesis topics/chapters
2. **Feedback Seeding**: Auto-generate feedback entries matching documents
3. **Multiple Demo Accounts**: Different demo accounts with different data
4. **Bulk Operations**: Admin endpoint to seed data for multiple accounts
5. **Data Reset**: Function to clear and reseed demo documents

## Related Files
- `/advisor/sample-data/page.tsx` - Advisor dashboard
- `/critic/sample-data/page.tsx` - Critic dashboard
- `/drafts/page.tsx` - Student dashboard
- `new-document-list.tsx` - Document listing component
- `editor.tsx` - Document editor component
