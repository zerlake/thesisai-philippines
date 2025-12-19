import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission,
} from '@/lib/resend-notification';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { documentId, userId } = await request.json();

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, userId' },
        { status: 400 }
      );
    }

    // SECURITY: Verify that the authenticated user matches the userId or is an admin
    if (session.user.id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden - you can only submit your own documents' },
          { status: 403 }
        );
      }
    }

    // Fetch the document and verify ownership
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, title, user_id')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Update document status to submitted
    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update({ review_status: 'submitted' })
      .eq('id', documentId)
      .select();

    if (updateError) {
      console.error('Error updating document status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document status' },
        { status: 500 }
      );
    }

    // Fetch student info
    const { data: student } = await supabase
      .from('profiles')
      .select('id, full_name, name, email')
      .eq('id', userId)
      .single();

    const studentName = student?.full_name || student?.name || 'Student';
    const studentEmail = student?.email || '';

    // Fetch advisor(s) for this student
    const { data: advisorRels } = await supabase
      .from('advisor_student_relationships')
      .select('advisor_id')
      .eq('student_id', userId);

    // Send emails to advisors
    if (advisorRels && advisorRels.length > 0) {
      for (const rel of advisorRels) {
        const { data: advisor } = await supabase
          .from('profiles')
          .select('email, full_name, name')
          .eq('id', rel.advisor_id)
          .single();

        if (advisor?.email) {
          console.log(`[Submit] Sending notification to advisor: ${advisor.email}`);
          await notifyAdvisorOfSubmission(
            advisor.email,
            advisor.full_name || advisor.name || 'Advisor',
            studentName,
            doc.title || 'Untitled Document',
            documentId
          );
        }
      }
    }

    // Fetch critic(s) for this student
    const { data: criticRels } = await supabase
      .from('critic_student_relationships')
      .select('critic_id')
      .eq('student_id', userId);

    // Send emails to critics
    if (criticRels && criticRels.length > 0) {
      for (const rel of criticRels) {
        const { data: critic } = await supabase
          .from('profiles')
          .select('email, full_name, name')
          .eq('id', rel.critic_id)
          .single();

        if (critic?.email) {
          console.log(`[Submit] Sending notification to critic: ${critic.email}`);
          await notifyCriticOfSubmission(
            critic.email,
            critic.full_name || critic.name || 'Critic',
            studentName,
            doc.title || 'Untitled Document',
            documentId
          );
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error submitting document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit document' },
      { status: 500 }
    );
  }
}
