// Define types for thesis structure and navigation

export interface DocumentTreeNode {
  id: string;
  type: 'chapter' | 'section' | 'subsection' | 'paragraph' | 'figure' | 'table' | 'equation';
  title: string;
  contentPreview: string;
  wordCount: number;
  academicScore: number; // 0-100
  children: DocumentTreeNode[];
  status?: 'complete' | 'in_progress' | 'needs_review' | 'draft';
}

export interface StructureAnalysisResult {
  documentId: string;
  structureMap: DocumentTreeNode[];
  flowScore: number; // 0-100
  complianceScore: number; // 0-100
  recommendations: StructureRecommendation[];
  citationMap: any[]; // Cross-reference mapping
  sectionProperties: Record<string, SectionMetadata>;
  summary: AnalysisSummary;
}

export interface StructureRecommendation {
  id: string;
  type: 'reorganization' | 'content_placement' | 'flow_improvement' | 'compliance' | 'cross_reference' | 'content_expansion' | 'content_improvement' | 'structural_missing';
  title: string;
  description: string;
  suggestedChanges: ChangeInstruction[];
  priority: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0-100
  estimatedTime: number; // Minutes to implement
  effectivenessEstimate: number; // Expected impact (0-100)
}

export interface ChangeInstruction {
  action: 'move' | 'insert' | 'delete' | 'modify' | 'combine' | 'split' | 'add_transitions' | 'expand_content' | 'revise_academic_tone' | 'add_chapter' | 'add_missing_elements';
  targetLocation: string; // Section ID
  content: string;
  reason: string; // Why this change is recommended
}

export interface SectionMetadata {
  completeness: number; // 0-100
  complexity: 'basic' | 'intermediate' | 'advanced';
  keyCitations: string[];
  relatedSections: string[];
  writingQuality: number; // 0-100
  estimatedTime: number; // Time needed to complete (in minutes)
}

export interface AnalysisSummary {
  totalChapters: number;
  totalSections: number;
  totalWordCount: number;
  averageQuality: number; // 0-100
}

// Cross-reference types
export type CrossReferenceType = 
  | 'addresses'
  | 'builds_on' 
  | 'identifies_gap_for'
  | 'informs'
  | 'supports_or_contrasts'
  | 'validates_or_refutes'
  | 'interprets'
  | 'connects_to'
  | 'summarizes'
  | 'establishes'
  | 'establishes_significance'
  | 'related_to'
  | 'none';

export interface CrossReference {
  sourceSectionId: string;
  targetSectionId: string;
  type: CrossReferenceType;
  strength: number; // 0-100 confidence in relationship
  description: string;
}

export interface CitationCrossReference {
  citationId: string;
  citationText: string;
  referencedInSectionIds: string[];
  usageQuality: 'adequate' | 'missing' | 'overused' | 'underutilized';
}