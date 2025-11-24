import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockSupabaseClient,
  describeToolTests,
  TestDataGenerator,
  TestAssertions,
  PerformanceTracker,
  setupTestEnvironment
} from './puter-ai-helpers';

/**
 * Example integration tests for Puter AI tools
 * Demonstrates how to test various dashboard tools
 */

setupTestEnvironment();

describe('Puter AI Example Tests', () => {
  let supabase: any;
  let performanceTracker: PerformanceTracker;

  beforeEach(() => {
    supabase = createMockSupabaseClient();
    performanceTracker = new PerformanceTracker();
  });

  describe('Topic Generation Tools', () => {
    it('should generate topic ideas within reasonable time', async () => {
      const result = await performanceTracker.measure('generate-topic-ideas', async () => {
        return supabase.functions.invoke('generate-topic-ideas', {
          body: { field: 'Computer Science' }
        });
      });

      TestAssertions.isValidResponse(result);
      TestAssertions.hasExpectedFields(result.data, ['ideas']);

      const stats = performanceTracker.getStats('generate-topic-ideas');
      expect(stats?.mean).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should generate multiple topic suggestions', async () => {
      const response = await supabase.functions.invoke('generate-topic-ideas', {
        body: { field: 'Data Science', level: 'Master' }
      });

      TestAssertions.hasExpectedFields(response.data, ['ideas']);
      expect(Array.isArray(response.data.ideas)).toBe(true);
      expect(response.data.ideas.length).toBeGreaterThan(0);
    });
  });

  describe('Research Question Tools', () => {
    it('should generate research questions from topic', async () => {
      const topic = TestDataGenerator.generateTopic();

      const response = await supabase.functions.invoke('generate-research-questions', {
        body: {
          topic,
          context: 'thesis research'
        }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toHaveProperty('questions');
      expect(Array.isArray(response.data.questions)).toBe(true);
    });

    it('should generate contextual research questions', async () => {
      const response = await supabase.functions.invoke('generate-research-questions', {
        body: {
          topic: 'Machine Learning',
          context: 'thesis',
          numberOfQuestions: 5
        }
      });

      expect(response.data.questions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Writing Improvement Tools', () => {
    it('should paraphrase text', async () => {
      const originalText = TestDataGenerator.generateText(50);

      const response = await supabase.functions.invoke('paraphrase-text', {
        body: {
          text: originalText,
          mode: 'standard'
        }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toHaveProperty('paraphrased');
      expect(typeof response.data.paraphrased).toBe('string');
      expect(response.data.paraphrased.length).toBeGreaterThan(0);
    });

    it('should improve writing quality', async () => {
      const poorText = 'The studys shows many datas about the thing.';

      const response = await supabase.functions.invoke('improve-writing', {
        body: { text: poorText }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toHaveProperty('improved');

      // Improved text should be different from original
      expect(response.data.improved).not.toEqual(poorText);
    });
  });

  describe('Document Analysis Tools', () => {
    it('should analyze document structure', async () => {
      const document = TestDataGenerator.generateDocument();

      const response = await supabase.functions.invoke('analyze-document', {
        body: {
          content: document,
          documentType: 'thesis'
        }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toBeDefined();
    });

    it('should check document for plagiarism', async () => {
      const text = TestDataGenerator.generateText(200);

      const response = await supabase.functions.invoke('check-plagiarism', {
        body: { text }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toHaveProperty('similarity');
      expect(typeof response.data.similarity).toBe('number');
      expect(response.data.similarity).toBeGreaterThanOrEqual(0);
      expect(response.data.similarity).toBeLessThanOrEqual(100);
    });
  });

  describe('Outline Generation Tools', () => {
    it('should generate thesis outline', async () => {
      const response = await supabase.functions.invoke('generate-outline', {
        body: {
          topic: 'Machine Learning in Healthcare',
          level: 'thesis'
        }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toHaveProperty('outline');
      expect(Array.isArray(response.data.outline) || typeof response.data.outline === 'object').toBe(true);
    });

    it('should generate outline with multiple sections', async () => {
      const response = await supabase.functions.invoke('generate-outline', {
        body: {
          topic: TestDataGenerator.generateTopic(),
          level: 'master',
          numberOfSections: 6
        }
      });

      expect(response.data.outline.length ?? Object.keys(response.data.outline).length).toBeGreaterThan(0);
    });
  });

  describe('Presentation Tools', () => {
    it('should generate presentation slides', async () => {
      const content = TestDataGenerator.generateDocument();

      const response = await supabase.functions.invoke('generate-presentation-slides', {
        body: {
          chapterContent: content,
          numberOfSlides: 5
        }
      });

      TestAssertions.isValidResponse(response);
      expect(response.data).toBeDefined();
    });

    it('should generate defense preparation questions', async () => {
      const thesisContent = TestDataGenerator.generateDocument();

      const response = await supabase.functions.invoke('generate-defense-questions', {
        body: {
          textContent: thesisContent,
          difficulty: 'intermediate'
        }
      });

      TestAssertions.isValidResponse(response);
      if (response.data.questions) {
        expect(Array.isArray(response.data.questions)).toBe(true);
      }
    });
  });

  describe('Batch Tool Execution', () => {
    it('should execute multiple tools in parallel', async () => {
      const text = TestDataGenerator.generateText(100);

      const [grammarResponse, improvementResponse, summaryResponse] = await Promise.all([
        supabase.functions.invoke('check-grammar', { body: { text } }),
        supabase.functions.invoke('improve-writing', { body: { text } }),
        supabase.functions.invoke('summarize-text', { body: { text } })
      ]);

      TestAssertions.isValidResponse(grammarResponse);
      TestAssertions.isValidResponse(improvementResponse);
      TestAssertions.isValidResponse(summaryResponse);
    });

    it('should handle mixed success/failure in batch', async () => {
      const mockClient = createMockSupabaseClient({
        'generate-outline': { error: 'Service unavailable' },
        'generate-topic-ideas': { data: { ideas: ['Topic 1'] } }
      });

      const responses = await Promise.all([
        mockClient.functions.invoke('generate-outline', { body: {} }),
        mockClient.functions.invoke('generate-topic-ideas', { body: {} })
      ]);

      expect(responses[0].error).toBeDefined();
      expect(responses[1].data).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance of multiple tool calls', async () => {
      const tools = [
        'generate-topic-ideas',
        'generate-research-questions',
        'generate-outline'
      ];

      for (const tool of tools) {
        await performanceTracker.measure(tool, async () => {
          return supabase.functions.invoke(tool, { body: {} });
        });
      }

      const report = performanceTracker.getReport();
      console.log('\n=== Performance Report ===');
      console.table(report);

      // Verify metrics were recorded
      expect(Object.keys(report).length).toBe(tools.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const response = await supabase.functions.invoke('generate-outline', {
        body: {} // Missing required fields
      });

      // Should either return error or provide defaults
      expect(response.error || response.data).toBeDefined();
    });

    it('should handle invalid input types', async () => {
      const response = await supabase.functions.invoke('check-plagiarism', {
        body: {
          text: 12345 // Should be string
        }
      });

      // Should handle gracefully
      expect(response).toBeDefined();
    });

    it('should handle non-existent functions', async () => {
      const response = await supabase.functions.invoke('non-existent-tool', {
        body: {}
      });

      expect(response.error).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should return valid JSON responses', async () => {
      const response = await supabase.functions.invoke('generate-topic-ideas', {
        body: { field: 'CS' }
      });

      TestAssertions.isValidJSON(response.data);
    });

    it('should return data in expected format', async () => {
      const response = await supabase.functions.invoke('generate-research-questions', {
        body: { topic: 'ML' }
      });

      TestAssertions.hasExpectedFields(response.data, ['questions']);
      expect(Array.isArray(response.data.questions)).toBe(true);
    });
  });
});

// Use helper to describe additional tools
describeToolTests(
  'Flashcard Generator',
  'generate-flashcards',
  {
    content: TestDataGenerator.generateText(200),
    topic: 'Machine Learning'
  },
  ['flashcards', 'cards']
);

describeToolTests(
  'Variable Mapper',
  'map-variables',
  {
    variables: ['Var1', 'Var2', 'Var3'],
    framework: 'research'
  }
);

describeToolTests(
  'Research Gap Identifier',
  'identify-research-gaps',
  {
    topic: TestDataGenerator.generateTopic(),
    literature: TestDataGenerator.generateText(300)
  },
  ['gaps', 'opportunities']
);
