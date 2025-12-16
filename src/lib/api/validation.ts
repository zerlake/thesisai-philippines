// src/lib/api/validation.ts
import { z } from 'zod';
import { NextRequest } from 'next/server';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().max(50, 'Last name too long').optional(),
  role: z.enum(['student', 'advisor', 'critic', 'admin']).default('student'),
  universityId: z.string().uuid('Invalid university ID').optional(),
  academicLevel: z.enum(['undergraduate', 'master', 'doctoral', 'faculty']).optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
});

export const updateUserSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  role: z.enum(['student', 'advisor', 'critic', 'admin']).optional(),
  universityId: z.string().uuid('Invalid university ID').optional(),
  academicLevel: z.enum(['undergraduate', 'master', 'doctoral', 'faculty']).optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});

// Thesis project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  subtitle: z.string().max(300, 'Subtitle too long').optional(),
  abstract: z.string().max(5000, 'Abstract too long').optional(),
  keywords: z.array(z.string()).max(20, 'Too many keywords').optional(),
  language: z.enum(['en', 'fil', 'ceb']).default('en'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format (YYYY-YYYY)').optional(),
  semester: z.enum(['1st', '2nd', 'summer']).optional(),
  advisorId: z.string().uuid('Invalid advisor ID').optional(),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long').optional(),
  subtitle: z.string().max(300, 'Subtitle too long').optional(),
  abstract: z.string().max(5000, 'Abstract too long').optional(),
  keywords: z.array(z.string()).max(20, 'Too many keywords').optional(),
  status: z.enum(['initiated', 'draft', 'in_review', 'revisions', 'approved', 'submitted', 'published', 'archived']).optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format').optional(),
  semester: z.enum(['1st', '2nd', 'summer']).optional(),
  advisorId: z.string().uuid('Invalid advisor ID').optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

// Document validation schemas
export const createDocumentSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  type: z.enum(['proposal', 'chapter', 'full_document', 'appendix', 'presentation', 'review_form', 'approval_form']),
  content: z.string().max(1000000, 'Document content too large').optional(), // 1MB limit
  fileName: z.string().max(255, 'File name too long').optional(),
  fileType: z.string().optional(), // e.g., 'application/pdf', 'text/plain'
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  type: z.enum(['proposal', 'chapter', 'full_document', 'appendix', 'presentation', 'review_form', 'approval_form']).optional(),
  content: z.string().max(1000000, 'Document content too large').optional(), // 1MB limit
  status: z.enum(['draft', 'review_requested', 'in_review', 'review_completed', 'approved', 'revisions_needed', 'published']).optional(),
  versionNumber: z.number().int().positive().optional(),
});

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  reviewerId: z.string().uuid('Invalid reviewer ID'),
  studentId: z.string().uuid('Invalid student ID'),
  comment: z.string().min(1, 'Comment is required').max(5000, 'Comment too long'),
  feedbackType: z.enum(['structural', 'content', 'style', 'formatting', 'research', 'methodology', 'conclusion', 'other']).optional(),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']).default('moderate'),
  suggestedRevisions: z.array(z.string()).optional(),
  resolved: z.boolean().default(false),
});

// AI Tool usage validation
export const aiToolUsageSchema = z.object({
  toolName: z.string().min(1, 'Tool name is required').max(100, 'Tool name too long'),
  actionType: z.enum(['create', 'modify', 'analyze', 'suggest', 'generate', 'summarize', 'translate', 'other']),
  inputData: z.record(z.unknown()).optional(), // Flexible input data
  outputData: z.record(z.unknown()).optional(), // Flexible output data
  tokensUsed: z.number().int().min(0).optional(),
  processingTimeMs: z.number().int().min(0).optional(),
  costCredits: z.number().min(0).optional(),
  success: z.boolean().default(true),
});

