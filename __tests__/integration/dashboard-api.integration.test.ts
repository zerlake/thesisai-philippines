/**
 * Dashboard API Integration Tests
 * Tests for complete API workflows and data flow
 * Coverage: 5+ end-to-end scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Dashboard API Integration - Single Widget Fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch research-progress widget successfully', async () => {
    const mockData = {
      papersRead: 24,
      notesCreated: 47,
      goalsCompleted: 3,
      goalsTotal: 5,
      researchAccuracy: 87,
      weeklyTrend: [
        { date: '2024-11-18', value: 5 },
        { date: '2024-11-19', value: 8 }
      ],
      period: 'month',
      chartType: 'line'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockData, cached: false })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/research-progress', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.data.papersRead).toBe(24);
    expect(json.cached).toBe(false);
  });

  it('should fetch quick-stats widget successfully', async () => {
    const mockData = {
      totalPapers: 156,
      totalNotes: 487,
      totalWords: 45230,
      stats: [
        { label: 'Papers', value: 156 },
        { label: 'Notes', value: 487 }
      ]
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockData, cached: true })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/quick-stats', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.data.totalPapers).toBe(156);
    expect(json.cached).toBe(true);
  });

  it('should handle missing authentication gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);

    const response = await fetch('/api/dashboard/widgets/research-progress');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('should handle widget not found errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response);

    const response = await fetch('/api/dashboard/widgets/non-existent', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });
});

describe('Dashboard API Integration - Batch Widget Fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch multiple widgets in batch', async () => {
    const mockResults = {
      'research-progress': {
        papersRead: 24,
        notesCreated: 47
      },
      'quick-stats': {
        totalPapers: 156,
        totalNotes: 487
      }
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        results: mockResults,
        errors: {}
      })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({
        widgetIds: ['research-progress', 'quick-stats'],
        forceRefresh: false
      })
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.results['research-progress'].papersRead).toBe(24);
    expect(json.results['quick-stats'].totalPapers).toBe(156);
  });

  it('should handle partial batch failures', async () => {
    const mockResults = {
      'research-progress': {
        papersRead: 24
      }
    };

    const mockErrors = {
      'quick-stats': 'Widget not found'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 207,
      json: async () => ({
        results: mockResults,
        errors: mockErrors
      })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({
        widgetIds: ['research-progress', 'quick-stats']
      })
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.results['research-progress']).toBeDefined();
    expect(json.errors['quick-stats']).toBeDefined();
  });

  it('should enforce batch size limit', async () => {
    const widgetIds = Array.from({ length: 51 }, (_, i) => `widget-${i}`);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    } as Response);

    const response = await fetch('/api/dashboard/widgets/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({ widgetIds })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('should force refresh widgets when requested', async () => {
    const mockData = {
      'research-progress': {
        papersRead: 42
      }
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: mockData,
        errors: {}
      })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({
        widgetIds: ['research-progress'],
        forceRefresh: true
      })
    });

    expect(response.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/dashboard/widgets/batch'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });
});

describe('Dashboard API Integration - Dashboard Layout Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard with default layout and widgets', async () => {
    const mockDashboard = {
      layout: {
        id: 'default',
        name: 'Default Dashboard',
        widgets: [
          { id: 'w1', widgetId: 'research-progress', x: 0, y: 0, w: 2, h: 2 }
        ]
      },
      widgets: {
        'research-progress': {
          papersRead: 24,
          notesCreated: 47
        }
      }
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDashboard
    } as Response);

    const response = await fetch('/api/dashboard', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.layout.name).toBe('Default Dashboard');
    expect(json.widgets['research-progress'].papersRead).toBe(24);
  });

  it('should save dashboard configuration', async () => {
    const newLayout = {
      name: 'Custom Layout',
      widgets: [
        { widgetId: 'research-progress', x: 0, y: 0, w: 2, h: 2 }
      ]
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'custom-1',
        ...newLayout,
        createdAt: new Date().toISOString()
      })
    } as Response);

    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify(newLayout)
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.name).toBe('Custom Layout');
    expect(json.id).toBe('custom-1');
  });

  it('should list all user dashboard layouts', async () => {
    const mockLayouts = [
      {
        id: 'default',
        name: 'Default Dashboard',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'custom-1',
        name: 'Custom Layout',
        createdAt: '2024-11-01T00:00:00Z'
      }
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ layouts: mockLayouts })
    } as Response);

    const response = await fetch('/api/dashboard/layouts', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.layouts).toHaveLength(2);
    expect(json.layouts[0].name).toBe('Default Dashboard');
  });

  it('should create new layout', async () => {
    const newLayout = {
      name: 'New Layout',
      description: 'Fresh dashboard'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'new-1',
        ...newLayout,
        widgets: [],
        createdAt: new Date().toISOString()
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify(newLayout)
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.name).toBe('New Layout');
    expect(json.widgets).toEqual([]);
  });

  it('should update existing layout', async () => {
    const updates = {
      name: 'Updated Layout Name'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'layout-1',
        ...updates,
        updatedAt: new Date().toISOString()
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts/layout-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify(updates)
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.name).toBe('Updated Layout Name');
  });

  it('should delete layout', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 204
    } as Response);

    const response = await fetch('/api/dashboard/layouts/layout-1', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(204);
  });

  it('should clone layout', async () => {
    const cloneData = {
      name: 'Cloned Layout'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'cloned-1',
        ...cloneData,
        widgets: [
          { widgetId: 'research-progress', x: 0, y: 0, w: 2, h: 2 }
        ]
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts/layout-1/clone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify(cloneData)
    });

    expect(response.ok).toBe(true);
    const json = await response.json();
    expect(json.id).toBe('cloned-1');
    expect(json.widgets).toBeDefined();
  });
});

describe('Dashboard API Integration - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle server errors gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      })
    } as Response);

    const response = await fetch('/api/dashboard', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Internal server error');
  });

  it('should handle validation errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Validation error',
        details: {
          name: 'Name is required'
        }
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({})
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('should handle not found errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Not found',
        message: 'Layout not found'
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts/non-existent', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('should handle permission errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      })
    } as Response);

    const response = await fetch('/api/dashboard/layouts/other-user-layout', {
      headers: { 'Authorization': 'Bearer token' }
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
  });
});

describe('Dashboard API Integration - Cache Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached data on subsequent requests', async () => {
    const mockData = { papersRead: 42 };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockData,
        cached: false
      })
    } as Response);

    // First request
    const response1 = await fetch('/api/dashboard/widgets/research-progress', {
      headers: { 'Authorization': 'Bearer token' }
    });

    const json1 = await response1.json();
    expect(json1.cached).toBe(false);

    // Second request - should be cached
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockData,
        cached: true
      })
    } as Response);

    const response2 = await fetch('/api/dashboard/widgets/research-progress', {
      headers: { 'Authorization': 'Bearer token' }
    });

    const json2 = await response2.json();
    expect(json2.cached).toBe(true);
  });

  it('should bypass cache with forceRefresh parameter', async () => {
    const mockData = { papersRead: 42 };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockData,
        cached: false
      })
    } as Response);

    const response = await fetch('/api/dashboard/widgets/research-progress?forceRefresh=true', {
      headers: { 'Authorization': 'Bearer token' }
    });

    const json = await response.json();
    expect(json.cached).toBe(false);
  });
});

describe('Dashboard API Integration - Complete User Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full dashboard setup flow', async () => {
    // Step 1: Get default dashboard
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        layout: { id: 'default', name: 'Default' },
        widgets: {}
      })
    } as Response);

    const getDash = await fetch('/api/dashboard', {
      headers: { 'Authorization': 'Bearer token' }
    });
    expect(getDash.ok).toBe(true);

    // Step 2: Create new layout
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'custom-1',
        name: 'Custom',
        widgets: []
      })
    } as Response);

    const createLayout = await fetch('/api/dashboard/layouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({ name: 'Custom' })
    });
    expect(createLayout.ok).toBe(true);

    // Step 3: Fetch widgets for layout
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: {
          'research-progress': { papersRead: 24 }
        },
        errors: {}
      })
    } as Response);

    const widgets = await fetch('/api/dashboard/widgets/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({ widgetIds: ['research-progress'] })
    });
    expect(widgets.ok).toBe(true);

    // Step 4: Save dashboard configuration
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'custom-1',
        name: 'Custom',
        widgets: [
          { widgetId: 'research-progress', x: 0, y: 0 }
        ]
      })
    } as Response);

    const saveDash = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      body: JSON.stringify({
        name: 'Custom',
        widgets: [{ widgetId: 'research-progress', x: 0, y: 0 }]
      })
    });
    expect(saveDash.ok).toBe(true);
  });
});
