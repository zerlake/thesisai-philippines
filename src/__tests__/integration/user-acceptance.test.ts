// src/__tests__/integration/user-acceptance.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('User Acceptance Integration Test', () => {
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
      .ilike('title', 'User Acceptance Test%');
      
    await supabase
      .from('defense_question_sets')
      .delete()
      .ilike('title', 'User Acceptance Test%');
      
    await supabase
      .from('study_guides')
      .delete()
      .ilike('title', 'User Acceptance Test%');
  });

  test('User can complete a full learning session workflow', async () => {
    // Simulate a typical user workflow: create study guide, create flashcards, create defense questions
    // This is what the user acceptance testing requirement refers to
    
    // Step 1: Create a study guide
    const studyGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'User Acceptance Test - Complete Workflow',
        executiveSummary: 'Complete workflow test for user acceptance',
        sections: [
          {
            heading: 'Research Methodology',
            content: 'Detailed explanation of the research methodology used in this study',
            keyPoints: ['Quantitative approach', 'Survey method', 'Sample size: 500'],
            reviewQuestions: ['What methodology was used?', 'Why was it chosen?']
          }
        ],
        keyTerms: [
          { term: 'Quantitative Research', definition: 'Research using numerical data and statistical analysis' },
          { term: 'Survey Method', definition: 'Method for collecting data from participants using questionnaires' }
        ],
        studyTips: [
          'Focus on research objectives alignment',
          'Understand statistical significance'
        ],
        citationsList: ['Smith, J. (2023). Research Methods in Education'],
        estimatedReadingTime: 45
      })
    });

    expect(studyGuideResponse.status).toBe(200);
    const studyGuideData = await studyGuideResponse.json();
    expect(studyGuideData.success).toBe(true);
    expect(studyGuideData.guideId).toBeDefined();

    // Step 2: Create flashcards based on the study guide
    const flashcardResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'User Acceptance Test - Methodology Flashcards',
        description: 'Flashcards based on research methodology',
        cards: [
          { question: 'What research methodology was used?', answer: 'Quantitative approach with survey method', type: 'definition' },
          { question: 'What was the sample size?', answer: '500 participants', type: 'application' },
          { question: 'Why was quantitative approach chosen?', answer: 'To ensure statistical significance and measurable results', type: 'explanation' }
        ],
        difficulty: 'medium'
      })
    });

    expect(flashcardResponse.status).toBe(200);
    const flashcardData = await flashcardResponse.json();
    expect(flashcardData.success).toBe(true);
    expect(flashcardData.deckId).toBeDefined();

    // Step 3: Create defense questions based on the same content
    const defenseResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'User Acceptance Test - Defense Questions',
        questions: [
          {
            question: 'Why did you choose a quantitative methodology over qualitative?',
            category: 'methodology',
            difficulty: 'challenging',
            answerFramework: 'Explain advantages of quantitative approach for your research goals',
            followUpQuestions: ['What were the limitations of this approach?']
          },
          {
            question: 'How does the sample size of 500 support your research validity?',
            category: 'findings',
            difficulty: 'moderate',
            answerFramework: 'Statistical significance and confidence levels',
            followUpQuestions: ['Could a larger sample improve results?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(defenseResponse.status).toBe(200);
    const defenseData = await defenseResponse.json();
    expect(defenseData.success).toBe(true);
    expect(defenseData.setId).toBeDefined();

    // Step 4: Verify all data exists in the analytics
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData).toHaveProperty('estimatedReadiness');
    expect(analyticsData).toHaveProperty('learningVelocity');
    expect(analyticsData).toHaveProperty('insights');

    // Step 5: Verify that the user can access all created content
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

    // Verify the test content is present
    const hasWorkflowGuide = sgData.guides.some((g: any) => g.title.includes('Complete Workflow'));
    const hasMethodologyFlashcards = fcData.decks.some((d: any) => d.title.includes('Methodology Flashcards'));
    const hasDefenseQuestions = defData.sets.some((s: any) => s.title.includes('Defense Questions'));

    expect(hasWorkflowGuide).toBe(true);
    expect(hasMethodologyFlashcards).toBe(true);
    expect(hasDefenseQuestions).toBe(true);

    console.log('User can complete full learning session workflow - test completed');
  }, 60000);

  test('User can track progress across multiple tools', async () => {
    // Test the scenario where a user works with multiple tools and can track progress
    // This addresses the "Progress tracking across tools" aspect of user acceptance

    // Create multiple items across different tools
    const [sgResponse, fcResponse1, fcResponse2, defResponse] = await Promise.all([
      fetch('/api/study-guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'User Acceptance Test - Progress Tracking SG1',
          executiveSummary: 'First study guide for progress tracking',
          sections: [{ heading: 'Intro', content: 'Content', keyPoints: [], reviewQuestions: [] }],
          keyTerms: [],
          studyTips: [],
          citationsList: [],
          estimatedReadingTime: 15
        })
      }),
      fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'User Acceptance Test - Progress Tracking FC1',
          description: 'First flashcard deck for progress tracking',
          cards: [{ question: 'Q1', answer: 'A1', type: 'definition' }],
          difficulty: 'easy'
        })
      }),
      fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'User Acceptance Test - Progress Tracking FC2',
          description: 'Second flashcard deck for progress tracking',
          cards: [
            { question: 'Q2', answer: 'A2', type: 'definition' },
            { question: 'Q3', answer: 'A3', type: 'explanation' }
          ],
          difficulty: 'medium'
        })
      }),
      fetch('/api/defense/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'User Acceptance Test - Progress Tracking DEF1',
          questions: [{
            question: 'Def Q1?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Framework',
            followUpQuestions: ['Follow up?']
          }],
          difficulty: 'moderate'
        })
      })
    ]);

    // Verify all creations succeeded
    expect(sgResponse.status).toBe(200);
    expect(fcResponse1.status).toBe(200);
    expect(fcResponse2.status).toBe(200);
    expect(defResponse.status).toBe(200);

    const [sgData, fcData1, fcData2, defData] = await Promise.all([
      sgResponse.json(),
      fcResponse1.json(),
      fcResponse2.json(),
      defResponse.json()
    ]);

    expect(sgData.success).toBe(true);
    expect(fcData1.success).toBe(true);
    expect(fcData2.success).toBe(true);
    expect(defData.success).toBe(true);

    // Check analytics to see if progress tracking works across tools
    const progressResponse = await fetch('/api/learning/progress');
    expect(progressResponse.status).toBe(200);
    const progressData = await progressResponse.json();
    expect(progressData).toHaveProperty('estimatedReadiness');
    expect(progressData).toHaveProperty('learningVelocity');
    expect(progressData).toHaveProperty('totalReviews');
    expect(progressData).toHaveProperty('topicsMastered');

    // The user should be able to see their progress across all tools
    console.log('User can track progress across multiple tools - test completed');
  }, 60000);
});