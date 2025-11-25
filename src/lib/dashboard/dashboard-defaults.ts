/**
 * Default dashboard configuration and mock data
 * Used when user doesn't have saved preferences
 */

export interface DashboardWidget {
  id: string;
  widgetId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isTemplate: boolean;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version: number;
  };
}

export interface DashboardState {
  currentLayoutId: string;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved?: string;
  viewMode?: 'edit' | 'view';
  selectedWidgetId?: string;
}

/**
 * Default dashboard layout - what users see when they first access the dashboard
 */
const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default-layout-v1',
  name: 'Default Dashboard',
  description: 'Default dashboard layout for new users',
  isDefault: true,
  isTemplate: false,
  widgets: [
    {
      id: 'widget-1',
      widgetId: 'research-progress',
      position: {
        x: 0,
        y: 0,
        width: 2,
        height: 2,
      },
      settings: {
        showTrend: true,
        timeRange: 'week',
      },
    },
    {
      id: 'widget-2',
      widgetId: 'quick-stats',
      position: {
        x: 2,
        y: 0,
        width: 2,
        height: 1,
      },
      settings: {
        showComparison: true,
      },
    },
    {
      id: 'widget-3',
      widgetId: 'recent-papers',
      position: {
        x: 2,
        y: 1,
        width: 2,
        height: 1,
      },
      settings: {
        limit: 5,
        sortBy: 'dateAdded',
      },
    },
    {
      id: 'widget-4',
      widgetId: 'writing-goals',
      position: {
        x: 0,
        y: 2,
        width: 2,
        height: 2,
      },
      settings: {
        showProgress: true,
      },
    },
    {
      id: 'widget-5',
      widgetId: 'calendar',
      position: {
        x: 2,
        y: 2,
        width: 2,
        height: 2,
      },
      settings: {
        showEvents: true,
      },
    },
  ],
  metadata: {
    version: 1,
  },
};

/**
 * Default dashboard state
 */
const DEFAULT_STATE: DashboardState = {
  currentLayoutId: DEFAULT_LAYOUT.id,
  isLoading: false,
  isDirty: false,
  viewMode: 'view',
};

/**
 * Get default dashboard data for new users
 */
export function getDefaultDashboardData() {
  return {
    defaultLayout: DEFAULT_LAYOUT,
    defaultState: DEFAULT_STATE,
  };
}

/**
 * Get a blank layout template for creating custom layouts
 */
export function getBlankLayout(name: string = 'Custom Layout'): DashboardLayout {
  return {
    id: `layout-${Date.now()}`,
    name,
    description: 'Custom dashboard layout',
    isDefault: false,
    isTemplate: false,
    widgets: [],
    metadata: {
      version: 1,
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Predefined layout templates
 */
export const LAYOUT_TEMPLATES: Record<string, DashboardLayout> = {
  'minimal': {
    id: 'template-minimal',
    name: 'Minimal Dashboard',
    description: 'Focused dashboard with essential widgets only',
    isDefault: false,
    isTemplate: true,
    widgets: [
      {
        id: 'widget-1',
        widgetId: 'research-progress',
        position: { x: 0, y: 0, width: 4, height: 2 },
      },
      {
        id: 'widget-2',
        widgetId: 'quick-stats',
        position: { x: 0, y: 2, width: 4, height: 1 },
      },
    ],
  },
  'comprehensive': {
    id: 'template-comprehensive',
    name: 'Comprehensive Dashboard',
    description: 'Full-featured dashboard with all available widgets',
    isDefault: false,
    isTemplate: true,
    widgets: [
      {
        id: 'widget-1',
        widgetId: 'research-progress',
        position: { x: 0, y: 0, width: 2, height: 2 },
      },
      {
        id: 'widget-2',
        widgetId: 'quick-stats',
        position: { x: 2, y: 0, width: 2, height: 1 },
      },
      {
        id: 'widget-3',
        widgetId: 'recent-papers',
        position: { x: 2, y: 1, width: 2, height: 1 },
      },
      {
        id: 'widget-4',
        widgetId: 'writing-goals',
        position: { x: 0, y: 2, width: 2, height: 2 },
      },
      {
        id: 'widget-5',
        widgetId: 'calendar',
        position: { x: 2, y: 2, width: 2, height: 2 },
      },
      {
        id: 'widget-6',
        widgetId: 'collaboration',
        position: { x: 4, y: 0, width: 2, height: 2 },
      },
      {
        id: 'widget-7',
        widgetId: 'trends',
        position: { x: 4, y: 2, width: 2, height: 2 },
      },
    ],
  },
  'writing-focused': {
    id: 'template-writing',
    name: 'Writing-Focused Dashboard',
    description: 'Optimized for thesis writers with writing tools prominent',
    isDefault: false,
    isTemplate: true,
    widgets: [
      {
        id: 'widget-1',
        widgetId: 'writing-goals',
        position: { x: 0, y: 0, width: 2, height: 2 },
      },
      {
        id: 'widget-2',
        widgetId: 'time-tracker',
        position: { x: 2, y: 0, width: 2, height: 1 },
      },
      {
        id: 'widget-3',
        widgetId: 'notes',
        position: { x: 2, y: 1, width: 2, height: 1 },
      },
      {
        id: 'widget-4',
        widgetId: 'research-progress',
        position: { x: 0, y: 2, width: 2, height: 2 },
      },
      {
        id: 'widget-5',
        widgetId: 'calendar',
        position: { x: 2, y: 2, width: 2, height: 2 },
      },
    ],
  },
  'research-focused': {
    id: 'template-research',
    name: 'Research-Focused Dashboard',
    description: 'Optimized for research tracking and analysis',
    isDefault: false,
    isTemplate: true,
    widgets: [
      {
        id: 'widget-1',
        widgetId: 'recent-papers',
        position: { x: 0, y: 0, width: 2, height: 2 },
      },
      {
        id: 'widget-2',
        widgetId: 'research-progress',
        position: { x: 2, y: 0, width: 2, height: 2 },
      },
      {
        id: 'widget-3',
        widgetId: 'citations',
        position: { x: 0, y: 2, width: 2, height: 2 },
      },
      {
        id: 'widget-4',
        widgetId: 'trends',
        position: { x: 2, y: 2, width: 2, height: 2 },
      },
      {
        id: 'widget-5',
        widgetId: 'suggestions',
        position: { x: 4, y: 0, width: 2, height: 4 },
      },
    ],
  },
};

/**
 * Get all available layout templates
 */
export function getAllLayoutTemplates(): DashboardLayout[] {
  return Object.values(LAYOUT_TEMPLATES);
}

/**
 * Get a specific layout template by ID
 */
export function getLayoutTemplate(templateId: string): DashboardLayout | null {
  return LAYOUT_TEMPLATES[templateId] || null;
}

/**
 * Create a layout from a template
 */
export function createLayoutFromTemplate(
  templateId: string,
  customName?: string
): DashboardLayout | null {
  const template = getLayoutTemplate(templateId);
  if (!template) return null;

  return {
    ...template,
    id: `layout-${Date.now()}`,
    name: customName || template.name,
    isTemplate: false,
    metadata: {
      version: 1,
      createdAt: new Date().toISOString(),
    },
  };
}
