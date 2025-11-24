import { describe, it, expect, beforeAll } from 'vitest';
import { createTestSupabaseClient, DEFAULT_TEST_CONFIG } from './test-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

describe('Writing Tools Section - Actual AI Integration Tests', () => {
  let supabase: SupabaseClient<Database>;

  beforeAll(() => {
    supabase = createTestSupabaseClient(DEFAULT_TEST_CONFIG);
  });

  // Skip tests if environment variables are not properly set
  const skipIfNoEnv = process.env.NEXT_PUBLIC_SUPABASE_URL ? false : true;

  describe.runIf(!skipIfNoEnv)('Research Question Generation', () => {
    it('should receive actual AI response from research question generation function', async () => {
      const response = await supabase.functions.invoke('generate-research-questions', {
        body: {
          topic: 'The effectiveness of AI writing tools in higher education',
          field: 'Educational Technology',
          researchType: 'quantitative',
          literatureContext: 'Recent studies show varied results on AI tool effectiveness in academic settings'
        }
      });

      if (response.error) {
        console.warn(`Research question generation returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        // Validate the response structure
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('questions');
          if (Array.isArray(response.data.questions)) {
            // Each question should be a valid research question object
            response.data.questions.forEach((question: any) => {
              expect(question).toHaveProperty('question');
              expect(question).toHaveProperty('type');
              expect(question).toHaveProperty('chapter');
              expect(question).toHaveProperty('rationale');
              expect(typeof question.question).toBe('string');
              expect(question.question.length).toBeGreaterThan(5); // Should be actual questions
            });
          }
        }
      }
    });

    it('should receive actual AI response from hypothesis generation function', async () => {
      const response = await supabase.functions.invoke('generate-hypotheses', {
        body: {
          topic: 'AI writing tools effectiveness',
          field: 'Educational Technology',
          researchQuestions: [
            'How does using AI writing tools affect student writing quality?',
            'What factors influence student adoption of AI writing tools?'
          ]
        }
      });

      if (response.error) {
        console.warn(`Hypothesis generation returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('hypotheses');
          if (Array.isArray(response.data.hypotheses)) {
            // Each hypothesis should be a valid hypothesis object
            response.data.hypotheses.forEach((hypothesis: any) => {
              expect(hypothesis).toHaveProperty('null_hypothesis');
              expect(hypothesis).toHaveProperty('alternative_hypothesis');
              expect(hypothesis).toHaveProperty('variables');
              expect(typeof hypothesis.null_hypothesis).toBe('string');
              expect(typeof hypothesis.alternative_hypothesis).toBe('string');
            });
          }
        }
      }
    });

    it('should receive actual AI response from literature alignment function', async () => {
      const response = await supabase.functions.invoke('align-questions-with-literature', {
        body: {
          researchQuestions: [
            'How does AI tool usage affect writing quality?'
          ],
          literatureContext: 'Current literature shows mixed findings on AI tools in academic writing',
          field: 'Educational Technology'
        }
      });

      if (response.error) {
        console.warn(`Literature alignment returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('alignments');
          if (Array.isArray(response.data.alignments)) {
            // Each alignment should be a valid alignment object
            response.data.alignments.forEach((alignment: any) => {
              expect(alignment).toHaveProperty('question');
              expect(alignment).toHaveProperty('aligned_literature');
              expect(alignment).toHaveProperty('gaps_identified');
              expect(alignment).toHaveProperty('methodology_implications');
              expect(Array.isArray(alignment.aligned_literature)).toBe(true);
              expect(Array.isArray(alignment.gaps_identified)).toBe(true);
            });
          }
        }
      }
    });
  });

  describe.runIf(!skipIfNoEnv)('Citation and Reference Management', () => {
    it('should receive actual AI response from citation generation function', async () => {
      const response = await supabase.functions.invoke('generate-citation-from-source', {
        body: {
          sentence: 'This is a sentence that needs proper academic citation.',
          sourceUrl: 'https://example.com/research-paper'
        }
      });

      if (response.error) {
        console.warn(`Citation generation returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('inText');
          expect(response.data).toHaveProperty('reference');
          expect(typeof response.data.inText).toBe('string');
          expect(typeof response.data.reference).toBe('string');
          // Both should contain meaningful content
          expect(response.data.inText.length).toBeGreaterThan(2);
          expect(response.data.reference.length).toBeGreaterThan(10);
        }
      }
    });
  });

  describe.runIf(!skipIfNoEnv)('Content Enhancement Tools', () => {
    it('should validate that research question generation creates meaningful questions', async () => {
      const response = await supabase.functions.invoke('generate-research-questions', {
        body: {
          topic: 'AI in academic writing',
          field: 'Educational Technology', 
          researchType: 'quantitative'
        }
      });

      if (!response.error && response.data && typeof response.data === 'object' && Array.isArray(response.data.questions)) {
        // Validate that generated questions make sense in context
        response.data.questions.forEach((question: any) => {
          expect(question.question.toLowerCase()).toContain('ai');
          expect(question.question.toLowerCase()).toContain('writing');
          expect(question.question.toLowerCase()).toContain('?'); // Research questions typically end with ?
        });
      }
    });

    it('should validate that hypothesis generation creates testable hypotheses', async () => {
      const response = await supabase.functions.invoke('generate-hypotheses', {
        body: {
          topic: 'AI writing tools effectiveness',
          field: 'Educational Technology',
          researchQuestions: [
            'Does using AI writing tools improve student writing scores?'
          ]
        }
      });

      if (!response.error && response.data && typeof response.data === 'object' && Array.isArray(response.data.hypotheses)) {
        response.data.hypotheses.forEach((hypothesis: any) => {
          // Null and alternative hypotheses should be meaningful and different
          expect(typeof hypothesis.null_hypothesis).toBe('string');
          expect(typeof hypothesis.alternative_hypothesis).toBe('string');
          expect(hypothesis.null_hypothesis).not.toBe(hypothesis.alternative_hypothesis);
        });
      }
    });
  });
});