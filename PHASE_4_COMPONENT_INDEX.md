# Phase 4: Component Implementation Index

## Quick Reference Guide

### Main Components

#### 1. DashboardCustomizer
**Location**: `src/components/personalization/DashboardCustomizer.tsx`  
**Purpose**: Main canvas for dashboard layout customization  
**Usage**:
```typescript
import { DashboardCustomizer } from '@/components/personalization/DashboardCustomizer';

<DashboardCustomizer onOpenSettings={(widgetId) => {}} />
```

**Props**:
- `onOpenSettings?`: (widgetLayoutId: string) => void

**Features**:
- Grid-based drag-drop
- Widget resizing
- Undo/redo
- Preview mode
- Save/reset

---

#### 2. WidgetSettingsModal
**Location**: `src/components/personalization/WidgetSettingsModal.tsx`  
**Purpose**: Configure widget-specific settings  
**Usage**:
```typescript
import { WidgetSettingsModal } from '@/components/personalization/WidgetSettingsModal';

const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

<WidgetSettingsModal
  widgetLayoutId={selectedWidget}
  isOpen={!!selectedWidget}
  onClose={() => setSelectedWidget(null)}
/>
```

**Props**:
- `widgetLayoutId`: string - The widget layout ID to edit
- `isOpen`: boolean - Whether modal is visible
- `onClose`: () => void - Called when modal should close

**Features**:
- Auto-generated form fields
- Live preview
- Save/cancel/reset buttons
- Input validation

---

### Widget Components

All 12 widgets located in `src/components/personalization/widgets/`

#### ResearchProgressWidget
**File**: `ResearchProgressWidget.tsx`  
**Settings**:
```typescript
{
  period: 'month' | 'week' | 'year',
  metrics: string[],
  chartType: 'line' | 'bar' | 'area'
}
```

#### StatsWidget
**File**: `StatsWidget.tsx`  
**Settings**:
```typescript
{
  stats: string[]
}
```

#### RecentPapersWidget
**File**: `RecentPapersWidget.tsx`  
**Settings**:
```typescript
{
  count: number,
  sortBy: 'date' | 'title' | 'author',
  showPreview: boolean
}
```

#### WritingGoalsWidget
**File**: `WritingGoalsWidget.tsx`  
**Settings**:
```typescript
{
  goalType: 'words_per_day' | 'pages_per_day',
  target: number,
  interval: 'daily' | 'weekly' | 'monthly'
}
```

#### CollaborationWidget
**File**: `CollaborationWidget.tsx`  
**Settings**:
```typescript
{
  showMembers: boolean,
  maxMembers: number
}
```

#### CalendarWidget
**File**: `CalendarWidget.tsx`  
**Settings**:
```typescript
{
  eventTypes: string[],
  showWeekends: boolean
}
```

#### TrendsWidget
**File**: `TrendsWidget.tsx`  
**Settings**:
```typescript
{
  timeRange: '7d' | '30d' | '90d',
  metrics: string[],
  limit: number
}
```

#### NotesWidget
**File**: `NotesWidget.tsx`  
**Settings**:
```typescript
{
  count: number,
  sortBy: 'updated' | 'created' | 'title',
  groupBy: 'topic' | 'date' | 'none'
}
```

#### CitationWidget
**File**: `CitationWidget.tsx`  
**Settings**:
```typescript
{
  format: 'APA' | 'MLA' | 'Chicago' | 'Harvard',
  showCount: boolean
}
```

#### SuggestionsWidget
**File**: `SuggestionsWidget.tsx`  
**Settings**:
```typescript
{
  frequency: 'daily' | 'weekly' | 'monthly',
  suggestionTypes: string[],
  limit: number
}
```

#### TimeTrackerWidget
**File**: `TimeTrackerWidget.tsx`  
**Settings**:
```typescript
{
  categories: string[],
  period: 'day' | 'week' | 'month'
}
```

#### CustomWidget
**File**: `CustomWidget.tsx`  
**Settings**:
```typescript
{
  html: string,
  css: string,
  js: string
}
```

---

### Utility Modules

