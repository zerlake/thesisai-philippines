export type PaddleBlockType =
  | "heading"
  | "paragraph"
  | "table"
  | "figure"
  | "equation"
  | "list"
  | "citation"
  | "footnote";

export interface PaddleTextBlock {
  type: PaddleBlockType;
  text: string;
  bbox: [number, number, number, number];
  page: number;
  confidence?: number | null;
  children?: PaddleTextBlock[] | null;
}

export interface PaddleTableCell {
  text: string;
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
  is_header: boolean;
}

export interface PaddleTableData {
  id: string;
  page: number;
  bbox: [number, number, number, number];
  rows: number;
  columns: number;
  cells: PaddleTableCell[];
}

export interface PaddleDocumentParseResult {
  document_id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  parser_version: string;
  started_at: string;
  completed_at?: string | null;
  total_pages?: number | null;
  blocks: PaddleTextBlock[];
  tables: PaddleTableData[];
  markdown: string;
  metadata: Record<string, unknown>;
  error?: string | null;
}

export interface PaddleParseResponse {
  task_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  result?: PaddleDocumentParseResult | null;
}
