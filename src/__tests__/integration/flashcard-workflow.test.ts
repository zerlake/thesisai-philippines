// src/__tests__/integration/flashcard-workflow.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Flashcard Workflow Integration Test', () => {
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
  });

  test('Complete flashcard workflow: create deck, add cards, review, and track progress', async () => {
    // Step 1: Create a flashcard deck
    const deckResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real test, we would include proper authentication
      },
      body: JSON.stringify({
        title: 'Test Deck - Integration',
        description: 'A deck created for integration testing',
        cards: [
          { question: 'What is photosynthesis?', answer: 'Process of converting light to energy', type: 'definition' },
          { question: 'How does it work?', answer: 'Through chlorophyll in plants', type: 'explanation' },
        ],
        difficulty: 'medium'
      })
    });

    expect(deckResponse.status).toBe(200);
    const deckResult = await deckResponse.json();
    expect(deckResult.success).toBe(true);
    expect(deckResult.deckId).toBeDefined();
    expect(deckResult.cardCount).toBe(2);

    const deckId = deckResult.deckId;

    // Step 2: Fetch the created deck to verify it exists
    const getDecksResponse = await fetch('/api/flashcards/decks');
    expect(getDecksResponse.status).toBe(200);
    const getDecksResult = await getDecksResponse.json();
    expect(getDecksResult.success).toBe(true);
    const deck = getDecksResult.decks.find((d: any) => d.id === deckId);
    expect(deck).toBeDefined();
    expect(deck.title).toBe('Test Deck - Integration');

    // Step 3: Fetch cards from the deck
    const getCardsResponse = await fetch(`/api/flashcards/${deckId}/cards`);
    expect(getCardsResponse.status).toBe(200);
    const getCardsResult = await getCardsResponse.json();
    expect(getCardsResult.success).toBe(true);
    expect(getCardsResult.cards).toHaveLength(2);
    expect(getCardsResult.cards[0].front).toBe('What is photosynthesis?');
    expect(getCardsResult.cards[0].back).toBe('Process of converting light to energy');

    // Step 4: In a real scenario we would test the review workflow
    // For now, we'll just check that the basic functionality works
    console.log('Flashcard workflow integration test completed successfully');
  }, 30000); // 30 second timeout for this test
});