import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail, SendNotificationEmailProps } from '@/lib/resend-notification';

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
  // SECURITY: Verify API key - required for all notification requests
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized - valid API key required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json() as SendNotificationEmailProps;

    // Validate required fields
    if (!body.to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendNotificationEmail(body);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email sent successfully',
          data: result.data,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
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
