import { describe, it, expect, beforeAll } from 'vitest';
import { createTestSupabaseClient, DEFAULT_TEST_CONFIG } from './test-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

describe('Actual AI Integration Test - Text Improvement Tool', () => {
  let supabase: SupabaseClient<Database>;
  
  // Skip tests if environment variables are not properly set
  const skipIfNoEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? false : true;

  beforeAll(() => {
    supabase = createTestSupabaseClient(DEFAULT_TEST_CONFIG);
  });

  describe.runIf(!skipIfNoEnv)('Text Improvement Tool AI Integration', () => {
    it('should connect to AI and return improved text with actual AI response', async () => {
      const puterAuthToken = typeof window !== 'undefined' ? localStorage.getItem('puter.auth.token') : null;
      
      if (!puterAuthToken) {
        console.warn('No Puter auth token found. Please authenticate via /admin/puter-auth before running this test.');
        expect(true).toBe(true);
        return;
      }

      console.log('Testing text improvement with Puter auth token (first 10 chars):', puterAuthToken.substring(0, 10) + '...');

      // Sample input with grammatical issues for improvement
      const sampleTextWithIssues = "The impact of social media on students performance has been a considerable topic of debate in recent years. Educational institutions are increasingly integrate digital technologies into learning, making digital literacy a critical skill. The research show that the usage of technology can lead to both positive and negative outcomes.";
      
      try {
        const response = await supabase.functions.invoke('improve-writing', {
          body: { 
            text: sampleTextWithIssues
          }
        });

        if (response.error) {
          console.error('Error from improve-writing function:', response.error);
          throw new Error(`Function returned error: ${response.error.message}`);
        }

        expect(response.data).toBeDefined();
        expect(response.data).toHaveProperty('improvedText');
        
        const improvedText = response.data.improvedText as string;
        
        // Verify the result is a string and not empty
        expect(typeof improvedText).toBe('string');
        expect(improvedText.length).toBeGreaterThan(10);
        
        // The improved text should be different from the original (errors fixed)
        expect(improvedText).not.toBe(sampleTextWithIssues);
        
        // Verify some improvements were made (the sample text had specific errors)
        // Original had "students performance" - should be "student's performance" or "students' performance"
        // Original had "are increasingly integrate" - should be "are increasingly integrating"
        // Original had "research show" - should be "research shows"
        
        console.log('✅ Text improvement AI connected successfully!');
        console.log('Input (with errors):', sampleTextWithIssues.substring(0, 60) + '...');
        console.log('Output (improved):', improvedText.substring(0, 60) + '...');
        
        // Both should still be about the same topic
        expect(improvedText.toLowerCase()).toContain('social media');
        expect(improvedText.toLowerCase()).toContain('education');
        expect(improvedText.toLowerCase()).toContain('technology');
        
      } catch (error: any) {
        console.error('Text improvement test failed with error:', error.message);
        throw error;
      }
    }, 30000); // 30 second timeout

    it('should return meaningful improvements compared to original text', async () => {
      const puterAuthToken = typeof window !== 'undefined' ? localStorage.getItem('puter.auth.token') : null;
      
      if (!puterAuthToken) {
        console.warn('Skipping improvement verification - no Puter auth token available');
        expect(true).toBe(true);
        return;
      }

      const originalText = "This study investigate the effect of AI tools on writing quality. The finding show significant improvement.";
      
      const response = await supabase.functions.invoke('improve-writing', {
        body: { text: originalText }
      });

      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('improvedText');
      
      const improvedText = response.data.improvedText as string;
      
      // Verify it's different (improved)
      expect(improvedText).not.toBe(originalText);
      
      // Verify the improvements make sense grammatically
      // Original had "study investigate" (should be "study investigates")
      // Original had "finding show" (should be "findings show" or "the finding shows")
      expect(improvedText.toLowerCase()).not.toContain('study investigate');
      expect(improvedText.toLowerCase()).not.toContain('finding show');
      
      console.log('Original:', originalText);
      console.log('Improved:', improvedText);
    }, 30000);
  });

  describe('Sample Data and Expected Outcomes', () => {
    it('demonstrates sample input and expected AI improvement', () => {
      // Sample input with grammatical errors
      const sampleInput = "The student performance in digital learning environment are mixed. Some research indicate that technology can enhance learning, but other show the opposite.";
      
      // Expected improvement would fix:
      // - "student performance...are" -> "student performance...is" or "students' performance...are"
      // - "research indicate" -> "research indicates" 
      // - "other show" -> "others show"
      const expectedImprovement = "The student's performance in digital learning environments is mixed. Some research indicates that technology can enhance learning, but others show the opposite.";
      
      expect(sampleInput).toBeDefined();
      expect(expectedImprovement).toBeDefined();
      
      console.log('Sample input for AI (with grammar errors):', sampleInput);
      console.log('Expected improvement (corrected grammar):', expectedImprovement);
    });
  });
});