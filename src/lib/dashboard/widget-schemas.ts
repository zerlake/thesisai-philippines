/**
 * Widget Data Schemas
 * Defines the expected data shape for each widget with runtime validation
 */

import { z } from 'zod';

// Base schemas used by multiple widgets
const TrendPointSchema = z.object({
  date: z.string().datetime().or(z.string()),
  value: z.number(),
  label: z.string().optional()
});

const StatCardSchema = z.object({
  label: z.string(),
  value: z.number().or(z.string()),
  unit: z.string().optional(),
  trend: z.number().optional(), // percentage change
  color: z.string().optional()
});

const ChartDataSchema = z.array(z.object({
  date: z.string(),
  value: z.number()
}).passthrough()); // Allow additional properties for chart data

// Individual widget schemas
export const ResearchProgressSchema = z.object({
  papersRead: z.number().default(0),
  notesCreated: z.number().default(0),
  goalsCompleted: z.number().default(0),
  goalsTotal: z.number().default(0),
  weeklyTrend: z.array(TrendPointSchema).default([]),
  monthlyTrend: z.array(TrendPointSchema).default([]),
  researchAccuracy: z.number().min(0).max(100).default(0),
  period: z.enum(['week', 'month', 'year']).default('month'),
  chartType: z.enum(['line', 'bar', 'area']).default('line')
});

export const StatsWidgetSchema = z.object({
  totalPapers: z.number().default(0),
  totalNotes: z.number().default(0),
  totalWords: z.number().default(0),
  totalReadTime: z.number().default(0), // minutes
  avgReadTime: z.number().default(0), // minutes per paper
  avgNoteLength: z.number().default(0), // words per note
  stats: z.array(StatCardSchema).default([]),
  lastUpdated: z.string().datetime().or(z.string()).optional()
});

export const RecentPapersSchema = z.object({
  papers: z.array(z.object({
    id: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    publicationDate: z.string().optional(),
    url: z.string().url().optional(),
    abstract: z.string().optional(),
    readAt: z.string().datetime().optional(),
    notes: z.number().default(0),
    status: z.enum(['reading', 'completed', 'saved']).default('saved')
  })).default([]),
  count: z.number().default(5),
  sortBy: z.enum(['date', 'title', 'authors']).default('date'),
  total: z.number().default(0) // total papers in library
});

export const WritingGoalsSchema = z.object({
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    targetWords: z.number().optional(),
    currentWords: z.number().default(0),
    targetDate: z.string().optional(),
    status: z.enum(['active', 'completed', 'abandoned']).default('active'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    progress: z.number().min(0).max(100).default(0)
  })).default([]),
  totalGoals: z.number().default(0),
  completedGoals: z.number().default(0),
  activeGoals: z.number().default(0)
});

export const CollaborationWidgetSchema = z.object({
  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional(),
    role: z.string().optional(),
    status: z.enum(['active', 'idle', 'offline']).default('offline'),
    lastSeen: z.string().datetime().optional()
  })).default([]),
  totalMembers: z.number().default(0),
  activeNow: z.number().default(0),
  pendingInvites: z.array(z.string()).default([]),
  recentActivity: z.array(z.object({
    userId: z.string(),
    action: z.string(),
    timestamp: z.string().datetime()
  })).default([])
});

export const CalendarWidgetSchema = z.object({
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    time: z.string().optional(),
    endTime: z.string().optional(),
    type: z.enum(['deadline', 'meeting', 'reminder', 'milestone']).default('reminder'),
    color: z.string().optional(),
    completed: z.boolean().default(false)
  })).default([]),
  upcomingCount: z.number().default(0),
  overdueCount: z.number().default(0),
  nextEvent: z.object({
    title: z.string(),
    date: z.string()
  }).optional()
});

export const TrendsWidgetSchema = z.object({
  trends: z.array(z.object({
    id: z.string(),
    topic: z.string(),
    mentions: z.number(),
    trend: z.number(), // percentage change
    color: z.string().optional(),
    category: z.string().optional()
  })).default([]),
  timeRange: z.enum(['day', 'week', 'month']).default('week'),
  totalTopics: z.number().default(0),
  risingCount: z.number().default(0),
  fallingCount: z.number().default(0),
  chart: z.array(TrendPointSchema).default([])
});

