import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission,
} from '@/lib/resend-notification';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { documentId, userId } = await request.json();

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, userId' },
        { status: 400 }
      );
    }

    // Fetch the document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, title, user_id')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
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
