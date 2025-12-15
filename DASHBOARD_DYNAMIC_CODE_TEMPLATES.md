# Dashboard Dynamic Workspace - Ready-to-Use Code Templates

## 1. Database Migration

**File:** `supabase/migrations/50_dynamic_work_context.sql`

```sql
-- Add tracking columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS current_chapter VARCHAR,
ADD COLUMN IF NOT EXISTS phase_key VARCHAR,
ADD COLUMN IF NOT EXISTS completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT NOW();

-- Create student work context table
CREATE TABLE IF NOT EXISTS student_work_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_chapter VARCHAR,
  current_phase VARCHAR,
  active_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  context_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_student_context UNIQUE (student_id)
);

-- Create index for fast lookups
CREATE INDEX idx_student_work_context_student_id 
ON student_work_context(student_id);

-- Enable RLS
ALTER TABLE student_work_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own work context"
ON student_work_context FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can update their own work context"
ON student_work_context FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can insert their own work context"
ON student_work_context FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_student_work_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_student_work_context_timestamp
BEFORE UPDATE ON student_work_context
FOR EACH ROW
EXECUTE FUNCTION update_student_work_context_timestamp();
```

## 2. Enhanced RPC Function

**File:** `supabase/migrations/51_enhanced_next_action_rpc.sql`

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
  phase VARCHAR,
  completion_percentage NUMERIC
) AS $$
DECLARE
  v_result RECORD;
  v_days_overdue INT;
  v_days_until INT;
BEGIN
  -- 1. Check for advisor feedback (HIGHEST PRIORITY)
  SELECT 
    'feedback' as type,
    'Revise "' || COALESCE(d.title, 'Untitled') || '"' as title,
    'Your advisor has requested revisions.' as detail,
    'high' as urgency,
    'advisor_feedback' as action_key,
    '/drafts/' || d.id as href,
    d.id,
    NULL::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    d.current_chapter,
    d.phase_key,
    d.completion_percentage
  INTO v_result
  FROM documents d
  WHERE d.user_id = p_student_id
    AND d.status = 'pending_review'
  ORDER BY d.updated_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 2. Check for overdue milestones (CRITICAL)
  SELECT 
    'milestone_overdue' as type,
    'Overdue: ' || m.title as title,
    EXTRACT(DAY FROM NOW() - m.deadline)::INT || ' days overdue' as detail,
    'critical' as urgency,
    'milestone_overdue' as action_key,
    '/thesis-phases/chapters' as href,
    NULL::UUID as id,
    m.key,
    m.deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    NULL::NUMERIC as completion_percentage
  INTO v_result
  FROM thesis_milestones m
  WHERE m.student_id = p_student_id
    AND m.deadline < NOW()
    AND COALESCE(m.completed_at, NOW()) > m.deadline
  ORDER BY m.deadline DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 3. Check for upcoming milestones (HIGH PRIORITY)
  SELECT 
    'milestone_upcoming' as type,
    'Upcoming: ' || m.title as title,
    'Due in ' || EXTRACT(DAY FROM m.deadline - NOW())::INT || ' days' as detail,
    'high' as urgency,
    'milestone_upcoming' as action_key,
    '/thesis-phases/chapters' as href,
    NULL::UUID as id,
    m.key,
    m.deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    NULL::NUMERIC as completion_percentage
  INTO v_result
  FROM thesis_milestones m
  WHERE m.student_id = p_student_id
    AND m.deadline >= NOW()
    AND m.deadline <= NOW() + INTERVAL '7 days'
    AND m.completed_at IS NULL
  ORDER BY m.deadline ASC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 4. Check for active chapter work (NORMAL)
  SELECT 
    'chapter_continuation' as type,
    'Continue: ' || REPLACE(REPLACE(d.current_chapter, '_', ' '), 'chapter ', 'Chapter ') as title,
    'You were ' || COALESCE(d.completion_percentage::INT, 0) || '% done. Pick up where you left off.' as detail,
    'normal' as urgency,
    'chapter_continuation' as action_key,
    '/thesis-phases/' || d.current_chapter as href,
    d.id,
    NULL::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    d.current_chapter,
    d.phase_key,
    d.completion_percentage
  INTO v_result
  FROM documents d
  WHERE d.user_id = p_student_id
    AND d.current_chapter IS NOT NULL
    AND d.last_activity_at > NOW() - INTERVAL '7 days'
    AND d.completion_percentage < 100
  ORDER BY d.last_activity_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 5. Fallback: Next incomplete checklist item
  SELECT 
    'task' as type,
    ci.title as title,
    ci.description as detail,
    'normal' as urgency,
    'checklist_task' as action_key,
    COALESCE(ci.href, '/dashboard') as href,
    NULL::UUID as id,
    ci.id as key,
    NULL::TIMESTAMP as deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    NULL::NUMERIC as completion_percentage
  INTO v_result
  FROM checklist_items ci
  LEFT JOIN checklist_progress cp ON ci.id = cp.item_id AND cp.user_id = p_student_id
  WHERE cp.user_id IS NULL
  ORDER BY ci.order_index ASC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 6. Everything complete - suggest final preparation
  RETURN QUERY SELECT 
    'task'::VARCHAR as type,
    'Prepare for Submission'::VARCHAR as title,
    'Run a final check and prepare your defense presentation.'::VARCHAR as detail,
    'normal'::VARCHAR as urgency,
    'completion'::VARCHAR as action_key,
    '/originality-check'::VARCHAR as href,
    NULL::UUID as id,
    'final_check'::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    100::NUMERIC as completion_percentage;
