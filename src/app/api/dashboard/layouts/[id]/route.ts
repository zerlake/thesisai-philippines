import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { dashboardErrorHandler } from '@/lib/dashboard/api-error-handler';

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

/**
 * GET /api/dashboard/layouts/[id]
 * Fetch a specific layout by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { id: layoutId } = await params;

    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('id', layoutId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Layout not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching layout:', error);
      const message = dashboardErrorHandler.handleError(500, error);
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
    console.error('Error fetching layout:', error);
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
 * PUT /api/dashboard/layouts/[id]
 * Update a specific layout
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { id: layoutId } = await params;
    const body = await request.json();

    // Verify layout exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('dashboard_layouts')
      .select('id')
      .eq('id', layoutId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.widgets !== undefined) updateData.widgets = body.widgets;
    if (body.isDefault !== undefined) updateData.is_default = body.isDefault;
    if (body.isTemplate !== undefined) updateData.is_template = body.isTemplate;

    const { data: layout, error } = await supabase
      .from('dashboard_layouts')
      .update(updateData)
      .eq('id', layoutId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating layout:', error);
      const message = dashboardErrorHandler.handleError(500, toError(error));
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
 * DELETE /api/dashboard/layouts/[id]
 * Delete a specific layout
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { id: layoutId } = await params;

    // Verify layout exists
    const { data: layout, error: checkError } = await supabase
      .from('dashboard_layouts')
      .select('id, is_default')
      .eq('id', layoutId)
      .eq('user_id', userId)
      .single();

    if (checkError || !layout) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of default layout
    if (layout.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete the default layout. Set another layout as default first.' },
        { status: 409 }
      );
    }

    // Delete the layout
    const { error } = await supabase
      .from('dashboard_layouts')
      .delete()
      .eq('id', layoutId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting layout:', error);
      const message = dashboardErrorHandler.handleError(500, toError(error as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: layoutId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting layout:', error);
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
 * POST /api/dashboard/layouts/[id]
 * Clone a layout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
    const { id: layoutId } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'name is required for cloning' },
        { status: 400 }
      );
    }

    // Get the layout to clone
    const { data: original, error: fetchError } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('id', layoutId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // Create cloned layout
    const clonedId = `layout-${Date.now()}`;
    const now = new Date().toISOString();

    const { data: cloned, error: createError } = await supabase
      .from('dashboard_layouts')
      .insert({
        id: clonedId,
        user_id: userId,
        name,
        description: `Clone of ${original.name}`,
        widgets: original.widgets,
        is_default: false,
        is_template: original.is_template,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error cloning layout:', createError);
      const message = dashboardErrorHandler.handleError(500, toError(createError as unknown));
      return NextResponse.json(
        { error: message.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        layout: cloned,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error cloning layout:', error);
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
