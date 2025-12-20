import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { dataSourceManager } from '@/lib/dashboard/data-source-manager';
import { widgetSchemas, validateWidgetData } from '@/lib/dashboard/widget-schemas';

/**
 * GET /api/dashboard/widgets/[widgetId]
 * Fetch data for a specific widget
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_widget',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/dashboard/widgets/[widgetId]', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;
    const { widgetId } = await params;

    // 2. Initialize Supabase client
    const supabase = await createServerClient();

    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 3. Check if widget schema exists
    if (!widgetSchemas[widgetId as keyof typeof widgetSchemas]) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_widget',
        resourceId: widgetId,
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/dashboard/widgets/[widgetId]', reason: 'Unknown widget' },
      });
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: { widget: 'unknown' } },
        { status: 400 }
      );
    }

    // 4. Try to get cached data first (unless force refresh)
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
          await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
            userId,
            severity: AuditSeverity.INFO,
            resourceType: 'dashboard_widget',
            resourceId: widgetId,
            statusCode: 200,
            details: { cached: true },
          });
          return NextResponse.json({
            success: true,
            data: cached.data,
            cached: true,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Fetch fresh widget data from data source manager
    const widgetData = await dataSourceManager.fetchWidgetData(
      widgetId,
      { userId } as any
    );

    // 6. Validate the data against widget schema
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

    // 7. Cache the widget data (1 hour TTL)
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

    // 8. Log successful access
    await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_widget',
      resourceId: widgetId,
      statusCode: 200,
      details: { cached: false, valid: validation.valid },
    });

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
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_widget',
      ipAddress: request.ip,
      details: {
        endpoint: 'GET /api/dashboard/widgets/[widgetId]',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
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
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_widget',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/dashboard/widgets/[widgetId]', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;
    const { widgetId } = await params;

    // 2. Initialize Supabase client
    const supabase = await createServerClient();

    // 3. Parse and validate request body
    const body = await request.json();
    const { data, settings } = body;

    // 4. Check if widget schema exists
    if (!widgetSchemas[widgetId as keyof typeof widgetSchemas]) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_widget',
        resourceId: widgetId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/dashboard/widgets/[widgetId]', reason: 'Unknown widget' },
      });
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: { widget: 'unknown' } },
        { status: 400 }
      );
    }

    // 5. Validate the data if provided
    if (data) {
      const validation = validateWidgetData(
        widgetId as keyof typeof widgetSchemas,
        data
      );

      if (!validation.valid) {
        await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
          userId,
          severity: AuditSeverity.WARNING,
          resourceType: 'dashboard_widget',
          resourceId: widgetId,
          ipAddress: request.ip,
          details: { endpoint: 'POST /api/dashboard/widgets/[widgetId]', reason: 'Data validation failed', errors: validation.errors },
        });
        return NextResponse.json(
          {
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
    }

    // 6. Store widget settings if provided
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
        await logAuditEvent(AuditAction.API_ERROR, {
          userId,
          severity: AuditSeverity.ERROR,
          resourceType: 'dashboard_widget',
          resourceId: widgetId,
          ipAddress: request.ip,
          details: { endpoint: 'POST /api/dashboard/widgets/[widgetId]', reason: 'Failed to update settings' },
        });
        return NextResponse.json(
          { error: 'Database error', code: 'DB_ERROR' },
          { status: 500 }
        );
      }
    }

    // 7. Cache the data if provided
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

    // 8. Log successful update
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_widget',
      resourceId: widgetId,
      statusCode: 200,
      details: { hasData: !!data, hasSettings: !!settings },
    });

    return NextResponse.json({
      success: true,
      widgetId,
      data,
      settings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating widget:`, error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_widget',
      ipAddress: request.ip,
      details: {
        endpoint: 'POST /api/dashboard/widgets/[widgetId]',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
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
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_widget',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'DELETE /api/dashboard/widgets/[widgetId]', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;
    const { widgetId } = await params;

    // 2. Initialize Supabase client
    const supabase = await createServerClient();

    // 3. Delete cache entry
    const { error } = await supabase
      .from('widget_data_cache')
      .delete()
      .eq('widget_id', widgetId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error clearing cache for widget ${widgetId}:`, error);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'dashboard_widget',
        resourceId: widgetId,
        ipAddress: request.ip,
        details: { endpoint: 'DELETE /api/dashboard/widgets/[widgetId]', reason: 'Failed to clear cache' },
      });
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 4. Log successful deletion
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_widget',
      resourceId: widgetId,
      statusCode: 200,
      details: { action: 'cache_cleared' },
    });

    return NextResponse.json({
      success: true,
      widgetId,
      cleared: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error deleting widget:`, error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_widget',
      ipAddress: request.ip,
      details: {
        endpoint: 'DELETE /api/dashboard/widgets/[widgetId]',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