END;
$$ LANGUAGE plpgsql;
```

## 3. Frontend Hook - Real-Time Listener

**File:** `src/hooks/useWorkContextListener.ts`

```typescript
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useWorkContextListener(
  onContextChange: () => void,
  options?: {
    debounceMs?: number;
    enabled?: boolean;
  }
) {
  const { supabase, session } = useAuth();
  const debounceMs = options?.debounceMs ?? 500;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!session?.user.id || !enabled) return;

    let debounceTimeout: NodeJS.Timeout;
    let subscriptions: RealtimeChannel[] = [];

    const handleContextChange = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        console.debug('[useWorkContextListener] Context changed, refreshing...');
        onContextChange();
      }, debounceMs);
    };

    // Subscribe to documents table changes
    const docsSubscription = supabase
      .channel(`documents:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.debug('[useWorkContextListener] Document change detected:', payload.eventType);
          handleContextChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug('[useWorkContextListener] Subscribed to documents');
        } else if (status === 'CLOSED') {
          console.debug('[useWorkContextListener] Documents subscription closed');
        }
      });

    subscriptions.push(docsSubscription);

    // Subscribe to work context table changes
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
        (payload) => {
          console.debug('[useWorkContextListener] Work context change detected:', payload.eventType);
          handleContextChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug('[useWorkContextListener] Subscribed to work context');
        }
      });

    subscriptions.push(contextSubscription);

    // Cleanup on unmount
    return () => {
      clearTimeout(debounceTimeout);
      subscriptions.forEach((sub) => {
        supabase.removeChannel(sub);
      });
    };
  }, [session?.user.id, supabase, onContextChange, debounceMs, enabled]);
}
```

## 4. Updated Student Dashboard Component

**File:** `src/components/student-dashboard.tsx` (Updated)

Add this to the component (around line 218):

```typescript
import { useWorkContextListener } from '@/hooks/useWorkContextListener';

export function StudentDashboard() {
  // ... existing state ...

  // NEW: Listen to work context changes
  useWorkContextListener(
    () => {
      console.log('[StudentDashboard] Work context changed, refreshing next action');
      getNextAction();
    },
    { debounceMs: 500 }
  );

  // NEW: Periodic refresh while user is active (optional)
  useEffect(() => {
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      getNextAction();
    }, 30000);

    return () => clearInterval(interval);
  }, [getNextAction]);

  // ... rest of component unchanged ...
}
```

## 5. Helper: Update Work Context When Saving

**File:** `src/lib/update-work-context.ts` (New)

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export interface WorkContextUpdate {
  documentId?: string;
  currentChapter?: string;
  currentPhase?: string;
  completionPercentage?: number;
}

export async function updateWorkContext(
  supabase: SupabaseClient,
  userId: string,
  update: WorkContextUpdate
) {
  try {
    // Update documents table
    if (update.documentId) {
      await supabase
        .from('documents')
        .update({
          current_chapter: update.currentChapter || null,
          phase_key: update.currentPhase || null,
          completion_percentage: update.completionPercentage || 0,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', update.documentId);
    }

    // Update or insert student_work_context
    const contextData = {
      student_id: userId,
      current_chapter: update.currentChapter || null,
      current_phase: update.currentPhase || null,
      active_document_id: update.documentId || null,
      updated_at: new Date().toISOString(),
    };

    const { error: contextError } = await supabase
      .from('student_work_context')
      .upsert(contextData, { onConflict: 'student_id' });

    if (contextError) {
      console.error('[updateWorkContext] Error updating context:', contextError);
      throw contextError;
    }

    console.debug('[updateWorkContext] Work context updated:', {
      chapter: update.currentChapter,
      phase: update.currentPhase,
      completion: update.completionPercentage,
    });
  } catch (error) {
    console.error('[updateWorkContext] Failed to update work context:', error);
    throw error;
  }
}
```

## 6. Usage in Document Save

Example of how to call the update function:

```typescript
// In a component that saves documents (e.g., editor)
import { updateWorkContext } from '@/lib/update-work-context';

async function handleSaveDocument(content: string, documentId: string) {
  try {
    // Save document content
    const { error: saveError } = await supabase
      .from('documents')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (saveError) throw saveError;

    // Update work context
    await updateWorkContext(supabase, user.id, {
      documentId,
      currentChapter: 'chapter_2_literature_review',
      currentPhase: 'main_body',
      completionPercentage: calculateCompletion(content),
    });

    toast.success('Document saved!');
  } catch (error) {
    toast.error('Failed to save document');
    console.error(error);
  }
}
```

## 7. Enhanced WhatsNextCard Component

**File:** `src/components/whats-next-card.tsx` (Enhanced)

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Progress } from "./ui/progress"; // Assuming you have this

type Action = {
  type: 'feedback' | 'milestone' | 'task' | 'chapter_continuation';
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'normal';
  href: string;
  icon: LucideIcon;
  chapter?: string;
  phase?: string;
  completion_percentage?: number;
};

interface WhatsNextCardProps {
  nextAction: Action | null;
  isLoading: boolean;
}

export function WhatsNextCard({ nextAction, isLoading }: WhatsNextCardProps) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!nextAction) {
    return null;
  }

  const urgencyClasses = {
    critical: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
    high: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300",
    normal: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
  };

  const Icon = nextAction.icon;

  return (
    <Card className={cn("border-2 transition-all", urgencyClasses[nextAction.urgency])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <span>What&apos;s Next?</span>
          {nextAction.urgency === 'critical' && (
            <span className="ml-auto text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">
              URGENT
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-xl font-bold">{nextAction.title}</h3>
          <p className="text-sm opacity-80 mt-1">{nextAction.detail}</p>
        </div>

        {/* Show progress for chapter work */}
        {nextAction.chapter && nextAction.completion_percentage !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span className="font-semibold">{nextAction.completion_percentage}%</span>
            </div>
            <Progress 
              value={nextAction.completion_percentage} 
              className="h-2"
            />
          </div>
        )}

        <Link href={nextAction.href}>
          <Button className="w-full">
            Start Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
```

## 8. Testing Helper Functions

**File:** `src/lib/testing/work-context-helpers.ts` (For development/testing)

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export async function setStudentWorkContext(
  supabase: SupabaseClient,
  userId: string,
  chapter: string,
  phase?: string,
  completionPercentage: number = 0
) {
  const { error } = await supabase
    .from('student_work_context')
    .upsert({
      student_id: userId,
      current_chapter: chapter,
      current_phase: phase,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id' });

  if (error) throw error;
  
  console.log('✅ Work context set:', { chapter, phase, completionPercentage });
}

export async function markDocumentAsReview(
  supabase: SupabaseClient,
  documentId: string
) {
  const { error } = await supabase
    .from('documents')
    .update({ status: 'pending_review' })
    .eq('id', documentId);

  if (error) throw error;
  
  console.log('✅ Document marked for review');
}

export async function createTestMilestone(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  deadline: Date,
  isOverdue: boolean = false
) {
  const deadlineDate = isOverdue 
    ? new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    : deadline;

  const { error } = await supabase
    .from('thesis_milestones')
    .insert({
      student_id: userId,
      title,
      deadline: deadlineDate.toISOString(),
      key: title.toLowerCase().replace(/\s+/g, '_'),
    });

  if (error) throw error;
  
  console.log('✅ Test milestone created:', { title, isOverdue });
}
```

## Summary of Changes

| File | Change Type | Impact |
|------|-------------|--------|
| Database migrations | Add tables & columns | Enables tracking |
| RPC function | Enhanced logic | Smarter action detection |
| useWorkContextListener | New hook | Real-time updates |
| StudentDashboard | Integration | Listens to events |
| WhatsNextCard | Enhanced UI | Shows progress |
| update-work-context | New utility | Updates context |

All components work together to create a **dynamic, real-time dashboard** that updates automatically as students work.
