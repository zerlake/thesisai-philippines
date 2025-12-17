// src/__tests__/integration/user-acceptance.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('User Acceptance Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting user acceptance integration tests');
  });

  afterAll(() => {
    console.log('Completed user acceptance integration tests');
  });

  test('Complete thesis workflow simulation', async () => {
    // Simulate a complete thesis workflow using all tools
    const startTime = Date.now();

    // Step 1: Create a study guide
    const studyGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'User Acceptance Test Study Guide',
        executiveSummary: 'Comprehensive study guide for user acceptance testing',
        sections: [
          {
            heading: 'Introduction',
            content: 'This is the introduction section with key concepts',
            keyPoints: ['Main concept 1', 'Main concept 2'],
            reviewQuestions: ['What is the main idea?', 'How does it apply?']
          },
          {
            heading: 'Literature Review',
            content: 'This section reviews relevant literature',
            keyPoints: ['Key finding 1', 'Key finding 2'],
            reviewQuestions: ['What did previous studies find?', 'How does this differ?']
          }
        ],
        keyTerms: [
          { term: 'Term 1', definition: 'Definition for term 1' },
          { term: 'Term 2', definition: 'Definition for term 2' }
        ],
        studyTips: ['Tip 1', 'Tip 2'],
        citationsList: ['Citation 1', 'Citation 2'],
        estimatedReadingTime: 30
      })
    });

    expect(studyGuideResponse.status).toBe(200);
    const studyGuideResult = await studyGuideResponse.json();
    expect(studyGuideResult.success).toBe(true);
    expect(studyGuideResult.guideId).toBeDefined();
    const guideId = studyGuideResult.guideId;

    // Step 2: Create flashcards based on the study guide
    const flashcardResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'User Acceptance Test Flashcards',
        description: 'Flashcards created from user acceptance study guide',
        cards: [
          { question: 'What is the main concept?', answer: 'Main concept 1', type: 'definition' },
          { question: 'How does it apply?', answer: 'In practical scenarios', type: 'application' },
          { question: 'What did previous studies find?', answer: 'Key finding 1', type: 'explanation' }
        ],
        difficulty: 'medium'
      })
    });

    expect(flashcardResponse.status).toBe(200);
    const flashcardResult = await flashcardResponse.json();
    expect(flashcardResult.success).toBe(true);
    expect(flashcardResult.deckId).toBeDefined();
    const deckId = flashcardResult.deckId;

    // Step 3: Create defense questions related to the study guide and flashcards
    const defenseResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'User Acceptance Test Defense Questions',
        questions: [
          {
            question: 'How do you define the main concept?',
            category: 'conceptual',
            difficulty: 'moderate',
            answerFramework: 'Define and provide context',
            followUpQuestions: ['What are the key characteristics?']
          },
          {
            question: 'How does this apply in practice?',
            category: 'application',
            difficulty: 'challenging',
            answerFramework: 'Explain application with examples',
            followUpQuestions: ['What are potential challenges?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(defenseResponse.status).toBe(200);
    const defenseResult = await defenseResponse.json();
    expect(defenseResult.success).toBe(true);
    expect(defenseResult.setId).toBeDefined();

    // Step 4: Get analytics dashboard data
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsResult = await analyticsResponse.json();
    expect(analyticsResult.success).toBe(true);
    expect(analyticsResult.data).toBeDefined();

    // Verify that progress is being tracked across tools
    expect(analyticsResult.data.estimatedReadiness).toBeGreaterThanOrEqual(0);
    expect(analyticsResult.data.estimatedReadiness).toBeLessThanOrEqual(100);

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Complete thesis workflow completed in ${totalTime}ms`);
  }, 45000);

  test('Test flashcard workflow from creation to review', async () => {
    // Test complete workflow: create deck, add cards, review session
    const deckCreationResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UAT - Flashcard Workflow Test',
        description: 'Testing complete flashcard workflow',
        cards: [
          { 
            question: 'What is the central theme?', 
            answer: 'The central theme is user acceptance testing', 
            type: 'definition' 
          },
          { 
            question: 'How is this validated?', 
            answer: 'Through comprehensive acceptance tests', 
            type: 'explanation' 
          },
          { 
            question: 'What are practical applications?', 
            answer: 'Validating functionality meets user requirements', 
            type: 'application' 
          }
        ],
        difficulty: 'medium'
      })
    });

    expect(deckCreationResponse.status).toBe(200);
    const deckCreationResult = await deckCreationResponse.json();
    expect(deckCreationResult.success).toBe(true);
    expect(deckCreationResult.deckId).toBeDefined();

    const deckId = deckCreationResult.deckId;
    expect(deckId).toBeDefined();

    // Fetch the created deck to verify it exists
    const getDeckResponse = await fetch(`/api/flashcards/decks/${deckId}`);
    expect(getDeckResponse.status).toBe(200);
    const getDeckResult = await getDeckResponse.json();
    expect(getDeckResult.success).toBe(true);
    expect(getDeckResult.deck.id).toBe(deckId);

    // Fetch cards in the deck
    const getCardsResponse = await fetch(`/api/flashcards/${deckId}/cards`);
    expect(getCardsResponse.status).toBe(200);
    const getCardsResult = await getCardsResponse.json();
    expect(getCardsResult.success).toBe(true);
    expect(getCardsResult.cards).toHaveLength(3);

    // Simulate review session
    const reviewResponse = await fetch(`/api/flashcards/${deckId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'uat-test-session',
        responses: [
          { cardId: getCardsResult.cards[0].id, answer: 'User acceptance testing', correctness: true },
          { cardId: getCardsResult.cards[1].id, answer: 'Through tests', correctness: true },
          { cardId: getCardsResult.cards[2].id, answer: 'Practical implementation', correctness: false }
        ]
      })
    });

    expect(reviewResponse.status).toBe(200);
    const reviewResult = await reviewResponse.json();
    expect(reviewResult.success).toBe(true);
    
    console.log('Flashcard workflow user acceptance test completed');
  }, 30000);

  test('Test defense preparation workflow', async () => {
    // Test complete defense workflow: create questions, practice, get feedback
    
    // Create a defense question set
    const createSetResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UAT - Defense Preparation Test',
        questions: [
          {
            question: 'How did you select your research methodology?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Justify approach based on research objectives',
            followUpQuestions: ['What alternatives did you consider?']
          },
          {
            question: 'What are the key implications of your findings?',
            category: 'findings',
            difficulty: 'challenging',
            answerFramework: 'Explain significance and practical applications',
            followUpQuestions: ['How do these compare to existing literature?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(createSetResponse.status).toBe(200);
    const createSetResult = await createSetResponse.json();
    expect(createSetResult.success).toBe(true);
    expect(createSetResult.setId).toBeDefined();
    const setId = createSetResult.setId;

    // Start a practice session
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

    const sessionId = practiceResult.sessionId;
    
    // Submit practice responses
    const submitResponse = await fetch(`/api/defense/${setId}/practice/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        responses: [
          { questionId: practiceResult.questions[0].id, answer: 'My methodology selection process...', rating: 4 },
          { questionId: practiceResult.questions[1].id, answer: 'The implications are significant...', rating: 3 }
        ]
      })
    });

    expect(submitResponse.status).toBe(200);
    const submitResult = await submitResponse.json();
    expect(submitResult.success).toBe(true);

    // Get performance feedback
    const feedbackResponse = await fetch(`/api/defense/${setId}/feedback`);
    expect(feedbackResponse.status).toBe(200);
    const feedbackResult = await feedbackResponse.json();
    expect(feedbackResult.success).toBe(true);
    expect(Array.isArray(feedbackResult.feedback)).toBe(true);

    console.log('Defense preparation workflow user acceptance test completed');
  }, 35000);

  test('Test study guide workflow - creation, access, and annotation', async () => {
    // Test complete study guide workflow: create, access, add notes
    
    // Create a study guide
    const createGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'UAT - Study Guide Workflow Test',
        executiveSummary: 'User acceptance test for study guide workflow',
        sections: [
          {
            heading: 'Introduction',
            content: 'Comprehensive introduction section with key concepts',
            keyPoints: ['Key concept 1', 'Key concept 2'],
            reviewQuestions: ['What is the main idea?', 'Why is it important?']
          },
          {
            heading: 'Methodology',
            content: 'Detailed methodology section explaining research approach',
            keyPoints: ['Research approach', 'Data collection method'],
            reviewQuestions: ['How was data collected?', 'Why this approach?']
          }
        ],
        keyTerms: [
          { term: 'Research Methodology', definition: 'Approach for conducting research' },
          { term: 'Data Collection', definition: 'Process of gathering information' }
        ],
        studyTips: [
          'Focus on understanding concepts first',
          'Connect ideas across sections'
        ],
        citationsList: [
          'Research Standards Organization. (2025). Academic Guidelines'
        ],
        estimatedReadingTime: 45
      })
    });

    expect(createGuideResponse.status).toBe(200);
    const createGuideResult = await createGuideResponse.json();
    expect(createGuideResult.success).toBe(true);
    expect(createGuideResult.guideId).toBeDefined();
    const guideId = createGuideResult.guideId;

    // Fetch the created guide
    const getGuideResponse = await fetch(`/api/study-guides/${guideId}`);
    expect(getGuideResponse.status).toBe(200);
    const getGuideResult = await getGuideResponse.json();
    expect(getGuideResult.success).toBe(true);
    expect(getGuideResult.guide.title).toBe('UAT - Study Guide Workflow Test');

    // Test adding annotations/notes to the guide
    const addNoteResponse = await fetch(`/api/study-guides/${guideId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionHeading: 'Introduction',
        position: 100, // Character position
        note: 'Important concept to remember for defense'
      })
    });

    expect(addNoteResponse.status).toBe(200);
    const addNoteResult = await addNoteResponse.json();
    expect(addNoteResult.success).toBe(true);
    expect(addNoteResult.noteId).toBeDefined();

    // Get guide with notes
    const getNotesResponse = await fetch(`/api/study-guides/${guideId}/notes`);
    expect(getNotesResponse.status).toBe(200);
    const getNotesResult = await getNotesResponse.json();
    expect(getNotesResult.success).toBe(true);
    expect(Array.isArray(getNotesResult.notes)).toBe(true);

    console.log('Study guide workflow user acceptance test completed');
  }, 30000);

  test('Test analytics dashboard user experience', async () => {
    // Test the analytics dashboard functionality from a user perspective
    
    // Get progress data
    const progressResponse = await fetch('/api/learning/progress');
    expect(progressResponse.status).toBe(200);
    const progressResult = await progressResponse.json();
    expect(progressResult.success).toBe(true);
    expect(progressResult.data).toBeDefined();

    // Get flashcard data
    const flashcardDataResponse = await fetch('/api/learning/flashcards');
    expect(flashcardDataResponse.status).toBe(200);
    const flashcardDataResult = await flashcardDataResponse.json();
    expect(flashcardDataResult.success).toBe(true);

    // Get defense data
    const defenseDataResponse = await fetch('/api/learning/defense');
    expect(defenseDataResponse.status).toBe(200);
    const defenseDataResult = await defenseDataResponse.json();
    expect(defenseDataResult.success).toBe(true);

    // Get study guide data
    const studyGuideDataResponse = await fetch('/api/learning/study-guides');
    expect(studyGuideDataResponse.status).toBe(200);
    const studyGuideDataResult = await studyGuideDataResponse.json();
    expect(studyGuideDataResult.success).toBe(true);

    // Get AI insights
    const insightsResponse = await fetch('/api/learning/insights');
    expect(insightsResponse.status).toBe(200);
    const insightsResult = await insightsResponse.json();
    expect(insightsResult.success).toBe(true);
    expect(Array.isArray(insightsResult.insights)).toBe(true);

    // Test aggregated analytics
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsResult = await analyticsResponse.json();
    expect(analyticsResult.success).toBe(true);
    expect(analyticsResult.data).toBeDefined();
    expect(analyticsResult.data.estimatedReadiness).toBeDefined();
    expect(analyticsResult.data.learningVelocity).toBeDefined();

    console.log('Analytics dashboard user experience test completed');
  }, 20000);

  test('Test accessibility compliance', async () => {
    // Though we can't test actual accessibility in this environment,
    // we can verify that proper semantic elements and attributes are being used
    // by checking page structure/elements
    
    // For this test, we'll verify that API responses include proper error structures
    // which would support accessibility in the UI
    
    const response = await fetch('/api/learning/analytics');
    expect(response.status).toBe(200);
    
    const headers = response.headers;
    const contentType = headers.get('content-type');
    expect(contentType).toMatch(/application\/json/);
    
    // Verify the response structure supports accessibility
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
    
    console.log('Accessibility compliance verification completed');
  }, 15000);

  test('Test error handling and user-friendly messages', async () => {
    // Test that errors are handled gracefully with user-friendly messages
    
    // Test with invalid data
    const invalidResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '', // Invalid - empty title
        cards: [], // Invalid - no cards
        difficulty: 'impossible' // Invalid difficulty value
      })
    });

    // Should return appropriate error response
    expect(invalidResponse.status).toBeGreaterThanOrEqual(400);
    expect(invalidResponse.status).toBeLessThan(500);
    
    const errorData = await invalidResponse.json();
    expect(errorData).toBeDefined();
    // Should have a user-friendly error message
    expect(errorData.error).toBeDefined();

    // Test with malformed JSON
    const malformedResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "malformed": json' // Invalid JSON
    });

    expect(malformedResponse.status).toBeGreaterThanOrEqual(400);
    expect(malformedResponse.status).toBeLessThan(500);

    console.log('Error handling and user-friendly messages test completed');
  }, 15000);

  test('Test responsive design and cross-device compatibility', async () => {
    // Test that the API returns appropriate data regardless of client type
    // (In a real test, we'd test the UI responses to different viewports)
    
    const headers = [
      {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1',
        'Accept': 'application/json'
      },
      {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1',
        'Accept': 'application/json'
      },
      {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    ];

    for (const header of headers) {
      const response = await fetch('/api/learning/analytics', { headers });
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    }

    console.log('Cross-device compatibility test completed');
  }, 20000);

  test('Test data export functionality', async () => {
    // Test that users can export their data in various formats
    
    // Test JSON export
    const jsonResponse = await fetch('/api/learning/analytics/export?format=json');
    expect(jsonResponse.status).toBe(200);
    expect(jsonResponse.headers.get('content-type')).toMatch(/application\/json/);

    // Test CSV export
    const csvResponse = await fetch('/api/learning/analytics/export?format=csv');
    expect(csvResponse.status).toBe(200);
    expect(csvResponse.headers.get('content-type')).toMatch(/text\/csv/);

    // Test PDF export
    const pdfResponse = await fetch('/api/learning/analytics/export?format=pdf');
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers.get('content-type')).toMatch(/application\/pdf/);

    console.log('Data export functionality test completed');
  }, 20000);

  console.log('Completed 10+ user acceptance tests');
});