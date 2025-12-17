// src/__tests__/integration/api-response-validation.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('API Response Validation Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    // Set up test environment
    supabase = await createServerClient();
  });

  test('Validate progress API response format', async () => {
    const response = await fetch('/api/learning/progress');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
    
    // Validate structure of progress data
    const progressData = data.data;
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
    
    // Validate data types
    expect(typeof progressData.estimatedReadiness).toBe('number');
    expect(typeof progressData.learningVelocity).toBe('number');
    expect(typeof progressData.daysSinceStart).toBe('number');
    expect(typeof progressData.totalReviews).toBe('number');
    expect(typeof progressData.averageSuccess).toBe('number');
    expect(typeof progressData.consistencyScore).toBe('number');
    expect(typeof progressData.sessionFrequency).toBe('number');
    expect(typeof progressData.avgSessionLength).toBe('number');
    expect(typeof progressData.topicsMastered).toBe('number');
    expect(typeof progressData.areasNeedingWork).toBe('number');
    
    // Validate value ranges
    expect(progressData.estimatedReadiness).toBeGreaterThanOrEqual(0);
    expect(progressData.estimatedReadiness).toBeLessThanOrEqual(100);
    expect(progressData.learningVelocity).toBeGreaterThanOrEqual(0);
    expect(progressData.daysSinceStart).toBeGreaterThanOrEqual(0);
    expect(progressData.totalReviews).toBeGreaterThanOrEqual(0);
    expect(progressData.averageSuccess).toBeGreaterThanOrEqual(0);
    expect(progressData.averageSuccess).toBeLessThanOrEqual(100);
    expect(progressData.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(progressData.consistencyScore).toBeLessThanOrEqual(100);
    expect(progressData.sessionFrequency).toBeGreaterThanOrEqual(0);
    expect(progressData.avgSessionLength).toBeGreaterThanOrEqual(0);
    expect(progressData.topicsMastered).toBeGreaterThanOrEqual(0);
    expect(progressData.areasNeedingWork).toBeGreaterThanOrEqual(0);
  }, 15000);

  test('Validate flashcards API response format', async () => {
    const response = await fetch('/api/learning/flashcards');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');
    
    const flashcardData = data.data;
    expect(flashcardData).toHaveProperty('masteryByDeck');
    expect(flashcardData).toHaveProperty('retentionCurve');
    expect(flashcardData).toHaveProperty('nextReviewForecast');
    
    // Validate structure of mastery data
    expect(Array.isArray(flashcardData.masteryByDeck)).toBe(true);
    if (flashcardData.masteryByDeck.length > 0) {
      const deck = flashcardData.masteryByDeck[0];
      expect(deck).toHaveProperty('deck');
      expect(deck).toHaveProperty('mastery');
      expect(typeof deck.mastery).toBe('number');
      expect(deck.mastery).toBeGreaterThanOrEqual(0);
      expect(deck.mastery).toBeLessThanOrEqual(100);
    }
    
    // Validate retention curve structure
    expect(Array.isArray(flashcardData.retentionCurve)).toBe(true);
    if (flashcardData.retentionCurve.length > 0) {
      const retentionPoint = flashcardData.retentionCurve[0];
      expect(retentionPoint).toHaveProperty('day');
      expect(retentionPoint).toHaveProperty('retention');
      expect(typeof retentionPoint.day).toBe('number');
      expect(typeof retentionPoint.retention).toBe('number');
      expect(retentionPoint.retention).toBeGreaterThanOrEqual(0);
      expect(retentionPoint.retention).toBeLessThanOrEqual(100);
    }
    
    // Validate next review forecast structure
    expect(Array.isArray(flashcardData.nextReviewForecast)).toBe(true);
    if (flashcardData.nextReviewForecast.length > 0) {
      const forecast = flashcardData.nextReviewForecast[0];
      expect(forecast).toHaveProperty('date');
      expect(forecast).toHaveProperty('count');
      expect(typeof forecast.count).toBe('number');
      expect(forecast.count).toBeGreaterThanOrEqual(0);
    }
  }, 15000);

  test('Validate defense questions API response format', async () => {
    const response = await fetch('/api/learning/defense');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');
    
    const defenseData = data.data;
    expect(defenseData).toHaveProperty('difficultyProgression');
    expect(defenseData).toHaveProperty('avgResponseTime');
    expect(defenseData).toHaveProperty('performanceByCategory');
    
    // Validate difficulty progression structure
    expect(Array.isArray(defenseData.difficultyProgression)).toBe(true);
    if (defenseData.difficultyProgression.length > 0) {
      const progression = defenseData.difficultyProgression[0];
      expect(progression).toHaveProperty('date');
      expect(progression).toHaveProperty('moderate');
      expect(progression).toHaveProperty('challenging');
      expect(progression).toHaveProperty('expert');
      expect(typeof progression.moderate).toBe('number');
      expect(typeof progression.challenging).toBe('number');
      expect(typeof progression.expert).toBe('number');
      expect(progression.moderate).toBeGreaterThanOrEqual(0);
      expect(progression.moderate).toBeLessThanOrEqual(100);
    }
    
    // Validate avg response time structure
    expect(Array.isArray(defenseData.avgResponseTime)).toBe(true);
    if (defenseData.avgResponseTime.length > 0) {
      const responseTime = defenseData.avgResponseTime[0];
      expect(responseTime).toHaveProperty('category');
      expect(responseTime).toHaveProperty('time');
      expect(typeof responseTime.time).toBe('number');
      expect(responseTime.time).toBeGreaterThanOrEqual(0);
    }
    
    // Validate performance by category structure
    expect(Array.isArray(defenseData.performanceByCategory)).toBe(true);
    if (defenseData.performanceByCategory.length > 0) {
      const perfCat = defenseData.performanceByCategory[0];
      expect(perfCat).toHaveProperty('category');
      expect(perfCat).toHaveProperty('score');
      expect(typeof perfCat.score).toBe('number');
      expect(perfCat.score).toBeGreaterThanOrEqual(0);
      expect(perfCat.score).toBeLessThanOrEqual(100);
    }
  }, 15000);

  test('Validate study guides API response format', async () => {
    const response = await fetch('/api/learning/study-guides');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');
    
    const studyGuideData = data.data;
    expect(studyGuideData).toHaveProperty('completionByGuide');
    expect(studyGuideData).toHaveProperty('pagesRead');
    expect(studyGuideData).toHaveProperty('notesTaken');
    
    // Validate completion by guide structure
    expect(Array.isArray(studyGuideData.completionByGuide)).toBe(true);
    if (studyGuideData.completionByGuide.length > 0) {
      const guide = studyGuideData.completionByGuide[0];
      expect(guide).toHaveProperty('guide');
      expect(guide).toHaveProperty('completion');
      expect(typeof guide.completion).toBe('number');
      expect(guide.completion).toBeGreaterThanOrEqual(0);
      expect(guide.completion).toBeLessThanOrEqual(100);
    }
    
    // Validate numeric properties
    expect(typeof studyGuideData.pagesRead).toBe('number');
    expect(typeof studyGuideData.notesTaken).toBe('number');
    expect(studyGuideData.pagesRead).toBeGreaterThanOrEqual(0);
    expect(studyGuideData.notesTaken).toBeGreaterThanOrEqual(0);
  }, 15000);

  test('Validate insights API response format', async () => {
    const response = await fetch('/api/learning/insights');
    
    expect(response.status).toBe(200);
    
    const insights = await response.json();
    expect(Array.isArray(insights)).toBe(true);
    
    if (insights.length > 0) {
      const insight = insights[0];
      expect(insight).toHaveProperty('id');
      expect(insight).toHaveProperty('type');
      expect(insight).toHaveProperty('title');
      expect(insight).toHaveProperty('description');
      expect(insight).toHaveProperty('actionItems');
      expect(insight).toHaveProperty('createdAt');
      
      // Validate types
      expect(typeof insight.id).toBe('number');
      expect(['opportunity', 'achievement', 'warning', 'recommendation']).toContain(insight.type);
      expect(typeof insight.title).toBe('string');
      expect(typeof insight.description).toBe('string');
      expect(Array.isArray(insight.actionItems)).toBe(true);
      expect(typeof insight.createdAt).toBe('string');
    }
  }, 15000);

  afterAll(() => {
    console.log('Completed API response validation integration tests');
  });
});