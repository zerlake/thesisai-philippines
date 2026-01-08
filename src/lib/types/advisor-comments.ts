export type AdvisorCommentStatus = "pending" | "integrated" | "verified";

export interface AdvisorComment {
  id: string; // UUID
  thesis_id: string;
  chapter_id: "chapter-1" | "chapter-2" | "chapter-3" | "chapter-4" | "chapter-5";
  scope_id: string;            // e.g., "chapter2.theoretical_framework"
  raw_text: string;            // advisor’s exact comment
  status: AdvisorCommentStatus;
  created_at: string;
  updated_at: string;
}

export interface ChapterSection {
  id: string;
  thesis_id: string;
  chapter_id: string;
  section_id: string;
  current_text: string;
  last_snapshot_hash: string | null;
  updated_at: string;
}