#### Dashboard State Management
**Location**: `src/lib/personalization/dashboard-state.ts`  
**Hook**: `useDashboardStore()`  
**Store Functions**:
- `addWidget(widgetId, x?, y?)`
- `removeWidget(widgetLayoutId)`
- `updateWidgetPosition(id, x, y)`
- `updateWidgetSize(id, w, h)`
- `updateWidgetSettings(id, settings)`
- `undo()` / `redo()`
- `saveLayout()`
- `resetToDefault()`

---

#### Responsive Layout System
**Location**: `src/lib/personalization/responsive-layout.ts`

**Key Functions**:
```typescript
// Detect current breakpoint
getCurrentBreakpoint(width?: number): 'mobile' | 'tablet' | 'desktop'

// Get breakpoint configuration
getBreakpointConfig(breakpoint: Breakpoint): BreakpointConfig

// Reflow layout for new breakpoint
reflowWidgetLayout(
  widgets: WidgetLayout[],
  fromBreakpoint: Breakpoint,
  toBreakpoint: Breakpoint
): WidgetLayout[]

// Stack widgets vertically for mobile
stackWidgetsVertically(
  widgets: WidgetLayout[],
  maxColumns: number
): WidgetLayout[]

// Detect overlapping widgets
detectLayoutIssues(widgets: WidgetLayout[]): string[]

// Auto-fix overlaps
autoFixLayout(
  widgets: WidgetLayout[],
  maxColumns: number
): WidgetLayout[]

// Calculate total height
calculateLayoutHeight(
  widgets: WidgetLayout[],
  cellHeight: number
): number

// Validate position
isValidPosition(
  widget: WidgetLayout,
  maxColumns: number,
  config: BreakpointConfig
): boolean
```

**Breakpoint Configs**:
```typescript
BREAKPOINT_CONFIGS = {
  mobile: { columns: 2, minWidth: 320, maxWidth: 480, cellHeight: 60 },
  tablet: { columns: 4, minWidth: 481, maxWidth: 1024, cellHeight: 70 },
  desktop: { columns: 6, minWidth: 1025, maxWidth: Infinity, cellHeight: 80 }
}
```

---

### Styling Modules

#### DashboardCustomizer Styles
**Location**: `src/components/personalization/styles/dashboard-customizer.module.css`

**Key Classes**:
- `.customizer` - Main container
- `.toolbar` - Top toolbar
- `.canvas` - Drawing canvas
- `.widgetWrapper` - Individual widget container
- `.gridBackground` - Grid pattern
- `.widgetHeader` - Widget title bar
- `.resizeHandle` - Resize indicator

**Features**:
- Dark mode support
- Accessibility classes
- Responsive breakpoints
- Animation support

---

#### Widget Settings Modal Styles
**Location**: `src/components/personalization/styles/widget-settings-modal.module.css`

**Key Classes**:
- `.overlay` - Semi-transparent background
- `.modal` - Modal dialog container
- `.header` - Modal header
- `.content` - Main content area
- `.footer` - Action buttons
- `.form` - Form elements
- `.preview` - Widget preview

---

#### Widgets Shared Styles
**Location**: `src/components/personalization/styles/widgets.module.css`

**Key Classes**:
- `.widget` - Base widget container
- `.statsGrid` - Stats grid layout
- `.listItem` - List item styling
- `.progressBar` - Progress bar component
- `.eventsList` - Event list layout
- `.trendsList` - Trends list layout

---

## Integration Examples

### Basic Setup
```typescript
import { DashboardCustomizer } from '@/components/personalization/DashboardCustomizer';
import { WidgetSettingsModal } from '@/components/personalization/WidgetSettingsModal';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';

export default function DashboardPage() {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  return (
    <div>
      <DashboardCustomizer
        onOpenSettings={setSelectedWidgetId}
      />
      
      <WidgetSettingsModal
        widgetLayoutId={selectedWidgetId}
        isOpen={!!selectedWidgetId}
        onClose={() => setSelectedWidgetId(null)}
      />
    </div>
  );
}
```

### With Responsive Handling
```typescript
import { useResponsiveBreakpoint } from '@/lib/personalization/responsive-layout';

export default function ResponsiveDashboard() {
  const breakpoint = useResponsiveBreakpoint();
  const store = useDashboardStore();

  useEffect(() => {
    // Reflow layout when breakpoint changes
    if (breakpoint !== store.currentBreakpoint) {
      store.setBreakpoint(breakpoint);
    }
  }, [breakpoint]);

  return <DashboardCustomizer />;
}
```

