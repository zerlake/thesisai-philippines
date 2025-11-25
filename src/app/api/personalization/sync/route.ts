import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { syncChangeSchema } from '@/lib/personalization/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id
    const { searchParams } = new URL(request.url);
    const synced = searchParams.get('synced') === 'false' ? false : true;

    // Fetch sync changes
    let query = supabase
      .from('sync_changes')
      .select('*')
      .eq('user_id', userId);

    if (!synced) {
      query = query.eq('is_synced', false);
    }

    const { data: changes, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    return Response.json({ changes });
  } catch (error) {
    console.error('Error fetching sync changes:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return Response.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();

    // Validate request body
    try {
      syncChangeSchema.parse({
        userId,
        ...body,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: 'Invalid sync change format', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Insert sync change
    const { data: change, error } = await supabase
      .from('sync_changes')
      .insert({
        user_id: userId,
        device_id: body.deviceId,
        change_type: body.changeType,
        section: body.section,
        data: body.data,
        is_synced: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json(change, { status: 201 });
  } catch (error) {
    console.error('Error creating sync change:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return Response.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();
    const { changeIds } = body;

    if (!changeIds || !Array.isArray(changeIds)) {
      return Response.json(
        { error: 'changeIds array is required' },
        { status: 400 }
      );
    }

    // Mark changes as synced
    const { data: updated, error } = await supabase
      .from('sync_changes')
      .update({
        is_synced: true,
        sync_timestamp: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .in('id', changeIds)
      .select();

    if (error) {
      throw error;
    }

    return Response.json({ updated });
  } catch (error) {
    console.error('Error updating sync changes:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return Response.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
