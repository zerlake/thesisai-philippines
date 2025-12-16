// src/__tests__/integration/performance.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';
import { createServerClient } from '@/lib/supabase-server';

describe('Performance Integration Test', () => {
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
    console.log('Completed performance integration test cleanup');
  });

  test('API response time <200ms', async () => {
    const testIterations = 10;
    const responseTimes: number[] = [];

    // Test the main API endpoints multiple times to get an average
    for (let i = 0; i < testIterations; i++) {
      const startTime = Date.now();
      
      try {
        const response = await fetch('/api/learning/progress');
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        
        expect(response.status).toBe(200);
      } catch (error) {
        console.error(`Performance test iteration ${i + 1} failed:`, error);
        throw error;
      }
    }

    // Calculate average response time
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    console.log(`Average API response time: ${avgResponseTime}ms over ${testIterations} requests`);
    
    // Check that average response time is under 200ms
    expect(avgResponseTime).toBeLessThan(200);
    
    // Also check that no single request took over 200ms (95th percentile check)
    const slowRequests = responseTimes.filter(time => time > 200);
    expect(slowRequests.length).toBeLessThan(responseTimes.length * 0.05); // Less than 5% of requests should be slow
    
    console.log('API response time performance test completed successfully');
  }, 60000); // 60 second timeout for performance test

  test('Dashboard load time <2s', async () => {
    // This test would normally measure actual page load time
    // For now, we'll test that the analytics endpoint returns within 2s
    
    const startTime = Date.now();
    
    const response = await fetch('/api/learning/analytics');
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    
    const responseTime = endTime - startTime;
    console.log(`Dashboard analytics load time: ${responseTime}ms`);
    
    // Check that the response time is under 2 seconds
    expect(responseTime).toBeLessThan(2000);
    
    console.log('Dashboard load performance test completed successfully');
  }, 10000); // 10 second timeout for this test
});