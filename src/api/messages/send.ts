import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getRemainingRequests } from '@/lib/rate-limiter';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, logRateLimited, AuditAction, AuditSeverity } from '@/lib/audit-logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validation schema
const sendMessageSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  senderId: z.string().uuid('Invalid sender ID'),
  senderRole: z.enum(['student', 'advisor', 'critic']),
  recipientId: z.string().uuid('Invalid recipient ID'),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long'),
  subject: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'api_endpoint',
        resourceId: 'POST /api/messages/send',
        ipAddress: request.ip,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const {
      documentId,
      senderId,
      senderRole,
      recipientId,
      message,
      subject,
    } = validation.data;

    // Verify that authenticated user is the sender
    if (auth.userId !== senderId) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId: auth.userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'message',
        details: { reason: 'User attempted to send as different user' },
        ipAddress: request.ip,
      });
      return NextResponse.json(
        { error: 'Forbidden: Cannot send as another user' },
        { status: 403 }
      );
    }

    // Rate limiting: 60 messages per minute per user
    if (!checkRateLimit(auth.userId, 60, 60000)) {
      await logRateLimited(auth.userId, 'POST /api/messages/send', {
        ipAddress: request.ip,
        limit: 60,
        windowMs: 60000,
      });
      const { remaining, resetAt } = getRemainingRequests(auth.userId, 60, 60000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          remaining,
          resetAt: new Date(resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('advisor_student_messages')
      .insert([
        {
          document_id: documentId,
          sender_id: senderId,
          sender_role: senderRole,
          recipient_id: recipientId,
          message,
          subject: subject || null,
        },
      ])
      .select();

    if (error) {
      console.error('Message insert error:', error);
      await logAuditEvent(AuditAction.MESSAGE_SENT, {
        userId: auth.userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'message',
        resourceId: documentId,
        error: error.message,
        statusCode: 500,
      });
      return NextResponse.json(
        { error: error.message || 'Failed to send message' },
        { status: 500 }
      );
    }

    // Log successful message send
    await logAuditEvent(AuditAction.MESSAGE_SENT, {
      userId: auth.userId,
      severity: AuditSeverity.INFO,
      resourceType: 'message',
      resourceId: documentId,
      details: { recipientId, senderRole },
      statusCode: 200,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
