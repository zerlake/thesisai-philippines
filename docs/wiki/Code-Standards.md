# Code Standards & Guidelines

Development standards, conventions, and best practices for ThesisAI.

## TypeScript Standards

### Strict Mode

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Guidelines:**
- ✅ Always define types explicitly
- ✅ Avoid `any` type (use `unknown` if needed)
- ✅ Return types required on functions
- ❌ No implicit `any`
- ❌ No `null` unless intentional

### Type Definitions

**Good:**
```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'advisor' | 'admin'
  createdAt: Date
}

type ThesisPhase = 1 | 2 | 3 | 4 | 5

function createUser(data: User): Promise<User> {
  // implementation
}
```

**Bad:**
```typescript
// No type
const user = createUser({ id: '1' })

// Implicit any
function save(data) { }

// Any type
const result: any = getData()
```

## Naming Conventions

### Files & Directories

```
// Components: PascalCase
src/components/
├── ThesisEditor.tsx
├── AdvisorDashboard.tsx
└── MessageThread.tsx

// Utilities: camelCase
src/lib/
├── authUtils.ts
├── validationHelpers.ts
└── supabaseClient.ts

// Pages: lowercase with dashes
src/app/
├── thesis-editor/
├── advisor-dashboard/
└── messages/
```

### Variables & Functions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024
const DEFAULT_THEME = 'light'

// Variables: camelCase
let currentUserId: string
const thesisTitle = 'My Research'

// Functions: camelCase
function getUserThesis(userId: string): Promise<Thesis>
async function updateThesisPhase(id: string, phase: number): Promise<void>

// React Components: PascalCase
function UserProfile(): JSX.Element
const ThesisViewer = ({ data }: Props) => ( ... )

// Hooks: useXxx pattern
function useAuth(): AuthState
function useThesis(thesisId: string): Thesis | null
```

### Private Functions

```typescript
// Prefix with underscore
function _validateEmail(email: string): boolean
const _calculateScore = (values: number[]) => { }

// Or nested in module
const privateHelpers = {
  _validateEmail(email: string): boolean { },
  _calculateScore(values: number[]): number { }
}
```

## Import/Export Conventions

### Alphabetical Order

```typescript
// 1. React & Framework
import { createContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

// 2. External Libraries (alphabetical)
import { Button } from '@radix-ui/react-button'
import clsx from 'clsx'
import { toast } from 'sonner'

// 3. Internal Modules (alphabetical)
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ThesisCard } from '@/components/ThesisCard'

// 4. Relative Imports
import { formatDate } from './utils'
import { THESIS_PHASES } from './constants'
```

### Export Patterns

```typescript
// Named exports for utilities
export function getUserById(id: string): User | null { }

// Default export for components
export default function ThesisEditor() { }

// Type exports
export type ThesisData = {
  id: string
  title: string
}

// Star exports (use sparingly)
export * from './utils'
```

## React Patterns

### Component Structure

```typescript
'use client' // if needed

import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

// Props interface first
interface ThesisEditorProps {
  thesisId: string
  onSave?: (content: string) => void
  children?: ReactNode
}

// Component function
export function ThesisEditor({
  thesisId,
  onSave,
  children,
}: ThesisEditorProps): JSX.Element {
  // Hooks
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Callbacks
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await saveContent(thesisId, content)
      onSave?.(content)
    } finally {
      setIsSaving(false)
    }
  }, [thesisId, content, onSave])

  // Render
  return (
    <div className="thesis-editor">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <Button onClick={handleSave} disabled={isSaving}>
        Save
      </Button>
      {children}
    </div>
  )
}
```

### Hooks Usage

**Good:**
```typescript
function ThesisPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [thesis, setThesis] = useState<Thesis | null>(null)

  useEffect(() => {
    if (!user) return
    loadThesis(user.id).then(setThesis)
  }, [user?.id])

  return <ThesisContent thesis={thesis} />
}
```

**Bad:**
```typescript
function ThesisPage() {
  // Don't call hooks conditionally
  if (!user) return null
  const { data } = useAPI() // ❌ Breaks rules of hooks

  // Don't use for side effects without dependency array
  useEffect(() => {
    loadData() // ❌ Infinite loop
  })
}
```

## Styling Conventions

### Tailwind CSS

**Good:**
```typescript
function Button({ variant = 'primary' }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }

  return (
    <button className={clsx(baseStyles, variants[variant])}>
      Click me
    </button>
  )
}
```

**Bad:**
```typescript
// Avoid string concatenation
function Button({ variant }: ButtonProps) {
  const style = `px-4 py-2 rounded-lg ${variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200'}`
  return <button className={style} /> // ❌ Not optimizable
}
```

### CSS Classes

```typescript
// Prefer constants
const BUTTON_CLASSES = {
  base: 'px-4 py-2 rounded-lg font-medium',
  primary: 'bg-blue-600 text-white',
  disabled: 'opacity-50 cursor-not-allowed',
}

