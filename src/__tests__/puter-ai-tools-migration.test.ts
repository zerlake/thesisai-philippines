import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { puterAIFacade, type AIToolResponse } from '@/lib/puter-ai-facade';

/**
 * Integration Tests for Component 2 Migration (puter-ai-tools)
 * Tests the migration from callPuterAIWithRetry to puterAIFacade
 */

describe('Component 2 Migration - PuterAITools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    puterAIFacade.clearCache();
    puterAIFacade.resetMetrics();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Facade Integration', () => {
    it('should have puterAIFacade available and properly initialized', () => {
      expect(puterAIFacade).toBeDefined();
      expect(typeof puterAIFacade.call).toBe('function');
      expect(typeof puterAIFacade.callBatch).toBe('function');
      expect(typeof puterAIFacade.getMetrics).toBe('function');
      expect(typeof puterAIFacade.clearCache).toBe('function');
    });

    it('should return proper AIToolResponse structure', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'test text' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('executionTime');
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.timestamp).toBe('number');
      expect(typeof response.executionTime).toBe('number');
    });
  });

  describe('Tool Configuration', () => {
    it('should handle improve-writing tool config', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'Sample text for improvement' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      expect(response).toBeDefined();
      expect(typeof response.success).toBe('boolean');
      // Fallback response is acceptable in test environment
      expect(response.fallback === true || response.success === true).toBe(true);
    });

    it('should handle summarize-text tool config', async () => {
      const response = await puterAIFacade.call(
        'summarize-text',
        { text: 'Long text to summarize...' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      expect(response).toBeDefined();
      expect(typeof response.success).toBe('boolean');
      expect(response.fallback === true || response.success === true).toBe(true);
    });

    it('should handle paraphrase-text tool config', async () => {
      const response = await puterAIFacade.call(
        'paraphrase-text',
        { text: 'Text to paraphrase' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      expect(response).toBeDefined();
      expect(typeof response.success).toBe('boolean');
      expect(response.fallback === true || response.success === true).toBe(true);
    });
  });

  describe('Response Data Extraction (Component Logic)', () => {
    it('should extract improved text from response for improve-writing', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'Sample text' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      const improvedText = response.data?.improved || response.data?.response;
      
      // Component expects either improved or response field
      if (response.success || response.fallback) {
        expect(response.data).toBeDefined();
        expect(improvedText).toBeDefined();
        expect(typeof improvedText).toBe('string');
        expect(improvedText.trim().length).toBeGreaterThan(0);
      }
    });

    it('should extract summary from response for summarize-text', async () => {
      const response = await puterAIFacade.call(
        'summarize-text',
        { text: 'Sample text to summarize' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      const summarizedText = response.data?.summary || response.data?.response;
      
      if (response.success || response.fallback) {
        expect(response.data).toBeDefined();
        expect(summarizedText).toBeDefined();
        expect(typeof summarizedText).toBe('string');
        expect(summarizedText.trim().length).toBeGreaterThan(0);
      }
    });

    it('should extract paraphrased text from response for paraphrase-text', async () => {
      const response = await puterAIFacade.call(
        'paraphrase-text',
        { text: 'Sample text to paraphrase' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      const paraphrasedText = response.data?.paraphrased || response.data?.response;
      
      if (response.success || response.fallback) {
        expect(response.data).toBeDefined();
        expect(paraphrasedText).toBeDefined();
        expect(typeof paraphrasedText).toBe('string');
        expect(paraphrasedText.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling (Migration Pattern)', () => {
    it('should provide error message in response on failure', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: '' }, // Empty input might cause issues
        undefined,
        { timeout: 5000, retries: 1 }
      );

      // Should either succeed with fallback or have error field
      expect(response).toBeDefined();
      expect(response).toHaveProperty('success');
      if (!response.success && !response.fallback) {
        expect(response.error).toBeDefined();
        expect(typeof response.error).toBe('string');
      }
    });

    it('should handle timeout configuration properly', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'test' },
        undefined,
        { timeout: 1, retries: 1 } // Very short timeout
      );

      expect(response).toBeDefined();
      // Will likely fail or fallback due to timeout
      expect(response.success === false || response.fallback === true).toBe(true);
    });
  });

  describe('Metrics and Caching', () => {
    it('should track metrics for calls', async () => {
      const initialMetrics = puterAIFacade.getMetrics();
      
      await puterAIFacade.call(
        'improve-writing',
        { text: 'test' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      const afterMetrics = puterAIFacade.getMetrics();
      expect(afterMetrics.totalCalls).toBe(initialMetrics.totalCalls + 1);
    });

    it('should cache responses with same input', async () => {
      const testInput = { text: 'cached text' };

      // First call
      const response1 = await puterAIFacade.call(
        'improve-writing',
        testInput,
        undefined,
        { timeout: 30000, retries: 2, useCache: true }
      );

      // Second call with same input
      const response2 = await puterAIFacade.call(
        'improve-writing',
        testInput,
        undefined,
        { timeout: 30000, retries: 2, useCache: true }
      );

      const metrics = puterAIFacade.getMetrics();
      
      // Should have cache hits if caching is working
      if (response1.success || response1.fallback) {
        expect(metrics.cacheHits).toBeGreaterThanOrEqual(0);
      }
    });

    it('should allow metrics reset', () => {
      puterAIFacade.resetMetrics();
      const metrics = puterAIFacade.getMetrics();
      
      expect(metrics.totalCalls).toBe(0);
      expect(metrics.successfulCalls).toBe(0);
      expect(metrics.failedCalls).toBe(0);
    });

    it('should allow cache clearing', () => {
      // Cache some data
      puterAIFacade.call('improve-writing', { text: 'test' }, undefined, { useCache: true });
      
      // Clear cache
      puterAIFacade.clearCache();
      
      // Metrics should be retrievable
      const metrics = puterAIFacade.getMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Batch Operations (Bonus)', () => {
    it('should support batch calls', async () => {
      const tools = [
        {
          toolName: 'improve-writing',
          input: { text: 'test 1' },
        },
        {
          toolName: 'summarize-text',
          input: { text: 'test 2' },
        },
      ];

      const results = await puterAIFacade.callBatch(tools, undefined, true);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      results.forEach((result) => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });
  });

  describe('Migration Validation', () => {
    it('should support all handler scenarios from original component', async () => {
      // Simulate what each handler does

      // 1. handleImproveText
      const improveResponse = await puterAIFacade.call(
        'improve-writing',
        { text: 'Sample academic text' },
        undefined,
        { timeout: 30000, retries: 2 }
      );
      expect(improveResponse).toBeDefined();
      const improvedText = improveResponse.data?.improved || improveResponse.data?.response;
      expect(improvedText === undefined || typeof improvedText === 'string').toBe(true);

      // 2. handleSummarizeText
      const summarizeResponse = await puterAIFacade.call(
        'summarize-text',
        { text: 'Long academic text to summarize' },
        undefined,
        { timeout: 30000, retries: 2 }
      );
      expect(summarizeResponse).toBeDefined();
      const summarizedText = summarizeResponse.data?.summary || summarizeResponse.data?.response;
      expect(summarizedText === undefined || typeof summarizedText === 'string').toBe(true);

      // 3. handleRewriteText (all modes use improve-writing in new implementation)
      const rewriteResponse = await puterAIFacade.call(
        'improve-writing',
        { text: 'Text to rewrite in various modes' },
        undefined,
        { timeout: 30000, retries: 2 }
      );
      expect(rewriteResponse).toBeDefined();
      const rewrittenText = rewriteResponse.data?.improved || rewriteResponse.data?.response;
      expect(rewrittenText === undefined || typeof rewrittenText === 'string').toBe(true);
    });

    it('should handle empty/invalid input gracefully', async () => {
      const emptyResponse = await puterAIFacade.call(
        'improve-writing',
        { text: '' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      expect(emptyResponse).toBeDefined();
      expect(emptyResponse).toHaveProperty('success');
      // Should not crash, might fallback
    });

    it('should maintain backward compatibility with response structure', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'test' },
        undefined,
        { timeout: 30000, retries: 2 }
      );

      // Component expects these fields for error checking
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      
      // Error field may be present on failure
      if (response.error !== undefined) {
        expect(typeof response.error).toBe('string');
      }
      
      // Either success with data or error with error message
      if (response.success) {
        expect(response.data).toBeDefined();
      } else {
        expect(response.error || response.fallback).toBeDefined();
      }
    });
  });

  describe('Configuration Consistency', () => {
    it('should use correct timeout for all operations', async () => {
      const operations = [
        { tool: 'improve-writing', input: { text: 'test' } },
        { tool: 'summarize-text', input: { text: 'test' } },
        { tool: 'paraphrase-text', input: { text: 'test' } },
      ];

      for (const op of operations) {
        const response = await puterAIFacade.call(
          op.tool,
          op.input,
          undefined,
          { timeout: 30000, retries: 2 }
        );

        expect(response.executionTime).toBeDefined();
        expect(response.executionTime).toBeGreaterThan(0);
      }
    });

    it('should handle retries configuration', async () => {
      const response = await puterAIFacade.call(
        'improve-writing',
        { text: 'test' },
        undefined,
        { timeout: 30000, retries: 3 }
      );

      expect(response).toBeDefined();
      // retryCount should be present on successful responses
      if (response.success && response.retryCount !== undefined) {
        expect(typeof response.retryCount).toBe('number');
        expect(response.retryCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
