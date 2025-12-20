import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { z } from 'zod';

// Validation schema
const listVersionsSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  checkpoints: z.boolean().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/documents/versions/list', reason: 'Missing auth token' },
      });
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const onlyCheckpoints = searchParams.get('checkpoints') === 'true';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    if (!documentId) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/documents/versions/list', reason: 'Missing documentId parameter' },
      });
      return NextResponse.json({ error: 'Missing documentId parameter', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    try {
      listVersionsSchema.parse({ documentId, checkpoints: onlyCheckpoints, limit, offset });
    } catch (error) {
      await logAuditEvent(AuditAction.SECURITY_VALIDATION_FAILED, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'document_version',
        ipAddress: request.ip,
        details: {
          endpoint: 'GET /api/documents/versions/list',
          reason: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined,
        },
      });
      return NextResponse.json({ error: 'Validation error', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

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
        details: {
          endpoint: 'GET /api/documents/versions/list',
          reason: 'Document not found or access denied',
        },
      });
      return NextResponse.json({ error: 'Document not found or access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 5. Build query
    let query = supabase
      .from('document_versions')
      .select('id, title, version_type, checkpoint_label, word_count, created_at, description', {
        count: 'exact',
      })
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (onlyCheckpoints) {
      query = query.eq('version_type', 'checkpoint');
    }

    const { data: versions, error: versionsError, count } = await query.range(offset, offset + limit - 1);

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'document_version',
        resourceId: documentId,
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/documents/versions/list', reason: 'Failed to fetch versions' },
      });
      return NextResponse.json({ error: 'Failed to fetch versions', code: 'DATABASE_ERROR' }, { status: 500 });
    }

    // Log access
    await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'document_version',
      resourceId: documentId,
      statusCode: 200,
      details: { total: count || 0, limit, offset, checkpointsOnly: onlyCheckpoints },
    });

    return NextResponse.json({
      success: true,
      versions,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Version list error:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'document_version',
      ipAddress: request?.ip,
      details: {
        endpoint: 'GET /api/documents/versions/list',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
