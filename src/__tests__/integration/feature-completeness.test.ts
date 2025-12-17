// src/__tests__/integration/feature-completeness.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Feature Completeness Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting feature completeness integration tests');
  });

  test('Verify flashcard creation workflow completes successfully', async () => {
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Feature Completeness Test Deck',
        description: 'Testing complete flashcard creation workflow',
        cards: [
          { question: 'What is feature completeness?', answer: 'Ensuring all features work as intended', type: 'definition' },
          { question: 'Why is it important?', answer: 'To deliver complete functionality', type: 'application' }
        ],
        difficulty: 'medium'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.deckId).toBeDefined();
    expect(result.cardCount).toBe(2);
    expect(result.message).toContain('Flashcard deck created');

    // Verify the deck can be retrieved
    const getResponse = await fetch(`/api/flashcards/${result.deckId}/cards`);
    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    expect(getData.success).toBe(true);
    expect(getData.cards).toHaveLength(2);

    console.log('Flashcard creation workflow test completed');
  }, 20000);

  test('Verify defense question workflow completes successfully', async () => {
    const response = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Feature Completeness Test Defense Set',
        questions: [
          {
            question: 'What constitutes feature completeness?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Defines completion and adequacy of implementation',
            followUpQuestions: ['How is it measured?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.setId).toBeDefined();
    expect(result.questionCount).toBe(1);

    // Verify the set can be retrieved
    const getResponse = await fetch(`/api/defense/${result.setId}/questions`);
    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    expect(getData.success).toBe(true);
    expect(getData.questions).toHaveLength(1);

    console.log('Defense question workflow test completed');
  }, 20000);

  test('Verify study guide workflow completes successfully', async () => {
    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Feature Completeness Test Study Guide',
        executiveSummary: 'Testing complete study guide creation workflow',
        sections: [
          {
            heading: 'Feature Testing Section',
            content: 'This section tests whether features are completely implemented',
            keyPoints: ['Completeness means full functionality', 'Testing ensures quality'],
            reviewQuestions: ['What is feature completeness?']
          }
        ],
        keyTerms: [
          { term: 'Feature', definition: 'A specific capability of the system' },
          { term: 'Completeness', definition: 'Degree to which a feature is fully implemented' }
        ],
        studyTips: ['Test all aspects of a feature', 'Verify edge cases work'],
        citationsList: ['Feature Testing Standards, 2025'],
        estimatedReadingTime: 10
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.guideId).toBeDefined();
    expect(result.sectionCount).toBe(1);

    // Verify the guide can be retrieved
    const getResponse = await fetch(`/api/study-guides/${result.guideId}`);
    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    expect(getData.success).toBe(true);
    expect(getData.guide.title).toBe('Feature Completeness Test Study Guide');

    console.log('Study guide workflow test completed');
  }, 25000);

  test('Verify analytics dashboard shows all component data', async () => {
    const response = await fetch('/api/learning/analytics');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    // Verify presence of data from all major components
    expect(data.data).toHaveProperty('estimatedReadiness');
    expect(data.data).toHaveProperty('learningVelocity');
    expect(data.data).toHaveProperty('flashcardData');
    expect(data.data).toHaveProperty('defenseData');
    expect(data.data).toHaveProperty('studyGuideData');
    expect(data.data).toHaveProperty('insights');

    // Verify structure of flashcard data
    expect(data.data.flashcardData).toHaveProperty('masteryByDeck');
    expect(data.data.flashcardData).toHaveProperty('retentionCurve');
    expect(data.data.flashcardData).toHaveProperty('nextReviewForecast');

    // Verify structure of defense data
    expect(data.data.defenseData).toHaveProperty('difficultyProgression');
    expect(data.data.defenseData).toHaveProperty('avgResponseTime');
    expect(data.data.defenseData).toHaveProperty('performanceByCategory');

    // Verify structure of study guide data
    expect(data.data.studyGuideData).toHaveProperty('completionByGuide');
    expect(data.data.studyGuideData).toHaveProperty('pagesRead');
    expect(data.data.studyGuideData).toHaveProperty('notesTaken');

    console.log('Analytics dashboard data completeness test completed');
  }, 20000);

  test('Verify insights generation is complete', async () => {
    const response = await fetch('/api/learning/insights');
    expect(response.status).toBe(200);
    const insights = await response.json();
    expect(Array.isArray(insights)).toBe(true);

    // Verify insights have complete structure
    for (const insight of insights) {
      expect(insight).toHaveProperty('id');
      expect(insight).toHaveProperty('type');
      expect(insight).toHaveProperty('title');
      expect(insight).toHaveProperty('description');
      expect(insight).toHaveProperty('actionItems');
      expect(Array.isArray(insight.actionItems)).toBe(true);
      expect(insight).toHaveProperty('createdAt');
    }

    console.log('Insights completeness test completed');
  }, 15000);

  afterAll(() => {
    console.log('Completed feature completeness integration tests');
  });
});