import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      senderId,
      senderRole,
      recipientId,
      message,
      subject,
    } = body;

    // Validate required fields
    if (!documentId || !senderId || !senderRole || !recipientId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate sender role
    if (!['student', 'advisor', 'critic'].includes(senderRole)) {
      return NextResponse.json(
        { error: 'Invalid sender role' },
        { status: 400 }
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
      return NextResponse.json(
        { error: error.message || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
