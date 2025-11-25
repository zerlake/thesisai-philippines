/**
 * Widget Schemas Unit Tests
 * Tests for Zod schema validation and mock data generation
 * Coverage: 15+ test cases
 */

import { describe, it, expect } from 'vitest';
import {
  validateWidgetData,
  getMockWidgetData,
  getWidgetSchema,
  ResearchProgressSchema,
  StatsWidgetSchema,
  RecentPapersSchema,
  WritingGoalsSchema,
  CollaborationWidgetSchema,
  CalendarWidgetSchema,
  TrendsWidgetSchema,
  NotesWidgetSchema,
  CitationWidgetSchema,
  SuggestionsWidgetSchema,
  TimeTrackerWidgetSchema,
  CustomWidgetSchema,
  widgetSchemas
} from '@/lib/dashboard/widget-schemas';

describe('Widget Schemas - Schema Registration', () => {
  it('should have all expected schemas registered', () => {
    expect(widgetSchemas).toHaveProperty('research-progress');
    expect(widgetSchemas).toHaveProperty('quick-stats');
    expect(widgetSchemas).toHaveProperty('recent-papers');
    expect(widgetSchemas).toHaveProperty('writing-goals');
    expect(widgetSchemas).toHaveProperty('collaboration');
    expect(widgetSchemas).toHaveProperty('calendar');
    expect(widgetSchemas).toHaveProperty('trends');
    expect(widgetSchemas).toHaveProperty('notes');
    expect(widgetSchemas).toHaveProperty('citations');
    expect(widgetSchemas).toHaveProperty('suggestions');
    expect(widgetSchemas).toHaveProperty('time-tracker');
    expect(widgetSchemas).toHaveProperty('custom');
  });

  it('should retrieve schema for valid widget', () => {
    const schema = getWidgetSchema('research-progress');
    expect(schema).toBeDefined();
  });

  it('should return fallback schema for unknown widget', () => {
    const schema = getWidgetSchema('unknown-widget');
    expect(schema).toBeDefined();
  });
});

