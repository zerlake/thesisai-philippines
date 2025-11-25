import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id
    const { section } = await params;

    // Fetch user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!preferences) {
      return Response.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    // Get specific section from preferences
    const sectionData = preferences[section.toLowerCase()];

    if (!sectionData) {
      return Response.json(
        { error: `Section '${section}' not found` },
        { status: 404 }
      );
    }

    return Response.json({ [section]: sectionData });
  } catch (error) {
    console.error('Error fetching preference section:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { section } = await params;
    const body = await request.json();

    // Fetch current preferences
    const { data: preferences, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!preferences) {
      return Response.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    // Update specific section
    const updateData = {
      ...preferences,
      [section.toLowerCase()]: body,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ [section]: updated[section.toLowerCase()] });
  } catch (error) {
    console.error('Error updating preference section:', error);
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
