import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Validation schema
const saveDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  contentJson: z.any(),
  contentHtml: z.string().optional(),
  title: z.string().max(500, 'Title too long').optional(),
  wordCount: z.number().int().min(0).optional(),
  createVersion: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/save', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const requestBody = await request.json();
    let validatedData: z.infer<typeof saveDocumentSchema>;
    
    try {
      validatedData = saveDocumentSchema.parse(requestBody);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/save',
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

    const { documentId, contentJson, contentHtml, title, wordCount, createVersion = false } = validatedData;

    // 3. Initialize Supabase client
    const supabase = await createServerClient();

    // 4. Check if document exists and user has access
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .single();

    if (docError && docError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new documents
      console.error('Database error checking document:', { code: docError.code, message: docError.message });
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document',
        resourceId: documentId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/save', reason: 'Database error' },
      });
      return NextResponse.json({ error: 'Database error: ' + docError.message }, { status: 500 });
    }

    // 5. Authorization check: if document exists, verify ownership
    if (document && document.user_id !== userId) {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.CRITICAL,
        resourceType: 'document',
        resourceId: documentId,
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/save',
          reason: 'User attempted to access document owned by another user',
          docOwnerId: document.user_id,
        },
      });
      return NextResponse.json(
        { error: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // If document doesn't exist, create it
    if (!document) {
      const { data: newDoc, error: createError } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          user_id: userId,
          title: title || 'Untitled Document',
          status: 'draft',
          content_json: contentJson,
          content: contentHtml,
          word_count: wordCount || 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating document:', { code: createError.code, message: createError.message, details: createError.details });
        await logAuditEvent(AuditAction.API_ERROR, {
          userId,
          severity: AuditSeverity.ERROR,
          resourceType: 'document',
          resourceId: documentId,
          ipAddress: request.ip,
          details: { endpoint: 'POST /api/documents/save', reason: 'Failed to create document' },
        });
        return NextResponse.json({ error: 'Failed to create document: ' + createError.message }, { status: 500 });
      }

      // Log successful document creation
      await logAuditEvent(AuditAction.DOCUMENT_CREATED, {
        userId,
        severity: AuditSeverity.INFO,
        resourceType: 'document',
        resourceId: documentId,
        statusCode: 200,
        details: { title: title || 'Untitled Document', wordCount: wordCount || 0 },
      });
    }

    // Calculate word count if not provided
    let finalWordCount = wordCount;
    if (!finalWordCount && contentJson.content) {
      const plainText = extractPlainText(contentJson);
      finalWordCount = plainText.split(/\s+/).filter(Boolean).length;
    }

    // 6. Update document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content_json: contentJson,
        content: contentHtml,
        title: title || undefined,
        word_count: finalWordCount || 0,
        updated_at: new Date().toISOString(),
        is_autosave: !createVersion,
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating document:', { code: updateError.code, message: updateError.message, details: updateError.details });
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document',
        resourceId: documentId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/save', reason: 'Failed to update document' },
      });
      return NextResponse.json({ error: 'Failed to save document: ' + updateError.message }, { status: 500 });
    }

    // Log document update
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'document',
      resourceId: documentId,
      statusCode: 200,
      details: {
        title: title || undefined,
        wordCount: finalWordCount || 0,
        isAutosave: !createVersion,
      },
    });

    // 7. Optionally create a version (checkpoint or milestone)
    let version = null;
    if (createVersion) {
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          user_id: userId,
          content: contentJson,
          title: title,
          version_type: 'manual_save',
          word_count: finalWordCount || 0,
        })
        .select()
        .single();

      if (!versionError) {
        version = versionData;

        // Log version creation
        await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
          userId,
          severity: AuditSeverity.INFO,
          resourceType: 'document_version',
          resourceId: version.id,
          statusCode: 200,
          details: { documentId, versionType: 'manual_save' },
        });
      } else {
        console.warn('Failed to create version:', versionError);
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        word_count: finalWordCount || 0,
      },
      version: version ? { id: version.id, created_at: version.created_at } : null,
      message: 'Document saved successfully',
    });
  } catch (error) {
    console.error('Document save error:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'document',
      ipAddress: request?.ip,
      details: {
        endpoint: 'POST /api/documents/save',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to extract plain text from Tiptap JSON
function extractPlainText(doc: any): string {
  let text = '';

  function traverse(node: any) {
    if (node.text) {
      text += node.text;
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => traverse(child));
    }
  }

  if (doc.content && Array.isArray(doc.content)) {
    doc.content.forEach((node: any) => traverse(node));
  }

  return text;
}