### With API Integration (Phase 5)
```typescript
import { useDashboardStore } from '@/lib/personalization/dashboard-state';

export default function Dashboard() {
  const store = useDashboardStore();

  useEffect(() => {
    // Load saved layout from API
    fetchUserLayout().then(layout => {
      store.loadLayout(layout.id);
    });
  }, []);

  const handleSave = async () => {
    await store.saveLayout();
    // Layout is persisted via Zustand middleware
  };

  return <DashboardCustomizer />;
}
```

---

## File Structure Cheat Sheet

```
src/
├── components/personalization/
│   ├── DashboardCustomizer.tsx (main canvas)
│   ├── WidgetSettingsModal.tsx (settings dialog)
│   ├── widgets/
│   │   ├── ResearchProgressWidget.tsx
│   │   ├── StatsWidget.tsx
│   │   ├── RecentPapersWidget.tsx
│   │   ├── WritingGoalsWidget.tsx
│   │   ├── CollaborationWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── TrendsWidget.tsx
│   │   ├── NotesWidget.tsx
│   │   ├── CitationWidget.tsx
│   │   ├── SuggestionsWidget.tsx
│   │   ├── TimeTrackerWidget.tsx
│   │   ├── CustomWidget.tsx
│   │   └── index.ts (barrel export)
│   └── styles/
│       ├── dashboard-customizer.module.css
│       ├── widget-settings-modal.module.css
│       └── widgets.module.css
│
└── lib/personalization/
    ├── widget-registry.ts (widget definitions)
    ├── dashboard-state.ts (Zustand store)
    └── responsive-layout.ts (layout utilities)
```

---

## Testing Quick Reference

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
npm test dashboard-customizer.test.tsx
npm test widget-settings-modal.test.tsx
npm test responsive-layout.test.ts
```

### Test Files Location
```
__tests__/
├── components/
│   ├── dashboard-customizer.test.tsx (25+ tests)
│   └── widget-settings-modal.test.tsx (20+ tests)
└── lib/
    └── responsive-layout.test.ts (30+ tests)
```

---

## Performance Tips

1. **Use VirtualList for 100+ widgets**
   ```typescript
   import { VirtualList } from '@/components/performance/VirtualList';
   
   <VirtualList items={widgets} itemHeight={100} renderItem={...} />
   ```

2. **Debounce settings updates**
   ```typescript
   import { useDebounce } from '@/lib/performance/event-delegation';
   
   const debouncedUpdate = useDebounce(updateSettings, 300);
   ```

3. **Use cleanup hooks**
   ```typescript
   import { useCleanup } from '@/lib/performance/cleanup-manager';
   
   const cleanup = useCleanup();
   cleanup.addEventListener('resize', handler);
   ```

---

## Common Issues & Solutions

### Widget Not Showing
1. Check if widget is in widget registry
2. Verify widget has previewComponent
3. Check if widget layout is within grid bounds

### Drag-Drop Not Working
1. Ensure you're not in preview mode
2. Check if widget is locked
3. Verify drag handle is being targeted

### Settings Not Saving
1. Check if save button was clicked
2. Verify settings validation passes
3. Check Zustand store update

### Responsive Issues
1. Verify breakpoint config values
2. Check CSS media queries
3. Test with browser dev tools

---

## Next Steps (Phase 5)

1. **Connect to API**
   - Fetch real widget data
   - Persist layouts to database
   - Load user preferences

2. **Add More Widgets**
   - Custom widget builder
   - Third-party integrations
   - User-created widgets

3. **Performance Monitoring**
   - Add error tracking
   - Monitor performance metrics
   - Generate analytics

4. **User Features**
   - Widget scheduling
   - Layout templates
   - Sharing/collaboration

---

## Resources

- **Widget Registry**: `src/lib/personalization/widget-registry.ts`
- **Dashboard State**: `src/lib/personalization/dashboard-state.ts`
- **Responsive System**: `src/lib/personalization/responsive-layout.ts`
- **Performance Utilities**: `src/lib/performance/`
- **Full Documentation**: `PHASE_4_FINAL_COMPLETION.md`

---

**Last Updated**: November 24, 2024  
**Status**: Complete & Production Ready ✅  
**Next Phase**: Phase 5 - Integration & Real Data
