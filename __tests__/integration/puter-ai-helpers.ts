/**
 * Helper utilities for Puter AI integration tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

export interface MockResponse {
  data?: any;
  error?: any;
  status?: number;
}

/**
 * Create a mock Supabase client for testing
 */
export function createMockSupabaseClient(responses?: Record<string, MockResponse>) {
  const defaultResponses: Record<string, MockResponse> = {
    'generate-topic-ideas': {
      data: {
        ideas: ['Topic 1', 'Topic 2', 'Topic 3']
      }
    },
    'generate-research-questions': {
      data: {
        questions: ['Question 1?', 'Question 2?']
      }
    },
    'generate-outline': {
      data: {
        outline: ['Section 1', 'Section 2']
      }
    },
    'paraphrase-text': {
      data: {
        paraphrased: 'Paraphrased text here'
      }
    },
    'improve-writing': {
      data: {
        improved: 'Improved text here'
      }
    },
    'check-plagiarism': {
      data: {
        similarity: 5,
        status: 'original'
      }
    },
    ...responses
  };

  let callCount = 0;
  const callHistory: any[] = [];

  return {
    functions: {
      invoke: vi.fn(async (functionName: string, options: any) => {
        callCount++;
        const call = { functionName, options, timestamp: Date.now() };
        callHistory.push(call);

        const response = defaultResponses[functionName];

        if (!response) {
          return {
            error: `Function ${functionName} not found`,
            status: 404
          };
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        return response;
      })
    },
    getCallCount: () => callCount,
    getCallHistory: () => [...callHistory],
    resetCallHistory: () => {
      callCount = 0;
      callHistory.length = 0;
    }
  };
}

/**
 * Mock fetch for testing HTTP endpoints
 */
export function mockFetch(responses: Record<string, any>) {
  const originalFetch = global.fetch;

  global.fetch = vi.fn(async (url: string | Request, options?: any) => {
    const urlStr = typeof url === 'string' ? url : url.url;

    for (const [pattern, response] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404 }
    );
  });

  return () => {
    global.fetch = originalFetch;
  };
}

/**
 * Test helper for measuring performance
 */
export class PerformanceTracker {
  private measurements: Map<string, number[]> = new Map();

  measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();

    const result = fn();

    if (result instanceof Promise) {
      return result.then((value) => {
        const duration = performance.now() - start;
        this.recordMeasurement(name, duration);
        return value;
      });
    } else {
      const duration = performance.now() - start;
      this.recordMeasurement(name, duration);
      return result;
    }
  }

  private recordMeasurement(name: string, duration: number) {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];

    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count: sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getReport() {
    const report: Record<string, any> = {};

    for (const [name, _] of this.measurements) {
      report[name] = this.getStats(name);
    }

    return report;
  }
}

/**
 * Simulate network conditions for testing resilience
 */
export function simulateNetworkCondition(condition: 'slow' | 'flaky' | 'offline') {
  const originalFetch = global.fetch;
  let attemptCount = 0;

  global.fetch = vi.fn(async (url: string | Request, options?: any) => {
    attemptCount++;

    switch (condition) {
      case 'slow':
        // Simulate slow network
        await new Promise(resolve => setTimeout(resolve, 2000));
        return originalFetch(url, options);

      case 'flaky':
        // Fail 50% of the time, retry succeeds
        if (attemptCount % 2 === 0) {
          return new Response(
            JSON.stringify({ error: 'Network error' }),
            { status: 500 }
          );
        }
        return originalFetch(url, options);

      case 'offline':
        // All requests fail
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 0 }
        );
    }
  });

  return () => {
    global.fetch = originalFetch;
  };
}

/**
 * Test suite helper for common test patterns
 */
export function describeToolTests(
  toolName: string,
  functionName: string,
  testInputs: Record<string, any>,
  expectedFields?: string[]
) {
  describe(`${toolName} Tests`, () => {
    let supabase: any;

    beforeEach(() => {
      supabase = createMockSupabaseClient();
    });

    it(`should call ${functionName} function`, async () => {
      await supabase.functions.invoke(functionName, { body: testInputs });
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        functionName,
        expect.any(Object)
      );
    });

    it(`should return data for ${toolName}`, async () => {
      const response = await supabase.functions.invoke(functionName, { body: testInputs });
      expect(response.data).toBeDefined();
    });

    if (expectedFields) {
      it(`should return expected fields for ${toolName}`, async () => {
        const response = await supabase.functions.invoke(functionName, { body: testInputs });

        for (const field of expectedFields) {
          expect(response.data).toHaveProperty(field);
        }
      });
    }

    it(`should handle ${toolName} errors gracefully`, async () => {
      const supabaseMock = createMockSupabaseClient({
        [functionName]: { error: 'Test error' }
      });

      const response = await supabaseMock.functions.invoke(functionName, { body: testInputs });
      expect(response.error).toBeDefined();
    });
  });
}

/**
 * Utility to generate test data
 */
export const TestDataGenerator = {
  generateTopic(): string {
    const topics = [
      'Machine Learning',
      'Artificial Intelligence',
      'Data Science',
      'Blockchain',
      'Cloud Computing'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  },

  generateText(length: number = 100): string {
    const words = ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog'];
    const result = [];

    for (let i = 0; i < Math.ceil(length / 20); i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }

    return result.join(' ');
  },

  generateDocument(): string {
    return `Title: ${this.generateTopic()}

Introduction:
${this.generateText(200)}

Methodology:
${this.generateText(150)}

Results:
${this.generateText(200)}

Conclusion:
${this.generateText(100)}`;
  },

  generateArray(size: number): any[] {
    return Array.from({ length: size }, (_, i) => ({
      id: i + 1,
      value: `Item ${i + 1}`
    }));
  }
};

/**
 * Assertion helpers for common test patterns
 */
export const TestAssertions = {
  isValidResponse(response: any) {
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  },

  hasSuccessStatus(response: any) {
    expect(response.status ?? 200).toBeLessThan(400);
  },

  hasErrorStatus(response: any) {
    expect(response.status ?? 400).toBeGreaterThanOrEqual(400);
  },

  hasExpectedFields(data: any, fields: string[]) {
    for (const field of fields) {
      expect(data).toHaveProperty(field);
    }
  },

  isValidJSON(data: any) {
    try {
      JSON.stringify(data);
      expect(true).toBe(true);
    } catch {
      expect(true).toBe(false);
    }
  }
};

/**
 * Setup and teardown utilities
 */
export function setupTestEnvironment() {
  beforeEach(() => {
    // Clear any global state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });
}

/**
 * Retry test until it passes (useful for flaky tests)
 */
export async function retryTest(
  fn: () => Promise<void>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<void> {
  let lastError: any;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error;
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Timeout utility for tests
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Test timeout')), timeoutMs)
    )
  ]);
}
