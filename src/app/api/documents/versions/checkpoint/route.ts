import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, content, title, checkpointLabel, wordCount } = await request.json();

    if (!documentId || !content || !checkpointLabel) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, content, checkpointLabel' },
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

    // Create checkpoint version
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        user_id: session.user.id,
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
      return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 });
    }

    // Update document's last checkpoint
    const { error: updateError } = await supabase
      .from('documents')
      .update({ last_checkpoint_id: version.id })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document checkpoint:', updateError);
    }

    return NextResponse.json({
      success: true,
      checkpoint: version,
      message: `Checkpoint "${checkpointLabel}" created successfully`,
    });
  } catch (error) {
    console.error('Checkpoint creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