describe('Widget Schemas - Research Progress Validation', () => {
  it('should validate valid research progress data', () => {
    const validData = {
      papersRead: 24,
      notesCreated: 47,
      goalsCompleted: 3,
      goalsTotal: 5,
      researchAccuracy: 87,
      weeklyTrend: [],
      monthlyTrend: [],
      period: 'month',
      chartType: 'line'
    };

    const result = validateWidgetData('research-progress', validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should validate partial research progress data with defaults', () => {
    const minimalData = {
      papersRead: 10
    };

    const result = validateWidgetData('research-progress', minimalData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid researchAccuracy value', () => {
    const invalidData = {
      papersRead: 24,
      researchAccuracy: 150 // exceeds max of 100
    };

    const result = validateWidgetData('research-progress', invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid period enum', () => {
    const invalidData = {
      period: 'invalid'
    };

    const result = validateWidgetData('research-progress', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Stats Widget Validation', () => {
  it('should validate valid stats data', () => {
    const validData = {
      totalPapers: 156,
      totalNotes: 487,
      totalWords: 45230,
      totalReadTime: 3240,
      avgReadTime: 20.8,
      avgNoteLength: 92.8,
      stats: []
    };

    const result = validateWidgetData('quick-stats', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate stats with stat cards', () => {
    const dataWithStats = {
      totalPapers: 100,
      stats: [
        { label: 'Papers', value: 100, unit: 'total' },
        { label: 'Notes', value: '50', unit: 'items' }
      ]
    };

    const result = validateWidgetData('quick-stats', dataWithStats);
    expect(result.valid).toBe(true);
  });

  it('should allow numeric or string values in stats', () => {
    const mixedValueStats = {
      stats: [
        { label: 'Count', value: 42 },
        { label: 'Amount', value: '1.5K' }
      ]
    };

    const result = validateWidgetData('quick-stats', mixedValueStats);
    expect(result.valid).toBe(true);
  });
});

describe('Widget Schemas - Recent Papers Validation', () => {
  it('should validate recent papers data with complete fields', () => {
    const validData = {
      papers: [
        {
          id: '1',
          title: 'Test Paper',
          authors: ['Author 1'],
          publicationDate: '2024-11-24',
          status: 'completed',
          notes: 5
        }
      ],
      count: 1,
      total: 156
    };

    const result = validateWidgetData('recent-papers', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate papers with minimal required fields', () => {
    const minimalData = {
      papers: [
        {
          id: '1',
          title: 'Minimal Paper',
          authors: []
        }
      ]
    };

    const result = validateWidgetData('recent-papers', minimalData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid paper status', () => {
    const invalidData = {
      papers: [
        {
          id: '1',
          title: 'Invalid Paper',
          authors: [],
          status: 'invalid'
        }
      ]
    };

    const result = validateWidgetData('recent-papers', invalidData);
    expect(result.valid).toBe(false);
  });

  it('should reject invalid URL format', () => {
    const invalidData = {
      papers: [
        {
          id: '1',
          title: 'Paper',
          authors: [],
          url: 'not-a-url'
        }
      ]
    };

    const result = validateWidgetData('recent-papers', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Writing Goals Validation', () => {
  it('should validate writing goals data', () => {
    const validData = {
      goals: [
        {
          id: '1',
          title: 'Chapter 1',
          targetWords: 5000,
          currentWords: 3200,
          status: 'active',
          priority: 'high',
          progress: 64
        }
      ],
      totalGoals: 5,
      completedGoals: 3,
      activeGoals: 2
    };

    const result = validateWidgetData('writing-goals', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate goals with progress constraints', () => {
    const validData = {
      goals: [
        {
          id: '1',
          title: 'Goal',
          progress: 0
        },
        {
          id: '2',
          title: 'Goal 2',
          progress: 100
        }
      ]
    };

    const result = validateWidgetData('writing-goals', validData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid goal status', () => {
    const invalidData = {
      goals: [
        {
          id: '1',
          title: 'Invalid Goal',
          status: 'unknown'
        }
      ]
    };

    const result = validateWidgetData('writing-goals', invalidData);
    expect(result.valid).toBe(false);
  });

  it('should reject progress outside 0-100 range', () => {
    const invalidData = {
      goals: [
        {
          id: '1',
          title: 'Goal',
          progress: 150
        }
      ]
    };

    const result = validateWidgetData('writing-goals', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Collaboration Validation', () => {
  it('should validate collaboration data', () => {
    const validData = {
      teamMembers: [
        {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          status: 'active'
        }
      ],
      totalMembers: 1,
      activeNow: 1
    };

    const result = validateWidgetData('collaboration', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate team members with all optional fields', () => {
    const completeData = {
      teamMembers: [
        {
          id: '1',
          name: 'Bob',
          email: 'bob@example.com',
          avatar: 'https://example.com/avatar.jpg',
          role: 'Reviewer',
          status: 'idle',
          lastSeen: '2024-11-24T10:00:00Z'
        }
      ]
    };

    const result = validateWidgetData('collaboration', completeData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      teamMembers: [
        {
          id: '1',
          name: 'Invalid',
          email: 'not-an-email'
        }
      ]
    };

    const result = validateWidgetData('collaboration', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Calendar Validation', () => {
  it('should validate calendar events', () => {
    const validData = {
      events: [
        {
          id: '1',
          title: 'Meeting',
          date: '2024-12-01',
          type: 'meeting'
        }
      ],
      upcomingCount: 1
    };

    const result = validateWidgetData('calendar', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate event with optional time fields', () => {
    const validData = {
      events: [
        {
          id: '1',
          title: 'Deadline',
          date: '2024-12-15',
          time: '23:59',
          endTime: '23:59:59',
          type: 'deadline',
          completed: true
        }
      ]
    };

    const result = validateWidgetData('calendar', validData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid event type', () => {
    const invalidData = {
      events: [
        {
          id: '1',
          title: 'Event',
          date: '2024-12-01',
          type: 'invalid'
        }
      ]
    };

    const result = validateWidgetData('calendar', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Trends Validation', () => {
  it('should validate trends data', () => {
    const validData = {
      trends: [
        { id: '1', topic: 'AI', mentions: 100, trend: 15 }
      ],
      timeRange: 'week',
      totalTopics: 1
    };

    const result = validateWidgetData('trends', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate with trend percentage', () => {
    const validData = {
      trends: [
        { id: '1', topic: 'Topic', mentions: 50, trend: -5.5 }
      ]
    };

    const result = validateWidgetData('trends', validData);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid timeRange', () => {
    const invalidData = {
      timeRange: 'invalid'
    };

    const result = validateWidgetData('trends', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Notes Validation', () => {
  it('should validate notes data', () => {
    const validData = {
      notes: [
        {
          id: '1',
          title: 'Note Title',
          preview: 'Note preview text...',
          createdAt: '2024-11-24T10:00:00Z',
          tags: ['research']
        }
      ],
      totalNotes: 1
    };

    const result = validateWidgetData('notes', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate notes with all optional fields', () => {
    const validData = {
      notes: [
        {
          id: '1',
          title: 'Full Note',
          preview: 'Preview...',
          content: 'Full content here',
          createdAt: '2024-11-24T10:00:00Z',
          updatedAt: '2024-11-24T11:00:00Z',
          tags: ['tag1', 'tag2'],
          color: '#FF0000',
          pinned: true
        }
      ]
    };

    const result = validateWidgetData('notes', validData);
    expect(result.valid).toBe(true);
  });
});

describe('Widget Schemas - Citations Validation', () => {
  it('should validate citations data', () => {
    const validData = {
      citations: [
        { format: 'APA', count: 45 },
        { format: 'MLA', count: 28 }
      ],
      totalCitations: 73
    };

    const result = validateWidgetData('citations', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate citations with examples', () => {
    const validData = {
      citations: [
        { format: 'APA', count: 10, examples: ['Smith et al. (2024)', 'Johnson (2023)'] }
      ]
    };

    const result = validateWidgetData('citations', validData);
    expect(result.valid).toBe(true);
  });
});

describe('Widget Schemas - Suggestions Validation', () => {
  it('should validate suggestions data', () => {
    const validData = {
      suggestions: [
        {
          id: '1',
          title: 'Suggested Paper',
          source: 'AI',
          relevance: 92,
          type: 'paper'
        }
      ],
      totalSuggestions: 1
    };

    const result = validateWidgetData('suggestions', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate suggestion relevance constraints', () => {
    const validData = {
      suggestions: [
        {
          id: '1',
          title: 'Suggestion 1',
          source: 'User',
          relevance: 0,
          type: 'goal'
        },
        {
          id: '2',
          title: 'Suggestion 2',
          source: 'System',
          relevance: 100,
          type: 'collaborator'
        }
      ]
    };

    const result = validateWidgetData('suggestions', validData);
    expect(result.valid).toBe(true);
  });

  it('should reject relevance outside 0-100', () => {
    const invalidData = {
      suggestions: [
        {
          id: '1',
          title: 'Invalid',
          source: 'AI',
          relevance: 150,
          type: 'paper'
        }
      ]
    };

    const result = validateWidgetData('suggestions', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Time Tracker Validation', () => {
  it('should validate time tracker data', () => {
    const validData = {
      categories: [
        { name: 'Research', minutes: 240, percentage: 40 },
        { name: 'Writing', minutes: 180, percentage: 30 }
      ],
      totalMinutes: 420,
      sessionCount: 10,
      averageSessionLength: 42
    };

    const result = validateWidgetData('time-tracker', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate categories with percentage constraints', () => {
    const validData = {
      categories: [
        { name: 'A', minutes: 0, percentage: 0 },
        { name: 'B', minutes: 100, percentage: 100 }
      ]
    };

    const result = validateWidgetData('time-tracker', validData);
    expect(result.valid).toBe(true);
  });

  it('should reject percentage outside 0-100', () => {
    const invalidData = {
      categories: [
        { name: 'Invalid', minutes: 100, percentage: 150 }
      ]
    };

    const result = validateWidgetData('time-tracker', invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('Widget Schemas - Custom Widget Validation', () => {
  it('should validate custom widget data', () => {
    const validData = {
      title: 'Custom Widget',
      html: '<div>Content</div>',
      css: '.custom { color: red; }',
      javascript: 'console.log("test");'
    };

    const result = validateWidgetData('custom', validData);
    expect(result.valid).toBe(true);
  });

  it('should validate custom widget with all fields', () => {
    const validData = {
      title: 'Advanced Custom',
      html: '<div id="widget"></div>',
      css: 'body { margin: 0; }',
      javascript: 'function init() {}',
      data: { key1: 'value1', key2: 42 },
      height: 300,
      width: 400
    };

    const result = validateWidgetData('custom', validData);
    expect(result.valid).toBe(true);
  });
});

describe('Widget Schemas - Mock Data Generation', () => {
  it('should generate mock data for all registered widgets', () => {
    Object.keys(widgetSchemas).forEach(widgetId => {
      const mockData = getMockWidgetData(widgetId);
      expect(mockData).toBeDefined();
      expect(typeof mockData).toBe('object');
    });
  });

  it('should generate valid mock data for research-progress', () => {
    const mockData = getMockWidgetData('research-progress');
    const result = validateWidgetData('research-progress', mockData);
    expect(result.valid).toBe(true);
  });

  it('should generate valid mock data for quick-stats', () => {
    const mockData = getMockWidgetData('quick-stats');
    const result = validateWidgetData('quick-stats', mockData);
    expect(result.valid).toBe(true);
  });

  it('should generate valid mock data for recent-papers', () => {
    const mockData = getMockWidgetData('recent-papers');
    const result = validateWidgetData('recent-papers', mockData);
    expect(result.valid).toBe(true);
  });

  it('should generate valid mock data for writing-goals', () => {
    const mockData = getMockWidgetData('writing-goals');
    const result = validateWidgetData('writing-goals', mockData);
    expect(result.valid).toBe(true);
  });

  it('should return empty object for unknown widget', () => {
    const mockData = getMockWidgetData('unknown-widget');
    expect(mockData).toEqual({});
  });
});

describe('Widget Schemas - Error Messages', () => {
  it('should provide helpful error messages for invalid data', () => {
    const invalidData = {
      papersRead: 'not-a-number',
      researchAccuracy: 150
    };

    const result = validateWidgetData('research-progress', invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should describe path to invalid field', () => {
    const invalidData = {
      papers: [
        {
          id: '1',
          title: 'Paper',
          authors: [],
          status: 'invalid'
        }
      ]
    };

    const result = validateWidgetData('recent-papers', invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('status'))).toBe(true);
  });
});