// Topic idea validation
export const createTopicIdeaSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters').max(500, 'Topic too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  fieldOfStudy: z.string().max(100, 'Field of study too long').optional(),
  researchQuestions: z.array(z.string()).max(10, 'Too many research questions').optional(),
  potentialApproaches: z.array(z.string()).max(10, 'Too many approaches').optional(),
  feasibilityScore: z.number().min(1).max(10).optional(),
  noveltyScore: z.number().min(1).max(10).optional(),
  potentialImpact: z.string().max(500, 'Potential impact too long').optional(),
});

// Citation validation
export const createCitationSchema = z.object({
  sourceTitle: z.string().min(1, 'Source title is required').max(1000, 'Source title too long'),
  authors: z.array(z.string()).max(50, 'Too many authors').optional(),
  publicationYear: z.number().int().min(1900).max(2100).optional(),
  journal: z.string().max(500, 'Journal name too long').optional(),
  volume: z.string().max(20, 'Volume number too long').optional(),
  issue: z.string().max(20, 'Issue number too long').optional(),
  pages: z.string().max(20, 'Page range too long').optional(),
  doi: z.string().max(200, 'DOI too long').optional(),
  url: z.string().url('Invalid URL').optional(),
  citationType: z.enum(['journal', 'book', 'conference', 'thesis', 'report', 'website', 'other']),
  citationStyle: z.enum(['apa', 'mla', 'chicago', 'harvard', 'ieee', 'ama', 'other']),
  citationText: z.string().min(1, 'Citation text is required').max(2000, 'Citation too long'),
  isOriginalSource: z.boolean().optional(),
  qualityScore: z.number().min(1).max(5).optional(),
  relevanceScore: z.number().min(1).max(5).optional(),
  usedInChapters: z.array(z.string()).optional(),
});

// Checklist validation
export const createChecklistItemSchema = z.object({
  phaseName: z.string().min(1, 'Phase name is required').max(100, 'Phase name too long'),
  checklistItem: z.string().min(1, 'Checklist item is required').max(500, 'Checklist item too long'),
  itemOrder: z.number().int().optional(),
  isRequired: z.boolean().default(true),
  isCompleted: z.boolean().default(false),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

// Milestone validation
export const createMilestoneSchema = z.object({
  milestoneName: z.string().min(1, 'Milestone name is required').max(200, 'Milestone name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  actualCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'overdue', 'cancelled']).default('not_started'),
  progressPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
});

// Group validation
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(200, 'Group name too long'),
  description: z.string().max(1000, 'Group description too long').optional(),
  groupType: z.enum(['thesis', 'research', 'study', 'collaboration', 'other']).optional(),
  maxMembers: z.number().int().min(1).max(100).optional(),
  isPublic: z.boolean().default(false),
});

// Literature collection validation
export const createCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  collectionType: z.enum(['course_reading', 'thesis_sources', 'research_pool', 'favorites', 'other']).optional(),
});

// Literature item validation
export const createLiteratureItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  authors: z.array(z.string()).max(50, 'Too many authors').optional(),
  journal: z.string().max(500, 'Journal name too long').optional(),
  publicationYear: z.number().int().min(1900, 'Publication year too early').max(2100, 'Publication year too late').optional(),
  doi: z.string().max(200, 'DOI too long').optional(),
  url: z.string().url('Invalid URL').optional(),
  abstract: z.string().max(10000, 'Abstract too long').optional(),
  keywords: z.array(z.string()).max(50, 'Too many keywords').optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  readStatus: z.enum(['unread', 'in_progress', 'read', 'important', 'discarded']).default('unread'),
});

// Common validation utilities
export const validateRequestBody = <T extends z.ZodSchema>(schema: T, data: any): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

export const validateQueryParams = <T extends z.ZodSchema>(schema: T, params: any): z.infer<T> => {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Query parameter validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Request validation middleware
export const validateRequest = async <T extends z.ZodSchema>(
  req: NextRequest,
  schema: T,
  source: 'body' | 'query' = 'body'
): Promise<z.infer<T>> => {
  try {
    if (source === 'body') {
      const body = await req.json();
      return validateRequestBody(schema, body);
    } else {
      const queryParams = Object.fromEntries(req.nextUrl.searchParams);
      return validateQueryParams(schema, queryParams);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};