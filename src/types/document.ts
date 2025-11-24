export type Document = {
  id: string;
  title: string | null;
  updated_at: string;
  content?: string | null;
  wordCount?: number;
};