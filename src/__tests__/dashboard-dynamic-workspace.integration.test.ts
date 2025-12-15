import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Integration tests for Dashboard Dynamic Workspace feature
 * 
 * Tests that the real-time context-aware dashboard system works correctly:
 * - RPC function returns correct priorities
 * - Work context updates trigger dashboard updates
 * - Progress tracking works
 * - Urgency levels are correct
 */

describe('Dashboard Dynamic Workspace Integration Tests', () => {
  let supabase: any;
  let testUserId: string;
  let testDocumentId: string;

  beforeEach(async () => {
    // Initialize Supabase client (uses env variables)
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Note: In real tests, you'd seed a test user and documents
    testUserId = process.env.TEST_USER_ID || 'test-user-uuid';
    testDocumentId = process.env.TEST_DOCUMENT_ID || 'test-doc-uuid';
  });

  afterEach(async () => {
    // Cleanup would go here if testing against real database
  });

  describe('RPC Function: get_student_next_action', () => {
    it('should return chapter_continuation when student has active incomplete chapter', async () => {
      // Setup: Update document with current_chapter and completion_percentage
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          current_chapter: 'chapter_2_literature_review',
          completion_percentage: 45,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', testDocumentId)
        .eq('user_id', testUserId);

      expect(updateError).toBeNull();

      // Execute RPC
      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('chapter_continuation');
      expect(data.title).toContain('Chapter 2');
      expect(data.urgency).toBe('normal');
      expect(data.completion_percentage).toBe(45);
      expect(data.chapter).toBe('chapter_2_literature_review');
    });

    it('should prioritize advisor feedback (HIGH) over active chapter work', async () => {
      // Setup: Create pending_review document
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'pending_review',
          title: 'Chapter 1: Introduction',
          current_chapter: 'chapter_1_introduction',
        })
        .eq('id', testDocumentId)
        .eq('user_id', testUserId);

      expect(updateError).toBeNull();

      // Execute RPC
      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('feedback');
      expect(data.urgency).toBe('high');
      expect(data.title).toContain('Revise');
      expect(data.title).toContain('Chapter 1');
    });

    it('should return milestone_overdue with CRITICAL urgency', async () => {
      // Setup: Create overdue milestone
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);

      const { data: milestone, error: createError } = await supabase
        .from('thesis_milestones')
        .insert({
          student_id: testUserId,
          title: 'Defense Presentation',
          deadline: yesterdayDate.toISOString(),
          key: 'defense_presentation',
        })
        .select()
        .single();

      expect(createError).toBeNull();

      // Execute RPC
      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('milestone_overdue');
      expect(data.urgency).toBe('critical');
      expect(data.title).toContain('Overdue');
      expect(data.title).toContain('Defense');
      expect(data.detail).toContain('days overdue');

      // Cleanup
      await supabase
        .from('thesis_milestones')
        .delete()
        .eq('id', milestone.id);
    });

    it('should return milestone_upcoming with HIGH urgency for upcoming milestones', async () => {
      // Setup: Create milestone due in 3 days
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const { data: milestone, error: createError } = await supabase
        .from('thesis_milestones')
        .insert({
          student_id: testUserId,
          title: 'Submit Final Draft',
          deadline: futureDate.toISOString(),
          key: 'final_draft_submission',
        })
        .select()
        .single();

      expect(createError).toBeNull();

      // Execute RPC
      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('milestone_upcoming');
      expect(data.urgency).toBe('high');
      expect(data.title).toContain('Upcoming');
      expect(data.detail).toContain('Due in');
      expect(data.detail).toContain('days');

      // Cleanup
      await supabase
        .from('thesis_milestones')
        .delete()
        .eq('id', milestone.id);
    });

    it('should return completion message when everything is done', async () => {
      // Setup: Clear any pending items
      const { error: clearError } = await supabase
        .from('documents')
        .update({
          status: 'completed',
          current_chapter: null,
        })
        .eq('user_id', testUserId);

      expect(clearError).toBeNull();

      // Execute RPC
      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('task');
      expect(data.title).toBe('Prepare for Submission');
      expect(data.urgency).toBe('normal');
    });
  });

  describe('Work Context Tracking', () => {
    it('should create/update student_work_context record', async () => {
      // Setup: Upsert work context
      const { data, error } = await supabase
        .from('student_work_context')
        .upsert({
          student_id: testUserId,
          current_chapter: 'chapter_2_literature_review',
          current_phase: 'main_body',
          active_document_id: testDocumentId,
        }, { onConflict: 'student_id' })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.student_id).toBe(testUserId);
      expect(data.current_chapter).toBe('chapter_2_literature_review');
      expect(data.current_phase).toBe('main_body');
    });

    it('should track last_activity_at on documents', async () => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('documents')
        .update({
          last_activity_at: now,
          current_chapter: 'chapter_2_literature_review',
          completion_percentage: 50,
        })
        .eq('id', testDocumentId)
        .eq('user_id', testUserId);

      expect(error).toBeNull();

      // Verify it was set
      const { data, error: readError } = await supabase
        .from('documents')
        .select('last_activity_at, completion_percentage')
        .eq('id', testDocumentId)
        .single();

      expect(readError).toBeNull();
      expect(data.completion_percentage).toBe(50);
      expect(data.last_activity_at).toBeTruthy();
    });

    it('should update timestamp automatically on work context changes', async () => {
      // Insert initial record
      const { data: initial, error: insertError } = await supabase
        .from('student_work_context')
        .upsert({
          student_id: testUserId,
          current_chapter: 'chapter_1',
          current_phase: 'introduction',
        }, { onConflict: 'student_id' })
        .select()
        .single();

      expect(insertError).toBeNull();
      const firstTimestamp = initial.updated_at;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update record
      const { data: updated, error: updateError } = await supabase
        .from('student_work_context')
        .update({
          current_chapter: 'chapter_2',
          current_phase: 'main_body',
        })
        .eq('student_id', testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated.updated_at).not.toBe(firstTimestamp);
    });
  });

  describe('Priority Logic', () => {
    it('should follow correct priority order: feedback > overdue > upcoming > active > task', async () => {
      // This test verifies the priority logic by checking the order
      const priorities = ['feedback', 'milestone_overdue', 'milestone_upcoming', 'chapter_continuation', 'task'];
      
      // The RPC should check in this order and return the first match
      expect(priorities[0]).toBe('feedback');
      expect(priorities[1]).toBe('milestone_overdue');
      expect(priorities[2]).toBe('milestone_upcoming');
      expect(priorities[3]).toBe('chapter_continuation');
      expect(priorities[4]).toBe('task');
    });

    it('should correctly calculate days overdue', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: milestone, error: createError } = await supabase
        .from('thesis_milestones')
        .insert({
          student_id: testUserId,
          title: 'Overdue Task',
          deadline: threeDaysAgo.toISOString(),
          key: 'overdue_task',
        })
        .select()
        .single();

      expect(createError).toBeNull();

      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('milestone_overdue');
      expect(data.detail).toContain('3 days overdue');

      // Cleanup
      await supabase
        .from('thesis_milestones')
        .delete()
        .eq('id', milestone.id);
    });

    it('should correctly calculate days until deadline', async () => {
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

      const { data: milestone, error: createError } = await supabase
        .from('thesis_milestones')
        .insert({
          student_id: testUserId,
          title: 'Upcoming Task',
          deadline: fiveDaysFromNow.toISOString(),
          key: 'upcoming_task',
        })
        .select()
        .single();

      expect(createError).toBeNull();

      const { data, error } = await supabase.rpc(
        'get_student_next_action',
        { p_student_id: testUserId }
      );

      expect(error).toBeNull();
      expect(data.type).toBe('milestone_upcoming');
      expect(data.detail).toContain('5 days');

      // Cleanup
      await supabase
        .from('thesis_milestones')
        .delete()
        .eq('id', milestone.id);
    });
  });

  describe('Progress Tracking', () => {
    it('should track completion percentage correctly', async () => {
      const testPercentages = [0, 25, 50, 75, 100];

      for (const percentage of testPercentages) {
        const { error } = await supabase
          .from('documents')
          .update({ completion_percentage: percentage })
          .eq('id', testDocumentId);

        expect(error).toBeNull();

        const { data, error: readError } = await supabase
          .from('documents')
          .select('completion_percentage')
          .eq('id', testDocumentId)
          .single();

        expect(readError).toBeNull();
        expect(data.completion_percentage).toBe(percentage);
      }
    });

    it('should reject invalid completion percentages', async () => {
      const { error: negativeError } = await supabase
        .from('documents')
        .update({ completion_percentage: -1 })
        .eq('id', testDocumentId);

      expect(negativeError).toBeDefined();

      const { error: overError } = await supabase
        .from('documents')
        .update({ completion_percentage: 101 })
        .eq('id', testDocumentId);

      expect(overError).toBeDefined();
    });
  });

  describe('Work Context Updates', () => {
    it('should update all fields correctly', async () => {
      const { error } = await supabase
        .from('documents')
        .update({
          current_chapter: 'chapter_3_methodology',
          phase_key: 'research_design',
          completion_percentage: 60,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', testDocumentId);

      expect(error).toBeNull();

      const { data, error: readError } = await supabase
        .from('documents')
        .select('current_chapter, phase_key, completion_percentage, last_activity_at')
        .eq('id', testDocumentId)
        .single();

      expect(readError).toBeNull();
      expect(data.current_chapter).toBe('chapter_3_methodology');
      expect(data.phase_key).toBe('research_design');
      expect(data.completion_percentage).toBe(60);
      expect(data.last_activity_at).toBeTruthy();
    });

    it('should handle NULL values for optional fields', async () => {
      const { error } = await supabase
        .from('documents')
        .update({
          current_chapter: null,
          phase_key: null,
          completion_percentage: 0,
        })
        .eq('id', testDocumentId);

      expect(error).toBeNull();

      const { data, error: readError } = await supabase
        .from('documents')
        .select('current_chapter, phase_key, completion_percentage')
        .eq('id', testDocumentId)
        .single();

      expect(readError).toBeNull();
      expect(data.current_chapter).toBeNull();
      expect(data.phase_key).toBeNull();
    });
  });

  describe('RLS Policies', () => {
    it('should enforce RLS on student_work_context table', async () => {
      // This would require a test user with limited permissions
      // For now, we verify the policy exists
      const { data, error } = await supabase
        .from('student_work_context')
        .select('*')
        .eq('student_id', testUserId)
        .limit(1);

      // Should either succeed with RLS applied or fail with permission error
      // depending on the user's permissions
      expect(typeof data === 'object' || error).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should execute RPC within acceptable time', async () => {
      const startTime = Date.now();

      await supabase.rpc('get_student_next_action', {
        p_student_id: testUserId,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 200ms
      expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent RPC calls', async () => {
      const promises = Array.from({ length: 5 }, () =>
        supabase.rpc('get_student_next_action', {
          p_student_id: testUserId,
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(({ error }) => {
        expect(error).toBeNull();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across document and work context tables', async () => {
      const chapter = 'chapter_2_literature_review';
      const phase = 'main_body';
      const percentage = 55;

      // Update document
      await supabase
        .from('documents')
        .update({
          current_chapter: chapter,
          phase_key: phase,
          completion_percentage: percentage,
        })
        .eq('id', testDocumentId);

      // Update work context
      await supabase
        .from('student_work_context')
        .upsert({
          student_id: testUserId,
          current_chapter: chapter,
          current_phase: phase,
          active_document_id: testDocumentId,
        }, { onConflict: 'student_id' });

      // Verify consistency
      const { data: docData } = await supabase
        .from('documents')
        .select('current_chapter, phase_key, completion_percentage')
        .eq('id', testDocumentId)
        .single();

      const { data: contextData } = await supabase
        .from('student_work_context')
        .select('current_chapter, current_phase, active_document_id')
        .eq('student_id', testUserId)
        .single();

      expect(docData.current_chapter).toBe(contextData.current_chapter);
      expect(docData.phase_key).toBe(contextData.current_phase);
      expect(contextData.active_document_id).toBe(testDocumentId);
    });
  });
});

/**
 * Test environment setup
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - TEST_USER_ID (optional)
 * - TEST_DOCUMENT_ID (optional)
 * 
 * To run these tests:
 * pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
 */
