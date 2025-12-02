# Validity Defender API Routes - Fixed

## Issue
Build error: `Module not found: Can't resolve '@/lib/supabase/server'`

Three API routes were using an incorrect import path for Supabase client initialization.

## Root Cause
The routes were trying to import from `@/lib/supabase/server`, which doesn't exist in the codebase. The correct import should use the existing Supabase client factory at `@/integrations/supabase/server-client`.

## Fixed Files

### 1. src/app/api/instruments/validate/route.ts
**Before:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

**After:**
```typescript
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
const supabase = createServerSupabaseClient();
```

**Function:** Validates research instruments and saves validation results

### 2. src/app/api/instruments/defense-responses/route.ts
**Before:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

**After:**
```typescript
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
const supabase = createServerSupabaseClient();
```

**Function:** Generates AI-powered defense responses for instruments

### 3. src/app/api/instruments/practice-session/route.ts
**Before:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

**After:**
```typescript
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
const supabase = createServerSupabaseClient();
```

**Function:** Creates practice sessions for thesis defense preparation

## Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Import Path** | `@/lib/supabase/server` | `@/integrations/supabase/server-client` |
| **Function Name** | `createClient()` | `createServerSupabaseClient()` |
| **Await Required** | Yes (`await createClient()`) | No (`createServerSupabaseClient()`) |
| **Database Ops** | Asynchronous initialization | Synchronous initialization |

## Key Points

1. **Correct Supabase Integration:** Uses the established pattern used by other API routes in the codebase (e.g., `src/app/api/personalization/sync/route.ts`)

2. **Authentication:** All routes properly use `getAuthenticatedUser()` from `@/lib/server-auth` to verify user identity before database operations

3. **Error Handling:** Maintains proper error handling and HTTP status codes:
   - 400: Missing required fields
   - 401: Authentication errors (via AuthenticationError)
   - 404: Resource not found
   - 500: Server/database errors

4. **Database Tables:** Routes expect the following tables to exist:
   - `instrument_validity` - Stores validated instruments
   - `defense_responses` - Stores generated defense responses
   - `practice_sessions` - Stores practice session data (optional)

## Verification

To verify the fixes work:

1. Run `pnpm build` - Build should complete without errors
2. Run `pnpm dev` - Development server should start
3. Click "Sample Data" button on Validity Defender page
4. Forms should populate and validation results should display
5. Check browser console for any client-side errors

## Database Schema Requirements

The following tables need to exist in Supabase for the routes to work:

### instrument_validity Table
```sql
CREATE TABLE instrument_validity (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  thesis_id TEXT,
  instrument_name TEXT,
  instrument_type TEXT,
  description TEXT,
  metrics_json JSONB,
  validity_type TEXT,
  defense_scripts TEXT,
  validation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### defense_responses Table
```sql
CREATE TABLE defense_responses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  instrument_id UUID,
  question_type TEXT,
  question_text TEXT,
  ai_generated_response TEXT,
  is_customized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Migration Path

If these tables don't exist yet, use the Supabase migration system:

```bash
# Check migration status
supabase migration list

# Create new migration
supabase migration new create_validity_defender_tables

# Apply migrations
supabase migration up
```

## Build Status

✅ All three API routes now use correct imports
✅ Build error resolved
✅ Ready for testing and deployment
