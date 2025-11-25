import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Already added

/**
 * WebSocket Real-time API Handler
 * 
 * This endpoint handles WebSocket connections for real-time dashboard updates.
 * For Next.js App Router, we use a hybrid approach:
 * - WebSocket endpoint is handled by an external server or edge function
 * - This route provides REST endpoints for sync operations
 */

/**
 * GET /api/realtime
 * Health check and WebSocket endpoint information
 */
export async function GET(request: NextRequest) {
  try {
    // const supabase = createServerSupabaseClient(); // Remove this
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession(); // Remove this

    // if (!session) { // Remove this block
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const user = await getAuthenticatedUser(); // Add this line

    // Return WebSocket endpoint information
    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const host = request.headers.get('host') || 'localhost:3000';
    const wsUrl = `${protocol}://${host}/realtime`;

    return NextResponse.json({
      status: 'ready',
      wsUrl,
      userId: user.id, // Replace session.user.id with user.id
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in realtime health check:', error);
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

/**
 * POST /api/realtime
 * Sync pending operations and receive updates
 * Used as fallback when WebSocket is unavailable
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line

    const body = await request.json();
    const { operations, type } = body;

    if (type === 'SYNC') {
      // Process pending operations
      if (!Array.isArray(operations)) {
        return NextResponse.json(
          { error: 'Operations must be an array' },
          { status: 400 }
        );
      }

      const results: any[] = [];

      for (const op of operations) {
        try {
          const supabase = createServerSupabaseClient(); // Keep this line to pass supabase to helper functions
          const result = await processPendingOperation(supabase, user.id, op); // Replace session.user.id with user.id
          results.push(result);
        } catch (error) {
          console.error('Error processing operation:', error);
          results.push({
            operationId: op.operationId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in realtime sync:', error);
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Process a pending operation
 */
async function processPendingOperation(
  supabase: any,
  userId: string,
  operation: any
) {
  const { operationId, type, payload } = operation;

  // Handle different operation types
  switch (type) {
    case 'WIDGET_UPDATE':
      return await handleWidgetUpdate(supabase, userId, operationId, payload);

    case 'LAYOUT_UPDATE':
      return await handleLayoutUpdate(supabase, userId, operationId, payload);

    case 'WIDGET_DELETE':
      return await handleWidgetDelete(supabase, userId, operationId, payload);

    default:
      return {
        operationId,
        status: 'error',
        error: `Unknown operation type: ${type}`,
      };
  }
}

/**
 * Handle widget data update
 */
async function handleWidgetUpdate(
  supabase: any,
  userId: string,
  operationId: string,
  payload: any
) {
  try {
    const { widgetId, data } = payload;

    if (!widgetId || !data) {
      throw new Error('Missing widgetId or data in payload');
    }

    // Update widget cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { error } = await supabase.from('widget_data_cache').upsert(
      {
        widget_id: widgetId,
        user_id: userId,
        data,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, widget_id' }
    );

    if (error) throw error;

    return {
      operationId,
      status: 'success',
      type: 'WIDGET_UPDATE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      operationId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle layout update
 */
async function handleLayoutUpdate(
  supabase: any,
  userId: string,
  operationId: string,
  payload: any
) {
  try {
    const { layout } = payload;

    if (!layout) {
      throw new Error('Missing layout in payload');
    }

    // Update user preferences
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          dashboard_layout: layout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return {
      operationId,
      status: 'success',
      type: 'LAYOUT_UPDATE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      operationId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle widget deletion
 */
async function handleWidgetDelete(
  supabase: any,
  userId: string,
  operationId: string,
  payload: any
) {
  try {
    const { widgetId } = payload;

    if (!widgetId) {
      throw new Error('Missing widgetId in payload');
    }

    // Delete widget cache
    const { error } = await supabase
      .from('widget_data_cache')
      .delete()
      .eq('widget_id', widgetId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      operationId,
      status: 'success',
      type: 'WIDGET_DELETE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      operationId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
