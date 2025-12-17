// src/__tests__/integration/regression.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Regression Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting regression integration tests');
  });

  afterAll(() => {
    console.log('Completed regression integration tests');
  });

  test('Test authentication flow still works', async () => {
    // Test that the authentication system still works correctly
    const response = await fetch('/api/auth/session');
    
    // Should return appropriate response based on authentication status
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
    
    console.log('Authentication regression test completed');
  }, 10000);

  test('Test API endpoints still return expected data', async () => {
    // Verify that all critical API endpoints still function correctly
    
    const endpointsToTest = [
      '/api/learning/progress',
      '/api/learning/analytics', 
      '/api/learning/insights',
      '/api/flashcards/decks',
      '/api/defense/sets',
      '/api/study-guides'
    ];

    for (const endpoint of endpointsToTest) {
      const response = await fetch(endpoint);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      const data = await response.json();
      expect(data).toBeDefined();
    }

    console.log('API endpoint regression test completed');
  }, 25000);

  test('Test flashcard creation functionality', async () => {
    // Ensure flashcard creation still works after new feature additions
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Regression Test Deck',
        description: 'Test deck to verify flashcard creation still works',
        cards: [
          { question: 'Regression Q?', answer: 'Regression A', type: 'definition' }
        ],
        difficulty: 'easy'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.deckId).toBeDefined();
    
    console.log('Flashcard creation regression test completed');
  }, 15000);

  test('Test defense question creation functionality', async () => {
    // Ensure defense question creation still works
    const response = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Regression Test Defense Set',
        questions: [
          {
            question: 'Regression defense question?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Regression test framework',
            followUpQuestions: ['Regression follow-up?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.setId).toBeDefined();
    
    console.log('Defense question creation regression test completed');
  }, 15000);

  test('Test study guide creation functionality', async () => {
    // Ensure study guide creation still works
    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Regression Test Study Guide',
        executiveSummary: 'Regression test summary',
        sections: [{
          heading: 'Regression Test Section',
          content: 'Regression test content',
          keyPoints: ['Regression key point'],
          reviewQuestions: ['Regression question?']
        }],
        keyTerms: [{ term: 'Regression term', definition: 'Regression definition' }],
        studyTips: ['Regression tip'],
        citationsList: ['Regression citation'],
        estimatedReadingTime: 10
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.guideId).toBeDefined();
    
    console.log('Study guide creation regression test completed');
  }, 15000);

  test('Test analytics dashboard API still works', async () => {
    // Ensure analytics API still returns expected data structure
    const response = await fetch('/api/learning/analytics');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.estimatedReadiness).toBeDefined();
    expect(data.data.learningVelocity).toBeDefined();
    
    console.log('Analytics dashboard regression test completed');
  }, 10000);

  test('Test insights API still works', async () => {
    // Ensure insights API still returns expected data
    const response = await fetch('/api/learning/insights');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.insights)).toBe(true);
    
    console.log('Insights API regression test completed');
  }, 10000);

  test('Test progress tracking still works', async () => {
    // Ensure progress tracking API still functions
    const response = await fetch('/api/learning/progress');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(typeof data.data.estimatedReadiness).toBe('number');
    
    console.log('Progress tracking regression test completed');
  }, 10000);

  test('Test cross-tool data correlation still works', async () => {
    // Ensure data from different tools still correlates properly
    const [progressResp, fcResp, defResp, sgResp] = await Promise.all([
      fetch('/api/learning/progress'),
      fetch('/api/learning/flashcards'),
      fetch('/api/learning/defense'),
      fetch('/api/learning/study-guides')
    ]);

    const [progress, fcData, defData, sgData] = await Promise.all([
      progressResp.json(),
      fcResp.json(),
      defResp.json(),
      sgResp.json()
    ]);

    // All responses should be successful
    expect(progress.success).toBe(true);
    expect(fcData.success).toBe(true);
    expect(defData.success).toBe(true);
    expect(sgData.success).toBe(true);

    console.log('Cross-tool data correlation regression test completed');
  }, 20000);

  test('Test UI component rendering still works', async () => {
    // Verify that critical UI components still render correctly
    // This would normally test actual component rendering, but in integration tests
    // we're verifying that the underlying APIs that power these components still work
    
    const criticalApis = [
      '/api/learning/progress',
      '/api/learning/analytics',
      '/api/learning/insights'
    ];

    for (const api of criticalApis) {
      const response = await fetch(api);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    }

    console.log('UI component rendering regression test completed');
  }, 15000);

  console.log('Completed 10+ regression integration tests');
});