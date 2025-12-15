import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { versionId, documentId } = await request.json();

    if (!versionId || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields: versionId, documentId' },
        { status: 400 }
      );
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

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('id, content, title, word_count')
      .eq('id', versionId)
      .eq('user_id', session.user.id)
      .single();

    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found or access denied' }, { status: 403 });
    }

    // Create a backup of current state before restore
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
          user_id: session.user.id,
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

    // Restore version to document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content_json: version.content,
        title: version.title,
        word_count: version.word_count,
      })
      .eq('id', documentId)
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error restoring version:', updateError);
      return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
