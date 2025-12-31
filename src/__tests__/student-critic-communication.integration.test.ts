/**
 * Integration Tests: Student-Critic Communication
 * Tests all components and RPC functions related to student-critic interactions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Student-Critic Communication Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let studentUser: any;
  let criticUser: any;
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

    const { data: critics } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'critic')
      .eq('is_demo_account', true)
      .limit(1);

    // Use demo users if they exist, otherwise use mock IDs
    studentUser = students?.[0] || { id: '00000000-0000-0000-0000-000000000003', email: 'demo-student@thesis.ai' };
    criticUser = critics?.[0] || { id: '00000000-0000-0000-0000-000000000004', email: 'demo-critic@thesis.ai' };
  });

  afterAll(async () => {
    // Cleanup test data
    if (relationshipId) {
      await supabase
        .from('critic_student_relationships')
        .delete()
        .eq('id', relationshipId);
    }
    if (testDocument?.id) {
      await supabase.from('documents').delete().eq('id', testDocument.id);
    }
  });

  describe('Critic-Student Relationship Management', () => {
    test('should create critic-student relationship', async () => {
      const { data, error } = await supabase
        .from('critic_student_relationships')
        .insert({
          critic_id: criticUser.id,
          student_id: studentUser.id,
          status: 'active',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.critic_id).toBe(criticUser.id);
      expect(data?.student_id).toBe(studentUser.id);
      expect(data?.status).toBe('active');

      relationshipId = data?.id;
    });

    test('should retrieve critic for student', async () => {
      const { data, error } = await supabase
        .from('critic_student_relationships')
        .select(`
          *,
          critic:profiles!critic_student_relationships_critic_id_fkey(
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
      expect(data?.critic_id).toBe(criticUser.id);
    });

    test('should retrieve students for critic', async () => {
      const { data, error } = await supabase
        .from('critic_student_relationships')
        .select(`
          *,
          student:profiles!critic_student_relationships_student_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('critic_id', criticUser.id)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThanOrEqual(1);
    });

    test('should prevent duplicate critic relationships', async () => {
      const { error } = await supabase
        .from('critic_student_relationships')
        .insert({
          critic_id: criticUser.id,
          student_id: studentUser.id,
          status: 'active',
        });

      // Should fail due to UNIQUE constraint
      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // unique_violation
    });
  });

  describe('Critic Review Workflow', () => {
    test('should create approved document ready for critic review', async () => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: studentUser.id,
          title: 'Test Thesis Final Draft',
          content: 'This is test content for critic review',
          status: 'approved', // Document approved by advisor, ready for critic
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.status).toBe('approved');

      testDocument = data;
    });

    test('should get students for critic review via RPC', async () => {
      const { data, error } = await supabase.rpc('get_students_for_critic_review', {
        p_critic_id: criticUser.id,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('student_id');
        expect(data[0]).toHaveProperty('document_id');
        expect(data[0]).toHaveProperty('document_title');
        expect(data[0]).toHaveProperty('approved_at');
      }
    });

    test('should get critic students details via RPC', async () => {
      const { data, error } = await supabase.rpc('get_critic_students_details', {
        p_critic_id: criticUser.id,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('student_id');
        expect(data[0]).toHaveProperty('first_name');
        expect(data[0]).toHaveProperty('email');
        expect(data[0]).toHaveProperty('total_documents');
        expect(data[0]).toHaveProperty('pending_reviews');
        expect(data[0].pending_reviews).toBeGreaterThanOrEqual(0);
      }
    });

    test('should submit critic review via RPC', async () => {
      if (!testDocument?.id) {
        throw new Error('Test document not created');
      }

      const { data, error } = await supabase.rpc('submit_critic_review', {
        p_document_id: testDocument.id,
        p_new_status: 'certified',
        p_comments: 'Excellent work. This thesis meets all quality standards.',
        p_fee: 250.0,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.success).toBe(true);
      expect(data?.review_id).toBeDefined();
    });

    test('should verify document status updated to certified', async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('status')
        .eq('id', testDocument.id)
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('certified');
    });

    test('should verify critic review record created', async () => {
      const { data, error } = await supabase
        .from('critic_reviews')
        .select('*')
        .eq('document_id', testDocument.id)
        .eq('critic_id', criticUser.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.review).toContain('quality standards');
      expect(data?.certification_status).toBe('certified');
      expect(data?.fee).toBe(250.0);
    });

    test('should create notification for student after critic review', async () => {
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

    test('should handle requesting revisions from critic', async () => {
      // Create another document for revision request
      const { data: doc } = await supabase
        .from('documents')
        .insert({
          user_id: studentUser.id,
          title: 'Test Document Needs Revision',
          content: 'This document needs improvements',
          status: 'approved',
        })
        .select()
        .single();

      if (doc?.id) {
        const { data, error } = await supabase.rpc('submit_critic_review', {
          p_document_id: doc.id,
          p_new_status: 'critic_revision_requested',
          p_comments:
            'Please improve the literature review section and add more citations.',
          p_fee: 0,
        });

        expect(error).toBeNull();
        expect(data?.success).toBe(true);

        // Verify status
        const { data: updated } = await supabase
          .from('documents')
          .select('status')
          .eq('id', doc.id)
          .single();

        expect(updated?.status).toBe('critic_revision_requested');

        // Cleanup
        await supabase.from('documents').delete().eq('id', doc.id);
      }
    });
  });

  describe('Critic Dashboard Analytics RPC', () => {
    test('should get critic dashboard analytics', async () => {
      const { data, error } = await supabase.rpc('get_critic_dashboard_analytics', {
        p_critic_id: criticUser.id,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data.total_students).toBe('number');
      expect(typeof data.pending_reviews).toBe('number');
      expect(typeof data.avg_turnaround_days).toBe('number');
      expect(typeof data.completed_this_month).toBe('number');
      expect(data.total_students).toBeGreaterThanOrEqual(1);
    });

    test('should track critic review completion rate', async () => {
      // Get total assigned students
      const { count: totalStudents } = await supabase
        .from('critic_student_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('critic_id', criticUser.id)
        .eq('status', 'active');

      // Get completed reviews
      const { count: completedReviews } = await supabase
        .from('critic_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('critic_id', criticUser.id);

      expect(totalStudents).toBeGreaterThanOrEqual(0);
      expect(completedReviews).toBeGreaterThanOrEqual(0);

      if (totalStudents && totalStudents > 0) {
        const completionRate = ((completedReviews || 0) / totalStudents) * 100;
        expect(completionRate).toBeGreaterThanOrEqual(0);
        expect(completionRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Critic Requests', () => {
    test('should create critic request', async () => {
      const { data, error } = await supabase
        .from('critic_requests')
        .insert({
          user_id: studentUser.id,
          status: 'pending',
          field_of_study: 'Computer Science',
          thesis_stage: 'final_review',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.status).toBe('pending');
    });

    test('should retrieve pending critic requests', async () => {
      const { data, error } = await supabase
        .from('critic_requests')
        .select('*')
        .eq('status', 'pending');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should approve critic request and assign critic', async () => {
      const { data: request } = await supabase
        .from('critic_requests')
        .select('id')
        .eq('user_id', studentUser.id)
        .eq('status', 'pending')
        .limit(1)
        .single();

      if (request?.id) {
        const { error } = await supabase
          .from('critic_requests')
          .update({
            status: 'approved',
            critic_id: criticUser.id,
          })
          .eq('id', request.id);

        expect(error).toBeNull();

        // Verify update
        const { data: updated } = await supabase
          .from('critic_requests')
          .select('status, critic_id')
          .eq('id', request.id)
          .single();

        expect(updated?.status).toBe('approved');
        expect(updated?.critic_id).toBe(criticUser.id);
      }
    });
  });

  describe('Critic Earnings and Fee Management', () => {
    test('should track critic review fees', async () => {
      const { data, error } = await supabase
        .from('critic_reviews')
        .select('fee')
        .eq('critic_id', criticUser.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        const totalEarnings = data.reduce(
          (sum, review) => sum + (review.fee || 0),
          0
        );
        expect(totalEarnings).toBeGreaterThanOrEqual(0);
      }
    });

    test('should verify fee recorded for certified document', async () => {
      const { data, error } = await supabase
        .from('critic_reviews')
        .select('fee, certification_status')
        .eq('document_id', testDocument.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.fee).toBe(250.0);
      expect(data?.certification_status).toBe('certified');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle submitting critic review for non-existent document', async () => {
      const fakeDocId = '00000000-0000-0000-0000-999999999999';

      const { data, error } = await supabase.rpc('submit_critic_review', {
        p_document_id: fakeDocId,
        p_new_status: 'certified',
        p_comments: 'This should fail',
        p_fee: 250.0,
      });

      // Should return error in JSON response
      expect(data?.success).toBe(false);
      expect(data?.error).toBeDefined();
    });

    test('should handle getting analytics for critic with no students', async () => {
      const fakeCriticId = '00000000-0000-0000-0000-999999999997';

      const { data, error } = await supabase.rpc('get_critic_dashboard_analytics', {
        p_critic_id: fakeCriticId,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.total_students).toBe(0);
      expect(data.pending_reviews).toBe(0);
    });

    test('should prevent duplicate critic reviews for same document', async () => {
      if (!testDocument?.id) {
        throw new Error('Test document not available');
      }

      const { error } = await supabase.from('critic_reviews').insert({
        critic_id: criticUser.id,
        student_id: studentUser.id,
        document_id: testDocument.id,
        review: 'Duplicate review attempt',
        certification_status: 'certified',
        fee: 250.0,
      });

      // Should fail - document already has a review from this critic
      expect(error).toBeDefined();
    });

    test('should enforce unique constraint on critic relationships', async () => {
      const { error } = await supabase
        .from('critic_student_relationships')
        .insert({
          critic_id: criticUser.id,
          student_id: studentUser.id,
          status: 'active',
        });

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // unique_violation
    });
  });

  describe('Cross-Communication Workflow', () => {
    test('should handle full document lifecycle: student -> advisor -> critic', async () => {
      const advisorId = '00000000-0000-0000-0000-000000000002';

      // 1. Student creates document
      const { data: newDoc } = await supabase
        .from('documents')
        .insert({
          user_id: studentUser.id,
          title: 'Full Lifecycle Test Document',
          content: 'Testing complete workflow',
          status: 'pending_review',
        })
        .select()
        .single();

      expect(newDoc).toBeDefined();

      // 2. Advisor reviews and approves
      if (newDoc?.id) {
        const { data: advisorReview } = await supabase.rpc('submit_document_review', {
          p_document_id: newDoc.id,
          p_advisor_id: advisorId,
          p_comments: 'Ready for critic review',
          p_new_status: 'approved',
        });

        expect(advisorReview?.success).toBe(true);

        // 3. Critic certifies
        const { data: criticReview } = await supabase.rpc('submit_critic_review', {
          p_document_id: newDoc.id,
          p_new_status: 'certified',
          p_comments: 'Final approval granted',
          p_fee: 300.0,
        });

        expect(criticReview?.success).toBe(true);

        // 4. Verify final status
        const { data: finalDoc } = await supabase
          .from('documents')
          .select('status')
          .eq('id', newDoc.id)
          .single();

        expect(finalDoc?.status).toBe('certified');

        // Cleanup
        await supabase.from('documents').delete().eq('id', newDoc.id);
      }
    });
  });
});
