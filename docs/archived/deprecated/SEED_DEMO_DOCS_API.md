# Seed Demo Documents API Endpoint

## Overview
The Seed Demo Documents API provides endpoints to seed sample documents into the database and check seeding status.

**Location:** `src/app/api/admin/seed-demo-docs/route.ts`

**Base URL:** `http://localhost:3000/api/admin/seed-demo-docs`

## Endpoints

### POST /api/admin/seed-demo-docs
Insert demo documents for a user.

#### Request

```
POST /api/admin/seed-demo-docs
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Or use email instead:

```
POST /api/admin/seed-demo-docs
Content-Type: application/json

{
  "email": "student@demo.thesisai.local"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | No* | User ID from auth.users table |
| email | string | No* | Email address to look up user |

*Either `userId` OR `email` is required (not both)

#### Response: Success (201)

**If documents created:**

```json
{
  "success": true,
  "message": "Successfully seeded 2 documents",
  "documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Chapter 1 - Introduction",
      "status": "submitted"
    },
    {
      "id": "987f6543-e89b-12d3-a456-426614174999",
      "title": "Chapter 2 - Literature Review",
      "status": "draft"
    }
  ],
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**If documents already exist (200):**

```json
{
  "message": "Documents already exist for this user",
  "count": 2,
  "documentIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987f6543-e89b-12d3-a456-426614174999"
  ]
}
```

#### Response: Error

**Bad Request (400):**
```json
{
  "error": "Either userId or email is required"
}
```

**User Not Found (404):**
```json
{
  "error": "User with email student@demo.thesisai.local not found"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to insert documents",
  "details": {
    "code": "PGRST001",
    "message": "Permission denied"
  }
}
```

#### cURL Example

```bash
# Using email
curl -X POST http://localhost:3000/api/admin/seed-demo-docs \
  -H "Content-Type: application/json" \
  -d '{"email": "student@demo.thesisai.local"}'

# Using userId
curl -X POST http://localhost:3000/api/admin/seed-demo-docs \
  -H "Content-Type: application/json" \
  -d '{"userId": "550e8400-e29b-41d4-a716-446655440000"}'
```

#### JavaScript Example

```javascript
// Using async/await
async function seedDocuments(email) {
  const response = await fetch('/api/admin/seed-demo-docs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data;
}

// Usage
try {
  const result = await seedDocuments('student@demo.thesisai.local');
  console.log(`Seeded ${result.documents.length} documents`);
} catch (error) {
  console.error('Seeding failed:', error.message);
}
```

---

### GET /api/admin/seed-demo-docs
Check seeding status and document details.

#### Request

```
GET /api/admin/seed-demo-docs?email=student@demo.thesisai.local
```

Or use userId:

```
GET /api/admin/seed-demo-docs?userId=550e8400-e29b-41d4-a716-446655440000
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | No* | User ID from auth.users table |
| email | string | No* | Email address to look up user |

*Either `userId` OR `email` is required

#### Response: Success (200)

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalDocuments": 2,
  "documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Chapter 1 - Introduction",
      "status": "submitted",
      "hasContent": true,
      "contentLength": 1247,
      "created_at": "2025-12-07T10:30:00+00:00",
      "updated_at": "2025-12-07T10:30:00+00:00"
    },
    {
      "id": "987f6543-e89b-12d3-a456-426614174999",
      "title": "Chapter 2 - Literature Review",
      "status": "draft",
      "hasContent": true,
      "contentLength": 2891,
      "created_at": "2025-12-06T10:30:00+00:00",
      "updated_at": "2025-12-06T10:30:00+00:00"
    }
  ]
}
```

#### Response: No Documents Found (200)

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalDocuments": 0,
  "documents": []
}
```

#### Response: Error

**Bad Request (400):**
```json
{
  "error": "Either userId or email is required"
}
```

**User Not Found (404):**
```json
{
  "error": "User with email student@demo.thesisai.local not found"
}
```

#### cURL Example

```bash
# Using email
curl "http://localhost:3000/api/admin/seed-demo-docs?email=student@demo.thesisai.local"

# Using userId
curl "http://localhost:3000/api/admin/seed-demo-docs?userId=550e8400-e29b-41d4-a716-446655440000"
```

#### JavaScript Example

```javascript
async function checkDocuments(email) {
  const response = await fetch(
    `/api/admin/seed-demo-docs?email=${encodeURIComponent(email)}`
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data;
}

// Usage
const status = await checkDocuments('student@demo.thesisai.local');
console.log(`Found ${status.totalDocuments} documents`);
status.documents.forEach(doc => {
  console.log(`- ${doc.title} (${doc.contentLength} chars)`);
});
```

---

## Sample Documents

The endpoint creates two documents:

### Document 1: Chapter 1 - Introduction
```
Title: Chapter 1 - Introduction
Status: submitted
Content Length: ~1,247 characters

Sections:
- Background
- Problem Statement
- Research Objectives
```

### Document 2: Chapter 2 - Literature Review
```
Title: Chapter 2 - Literature Review
Status: draft
Content Length: ~2,891 characters

Sections:
- Historical Context of Academic Writing Support
- Evolution of AI in Education
- Key Findings
- Student Performance Metrics
- Critical Analysis

Key Feature: Includes <h1 id="literature-review"> for jump-to functionality
```

## Workflow

### Seeding Workflow

```
POST /api/admin/seed-demo-docs with email
    ↓
Look up user by email in auth.users
    ↓
Check if documents already exist
    ↓
If exist: Return 200 with "already exists" message
    ↓
If not exist: Insert 2 sample documents
    ↓
Return 201 with document IDs and details
```

### Checking Workflow

