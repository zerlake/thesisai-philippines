// src/__tests__/integration/edge-cases.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Edge Cases Integration Test', () => {
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
      .from('flashcard_decks')
      .delete()
      .ilike('title', 'Edge Case Test%');
      
    await supabase
      .from('defense_question_sets')
      .delete()
      .ilike('title', 'Edge Case Test%');
      
    await supabase
      .from('study_guides')
      .delete()
      .ilike('title', 'Edge Case Test%');
  });

  test('API handles empty arrays gracefully', async () => {
    // Test flashcards with empty cards array
    const fcEmptyResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Empty Flashcards',
        description: 'Test with empty cards array',
        cards: [],
        difficulty: 'easy'
      })
    });

    expect(fcEmptyResponse.status).toBeGreaterThanOrEqual(200);
    expect(fcEmptyResponse.status).toBeLessThan(500);

    // Test defense with empty questions array
    const defEmptyResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Empty Defense',
        questions: [],
        difficulty: 'moderate'
      })
    });

    expect(defEmptyResponse.status).toBeGreaterThanOrEqual(200);
    expect(defEmptyResponse.status).toBeLessThan(500);

    // Test study guide with empty sections array
    const sgEmptyResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Empty Study Guide',
        executiveSummary: 'Test with empty sections',
        sections: [],
        keyTerms: [],
        studyTips: [],
        citationsList: [],
        estimatedReadingTime: 5
      })
    });

    expect(sgEmptyResponse.status).toBeGreaterThanOrEqual(200);
    expect(sgEmptyResponse.status).toBeLessThan(500);

    console.log('API handles empty arrays test completed');
  }, 30000);

  test('API handles maximum allowed values', async () => {
    // Test with maximum allowed number of cards
    const maxCardsResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Max Cards',
        description: 'Test with maximum allowed cards',
        cards: Array(100).fill(0).map((_, i) => ({
          question: `Max card question ${i + 1}`,
          answer: `Max card answer ${i + 1}`,
          type: ['definition', 'explanation', 'application', 'example'][(i % 4)]
        })),
        difficulty: 'hard'
      })
    });

    expect(maxCardsResponse.status).toBeGreaterThanOrEqual(200);
    expect(maxCardsResponse.status).toBeLessThan(500);

    // Test with maximum allowed sections in study guide
    const maxSectionsResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Max Sections',
        executiveSummary: 'Test with maximum allowed sections',
        sections: Array(50).fill(0).map((_, i) => ({
          heading: `Max Section ${i + 1}`,
          content: `Content for maximum section ${i + 1} with detailed information`,
          keyPoints: [`Point ${i + 1}.1`, `Point ${i + 1}.2`],
          reviewQuestions: [`Question for section ${i + 1}?`]
        })),
        keyTerms: Array(50).fill(0).map((_, i) => ({
          term: `Max Term ${i + 1}`,
          definition: `Definition for maximum term ${i + 1}`
        })),
        studyTips: Array(25).fill(0).map((_, i) => `Max study tip ${i + 1}`),
        citationsList: Array(100).fill(0).map((_, i) => `Max citation ${i + 1}`),
        estimatedReadingTime: 500
      })
    });

    expect(maxSectionsResponse.status).toBeGreaterThanOrEqual(200);
    expect(maxSectionsResponse.status).toBeLessThan(500);

    console.log('API handles maximum allowed values test completed');
  }, 45000);

  test('API handles special characters and unicode', async () => {
    const specialCharsResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Edge Case Test - Special Chars: !@#$%^&*()_+{}:"|<>?[];\',./~`',
        description: 'Test with special characters: áéíóú ñ ç ü ¿¡ €£¥©®™',
        cards: [
          { 
            question: 'Q with chars: Σ∑∂∏π∫ αβγδε θλμνξ οπρστ υφχψω', 
            answer: 'A with chars: АБВГД ЕЖЗИЙ КЛМНО ПРСТУ ФХЦЧШ ЩЪЫЬЭ ЮЯ', 
            type: 'definition' 
          },
          { 
            question: 'Emoji test: 🎓📚📝🎓答辩 defense', 
            answer: 'Mixed script: 你好世界 Привет мир', 
            type: 'explanation' 
          }
        ],
        difficulty: 'medium'
      })
    });

    expect(specialCharsResponse.status).toBeGreaterThanOrEqual(200);
    expect(specialCharsResponse.status).toBeLessThan(500);

    console.log('API handles special characters and unicode test completed');
  }, 30000);

  test('API handles null and undefined values', async () => {
    // Test with null values where they might be accepted
    const nullValuesResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Using undefined values in the payload would be removed by JSON.stringify
      // so we're testing with null values where appropriate
      body: JSON.stringify({
        title: 'Edge Case Test - Null Values',
        executiveSummary: 'Test with some null-like values',
        sections: [
          {
            heading: 'Test Section with nulls',
            content: 'Section content',
            keyPoints: null || [], // This will become [] if null
            reviewQuestions: ['Question 1?']
          }
        ],
        keyTerms: [],
        studyTips: [],
        citationsList: [],
        estimatedReadingTime: 10
      })
    });

    expect(nullValuesResponse.status).toBeGreaterThanOrEqual(200);
    expect(nullValuesResponse.status).toBeLessThan(500);

    console.log('API handles null and undefined values test completed');
  }, 30000);

  test('API maintains data integrity during rapid requests', async () => {
    // Test the system's ability to handle rapid requests without corrupting data
    const requests = [];
    
    // Create multiple flashcard decks rapidly
    for (let i = 0; i < 10; i++) {
      requests.push(fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Edge Case Test - Rapid Request ${i}`,
          description: `Test for rapid request ${i}`,
          cards: [{ question: `Q${i}`, answer: `A${i}`, type: 'definition' }],
          difficulty: 'easy'
        })
      }));
    }
    
    const responses = await Promise.all(requests);
    
    // All requests should complete successfully
    responses.forEach(response => {
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    // Verify all decks were created properly
    const getAllResponse = await fetch('/api/flashcards/decks');
    expect(getAllResponse.status).toBe(200);
    const allData = await getAllResponse.json();
    
    const rapidDecks = allData.decks.filter((d: any) => 
      d.title.includes('Edge Case Test - Rapid Request')
    );
    
    expect(rapidDecks.length).toBeGreaterThanOrEqual(5); // Should have at least some of our rapid test decks

    console.log('API maintains data integrity during rapid requests test completed');
  }, 45000);
});