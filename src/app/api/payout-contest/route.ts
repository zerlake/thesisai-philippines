import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuth } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the request body
    const body = await request.json();
    const { payout_request_id, reason } = body;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    if (!payout_request_id || !reason) {
      return Response.json({ error: 'Payout request ID and reason are required' }, { status: 400 });
    }

    // Check if the payout request exists and belongs to the user
    const { data: payoutRequest, error: payoutError } = await supabase
      .from('payout_requests')
      .select('status')
      .eq('id', payout_request_id)
      .eq('user_id', user.id)
      .single();

    if (payoutError || !payoutRequest) {
      return Response.json({ error: 'Payout request not found or does not belong to user' }, { status: 404 });
    }

    // Check if the payout request was actually rejected
    if (payoutRequest.status !== 'declined') {
      return Response.json({ error: 'Cannot contest a payout request that was not rejected' }, { status: 400 });
    }

    // Check if a contest already exists for this payout request
    const { data: existingContest } = await supabase
      .from('payout_contests')
      .select('id')
      .eq('payout_request_id', payout_request_id)
      .eq('user_id', user.id)
      .single();

    if (existingContest) {
      return Response.json({ error: 'A contest already exists for this payout request' }, { status: 409 });
    }

    // Create the contest
    const { data: newContest, error: contestError } = await supabase
      .from('payout_contests')
      .insert({
        payout_request_id,
        user_id: user.id,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (contestError) {
      console.error('Error creating payout contest:', contestError);
      return Response.json({ error: 'Failed to create contest' }, { status: 500 });
    }

    // Create a notification for admins about the new contest
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id, // This will be updated to admin user IDs in a real implementation
        title: 'Payout Contest Filed',
        message: `A user has contested a rejected payout request (ID: ${payout_request_id}). Please review.`,
        type: 'warning',
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error creating contest notification:', notificationError);
    }

    return Response.json({ 
      success: true, 
      data: newContest,
      message: 'Contest submitted successfully. Admins will review your request.'
    });
  } catch (error) {
    console.error('Error in payout contest API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}