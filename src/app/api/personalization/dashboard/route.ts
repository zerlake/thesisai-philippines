import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { dashboardLayoutSchema } from '@/lib/personalization/validation';
import { ZodError } from 'zod';

// Get all dashboard layouts for the user
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
    const { searchParams } = new URL(request.url);
    const defaultOnly = searchParams.get('default') === 'true';

    let query = supabase
      .from('user_preferences')
      .select('dashboard_layout')
      .eq('user_id', userId);

    const { data: preferences, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!preferences || !preferences.dashboard_layout) {
      return Response.json({
        layouts: [],
        default: null,
      });
    }

    const layouts = Array.isArray(preferences.dashboard_layout)
      ? preferences.dashboard_layout
      : [preferences.dashboard_layout];

    let resultLayouts = layouts;
    if (defaultOnly) {
      resultLayouts = layouts.filter((l: any) => l.isDefault);
    }

    const defaultLayout = layouts.find((l: any) => l.isDefault) || null;

    return Response.json({
      layouts: resultLayouts,
      default: defaultLayout,
    });
  } catch (error) {
    console.error('Error fetching dashboard layouts:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update dashboard layout
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
      dashboardLayoutSchema.parse({
        userId,
        ...body,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: 'Invalid dashboard layout format', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get current preferences
    const { data: preferences, error: fetchError } = await supabase
      .from('user_preferences')
      .select('dashboard_layout')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let layouts = preferences?.dashboard_layout || [];
    if (!Array.isArray(layouts)) {
      layouts = layouts ? [layouts] : [];
    }

    // Update or add layout
    const layoutIndex = layouts.findIndex((l: any) => l.id === body.id);
    if (layoutIndex >= 0) {
      layouts[layoutIndex] = {
        ...layouts[layoutIndex],
        ...body,
        updatedAt: new Date().toISOString(),
      };
    } else {
      layouts.push({
        ...body,
        id: body.id || `layout-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Update preferences
    const { data: updated, error } = await supabase
      .from('user_preferences')
      .update({
        dashboard_layout: layouts,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json(body);
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('id');

    if (!layoutId) {
      return Response.json(
        { error: 'Layout ID is required' },
        { status: 400 }
      );
    }

    // Get current preferences
    const { data: preferences, error: fetchError } = await supabase
      .from('user_preferences')
      .select('dashboard_layout')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    let layouts = preferences?.dashboard_layout || [];
    if (!Array.isArray(layouts)) {
      layouts = layouts ? [layouts] : [];
    }

    // Remove layout
    layouts = layouts.filter((l: any) => l.id !== layoutId);

    // Update preferences
    const { error } = await supabase
      .from('user_preferences')
      .update({
        dashboard_layout: layouts,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return Response.json({ success: true, deletedId: layoutId });
  } catch (error) {
    console.error('Error deleting dashboard layout:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
