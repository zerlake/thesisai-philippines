import { z } from 'zod';

/**
 * Input validation schemas for API routes
 * Using Zod for runtime type safety and XSS/injection prevention
 */

// Search query validation
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Search query required')
    .max(500, 'Query too long')
    .trim(),
  limit: z.number().int().min(1).max(100).optional().default(10),
  offset: z.number().int().min(0).optional().default(0),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Message validation
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long')
    .trim(),
  threadId: z.string().uuid('Invalid thread ID'),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
});

export type MessageInput = z.infer<typeof messageSchema>;

// Email validation
export const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000),
  recipientName: z.string().max(200).optional(),
});

export type EmailInput = z.infer<typeof emailSchema>;

// Citation validation
export const citationSchema = z.object({
  title: z.string().min(1).max(500),
  authors: z.array(z.string()).min(1).max(50),
  year: z.number().int().min(1900).max(2100),
  doi: z.string().optional(),
  url: z.string().url().optional(),
  source: z.enum(['arxiv', 'scholar', 'mendeley', 'manual']),
});

export type Citation = z.infer<typeof citationSchema>;

// Thesis phase validation
export const thesisPhaseSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  phase: z.enum(['introduction', 'literature-review', 'methodology', 'analysis', 'conclusion']),
  order: z.number().int().min(0).optional(),
});

export type ThesisPhaseInput = z.infer<typeof thesisPhaseSchema>;

// Generic validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Validation failed' } };
  }
}
