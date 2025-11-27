/**
 * Widget Registry - Central registry for all available dashboard widgets
 * Defines widget metadata, settings, and factory functions
 */

import * as React from 'react';

export type WidgetCategory = 'analytics' | 'productivity' | 'shortcuts' | 'news' | 'custom';
export type WidgetId = 
  | 'research-progress'
  | 'stats'
  | 'recent-papers'
  | 'writing-goals'
  | 'collaboration'
  | 'calendar'
  | 'trends'
  | 'notes'
  | 'citation'
  | 'suggestions'
  | 'time-tracker'
  | 'custom-html';

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetSettings {
  [key: string]: any;
}

export interface Widget {
  id: WidgetId;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string; // Icon name or emoji
  version: string;
  author: string;
  
  // Size constraints
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  
  // Feature flags
  resizable: boolean;
  configurable: boolean;
  removable: boolean;
  draggable: boolean;
  
  // Components
  previewComponent: React.ComponentType<{ settings?: WidgetSettings }>;
  settingsComponent?: React.ComponentType<{
    settings: WidgetSettings;
    onSave: (settings: WidgetSettings) => void;
    onCancel: () => void;
  }>;
  
  // Default settings
  defaultSettings: WidgetSettings;
  
  // Schema validation
  settingsSchema?: any;
}

export interface WidgetLayout {
  id: string;
  widgetId: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  settings: WidgetSettings;
  locked?: boolean;
}

/**
 * Placeholder components for development
 */
