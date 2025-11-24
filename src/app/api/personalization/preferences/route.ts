import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { userPreferencesSchema } from '@/lib/personalization/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!preferences) {
      return Response.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    return Response.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    try {
      userPreferencesSchema.parse({
        userId,
        ...body,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: 'Invalid preferences format', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Update preferences
    const { data: updated, error } = await supabase
      .from('user_preferences')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json(updated);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
