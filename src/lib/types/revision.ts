export interface RevisionJob {
  thesisId: string;
  chapterId: "chapter-1" | "chapter-2" | "chapter-3" | "chapter-4" | "chapter-5";
  revisionScope: "paragraph" | "section" | "chapter";
  scopeId: string;
  originalText: string;
  advisorComments: string;
  advisorCommentIds?: string[]; // IDs of comments included in this job
  studentInstructions?: string;
  protectedSpans: { label: string; text: string }[];
  rewriteLevel: "polish" | "light_revision" | "deep_revision";
  styleConstraints?: {
    citationStyle?: "APA7";
    voice?: "formal_academic";
    maxChangeRatio?: number;
  };
  outputFormat: "text_only" | "text_with_diff" | "text_and_rationale";
}

export interface RevisionResult {
  advisor_requirements_checklist: string[];
  requirement_status: ("already_fully_satisfied" | "partially_satisfied" | "not_satisfied")[];
  revised_text: string;
  diff_notes: string;
}
