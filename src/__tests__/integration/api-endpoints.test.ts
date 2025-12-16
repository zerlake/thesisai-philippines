// src/__tests__/integration/api-endpoints.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('API Endpoints Integration Test', () => {
  let supabase: any;
  let userId: string;

  beforeAll(async () => {
    // Set up test environment
    supabase = await createServerClient();
    
    // For integration tests, we'll use a test user ID
    userId = 'test-user-id-for-integration';
  });

  afterAll(async () => {
    console.log('Completed API endpoints integration test cleanup');
  });

  test('GET /api/learning/progress returns correct data structure', async () => {
    const response = await fetch('/api/learning/progress');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('estimatedReadiness');
    expect(data).toHaveProperty('learningVelocity');
    expect(data).toHaveProperty('daysSinceStart');
    expect(data).toHaveProperty('totalReviews');
    expect(data).toHaveProperty('averageSuccess');
    expect(data).toHaveProperty('consistencyScore');
    expect(data).toHaveProperty('sessionFrequency');
    expect(data).toHaveProperty('avgSessionLength');
    expect(data).toHaveProperty('topicsMastered');
    expect(data).toHaveProperty('areasNeedingWork');
    
    // Check data types
    expect(typeof data.estimatedReadiness).toBe('number');
    expect(typeof data.learningVelocity).toBe('number');
    expect(typeof data.daysSinceStart).toBe('number');
    expect(typeof data.totalReviews).toBe('number');
    
    console.log('/api/learning/progress endpoint test completed');
  }, 20000);

  test('GET /api/learning/flashcards returns correct data structure', async () => {
    const response = await fetch('/api/learning/flashcards');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('masteryByDeck');
    expect(data).toHaveProperty('retentionCurve');
    expect(data).toHaveProperty('nextReviewForecast');
    
    expect(Array.isArray(data.masteryByDeck)).toBe(true);
    expect(Array.isArray(data.retentionCurve)).toBe(true);
    expect(Array.isArray(data.nextReviewForecast)).toBe(true);
    
    if (data.masteryByDeck.length > 0) {
      const firstDeck = data.masteryByDeck[0];
      expect(firstDeck).toHaveProperty('deck');
      expect(firstDeck).toHaveProperty('mastery');
      expect(typeof firstDeck.mastery).toBe('number');
    }
    
    console.log('/api/learning/flashcards endpoint test completed');
  }, 20000);

  test('GET /api/learning/defense returns correct data structure', async () => {
    const response = await fetch('/api/learning/defense');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('difficultyProgression');
    expect(data).toHaveProperty('avgResponseTime');
    expect(data).toHaveProperty('performanceByCategory');
    
    expect(Array.isArray(data.difficultyProgression)).toBe(true);
    expect(Array.isArray(data.avgResponseTime)).toBe(true);
    expect(Array.isArray(data.performanceByCategory)).toBe(true);
    
    console.log('/api/learning/defense endpoint test completed');
  }, 20000);

  test('GET /api/learning/study-guides returns correct data structure', async () => {
    const response = await fetch('/api/learning/study-guides');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('completionByGuide');
    expect(data).toHaveProperty('pagesRead');
    expect(data).toHaveProperty('notesTaken');
    
    expect(Array.isArray(data.completionByGuide)).toBe(true);
    expect(typeof data.pagesRead).toBe('number');
    expect(typeof data.notesTaken).toBe('number');
    
    console.log('/api/learning/study-guides endpoint test completed');
  }, 20000);

  test('GET /api/learning/insights returns correct data structure', async () => {
    const response = await fetch('/api/learning/insights');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      const firstInsight = data[0];
      expect(firstInsight).toHaveProperty('id');
      expect(firstInsight).toHaveProperty('type');
      expect(firstInsight).toHaveProperty('title');
      expect(firstInsight).toHaveProperty('description');
      expect(firstInsight).toHaveProperty('actionItems');
      expect(firstInsight).toHaveProperty('createdAt');
      
      expect(['opportunity', 'achievement', 'warning', 'recommendation']).toContain(firstInsight.type);
      expect(Array.isArray(firstInsight.actionItems)).toBe(true);
    }
    
    console.log('/api/learning/insights endpoint test completed');
  }, 20000);

  test('POST /api/learning/insights handles insight actions', async () => {
    const response = await fetch('/api/learning/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        insightId: 1,
        action: 'dismiss'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    
    console.log('POST /api/learning/insights endpoint test completed');
  }, 20000);
});