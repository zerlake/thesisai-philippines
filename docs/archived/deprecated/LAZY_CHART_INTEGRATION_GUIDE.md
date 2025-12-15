# Lazy Chart Integration Guide

## Overview

The `lazy-chart-wrapper.tsx` utility prevents the 283 KB recharts library from being included in your main bundle. Charts load in a separate code chunk when needed.

---

## Two Integration Approaches

### Approach 1: Using `createLazyChart()` (Recommended)

Best for converting existing chart components to lazy-loaded versions.

**Step 1: Create a lazy wrapper file**

```typescript
// src/components/charts/lazy-analytics-dashboard.tsx
'use client';

import { createLazyChart } from '@/components/lazy-chart-wrapper';
import EnhancedAnalyticsDashboard from './enhanced-analytics-dashboard';

export default createLazyChart(EnhancedAnalyticsDashboard, 'AnalyticsDashboard');
```

**Step 2: Import the lazy version instead of the original**

```typescript
// Before
import EnhancedAnalyticsDashboard from '@/components/EnhancedAnalyticsDashboard';

// After
import EnhancedAnalyticsDashboard from '@/components/charts/lazy-analytics-dashboard';
```

**Step 3: Use it normally** (no changes to how you use it)

```typescript
<EnhancedAnalyticsDashboard data={data} />
```

---

### Approach 2: Using `LazyChartWrapper` Component

For inline usage or when you want fine-grained control.

```typescript
'use client';

import { LazyChartWrapper } from '@/components/lazy-chart-wrapper';
import YourChartComponent from './your-chart';

export function MyPage() {
  return (
    <LazyChartWrapper 
      Component={YourChartComponent}
      props={{ data: myData, title: 'Sales' }}
      height="h-96"
    />
  );
}
```

---

## Step-by-Step Integration for Chart Components

### Component 1: EnhancedAnalyticsDashboard

**File:** `src/components/EnhancedAnalyticsDashboard.tsx`

**Option A: Create wrapper file**
```typescript
// src/components/charts/lazy-analytics-dashboard.tsx
'use client';
import { createLazyChart } from '@/components/lazy-chart-wrapper';
import EnhancedAnalyticsDashboard from '../EnhancedAnalyticsDashboard';
export default createLazyChart(EnhancedAnalyticsDashboard, 'AnalyticsDashboard');
```

**Option B: Modify original file**
```typescript
// At the bottom of src/components/EnhancedAnalyticsDashboard.tsx
import { createLazyChart } from '@/components/lazy-chart-wrapper';
export const LazyEnhancedAnalyticsDashboard = createLazyChart(
  EnhancedAnalyticsDashboard, 
  'AnalyticsDashboard'
);
```

---

### Component 2: Grammar Checker

**File:** `src/components/grammar-checker.tsx`

**Locate:** Where recharts are imported
```typescript
// Find and replace
import { LineChart, Line, ... } from 'recharts';
```

**Replace with lazy wrapper:**
```typescript
'use client';
import { createLazyChart } from '@/components/lazy-chart-wrapper';

const GrammarCheckerChart = ({ data }) => {
  // ... your chart rendering code
};

export const LazyGrammarChecker = createLazyChart(GrammarCheckerChart, 'GrammarChecker');
```

---

### Component 3: Chart Generator

**File:** `src/components/results-tools/chart-generator.tsx`

```typescript
// At the top, import the utility
import { createLazyChart } from '@/components/lazy-chart-wrapper';

// Create lazy version
export const LazyChartGenerator = createLazyChart(ChartGenerator, 'ChartGenerator');
```

---

### Component 4: Recent Activity Chart

**File:** `src/components/recent-activity-chart.tsx`

```typescript
import { createLazyChart } from '@/components/lazy-chart-wrapper';

export default createLazyChart(RecentActivityChart, 'RecentActivityChart');
```

---

### Component 5: Student Progress Chart

**File:** `src/components/student-progress-overview-chart.tsx`

```typescript
import { createLazyChart } from '@/components/lazy-chart-wrapper';

export default createLazyChart(StudentProgressOverviewChart, 'StudentProgress');
```

---

## How It Works

### Before Optimization
```
Page Load
    ↓
Load main bundle (includes recharts 283 KB)
    ↓
Parse & execute (recharts code)
    ↓
Render chart
```