export const NotesWidgetSchema = z.object({
  notes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    preview: z.string(),
    content: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    tags: z.array(z.string()).default([]),
    color: z.string().optional(),
    pinned: z.boolean().default(false)
  })).default([]),
  totalNotes: z.number().default(0),
  pinnedNotes: z.number().default(0),
  recentCount: z.number().default(5)
});

export const CitationWidgetSchema = z.object({
  citations: z.array(z.object({
    format: z.string(), // 'APA', 'MLA', 'Chicago', etc.
    count: z.number(),
    examples: z.array(z.string()).default([])
  })).default([]),
  totalCitations: z.number().default(0),
  mostUsed: z.string().optional(),
  recentlyAdded: z.array(z.object({
    citation: z.string(),
    date: z.string().datetime(),
    format: z.string()
  })).default([])
});

export const SuggestionsWidgetSchema = z.object({
  suggestions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    source: z.string(), // 'AI', 'User', 'System'
    relevance: z.number().min(0).max(100),
    type: z.enum(['paper', 'topic', 'goal', 'collaborator']).default('paper'),
    accepted: z.boolean().default(false)
  })).default([]),
  totalSuggestions: z.number().default(0),
  acceptedCount: z.number().default(0),
  rejectedCount: z.number().default(0)
});

export const TimeTrackerWidgetSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    minutes: z.number(),
    percentage: z.number().min(0).max(100),
    color: z.string().optional()
  })).default([]),
  totalMinutes: z.number().default(0),
  sessionCount: z.number().default(0),
  averageSessionLength: z.number().default(0),
  longestSession: z.number().default(0),
  timeRange: z.enum(['day', 'week', 'month']).default('day')
});

export const CustomWidgetSchema = z.object({
  title: z.string(),
  html: z.string().optional(),
  css: z.string().optional(),
  javascript: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  height: z.number().optional(),
  width: z.number().optional()
});

// Registry of all widget schemas
export const widgetSchemas = {
  'research-progress': ResearchProgressSchema,
  'quick-stats': StatsWidgetSchema,
  'recent-papers': RecentPapersSchema,
  'writing-goals': WritingGoalsSchema,
  'collaboration': CollaborationWidgetSchema,
  'calendar': CalendarWidgetSchema,
  'trends': TrendsWidgetSchema,
  'notes': NotesWidgetSchema,
  'citations': CitationWidgetSchema,
  'suggestions': SuggestionsWidgetSchema,
  'time-tracker': TimeTrackerWidgetSchema,
  'custom': CustomWidgetSchema
} as const;

export type WidgetSchemaKey = keyof typeof widgetSchemas;

// Generic widget data type
export interface WidgetData<T = unknown> {
  widgetId: string;
  data: T;
  lastUpdated: Date;
  source: 'api' | 'cache' | 'mock' | 'realtime';
  isValid: boolean;
  validationErrors?: string[];
}

// Get schema for widget
export function getWidgetSchema(widgetId: string) {
  const schema = widgetSchemas[widgetId as WidgetSchemaKey];
  if (!schema) {
    console.warn(`No schema found for widget: ${widgetId}`);
    return z.any(); // Fallback to any
  }
  return schema;
}

// Validate widget data
export function validateWidgetData(widgetId: string, data: unknown): {
  valid: boolean;
  data: unknown;
  errors?: string[];
} {
  const schema = getWidgetSchema(widgetId);
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      data: result.data
    };
  }
  
  return {
    valid: false,
    data: null,
    errors: result.error.errors.map(e => 
      `${e.path.join('.')}: ${e.message}`
    )
  };
}

