import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase not configured - missing environment variables');
      return NextResponse.json(
        { error: 'Supabase not configured', data: [] },
        { status: 200 } // Return 200 with empty data instead of error
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const userId = searchParams.get('userId');
    const recipientId = searchParams.get('recipientId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check if this is a demo user
    const isDemoUser = userId === 'demo-student-1' || userId.includes('demo');
    const queryUserId = isDemoUser ? 'demo-student-1' : userId;

    let query = supabase
      .from('advisor_student_messages')
      .select('*')
      .or(`sender_id.eq.${queryUserId},recipient_id.eq.${queryUserId}`);

    // If documentId is provided and is a valid UUID, filter by it
    // Skip if documentId is a slug like "chapter-1-main"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (documentId && uuidRegex.test(documentId)) {
      query = query.eq('document_id', documentId);
    }

    // If recipientId is provided, filter to messages between these two users
    if (recipientId) {
      const isDemoRecipient = recipientId === 'demo-student-1' || recipientId.includes('demo');
      const queryRecipientId = isDemoRecipient ? 'demo-student-1' : recipientId;

      query = query.or(
        `and(sender_id.eq.${queryUserId},recipient_id.eq.${queryRecipientId}),and(sender_id.eq.${queryRecipientId},recipient_id.eq.${queryUserId})`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      // Return empty data instead of error to prevent UI breakage
      return NextResponse.json(
        { error: error.message, data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Return empty data instead of error to prevent UI breakage
    return NextResponse.json(
      { error: 'Internal server error', data: [] },
      { status: 200 }
    );
  }
}
