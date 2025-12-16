// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define schema for creating projects
const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  subtitle: z.string().max(300, 'Subtitle too long').optional(),
  abstract: z.string().max(5000, 'Abstract too long').optional(),
  keywords: z.array(z.string()).max(20, 'Too many keywords').optional(),
  language: z.enum(['en', 'fil', 'ceb']).default('en'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format (YYYY-YYYY)').optional(),
  semester: z.enum(['1st', '2nd', 'summer']).optional(),
  advisorId: z.string().uuid('Invalid advisor ID').optional(),
  status: z.enum([
    'initiated', 
    'draft', 
    'in_review', 
    'revisions', 
    'approved', 
    'submitted', 
    'published', 
    'archived'
  ]).default('initiated'),
  defenseDate: z.string().datetime().optional(),
  defenseResult: z.enum(['passed', 'passed_with_revisions', 'failed', 'postponed']).optional(),
  grade: z.number().min(0).max(5).optional(),
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

// GET /api/projects
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
    const academicYearFilter = url.searchParams.get('academic_year') || undefined;
    const advisorFilter = url.searchParams.get('advisor_id') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));

    // Build query
    let query = supabase
      .from('thesis_projects')
      .select(`
        id,
        user_id,
        advisor_id,
        title,
        subtitle,
        abstract,
        keywords,
        language,
        status,
        academic_year,
        semester,
        defense_date,
        defense_result,
        grade,
        progress_percentage,
        created_at,
        updated_at,
        defense_scheduled_at,
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
      `, { count: 'exact' })
      .eq('user_id', userId) // Users can only see their own projects
      .order('updated_at', { ascending: false });

    // Apply filters if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    if (academicYearFilter) {
      query = query.eq('academic_year', academicYearFilter);
    }

    if (advisorFilter) {
      query = query.eq('advisor_id', advisorFilter);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return createErrorResponse('Failed to fetch projects', 500, 'DATABASE_ERROR');
    }

    // Transform data to match expected format
    const transformedData = data.map(project => ({
      id: project.id,
      userId: project.user_id,
      advisorId: project.advisor_id,
      title: project.title,
      subtitle: project.subtitle,
      abstract: project.abstract,
      keywords: project.keywords || [],
      language: project.language,
      status: project.status,
      academicYear: project.academic_year,
      semester: project.semester,
      defenseDate: project.defense_date,
      defenseResult: project.defense_result,
      grade: project.grade,
      progressPercentage: project.progress_percentage,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      defenseScheduledAt: project.defense_scheduled_at,
      student: project.profiles ? {
        id: project.profiles.id,
        fullName: project.profiles.full_name,
        email: project.profiles.email,
      } : null,
      advisor: project.advisors ? {
        id: project.advisors.id,
        profileId: project.advisors.profile_id,
        specializationArea: project.advisors.specialization_area,
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
    console.error('Error in GET /api/projects:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// POST /api/projects
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
    const validatedData = createProjectSchema.parse(requestBody);

    // Verify that the user can access the specified advisor
    if (validatedData.advisorId) {
      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .select('id')
        .eq('id', validatedData.advisorId)
        .single();

      if (advisorError || !advisor) {
        return createErrorResponse('Advisor not found or access denied', 400, 'ADVISOR_NOT_FOUND');
      }
    }

    // Prepare project data
    const projectData = {
      user_id: userId, // Use authenticated user ID
      advisor_id: validatedData.advisorId,
      title: validatedData.title,
      subtitle: validatedData.subtitle || '',
      abstract: validatedData.abstract || '',
      keywords: validatedData.keywords || [],
      language: validatedData.language,
      status: validatedData.status,
      academic_year: validatedData.academicYear,
      semester: validatedData.semester,
      defense_date: validatedData.defenseDate,
      defense_result: validatedData.defenseResult,
      grade: validatedData.grade,
      progress_percentage: validatedData.status === 'draft' ? 0 : 100, // Set initial progress based on status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      defense_scheduled_at: validatedData.defenseDate ? new Date(validatedData.defenseDate).toISOString() : null,
    };

    // Insert project into database
    const { data, error } = await supabase
      .from('thesis_projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);

      if (error.code === '23503') { // Foreign key violation
        return createErrorResponse('Advisor does not exist', 400, 'ADVISOR_INVALID');
      } else if (error.code === '23505') { // Unique violation
        return createErrorResponse('Project with this title already exists', 400, 'DUPLICATE_TITLE');
      }

      return createErrorResponse('Failed to create project', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(data, 'Project created successfully');
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

    console.error('Error in POST /api/projects:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}