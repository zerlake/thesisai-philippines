import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  notifyAdvisorOfSubmission,
  notifyCriticOfSubmission,
} from '@/lib/resend-notification';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Validation schema
const submitDocumentSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  userId: z.string().uuid('Invalid user ID'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/submit', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized - authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const authUserId = auth.userId;

    // 2. Parse and validate request body
    const requestBody = await request.json();
    let validatedData: z.infer<typeof submitDocumentSchema>;
    
    try {
      validatedData = submitDocumentSchema.parse(requestBody);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId: authUserId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/submit',
          reason: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined,
        },
      });
      return NextResponse.json(
        { 
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    const { documentId, userId } = validatedData;

    // 3. Initialize Supabase client
    const supabase = await createServerSupabaseClient();

    // 4. Authorization check: verify user can submit this document
    // User can only submit their own documents or be an admin
    if (authUserId !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUserId)
        .single();

      if (profile?.role !== 'admin') {
        await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
          userId: authUserId,
          severity: AuditSeverity.CRITICAL,
          resourceType: 'document',
          resourceId: documentId,
          ipAddress: request.ip,
          details: {
            endpoint: 'POST /api/documents/submit',
            reason: 'Unauthorized document submission attempt',
            targetUserId: userId,
          },
        });
        return NextResponse.json(
          { error: 'Forbidden - you can only submit your own documents', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // 5. Fetch the document and verify ownership
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, title, user_id')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !doc) {
      await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
        userId: authUserId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        resourceId: documentId,
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/submit',
          reason: 'Document not found or access denied',
        },
      });
      return NextResponse.json(
        { error: 'Document not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 6. Update document status to submitted
    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update({ review_status: 'submitted' })
      .eq('id', documentId)
      .select();

    if (updateError) {
      console.error('Error updating document status:', updateError);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId: authUserId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document',
        resourceId: documentId,
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/submit',
          reason: 'Failed to update document status',
        },
      });
      return NextResponse.json(
        { error: 'Failed to update document status', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // Log submission
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId: authUserId,
      severity: AuditSeverity.INFO,
      resourceType: 'document',
      resourceId: documentId,
      statusCode: 200,
      details: {
        title: doc.title,
        reviewStatus: 'submitted',
      },
    });

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

    // 7. Send emails to advisors
    if (advisorRels && advisorRels.length > 0) {
      for (const rel of advisorRels) {
        const { data: advisor } = await supabase
          .from('profiles')
          .select('email, full_name, name')
          .eq('id', rel.advisor_id)
          .single();

        if (advisor?.email) {
          console.log(`[Submit] Sending notification to advisor: ${advisor.email}`);
          try {
            await notifyAdvisorOfSubmission(
              advisor.email,
              advisor.full_name || advisor.name || 'Advisor',
              studentName,
              doc.title || 'Untitled Document',
              documentId
            );
          } catch (error) {
            console.warn(`Failed to notify advisor ${advisor.email}:`, error);
            // Don't fail the entire request if email fails
          }
        }
      }
    }

    // 8. Fetch critic(s) for this student
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
          try {
            await notifyCriticOfSubmission(
              critic.email,
              critic.full_name || critic.name || 'Critic',
              studentName,
              doc.title || 'Untitled Document',
              documentId
            );
          } catch (error) {
            console.warn(`Failed to notify critic ${critic.email}:`, error);
            // Don't fail the entire request if email fails
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error submitting document:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'document',
      ipAddress: request?.ip,
      details: {
        endpoint: 'POST /api/documents/submit',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit document', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