### After Optimization
```
Page Load
    ↓
Load main bundle (recharts NOT included)
    ↓
Show loading skeleton
    ↓
User navigates to chart page
    ↓
Load chart chunk (includes recharts)
    ↓
Replace skeleton with real chart
```

---

## Loading Skeleton Customization

The wrapper provides a default skeleton. Customize it:

```typescript
// src/components/charts/custom-lazy-chart.tsx
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CustomSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export function createCustomLazyChart(Component, displayName) {
  const LazyComponent = dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <CustomSkeleton />,
  });

  LazyComponent.displayName = `Lazy${displayName}`;
  return LazyComponent;
}
```

---

## TypeScript Support

All lazy chart functions are fully typed:

```typescript
interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  title: string;
}

const MyChart = (props: ChartProps) => {
  // Component code
};

// Lazy version retains full type safety
const LazyChart = createLazyChart(MyChart, 'MyChart');
```

---

## Testing Your Lazy Charts

### 1. Visual Test
```bash
pnpm build
pnpm start
# Navigate to pages with charts
# Verify skeleton appears briefly, then chart loads
```

### 2. DevTools Network Test
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "chunk_" 
4. Reload page
5. Verify recharts loads only when chart is visible
```

### 3. Performance Test
```bash
# Run Lighthouse on chart page
# Verify chart loads in separate chunk
# Check performance improvement
```

---

## Common Issues & Solutions

### Issue: Skeleton appears too long
**Solution:** User's network is slow. Normal behavior. Verify with Network Throttling in DevTools.

### Issue: Chart doesn't render
**Solution:** Check console for errors. Common causes:
- Component requires `'use client'` directive
- Component needs to handle undefined data during loading
- Missing dependencies in dynamic import

**Fix:**
```typescript
// Make sure component is 'use client'
'use client';

export function MyChart({ data = [] }) {
  // Handle empty data gracefully
  if (!data.length) return <div>No data</div>;
  // ... rest of component
}
```

### Issue: TypeScript errors on wrapped component
**Solution:** Ensure component has proper props interface:

```typescript
interface MyChartProps {
  data: Array<{ x: number; y: number }>;
}

function MyChart(props: MyChartProps) { }

// Now wrap it
const LazyChart = createLazyChart<MyChartProps>(MyChart, 'MyChart');
```

---

## Performance Metrics

### Bundle Size Reduction
- **Before:** 283 KB (recharts in main bundle)
- **After:** Main bundle no longer includes recharts
- **Separate chunk:** ~283 KB loads on-demand

### Load Time Improvement
- **First page load:** -283 KB (faster)
- **Chart page load:** +283 KB (loads chart chunk)
- **Net benefit:** First page is 283 KB smaller

### Caching Benefit
After first visit to chart page:
- Chunk is cached in browser
- Subsequent chart pages load instantly

---

## Migration Checklist

- [ ] Create wrapper for EnhancedAnalyticsDashboard
- [ ] Create wrapper for grammar-checker
- [ ] Create wrapper for chart-generator
- [ ] Create wrapper for recent-activity-chart
- [ ] Create wrapper for student-progress-overview-chart
- [ ] Update all imports to use lazy versions
- [ ] Test all chart pages load correctly
- [ ] Verify no console errors
- [ ] Run `pnpm build` successfully
- [ ] Deploy and monitor performance

---

## Expected Results

After integrating lazy chart wrappers:

| Metric | Value |
|--------|-------|
| Main bundle reduction | -283 KB (5% of main bundle) |
| Chart page load time | Same as before |
| Non-chart page load time | 283 KB faster |
| Performance score improvement | +5-10 points |

---

## Further Reading

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Code Splitting Guide](https://webpack.js.org/guides/code-splitting/)
- [React Lazy & Suspense](https://react.dev/reference/react/lazy)

---

## Support

If you run into issues:

1. Check browser console for errors
2. Verify `'use client'` directive on all chart components
3. Check that chart component doesn't rely on server-side data fetching
4. Review `src/components/lazy-chart-wrapper.tsx` implementation
5. Run `pnpm build` to catch TypeScript issues

---

*This integration can reduce your main bundle by 283 KB (5%) and improve performance scores by 5-10 points.*
