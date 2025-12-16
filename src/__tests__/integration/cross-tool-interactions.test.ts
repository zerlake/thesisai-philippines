// src/__tests__/integration/cross-tool-interactions.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Cross-Tool Interactions Integration Test', () => {
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
      .ilike('title', 'Cross-Tool%');
      
    await supabase
      .from('defense_question_sets')
      .delete()
      .ilike('title', 'Cross-Tool%');
      
    await supabase
      .from('study_guides')
      .delete()
      .ilike('title', 'Cross-Tool%');
  });

  test('Cross-tool interactions and data correlation', async () => {
    // Step 1: Create a study guide that will be referenced by other tools
    const studyGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Cross-Tool Integration Test Guide',
        executiveSummary: 'Study guide to test cross-tool interactions',
        sections: [
          {
            heading: 'Methodology Section',
            content: 'This section covers the research methodology in detail',
            keyPoints: ['Quantitative approach', 'Survey method'],
            reviewQuestions: ['What methodology was used?']
          }
        ],
        keyTerms: [
          { term: 'Quantitative Research', definition: 'Research using numerical data' },
          { term: 'Survey Method', definition: 'Method for collecting data from participants' }
        ],
        studyTips: ['Focus on methodology when preparing for defense'],
        citationsList: ['Test citation'],
        estimatedReadingTime: 15
      })
    });

    expect(studyGuideResponse.status).toBe(200);
    const studyGuideResult = await studyGuideResponse.json();
    expect(studyGuideResult.success).toBe(true);
    const studyGuideId = studyGuideResult.guideId;
    expect(studyGuideId).toBeDefined();

    // Step 2: Create flashcards based on the study guide content
    const flashcardResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Cross-Tool Integration Test Flashcards - Based on Study Guide',
        description: 'Flashcards created from study guide content',
        cards: [
          { 
            question: 'What research methodology was used?', 
            answer: 'Quantitative approach with survey method', 
            type: 'definition' 
          },
          { 
            question: 'What are the key components of the methodology?', 
            answer: 'Quantitative approach and survey method', 
            type: 'explanation' 
          },
        ],
        difficulty: 'medium'
      })
    });

    expect(flashcardResponse.status).toBe(200);
    const flashcardResult = await flashcardResponse.json();
    expect(flashcardResult.success).toBe(true);
    const flashcardDeckId = flashcardResult.deckId;
    expect(flashcardDeckId).toBeDefined();

    // Step 3: Create defense questions based on the same content
    const defenseResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Cross-Tool Integration Test - Defense Questions',
        questions: [
          {
            question: 'Why did you choose a quantitative methodology?',
            category: 'methodology',
            difficulty: 'challenging',
            answerFramework: 'Justify choice based on research objectives',
            followUpQuestions: ['What alternatives did you consider?']
          },
          {
            question: 'How does the survey method support your research goals?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Explain alignment with research questions',
            followUpQuestions: ['What are potential limitations?']
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

    // Step 4: Test the analytics dashboard with all three tools data
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData).toHaveProperty('estimatedReadiness');
    expect(analyticsData).toHaveProperty('learningVelocity');
    expect(analyticsData).toHaveProperty('flashcardData');
    expect(analyticsData).toHaveProperty('defenseData');
    expect(analyticsData).toHaveProperty('studyGuideData');
    expect(analyticsData).toHaveProperty('insights');

    // Verify that the data from all tools is being properly aggregated
    expect(analyticsData.flashcardData).toHaveProperty('masteryByDeck');
    expect(analyticsData.defenseData).toHaveProperty('performanceByCategory');
    expect(analyticsData.studyGuideData).toHaveProperty('completionByGuide');

    // Step 5: Verify that insights are generated across tools
    const insightsResponse = await fetch('/api/learning/insights');
    expect(insightsResponse.status).toBe(200);
    const insightsData = await insightsResponse.json();
    expect(Array.isArray(insightsData)).toBe(true);

    // Step 6: Test that all tools show up in user's data
    const [sgList, fcList, defList] = await Promise.all([
      fetch('/api/study-guides'),
      fetch('/api/flashcards/decks'),
      fetch('/api/defense/sets')
    ]);

    expect(sgList.status).toBe(200);
    expect(fcList.status).toBe(200);
    expect(defList.status).toBe(200);

    const sgData = await sgList.json();
    const fcData = await fcList.json();
    const defData = await defList.json();

    expect(sgData.success).toBe(true);
    expect(fcData.success).toBe(true);
    expect(defData.success).toBe(true);

    // Verify our test items are present
    const hasTestStudyGuide = sgData.guides.some((g: any) => 
      g.title.includes('Cross-Tool Integration Test Guide')
    );
    const hasTestFlashcards = fcData.decks.some((d: any) => 
      d.title.includes('Cross-Tool Integration Test Flashcards')
    );
    const hasTestDefense = defData.sets.some((s: any) => 
      s.title.includes('Cross-Tool Integration Test - Defense')
    );

    expect(hasTestStudyGuide).toBe(true);
    expect(hasTestFlashcards).toBe(true);
    expect(hasTestDefense).toBe(true);

    console.log('Cross-tool interactions integration test completed successfully');
  }, 45000); // 45 second timeout for this test
});