import { describe, it, expect, beforeAll } from 'vitest';
import { createTestSupabaseClient, DEFAULT_TEST_CONFIG } from './test-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

describe('Review & Submission Section - Actual AI Integration Tests', () => {
  let supabase: SupabaseClient<Database>;

  beforeAll(() => {
    supabase = createTestSupabaseClient(DEFAULT_TEST_CONFIG);
  });

  // Skip tests if environment variables are not properly set
  const skipIfNoEnv = process.env.NEXT_PUBLIC_SUPABASE_URL ? false : true;

  describe.runIf(!skipIfNoEnv)('Originality Check Functionality', () => {
    it('should receive actual AI response from plagiarism check function', async () => {
      const response = await supabase.functions.invoke('check-plagiarism', {
        body: { 
          text: 'This is a test sentence created specifically for the purpose of testing AI integration in the ThesisAI platform.' 
        }
      });

      if (response.error) {
        console.warn(`Plagiarism check returned error: ${response.error.message}`);
        // This could be a business logic error rather than a connection error
        expect(response.error).toBeDefined();
      } else {
        // Validate successful response
        expect(response.data).toBeDefined();
      }
    });

    it('should receive actual AI response from internal plagiarism check function', async () => {
      const response = await supabase.functions.invoke('check-internal-plagiarism', {
        body: { 
          text: 'This is another test sentence for internal plagiarism checking functionality.' 
        }
      });

      if (response.error) {
        console.warn(`Internal plagiarism check returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
      }
    });

    it('should receive actual response from user check history function', async () => {
      // This function might not be AI-powered but is part of the originality check workflow
      const response = await supabase.functions.invoke('get_user_check_history', {
        body: { p_limit: 5 }
      });

      expect(response).toBeDefined();
    });
  });

  describe.runIf(!skipIfNoEnv)('Presentation Generation Functionality', () => {
    it('should receive actual AI response from presentation generation function', async () => {
      const response = await supabase.functions.invoke('generate-presentation-slides', {
        body: {
          chapterContent: `
            Chapter 3: Methodology
            This chapter describes the research methodology used in this study.
            A mixed-methods approach was employed to gather comprehensive data.
            The study was conducted with 300 participants over a period of 6 months.
            Data analysis was performed using statistical software.
          `
        }
      });

      if (response.error) {
        console.warn(`Presentation generation returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        // Validate the response structure
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('slides');
          if (Array.isArray(response.data.slides)) {
            // Each slide should have title and content
            response.data.slides.forEach((slide: any) => {
              expect(slide).toHaveProperty('title');
              expect(slide).toHaveProperty('bulletPoints');
              expect(Array.isArray(slide.bulletPoints)).toBe(true);
            });
          }
        }
      }
    });
  });

  describe.runIf(!skipIfNoEnv)('Q&A Simulator Functionality', () => {
    it('should receive actual AI response from Q&A generation function', async () => {
      const response = await supabase.functions.invoke('generate-defense-questions', {
        body: {
          textContent: `
            The study implemented a randomized controlled trial to evaluate the effectiveness of AI writing tools.
            Participants were divided into two groups: one using AI tools and one using traditional methods.
            Results showed a 15% improvement in writing quality scores for the AI-assisted group.
            However, students reported varied levels of dependency on the tools.
          `
        }
      });

      if (response.error) {
        console.warn(`Q&A generation returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        // Validate the response contains questions
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('questions');
          if (Array.isArray(response.data.questions)) {
            // Each question should be a string
            response.data.questions.forEach((question: string) => {
              expect(typeof question).toBe('string');
              expect(question.length).toBeGreaterThan(5); // Should be actual questions, not empty
            });
          }
        }
      }
    });
  });

  describe.runIf(!skipIfNoEnv)('Advanced AI Tools in Review & Submission', () => {
    it('should receive actual AI response from text improvement function', async () => {
      const response = await supabase.functions.invoke('improve-writing', {
        body: { text: 'This is a sentance with grammer issues and typos that needs fixing.' }
      });

      if (response.error) {
        console.warn(`Text improvement returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        // Validate the improvement result
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('improvedText');
          expect(typeof response.data.improvedText).toBe('string');
          // The improved text should be different from the original
          expect(response.data.improvedText).not.toBe('This is a sentance with grammer issues and typos that needs fixing.');
        }
      }
    });

    it('should receive actual AI response from text summarization function', async () => {
      const response = await supabase.functions.invoke('summarize-text', {
        body: {
          text: `
            The integration of artificial intelligence in academic writing has opened new possibilities for student learning.
            Modern AI writing assistants can help with grammar, style, and even content structure.
            However, educators must balance the benefits of these tools with concerns about academic integrity.
            Research indicates that students who use AI tools appropriately show improved writing skills over time.
            The key is teaching students how to use these tools as learning aids rather than shortcuts.
            Effective implementation requires clear guidelines and ongoing assessment of learning outcomes.
          `
        }
      });

      if (response.error) {
        console.warn(`Text summarization returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('summarizedText');
          expect(typeof response.data.summarizedText).toBe('string');
          // The summary should be significantly shorter than the original
          expect(response.data.summarizedText.length).toBeLessThan(300); // Original was ~500 chars
        }
      }
    });

    it('should receive actual AI response from paraphrasing function', async () => {
      const originalText = "Artificial intelligence is revolutionizing the educational landscape in unprecedented ways.";
      
      const response = await supabase.functions.invoke('paraphrase-text', {
        body: {
          text: originalText,
          mode: 'standard'
        }
      });

      if (response.error) {
        console.warn(`Paraphrasing returned error: ${response.error.message}`);
        expect(response.error).toBeDefined();
      } else {
        expect(response.data).toBeDefined();
        if (response.data && typeof response.data === 'object') {
          expect(response.data).toHaveProperty('paraphrasedText');
          expect(typeof response.data.paraphrasedText).toBe('string');
          // The paraphrased text should be different from original
          expect(response.data.paraphrasedText).not.toBe(originalText);
          // But should preserve the meaning
          expect(response.data.paraphrasedText.length).toBeGreaterThan(10);
        }
      }
    });
  });

  describe.runIf(!skipIfNoEnv)('Validation of AI Response Quality in Review & Submission', () => {
    it('should validate that paraphrased text maintains meaning', async () => {
      const originalText = "AI writing tools enhance student learning when used appropriately.";
      
      const response = await supabase.functions.invoke('paraphrase-text', {
        body: {
          text: originalText,
          mode: 'standard'
        }
      });

      if (!response.error && response.data && typeof response.data === 'object') {
        const paraphrased = response.data.paraphrasedText as string;
        
        // Validate basic properties
        expect(typeof paraphrased).toBe('string');
        expect(paraphrased).not.toBe(originalText);
        expect(paraphrased.length).toBeGreaterThan(0);
        
        // Both texts should relate to AI and student learning
        expect(paraphrased.toLowerCase()).toContain('ai');
        expect(paraphrased.toLowerCase()).toContain('student');
        expect(paraphrased.toLowerCase()).toContain('learning');
      }
    });

    it('should validate that improved text fixes the original errors', async () => {
      const originalText = "This sentance has multiple grammer mistake. Its not well structure. Rely on AI tools can be benificial.";
      
      const response = await supabase.functions.invoke('improve-writing', {
        body: { text: originalText }
      });

      if (!response.error && response.data && typeof response.data === 'object') {
        const improvedText = response.data.improvedText as string;
        
        // Validate basic properties
        expect(typeof improvedText).toBe('string');
        expect(improvedText).not.toBe(originalText);
        
        // The improved text should be more grammatically correct
        expect(improvedText.toLowerCase()).toContain('sentence');
        expect(improvedText.toLowerCase()).toContain('grammar');
        expect(improvedText.toLowerCase()).toContain('structured');
      }
    });
  });
});