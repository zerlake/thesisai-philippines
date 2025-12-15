# Dynamic Dashboard Workspace Implementation Guide

## Overview
The Dashboard Workspace should be **dynamic and context-aware**, automatically updating the "What's Next" card based on the student's current work across different chapters and phases. This ensures the "Start Now" button always points to the most relevant next action.

## Current Implementation Issues

### Problem 1: Static Next Action Detection
- Current `get_student_next_action` RPC only checks:
  - Advisor feedback requests
  - Overdue milestones
  - Upcoming milestones
  - Falls back to generic checklist items
- **Missing:** Real-time tracking of which chapter/phase student is actively working on

### Problem 2: No Context-Aware Updates
- The "What's Next" card doesn't update when:
  - Student completes a section in Chapter 1
  - Student switches to working on Chapter 2
  - Student submits a draft for review
  - Student saves progress in a specific phase
- **Missing:** Event listeners and real-time synchronization

### Problem 3: Limited Action Types
- Current actions only include: `feedback`, `milestone_overdue`, `milestone_upcoming`
- **Missing:** Chapter-specific actions like:
  - "Continue writing Chapter 2: Literature Review"
  - "Your Chapter 1 is ready for review"
  - "Start Chapter 3: Methodology"
  - "Complete the Validity Defender for your survey"

## Solution Architecture

### 1. Enhanced Data Tracking

**New Database Columns (documents table):**
```sql
- current_chapter: VARCHAR (e.g., 'chapter_1', 'chapter_2_literature_review')
- phase_key: VARCHAR (e.g., 'title_page', 'introduction', 'literature_review')
- work_session_started_at: TIMESTAMP
- last_activity_at: TIMESTAMP
- completion_percentage: NUMERIC
```

**New Table: student_work_context**
```sql
- id: UUID
- student_id: UUID
- current_chapter: VARCHAR
- current_phase: VARCHAR
- active_document_id: UUID
- context_metadata: JSONB (stores custom context)
- updated_at: TIMESTAMP
```

### 2. Enhanced RPC Function

**Updated `get_student_next_action` function:**

```sql
CREATE OR REPLACE FUNCTION get_student_next_action(p_student_id UUID)
RETURNS TABLE(
  type VARCHAR,
  title VARCHAR,
  detail VARCHAR,
  urgency VARCHAR,
  action_key VARCHAR,
  href VARCHAR,
  id UUID,
  key VARCHAR,
  deadline TIMESTAMP,
  chapter VARCHAR,
  phase VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_work AS (
    SELECT 
      d.id,
      d.current_chapter,
      d.phase_key,
      d.completion_percentage,
      d.last_activity_at,
      ROW_NUMBER() OVER (ORDER BY d.last_activity_at DESC) as rn
    FROM documents d
    WHERE d.user_id = p_student_id
  ),
  advisor_feedback AS (
    SELECT 
      'feedback'::VARCHAR as type,
      CONCAT('Revise "', COALESCE(d.title, 'Untitled'), '"')::VARCHAR as title,
      'Your advisor has requested revisions.'::VARCHAR as detail,
      'high'::VARCHAR as urgency,
      'advisor_feedback'::VARCHAR as action_key,
      CONCAT('/drafts/', d.id)::VARCHAR as href,
      d.id,
      NULL::VARCHAR as key,
      NULL::TIMESTAMP as deadline,
      d.current_chapter,
      d.phase_key
    FROM documents d
    WHERE d.user_id = p_student_id
      AND d.status = 'pending_review'
    LIMIT 1
  ),
  milestone_actions AS (
    SELECT
      CASE 
        WHEN NOW() > m.deadline THEN 'milestone_overdue'::VARCHAR
        ELSE 'milestone_upcoming'::VARCHAR
      END as type,
      CONCAT(
        CASE 
          WHEN NOW() > m.deadline THEN 'Overdue: '
          ELSE 'Upcoming: '
        END,
        m.title
      )::VARCHAR as title,
      CASE
        WHEN NOW() > m.deadline THEN CONCAT(EXTRACT(DAY FROM NOW() - m.deadline)::INT, ' days overdue')
        ELSE CONCAT('Due in ', EXTRACT(DAY FROM m.deadline - NOW())::INT, ' days')
      END::VARCHAR as detail,
      CASE 
        WHEN NOW() > m.deadline THEN 'critical'::VARCHAR
        ELSE 'high'::VARCHAR
      END as urgency,
      'milestone'::VARCHAR as action_key,
      '/dashboard'::VARCHAR as href,
      NULL::UUID as id,
      m.key,
      m.deadline,
      NULL::VARCHAR as chapter,
      NULL::VARCHAR as phase
    FROM thesis_milestones m
    WHERE m.student_id = p_student_id
    ORDER BY m.deadline ASC
    LIMIT 1
  ),
  chapter_continuation AS (
    SELECT
      'chapter_continuation'::VARCHAR as type,
      CONCAT('Continue: ', REPLACE(w.current_chapter, '_', ' '))::VARCHAR as title,
      CONCAT('You were ', COALESCE(w.completion_percentage::INT, 0), '% done. Pick up where you left off.')::VARCHAR as detail,
      'normal'::VARCHAR as urgency,
      'chapter_continuation'::VARCHAR as action_key,
      CONCAT('/thesis-phases/chapter/', w.current_chapter)::VARCHAR as href,
      w.id,
      NULL::VARCHAR as key,
      NULL::TIMESTAMP as deadline,
      w.current_chapter,
      w.phase_key
    FROM latest_work w
    WHERE w.rn = 1
      AND w.last_activity_at > NOW() - INTERVAL '7 days'
      AND w.completion_percentage < 100
  )
  SELECT * FROM advisor_feedback
  UNION ALL
  SELECT * FROM milestone_actions
  UNION ALL
  SELECT * FROM chapter_continuation
  ORDER BY 
    CASE urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
    deadline DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### 3. Real-Time Updates with Events

**Implement in frontend (hooks/useWorkContextListener.ts):**

```typescript
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';

