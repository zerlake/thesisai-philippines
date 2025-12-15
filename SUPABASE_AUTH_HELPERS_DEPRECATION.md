# Supabase Auth Helpers Deprecation Notice

## ⚠️ Issue

Several files in the project are using the deprecated `@supabase/auth-helpers-nextjs` package, which is no longer supported.

### Affected Files:
- `src/app/api/documents/save/route.ts`
- `src/app/api/documents/versions/checkpoint/route.ts`
- `src/app/api/documents/versions/list/route.ts`
- `src/app/api/documents/versions/restore/route.ts`
- `src/app/editor/[id]/page.tsx`
- `src/components/novel-editor-enhanced.tsx`
- `src/components/novel-editor.tsx`

## ✅ Solution

Update these files to use the modern `@supabase/supabase-js` client instead.

### Old Code (Deprecated):
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabase = createRouteHandlerClient({ cookies });
const supabase = createClientComponentClient();
```

### New Code (Modern):
```typescript
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server Component or Route Handler
const cookieStore = await cookies();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);

// Client Component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 📝 Migration Steps

### 1. Remove deprecated package (already done)
```bash
pnpm remove @supabase/auth-helpers-nextjs
```

### 2. Update imports in all affected files

Replace:
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
```

With:
```typescript
import { createClient } from '@supabase/supabase-js';
```

### 3. Update client initialization

**For Server Components/Route Handlers:**
```typescript
// Old
const supabase = createRouteHandlerClient({ cookies });

// New
const cookieStore = await cookies();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);
```

**For Client Components:**
```typescript
// Old
const supabase = createClientComponentClient();

// New
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 4. Create a utility function (Recommended)

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server-side client
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Client-side client
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Then use:
```typescript
// In server components/routes
import { createServerClient } from '@/lib/supabase';
const supabase = await createServerClient();

// In client components
import { createBrowserClient } from '@/lib/supabase';
const supabase = createBrowserClient();
```

## 🔗 Resources

- [Supabase Next.js Migration Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase JS v2 Documentation](https://supabase.com/docs/reference/javascript/introduction)

## ⚠️ Note

This is separate from the RevenueCat integration, which is complete and working. These files existed before the RevenueCat implementation and need to be updated as part of regular maintenance.
