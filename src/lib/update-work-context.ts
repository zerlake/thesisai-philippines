import { SupabaseClient } from '@supabase/supabase-js';

export interface WorkContextUpdate {
  documentId?: string;
  currentChapter?: string;
  currentPhase?: string;
  completionPercentage?: number;
}

export async function updateWorkContext(
  supabase: SupabaseClient,
  userId: string,
  update: WorkContextUpdate
) {
  try {
    // Update documents table
    if (update.documentId) {
      const { error: docError } = await supabase
        .from('documents')
        .update({
          current_chapter: update.currentChapter || null,
          phase_key: update.currentPhase || null,
          completion_percentage: update.completionPercentage ?? 0,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', update.documentId);

      if (docError) {
        console.error('[updateWorkContext] Error updating document:', docError);
      }
    }

    // Update or insert student_work_context
    const contextData = {
      student_id: userId,
      current_chapter: update.currentChapter || null,
      current_phase: update.currentPhase || null,
      active_document_id: update.documentId || null,
      updated_at: new Date().toISOString(),
    };

    const { error: contextError } = await supabase
      .from('student_work_context')
      .upsert(contextData, { onConflict: 'student_id' });

    if (contextError) {
      console.error('[updateWorkContext] Error updating context:', contextError);
      throw contextError;
    }

    console.debug('[updateWorkContext] Work context updated:', {
      chapter: update.currentChapter,
      phase: update.currentPhase,
      completion: update.completionPercentage,
    });
  } catch (error) {
    console.error('[updateWorkContext] Failed to update work context:', error);
    throw error;
  }
}
