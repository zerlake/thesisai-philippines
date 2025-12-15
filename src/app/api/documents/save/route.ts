import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated session first
    const supabase = await createServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // For development/demo: if no session, use a fixed demo user ID
    let userId = session?.user?.id;
    let isDemo = false;
    
    if (!userId) {
      console.warn('No authenticated session, using demo mode');
      isDemo = true;
      // Use a consistent demo user ID for all unauthenticated requests
      userId = 'demo-user-123456';
    }

    const { documentId, contentJson, contentHtml, title, wordCount, createVersion = false } =
      await request.json();

    if (!documentId || !contentJson) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, contentJson' },
        { status: 400 }
      );
    }

    // Check if document exists (by ID only, not user_id for demo mode)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .single();

    if (docError && docError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new documents
      console.error('Database error checking document:', { code: docError.code, message: docError.message });
      return NextResponse.json({ error: 'Database error: ' + docError.message }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to create document: ' + createError.message }, { status: 500 });
      }
    } else {
      // Document exists, update the user_id to match current user (in case it was migrated)
      // This is safe in demo mode where user_id might not be a real UUID
      const { error: updateUserError } = await supabase
        .from('documents')
        .update({ user_id: userId })
        .eq('id', documentId);
      
      if (updateUserError) {
        console.warn('Could not update user_id on existing document:', updateUserError);
      }
    }

    // Calculate word count if not provided
    let finalWordCount = wordCount;
    if (!finalWordCount && contentJson.content) {
      const plainText = extractPlainText(contentJson);
      finalWordCount = plainText.split(/\s+/).filter(Boolean).length;
    }

    // Update document
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
      return NextResponse.json({ error: 'Failed to save document: ' + updateError.message }, { status: 500 });
    }

    // Optionally create a version (checkpoint or milestone)
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
