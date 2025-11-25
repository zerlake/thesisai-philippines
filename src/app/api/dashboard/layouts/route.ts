import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { dashboardErrorHandler } from '@/lib/dashboard/api-error-handler';
import { z } from 'zod';

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

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
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id
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
      const message = dashboardErrorHandler.handleError(500, toError(error as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

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
 * POST /api/dashboard/layouts
 * Create a new dashboard layout
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();

    // Validate request body
    try {
      DashboardLayoutSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid layout format',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Generate layout ID if not provided
    const layoutId = body.id || `layout-${Date.now()}`;
    const now = new Date().toISOString();

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    // Create the layout
    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .insert({
        id: layoutId,
        user_id: userId,
        name: body.name,
        description: body.description || null,
        widgets: body.widgets,
        is_default: body.isDefault || false,
        is_template: body.isTemplate || false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      const message = dashboardErrorHandler.handleError(500, toError(error as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

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
 * PUT /api/dashboard/layouts
 * Update multiple layouts or set default
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const body = await request.json();
    const { layoutId, setDefault } = body;

    if (!layoutId) {
      return NextResponse.json(
        { error: 'layoutId is required' },
        { status: 400 }
      );
    }

    // If setting as default, unset others
    if (setDefault) {
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    // Update the layout
    const updateData: any = { updated_at: new Date().toISOString() };
    if (setDefault !== undefined) {
      updateData.is_default = setDefault;
    }

    // Include other fields if provided
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.widgets) updateData.widgets = body.widgets;

    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .update(updateData)
      .eq('id', layoutId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating layout:', error);
      const message = dashboardErrorHandler.handleError(500, toError(error as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      layout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating layout:', error);
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
