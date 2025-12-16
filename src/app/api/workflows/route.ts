// src/app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define schema for creating workflows
const createWorkflowSchema = z.object({
  name: z.string().min(3, 'Workflow name must be at least 3 characters').max(200, 'Workflow name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  projectId: z.string().uuid('Invalid project ID'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  steps: z.array(z.object({
    id: z.string().uuid('Invalid step ID').optional(),
    appId: z.string().min(1, 'App ID is required'),
    name: z.string().min(1, 'Step name is required'),
    config: z.record(z.unknown()).optional().default({}),
    inputs: z.record(z.unknown()).optional().default({}),
    outputs: z.record(z.unknown()).optional().default({}),
    status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  })).min(1, 'At least one step is required'),
});

// Define schema for updating workflows
const updateWorkflowSchema = z.object({
  id: z.string().uuid('Invalid workflow ID'),
  name: z.string().min(3, 'Workflow name must be at least 3 characters').max(200, 'Workflow name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  steps: z.array(z.object({
    id: z.string().uuid('Invalid step ID').optional(),
    appId: z.string().min(1, 'App ID is required'),
    name: z.string().min(1, 'Step name is required'),
    config: z.record(z.unknown()).optional(),
    inputs: z.record(z.unknown()).optional(),
    outputs: z.record(z.unknown()).optional(),
    status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  })).optional(),
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

// GET /api/workflows
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Get query parameters
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || undefined;
    const projectIdFilter = url.searchParams.get('project_id') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));

    // Build query
    let query = supabase
      .from('workflows')
      .select(`
        *,
        thesis_projects!workflows_project_id_fkey (
          id,
          title,
          status
        ),
        profiles!workflows_created_by_fkey (
          id,
          full_name,
          email
        )
      `, { count: 'exact' })
      .eq('created_by', userId) // Users can only see their own workflows
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    if (projectIdFilter) {
      query = query.eq('project_id', projectIdFilter);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching workflows:', error);
      return createErrorResponse('Failed to fetch workflows', 500, 'DATABASE_ERROR');
    }

    // Transform data to match expected format
    const transformedData = data.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      projectId: workflow.project_id,
      status: workflow.status,
      steps: workflow.steps || [],
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
      lastRunAt: workflow.last_run_at,
      createdBy: workflow.created_by,
      project: workflow.thesis_projects ? {
        id: workflow.thesis_projects.id,
        title: workflow.thesis_projects.title,
        status: workflow.thesis_projects.status,
      } : null,
      creator: workflow.profiles ? {
        id: workflow.profiles.id,
        fullName: workflow.profiles.full_name,
        email: workflow.profiles.email,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/workflows:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// POST /api/workflows
export async function POST(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Parse request body
    const requestBody = await request.json();

    // Validate input
    const validatedData = createWorkflowSchema.parse(requestBody);

    // Verify that the user has access to the specified project
    const { data: project, error: projectError } = await supabase
      .from('thesis_projects')
      .select('id')
      .eq('id', validatedData.projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return createErrorResponse('Project not found or access denied', 404, 'PROJECT_NOT_FOUND');
    }

    // Prepare workflow data
    const workflowData = {
      name: validatedData.name,
      description: validatedData.description || '',
      project_id: validatedData.projectId,
      created_by: userId, // Use authenticated user ID
      status: validatedData.status,
      steps: validatedData.steps,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert workflow into database
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflowData])
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);

      if (error.code === '23503') { // Foreign key violation
        return createErrorResponse('Project does not exist', 400, 'PROJECT_INVALID');
      } else if (error.code === '23505') { // Unique violation
        return createErrorResponse('Workflow with this name already exists', 400, 'DUPLICATE_WORKFLOW');
      }

      return createErrorResponse('Failed to create workflow', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(data, 'Workflow created successfully');
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

    console.error('Error in POST /api/workflows:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}