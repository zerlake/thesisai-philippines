import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const onlyCheckpoints = searchParams.get('checkpoints') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId parameter' }, { status: 400 });
    }

    // Verify document ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .eq('user_id', session.user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('document_versions')
      .select('id, title, version_type, checkpoint_label, word_count, created_at, description', {
        count: 'exact',
      })
      .eq('document_id', documentId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (onlyCheckpoints) {
      query = query.eq('version_type', 'checkpoint');
    }

    const { data: versions, error: versionsError, count } = await query.range(offset, offset + limit - 1);

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      versions,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Version list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
