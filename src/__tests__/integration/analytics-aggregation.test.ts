// src/__tests__/integration/analytics-aggregation.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Analytics Aggregation Integration Test', () => {
  let supabase: any;
  let userId: string;

  beforeAll(async () => {
    // Set up test environment
    supabase = await createServerClient();
    
    // For integration tests, we'll use a test user ID
    userId = 'test-user-id-for-integration';
  });

  afterAll(async () => {
    // Clean up test data after all tests if needed
    console.log('Completed analytics aggregation integration test cleanup');
  });

  test('Analytics data aggregation from multiple sources', async () => {
    // Step 1: Test progress data aggregation
    const progressResponse = await fetch('/api/learning/progress');
    expect(progressResponse.status).toBe(200);
    const progressData = await progressResponse.json();
    expect(progressData).toHaveProperty('estimatedReadiness');
    expect(progressData).toHaveProperty('learningVelocity');
    expect(progressData).toHaveProperty('daysSinceStart');
    expect(progressData).toHaveProperty('totalReviews');
    expect(progressData).toHaveProperty('averageSuccess');
    expect(progressData).toHaveProperty('consistencyScore');
    expect(progressData).toHaveProperty('sessionFrequency');
    expect(progressData).toHaveProperty('avgSessionLength');
    expect(progressData).toHaveProperty('topicsMastered');
    expect(progressData).toHaveProperty('areasNeedingWork');

    // Step 2: Test flashcard data aggregation
    const flashcardResponse = await fetch('/api/learning/flashcards');
    expect(flashcardResponse.status).toBe(200);
    const flashcardData = await flashcardResponse.json();
    expect(flashcardData).toHaveProperty('masteryByDeck');
    expect(flashcardData).toHaveProperty('retentionCurve');
    expect(flashcardData).toHaveProperty('nextReviewForecast');

    // Step 3: Test defense data aggregation
    const defenseResponse = await fetch('/api/learning/defense');
    expect(defenseResponse.status).toBe(200);
    const defenseData = await defenseResponse.json();
    expect(defenseData).toHaveProperty('difficultyProgression');
    expect(defenseData).toHaveProperty('avgResponseTime');
    expect(defenseData).toHaveProperty('performanceByCategory');

    // Step 4: Test study guide data aggregation
    const studyGuideResponse = await fetch('/api/learning/study-guides');
    expect(studyGuideResponse.status).toBe(200);
    const studyGuideData = await studyGuideResponse.json();
    expect(studyGuideData).toHaveProperty('completionByGuide');
    expect(studyGuideData).toHaveProperty('pagesRead');
    expect(studyGuideData).toHaveProperty('notesTaken');

    // Step 5: Test insights aggregation
    const insightsResponse = await fetch('/api/learning/insights');
    expect(insightsResponse.status).toBe(200);
    const insightsData = await insightsResponse.json();
    expect(Array.isArray(insightsData)).toBe(true);

    // Step 6: Test aggregated analytics endpoint
    const analyticsResponse = await fetch('/api/learning/analytics');
    expect(analyticsResponse.status).toBe(200);
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData).toHaveProperty('estimatedReadiness');
    expect(analyticsData).toHaveProperty('learningVelocity');
    expect(analyticsData).toHaveProperty('flashcardData');
    expect(analyticsData).toHaveProperty('defenseData');
    expect(analyticsData).toHaveProperty('studyGuideData');
    expect(analyticsData).toHaveProperty('insights');

    console.log('Analytics aggregation integration test completed successfully');
  }, 30000); // 30 second timeout for this test
});