// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define schemas
const createDocumentSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  type: z.enum([
    'proposal', 
    'chapter', 
    'full_document', 
    'appendix', 
    'presentation', 
    'review_form', 
    'approval_form'
  ]),
  content: z.string().max(1000000, 'Content too large').optional(), // 1MB max
  fileName: z.string().max(255, 'Filename too long').optional(),
  mimeType: z.string().max(100, 'MIME type too long').optional(),
  versionNumber: z.number().int().positive().optional(),
  status: z.enum([
    'draft', 
    'review_requested', 
    'in_review', 
    'review_completed', 
    'approved', 
    'revisions_needed', 
    'published'
  ]).default('draft'),
});

const updateDocumentSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  type: z.enum([
    'proposal', 
    'chapter', 
    'full_document', 
    'appendix', 
    'presentation', 
    'review_form', 
    'approval_form'
  ]).optional(),
  content: z.string().max(1000000, 'Content too large').optional(),
  status: z.enum([
    'draft', 
    'review_requested', 
    'in_review', 
    'review_completed', 
    'approved', 
    'revisions_needed', 
    'published'
  ]).optional(),
  reviewStatus: z.enum([
    'needs_review', 
    'under_review', 
    'completed', 
    'revisions_needed'
  ]).optional(),
  lockedBy: z.string().uuid('Invalid user ID').optional(),
  lockedUntil: z.string().datetime().optional(),
});

// Helper function to create success responses
function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({ 
    success: true, 
    data, 
    ...(message && { message }) 
  });
}

// Helper function to create error responses
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

// GET /api/documents
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from auth middleware (set by our custom middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Get query parameters
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id') || undefined;
    const type = url.searchParams.get('type') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));

    // Build query
    let query = supabase
      .from('thesis_documents')
      .select(`
        id,
        project_id,
        user_id,
        type,
        title,
        file_name,
        file_path,
        file_size,
        mime_type,
        content,
        version_number,
        status,
        review_status,
        locked_by,
        locked_until,
        created_at,
        updated_at,
        thesis_projects!thesis_documents_project_id_fkey (
          id,
          title,
          status
        ),
        profiles!thesis_documents_user_id_fkey (
          id,
          full_name,
          email
        )
      `, { count: 'exact' })
      .eq('user_id', userId)  // Users can only see their own documents
      .order('updated_at', { ascending: false });

    // Apply filters if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;
    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return createErrorResponse('Failed to fetch documents', 500, 'DATABASE_ERROR');
    }

    // Transform data to match expected format
    const transformedData = data.map(doc => ({
      id: doc.id,
      projectId: doc.project_id,
      userId: doc.user_id,
      type: doc.type,
      title: doc.title,
      fileName: doc.file_name,
      filePath: doc.file_path,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      content: doc.content,
      versionNumber: doc.version_number,
      status: doc.status,
      reviewStatus: doc.review_status,
      lockedBy: doc.locked_by,
      lockedUntil: doc.locked_until,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      project: doc.thesis_projects ? {
        id: (doc.thesis_projects as any).id,
        title: (doc.thesis_projects as any).title,
        status: (doc.thesis_projects as any).status,
      } : null,
      user: doc.profiles ? {
        id: (doc.profiles as any).id,
        fullName: (doc.profiles as any).full_name,
        email: (doc.profiles as any).email,
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
    console.error('Error in GET /api/documents:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// POST /api/documents
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
    const validatedData = createDocumentSchema.parse(requestBody);

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

    // Prepare document data
    const documentData = {
      project_id: validatedData.projectId,
      user_id: userId, // Use authenticated user ID
      type: validatedData.type,
      title: validatedData.title,
      file_name: validatedData.fileName,
      file_path: validatedData.fileName ? `/documents/${userId}/${validatedData.fileName}` : null,
      file_size: validatedData.fileName ? 0 : null, // Would be calculated from actual file upload in real implementation
      mime_type: validatedData.mimeType,
      content: validatedData.content,
      version_number: validatedData.versionNumber || 1,
      status: validatedData.status,
      review_status: validatedData.status === 'review_requested' ? 'needs_review' : 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert document into database
    const { data, error } = await supabase
      .from('thesis_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);

      if (error.code === '23503') { // Foreign key violation
        return createErrorResponse('Project does not exist', 400, 'PROJECT_INVALID');
      } else if (error.code === '23505') { // Unique violation
        return createErrorResponse('Document already exists', 400, 'DUPLICATE_DOCUMENT');
      }

      return createErrorResponse('Failed to create document', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(data, 'Document created successfully');
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

    console.error('Error in POST /api/documents:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}
