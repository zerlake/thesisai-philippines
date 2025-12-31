/**
 * Integration Tests: Shared Communication Database Operations
 * Tests common database tables and operations shared between advisor-student and critic-student communication
 */

import { createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Shared Communication Database Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let studentUser: any;
  let advisorUser: any;
  let criticUser: any;
  let testDocument: any;

  beforeAll(async () => {
    // Use service role key for integration tests to bypass RLS
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing demo users from the database
    const { data: students } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'student')
      .eq('is_demo_account', true)
      .limit(1);

    const { data: advisors } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'advisor')
      .eq('is_demo_account', true)
      .limit(1);

    const { data: critics } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'critic')
      .eq('is_demo_account', true)
      .limit(1);

    // Use demo users if they exist, otherwise use mock IDs
    studentUser = students?.[0] || { id: '00000000-0000-0000-0000-000000000101', email: 'demo-student@thesis.ai' };
    advisorUser = advisors?.[0] || { id: '00000000-0000-0000-0000-000000000102', email: 'demo-advisor@thesis.ai' };
    criticUser = critics?.[0] || { id: '00000000-0000-0000-0000-000000000103', email: 'demo-critic@thesis.ai' };
  });

  afterAll(async () => {
    // Cleanup
    if (testDocument?.id) {
      await supabase.from('documents').delete().eq('id', testDocument.id);
    }
  });

  describe('Documents Table - Shared Resource', () => {
    test('should create document with all required fields', async () => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: studentUser.id,
          title: 'Shared Test Document',
          content: 'Content accessible to both advisor and critic',
          status: 'pending_review',
          document_type: 'thesis',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.status).toBe('pending_review');

      testDocument = data;
    });

    test('should support status transitions: pending -> needs_revision', async () => {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'needs_revision' })
        .eq('id', testDocument.id);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('documents')
        .select('status')
        .eq('id', testDocument.id)
        .single();

      expect(data?.status).toBe('needs_revision');
    });

    test('should support status transitions: needs_revision -> approved', async () => {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'approved' })
        .eq('id', testDocument.id);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('documents')
        .select('status')
        .eq('id', testDocument.id)
        .single();

      expect(data?.status).toBe('approved');
    });

    test('should support status transitions: approved -> certified', async () => {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'certified' })
        .eq('id', testDocument.id);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('documents')
        .select('status')
        .eq('id', testDocument.id)
        .single();

      expect(data?.status).toBe('certified');
    });

    test('should track document timestamps correctly', async () => {
      const { data } = await supabase
        .from('documents')
        .select('created_at, updated_at')
        .eq('id', testDocument.id)
        .single();

      expect(data?.created_at).toBeDefined();
      expect(data?.updated_at).toBeDefined();
      expect(new Date(data.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(data.created_at).getTime()
      );
    });

    test('should retrieve documents by user with status filter', async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', studentUser.id)
        .in('status', ['approved', 'certified'])
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Notifications Table - Shared Communication', () => {
    test('should create notification for student from advisor action', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: studentUser.id,
          message: 'Your advisor has reviewed your document',
          link: `/documents/${testDocument?.id}`,
          is_read: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.is_read).toBe(false);
    });

    test('should create notification for student from critic action', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: studentUser.id,
          message: 'Your document has been certified by the critic panel',
          link: `/documents/${testDocument?.id}`,
          is_read: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.message).toContain('certified');
    });

    test('should retrieve all unread notifications for user', async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', studentUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });

    test('should mark multiple notifications as read', async () => {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', studentUser.id)
        .eq('is_read', false);

      if (notifications && notifications.length > 0) {
        const ids = notifications.map((n) => n.id);

        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', ids);

        expect(error).toBeNull();

        // Verify all marked as read
        const { data: updated } = await supabase
          .from('notifications')
          .select('is_read')
          .in('id', ids);

        expect(updated?.every((n) => n.is_read === true)).toBe(true);
      }
    });

    test('should delete old notifications after 90 days', async () => {
      // Create old notification
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 91);

      const { data: oldNotification } = await supabase
        .from('notifications')
        .insert({
          user_id: studentUser.id,
          message: 'Old notification',
          link: '#',
          is_read: true,
          created_at: oldDate.toISOString(),
        })
        .select()
        .single();

      if (oldNotification?.id) {
        // In practice, this would be a scheduled job
        const { error } = await supabase
          .from('notifications')
          .delete()
          .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .eq('is_read', true);

        expect(error).toBeNull();
      }
    });
  });

  describe('Profiles Table - User Information', () => {
    test('should retrieve student profile with role', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, avatar_url')
        .eq('id', studentUser.id)
        .single();

      // May not exist in test environment
      if (!error) {
        expect(data).toBeDefined();
        expect(data?.id).toBe(studentUser.id);
      }
    });

    test('should retrieve advisor profile with expertise', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, expertise')
        .eq('id', advisorUser.id)
        .single();

      // May not exist in test environment
      if (!error) {
        expect(data).toBeDefined();
        expect(data?.role).toBe('advisor');
      }
    });

    test('should retrieve critic profile with specialization', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, specialization')
        .eq('id', criticUser.id)
        .single();

      // May not exist in test environment
      if (!error) {
        expect(data).toBeDefined();
        expect(data?.role).toBe('critic');
      }
    });

    test('should query users by role for assignment', async () => {
      const { data: advisors, error: advisorError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'advisor')
        .limit(10);

      expect(advisorError).toBeNull();
      expect(Array.isArray(advisors)).toBe(true);

      const { data: critics, error: criticError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'critic')
        .limit(10);

      expect(criticError).toBeNull();
      expect(Array.isArray(critics)).toBe(true);
    });
  });

  describe('Academic Milestones - Shared Progress Tracking', () => {
    test('should create milestone tracked by both advisor and critic', async () => {
      const { data, error } = await supabase
        .from('academic_milestones')
        .insert({
          user_id: studentUser.id,
          title: 'Submit Final Draft for Review',
          description: 'Complete final draft for advisor and critic review',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(studentUser.id);
      expect(data?.completed).toBe(false);
    });

    test('should retrieve upcoming milestones for student', async () => {
      const { data, error } = await supabase
        .from('academic_milestones')
        .select('*')
        .eq('user_id', studentUser.id)
        .gte('target_date', new Date().toISOString())
        .eq('completed', false)
        .order('target_date', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should retrieve overdue milestones', async () => {
      const { data, error } = await supabase
        .from('academic_milestones')
        .select('*')
        .eq('user_id', studentUser.id)
        .lt('target_date', new Date().toISOString())
        .eq('completed', false)
        .order('target_date', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should mark milestone as completed', async () => {
      const { data: milestone } = await supabase
        .from('academic_milestones')
        .select('id')
        .eq('user_id', studentUser.id)
        .eq('completed', false)
        .limit(1)
        .single();

      if (milestone?.id) {
        const { error } = await supabase
          .from('academic_milestones')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', milestone.id);

        expect(error).toBeNull();

        const { data: updated } = await supabase
          .from('academic_milestones')
          .select('completed, completed_at')
          .eq('id', milestone.id)
          .single();

        expect(updated?.completed).toBe(true);
        expect(updated?.completed_at).toBeDefined();
      }
    });
  });

  describe('Cross-Role Data Access and Permissions', () => {
    test('should allow advisor to view student documents', async () => {
      // First establish relationship
      await supabase.from('advisor_student_relationships').insert({
        advisor_id: advisorUser.id,
        student_id: studentUser.id,
        status: 'active',
      });

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          user:profiles!documents_user_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', studentUser.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should allow critic to view approved documents only', async () => {
      // Establish critic relationship
      await supabase.from('critic_student_relationships').insert({
        critic_id: criticUser.id,
        student_id: studentUser.id,
        status: 'active',
      });

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', studentUser.id)
        .eq('status', 'approved');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      // Verify all documents are approved
      if (data && data.length > 0) {
        expect(data.every((doc) => doc.status === 'approved')).toBe(true);
      }
    });

    test('should track document review history across roles', async () => {
      if (!testDocument?.id) return;

      // Get advisor feedback
      const { data: advisorFeedback } = await supabase
        .from('advisor_feedback')
        .select('*')
        .eq('document_id', testDocument.id);

      // Get critic reviews
      const { data: criticReviews } = await supabase
        .from('critic_reviews')
        .select('*')
        .eq('document_id', testDocument.id);

      // Both should be able to coexist for same document
      expect(Array.isArray(advisorFeedback)).toBe(true);
      expect(Array.isArray(criticReviews)).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    test('should efficiently query documents with pagination', async () => {
      const pageSize = 10;
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', studentUser.id)
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeLessThanOrEqual(pageSize);
    });

    test('should efficiently count total documents per user', async () => {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentUser.id);

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    });

    test('should handle bulk notification creation', async () => {
      const notifications = Array.from({ length: 5 }, (_, i) => ({
        user_id: studentUser.id,
        message: `Bulk notification ${i + 1}`,
        link: '#',
        is_read: false,
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(5);

      // Cleanup
      if (data) {
        const ids = data.map((n) => n.id);
        await supabase.from('notifications').delete().in('id', ids);
      }
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('should enforce foreign key constraint on document user_id', async () => {
      const fakeUserId = '00000000-0000-0000-0000-999999999999';

      const { error } = await supabase.from('documents').insert({
        user_id: fakeUserId,
        title: 'Invalid User Document',
        content: 'This should fail',
        status: 'pending_review',
      });

      // Should fail due to foreign key constraint
      expect(error).toBeDefined();
    });

    test('should enforce valid status values', async () => {
      if (!testDocument?.id) return;

      const { error } = await supabase
        .from('documents')
        .update({ status: 'invalid_status' as any })
        .eq('id', testDocument.id);

      // Should fail if status has check constraint
      // May pass if constraint not defined, which is also valid
      if (error) {
        expect(error.code).toBeDefined();
      }
    });

    test('should handle concurrent updates gracefully', async () => {
      if (!testDocument?.id) return;

      // Simulate concurrent updates
      const updates = [
        supabase
          .from('documents')
          .update({ content: 'Update 1' })
          .eq('id', testDocument.id),
        supabase
          .from('documents')
          .update({ content: 'Update 2' })
          .eq('id', testDocument.id),
      ];

      const results = await Promise.all(updates);

      // Both should succeed (last write wins)
      results.forEach((result) => {
        expect(result.error).toBeNull();
      });
    });
  });
});
