# TypeScript Error Resolution Guide

## Error Categories Analysis

### 1. Missing React Imports (CRITICAL - HIGH PRIORITY)
**Impact:** Multiple components won't compile  
**Affected Files:** document-analyzer.tsx, reference-manager.tsx, etc.

**Issue:** Components using React hooks (`useState`, `useRef`, `useEffect`) are missing the React import.

**Fix for document-analyzer.tsx:**
```tsx
// ADD THIS AT THE TOP:
'use client';
import React, { useState, useRef, useEffect } from 'react';
```

**Fix for reference-manager.tsx:**
```tsx
'use client';
import React, { useState } from 'react';
```

**Fix for rich-text-editor.tsx:**
```tsx
'use client';
import React, { useState, useCallback } from 'react';
```

**Fix for student-critic-billing-history.tsx:**
```tsx
'use client';
import React, { useState, useEffect } from 'react';
```

**Fix for topic-ideation-tool.tsx:**
```tsx
'use client';
import React, { useState } from 'react';
```

---

### 2. Missing Lucide Icon Imports (HIGH PRIORITY)
**Impact:** Icons won't render  
**Affected Files:** groups/page.tsx, critic-billing-page.tsx, GroupCommunication.tsx, etc.

**Fix for groups/page.tsx:**
```tsx
// ADD THIS IMPORT:
import { Plus, Search, Users, Eye, Trash2 } from 'lucide-react';
```

**Fix for critic-billing-page.tsx:**
```tsx
import { CheckCircle, Hourglass } from 'lucide-react';
```

**Fix for GroupCommunication.tsx:**
```tsx
import { AlertCircle, CalendarCheck, FileText, MessageCircle, Send } from 'lucide-react';
```

**Fix for student-dmp-form.tsx:**
```tsx
import { Save, Send } from 'lucide-react';
```

**Fix for variable-mapping-tool.tsx:**
```tsx
import { DownloadIcon } from 'lucide-react';
// NOTE: DownloadIcon might be named differently - use 'Download' instead
import { Download } from 'lucide-react';
```

---

### 3. Missing UI Component Imports (HIGH PRIORITY)
**Impact:** UI components won't render  
**Affected Files:** critic-dashboard.tsx, grammar-checker.tsx, etc.

**Fix for critic-dashboard.tsx:**
```tsx
// ADD imports for missing components:
// StatCard, CriticReviewQueueCard, CriticRequestsCard
// Check src/components/ for these components
import { StatCard } from '@/components/stat-card'; // or wherever it's located
import { CriticReviewQueueCard } from '@/components/critic-review-queue-card';
import { CriticRequestsCard } from '@/components/critic-requests-card';
```

**Fix for grammar-checker.tsx:**
```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
```

---

### 4. Next.js Navigation Imports (MEDIUM PRIORITY)
**Impact:** Dynamic page routing won't work  
**Affected Files:** pages.tsx files with dynamic routes

**Issue:** `notFound` and `useParams` are not exported from `next/navigation` in this Next.js version.

**Fix for share/[documentId]/page.tsx:**
```tsx
// CHANGE FROM:
import { notFound } from 'next/navigation';

// TO:
import { notFound } from 'next/navigation';
// OR for server components, just use redirect instead:
import { redirect } from 'next/navigation';
```

**Fix for advisor/students/[studentId]/page.tsx:**
```tsx
// CHANGE FROM:
import { useParams } from 'next/navigation';

// TO:
// For server components, use props instead:
export default function StudentPage({ params }: { params: { studentId: string } }) {
  // Use params.studentId instead of useParams()
}
```

---

### 5. Missing 'use client' Directives (MEDIUM PRIORITY)
**Impact:** Client-side functionality won't work  
**Affected Files:** components using hooks, forms, etc.

**Fix Pattern:**
```tsx
// ADD AT THE TOP OF FILE:
'use client';

import React, { useState, useEffect } from 'react';
// ... rest of imports
```

**Files needing 'use client':**
- `src/components/document-analyzer.tsx`
- `src/components/reference-manager.tsx`
- `src/components/rich-text-editor.tsx`
- `src/components/grammar-checker.tsx`
- `src/components/GroupCommunication.tsx`
- `src/components/puter-ai-tools.tsx`
- `src/components/topic-ideation-tool.tsx`
- `src/components/student-critic-billing-history.tsx`

---

### 6. Context/Custom Hook Missing (MEDIUM PRIORITY)
**Impact:** Authentication context won't work  
**Affected Files:** rich-text-editor.tsx

