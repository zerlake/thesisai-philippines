// src/__tests__/integration/multilingual.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Multilingual Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting multilingual integration tests');
  });

  afterAll(() => {
    console.log('Completed multilingual integration tests');
  });

  test('Test handling of Filipino/Tagalog content', async () => {
    const response = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pagsubok sa Pagbuo ng Gabay sa Pag-aaral sa Filipino',
        executiveSummary: 'Ito ay isang komprehensibong gabay sa pag-aaral na ginawa para sa pagsubok ng sistema sa Filipino.',
        sections: [
          {
            heading: 'Panimula',
            content: 'Ang panimula ay nagpapakilala sa pangunahing paksa at layunin ng pag-aaral. Ito ang pundasyon ng buong papel.',
            keyPoints: [
              'Pagpapakilala sa paksa',
              'Paghahatid ng layunin',
              'Paghahanda sa mga mambabasa'
            ],
            reviewQuestions: [
              'Ano ang pangunahing layunin ng papel?',
              'Paano ipinakikilala ang paksa?'
            ]
          },
          {
            heading: 'Metodolohiya',
            content: 'Nilalarawan ang paraan kung paano isinagawa ang pananaliksik. Kasama dito ang disenyo, instrumento, populasyon, at proseso.',
            keyPoints: [
              'Deskripsyon ng disenyo ng pananaliksik',
              'Gamit na instrumento',
              'Paraan ng sampling'
            ],
            reviewQuestions: [
              'Anong uri ng metodolohiya ang ginamit?',
              'Paano pinili ang sampol?'
            ]
          }
        ],
        keyTerms: [
          { term: 'Metodolohiya', definition: 'Paraan ng pagsasagawa ng pananaliksik' },
          { term: 'Disenyong Pananaliksik', definition: 'Balangkas na ginagamit sa pag-aaral' }
        ],
        studyTips: [
          'Basahin nang mabuti ang bawat seksyon',
          'Gumawa ng mga tala habang nagbabasa',
          'Iugnay sa iyong sariling karanasan'
        ],
        citationsList: [
          'Dela Cruz, J. (2025). Gabay sa Akademikong Pagsulat. Manila: Aklat Publishing.',
          'Reyes, M. (2024). Modernong Pananaliksik. Quezon City: Edukasyon Press.'
        ],
        estimatedReadingTime: 45
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.guideId).toBeDefined();

    console.log('Filipino language content test completed');
  }, 25000);

  test('Test handling of English-Filipino mixed content', async () => {
    const response = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'English-Filipino Mixed Terminology Deck',
        description: 'Test deck with mixed English and Filipino terminology',
        cards: [
          { 
            question: 'Ano ang "quantitative research"?', 
            answer: 'Uri ng pananaliksik na gumagamit ng numerical data', 
            type: 'definition' 
          },
          { 
            question: 'What is "metodolohiya" in English?', 
            answer: 'Methodology - the systematic approach to research', 
            type: 'translation' 
          },
          { 
            question: 'Paano gumawa ng "literature review"?', 
            answer: 'Systematically gather, evaluate, and synthesize existing research', 
            type: 'application' 
          }
        ],
        difficulty: 'medium'
      })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.deckId).toBeDefined();

    console.log('Mixed language content test completed');
  }, 20000);

  test('Test analytics processing with multilingual content', async () => {
    // Test that analytics still work with multilingual content
    const response = await fetch('/api/learning/analytics');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    console.log('Multilingual analytics test completed');
  }, 15000);

  console.log('Completed 3 multilingual integration tests');
});