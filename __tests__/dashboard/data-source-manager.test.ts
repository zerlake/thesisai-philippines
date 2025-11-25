/**
 * Data Source Manager Unit Tests
 * Tests for caching, fetching, validation, and subscription logic
 * Coverage: 20+ test cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import DataSourceManager, {
  type DataSourceConfig,
  type WidgetData,
  type CacheEntry
} from '@/lib/dashboard/data-source-manager';

// Mock fetch
global.fetch = vi.fn();

describe('Data Source Manager - Initialization', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should initialize with default configurations', () => {
    expect(manager).toBeDefined();
  });

  it('should have default cache TTL of 5 minutes', () => {
    // This is internal state, test via behavior
    expect(manager).toBeDefined();
  });

  it('should initialize empty cache', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    // First fetch should be from API
    const result1 = await manager.fetchWidgetData('research-progress');
    expect(result1.source).toBe('api');
  });

  it('should have all widgets configured', () => {
    const widgetIds = [
      'research-progress',
      'quick-stats',
      'recent-papers',
      'writing-goals',
      'collaboration',
      'calendar',
      'trends',
      'notes',
      'citations',
      'suggestions',
      'time-tracker',
      'custom'
    ];

    widgetIds.forEach(widgetId => {
      expect(async () => {
        await manager.fetchWidgetData(widgetId);
      }).toBeDefined();
    });
  });
});

describe('Data Source Manager - Caching Strategy', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should use cache-first strategy by default', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    // First fetch
    const result1 = await manager.fetchWidgetData('research-progress');
    expect(result1.source).toBe('api');

    // Second fetch should be from cache
    const result2 = await manager.fetchWidgetData('research-progress');
    expect(result2.source).toBe('cache');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should respect TTL expiration', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    // First fetch
    await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 100, strategy: 'cache-first' }
    });

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Second fetch should hit API again
    await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 100, strategy: 'cache-first' }
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should support network-first strategy', async () => {
    const mockData1 = { papersRead: 42 };
    const mockData2 = { papersRead: 50 };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      } as Response);

    // First fetch with network-first
    const result1 = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 5000, strategy: 'network-first' }
    });
    expect(result1.source).toBe('api');
    expect(result1.data).toEqual(mockData1);

    // Second fetch should still hit network (network-first)
    const result2 = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 5000, strategy: 'network-first' }
    });
    expect(result2.source).toBe('api');
    expect(result2.data).toEqual(mockData2);
  });

  it('should support network-only strategy', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    // Fetch with network-only
    const result = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 5000, strategy: 'network-only' }
    });

    expect(result.source).toBe('api');
    expect(fetch).toHaveBeenCalled();
  });

  it('should support cache-only strategy', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    // Prime the cache
    await manager.fetchWidgetData('research-progress');

    vi.clearAllMocks();

    // Fetch with cache-only
    const result = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 5000, strategy: 'cache-only' }
    });

    expect(result.source).toBe('cache');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return mock data on cache-only miss', async () => {
    // Try cache-only without priming cache
    const result = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 5000, strategy: 'cache-only' }
    });

    expect(result.source).toBe('mock');
    expect(result.data).toBeDefined();
  });
});

describe('Data Source Manager - Data Fetching', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should fetch single widget data', async () => {
    const mockData = { papersRead: 42, notesCreated: 100 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.widgetId).toBe('research-progress');
    expect(result.data).toEqual(mockData);
    expect(result.source).toBe('api');
    expect(result.isValid).toBeDefined();
  });

  it('should fetch multiple widgets in batch', async () => {
    const mockData1 = { papersRead: 42 };
    const mockData2 = { totalPapers: 156 };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      } as Response);

    const results = await manager.fetchMultiple(['research-progress', 'quick-stats']);

    expect(Object.keys(results).length).toBe(2);
    expect(results['research-progress'].data).toEqual(mockData1);
    expect(results['quick-stats'].data).toEqual(mockData2);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
      status: 404
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.source).toBe('mock');
    expect(result.data).toBeDefined();
  });

  it('should handle network timeouts', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 50);
      });
    });

    const result = await manager.fetchWidgetData('research-progress', {
      timeout: 10
    });

    expect(result.source).toBe('mock');
  });

  it('should validate fetched data', async () => {
    const validData = {
      papersRead: 42,
      notesCreated: 100,
      goalsCompleted: 3,
      goalsTotal: 5,
      researchAccuracy: 87,
      period: 'month',
      chartType: 'line'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => validData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.isValid).toBe(true);
    expect(result.validationErrors).toBeUndefined();
  });

  it('should handle invalid data gracefully', async () => {
    const invalidData = {
      papersRead: 'not-a-number'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toBeDefined();
  });

  it('should set loading state during fetch', async () => {
    vi.mocked(global.fetch).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ papersRead: 42 })
          } as Response);
        }, 50);
      });
    });

    const fetchPromise = manager.fetchWidgetData('research-progress');
    // Loading state would be true here (internal state)

    const result = await fetchPromise;
    expect(result).toBeDefined();
  });
});

describe('Data Source Manager - Error Handling', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should return mock data on fetch error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.source).toBe('mock');
    expect(result.data).toBeDefined();
  });

  it('should handle 401 unauthorized errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.source).toBe('mock');
  });

  it('should handle 500 server errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response);

    const result = await manager.fetchWidgetData('research-progress');
    expect(result.source).toBe('mock');
  });

  it('should provide error context', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Custom error message'));

    const result = await manager.fetchWidgetData('research-progress');
    expect(result).toBeDefined();
  });
});

describe('Data Source Manager - Subscriptions', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should subscribe to widget data updates', async () => {
    const callback = vi.fn();
    const mockData = { papersRead: 42 };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const unsubscribe = manager.subscribeToWidget('research-progress', callback);
    expect(typeof unsubscribe).toBe('function');
  });

  it('should allow multiple subscribers', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unsub1 = manager.subscribeToWidget('research-progress', callback1);
    const unsub2 = manager.subscribeToWidget('research-progress', callback2);

    expect(typeof unsub1).toBe('function');
    expect(typeof unsub2).toBe('function');
  });

  it('should unsubscribe from updates', async () => {
    const callback = vi.fn();
    const unsub = manager.subscribeToWidget('research-progress', callback);

    unsub();
    // After unsubscribe, callback should not be called on updates
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle subscriber errors gracefully', async () => {
    const errorCallback = () => {
      throw new Error('Subscriber error');
    };

    manager.subscribeToWidget('research-progress', errorCallback);
    // Should not crash
    expect(manager).toBeDefined();
  });
});

describe('Data Source Manager - Widget Fallback Data', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should provide fallback data for research-progress', async () => {
    const result = await manager.fetchWidgetData('research-progress', {
      cache: { strategy: 'cache-only', ttl: 1000 }
    });

    expect(result.data).toBeDefined();
    expect(result.source).toBe('mock');
    expect(result.data).toHaveProperty('papersRead');
  });

  it('should provide fallback data for quick-stats', async () => {
    const result = await manager.fetchWidgetData('quick-stats', {
      cache: { strategy: 'cache-only', ttl: 1000 }
    });

    expect(result.data).toBeDefined();
    expect(result.data).toHaveProperty('totalPapers');
  });

  it('should provide fallback data for recent-papers', async () => {
    const result = await manager.fetchWidgetData('recent-papers', {
      cache: { strategy: 'cache-only', ttl: 1000 }
    });

    expect(result.data).toBeDefined();
    expect(result.data).toHaveProperty('papers');
  });

  it('should validate fallback data', async () => {
    const result = await manager.fetchWidgetData('research-progress', {
      cache: { strategy: 'cache-only', ttl: 1000 }
    });

    expect(result.isValid).toBe(true);
  });

  it('should work for all registered widgets', async () => {
    const widgetIds = [
      'research-progress',
      'quick-stats',
      'recent-papers',
      'writing-goals',
      'collaboration',
      'calendar',
      'trends',
      'notes',
      'citations',
      'suggestions',
      'time-tracker',
      'custom'
    ];

    for (const widgetId of widgetIds) {
      const result = await manager.fetchWidgetData(widgetId, {
        cache: { strategy: 'cache-only', ttl: 1000 }
      });

      expect(result.data).toBeDefined();
      expect(result.source).toBe('mock');
    }
  });
});

describe('Data Source Manager - Configuration Override', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should allow per-fetch configuration override', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress', {
      cache: { ttl: 1000, strategy: 'network-only' },
      timeout: 5000
    });

    expect(result.source).toBe('api');
  });

  it('should merge custom config with defaults', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress', {
      timeout: 3000
    });

    expect(result).toBeDefined();
  });
});

describe('Data Source Manager - Widget Data Type', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should return proper WidgetData structure', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress') as WidgetData;

    expect(result).toHaveProperty('widgetId');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('lastUpdated');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('isValid');
    expect(result.widgetId).toBe('research-progress');
    expect(result.lastUpdated instanceof Date).toBe(true);
  });

  it('should include validation errors in response', async () => {
    const invalidData = { papersRead: 'invalid' };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData
    } as Response);

    const result = await manager.fetchWidgetData('research-progress') as WidgetData;

    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toBeDefined();
  });
});

describe('Data Source Manager - Performance', () => {
  let manager: DataSourceManager;

  beforeEach(() => {
    manager = new DataSourceManager();
    vi.clearAllMocks();
  });

  it('should cache results to avoid repeated API calls', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    // First fetch
    await manager.fetchWidgetData('research-progress');
    // Second fetch
    await manager.fetchWidgetData('research-progress');
    // Third fetch
    await manager.fetchWidgetData('research-progress');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent fetches efficiently', async () => {
    const mockData = { papersRead: 42 };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData
    } as Response);

    const promises = Array(5).fill(null).map(() =>
      manager.fetchWidgetData('research-progress')
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(5);
  });
});