// Use utility functions
const buttonClass = clsx(BUTTON_CLASSES.base, BUTTON_CLASSES.primary)
```

## Error Handling

### Try-Catch Pattern

```typescript
async function updateUser(id: string, data: UserUpdate): Promise<void> {
  try {
    const result = await supabase
      .from('users')
      .update(data)
      .eq('id', id)

    if (result.error) {
      throw new Error(result.error.message)
    }
  } catch (error) {
    console.error('Failed to update user:', error)
    throw error // Re-throw if caller should handle
  }
}
```

### API Error Responses

```typescript
// src/app/api/users/[id]/route.ts
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Validate input
    if (!data.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      )
    }

    // Check authorization
    const user = await getAuthUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Process request
    const result = await updateUser(user.id, data)
    return Response.json(result)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}
```

## Async/Await

**Good:**
```typescript
async function fetchUserThesis(userId: string): Promise<Thesis[]> {
  try {
    const response = await supabase
      .from('theses')
      .select('*')
      .eq('user_id', userId)

    if (response.error) throw response.error
    return response.data ?? []
  } catch (error) {
    console.error('Failed to fetch theses:', error)
    return []
  }
}
```

**Bad:**
```typescript
// Avoid callback hell
function fetchUserThesis(userId: string): Promise<Thesis[]> {
  return supabase
    .from('theses')
    .select('*')
    .eq('user_id', userId)
    .then(res => {
      if (res.error) throw res.error
      return res.data ?? []
    })
    .catch(err => {
      console.error('Failed:', err)
      return []
    })
}
```

## Comments & Documentation

### JSDoc Comments

```typescript
/**
 * Calculate thesis validity score based on research gap assessment
 * @param gaps - Array of identified research gaps
 * @param weights - Custom scoring weights
 * @returns Score between 0 and 100
 */
function calculateValidity(gaps: Gap[], weights?: Weights): number {
  // implementation
}

/**
 * React component for editing thesis phase content
 * @example
 * <ThesisEditor thesisId="123" onSave={handleSave} />
 */
function ThesisEditor(props: ThesisEditorProps): JSX.Element {
  // implementation
}
```

### Inline Comments

```typescript
// Explain WHY, not WHAT
function validateEmail(email: string): boolean {
  // RFC 5321 compliant regex for email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ❌ Bad: explains what the code does
// Check if email includes @ and .
```

## Unused Variables

**ESLint Enforcement:**
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error"],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["warn"]
  }
}
```

**Fix unused imports:**
```bash
pnpm run clean-imports
```

## Function Complexity

**Keep functions small:**
- Aim for < 50 lines
- Single responsibility
- Extract helper functions

**Good:**
```typescript
function processThesis(thesis: Thesis): ProcessedThesis {
  const content = parseContent(thesis.content)
  const gaps = identifyGaps(content)
  const score = calculateScore(gaps)
  return { ...thesis, gaps, score }
}

// Separate concerns
function parseContent(text: string): ParsedContent { }
function identifyGaps(content: ParsedContent): Gap[] { }
function calculateScore(gaps: Gap[]): number { }
```

## Testing Standards

### Test File Structure

```typescript
// src/__tests__/lib/authUtils.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getUserById } from '@/lib/authUtils'

describe('authUtils', () => {
  describe('getUserById', () => {
    it('should return user when found', () => {
      const user = getUserById('123')
      expect(user).toBeDefined()
      expect(user?.id).toBe('123')
    })

    it('should return null when not found', () => {
      const user = getUserById('nonexistent')
      expect(user).toBeNull()
    })
  })
})
```

## Performance Best Practices

### Memoization

```typescript
// Use React.memo for expensive renders
const ThesisCard = React.memo(function ThesisCard(props: Props) {
  return <div>{props.title}</div>
})

// Use useCallback for function stability
const handleClick = useCallback(() => {
  updateThesis(id)
}, [id])

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return calculateMetrics(data)
}, [data])
```

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyEditor = dynamic(() => import('@/components/HeavyEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Don't render on server
})
```

---

## Quick Checklist

Before submitting code:

- ✅ No `any` types
- ✅ No unused imports
- ✅ All functions have return types
- ✅ Proper error handling
- ✅ camelCase for variables/functions
- ✅ PascalCase for components
- ✅ Imports alphabetically ordered
- ✅ Tests written for logic
- ✅ ESLint passes
- ✅ TypeScript compiles
- ✅ No console.log in production code

---

## Related Pages

- [Contributing](./Contributing) - How to contribute
- [Testing Guide](./Testing-Guide) - Testing best practices
- [Feature Implementation](./Feature-Implementation) - Adding features

**Last Updated:** December 2024
