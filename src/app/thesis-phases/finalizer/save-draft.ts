'use server';

import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { v4 as uuidv4 } from 'uuid';

export async function saveDraftToDatabase(
  userId: string,
  finalDraft: string
): Promise<{ id: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Parse draft into paragraphs
    const paragraphs = finalDraft.split('\n\n').filter(p => p.trim() !== '');
    
    const contentObj = {
      type: 'doc',
      content: paragraphs.length > 0 ? paragraphs.map(paragraph => ({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph }]
      })) : [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: finalDraft }]
        }
      ]
    };

    console.log('Server: Saving draft for user:', userId);

    // Generate UUID explicitly to ensure it's not null
    const documentId = uuidv4();

    // Create document
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        user_id: userId,
        title: 'Thesis Finalizer Pro +',
        content: contentObj,
        status: 'draft'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Server error:', error);
      return { id: '', error: error.message || 'Failed to save draft' };
    }

    if (!data) {
      return { id: '', error: 'No data returned from insert' };
    }

    console.log('Server: Successfully saved draft with ID:', data.id);
    return { id: data.id };
  } catch (err: any) {
    console.error('Server exception:', err);
    return { id: '', error: err?.message || 'Unexpected error' };
  }
}