export function useWorkContextListener(onContextChange: () => void) {
  const { supabase, session } = useAuth();

  useEffect(() => {
    if (!session?.user.id) return;

    // Subscribe to document changes
    const subscription = supabase
      .channel(`documents:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          // Trigger next action refresh
          onContextChange();
        }
      )
      .subscribe();

    // Also subscribe to work context table if available
    const contextSubscription = supabase
      .channel(`student_work_context:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_work_context',
          filter: `student_id=eq.${session.user.id}`,
        },
        () => {
          onContextChange();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      contextSubscription.unsubscribe();
    };
  }, [session?.user.id, supabase]);
}
```

### 4. Updated Dashboard Component

**Modified StudentDashboard with real-time updates:**

```typescript
export function StudentDashboard() {
  // ... existing state ...
  
  const refetchNextAction = useCallback(async () => {
    await getNextAction();
  }, [getNextAction]);

  // Listen to work context changes
  useWorkContextListener(refetchNextAction);

  // Optional: Periodically refresh (every 30 seconds when user is active)
  useEffect(() => {
    const interval = setInterval(refetchNextAction, 30000);
    return () => clearInterval(interval);
  }, [refetchNextAction]);

  // ... rest of component ...
}
```

### 5. Context Update Points

**Track when to update work context:**

1. **Document Save Events**
   - When student saves content in any chapter
   - Update `last_activity_at` and `completion_percentage`

2. **Phase Navigation**
   - When student navigates to a different phase
   - Update `current_phase` in `student_work_context`

3. **Document Status Changes**
   - When document status changes to `pending_review`
   - When advisor submits feedback
   - When document is `in_revision`

4. **Checklist Item Completion**
   - When student marks a checklist item complete
   - Update overall `completion_percentage`

5. **Thesis Phase Milestones**
   - When student completes a chapter
   - Automatically suggest next chapter

### 6. Implementation Steps

**Phase 1: Database Schema**
```bash
# Create migration
supabase migration new add_work_context_tracking

# Apply migration
supabase migration up
```

**Phase 2: Backend RPC**
- Create/update `get_student_next_action` function
- Test with various student scenarios

**Phase 3: Frontend Integration**
- Create `useWorkContextListener` hook
- Update `StudentDashboard` component
- Update `WhatsNextCard` to show more context

**Phase 4: Testing**
- Test real-time updates across different chapters
- Verify urgency prioritization
- Test fallback behavior

## Example Scenarios

### Scenario 1: Student Working on Chapter 2
**Current State:**
- Student is 75% done with Chapter 2: Literature Review
- No pending feedback
- No overdue milestones

**What's Next Card Shows:**
```
Title: Continue: Chapter 2 - Literature Review
Detail: You were 75% done. Pick up where you left off.
Button: Start Now → /thesis-phases/chapter/chapter_2_literature_review
```

### Scenario 2: Student Switches to Chapter 3
**Current State:**
- Student completes and saves Chapter 2
- Opens Chapter 3: Methodology
- System detects context switch

**What's Next Card Updates To:**
```
Title: Continue: Chapter 3 - Methodology
Detail: You were 0% done. Start working on your methodology.
Button: Start Now → /thesis-phases/chapter/chapter_3_methodology
```

### Scenario 3: Advisor Provides Feedback
**Current State:**
- Student submitted Chapter 1 for review
- Advisor added comments and marked as `pending_review`

**What's Next Card Shows (High Priority):**
```
Title: Revise "Chapter 1: Introduction"
Detail: Your advisor has requested revisions.
Button: Start Now → /drafts/{document_id}
```

### Scenario 4: Overdue Milestone
**Current State:**
- Thesis Defense presentation due date passed
- Student hasn't completed presentation

**What's Next Card Shows (Critical Priority):**
```
Title: Overdue: Defense Presentation
Detail: Due 3 days ago.
Button: Start Now → /defense-ppt-coach
Styling: Red background (critical urgency)
```

## Component Updates Required

### WhatsNextCard.tsx
```typescript
interface WhatsNextCardProps {
  nextAction: Action | null;
  isLoading: boolean;
  currentContext?: {
    chapter?: string;
    phase?: string;
    completionPercentage?: number;
  };
}
```

### ContextualActions.tsx
- Update to show chapter-specific quick actions
- Display progress bar for current chapter
- Show "Mark as Complete" option when applicable

## Success Metrics

✓ **What's Next card updates within 2 seconds** of document save
✓ **Context is accurate** across all thesis phases
✓ **Urgency prioritization works** (critical > high > normal)
✓ **Students see relevant next steps** without manual refresh
✓ **No false positives** in action detection
✓ **Fallback works** when no primary action exists

## Testing Checklist

- [ ] Create student account and work on Chapter 1
- [ ] Verify "What's Next" shows Chapter 1 continuation
- [ ] Switch to Chapter 2 and save
- [ ] Verify card updates to Chapter 2 within 2 seconds
- [ ] Submit Chapter 1 for advisor review
- [ ] Verify card shows advisor feedback with high priority
- [ ] Mark milestone as overdue and verify critical urgency
- [ ] Test mobile responsiveness
- [ ] Test on slow connection (verify loading state)
- [ ] Test WebSocket disconnection and reconnection
