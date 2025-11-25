import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { dashboardErrorHandler } from '@/lib/dashboard/api-error-handler';
import { dataSourceManager } from '@/lib/dashboard/data-source-manager';
import { widgetSchemas, validateWidgetData } from '@/lib/dashboard/widget-schemas';

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

/**
 * GET /api/dashboard/widgets/[widgetId]
 * Fetch data for a specific widget
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id
    const { widgetId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Check if widget schema exists
    if (!widgetSchemas[widgetId as keyof typeof widgetSchemas]) {
      const message = dashboardErrorHandler.handleError(400, new Error(`Unknown widget: ${widgetId}`));
      return NextResponse.json(
        { error: `Unknown widget: ${widgetId}` },
        { status: 400 }
      );
    }

    // Try to get cached data first (unless force refresh)
    if (!forceRefresh) {
      const { data: cached, error: cacheError } = await supabase
        .from('widget_data_cache')
        .select('data, expires_at')
        .eq('widget_id', widgetId)
        .eq('user_id', userId)
        .single();

      if (!cacheError && cached) {
        // Check if cache is still valid
        if (!cached.expires_at || new Date(cached.expires_at) > new Date()) {
          return NextResponse.json({
            success: true,
            data: cached.data,
            cached: true,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Fetch fresh widget data from data source manager
    const widgetData = await dataSourceManager.fetchWidgetData(
      widgetId,
      { userId } as any
    );

    // Validate the data against widget schema
    const validation = validateWidgetData(
      widgetId as keyof typeof widgetSchemas,
      widgetData
    );

    if (!validation.valid) {
      console.warn(
        `Widget data validation failed for ${widgetId}:`,
        validation.errors
      );
      // Continue with unvalidated data but log warning
    }

    // Cache the widget data (1 hour TTL)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await supabase
      .from('widget_data_cache')
      .upsert(
        {
          widget_id: widgetId,
          user_id: userId,
          data: widgetData,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, widget_id' }
      );
    // Intentionally not awaiting - fire and forget for cache

    return NextResponse.json({
      success: true,
      widgetId,
      data: widgetData,
      cached: false,
      valid: validation.valid,
      errors: validation.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error fetching widget data:`, error);
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
 * POST /api/dashboard/widgets/[widgetId]
 * Update widget data or settings
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { widgetId } = await params;
    const body = await request.json();

    // Check if widget schema exists
    if (!widgetSchemas[widgetId as keyof typeof widgetSchemas]) {
      return NextResponse.json(
        { error: `Unknown widget: ${widgetId}` },
        { status: 400 }
      );
    }

    const { data, settings } = body;

    // Validate the data if provided
    if (data) {
      const validation = validateWidgetData(
        widgetId as keyof typeof widgetSchemas,
        data
      );

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Invalid widget data',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
    }

    // Store widget settings if provided
    if (settings) {
      const { data: updated, error } = await supabase
        .from('widget_settings')
        .upsert(
          {
            widget_id: widgetId,
            user_id: userId,
            settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, widget_id' }
        )
        .select()
        .single();

      if (error) {
        console.error(`Error updating widget settings for ${widgetId}:`, error);
        const message = dashboardErrorHandler.handleError(500, error);
        return NextResponse.json(
          { error: message.message },
          { status: 500 }
        );
      }
    }

    // Cache the data if provided
    if (data) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await supabase
        .from('widget_data_cache')
        .upsert(
          {
            widget_id: widgetId,
            user_id: userId,
            data,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, widget_id' }
        );
      // Intentionally not awaiting - fire and forget for cache
    }

    return NextResponse.json({
      success: true,
      widgetId,
      data,
      settings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating widget:`, error);
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
 * DELETE /api/dashboard/widgets/[widgetId]
 * Clear cached data for a widget
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { widgetId } = await params;

    // Delete cache entry
    const { error } = await supabase
      .from('widget_data_cache')
      .delete()
      .eq('widget_id', widgetId)
      .eq('user_id', userId);

    if (error) {
     console.error(`Error clearing cache for widget ${widgetId}:`, error);
     const message = dashboardErrorHandler.handleError(500, toError(error as unknown));
     return NextResponse.json(
       { error: message.message },
       { status: 500 }
     );
    }

    return NextResponse.json({
     success: true,
     widgetId,
     cleared: true,
     timestamp: new Date().toISOString(),
    });
    } catch (error) {
    console.error(`Error deleting widget:`, error);
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
