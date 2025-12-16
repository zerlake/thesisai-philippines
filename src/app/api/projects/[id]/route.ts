// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define schema for updating projects
const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long').optional(),
  subtitle: z.string().max(300, 'Subtitle too long').optional(),
  abstract: z.string().max(5000, 'Abstract too long').optional(),
  keywords: z.array(z.string()).max(20, 'Too many keywords').optional(),
  status: z.enum([
    'initiated', 
    'draft', 
    'in_review', 
    'revisions', 
    'approved', 
    'submitted', 
    'published', 
    'archived'
  ]).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format').optional(),
  semester: z.enum(['1st', '2nd', 'summer']).optional(),
  defenseDate: z.string().datetime().optional(),
  defenseResult: z.enum(['passed', 'passed_with_revisions', 'failed', 'postponed']).optional(),
  grade: z.number().min(0).max(5).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

// Helper functions for standardized responses
function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json({ 
    success: true, 
    data, 
    ...(message && { message }) 
  }, { status });
}

function createErrorResponse(message: string, status: number, code?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        message, 
        code,
        ...(process.env.NODE_ENV === 'development' && { timestamp: new Date().toISOString() })
      } 
    },
    { status }
  );
}

// GET /api/projects/[id]
export async function GET(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const projectId = params.id;

    if (!userId || !projectId) {
      return createErrorResponse('Project ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Fetch project with related data
    const { data, error } = await supabase
      .from('thesis_projects')
      .select(`
        *,
        profiles!thesis_projects_user_id_fkey (
          id,
          full_name,
          email
        ),
        advisors!thesis_projects_advisor_id_fkey (
          id,
          profile_id,
          specialization_area
        )
      `)
      .eq('id', projectId)
      .eq('user_id', userId) // Ensure user can only access their own projects
      .single();

    if (error) {
      console.error('Error fetching project:', error);

      if (error.code === 'PGRST116') { // Not found
        return createErrorResponse('Project not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to fetch project', 500, 'DATABASE_ERROR');
    }

    if (!data) {
      return createErrorResponse('Project not found', 404, 'NOT_FOUND');
    }

    // Transform data to match expected format
    const transformedData = {
      id: data.id,
      userId: data.user_id,
      advisorId: data.advisor_id,
      title: data.title,
      subtitle: data.subtitle,
      abstract: data.abstract,
      keywords: data.keywords,
      language: data.language,
      status: data.status,
      academicYear: data.academic_year,
      semester: data.semester,
      defenseDate: data.defense_date,
      defenseResult: data.defense_result,
      grade: data.grade,
      progressPercentage: data.progress_percentage,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      defenseScheduledAt: data.defense_scheduled_at,
      student: data.profiles ? {
        id: data.profiles.id,
        fullName: data.profiles.full_name,
        email: data.profiles.email,
      } : null,
      advisor: data.advisors ? {
        id: data.advisors.id,
        profileId: data.advisors.profile_id,
        specializationArea: data.advisors.specialization_area,
      } : null,
    };

    return createSuccessResponse(transformedData, 'Project retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const projectId = params.id;

    if (!userId || !projectId) {
      return createErrorResponse('Project ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Parse request body
    const requestBody = await request.json();

    // Add project ID to request data for validation
    const requestData = { id: projectId, ...requestBody };

    // Validate input
    const validatedData = updateProjectSchema.parse(requestData);

    // Check if project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from('thesis_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingProject) {
      return createErrorResponse('Project not found or access denied', 404, 'NOT_FOUND');
    }

    // Prepare update data (exclude ID from update)
    const { id, ...updateData } = validatedData;

    // Convert field names to snake_case for database columns
    const dbUpdateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) { // Only update defined fields
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        dbUpdateData[snakeKey] = value;
      }
    }

    // Add updated_at timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    // Update project in database
    const { data: updatedData, error: updateError } = await supabase
      .from('thesis_projects')
      .update(dbUpdateData)
      .eq('id', projectId)
      .eq('user_id', userId) // Ensure user can only update their own projects
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);

      if (updateError.code === 'PGRST116') { // Not found
        return createErrorResponse('Project not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to update project', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(updatedData, 'Project updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors
          } 
        },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/projects/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const projectId = params.id;

    if (!userId || !projectId) {
      return createErrorResponse('Project ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Check if project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from('thesis_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingProject) {
      return createErrorResponse('Project not found or access denied', 404, 'NOT_FOUND');
    }

    // Delete project from database
    const { error: deleteError } = await supabase
      .from('thesis_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId); // Ensure user can only delete their own projects

    if (deleteError) {
      console.error('Error deleting project:', deleteError);

      if (deleteError.code === 'PGRST116') { // Not found
        return createErrorResponse('Project not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to delete project', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(null, 'Project deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}