```
GET /api/admin/seed-demo-docs?email=...
    ↓
Look up user by email
    ↓
Query documents table for user_id
    ↓
Return each document with metadata
    ↓
Client can verify content exists (hasContent flag)
    ↓
Client can check content size (contentLength)
```

## Error Handling

### Common Errors and Fixes

#### "Either userId or email is required"
**Cause:** Neither parameter provided
**Fix:** Include `email` or `userId` in request

```javascript
// Wrong:
fetch('/api/admin/seed-demo-docs', { method: 'POST', body: '{}' })

// Correct:
fetch('/api/admin/seed-demo-docs', {
  method: 'POST',
  body: JSON.stringify({ email: 'student@demo.thesisai.local' })
})
```

#### "User with email X not found"
**Cause:** Email doesn't exist in database
**Fix:** Verify user exists or create account first

```javascript
// Check if user exists
const status = await fetch('/api/admin/seed-demo-docs?email=...');
if (status.status === 404) {
  // Create user first
  window.location.href = '/signup';
}
```

#### "Failed to insert documents" (500)
**Cause:** Database error or permission issue
**Fix:** Check Supabase logs, verify RLS policies

```
Check:
1. Database migrations applied: supabase migration list
2. RLS policies on documents table
3. User has INSERT permission
4. Content field exists in documents table
```

#### No documents found after seeding
**Cause:** Seeding succeeded but retrieval failed
**Fix:** Check RLS policies allow SELECT

```sql
-- Verify RLS policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'documents';

-- Should show policy allowing SELECT by user_id
```

## Idempotency

The endpoint is **idempotent** - calling it multiple times is safe:

```javascript
// Safe to call multiple times
await seedDemoDocs('student@demo.thesisai.local');
await seedDemoDocs('student@demo.thesisai.local'); // Returns "already exists"
await seedDemoDocs('student@demo.thesisai.local'); // Returns "already exists"
```

Documents are only inserted once. Subsequent calls return the existing documents.

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| POST (insert) | 500-1000ms | Creates 2 documents |
| POST (already exists) | 50-100ms | Quick check only |
| GET (check) | 200-300ms | Fetches document metadata |
| Content fetch | 100-200ms | Retrieving full HTML content |

## Data Inserted

When seeding, the following is inserted into the `documents` table:

```sql
INSERT INTO documents (
  user_id,
  title,
  content,
  status,
  created_at,
  updated_at
) VALUES
  (
    'user-id',
    'Chapter 1 - Introduction',
    '<h1 id="introduction">...</h1>',
    'submitted',
    '2025-12-07T10:30:00+00:00',
    '2025-12-07T10:30:00+00:00'
  ),
  (
    'user-id',
    'Chapter 2 - Literature Review',
    '<h1 id="literature-review">...</h1>',
    'draft',
    '2025-12-06T10:30:00+00:00',
    '2025-12-06T10:30:00+00:00'
  );
```

## Security Considerations

### ⚠️ Warning
This endpoint uses the **service role key** and has **no authentication check**. 

**In Production:**
1. Add authentication/authorization checks
2. Restrict to admin users only
3. Add rate limiting
4. Add request logging
5. Consider removing in production

**Current Implementation:**
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Uses service role for elevated permissions
// No user auth check
```

**Recommended Production Changes:**
```typescript
// Add auth check
const session = await supabase.auth.getSession();
if (!session?.user || session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Related Files

- `src/lib/seed-demo-documents.ts` - Seeding library
- `src/app/(app)/test-sample-data/page.tsx` - UI for testing
- `src/lib/mock-relationships.ts` - Mock data source
- `src/components/auth-provider.tsx` - Auth integration

## Testing

### Test with cURL
```bash
# Seed documents
curl -X POST http://localhost:3000/api/admin/seed-demo-docs \
  -H "Content-Type: application/json" \
  -d '{"email": "student@demo.thesisai.local"}' | jq

# Check status
curl "http://localhost:3000/api/admin/seed-demo-docs?email=student@demo.thesisai.local" | jq
```

### Test with Postman

1. Create POST request: `http://localhost:3000/api/admin/seed-demo-docs`
2. Body (JSON): `{"email": "student@demo.thesisai.local"}`
3. Send
4. Create GET request: `http://localhost:3000/api/admin/seed-demo-docs?email=student@demo.thesisai.local`
5. Send

### Test in Browser Console
```javascript
// Seed
fetch('/api/admin/seed-demo-docs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@demo.thesisai.local' })
}).then(r => r.json()).then(console.log);

// Check
fetch('/api/admin/seed-demo-docs?email=student@demo.thesisai.local')
  .then(r => r.json())
  .then(console.log);
```

## Database Requirements

Ensure these exist:

1. **Table:** `documents`
2. **Columns:** 
   - `id` (UUID primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `title` (TEXT)
   - `content` (TEXT)
   - `status` (VARCHAR)
   - `created_at` (TIMESTAMP WITH TIME ZONE)
   - `updated_at` (TIMESTAMP WITH TIME ZONE)

3. **RLS Policies:**
   - Users can SELECT own documents
   - Users can INSERT own documents
   - Service role can bypass RLS

Check with:
```bash
supabase migration list
# Verify 02_documents_table.sql is applied
```

## Deployment Notes

### Development
- Works with `supabase start`
- Requires service role key in `.env.local`

### Staging/Production
1. Remove or secure with authentication
2. Add request validation/rate limiting
3. Consider read-only endpoint only
4. Add audit logging

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=... # Must be set
```

## Changelog

### v1.0.0
- Initial release
- POST endpoint for seeding
- GET endpoint for checking status
- Idempotent seeding (prevents duplicates)
- Support for userId and email lookup
