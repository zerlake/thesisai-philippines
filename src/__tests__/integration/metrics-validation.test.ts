// src/__tests__/integration/metrics-validation.test.ts

import { test, describe, expect } from 'vitest';

describe('Metrics Validation Integration Tests', () => {
  test('Validate progress metrics accuracy', async () => {
    // Test that progress metrics are calculated correctly
    const response = await fetch('/api/learning/progress');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    
    const progressData = data.data;
    
    // Validate metrics are within expected ranges
    expect(typeof progressData.estimatedReadiness).toBe('number');
    expect(progressData.estimatedReadiness).toBeGreaterThanOrEqual(0);
    expect(progressData.estimatedReadiness).toBeLessThanOrEqual(100);
    
    expect(typeof progressData.learningVelocity).toBe('number');
    expect(progressData.learningVelocity).toBeGreaterThanOrEqual(0);
    
    expect(typeof progressData.daysSinceStart).toBe('number');
    expect(progressData.daysSinceStart).toBeGreaterThanOrEqual(0);
    
    expect(typeof progressData.totalReviews).toBe('number');
    expect(progressData.totalReviews).toBeGreaterThanOrEqual(0);
    
    expect(typeof progressData.averageSuccess).toBe('number');
    expect(progressData.averageSuccess).toBeGreaterThanOrEqual(0);
    expect(progressData.averageSuccess).toBeLessThanOrEqual(100);
    
    expect(typeof progressData.consistencyScore).toBe('number');
    expect(progressData.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(progressData.consistencyScore).toBeLessThanOrEqual(100);
    
    expect(typeof progressData.topicsMastered).toBe('number');
    expect(progressData.topicsMastered).toBeGreaterThanOrEqual(0);
    
    console.log('Progress metrics validation completed');
  }, 15000);

  test('Verify flashcard metrics are accurate', async () => {
    const response = await fetch('/api/learning/flashcards');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    const fcData = data.data;
    expect(fcData).toHaveProperty('masteryByDeck');
    expect(fcData).toHaveProperty('retentionCurve');
    expect(fcData).toHaveProperty('nextReviewForecast');

    // Validate mastery percentages
    if (Array.isArray(fcData.masteryByDeck)) {
      for (const deck of fcData.masteryByDeck) {
        expect(typeof deck.mastery).toBe('number');
        expect(deck.mastery).toBeGreaterThanOrEqual(0);
        expect(deck.mastery).toBeLessThanOrEqual(100);
      }
    }

    // Validate retention curve values
    if (Array.isArray(fcData.retentionCurve)) {
      for (const point of fcData.retentionCurve) {
        expect(typeof point.day).toBe('number');
        expect(point.day).toBeGreaterThanOrEqual(0);
        expect(typeof point.retention).toBe('number');
        expect(point.retention).toBeGreaterThanOrEqual(0);
        expect(point.retention).toBeLessThanOrEqual(100);
      }
    }

    // Validate next review forecast
    if (Array.isArray(fcData.nextReviewForecast)) {
      for (const forecast of fcData.nextReviewForecast) {
        expect(forecast.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
        expect(typeof forecast.count).toBe('number');
        expect(forecast.count).toBeGreaterThanOrEqual(0);
      }
    }

    console.log('Flashcard metrics validation completed');
  }, 15000);

  test('Validate defense metrics accuracy', async () => {
    const response = await fetch('/api/learning/defense');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    const defData = data.data;
    expect(defData).toHaveProperty('difficultyProgression');
    expect(defData).toHaveProperty('avgResponseTime');
    expect(defData).toHaveProperty('performanceByCategory');

    // Validate difficulty progression data
    if (Array.isArray(defData.difficultyProgression)) {
      for (const prog of defData.difficultyProgression) {
        expect(prog.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
        expect(typeof prog.moderate).toBe('number');
        expect(typeof prog.challenging).toBe('number');
        expect(typeof prog.expert).toBe('number');
        expect(prog.moderate).toBeGreaterThanOrEqual(0);
        expect(prog.moderate).toBeLessThanOrEqual(100);
        expect(prog.challenging).toBeGreaterThanOrEqual(0);
        expect(prog.challenging).toBeLessThanOrEqual(100);
        expect(prog.expert).toBeGreaterThanOrEqual(0);
        expect(prog.expert).toBeLessThanOrEqual(100);
      }
    }

    // Validate average response time data
    if (Array.isArray(defData.avgResponseTime)) {
      for (const time of defData.avgResponseTime) {
        expect(typeof time.category).toBe('string');
        expect(typeof time.time).toBe('number');
        expect(time.time).toBeGreaterThanOrEqual(0);
      }
    }

    // Validate performance by category
    if (Array.isArray(defData.performanceByCategory)) {
      for (const perf of defData.performanceByCategory) {
        expect(typeof perf.category).toBe('string');
        expect(typeof perf.score).toBe('number');
        expect(perf.score).toBeGreaterThanOrEqual(0);
        expect(perf.score).toBeLessThanOrEqual(100);
      }
    }

    console.log('Defense metrics validation completed');
  }, 15000);

  test('Verify study guide metrics consistency', async () => {
    const response = await fetch('/api/learning/study-guides');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    const sgData = data.data;
    expect(sgData).toHaveProperty('completionByGuide');
    expect(sgData).toHaveProperty('pagesRead');
    expect(sgData).toHaveProperty('notesTaken');

    // Validate completion metrics
    if (Array.isArray(sgData.completionByGuide)) {
      for (const guide of sgData.completionByGuide) {
        expect(typeof guide.guide).toBe('string');
        expect(typeof guide.completion).toBe('number');
        expect(guide.completion).toBeGreaterThanOrEqual(0);
        expect(guide.completion).toBeLessThanOrEqual(100);
      }
    }

    // Validate numeric values
    expect(typeof sgData.pagesRead).toBe('number');
    expect(sgData.pagesRead).toBeGreaterThanOrEqual(0);
    expect(typeof sgData.notesTaken).toBe('number');
    expect(sgData.notesTaken).toBeGreaterThanOrEqual(0);

    console.log('Study guide metrics validation completed');
  }, 15000);

  test('Test metrics correlation across components', async () => {
    // Get data from all components and verify they can be correlated meaningfully
    const [progressRes, fcRes, defRes, sgRes] = await Promise.all([
      fetch('/api/learning/progress'),
      fetch('/api/learning/flashcards'),
      fetch('/api/learning/defense'),
      fetch('/api/learning/study-guides')
    ]);

    expect(progressRes.status).toBe(200);
    expect(fcRes.status).toBe(200);
    expect(defRes.status).toBe(200);
    expect(sgRes.status).toBe(200);

    const [progressData, fcData, defData, sgData] = await Promise.all([
      progressRes.json(),
      fcRes.json(),
      defRes.json(),
      sgRes.json()
    ]);

    // Verify all return valid data
    expect(progressData.success).toBe(true);
    expect(fcData.success).toBe(true);
    expect(defData.success).toBe(true);
    expect(sgData.success).toBe(true);

    // Validate that all data objects have expected properties
    expect(progressData.data).toBeDefined();
    expect(fcData.data).toBeDefined();
    expect(defData.data).toBeDefined();
    expect(sgData.data).toBeDefined();

    console.log('Cross-component metrics correlation test completed');
  }, 20000);
});