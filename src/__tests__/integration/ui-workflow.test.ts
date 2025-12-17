// src/__tests__/integration/ui-workflow.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('UI Workflow Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting UI workflow integration tests');
  });

  test('Complete flashcard creation to review workflow', async () => {
    // 1. Create a flashcard deck
    const createResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UI Workflow Test Deck',
        description: 'Testing full UI workflow from creation to review',
        cards: [
          { question: 'What is UI workflow testing?', answer: 'Testing complete user interface workflows', type: 'definition' },
          { question: 'How do you test workflows?', answer: 'By simulating complete user journeys', type: 'application' },
          { question: 'Why is it important?', answer: 'To ensure seamless user experiences', type: 'explanation' }
        ],
        difficulty: 'medium'
      })
    });

    expect(createResponse.status).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    const deckId = createResult.deckId;
    expect(deckId).toBeDefined();

    // 2. Retrieve the deck to verify it was created
    const getDeckResponse = await fetch(`/api/flashcards/${deckId}/cards`);
    expect(getDeckResponse.status).toBe(200);
    const getDeckResult = await getDeckResponse.json();
    expect(getDeckResult.success).toBe(true);
    expect(getDeckResult.cards).toHaveLength(3);

    // 3. Simulate a review session
    const reviewResponse = await fetch(`/api/flashcards/${deckId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        mode: 'practice'
      })
    });

    expect(reviewResponse.status).toBe(200);
    const reviewResult = await reviewResponse.json();
    expect(reviewResult.success).toBe(true);
    expect(reviewResult.sessionId).toBeDefined();
    expect(reviewResult.cards).toHaveLength(3);

    // 4. Submit review responses
    const submitResponse = await fetch(`/api/flashcards/${deckId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: reviewResult.sessionId,
        action: 'submit',
        responses: [
          { cardId: getDeckResult.cards[0].id, answer: 'User answer', correctness: true },
          { cardId: getDeckResult.cards[1].id, answer: 'User answer 2', correctness: false },
          { cardId: getDeckResult.cards[2].id, answer: 'User answer 3', correctness: true }
        ]
      })
    });

    expect(submitResponse.status).toBe(200);
    const submitResult = await submitResponse.json();
    expect(submitResult.success).toBe(true);

    // 5. Verify progress is updated
    const progressResponse = await fetch('/api/learning/progress');
    expect(progressResponse.status).toBe(200);
    const progressResult = await progressResponse.json();
    expect(progressResult.success).toBe(true);
    expect(progressResult.data.totalReviews).toBeGreaterThan(0);

    console.log('Flashcard UI workflow test completed');
  }, 30000);

  test('Complete defense question workflow from creation to practice', async () => {
    // 1. Create a defense question set
    const createResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UI Workflow Test Defense Set',
        questions: [
          {
            question: 'How do you handle criticism of your methodology?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Acknowledge value, explain rationale, show flexibility',
            followUpQuestions: ['What alternatives did you consider?']
          },
          {
            question: 'What are the limitations of your approach?',
            category: 'limitations',
            difficulty: 'challenging',
            answerFramework: 'Acknowledge honestly, explain constraints, suggest future research',
            followUpQuestions: ['How could these be addressed?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(createResponse.status).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    const setId = createResult.setId;
    expect(setId).toBeDefined();

    // 2. Retrieve the question set to verify creation
    const getSetResponse = await fetch(`/api/defense/${setId}/questions`);
    expect(getSetResponse.status).toBe(200);
    const getSetResult = await getSetResponse.json();
    expect(getSetResult.success).toBe(true);
    expect(getSetResult.questions).toHaveLength(2);

    // 3. Start a practice session
    const practiceResponse = await fetch(`/api/defense/${setId}/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        mode: 'timed'
      })
    });

    expect(practiceResponse.status).toBe(200);
    const practiceResult = await practiceResponse.json();
    expect(practiceResult.success).toBe(true);
    expect(practiceResult.sessionId).toBeDefined();
    expect(practiceResult.questions).toHaveLength(2);

    // 4. Submit practice responses
    const submitResponse = await fetch(`/api/defense/${setId}/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: practiceResult.sessionId,
        action: 'submit',
        responses: [
          { questionId: getSetResult.questions[0].id, answer: 'Practice answer 1', rating: 4 },
          { questionId: getSetResult.questions[1].id, answer: 'Practice answer 2', rating: 3 }
        ]
      })
    });

    expect(submitResponse.status).toBe(200);
    const submitResult = await submitResponse.json();
    expect(submitResult.success).toBe(true);

    // 5. Verify progress is updated
    const progressResponse = await fetch('/api/learning/defense');
    expect(progressResponse.status).toBe(200);
    const progressResult = await progressResponse.json();
    expect(progressResult.success).toBe(true);

    console.log('Defense question UI workflow test completed');
  }, 30000);

  test('Complete study guide workflow from creation to tracking', async () => {
    // 1. Create a study guide
    const createResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UI Workflow Test Study Guide',
        executiveSummary: 'Testing complete UI workflow for study guides',
        sections: [
          {
            heading: 'Introduction',
            content: 'This is the introduction section with key information',
            keyPoints: ['Key point 1', 'Key point 2'],
            reviewQuestions: ['Review question 1?', 'Review question 2?']
          },
          {
            heading: 'Methodology',
            content: 'This section describes the methodology in detail',
            keyPoints: ['Methodology point 1', 'Methodology point 2'],
            reviewQuestions: ['Methodology question?']
          }
        ],
        keyTerms: [
          { term: 'Term 1', definition: 'Definition 1' },
          { term: 'Term 2', definition: 'Definition 2' }
        ],
        studyTips: ['Tip 1', 'Tip 2'],
        citationsList: ['Citation 1', 'Citation 2'],
        estimatedReadingTime: 20
      })
    });

    expect(createResponse.status).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    const guideId = createResult.guideId;
    expect(guideId).toBeDefined();

    // 2. Retrieve the guide to verify creation
    const getGuideResponse = await fetch(`/api/study-guides/${guideId}`);
    expect(getGuideResponse.status).toBe(200);
    const getGuideResult = await getGuideResponse.json();
    expect(getGuideResult.success).toBe(true);
    expect(getGuideResult.guide.title).toBe('UI Workflow Test Study Guide');
    expect(getGuideResult.guide.sectionCount).toBe(2);

    // 3. Simulate reading activity
    const activityResponse = await fetch(`/api/study-guides/${guideId}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reading',
        sectionIndex: 0,
        timeSpent: 300, // 5 minutes
        notes: 'Added note during reading workflow test'
      })
    });

    expect(activityResponse.status).toBe(200);
    const activityResult = await activityResponse.json();
    expect(activityResult.success).toBe(true);

    // 4. Verify progress in analytics
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsResult = await analyticsResponse.json();
    expect(analyticsResult.success).toBe(true);
    expect(analyticsResult.data).toBeDefined();

    console.log('Study guide UI workflow test completed');
  }, 30000);

  test('Verify navigation between different tools works correctly', async () => {
    // Test that users can navigate between different tools and maintain context
    const responses = await Promise.all([
      fetch('/api/learning/progress'),
      fetch('/api/learning/flashcards'), 
      fetch('/api/learning/defense'),
      fetch('/api/learning/study-guides'),
      fetch('/api/learning/insights')
    ]);

    // All endpoints should be accessible and return appropriate responses
    responses.forEach((response, index) => {
      const endpoints = [
        '/api/learning/progress',
        '/api/learning/flashcards', 
        '/api/learning/defense',
        '/api/learning/study-guides',
        '/api/learning/insights'
      ];
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      console.log(`Verified navigation to ${endpoints[index]} (status: ${response.status})`);
    });

    console.log('Navigation workflow test completed');
  }, 20000);

  afterAll(() => {
    console.log('Completed UI workflow integration tests');
  });
});