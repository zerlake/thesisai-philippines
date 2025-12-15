# Dashboard Workspace Dynamic Context - Quick Start

## What You Need to Build

The Dashboard should show **contextual, real-time updates** of what the student should work on next based on their current activity.

## 1️⃣ Database Schema Changes (5 min)

Add these columns to track student work context:

```sql
-- documents table additions
ALTER TABLE documents ADD COLUMN IF NOT EXISTS current_chapter VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS phase_key VARCHAR;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS completion_percentage NUMERIC DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT NOW();

-- Create new tracking table
CREATE TABLE IF NOT EXISTS student_work_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_chapter VARCHAR,
  current_phase VARCHAR,
  active_document_id UUID REFERENCES documents(id),
  context_metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Add RLS policies
ALTER TABLE student_work_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own work context" ON student_work_context
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update own work context" ON student_work_context
  FOR UPDATE USING (student_id = auth.uid());
```

## 2️⃣ Enhanced RPC Function (10 min)

Create improved `get_student_next_action` that checks:
- ✓ Current chapter being worked on
- ✓ Advisor feedback requests
- ✓ Overdue/upcoming milestones
- ✓ Progress percentage
- ✓ Recent activity timestamp

**File:** Create new migration `supabase/migrations/50_dynamic_next_action.sql`

Key fields returned:
- `type` - 'feedback' | 'milestone' | 'chapter_continuation'
- `title` - Action title (e.g., "Continue: Chapter 2 - Literature Review")
- `chapter` - Which chapter (e.g., 'chapter_2')
- `phase` - Which phase (e.g., 'literature_review')
- `completion_percentage` - How much is done (0-100)
- `href` - Where to send "Start Now" button

## 3️⃣ Frontend Hook - Real-Time Listener (10 min)

**File:** `src/hooks/useWorkContextListener.ts`

```typescript
export function useWorkContextListener(onContextChange: () => void) {
  const { supabase, session } = useAuth();

  useEffect(() => {
    if (!session?.user.id) return;

    // Listen to document changes
    const subscription = supabase
      .channel(`documents:${session.user.id}`)
      .on('postgres_changes', { /* ... */ }, onContextChange)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [session?.user.id, supabase]);
}
```

**Purpose:** Triggers dashboard refresh when:
- Student saves document
- Document status changes
- New advisor feedback arrives
- Milestone status updates

## 4️⃣ Update Dashboard Component (5 min)

**File:** `src/components/student-dashboard.tsx`

Add these lines:

```typescript
// Import new hook
import { useWorkContextListener } from '@/hooks/useWorkContextListener';

export function StudentDashboard() {
  // ... existing state ...

  // Refresh next action when work context changes
  useWorkContextListener(() => {
    getNextAction(); // Existing function
  });

  // Optional: Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => getNextAction(), 30000);
    return () => clearInterval(interval);
  }, [getNextAction]);

  // ... rest of component unchanged ...
}
```

## 5️⃣ Update "Start Now" Button Routing (5 min)

**File:** `src/components/whats-next-card.tsx`

Enhance with chapter/phase info:

```typescript
interface WhatsNextCardProps {
  nextAction: Action | null;
  isLoading: boolean;
  chapter?: string;
  phase?: string;
}

// In the button section, construct dynamic href:
<Link href={
  nextAction.chapter 
    ? `/thesis-phases/${nextAction.chapter}/${nextAction.phase}`
    : nextAction.href
}>
  <Button>Start Now <ArrowRight /></Button>
</Link>
```

## 6️⃣ Track Work Activity (5 min)

**Where to add updates:**

### When document is saved:
```typescript
// In document save handler
await supabase.from('documents').update({
  last_activity_at: new Date().toISOString(),
  completion_percentage: calculatePercentage(content),
  current_chapter: 'chapter_2_literature_review'
}).eq('id', documentId);

// Update work context
await supabase.from('student_work_context').upsert({
  student_id: userId,
  current_chapter: 'chapter_2_literature_review',
  active_document_id: documentId,
  updated_at: new Date().toISOString()
});
```

### When user navigates between chapters:
```typescript
// In chapter/phase navigation
useEffect(() => {
  updateWorkContext({
    current_chapter: params.chapter,
    current_phase: params.phase
  });
}, [params.chapter, params.phase]);
```

## 📋 What's Next Card Will Show

### Scenario 1: Working on Chapter
```
Title: Continue: Chapter 2 - Literature Review
Detail: You were 75% done. Pick up where you left off.
```

### Scenario 2: Advisor Feedback Ready
```
Title: Revise "Your Chapter Title"
Detail: Your advisor has requested revisions.
Urgency: HIGH (amber background)
```

### Scenario 3: Milestone Overdue
```
Title: Overdue: Defense Presentation
Detail: Due 3 days ago.
Urgency: CRITICAL (red background)
```

## 🧪 Testing

1. Create a student account
2. Start working on Chapter 1
3. Save some content
4. Verify "What's Next" shows "Continue: Chapter 1..."
5. Switch to Chapter 2 and save
6. Verify card updates to "Continue: Chapter 2..." (should update in ~1-2 seconds)
7. Submit for advisor review
8. Verify card shows advisor feedback action with HIGH urgency

## 📊 Expected Results

✅ Dashboard updates **automatically** when student:
- Saves a document
- Changes chapters
- Gets advisor feedback
- Completes milestones

✅ "Start Now" button **always points to**:
- Current chapter if working on one
- Feedback revision if advisor left comments
- Next milestone if one is due
- Completion task if everything else is done

✅ No page refresh needed - all updates are **real-time**

## 🔑 Key Integration Points

| Action | Update Field | Triggers Refresh |
|--------|--------------|-----------------|
| Save document | `last_activity_at`, `completion_percentage` | Yes |
| Change chapter | `current_chapter` in `student_work_context` | Yes |
| Submit for review | `status = 'pending_review'` | Yes |
| Advisor feedback | Advisor comment created | Yes |
| Complete milestone | `completion_date` set | Yes |

## 💡 Benefits

1. **Reduces cognitive load** - Student always knows what to do next
2. **Improves engagement** - Relevant, timely recommendations
3. **Tracks progress** - System knows where student is in thesis
4. **Prevents bottlenecks** - Urgent items surface immediately
5. **Personalizes experience** - Different for each student's workflow
