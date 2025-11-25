import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { dashboardErrorHandler } from '@/lib/dashboard/api-error-handler';
import { getDefaultDashboardData } from '@/lib/dashboard/dashboard-defaults';
import { ZodError } from 'zod';

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

/**
 * GET /api/dashboard
 * Fetch user's current dashboard layout and all widget data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id
    const searchParams = request.nextUrl.searchParams;
    const widgetIds = searchParams.get('widgets')?.split(',') || [];

    // Fetch dashboard layout for user
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('dashboard_layout, dashboard_state')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      const message = dashboardErrorHandler.handleError(500, toError(prefError as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

    // Get default layout if no preferences exist
    let layout = preferences?.dashboard_layout || null;
    let state = preferences?.dashboard_state || null;

    if (!layout) {
      layout = getDefaultDashboardData().defaultLayout;
      state = getDefaultDashboardData().defaultState;
    }

    // Fetch widget data if requested
    let widgetData: Record<string, any> = {};
    if (widgetIds.length > 0) {
      for (const widgetId of widgetIds) {
        try {
          const { data, error } = await supabase
            .from('widget_data_cache')
            .select('data, expires_at')
            .eq('widget_id', widgetId)
            .eq('user_id', userId)
            .single();

          if (!error && data) {
            // Check if cache is still valid
            if (!data.expires_at || new Date(data.expires_at) > new Date()) {
              widgetData[widgetId] = data.data;
            } else {
              // Cache expired, fetch fresh data
              widgetData[widgetId] = null;
            }
          }
        } catch (err) {
          console.error(`Error fetching widget data for ${widgetId}:`, err);
          widgetData[widgetId] = null;
        }
      }
    }

    return NextResponse.json({
      success: true,
      layout,
      state,
      widgetData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return NextResponse.json(
            { error: error.message },
            { status: 401 }
        );
    }
    const message = dashboardErrorHandler.handleError(500, toError(error));
    return NextResponse.json(
      { error: message.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard
 * Save user's dashboard layout and state
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();

    const { layout, state, widgetData } = body;

    if (!layout) {
      return NextResponse.json(
        { error: 'Layout is required' },
        { status: 400 }
      );
    }

    // Upsert dashboard preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          dashboard_layout: layout,
          dashboard_state: state || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (prefError) {
      const message = dashboardErrorHandler.handleError(500, toError(prefError as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

    // Cache widget data if provided
    if (widgetData && typeof widgetData === 'object') {
      for (const [widgetId, data] of Object.entries(widgetData)) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour TTL

        await supabase.from('widget_data_cache').upsert(
          {
            widget_id: widgetId,
            user_id: userId,
            data,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, widget_id' }
        );
      }
    }

    return NextResponse.json({
      success: true,
      layout,
      state,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving dashboard:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return NextResponse.json(
            { error: error.message },
            { status: 401 }
        );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const message = dashboardErrorHandler.handleError(500, toError(error));
    return NextResponse.json(
      { error: message.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboard
 * Update specific dashboard settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();

    // Get current preferences
    const { data: current, error: fetchError } = await supabase
      .from('user_preferences')
      .select('dashboard_layout, dashboard_state')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Merge with existing data
    const updated = {
      user_id: userId,
      dashboard_layout: {
        ...(current?.dashboard_layout || {}),
        ...body.layout,
      },
      dashboard_state: {
        ...(current?.dashboard_state || {}),
        ...body.state,
      },
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('user_preferences')
      .upsert(updated, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      layout: result.dashboard_layout,
      state: result.dashboard_state,
    });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return NextResponse.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
