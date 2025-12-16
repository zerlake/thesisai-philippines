// src/__tests__/integration/defense-api.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Defense API Integration Test', () => {
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
      .ilike('title', 'Defense API Test%');
  });

  test('POST /api/defense/sets creates a new question set', async () => {
    const response = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Defense API Test - Create Set',
        questions: [
          {
            question: 'Test defense question?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Test framework',
            followUpQuestions: ['Follow up?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('setId');
    expect(data).toHaveProperty('questionCount');
    expect(data.success).toBe(true);
    expect(typeof data.setId).toBe('string');
    expect(data.questionCount).toBe(1);
    
    console.log('POST /api/defense/sets test completed');
  }, 20000);

  test('GET /api/defense/sets retrieves user question sets', async () => {
    const response = await fetch('/api/defense/sets');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('sets');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.sets)).toBe(true);
    
    // Check if our test set is in the list
    const testSet = data.sets.find((s: any) => s.title === 'Defense API Test - Create Set');
    expect(testSet).toBeDefined();
    
    console.log('GET /api/defense/sets test completed');
  }, 20000);

  test('Defense API handles various difficulty levels', async () => {
    const difficultyLevels = ['moderate', 'challenging', 'expert'];
    
    for (const difficulty of difficultyLevels) {
      const response = await fetch('/api/defense/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Defense API Test - ${difficulty} difficulty`,
          questions: [
            {
              question: `Test question for ${difficulty} level?`,
              category: 'methodology',
              difficulty: difficulty,
              answerFramework: `Framework for ${difficulty} level`,
              followUpQuestions: [`Follow up for ${difficulty}?`]
            }
          ],
          difficulty: difficulty
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.questionCount).toBe(1);
    }
    
    console.log('Defense API difficulty levels test completed');
  }, 30000);

  test('Defense API handles various question categories', async () => {
    const categories = ['methodology', 'findings', 'implications', 'limitations', 'critique'];
    
    for (const category of categories) {
      const response = await fetch('/api/defense/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Defense API Test - ${category} category`,
          questions: [
            {
              question: `Test ${category} question?`,
              category: category,
              difficulty: 'moderate',
              answerFramework: `Framework for ${category}`,
              followUpQuestions: [`Follow up for ${category}?`]
            }
          ],
          difficulty: 'moderate'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.questionCount).toBe(1);
    }
    
    console.log('Defense API question categories test completed');
  }, 30000);
});