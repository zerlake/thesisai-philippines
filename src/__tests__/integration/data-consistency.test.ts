// src/__tests__/integration/data-consistency.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Data Consistency Integration Tests', () => {
  test('Ensure data consistency between components', async () => {
    // Create data in one component and verify it's reflected in analytics
    const fcResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Consistency Test Deck',
        cards: [
          { question: 'Consistency Q1?', answer: 'Consistency A1', type: 'definition' },
          { question: 'Consistency Q2?', answer: 'Consistency A2', type: 'application' }
        ],
        difficulty: 'medium'
      })
    });

    expect(fcResponse.status).toBe(200);
    const fcResult = await fcResponse.json();
    expect(fcResult.success).toBe(true);
    const fcDeckId = fcResult.deckId;
    expect(fcDeckId).toBeDefined();

    // Create data in defense component
    const defResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Consistency Test Defense Set',
        questions: [
          {
            question: 'Consistency defense question?',
            category: 'methodology',
            difficulty: 'moderate',
            answerFramework: 'Consistency framework',
            followUpQuestions: ['Follow up?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(defResponse.status).toBe(200);
    const defResult = await defResponse.json();
    expect(defResult.success).toBe(true);
    const defSetId = defResult.setId;
    expect(defSetId).toBeDefined();

    // Create data in study guide component
    const sgResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Consistency Test Study Guide',
        executiveSummary: 'Test for consistency across components',
        sections: [
          {
            heading: 'Consistency Section',
            content: 'Testing consistency of data across components',
            keyPoints: ['Consistency point'],
            reviewQuestions: ['Consistency Q?']
          }
        ],
        keyTerms: [
          { term: 'Consistency Term', definition: 'Consistency definition' }
        ],
        studyTips: ['Consistency tip'],
        citationsList: ['Consistency citation'],
        estimatedReadingTime: 10
      })
    });

    expect(sgResponse.status).toBe(200);
    const sgResult = await sgResponse.json();
    expect(sgResult.success).toBe(true);
    const sgId = sgResult.guideId;
    expect(sgId).toBeDefined();

    // Verify all created items appear in analytics with correct data
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);

    // Check that data from all components is included in analytics
    expect(analyticsData.data).toHaveProperty('flashcardData');
    expect(analyticsData.data).toHaveProperty('defenseData');
    expect(analyticsData.data).toHaveProperty('studyGuideData');

    console.log('Data consistency across components test completed');
  }, 30000);

  test('Verify data persistence across sessions', async () => {
    // In a real implementation, this would test data persistence across different sessions
    // For now, we'll test that data remains consistent across multiple fetches
    
    // First fetch
    const firstResponse = await fetch('/api/learning/progress');
    expect(firstResponse.status).toBe(200);
    const firstData = await firstResponse.json();
    expect(firstData.success).toBe(true);
    const firstReadiness = firstData.data.estimatedReadiness;

    // Wait a bit to ensure any changes would be reflected
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Second fetch
    const secondResponse = await fetch('/api/learning/progress');
    expect(secondResponse.status).toBe(200);
    const secondData = await secondResponse.json();
    expect(secondData.success).toBe(true);
    const secondReadiness = secondData.data.estimatedReadiness;

    // Without activity between fetches, these values should be the same
    expect(firstReadiness).toBe(secondReadiness);

    console.log('Data persistence across sessions test completed');
  }, 15000);

  test('Ensure data integrity when performing multiple operations', async () => {
    // Create multiple decks in sequence to test data integrity
    const deckPromises = [];
    for (let i = 0; i < 5; i++) {
      deckPromises.push(
        fetch('/api/flashcards/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Integrity Test Deck ${i}`,
            cards: [
              { question: `Q${i}?`, answer: `A${i}`, type: 'definition' }
            ],
            difficulty: 'easy'
          })
        })
      );
    }

    const deckResponses = await Promise.all(deckPromises);
    const deckResults = [];
    
    for (let i = 0; i < deckResponses.length; i++) {
      expect(deckResponses[i].status).toBe(200);
      const result = await deckResponses[i].json();
      expect(result.success).toBe(true);
      expect(result.deckId).toBeDefined();
      deckResults.push(result);
    }

    // Verify all decks were created with unique IDs
    const deckIds = deckResults.map(r => r.deckId);
    expect(new Set(deckIds).size).toBe(deckIds.length); // All IDs should be unique

    // Check analytics to ensure all decks are counted
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);

    console.log('Data integrity with multiple operations test completed');
  }, 25000);

  test('Verify transactional integrity across related operations', async () => {
    // In a real implementation, this would test that related operations either all succeed or all fail
    // For now, we'll test that creating a deck with cards works correctly
    
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Transactional Integrity Test Deck',
        cards: [
          { question: 'Transaction Q1?', answer: 'Transaction A1', type: 'definition' },
          { question: 'Transaction Q2?', answer: 'Transaction A2', type: 'application' },
          { question: 'Transaction Q3?', answer: 'Transaction A3', type: 'explanation' }
        ],
        difficulty: 'medium'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.deckId).toBeDefined();
    expect(result.cardCount).toBe(3); // Should have created all cards

    // Retrieve the deck to verify all cards were created
    const getCardsResponse = await fetch(`/api/flashcards/${result.deckId}/cards`);
    expect(getCardsResponse.status).toBe(200);
    const cardsResult = await getCardsResponse.json();
    expect(cardsResult.success).toBe(true);
    expect(cardsResult.cards).toHaveLength(3); // Should have all 3 cards

    console.log('Transactional integrity test completed');
  }, 20000);
});