# Next.js 16 Compatibility Analysis & Conflicts Found

## Critical Issues

### 1. **Client Component Params Promise Resolution (BLOCKING LOGIN)**
**File:** `src/app/groups/[groupId]/page.tsx`
**Issue:** Client component receiving params as Promise without proper async handling
```typescript
// WRONG - Client component can't properly handle params Promise
export default function GroupLayout({ params }: { params: Promise<{ groupId: string }> }) {
  const { session, supabase } = useAuth(); // Hooks run before params resolved!
  ...
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setResolvedGroupId(resolvedParams.groupId);
    };
    resolveParams();
  }, [params]);
```

**Fix:** Convert to server component or use `useParams()` hook instead:
```typescript
// CORRECT - Client component using useParams() hook
'use client';
import { useParams } from 'next/navigation';

export default function GroupLayout() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  ...
}
```

**Impact:** This pattern blocks auth provider from properly managing sessions during route changes.

---

### 2. **notFound() Import Issue**
**File:** `src/app/share/[documentId]/page.tsx`
**Issue:** Using `@ts-ignore` to suppress error because `notFound()` is not exported from `next/navigation` in Next.js 16
```typescript
// @ts-ignore - notFound is exported from next/navigation in Next.js
import { notFound } from "next/navigation";
```

**Fix:** Import from correct location in Next.js 16:
```typescript
import { notFound } from "next/navigation";
// OR if it's not available, use redirect:
import { redirect } from "next/navigation";
```

---

### 3. **Auth Provider Session Not Persisting**
**File:** `src/components/auth-provider.tsx`
**Issue:** The auth state listener may not be properly triggering on login in Next.js 16

The problem is that the `onAuthStateChange` listener doesn't reliably fire the `SIGNED_IN` event. Add explicit event handling:

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (!mounted) return;

  console.log("[Auth] Event:", _event, "Session valid:", !!session?.access_token);

  // MISSING: Handle 'SIGNED_IN' event
  if (_event === 'SIGNED_IN') {
    console.log("[Auth] User signed in");
    await handleAuthChange(session);
  } else if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
    ...
  }
});
```

---

### 4. **Server Client Cookie Handling**
**File:** `src/integrations/supabase/server-client.ts`
**Issue:** May not properly work with Next.js 16's async cookie API

The server client uses Supabase SSR which requires proper async handling:

```typescript
// Check if cookies() is being awaited properly
const cookies = cookies();
```

In Next.js 16, ensure it's properly typed and handled as async where needed.

---

### 5. **Middleware Cookie Operations**
**File:** `proxy.ts` (middleware.ts equivalent)
**Issue:** Cookie operations may fail silently in Next.js 16 if not properly structured

The middleware sets cookies but doesn't verify the response is properly returned. Ensure the middleware always returns a proper NextResponse:

```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // ... set cookies ...
  return res; // Must be returned explicitly
}
```

---

## Recommended Fixes (Priority Order)

### Phase 1: Critical (Blocks Login)
1. **Fix `src/app/groups/[groupId]/page.tsx`**
   - Convert params Promise handling to use `useParams()` hook
   - Move auth-dependent code after params are available

2. **Add SIGNED_IN event handler to `auth-provider.tsx`**
   - Explicitly handle the 'SIGNED_IN' event from Supabase
   - Log all auth state changes for debugging

3. **Fix notFound() import**
   - Verify correct import path in Next.js 16
   - Remove @ts-ignore comments

### Phase 2: Important (Session Management)
4. **Verify cookie handling in middleware**
   - Test that session cookies are properly set/read
   - Add debug logging for cookie operations

5. **Test Supabase SSR integration**
   - Ensure server client properly reads cookies
   - Verify session state across page transitions

### Phase 3: Nice-to-Have (Code Quality)
6. **Remove @ts-ignore directives**
   - Replace type suppressions with proper types
   - Fix underlying type mismatches

7. **Add proper error boundaries**
   - Wrap auth operations in error boundaries
   - Add user-friendly error messages

---

## Testing Checklist

After applying fixes:
- [ ] Login succeeds without profile creation error
- [ ] Session persists after reload
- [ ] Redirect to dashboard after login works
- [ ] Logout clears session properly
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Browser console has no auth-related errors
- [ ] Network tab shows proper auth API calls

---

## Next.js 16 Breaking Changes Reference

1. **Dynamic Route Parameters**: Now `params: Promise<T>` instead of immediate object
2. **Auth Events**: All Supabase auth events need explicit handling
3. **Cookie API**: More restrictive async handling required
4. **Server/Client Boundaries**: Stricter enforcement of component boundaries
5. **Metadata Generation**: Must properly handle async params

