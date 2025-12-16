// src/__tests__/integration/data-persistence.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Data Persistence Integration Test', () => {
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
      .ilike('title', 'Test%');
      
    await supabase
      .from('defense_question_sets')
      .delete()
      .ilike('title', 'Test%');
      
    await supabase
      .from('study_guides')
      .delete()
      .ilike('title', 'Test%');
  });

  test('Data persistence across educational tools', async () => {
    // Step 1: Create a flashcard deck and verify persistence
    const flashcardResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Persistence Test - Flashcards',
        description: 'Testing data persistence for flashcards',
        cards: [
          { question: 'Test Q1', answer: 'Test A1', type: 'definition' },
          { question: 'Test Q2', answer: 'Test A2', type: 'explanation' },
        ],
        difficulty: 'easy'
      })
    });

    expect(flashcardResponse.status).toBe(200);
    const flashcardResult = await flashcardResponse.json();
    expect(flashcardResult.success).toBe(true);
    const flashcardDeckId = flashcardResult.deckId;
    expect(flashcardDeckId).toBeDefined();

    // Step 2: Create a defense question set and verify persistence
    const defenseResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Persistence Test - Defense',
        questions: [
          {
            question: 'Test Defense Q1',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Test framework',
            followUpQuestions: ['Follow up?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(defenseResponse.status).toBe(200);
    const defenseResult = await defenseResponse.json();
    expect(defenseResult.success).toBe(true);
    const defenseSetId = defenseResult.setId;
    expect(defenseSetId).toBeDefined();

    // Step 3: Create a study guide and verify persistence
    const studyGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Persistence Test - Study Guide',
        executiveSummary: 'Testing data persistence for study guides',
        sections: [
          {
            heading: 'Test Section',
            content: 'Test content',
            keyPoints: ['Point 1'],
            reviewQuestions: ['Question?']
          }
        ],
        keyTerms: [
          { term: 'Test Term', definition: 'Test Definition' }
        ],
        studyTips: ['Test tip'],
        citationsList: ['Test citation'],
        estimatedReadingTime: 10
      })
    });

    expect(studyGuideResponse.status).toBe(200);
    const studyGuideResult = await studyGuideResponse.json();
    expect(studyGuideResult.success).toBe(true);
    const studyGuideId = studyGuideResult.guideId;
    expect(studyGuideId).toBeDefined();

    // Step 4: Verify all data persists by fetching lists
    const [flashcardListResponse, defenseListResponse, studyGuideListResponse] = await Promise.all([
      fetch('/api/flashcards/decks'),
      fetch('/api/defense/sets'),
      fetch('/api/study-guides')
    ]);

    expect(flashcardListResponse.status).toBe(200);
    expect(defenseListResponse.status).toBe(200);
    expect(studyGuideListResponse.status).toBe(200);

    const flashcardList = await flashcardListResponse.json();
    const defenseList = await defenseListResponse.json();
    const studyGuideList = await studyGuideListResponse.json();

    expect(flashcardList.success).toBe(true);
    expect(defenseList.success).toBe(true);
    expect(studyGuideList.success).toBe(true);

    // Verify our specific test records exist in the lists
    expect(flashcardList.decks.some((d: any) => d.id === flashcardDeckId)).toBe(true);
    expect(defenseList.sets.some((s: any) => s.id === defenseSetId)).toBe(true);
    expect(studyGuideList.guides.some((g: any) => g.id === studyGuideId)).toBe(true);

    // Step 5: Test fetching specific records
    const flashcardCardsResponse = await fetch(`/api/flashcards/${flashcardDeckId}/cards`);
    expect(flashcardCardsResponse.status).toBe(200);
    const flashcardCardsData = await flashcardCardsResponse.json();
    expect(flashcardCardsData.success).toBe(true);
    expect(flashcardCardsData.cards).toHaveLength(2);

    console.log('Data persistence integration test completed successfully');
  }, 45000); // 45 second timeout for this test
});