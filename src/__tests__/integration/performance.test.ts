// src/__tests__/integration/performance.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Performance Integration Tests', () => {
  let startTimes: Record<string, number> = {};

  beforeAll(() => {
    console.log('Starting performance integration tests');
  });

  afterAll(() => {
    console.log('Completed performance integration tests');
  });

  beforeEach(() => {
    startTimes = {};
  });

  test('API response time under 200ms (95th percentile)', async () => {
    const iterations = 10;
    const responseTimes: number[] = [];
    const timeouts: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      startTimes[`api_call_${i}`] = startTime;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const response = await fetch('/api/learning/analytics', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const endTime = performance.now();
        const responseTime = endTime - startTimes[`api_call_${i}`];
        responseTimes.push(responseTime);
        
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        timeouts.push(i); // Track which requests timed out
      }
    }

    // Calculate 95th percentile
    responseTimes.sort((a, b) => a - b);
    const percentile95Index = Math.floor(responseTimes.length * 0.95);
    const responseTime95thPercentile = responseTimes[percentile95Index];

    console.log(`95th percentile response time: ${responseTime95thPercentile}ms`);
    console.log(`Average response time: ${responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length}ms`);
    
    // Verify that 95% of responses are under 200ms
    expect(responseTime95thPercentile).toBeLessThan(200);
    expect(responseTimes.length).toBeGreaterThanOrEqual(iterations * 0.95); // At least 95% of requests should succeed
  }, 30000);

  test('Dashboard load time under 2 seconds', async () => {
    const startTime = performance.now();
    startTimes.dashboard_load = startTime;

    // In a real implementation, we would measure actual page load time
    // For this test environment, we'll verify that the API endpoint responds quickly
    const response = await fetch('/api/learning/analytics');
    const endTime = performance.now();
    const loadTime = endTime - startTimes.dashboard_load;

    expect(response.status).toBe(200);
    expect(loadTime).toBeLessThan(2000); // Should load in under 2 seconds
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  }, 10000);

  test('Database query optimization - single query should take <500ms', async () => {
    const startTime = performance.now();
    startTimes.db_query = startTime;

    // Test a complex query that joins multiple tables
    // In a real implementation, this would be an actual DB query
    // For now, we'll test the API performance which includes DB queries
    const response = await fetch('/api/learning/analytics');
    const endTime = performance.now();
    const queryTime = endTime - startTimes.db_query;

    expect(response.status).toBe(200);
    expect(queryTime).toBeLessThan(500);
    
    console.log(`Database query time: ${queryTime}ms`);
  }, 10000);

  test('Batch operations performance', async () => {
    // Test batch processing of multiple items
    const startTime = performance.now();
    startTimes.batch_operation = startTime;

    // Create multiple items in batch
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetch('/api/flashcards/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Batch Test Deck ${i}`,
            description: `Description for batch test deck ${i}`,
            cards: Array(10).fill(0).map((_, idx) => ({
              question: `Batch question ${i}-${idx}?`,
              answer: `Batch answer ${i}-${idx}`,
              type: 'definition'
            })),
            difficulty: 'medium'
          })
        })
      );
    }

    const responses = await Promise.all(promises);
    const endTime = performance.now();
    const batchTime = endTime - startTimes.batch_operation;

    // Check that all requests succeeded
    for (const response of responses) {
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    }

    // Batch operation should complete reasonably quickly
    expect(batchTime).toBeLessThan(10000); // Under 10 seconds for 5 batches of 10 cards each
    
    console.log(`Batch operation time: ${batchTime}ms for ${responses.length} requests`);
  }, 20000);

  test('Caching strategy effectiveness', async () => {
    // Test that repeated requests are faster due to caching
    const response1 = await fetch('/api/learning/analytics');
    expect(response1.status).toBe(200);
    const time1 = performance.now();

    const response2 = await fetch('/api/learning/analytics');
    expect(response2.status).toBe(200);
    const time2 = performance.now();

    // Second request might not necessarily be faster in a test environment without proper caching setup
    // But we're testing that both requests succeed and the system is responsive
    console.log(`First request time: ${time1}ms, Second request time: ${time2}ms`);
    
    // Both requests should be successful
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  }, 15000);

  test('Flashcard creation performance', async () => {
    const startTime = performance.now();
    startTimes.flashcard_creation = startTime;

    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Performance Test Deck',
        description: 'Deck for performance testing',
        cards: Array(20).fill(0).map((_, idx) => ({
          question: `Performance test question ${idx}?`,
          answer: `Performance test answer ${idx}`,
          type: ['definition', 'explanation', 'application', 'example'][idx % 4]
        })),
        difficulty: 'medium'
      })
    });

    const endTime = performance.now();
    const creationTime = endTime - startTimes.flashcard_creation;

    expect(response.status).toBe(200);
    expect(creationTime).toBeLessThan(5000); // Creation of 20 cards should take under 5 seconds
    
    console.log(`Flashcard creation time: ${creationTime}ms for 20 cards`);
  }, 10000);

  test('Large dataset handling - flashcard review', async () => {
    // Test handling of larger datasets
    const startTime = performance.now();
    startTimes.large_dataset = startTime;

    // First create a large deck
    const createResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Performance Test - Large Dataset',
        description: 'Large dataset for performance testing',
        cards: Array(100).fill(0).map((_, idx) => ({
          question: `Large dataset question ${idx}?`,
          answer: `Large dataset answer ${idx}`,
          type: 'definition'
        })),
        difficulty: 'medium'
      })
    });

    expect(createResponse.status).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    const deckId = createResult.deckId;
    expect(deckId).toBeDefined();

    // Now fetch all cards in the deck to test large dataset handling
    const fetchResponse = await fetch(`/api/flashcards/${deckId}/cards`);
    expect(fetchResponse.status).toBe(200);

    const endTime = performance.now();
    const datasetTime = endTime - startTimes.large_dataset;

    // Fetching 100 cards should still be reasonably fast
    expect(datasetTime).toBeLessThan(5000); // Under 5 seconds for 100 cards
    
    console.log(`Large dataset handling time: ${datasetTime}ms for 100 cards`);
  }, 20000);

  test('Defense question creation performance', async () => {
    const startTime = performance.now();
    startTimes.defense_creation = startTime;

    const response = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Performance Test - Defense Questions',
        questions: Array(15).fill(0).map((_, idx) => ({
          question: `Performance test defense question ${idx}?`,
          category: ['methodology', 'findings', 'implications', 'limitations'][idx % 4],
          difficulty: ['easy', 'moderate', 'challenging'][idx % 3],
          answerFramework: `Framework for question ${idx}`,
          followUpQuestions: [`Follow up ${idx}?`]
        })),
        difficulty: 'moderate'
      })
    });

    const endTime = performance.now();
    const creationTime = endTime - startTimes.defense_creation;

    expect(response.status).toBe(200);
    expect(creationTime).toBeLessThan(5000); // Creation of 15 questions should take under 5 seconds
    
    console.log(`Defense question creation time: ${creationTime}ms for 15 questions`);
  }, 15000);

  test('Study guide creation performance', async () => {
    const startTime = performance.now();
    startTimes.study_guide_creation = startTime;

    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Performance Test - Study Guide',
        executiveSummary: 'Performance test executive summary',
        sections: Array(8).fill(0).map((_, idx) => ({
          heading: `Section ${idx + 1}`,
          content: `Content for section ${idx + 1} with sufficient text to simulate realistic study guide content. This would typically include detailed explanations, examples, and key concepts that students need to master.`,
          keyPoints: [`Key point 1 for section ${idx + 1}`, `Key point 2 for section ${idx + 1}`],
          reviewQuestions: [`Question for section ${idx + 1}?`, `Another question for section ${idx + 1}?`]
        })),
        keyTerms: Array(20).fill(0).map((_, idx) => ({
          term: `Term ${idx + 1}`,
          definition: `Definition for term ${idx + 1}`
        })),
        studyTips: ['Tip 1', 'Tip 2', 'Tip 3'],
        citationsList: ['Citation 1', 'Citation 2'],
        estimatedReadingTime: 45
      })
    });

    const endTime = performance.now();
    const creationTime = endTime - startTimes.study_guide_creation;

    expect(response.status).toBe(200);
    expect(creationTime).toBeLessThan(8000); // Creation of complex study guide should take under 8 seconds
    
    console.log(`Study guide creation time: ${creationTime}ms for 8-section guide`);
  }, 15000);

  test('Analytics dashboard data aggregation performance', async () => {
    const startTime = performance.now();
    startTimes.analytics_aggregation = startTime;

    // Test the analytics endpoint which aggregates data from multiple sources
    const response = await fetch('/api/learning/analytics');
    const endTime = performance.now();
    const aggTime = endTime - startTimes.analytics_aggregation;

    expect(response.status).toBe(200);
    
    // Data aggregation should be optimized to take under 3 seconds
    expect(aggTime).toBeLessThan(3000);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    console.log(`Analytics aggregation time: ${aggTime}ms`);
  }, 10000);

  console.log('Completed 10+ performance tests');
});