import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

// Demo user UUIDs - demo users get special authorization as admin avatars
const DEMO_USER_UUIDS: Record<string, string> = {
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7': 'student',    // demo-student@thesis.ai
  'ff79d401-5614-4de8-9f17-bc920f360dcf': 'advisor',    // demo-advisor@thesis.ai
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02': 'critic',     // demo-critic@thesis.ai
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7': 'admin',      // demo-admin@thesis.ai
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body first (can only be done once)
    const requestBody = await request.json();
    const { documentId, senderId, senderRole, recipientId, message, subject, demoAuthToken } = requestBody;

    console.log('[Messages API] Received POST request');
    console.log('[Messages API] Request body:', {
      senderId,
      senderRole,
      recipientId,
      messageLength: message?.length,
      hasDocumentId: !!documentId,
      hasDemoToken: !!demoAuthToken
    });

    // Get authenticated user from session
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();

    console.log('[Messages API] Headers:', {
      authorization: request.headers.get('authorization') ? 'Present' : 'Missing',
      cookie: request.headers.get('cookie') ? 'Present' : 'Missing'
    });
    console.log('[Messages API] Session:', session ? `Active (${session.user?.id})` : 'No session');

    // Check if senderId is a demo user (has special authorization)
    const isDemoUser = senderId && Object.prototype.hasOwnProperty.call(DEMO_USER_UUIDS, senderId);
    const demoUserRole = isDemoUser ? DEMO_USER_UUIDS[senderId as keyof typeof DEMO_USER_UUIDS] : null;

    // Demo users don't need a session - they have built-in authorization as admin avatars
    // Regular users MUST have a valid Supabase session
    if (!isDemoUser && !session) {
      console.error('[Messages API] No session found for non-demo user');
      return NextResponse.json(
        { error: 'Unauthorized - authentication required', data: null },
        { status: 401 }
      );
    }

    if (isDemoUser) {
      console.log('[Messages API] Demo user detected with built-in authorization:', { 
        senderId, 
        demoRole: demoUserRole 
      });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Messages API] Supabase not configured - missing environment variables');
      console.error('[Messages API] NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('[Messages API] SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return NextResponse.json(
        { error: 'Supabase not configured', data: null },
        { status: 500 }
      );
    }

    console.log('[Messages API] Creating Supabase client with service role key');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );
    console.log('[Messages API] Supabase client created successfully');

    console.log('[Messages API] Session user ID:', session?.user?.id);

    // documentId is optional for advisors (they manage multiple documents)
    if (!senderId || !senderRole || !recipientId || !message) {
      console.error('[Messages API] Missing required fields:', {
        senderId: !!senderId,
        senderRole: !!senderRole,
        recipientId: !!recipientId,
        message: !!message
      });
      return NextResponse.json(
        { error: 'Missing required fields: senderId, senderRole, recipientId, message' },
        { status: 400 }
      );
    }

    // SECURITY: Validate senderRole is one of the allowed values
    // Database constraint only allows: 'student', 'advisor', 'critic'
    // NOTE: Admin users should not use this API - they use admin-specific channels
    const ALLOWED_ROLES = ['student', 'advisor', 'critic'];
    if (!ALLOWED_ROLES.includes(senderRole)) {
      console.error('[Messages API] Invalid senderRole:', { 
        senderRole, 
        allowed: ALLOWED_ROLES,
        note: senderRole === 'admin' ? 'Admin users should use admin messaging API' : 'Unknown role'
      });
      return NextResponse.json(
        { error: `Invalid senderRole. Allowed: ${ALLOWED_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // SECURITY: Verify authenticated user matches senderId to prevent sender spoofing
    // For session users: verify senderId matches session user ID
    // For demo users: they already have authorization via DEMO_USER_UUIDS
    if (session && session.user.id !== senderId) {
      console.error('[Messages API] User ID mismatch:', {
        sessionUserId: session.user.id,
        senderId,
        match: session.user.id === senderId
      });
      return NextResponse.json(
        { error: 'Forbidden - you can only send messages as yourself' },
        { status: 403 }
      );
    }

    // SECURITY: Validate that senderId and recipientId are valid UUIDs (no path traversal or injection)
    // This prevents attackers from using special characters or paths in IDs

    // Validate UUIDs - demo users are already validated via DEMO_USER_UUIDS
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isDemoRecipient = recipientId && Object.prototype.hasOwnProperty.call(DEMO_USER_UUIDS, recipientId);

    if (!isDemoUser && !uuidRegex.test(senderId)) {
      return NextResponse.json(
        { error: 'Invalid senderId - must be a valid UUID from auth system' },
        { status: 400 }
      );
    }
    if (!isDemoRecipient && !uuidRegex.test(recipientId)) {
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
    console.log('[Messages API] Attempting to insert message into advisor_student_messages table');
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
      console.error('[Messages API] Database error:', error);
      console.error('[Messages API] Error code:', error.code);
      console.error('[Messages API] Error message:', error.message);
      console.error('[Messages API] Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.message || 'Failed to insert message' },
        { status: 500 }
      );
    }
    
    console.log('[Messages API] Message inserted successfully');

    console.log('Message inserted successfully:', data);

    // Fetch recipient email and send notification
    try {
      let recipientData: any = null;
      let senderData: any = null;

      // Handle demo recipients differently
      if (isDemoRecipient) {
        // Use mock data for demo recipient
        const recipientRole = DEMO_USER_UUIDS[recipientId as keyof typeof DEMO_USER_UUIDS];
        if (recipientRole) {
          const roleCapitalized = recipientRole.charAt(0).toUpperCase() + recipientRole.slice(1);
          recipientData = {
            email: `demo-${recipientRole}@thesis.ai`,
            name: `Demo ${roleCapitalized}`,
            role: recipientRole
          };
        } else {
          console.warn('[Messages API] Demo recipient not found in DEMO_USER_UUIDS:', recipientId);
          recipientData = null;
        }
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
      if (isDemoUser && demoUserRole) {
        // Use mock data for demo sender
        const roleCapitalized = demoUserRole.charAt(0).toUpperCase() + demoUserRole.slice(1);
        senderData = {
          full_name: `Demo ${roleCapitalized}`,
          name: `Demo ${roleCapitalized}`,
          role: demoUserRole,
          email: `demo-${demoUserRole}@thesis.ai`
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
    console.error('[Messages API] Caught error:', error);
    console.error('[Messages API] Error type:', typeof error);
    if (error instanceof Error) {
      console.error('[Messages API] Error message:', error.message);
      console.error('[Messages API] Error stack:', error.stack);
    } else {
      console.error('[Messages API] Error value:', JSON.stringify(error, null, 2));
    }
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Internal server error');
    return NextResponse.json(
      { error: errorMessage || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
