import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Validation schema
const restoreVersionSchema = z.object({
  versionId: z.string().uuid('Invalid version ID'),
  documentId: z.string().uuid('Invalid document ID'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/versions/restore', reason: 'Missing auth token' },
      });
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const requestBody = await request.json();
    let validatedData: z.infer<typeof restoreVersionSchema>;

    try {
      validatedData = restoreVersionSchema.parse(requestBody);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/versions/restore',
          reason: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined,
        },
      });
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: error instanceof z.ZodError ? error.errors : undefined },
        { status: 400 }
      );
    }

    const { versionId, documentId } = validatedData;

    // 3. Initialize Supabase client
    const supabase = await createServerSupabaseClient();

    // 4. Verify document ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !document) {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        resourceId: documentId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/versions/restore', reason: 'Document not found or access denied' },
      });
      return NextResponse.json({ error: 'Document not found or access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 5. Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('id, content, title, word_count')
      .eq('id', versionId)
      .eq('user_id', userId)
      .single();

    if (versionError || !version) {
      await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        resourceId: versionId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/versions/restore', reason: 'Version not found or access denied' },
      });
      return NextResponse.json({ error: 'Version not found or access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 6. Create a backup of current state before restore
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('content_json, title, word_count')
      .eq('id', documentId)
      .single();

    if (currentDoc) {
      const { error: backupError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          user_id: userId,
          content: currentDoc.content_json || {},
          title: currentDoc.title,
          version_type: 'auto',
          word_count: currentDoc.word_count || 0,
          description: 'Auto-backup before restore',
        });

      if (backupError) {
        console.error('Error creating backup:', backupError);
      }
    }

    // 7. Restore version to document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content_json: version.content,
        title: version.title,
        word_count: version.word_count,
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error restoring version:', updateError);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document_version',
        resourceId: versionId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/versions/restore', reason: 'Failed to restore version' },
      });
      return NextResponse.json({ error: 'Failed to restore version', code: 'UPDATE_ERROR' }, { status: 500 });
    }

    // Log successful restore
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'document_version',
      resourceId: versionId,
      statusCode: 200,
      details: {
        documentId,
        title: version.title,
        wordCount: version.word_count,
        action: 'version_restored',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Version "${version.id}" restored successfully`,
      document: {
        id: documentId,
        content: version.content,
        title: version.title,
        word_count: version.word_count,
      },
    });
  } catch (error) {
    console.error('Version restore error:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'document_version',
      ipAddress: request?.ip,
      details: {
        endpoint: 'POST /api/documents/versions/restore',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
