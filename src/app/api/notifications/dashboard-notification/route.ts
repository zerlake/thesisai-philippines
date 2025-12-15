import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail, sendStudentNotificationEmail } from '@/lib/resend-notification';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    const {
      type,
      recipientEmail,
      recipientName,
      senderName,
      senderRole,
      documentTitle = 'Document',
      groupName,
      message,
      actionUrl,
    } = event;

    // Validate required fields
    if (!recipientEmail || !senderName || !message || !actionUrl) {
      return NextResponse.json(
        { message: 'Missing required fields: recipientEmail, senderName, message, actionUrl' },
        { status: 400 }
      );
    }

    let result;

    // Send appropriate notification based on event type and sender role
    if (senderRole === 'student') {
      // Student sending to advisor or critic
      result = await sendNotificationEmail({
        to: recipientEmail,
        advisorName: recipientName,
        studentName: senderName,
        actionType: type as 'submission' | 'revision' | 'request' | 'milestone',
        documentTitle,
        message,
        actionUrl,
        actionButtonText: getActionButtonText(type),
      });
    } else if (senderRole === 'advisor' || senderRole === 'critic') {
      // Advisor or Critic sending to student
      result = await sendStudentNotificationEmail({
        to: recipientEmail,
        studentName: recipientName,
        senderName,
        senderRole: senderRole as 'advisor' | 'critic',
        actionType: type as 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message',
        documentTitle,
        message,
        actionUrl,
        actionButtonText: getActionButtonText(type),
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid sender role' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Notification sent successfully',
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard notification error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Dashboard notification API is ready',
    endpoint: 'POST /api/notifications/dashboard-notification',
    description: 'Send notifications to dashboard users (students, advisors, critics)',
  });
}

function getActionButtonText(type: string): string {
  switch (type) {
    case 'submission':
      return 'Review Document';
    case 'feedback':
      return 'View Feedback';
    case 'revision':
      return 'View Revision';
    case 'milestone':
      return 'View Progress';
    case 'group-activity':
      return 'View Group';
    default:
      return 'View Now';
  }
}
