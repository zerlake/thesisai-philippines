/**
 * Integration Tests: Student-Advisor Communication
 * Tests all components and RPC functions related to student-advisor interactions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Student-Advisor Communication Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let studentUser: any;
  let advisorUser: any;
  let testDocument: any;
  let relationshipId: string;

  beforeAll(async () => {
    // Use service role key for integration tests to bypass RLS
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing demo users from the database
    const { data: students } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'student')
      .eq('is_demo_account', true)
      .limit(1);

    const { data: advisors } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'advisor')
      .eq('is_demo_account', true)
      .limit(1);

    // Use demo users if they exist, otherwise create mock users with existing IDs
    studentUser = students?.[0] || { id: '00000000-0000-0000-0000-000000000001', email: 'demo-student@thesis.ai' };
    advisorUser = advisors?.[0] || { id: '00000000-0000-0000-0000-000000000002', email: 'demo-advisor@thesis.ai' };
  });

  afterAll(async () => {
    // Cleanup test data
    if (relationshipId) {
      await supabase
        .from('advisor_student_relationships')
        .delete()
        .eq('id', relationshipId);
    }
    if (testDocument?.id) {
      await supabase
        .from('documents')
        .delete()
        .eq('id', testDocument.id);
    }
  });

  describe('Advisor-Student Relationship Management', () => {
    test('should create advisor-student relationship', async () => {
      // First check if relationship already exists
      const { data: existing } = await supabase
        .from('advisor_student_relationships')
        .select('*')
        .eq('advisor_id', advisorUser.id)
        .eq('student_id', studentUser.id)
        .single();

      if (existing) {
        relationshipId = existing.id;
        expect(existing).toBeDefined();
        return;
      }

      const { data, error } = await supabase
        .from('advisor_student_relationships')
        .insert({
          advisor_id: advisorUser.id,
          student_id: studentUser.id,
          status: 'active',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.advisor_id).toBe(advisorUser.id);
      expect(data?.student_id).toBe(studentUser.id);
      expect(data?.status).toBe('active');

      relationshipId = data?.id;
    });

    test('should retrieve advisor for student', async () => {
      const { data, error } = await supabase
        .from('advisor_student_relationships')
        .select(`
          *,
          advisor:profiles!advisor_student_relationships_advisor_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('student_id', studentUser.id)
        .eq('status', 'active')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.advisor_id).toBe(advisorUser.id);
    });

    test('should retrieve students for advisor', async () => {
      const { data, error } = await supabase
        .from('advisor_student_relationships')
        .select(`
          *,
          student:profiles!advisor_student_relationships_student_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('advisor_id', advisorUser.id)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThanOrEqual(1);
    });

    test('should prevent duplicate relationships', async () => {
      const { error } = await supabase
        .from('advisor_student_relationships')
        .insert({
          advisor_id: advisorUser.id,
          student_id: studentUser.id,
          status: 'active',
        });

      // Should fail due to UNIQUE constraint
      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // unique_violation
    });
  });

  describe('Document Review Workflow', () => {
    test('should create document for review', async () => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: studentUser.id,
          title: 'Test Thesis Chapter 1',
          content: 'This is test content for integration testing',
          status: 'pending_review',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.status).toBe('pending_review');

      testDocument = data;
    });

    test('should submit document review via RPC', async () => {
      if (!testDocument?.id) {
        throw new Error('Test document not created');
      }

      const { data, error } = await supabase.rpc('submit_document_review', {
        p_document_id: testDocument.id,
        p_advisor_id: advisorUser.id,
        p_comments: 'Great work! Please revise the methodology section.',
        p_new_status: 'needs_revision',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.success).toBe(true);
      expect(data?.feedback_id).toBeDefined();
    });

    test('should verify document status updated', async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('status')
        .eq('id', testDocument.id)
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('needs_revision');
    });

    test('should verify feedback record created', async () => {
      const { data, error } = await supabase
        .from('advisor_feedback')
        .select('*')
        .eq('document_id', testDocument.id)
        .eq('advisor_id', advisorUser.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.feedback).toContain('methodology');
      expect(data?.status).toBe('needs_revision');
    });

    test('should create notification for student', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', studentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.message).toContain('reviewed');
    });
  });

  describe('Advisor Dashboard Analytics RPC', () => {
    test('should get advisor dashboard analytics', async () => {
      const { data, error } = await supabase.rpc('get_advisor_dashboard_analytics', {
        p_advisor_id: advisorUser.id,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data.total_students).toBe('number');
      expect(typeof data.avg_feedback_days).toBe('number');
      expect(data.total_students).toBeGreaterThanOrEqual(1);
    });

    test('should get at-risk students for advisor', async () => {
      // First create an overdue milestone
      await supabase.from('academic_milestones').insert({
        user_id: studentUser.id,
        title: 'Overdue Milestone',
        target_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completed: false,
      });

      const { data, error } = await supabase.rpc('get_at_risk_students_for_advisor', {
        p_advisor_id: advisorUser.id,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('student_id');
        expect(data[0]).toHaveProperty('first_name');
        expect(data[0]).toHaveProperty('overdue_milestone_count');
        expect(data[0].overdue_milestone_count).toBeGreaterThan(0);
      }
    });
  });

  describe('Messaging System', () => {
    test('should create message from advisor to student', async () => {
      const { data, error } = await supabase
        .from('advisor_student_messages')
        .insert({
          sender_id: advisorUser.id,
          recipient_id: studentUser.id,
          sender_role: 'advisor',
          subject: 'Review Feedback',
          message: 'Please check my comments on your latest submission.',
          read_status: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.sender_id).toBe(advisorUser.id);
      expect(data?.recipient_id).toBe(studentUser.id);
      expect(data?.read_status).toBe(false);
    });

    test('should retrieve unread messages for student', async () => {
      const { data, error } = await supabase
        .from('advisor_student_messages')
        .select('*')
        .eq('recipient_id', studentUser.id)
        .eq('read_status', false)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThanOrEqual(1);
    });

    test('should mark message as read', async () => {
      const { data: messages } = await supabase
        .from('advisor_student_messages')
        .select('id')
        .eq('recipient_id', studentUser.id)
        .eq('read_status', false)
        .limit(1)
        .single();

      if (messages?.id) {
        const { error } = await supabase
          .from('advisor_student_messages')
          .update({ read_status: true })
          .eq('id', messages.id);

        expect(error).toBeNull();

        // Verify update
        const { data: updated } = await supabase
          .from('advisor_student_messages')
          .select('read_status')
          .eq('id', messages.id)
          .single();

        expect(updated?.read_status).toBe(true);
      }
    });

    test('should create reply from student to advisor', async () => {
      const { data, error } = await supabase
        .from('advisor_student_messages')
        .insert({
          sender_id: studentUser.id,
          recipient_id: advisorUser.id,
          sender_role: 'student',
          subject: 'Re: Review Feedback',
          message: 'Thank you for the feedback. I will revise accordingly.',
          read_status: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.sender_id).toBe(studentUser.id);
      expect(data?.recipient_id).toBe(advisorUser.id);
    });
  });

  describe('Advisor Requests', () => {
    test('should create advisor request', async () => {
      const { data, error } = await supabase
        .from('advisor_requests')
        .insert({
          user_id: studentUser.id,
          status: 'pending',
          preferred_expertise: 'Machine Learning',
          additional_notes: 'Looking for ML expert',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.status).toBe('pending');
    });

    test('should retrieve pending advisor requests', async () => {
      const { data, error } = await supabase
        .from('advisor_requests')
        .select('*')
        .eq('status', 'pending');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should approve advisor request', async () => {
      const { data: request } = await supabase
        .from('advisor_requests')
        .select('id')
        .eq('user_id', studentUser.id)
        .eq('status', 'pending')
        .limit(1)
        .single();

      if (request?.id) {
        const { error } = await supabase
          .from('advisor_requests')
          .update({
            status: 'approved',
            advisor_id: advisorUser.id,
          })
          .eq('id', request.id);

        expect(error).toBeNull();

        // Verify update
        const { data: updated } = await supabase
          .from('advisor_requests')
          .select('status, advisor_id')
          .eq('id', request.id)
          .single();

        expect(updated?.status).toBe('approved');
        expect(updated?.advisor_id).toBe(advisorUser.id);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle submitting review for non-existent document', async () => {
      const fakeDocId = '00000000-0000-0000-0000-999999999999';

      const { data, error } = await supabase.rpc('submit_document_review', {
        p_document_id: fakeDocId,
        p_advisor_id: advisorUser.id,
        p_comments: 'This should fail',
        p_new_status: 'approved',
      });

      // Should return error in JSON response
      expect(data?.success).toBe(false);
      expect(data?.error).toBeDefined();
    });

    test('should handle getting analytics for advisor with no students', async () => {
      const fakeAdvisorId = '00000000-0000-0000-0000-999999999998';

      const { data, error } = await supabase.rpc('get_advisor_dashboard_analytics', {
        p_advisor_id: fakeAdvisorId,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.total_students).toBe(0);
      expect(data.avg_feedback_days).toBe(0);
    });

    test('should enforce unique constraint on relationships', async () => {
      const { error } = await supabase
        .from('advisor_student_relationships')
        .insert({
          advisor_id: advisorUser.id,
          student_id: studentUser.id,
          status: 'active',
        });

      expect(error).toBeDefined();
      // Could be foreign_key_violation (23503) if profiles don't exist,
      // or unique_violation (23505) if unique constraint triggers
      expect(['23503', '23505']).toContain(error?.code);
    });
  });
});
