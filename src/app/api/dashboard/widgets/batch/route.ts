import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { dashboardErrorHandler } from '@/lib/dashboard/api-error-handler';
import { dataSourceManager } from '@/lib/dashboard/data-source-manager';
import { widgetSchemas, validateWidgetData } from '@/lib/dashboard/widget-schemas';

/**
 * POST /api/dashboard/widgets/batch
 * Fetch data for multiple widgets in a single request
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();
    const { widgetIds = [], forceRefresh = false } = body;

    if (!Array.isArray(widgetIds) || widgetIds.length === 0) {
      return NextResponse.json(
        { error: 'widgetIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (widgetIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 widgets per batch request' },
        { status: 400 }
      );
    }

    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Process each widget in parallel
    await Promise.all(
      widgetIds.map(async (widgetId: string) => {
        try {
          // Validate widget ID format
          if (typeof widgetId !== 'string' || !widgetId.trim()) {
            errors[widgetId] = 'Invalid widget ID';
            return;
          }

          // Check if widget schema exists
          if (!widgetSchemas[widgetId as keyof typeof widgetSchemas]) {
            errors[widgetId] = `Unknown widget: ${widgetId}`;
            return;
          }

          // Try to get cached data first (unless force refresh)
          let cachedData = null;
          let isCached = false;

          if (!forceRefresh) {
            const { data: cached, error: cacheError } = await supabase
              .from('widget_data_cache')
              .select('data, expires_at')
              .eq('widget_id', widgetId)
              .eq('user_id', userId)
              .single();

            if (!cacheError && cached) {
              // Check if cache is still valid
              if (
                !cached.expires_at ||
                new Date(cached.expires_at) > new Date()
              ) {
                cachedData = cached.data;
                isCached = true;
              }
            }
          }

          // If we have valid cached data, use it
          if (isCached && cachedData) {
            results[widgetId] = {
              data: cachedData,
              cached: true,
              valid: true,
            };
            return;
          }

          // Fetch fresh data from data source manager
          const widgetData = await dataSourceManager.fetchWidgetData(
            widgetId,
            { userId } as any
          );

          // Validate the data
          const validation = validateWidgetData(
            widgetId as keyof typeof widgetSchemas,
            widgetData
          );

          // Cache the data (1 hour TTL)
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 1);

          supabase
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

          results[widgetId] = {
            data: widgetData,
            cached: false,
            valid: validation.valid,
            errors: validation.errors,
          };
        } catch (error) {
          console.error(`Error fetching widget ${widgetId}:`, error);
          errors[widgetId] =
            error instanceof Error
              ? error.message
              : 'Unknown error occurred';
        }
      })
    );

    // Prepare response
    const response: any = {
      success: Object.keys(errors).length === 0,
      results,
      timestamp: new Date().toISOString(),
    };

    if (Object.keys(errors).length > 0) {
      response.errors = errors;
    }

    // Return 207 Multi-Status if some widgets failed
    const statusCode = Object.keys(errors).length > 0 ? 207 : 200;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Error fetching batch widget data:', error);
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
    const message = dashboardErrorHandler.handleError(500, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: message.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboard/widgets/batch
 * Fetch multiple widgets using query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    // const supabase = createServerSupabaseClient(); // Not needed directly here, but for POST function.

    // const { // Remove this
    //   data: { session },
    // } = await supabase.auth.getSession(); // Remove this

    // if (!session) { // Remove this block
    //   const message = dashboardErrorHandler.handleError(401, new Error('Unauthorized'));
    //   return NextResponse.json(
    //     { error: message.message },
    //     { status: 401 }
    //   );
    // }

    const userId = user.id; // Replace session.user.id with user.id
    const searchParams = request.nextUrl.searchParams;
    const widgetIdsParam = searchParams.get('ids');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!widgetIdsParam) {
      return NextResponse.json(
        { error: 'ids query parameter is required (comma-separated)' },
        { status: 400 }
      );
    }

    const widgetIds = widgetIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (widgetIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid widget IDs provided' },
        { status: 400 }
      );
    }

    if (widgetIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 widgets per batch request' },
        { status: 400 }
      );
    }

    // Reuse POST logic via body
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ widgetIds, forceRefresh }),
      })
    );

    return response;
  } catch (error) {
    console.error('Error fetching batch widget data:', error);
    if (error instanceof AuthenticationError) { // Add this block
        return NextResponse.json(
            { error: error.message },
            { status: 401 }
        );
    }
    const message = dashboardErrorHandler.handleError(500, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: message.message },
      { status: 500 }
    );
  }
}
