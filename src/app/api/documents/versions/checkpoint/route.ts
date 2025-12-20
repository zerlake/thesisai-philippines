import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Validation schema
const createCheckpointSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  content: z.any(),
  title: z.string().max(500, 'Title too long').optional(),
  checkpointLabel: z.string().min(1, 'Checkpoint label required').max(100, 'Label too long'),
  wordCount: z.number().int().nonnegative().optional(),
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
        details: { endpoint: 'POST /api/documents/versions/checkpoint', reason: 'Missing auth token' },
      });
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Parse and validate request body
    const requestBody = await request.json();
    let validatedData: z.infer<typeof createCheckpointSchema>;

    try {
      validatedData = createCheckpointSchema.parse(requestBody);
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/documents/versions/checkpoint',
          reason: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined,
        },
      });
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: error instanceof z.ZodError ? error.errors : undefined },
        { status: 400 }
      );
    }

    const { documentId, content, title, checkpointLabel, wordCount } = validatedData;

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
        details: { endpoint: 'POST /api/documents/versions/checkpoint', reason: 'Document not found or access denied' },
      });
      return NextResponse.json({ error: 'Document not found or access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 5. Create checkpoint version
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        user_id: userId,
        content,
        title,
        version_type: 'checkpoint',
        checkpoint_label: checkpointLabel,
        word_count: wordCount || 0,
        description: `Checkpoint: ${checkpointLabel}`,
      })
      .select()
      .single();

    if (versionError) {
      console.error('Error creating checkpoint:', versionError);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document_version',
        resourceId: documentId,
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/documents/versions/checkpoint', reason: 'Failed to create checkpoint' },
      });
      return NextResponse.json({ error: 'Failed to create checkpoint', code: 'CREATE_ERROR' }, { status: 500 });
    }

    // 6. Update document's last checkpoint
    const { error: updateError } = await supabase
      .from('documents')
      .update({ last_checkpoint_id: version.id })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document checkpoint:', updateError);
    }

    // Log checkpoint creation
    await logAuditEvent(AuditAction.DOCUMENT_UPDATED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'document_version',
      resourceId: version.id,
      statusCode: 200,
      details: {
        documentId,
        checkpointLabel,
        wordCount: wordCount || 0,
        action: 'checkpoint_created',
      },
    });

    return NextResponse.json({
      success: true,
      checkpoint: version,
      message: `Checkpoint "${checkpointLabel}" created successfully`,
    });
  } catch (error) {
    console.error('Checkpoint creation error:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'document_version',
      ipAddress: request?.ip,
      details: {
        endpoint: 'POST /api/documents/versions/checkpoint',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