**Fix:**
```tsx
// CHANGE FROM:
const { } = useAuth();

// TO:
import { useAuth } from '@/lib/auth-utils'; // or correct path
// OR if useAuth doesn't exist:
import { useUser } from '@supabase/auth-helpers-react';
const { user } = useUser();
```

---

### 7. Toast/Notification Missing (MEDIUM PRIORITY)
**Impact:** Toast notifications won't show  
**Affected Files:** rich-text-editor.tsx

**Fix:**
```tsx
// CHANGE FROM:
const { toast } = useToast();

// TO:
import { useToast } from '@/components/ui/use-toast';
const { toast } = useToast();
```

---

### 8. Type Safety Issues (LOW PRIORITY - Won't break at runtime)
**Impact:** Build warnings only  
**Examples:**
- Null object access
- Type mismatches in callbacks

**Fix for share/[documentId]/page.tsx:**
```tsx
// CHANGE FROM:
const title = document.title;

// TO:
const title = document?.title || 'Untitled Document';
```

**Fix for components with implicit any:**
```tsx
// CHANGE FROM:
const items = data.map((item) => ...);

// TO:
const items = data.map((item: any) => ...);
// OR better:
const items = data.map((item: DataType) => ...);
```

---

### 9. Test File Issues (LOW PRIORITY - Only during testing)
**Impact:** Tests won't run but app still works  
**Affected Files:** `src/__tests__/*.test.tsx`

**Fix:**
```tsx
// ADD to tsconfig.json:
{
  "compilerOptions": {
    "types": ["vitest/globals", "jest", "@testing-library/jest-dom"]
  }
}
```

---

## Quick Fix Script

Create a file `fix-typescript-errors.sh`:

```bash
#!/bin/bash

# Add 'use client' to components
for file in src/components/document-analyzer.tsx \
            src/components/reference-manager.tsx \
            src/components/rich-text-editor.tsx \
            src/components/grammar-checker.tsx \
            src/components/GroupCommunication.tsx \
            src/components/puter-ai-tools.tsx \
            src/components/topic-ideation-tool.tsx \
            src/components/student-critic-billing-history.tsx; do
  if ! grep -q "'use client'" "$file"; then
    sed -i "1i 'use client';" "$file"
  fi
done

# Add React import to files that use hooks
for file in src/components/document-analyzer.tsx \
            src/components/reference-manager.tsx; do
  if ! grep -q "import.*React" "$file"; then
    sed -i "1i import React, { useState, useRef, useEffect } from 'react';" "$file"
  fi
done

echo "TypeScript fixes applied!"
```

---

## Priority Fix Order

### Tier 1 (CRITICAL - Fix First)
1. Add `'use client'` to all client components
2. Add React hook imports
3. Add Lucide icon imports
4. Add UI component imports

### Tier 2 (IMPORTANT - Fix Second)
5. Fix Next.js navigation imports
6. Fix useAuth/useToast imports
7. Fix custom hook imports

### Tier 3 (NICE TO HAVE - Fix Last)
8. Fix type safety issues
9. Fix test file configurations
10. Add missing type annotations

---

## Validation After Fixes

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run ESLint
npm run lint

# Build the app
npm run build

# Test the app
npm run dev
```

---

## Common Patterns

### Pattern 1: Client Component with Hooks
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // side effect
  }, []);
  
  return <div>{count}</div>;
}
```

### Pattern 2: Server Component with Dynamic Routes
```tsx
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}
```

### Pattern 3: Component with Icons
```tsx
'use client';

import { Plus, Trash2, Edit } from 'lucide-react';

export default function ActionButtons() {
  return (
    <div>
      <Plus className="w-4 h-4" />
      <Trash2 className="w-4 h-4" />
      <Edit className="w-4 h-4" />
    </div>
  );
}
```

---

## Testing Specific Files

```bash
# Test one file
npx tsc --noEmit src/components/document-analyzer.tsx

# Test all components
npx tsc --noEmit src/components/*.tsx

# Test with declaration emit to see full errors
npx tsc src/components/document-analyzer.tsx
```

---

## When to Ignore Errors

Some errors can be safely ignored:
- Test file namespace errors (tests won't run but app works)
- Next.js internal type errors (happen with version mismatches)
- Editor mock type mismatches in tests

Use `@ts-ignore` sparingly:
```tsx
// Only use when absolutely necessary
// @ts-ignore - Editor type mismatch in tests
const mockEditor = { ... };
```

---

## Resources

- [Next.js Navigation](https://nextjs.org/docs/app/api-reference/functions/use-params)
- [React Hooks](https://react.dev/reference/react)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Status:** Ready to apply fixes  
**Estimated Time:** 15-30 minutes  
**Difficulty:** Easy