// Get mock data for widget
export function getMockWidgetData(widgetId: string): unknown {
  const mockData: Record<WidgetSchemaKey, unknown> = {
    'research-progress': {
      papersRead: 24,
      notesCreated: 47,
      goalsCompleted: 3,
      goalsTotal: 5,
      researchAccuracy: 87,
      weeklyTrend: [
        { date: '2024-11-18', value: 5 },
        { date: '2024-11-19', value: 8 },
        { date: '2024-11-20', value: 6 },
        { date: '2024-11-21', value: 9 },
        { date: '2024-11-22', value: 11 },
        { date: '2024-11-23', value: 7 },
        { date: '2024-11-24', value: 8 }
      ],
      period: 'month',
      chartType: 'line'
    },
    'quick-stats': {
      totalPapers: 156,
      totalNotes: 487,
      totalWords: 45230,
      totalReadTime: 3240,
      avgReadTime: 20.8,
      avgNoteLength: 92.8,
      stats: [
        { label: 'Papers', value: 156, unit: 'total' },
        { label: 'Notes', value: 487, unit: 'total' },
        { label: 'Words', value: '45.2K', unit: 'total' }
      ]
    },
    'recent-papers': {
      papers: [
        {
          id: '1',
          title: 'Machine Learning in Academic Research',
          authors: ['Smith, J.', 'Johnson, A.'],
          publicationDate: '2024-11-15',
          readAt: '2024-11-24',
          notes: 5,
          status: 'completed'
        },
        {
          id: '2',
          title: 'Advances in Natural Language Processing',
          authors: ['Lee, M.'],
          publicationDate: '2024-11-10',
          readAt: '2024-11-23',
          notes: 3,
          status: 'completed'
        }
      ],
      count: 2,
      total: 156
    },
    'writing-goals': {
      goals: [
        {
          id: '1',
          title: 'Thesis Chapter 1',
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
    },
    'collaboration': {
      teamMembers: [
        {
          id: '1',
          name: 'Alice Smith',
          role: 'Advisor',
          status: 'active'
        },
        {
          id: '2',
          name: 'Bob Johnson',
          role: 'Peer Reviewer',
          status: 'idle'
        }
      ],
      totalMembers: 2,
      activeNow: 1
    },
    'calendar': {
      events: [
        {
          id: '1',
          title: 'Thesis Submission Deadline',
          date: '2024-12-15',
          type: 'deadline'
        },
        {
          id: '2',
          title: 'Committee Meeting',
          date: '2024-12-01',
          time: '14:00',
          type: 'meeting'
        }
      ],
      upcomingCount: 2
    },
    'trends': {
      trends: [
        { id: '1', topic: 'AI Ethics', mentions: 156, trend: 15 },
        { id: '2', topic: 'Climate Science', mentions: 142, trend: 8 }
      ],
      totalTopics: 2,
      risingCount: 1
    },
    'notes': {
      notes: [
        {
          id: '1',
          title: 'Research Notes on ML',
          preview: 'Key findings about machine learning in education...',
          createdAt: '2024-11-24T10:30:00Z',
          tags: ['ml', 'education']
        }
      ],
      totalNotes: 23,
      pinnedNotes: 2
    },
    'citations': {
      citations: [
        { format: 'APA', count: 45 },
        { format: 'MLA', count: 28 },
        { format: 'Chicago', count: 12 }
      ],
      totalCitations: 85
    },
    'suggestions': {
      suggestions: [
        {
          id: '1',
          title: 'Recommended Paper',
          source: 'AI',
          relevance: 92,
          type: 'paper'
        }
      ],
      totalSuggestions: 1,
      acceptedCount: 0
    },
    'time-tracker': {
      categories: [
        { name: 'Research', minutes: 240, percentage: 40 },
        { name: 'Writing', minutes: 180, percentage: 30 },
        { name: 'Review', minutes: 180, percentage: 30 }
      ],
      totalMinutes: 600
    },
    'custom': {
      title: 'Custom Widget',
      html: '<div>Custom content</div>'
    }
  };

  return mockData[widgetId as WidgetSchemaKey] || {};
}

// Type exports for each widget
export type ResearchProgressData = z.infer<typeof ResearchProgressSchema>;
export type StatsWidgetData = z.infer<typeof StatsWidgetSchema>;
export type RecentPapersData = z.infer<typeof RecentPapersSchema>;
export type WritingGoalsData = z.infer<typeof WritingGoalsSchema>;
export type CollaborationData = z.infer<typeof CollaborationWidgetSchema>;
export type CalendarData = z.infer<typeof CalendarWidgetSchema>;
export type TrendsData = z.infer<typeof TrendsWidgetSchema>;
export type NotesData = z.infer<typeof NotesWidgetSchema>;
export type CitationData = z.infer<typeof CitationWidgetSchema>;
export type SuggestionsData = z.infer<typeof SuggestionsWidgetSchema>;
export type TimeTrackerData = z.infer<typeof TimeTrackerWidgetSchema>;
export type CustomWidgetData = z.infer<typeof CustomWidgetSchema>;
