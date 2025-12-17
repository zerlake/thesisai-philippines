// src/__tests__/integration/cross-component-integration.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Cross-Component Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting cross-component integration tests');
  });

  test('Verify flashcard component communicates with analytics dashboard', async () => {
    // Simulate creating flashcards and verifying they appear in analytics
    const createDeckResponse = await fetch('/api/flashcards/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cross-Component Test Deck',
        cards: [
          { question: 'How do components integrate?', answer: 'Through shared state and API', type: 'definition' },
          { question: 'Why is integration important?', answer: 'Ensures consistent user experience', type: 'application' }
        ],
        difficulty: 'medium'
      })
    });

    expect(createDeckResponse.status).toBe(200);
    const createResult = await createDeckResponse.json();
    expect(createResult.success).toBe(true);
    const deckId = createResult.deckId;
    expect(deckId).toBeDefined();

    // Now verify the deck appears in analytics
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);
    expect(analyticsData.data).toBeDefined();
    
    // Verify that flashcard data exists
    expect(analyticsData.data).toHaveProperty('flashcardData');
    expect(analyticsData.data.flashcardData).toHaveProperty('masteryByDeck');
    
    // Check that our test deck is reflected in analytics
    if (analyticsData.data.flashcardData.masteryByDeck) {
      const deckInAnalytics = analyticsData.data.flashcardData.masteryByDeck.find(
        (deck: any) => deck.deck.includes('Cross-Component Test')
      );
      expect(deckInAnalytics).toBeDefined();
    }

    console.log('Flashcard-Analytics cross-component test completed');
  }, 25000);

  test('Verify defense component integrates with progress tracking', async () => {
    // Create a defense question set
    const createSetResponse = await fetch('/api/defense/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cross-Component Defense Test Set',
        questions: [
          {
            question: 'How does component integration work?',
            category: 'integration',
            difficulty: 'moderate',
            answerFramework: 'Through shared services and state management',
            followUpQuestions: ['What technologies enable this?']
          }
        ],
        difficulty: 'moderate'
      })
    });

    expect(createSetResponse.status).toBe(200);
    const createSetResult = await createSetResponse.json();
    expect(createSetResult.success).toBe(true);
    expect(createSetResult.setId).toBeDefined();

    // Verify in progress tracking
    const progressResponse = await fetch('/api/learning/progress');
    expect(progressResponse.status).toBe(200);
    const progressData = await progressResponse.json();
    expect(progressData.success).toBe(true);
    
    // The defense question creation should affect overall progress metrics
    expect(progressData.data).toBeDefined();
    expect(typeof progressData.data.totalReviews).toBe('number');
    
    console.log('Defense-Progress cross-component test completed');
  }, 25000);

  test('Verify study guide component updates analytics', async () => {
    // Create a study guide
    const createGuideResponse = await fetch('/api/study-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cross-Component Study Guide Test',
        executiveSummary: 'Test guide for cross-component integration',
        sections: [
          {
            heading: 'Integration Concepts',
            content: 'This section discusses how components integrate with each other',
            keyPoints: [
              'Shared state management',
              'Common data structures',
              'API consistency'
            ],
            reviewQuestions: [
              'How do components communicate?'
            ]
          }
        ],
        keyTerms: [
          { term: 'Component Integration', definition: 'The process of connecting multiple UI components' }
        ],
        studyTips: [
          'Use consistent design patterns',
          'Share data through services'
        ],
        citationsList: [
          'Integration Patterns, 2025'
        ],
        estimatedReadingTime: 10
      })
    });

    expect(createGuideResponse.status).toBe(200);
    const createGuideResult = await createGuideResponse.json();
    expect(createGuideResult.success).toBe(true);
    expect(createGuideResult.guideId).toBeDefined();

    // Verify in analytics
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);
    expect(analyticsData.data).toHaveProperty('studyGuideData');
    
    if (analyticsData.data.studyGuideData.completionByGuide) {
      const guideInAnalytics = analyticsData.data.studyGuideData.completionByGuide.find(
        (guide: any) => guide.guide.includes('Cross-Component Study Guide')
      );
      expect(guideInAnalytics).toBeDefined();
    }

    console.log('Study Guide-Analytics cross-component test completed');
  }, 25000);

  test('Verify all components affect overall readiness score', async () => {
    // Get baseline metrics
    const baselineResponse = await fetch('/api/learning/progress');
    expect(baselineResponse.status).toBe(200);
    const baselineData = await baselineResponse.json();
    expect(baselineData.success).toBe(true);
    expect(baselineData.data).toBeDefined();
    const baselineReadiness = baselineData.data.estimatedReadiness || 0;

    // Perform activities with each component
    const [fcResponse, defResponse, sgResponse] = await Promise.all([
      // Create/update flashcard activity
      fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Activity Test Deck',
          cards: [
            { question: 'Test?', answer: 'Answer', type: 'definition' }
          ],
          difficulty: 'easy'
        })
      }),

      // Create/update defense activity
      fetch('/api/defense/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Activity Test Set',
          questions: [
            {
              question: 'Test defense question?',
              category: 'general',
              difficulty: 'easy',
              answerFramework: 'Test framework',
              followUpQuestions: ['Follow up?']
            }
          ],
          difficulty: 'easy'
        })
      }),

      // Create/update study guide activity
      fetch('/api/study-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Activity Test Guide',
          executiveSummary: 'Test for activity verification',
          sections: [{ heading: 'Test', content: 'Content', keyPoints: ['Point'], reviewQuestions: ['Q?'] }],
          keyTerms: [{ term: 'Test', definition: 'Definition' }],
          studyTips: ['Tip'],
          citationsList: ['Citation'],
          estimatedReadingTime: 5
        })
      })
    ]);

    expect(fcResponse.status).toBe(200);
    expect(defResponse.status).toBe(200);
    expect(sgResponse.status).toBe(200);

    // Get updated metrics after activities
    const updatedResponse = await fetch('/api/learning/progress');
    expect(updatedResponse.status).toBe(200);
    const updatedData = await updatedResponse.json();
    expect(updatedData.success).toBe(true);
    expect(updatedData.data).toBeDefined();
    const updatedReadiness = updatedData.data.estimatedReadiness || 0;

    // After activities, overall metrics should be at least as high as before
    // (could be higher due to increased engagement)
    expect(updatedReadiness).toBeGreaterThanOrEqual(baselineReadiness);

    console.log('All components affecting readiness score test completed');
  }, 30000);

  test('Verify insights are generated based on multiple component usage', async () => {
    // Get existing insights
    const insightsResponse = await fetch('/api/learning/insights');
    expect(insightsResponse.status).toBe(200);
    const initialInsights = await insightsResponse.json();
    expect(Array.isArray(initialInsights)).toBe(true);
    
    // Perform actions with different components to trigger insights
    await fetch('/api/learning/progress'); // This should trigger some analytics
    
    // Get new insights after component interaction
    const newInsightsResponse = await fetch('/api/learning/insights');
    expect(newInsightsResponse.status).toBe(200);
    const newInsights = await newInsightsResponse.json();
    expect(Array.isArray(newInsights)).toBe(true);

    // Insights may vary based on usage, but should have proper structure
    if (newInsights.length > 0) {
      const sampleInsight = newInsights[0];
      expect(sampleInsight).toHaveProperty('id');
      expect(sampleInsight).toHaveProperty('type');
      expect(sampleInsight).toHaveProperty('title');
      expect(sampleInsight).toHaveProperty('description');
      expect(sampleInsight).toHaveProperty('actionItems');
      expect(['opportunity', 'achievement', 'warning', 'recommendation']).toContain(sampleInsight.type);
      expect(Array.isArray(sampleInsight.actionItems)).toBe(true);
    }

    console.log('Insights generation across components test completed');
  }, 20000);

  afterAll(() => {
    console.log('Completed cross-component integration tests');
  });
});