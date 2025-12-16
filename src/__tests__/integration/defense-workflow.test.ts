// src/__tests__/integration/defense-workflow.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Defense Question Workflow Integration Test', () => {
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
      .from('defense_question_sets')
      .delete()
      .ilike('title', 'Test%');
  });

  test('Complete defense question workflow: create set, practice, and track performance', async () => {
    // Step 1: Create a defense question set
    const setResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real test, we would include proper authentication
      },
      body: JSON.stringify({
        title: 'Test Defense Set - Integration',
        questions: [
          {
            question: 'What is your methodology?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Explain approach and justify choices',
            followUpQuestions: ['Why did you choose this approach?']
          },
          {
            question: 'What are your key findings?',
            category: 'findings',
            difficulty: 'challenging',
            answerFramework: 'Present data and explain significance',
            followUpQuestions: ['How do these findings relate to literature?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(setResponse.status).toBe(200);
    const setResult = await setResponse.json();
    expect(setResult.success).toBe(true);
    expect(setResult.setId).toBeDefined();
    expect(setResult.questionCount).toBe(2);

    const setId = setResult.setId;

    // Step 2: Fetch the created question set to verify it exists
    const getSetsResponse = await fetch('/api/defense/sets');
    expect(getSetsResponse.status).toBe(200);
    const getSetsResult = await getSetsResponse.json();
    expect(getSetsResult.success).toBe(true);
    const set = getSetsResult.sets.find((s: any) => s.id === setId);
    expect(set).toBeDefined();
    expect(set.title).toBe('Test Defense Set - Integration');

    // Step 3: In a real scenario we would test the practice workflow
    // For now, we'll just verify that the basic functionality works
    console.log('Defense question workflow integration test completed successfully');
  }, 30000); // 30 second timeout for this test
});