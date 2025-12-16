// src/app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

// GET /api/documents/[id]
export async function GET(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const documentId = params.id;

    if (!userId || !documentId) {
      return createErrorResponse('Document ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Fetch specific document
    const { data, error } = await supabase
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
      `)
      .eq('id', documentId)
      .eq('user_id', userId) // Ensure user can only access their own documents
      .single();

    if (error) {
      console.error('Error fetching document:', error);

      if (error.code === 'PGRST116') { // Not found
        return createErrorResponse('Document not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to fetch document', 500, 'DATABASE_ERROR');
    }

    if (!data) {
      return createErrorResponse('Document not found', 404, 'NOT_FOUND');
    }

    // Transform data to match expected format
    const transformedData = {
      id: data.id,
      projectId: data.project_id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      fileName: data.file_name,
      filePath: data.file_path,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      content: data.content,
      versionNumber: data.version_number,
      status: data.status,
      reviewStatus: data.review_status,
      lockedBy: data.locked_by,
      lockedUntil: data.locked_until,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      project: data.thesis_projects ? {
        id: (data.thesis_projects as any).id,
        title: (data.thesis_projects as any).title,
        status: (data.thesis_projects as any).status,
      } : null,
      user: data.profiles ? {
        id: (data.profiles as any).id,
        fullName: (data.profiles as any).full_name,
        email: (data.profiles as any).email,
      } : null,
    };

    return createSuccessResponse(transformedData, 'Document retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// PUT /api/documents/[id]
export async function PUT(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const documentId = params.id;

    if (!userId || !documentId) {
      return createErrorResponse('Document ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Parse request body
    const requestBody = await request.json();

    // Validate input (adding the document ID for the schema validation)
    const requestData = { id: documentId, ...requestBody };
    const validatedData = updateDocumentSchema.parse(requestData);

    // Check if document exists and belongs to user
    const { data: existingDoc, error: fetchError } = await supabase
      .from('thesis_documents')
      .select('id, locked_by, locked_until')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingDoc) {
      return createErrorResponse('Document not found or access denied', 404, 'NOT_FOUND');
    }

    // Check if document is locked by another user
    if (existingDoc.locked_by &&
        existingDoc.locked_by !== userId &&
        existingDoc.locked_until &&
        new Date(existingDoc.locked_until) > new Date()) {
      return createErrorResponse('Document is currently locked by another user', 423, 'DOCUMENT_LOCKED');
    }

    // Prepare update data (exclude ID from update)
    const { id, ...updateData } = validatedData;

    // Convert field names to snake_case to match database
    const dbUpdateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) { // Only update defined fields
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        dbUpdateData[snakeKey] = value;
      }
    }

    // Add updated_at timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    // Update document in database
    const { data: updatedData, error: updateError } = await supabase
      .from('thesis_documents')
      .update(dbUpdateData)
      .eq('id', documentId)
      .eq('user_id', userId) // Ensure user can only update their own documents
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document:', updateError);

      if (updateError.code === 'PGRST116') { // Not found
        return createErrorResponse('Document not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to update document', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(updatedData, 'Document updated successfully');
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

    console.error('Error in PUT /api/documents/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// DELETE /api/documents/[id]
export async function DELETE(request: NextRequest, context: any) {
  const params = context.params as { id: string };
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const documentId = params.id;

    if (!userId || !documentId) {
      return createErrorResponse('Document ID and authentication required', 400, 'BAD_REQUEST');
    }

    // Check if document exists and belongs to user
    const { data: existingDoc, error: fetchError } = await supabase
      .from('thesis_documents')
      .select('id, locked_by, locked_until')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingDoc) {
      return createErrorResponse('Document not found or access denied', 404, 'NOT_FOUND');
    }

    // Check if document is locked by another user
    if (existingDoc.locked_by &&
        existingDoc.locked_by !== userId &&
        existingDoc.locked_until &&
        new Date(existingDoc.locked_until) > new Date()) {
      return createErrorResponse('Cannot delete: document is currently locked by another user', 423, 'DOCUMENT_LOCKED');
    }

    // Delete document from database
    const { error } = await supabase
      .from('thesis_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId); // Ensure user can only delete their own documents

    if (error) {
      console.error('Error deleting document:', error);

      if (error.code === 'PGRST116') { // Not found
        return createErrorResponse('Document not found', 404, 'NOT_FOUND');
      }

      return createErrorResponse('Failed to delete document', 500, 'DATABASE_ERROR');
    }

    return createSuccessResponse(null, 'Document deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}
