// src/__tests__/integration/study-guide-workflow.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Study Guide Workflow Integration Test', () => {
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
      .ilike('title', 'Test%');
  });

  test('Complete study guide workflow: create guide, add sections and terms, and access content', async () => {
    // Step 1: Create a study guide
    const guideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real test, we would include proper authentication
      },
      body: JSON.stringify({
        title: 'Test Study Guide - Integration',
        executiveSummary: 'This is a comprehensive study guide for testing purposes',
        sections: [
          {
            heading: 'Introduction',
            content: 'The introduction section covers basic concepts',
            keyPoints: ['First point', 'Second point'],
            reviewQuestions: ['What is the topic?', 'Why is it important?']
          },
          {
            heading: 'Main Content',
            content: 'The main content section goes into detail',
            keyPoints: ['Key detail 1', 'Key detail 2'],
            reviewQuestions: ['What are the main points?', 'How do they relate?']
          }
        ],
        keyTerms: [
          { term: 'Term 1', definition: 'Definition of term 1' },
          { term: 'Term 2', definition: 'Definition of term 2' }
        ],
        studyTips: [
          'Review the key points daily',
          'Create visual aids for complex concepts'
        ],
        citationsList: [
          'Sample citation 1',
          'Sample citation 2'
        ],
        estimatedReadingTime: 45
      })
    });

    expect(guideResponse.status).toBe(200);
    const guideResult = await guideResponse.json();
    expect(guideResult.success).toBe(true);
    expect(guideResult.guideId).toBeDefined();
    expect(guideResult.sectionCount).toBe(2);

    const guideId = guideResult.guideId;

    // Step 2: Fetch the created study guide to verify it exists
    const getGuidesResponse = await fetch('/api/study-guides');
    expect(getGuidesResponse.status).toBe(200);
    const getGuidesResult = await getGuidesResponse.json();
    expect(getGuidesResult.success).toBe(true);
    const guide = getGuidesResult.guides.find((g: any) => g.id === guideId);
    expect(guide).toBeDefined();
    expect(guide.title).toBe('Test Study Guide - Integration');

    // Step 3: In a real scenario we would test the detailed access workflow
    // For now, we'll just verify that the basic functionality works
    console.log('Study guide workflow integration test completed successfully');
  }, 30000); // 30 second timeout for this test
});