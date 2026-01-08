import { SupabaseClient } from "@supabase/supabase-js";
import { AdvisorComment } from "@/lib/types/advisor-comments";
import { RevisionJob, RevisionResult } from "@/lib/types/revision";

export class ThesisFinalizerService {
  constructor(private supabase: SupabaseClient) {}

  async getAdvisorComments(thesisId: string | null): Promise<AdvisorComment[]> {
    if (!thesisId) return [];

    const { data, error } = await this.supabase
      .from('advisor_comments')
      .select('*')
      .eq('thesis_id', thesisId)
      .eq('status', 'pending'); // only pending comments? or integrated too? Todo says check status.

    if (error) {
      console.error("Error fetching advisor comments:", error);
      return [];
    }
    return data as AdvisorComment[];
  }

  async runAdvisorAlignedRevision(job: RevisionJob): Promise<RevisionResult> {
    const response = await fetch('/api/thesis/revision/advisor-aligned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Advisor revision failed: ${response.status}`);
    }

    return await response.json();
  }

  async runBasicRevision(text: string, instruction?: string): Promise<{ revisedText: string }> {
    const response = await fetch('/api/thesis/revision/basic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, instruction }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Basic revision failed: ${response.status}`);
    }

    return await response.json();
  }
}
