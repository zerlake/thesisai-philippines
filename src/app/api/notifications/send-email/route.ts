import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { sendNotificationEmail, SendNotificationEmailProps } from '@/lib/resend-notification';
import { z } from 'zod';

// Validation schema
const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  advisorName: z.string().optional(),
  studentName: z.string().optional(),
  actionType: z.enum(['submission', 'revision', 'request', 'milestone']).optional(),
  documentTitle: z.string().optional(),
  message: z.string().optional(),
  actionUrl: z.string().url().optional(),
  actionButtonText: z.string().optional(),
});

/**
 * POST /api/notifications/send-email
 * Sends a notification email to an advisor
 * 
 * Request body:
 * {
 *   to: string;
 *   advisorName?: string;
 *   studentName?: string;
 *   actionType?: 'submission' | 'revision' | 'request' | 'milestone';
 *   documentTitle?: string;
 *   message?: string;
 *   actionUrl?: string;
 *   actionButtonText?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'notification',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/notifications/send-email', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const body = await request.json();
    let validatedData: z.infer<typeof sendEmailSchema>;

    try {
      validatedData = sendEmailSchema.parse(body);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'notification',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/notifications/send-email',
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

    // 3. Send the email
    const result = await sendNotificationEmail(validatedData as SendNotificationEmailProps);

    if (result.success) {
      // 4. Log successful notification
      await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
        userId,
        severity: AuditSeverity.INFO,
        resourceType: 'notification',
        resourceId: validatedData.to,
        statusCode: 200,
        details: { actionType: validatedData.actionType, recipientEmail: validatedData.to },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Email sent successfully',
          data: result.data,
        },
        { status: 200 }
      );
    } else {
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'notification',
        resourceId: validatedData.to,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/notifications/send-email', reason: 'Failed to send email', error: result.error },
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: 'EMAIL_FAILED',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'notification',
      ipAddress: request.ip,
      details: {
        endpoint: 'POST /api/notifications/send-email',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send-email
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Email notification API is ready',
    timestamp: new Date().toISOString(),
  });
}
