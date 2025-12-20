import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Layout schema for validation
const DashboardLayoutSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  widgets: z.array(
    z.object({
      id: z.string(),
      widgetId: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
      settings: z.record(z.any()).optional(),
    })
  ),
  isDefault: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  metadata: z
    .object({
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      version: z.number().default(1),
    })
    .optional(),
});

type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

/**
 * GET /api/dashboard/layouts
 * List all dashboard layouts for the user
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_layout',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/dashboard/layouts', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Initialize Supabase client
    const supabase = await createServerClient();

    const searchParams = request.nextUrl.searchParams;
    const defaultOnly = searchParams.get('default') === 'true';
    const templatesOnly = searchParams.get('templates') === 'true';

    // Query dashboard layouts table
    let query = supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (defaultOnly) {
      query = query.eq('is_default', true);
    }

    if (templatesOnly) {
      query = query.eq('is_template', true);
    }

    const { data: layouts, error } = await query;

    if (error) {
      console.error('Error fetching layouts:', error);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'dashboard_layout',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/dashboard/layouts', reason: 'Database error' },
      });
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    // 3. Log successful access
    await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_layout',
      ipAddress: request.ip,
      statusCode: 200,
      details: { count: layouts?.length || 0 },
    });

    const defaultLayout = layouts?.find((l) => l.is_default) || null;

    return NextResponse.json({
      success: true,
      layouts: layouts || [],
      default: defaultLayout,
      count: layouts?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching layouts:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_layout',
      ipAddress: request.ip,
      details: {
        endpoint: 'GET /api/dashboard/layouts',
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
 * POST /api/dashboard/layouts
 * Create a new dashboard layout
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_layout',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/dashboard/layouts', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const body = await request.json();
    let validatedData: z.infer<typeof DashboardLayoutSchema>;

    try {
      validatedData = DashboardLayoutSchema.parse(body);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_layout',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/dashboard/layouts',
          reason: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined,
        },
      });
      return NextResponse.json(
        {
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase client
    const supabase = await createServerClient();

    // Generate layout ID if not provided
    const layoutId = validatedData.id || `layout-${Date.now()}`;
    const now = new Date().toISOString();

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      const { error: unsetError } = await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      if (unsetError) {
        console.error('Error updating default layouts:', unsetError);
        await logAuditEvent(AuditAction.API_ERROR, {
          userId,
          severity: AuditSeverity.ERROR,
          resourceType: 'dashboard_layout',
          resourceId: layoutId,
          ipAddress: request.ip,
          details: { endpoint: 'POST /api/dashboard/layouts', reason: 'Failed to unset defaults' },
        });
        return NextResponse.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 });
      }
    }

    // 4. Create the layout
    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .insert({
        id: layoutId,
        user_id: userId,
        name: validatedData.name,
        description: validatedData.description || null,
        widgets: validatedData.widgets,
        is_default: validatedData.isDefault || false,
        is_template: validatedData.isTemplate || false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'dashboard_layout',
        resourceId: layoutId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/dashboard/layouts', reason: 'Failed to create layout' },
      });
      return NextResponse.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 });
    }

    // 5. Log successful creation
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_layout',
      resourceId: layoutId,
      statusCode: 201,
      details: { name: validatedData.name, isDefault: validatedData.isDefault, widgetCount: validatedData.widgets.length },
    });

    return NextResponse.json(
      {
        success: true,
        layout,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating layout:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_layout',
      ipAddress: request.ip,
      details: {
        endpoint: 'POST /api/dashboard/layouts',
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
 * PUT /api/dashboard/layouts
 * Update multiple layouts or set default
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_layout',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'PUT /api/dashboard/layouts', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const body = await request.json();
    const { layoutId, setDefault, name, description, widgets } = body;

    if (!layoutId) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'dashboard_layout',
        ipAddress: request.ip,
        details: { endpoint: 'PUT /api/dashboard/layouts', reason: 'Missing layoutId' },
      });
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: { layoutId: 'required' } },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase client
    const supabase = await createServerClient();

    // 4. Verify user owns this layout
    const { data: existingLayout, error: fetchError } = await supabase
      .from('dashboard_layouts')
      .select('user_id')
      .eq('id', layoutId)
      .single();

    if (fetchError || !existingLayout) {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.CRITICAL,
        resourceType: 'dashboard_layout',
        resourceId: layoutId,
        ipAddress: request.ip,
        details: { endpoint: 'PUT /api/dashboard/layouts', reason: 'Layout not found' },
      });
      return NextResponse.json(
        { error: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingLayout.user_id !== userId) {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.CRITICAL,
        resourceType: 'dashboard_layout',
        resourceId: layoutId,
        ipAddress: request.ip,
        details: {
          endpoint: 'PUT /api/dashboard/layouts',
          reason: 'User attempted to update layout owned by another user',
          ownerUserId: existingLayout.user_id,
        },
      });
      return NextResponse.json(
        { error: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // If setting as default, unset others
    if (setDefault) {
      const { error: unsetError } = await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      if (unsetError) {
        console.error('Error updating default layouts:', unsetError);
        await logAuditEvent(AuditAction.API_ERROR, {
          userId,
          severity: AuditSeverity.ERROR,
          resourceType: 'dashboard_layout',
          resourceId: layoutId,
          ipAddress: request.ip,
          details: { endpoint: 'PUT /api/dashboard/layouts', reason: 'Failed to unset defaults' },
        });
        return NextResponse.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 });
      }
    }

    // 5. Update the layout
    const updateData: any = { updated_at: new Date().toISOString() };
    if (setDefault !== undefined) {
      updateData.is_default = setDefault;
    }

    // Include other fields if provided
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (widgets) updateData.widgets = widgets;

    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .update(updateData)
      .eq('id', layoutId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating layout:', error);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'dashboard_layout',
        resourceId: layoutId,
        ipAddress: request.ip,
        details: { endpoint: 'PUT /api/dashboard/layouts', reason: 'Failed to update layout' },
      });
      return NextResponse.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 });
    }

    // 6. Log successful update
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'dashboard_layout',
      resourceId: layoutId,
      statusCode: 200,
      details: { name, setDefault },
    });

    return NextResponse.json({
      success: true,
      layout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating layout:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'dashboard_layout',
      ipAddress: request.ip,
      details: {
        endpoint: 'PUT /api/dashboard/layouts',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