const PlaceholderWidget: React.FC<{ name: string; settings?: WidgetSettings }> = React.memo(({ name, settings }) => {
  return React.createElement('div',
    { style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h4', null, name),
    React.createElement('p',
      { style: { fontSize: '12px', color: '#666' } },
      'Widget coming soon'
    ),
    settings && React.createElement('pre',
      { style: { fontSize: '10px' } },
      JSON.stringify(settings, null, 2)
    )
  );
});

const PlaceholderSettings: React.FC<{ settings: any; onSave: (s: any) => void; onCancel: () => void }> = React.memo(({
  settings,
  onSave,
  onCancel
}) => {
  return React.createElement('div', null,
    React.createElement('p', null, 'Settings UI coming soon'),
    React.createElement('button',
      { onClick: () => onSave(settings) },
      'Save'
    ),
    React.createElement('button',
      { onClick: onCancel },
      'Cancel'
    )
  );
});

/**
 * Widget Registry
 * All available widgets with their metadata and components
 */
export const widgetRegistry: Record<WidgetId, Widget> = {
  'research-progress': {
    id: 'research-progress',
    name: 'Research Progress',
    description: 'Track your research progress with visual metrics',
    category: 'analytics',
    icon: '📊',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function ResearchProgressPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Research Progress", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      period: 'month',
      metrics: ['papers_read', 'notes_taken'],
      chartType: 'line'
    }
  },

  'stats': {
    id: 'stats',
    name: 'Quick Stats',
    description: 'Display key statistics at a glance',
    category: 'analytics',
    icon: '📈',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 2 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function QuickStatsPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Quick Stats", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      stats: ['total_papers', 'total_notes', 'completion_rate']
    }
  },

  'recent-papers': {
    id: 'recent-papers',
    name: 'Recent Papers',
    description: 'Quick access to your most recent papers',
    category: 'productivity',
    icon: '📄',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function RecentPapersPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Recent Papers", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      count: 5,
      sortBy: 'date',
      showPreview: true
    }
  },

  'writing-goals': {
    id: 'writing-goals',
    name: 'Writing Goals',
    description: 'Monitor your writing progress and goals',
    category: 'productivity',
    icon: '✍️',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function WritingGoalsPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Writing Goals", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      goalType: 'words_per_day',
      target: 1000,
      interval: 'daily'
    }
  },

  'collaboration': {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Quick access to collaboration tools',
    category: 'shortcuts',
    icon: '👥',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function CollaborationPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Collaboration", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      showMembers: true,
      maxMembers: 5
    }
  },

  'calendar': {
    id: 'calendar',
    name: 'Research Calendar',
    description: 'View your research schedule and deadlines',
    category: 'productivity',
    icon: '📅',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function ResearchCalendarPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Research Calendar", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      eventTypes: ['deadline', 'milestone', 'meeting'],
      showWeekends: true
    }
  },

  'trends': {
    id: 'trends',
    name: 'Topic Trends',
    description: 'See trending topics in your research area',
    category: 'analytics',
    icon: '🔥',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 4 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function TopicTrendsPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Topic Trends", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      timeRange: '30d',
      metrics: ['citations', 'mentions'],
      limit: 10
    }
  },

  'notes': {
    id: 'notes',
    name: 'Notes Snapshot',
    description: 'Quick snapshot of your recent notes',
    category: 'productivity',
    icon: '📝',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function NotesSnapshotPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Notes Snapshot", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      count: 5,
      sortBy: 'updated',
      groupBy: 'topic'
    }
  },

  'citation': {
    id: 'citation',
    name: 'Citation Manager',
    description: 'Quick access to citations and references',
    category: 'shortcuts',
    icon: '🔗',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function CitationManagerPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Citation Manager", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      format: 'APA',
      showCount: true
    }
  },

  'suggestions': {
    id: 'suggestions',
    name: 'AI Suggestions',
    description: 'Get AI-powered suggestions for your research',
    category: 'analytics',
    icon: '💡',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 4, height: 3 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function AISuggestionsPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "AI Suggestions", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      frequency: 'daily',
      suggestionTypes: ['papers', 'topics', 'collaborators'],
      limit: 5
    }
  },

  'time-tracker': {
    id: 'time-tracker',
    name: 'Time Tracker',
    description: 'Track time spent on research activities',
    category: 'analytics',
    icon: '⏱️',
    version: '1.0.0',
    author: 'System',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 3, height: 3 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function TimeTrackerPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Time Tracker", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      categories: ['reading', 'writing', 'research'],
      period: 'week'
    }
  },

  'custom-html': {
    id: 'custom-html',
    name: 'Custom Widget',
    description: 'Create a custom widget with HTML/CSS/JS',
    category: 'custom',
    icon: '⚙️',
    version: '1.0.0',
    author: 'User',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 6, height: 4 },
    resizable: true,
    configurable: true,
    removable: true,
    draggable: true,
    previewComponent: function CustomWidgetPreview(props) {
      return React.createElement(PlaceholderWidget, { name: "Custom Widget", ...props });
    },
    settingsComponent: PlaceholderSettings,
    defaultSettings: {
      html: '',
      css: '',
      js: ''
    }
  }
};

/**
 * Get widget by ID
 */
export function getWidget(id: WidgetId): Widget | null {
  return widgetRegistry[id] || null;
}

/**
 * Get widgets by category
 */
export function getWidgetsByCategory(category: WidgetCategory): Widget[] {
  return Object.values(widgetRegistry).filter(w => w.category === category);
}

/**
 * Get all widgets grouped by category
 */
export function getWidgetsByCategories(): Record<WidgetCategory, Widget[]> {
  return {
    analytics: getWidgetsByCategory('analytics'),
    productivity: getWidgetsByCategory('productivity'),
    shortcuts: getWidgetsByCategory('shortcuts'),
    news: getWidgetsByCategory('news'),
    custom: getWidgetsByCategory('custom')
  };
}

/**
 * Get all available widgets
 */
export function getAllWidgets(): Widget[] {
  return Object.values(widgetRegistry);
}

/**
 * Search widgets by name or description
 */
export function searchWidgets(query: string): Widget[] {
  const q = query.toLowerCase();
  return Object.values(widgetRegistry).filter(w => 
    w.name.toLowerCase().includes(q) || 
    w.description.toLowerCase().includes(q)
  );
}
