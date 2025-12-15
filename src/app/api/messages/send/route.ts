import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Helper to send email notification
async function sendEmailNotification(
  recipientEmail: string,
  senderRole: string,
  recipientRole: string,
  message: string,
  senderName: string,
  documentTitle: string
) {
  try {
    // Determine the correct endpoint and payload based on roles
    let endpoint = '';
    let payload: any = {
      to: recipientEmail,
      message: message.substring(0, 500),
      documentTitle: documentTitle || 'New Message',
    };

    if (senderRole === 'advisor' && recipientRole === 'student') {
      // Advisor sending message to student
      endpoint = '/api/notifications/send-advisor-email';
      payload = {
        ...payload,
        advisorName: senderName || 'Your Advisor',
        studentName: undefined,
        actionType: 'general-message',
        actionButtonText: 'View Message',
      };
    } else if (senderRole === 'student' && recipientRole === 'advisor') {
      // Student sending message to advisor
      endpoint = '/api/notifications/send-email';
      payload = {
        ...payload,
        studentName: senderName || 'Student',
        advisorName: undefined,
        actionType: 'request',
        actionButtonText: 'View Message',
      };
    } else if (senderRole === 'critic' && recipientRole === 'student') {
      // Critic sending message to student
      endpoint = '/api/notifications/send-advisor-email';
      payload = {
        ...payload,
        advisorName: senderName || 'Your Critic',
        studentName: undefined,
        actionType: 'feedback',
        actionButtonText: 'View Feedback',
      };
    } else {
      // Default case
      endpoint = '/api/notifications/send-email';
      payload = {
        ...payload,
        studentName: senderName || 'User',
        actionType: 'request',
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERNAL_API_KEY || '',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Email notification to ${endpoint} failed:`, error);
      // Don't fail the main request if email fails
    } else {
      console.log(`Email notification sent successfully to ${recipientEmail}`);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't fail the main request if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase not configured - missing environment variables');
      return NextResponse.json(
        { error: 'Supabase not configured', data: null },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { documentId, senderId, senderRole, recipientId, message, subject } =
      await request.json();

    // documentId is optional for advisors (they manage multiple documents)
    if (!senderId || !senderRole || !recipientId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, senderRole, recipientId, message' },
        { status: 400 }
      );
    }

    // Validate UUIDs, but allow demo student IDs for testing
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isDemoRecipient = recipientId === 'demo-student-1' || recipientId.includes('demo');
    const isDemoSender = senderId === 'demo-student-1' || senderId.includes('demo');

    if (!uuidRegex.test(senderId) && !isDemoSender) {
      return NextResponse.json(
        { error: 'Invalid senderId - must be a valid UUID from auth system' },
        { status: 400 }
      );
    }
    if (!uuidRegex.test(recipientId) && !isDemoRecipient) {
      return NextResponse.json(
        { error: 'Invalid recipientId - must be a valid UUID from auth system' },
        { status: 400 }
      );
    }

    // Validate documentId is a valid UUID if provided
    const validatedDocumentId = documentId && uuidRegex.test(documentId) ? documentId : null;

    console.log('Inserting message:', {
      documentId: validatedDocumentId,
      senderId,
      senderRole,
      recipientId,
      message,
      subject,
    });

    // Insert message into database
    const { data, error } = await supabase
      .from('advisor_student_messages')
      .insert([
        {
          document_id: validatedDocumentId,
          sender_id: senderId,
          sender_role: senderRole,
          recipient_id: recipientId,
          message,
          subject: subject || 'No subject',
        },
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to insert message' },
        { status: 500 }
      );
    }

    console.log('Message inserted successfully:', data);

    // Fetch recipient email and send notification
    try {
      let recipientData: any = null;
      let senderData: any = null;

      // Handle demo recipients differently
      if (isDemoRecipient) {
        // Use mock data for demo student
        recipientData = {
          email: 'student@demo.thesisai.local',
          name: 'Demo Student',
          role: 'user'
        };
      } else {
        // Fetch recipient profile from database using real UUID
        const recipientResult = await supabase
          .from('profiles')
          .select('email, name, role')
          .eq('id', recipientId)
          .single();
        recipientData = recipientResult.data;
      }

      // Handle demo senders differently
      if (isDemoSender) {
        // Use mock data for demo sender
        senderData = {
          full_name: 'Demo User',
          name: 'Demo User',
          role: 'user',
          email: 'demo@thesisai.local'
        };
      } else {
        // Fetch sender profile from database using real UUID
        const senderResult = await supabase
          .from('profiles')
          .select('full_name, name, role, email')
          .eq('id', senderId)
          .single();
        senderData = senderResult.data;
      }

      if (recipientData?.email) {
        // Determine recipient role
        const recipientRole = recipientData.role || 'unknown';
        const senderName = senderData?.full_name || senderData?.name || 'User';

        console.log('[Messages API] Sending email notification:', {
          to: recipientData.email,
          senderRole,
          recipientRole,
          senderName,
          subject
        });

        // Send email notification (async, don't wait)
        sendEmailNotification(
          recipientData.email,
          senderRole,
          recipientRole,
          message,
          senderName,
          subject || 'New Message'
        ).catch(err => console.error('Failed to send email:', err));
      } else {
        console.warn('Could not send email: recipient email not found');
      }
    } catch (emailError) {
      console.error('Error preparing email notification:', emailError);
      // Don't fail the main request if email prep fails
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
