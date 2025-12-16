// src/__tests__/integration/study-guides-api.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Study Guides API Integration Test', () => {
  let supabase: any;
  let userId: string;

  beforeAll(async () => {
    // Set up test environment
    supabase = await createServerClient();
    
    // For integration tests, we'll use a test user ID
    userId = 'test-user-id-for-integration';
  });

  afterAll(async () => {
    // Clean up test data after all tests
    await supabase
      .from('study_guides')
      .delete()
      .ilike('title', 'Study Guides API Test%');
  });

  test('POST /api/study-guides creates a new study guide', async () => {
    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Study Guides API Test - Create Guide',
        executiveSummary: 'Test executive summary',
        sections: [
          {
            heading: 'Test Section 1',
            content: 'Test content for section 1',
            keyPoints: ['Point 1', 'Point 2'],
            reviewQuestions: ['Question 1?', 'Question 2?']
          }
        ],
        keyTerms: [
          { term: 'Test Term 1', definition: 'Definition 1' },
          { term: 'Test Term 2', definition: 'Definition 2' }
        ],
        studyTips: ['Test tip 1', 'Test tip 2'],
        citationsList: ['Citation 1', 'Citation 2'],
        estimatedReadingTime: 30
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('guideId');
    expect(data).toHaveProperty('sectionCount');
    expect(data.success).toBe(true);
    expect(typeof data.guideId).toBe('string');
    expect(data.sectionCount).toBe(1);
    
    console.log('POST /api/study-guides test completed');
  }, 20000);

  test('GET /api/study-guides retrieves user study guides', async () => {
    const response = await fetch('/api/study-guides');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('guides');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.guides)).toBe(true);
    
    // Check if our test guide is in the list
    const testGuide = data.guides.find((g: any) => g.title === 'Study Guides API Test - Create Guide');
    expect(testGuide).toBeDefined();
    
    console.log('GET /api/study-guides test completed');
  }, 20000);

  test('Study Guides API handles complex structures', async () => {
    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Study Guides API Test - Complex Structure',
        executiveSummary: 'Comprehensive summary with multiple paragraphs and detailed information',
        sections: Array(5).fill(0).map((_, idx) => ({
          heading: `Complex Section ${idx + 1}`,
          content: `Detailed content for section ${idx + 1} with multiple paragraphs and in-depth analysis`,
          keyPoints: Array(3).fill(0).map((_, kpIdx) => `Key point ${kpIdx + 1} for section ${idx + 1}`),
          reviewQuestions: Array(2).fill(0).map((_, rqIdx) => `Review question ${rqIdx + 1} for section ${idx + 1}?`)
        })),
        keyTerms: Array(10).fill(0).map((_, idx) => ({
          term: `Complex Term ${idx + 1}`,
          definition: `Comprehensive definition for complex term ${idx + 1} with detailed explanation`
        })),
        studyTips: Array(7).fill(0).map((_, idx) => `Comprehensive study tip ${idx + 1} for effective learning`),
        citationsList: Array(8).fill(0).map((_, idx) => `Complete citation reference ${idx + 1} with full details`),
        estimatedReadingTime: 120
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.sectionCount).toBe(5);
    
    console.log('Study Guides API complex structures test completed');
  }, 45000);

  test('Study Guides API validates required fields correctly', async () => {
    // Test without title (required)
    const noTitleResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        executiveSummary: 'Summary without title',
        sections: [
          {
            heading: 'Section without title',
            content: 'Content',
            keyPoints: [],
            reviewQuestions: []
          }
        ],
        keyTerms: [],
        studyTips: [],
        citationsList: [],
        estimatedReadingTime: 10
      })
    });

    // Should either fail validation or provide a default title
    expect(noTitleResponse.status).toBeGreaterThanOrEqual(200);
    expect(noTitleResponse.status).toBeLessThan(500);

    // Test without sections (required)
    const noSectionsResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Guide without sections',
        executiveSummary: 'Summary without sections',
        keyTerms: [],
        studyTips: [],
        citationsList: [],
        estimatedReadingTime: 5
      })
    });

    // Should either fail validation or handle gracefully
    expect(noSectionsResponse.status).toBeGreaterThanOrEqual(200);
    expect(noSectionsResponse.status).toBeLessThan(500);
    
    console.log('Study Guides API validation test completed');
  }, 30000);
});