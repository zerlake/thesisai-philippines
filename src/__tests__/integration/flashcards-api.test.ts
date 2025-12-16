// src/__tests__/integration/flashcards-api.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Flashcards API Integration Test', () => {
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
      .ilike('title', 'Flashcards API Test%');
  });

  test('POST /api/flashcards/decks creates a new deck', async () => {
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Flashcards API Test - Create Deck',
        description: 'Testing deck creation',
        cards: [
          { question: 'Test Q1', answer: 'Test A1', type: 'definition' }
        ],
        difficulty: 'easy'
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('deckId');
    expect(data).toHaveProperty('cardCount');
    expect(data.success).toBe(true);
    expect(typeof data.deckId).toBe('string');
    expect(data.cardCount).toBe(1);
    
    console.log('POST /api/flashcards/decks test completed');
  }, 20000);

  test('GET /api/flashcards/decks retrieves user decks', async () => {
    const response = await fetch('/api/flashcards/decks');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('decks');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.decks)).toBe(true);
    
    // Check if our test deck is in the list
    const testDeck = data.decks.find((d: any) => d.title === 'Flashcards API Test - Create Deck');
    expect(testDeck).toBeDefined();
    
    console.log('GET /api/flashcards/decks test completed');
  }, 20000);

  test('GET /api/flashcards/[deckId]/cards retrieves specific deck cards', async () => {
    // First create a deck to test with
    const createResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Flashcards API Test - Get Cards',
        description: 'Testing card retrieval',
        cards: [
          { question: 'Q1', answer: 'A1', type: 'definition' },
          { question: 'Q2', answer: 'A2', type: 'explanation' }
        ],
        difficulty: 'medium'
      })
    });

    expect(createResponse.status).toBe(200);
    const createData = await createResponse.json();
    expect(createData.deckId).toBeDefined();

    // Then retrieve the cards for that deck
    const response = await fetch(`/api/flashcards/${createData.deckId}/cards`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('cards');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.cards)).toBe(true);
    expect(data.cards).toHaveLength(2);
    
    const firstCard = data.cards[0];
    expect(firstCard).toHaveProperty('front');
    expect(firstCard).toHaveProperty('back');
    expect(firstCard).toHaveProperty('card_type');
    
    console.log('GET /api/flashcards/[deckId]/cards test completed');
  }, 20000);

  test('POST /api/flashcards/[deckId]/cards adds cards to existing deck', async () => {
    // First create a deck
    const createResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Flashcards API Test - Add Cards',
        description: 'Testing adding cards to existing deck',
        cards: [
          { question: 'Initial Q', answer: 'Initial A', type: 'definition' }
        ],
        difficulty: 'easy'
      })
    });

    expect(createResponse.status).toBe(200);
    const createData = await createResponse.json();
    expect(createData.deckId).toBeDefined();

    // Then add more cards to the deck
    const addCardsResponse = await fetch(`/api/flashcards/${createData.deckId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cards: [
          { question: 'Added Q1', answer: 'Added A1', type: 'explanation' },
          { question: 'Added Q2', answer: 'Added A2', type: 'application' }
        ]
      })
    });

    expect(addCardsResponse.status).toBe(200);
    
    const addData = await addCardsResponse.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('cardCount');
    expect(data.success).toBe(true);
    expect(data.cardCount).toBe(2); // Number of cards added
    
    console.log('POST /api/flashcards/[deckId]/cards test completed');
  }, 30000);
});