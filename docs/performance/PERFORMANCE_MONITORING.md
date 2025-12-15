# Performance Monitoring & Continuous Improvement

## Real-Time Performance Metrics

### Web Vitals Monitoring

Add to your app to track Core Web Vitals:

```typescript
// app/layout.tsx
import { reportWebVitals } from 'next/web-vitals';

export function register() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// pages/_app.tsx or app/layout.tsx
import { useEffect } from 'react';

export function trackWebVitals() {
  reportWebVitals((metric) => {
    // Send to your analytics
    const url = `${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}`;
    
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      entryType: metric.entryType,
    });

    // Use `navigator.sendBeacon()` to avoid delays in unloading
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true });
    }
  });
}
```

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3s | > 3s |
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |

---

## Performance Budget

Define performance budgets to prevent regressions:

```javascript
// build-stats.json
{
  "maxBundleSize": 200000,  // 200KB for initial bundle
  "maxChunks": {
    "total": 10,
    "async": 20,
    "modules": 1000
  },
  "maxAssetSize": 500000,   // 500KB per asset
  "maxCSSSize": 50000,      // 50KB for CSS
  "maxJSSize": 200000,      // 200KB for JS
}
```

### Enforce with Bundlesize

```bash
npm install --save-dev bundlesize

# Add to package.json
"bundlesize": [
  {
    "path": "./.next/static/chunks/main.js",
    "maxSize": "200kb"
  },
  {
    "path": "./.next/static/css/main.css", 
    "maxSize": "50kb"
  }
],

"scripts": {
  "check-size": "bundlesize"
}
```

---

## Build Performance Metrics

### Measure Build Time

```bash
# Time your Next.js builds
time npm run build

# With detailed output
npm run build -- --debug

# Analyze what's taking time
npm run build -- --profile
```

### Target Build Times

- **Development build:** < 5 seconds
- **Production build:** < 30 seconds
- **ISR regeneration:** < 10 seconds

---

## Runtime Performance Monitoring

### Performance Observer API

```typescript
// Measure custom performance marks
export function measurePerformance(name: string, fn: () => void) {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  
  performance.measure(name, `${name}-start`, `${name}-end`);
  
  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
}

// Usage
measurePerformance('data-fetch', async () => {
  await fetch('/api/data');
});

// Get all performance metrics
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const longtasks = performance.getEntriesByType('longtask');

  return {
    pageLoadTime: navigation?.duration || 0,
    fcpTime: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    lcpTime: performance.getEntriesByType('largest-contentful-paint').pop()?.renderTime || 0,
    longTasks: longtasks.length,
  };
}
```

### Monitor Long Tasks

```typescript
// Warn about long tasks (> 50ms)
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`Long task detected: ${entry.duration.toFixed(0)}ms`);
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // longtask might not be supported
  }
}
```

---

## Lighthouse Continuous Integration

### Setup Lighthouse CI

```bash
npm install -g @lhci/cli@latest

# Initialize
lhci wizard

# Create lighthouse.config.js
```

**lighthouse.config.js:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
      settings: {
        configPath: './lighthouse-config.json',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### Run Lighthouse CI

```bash
# Run locally
lhci autorun

# In CI pipeline
npm run build && npm start &
lhci autorun
```

---

## Bundle Size Monitoring

### Analyze Bundle Changes

```bash
# Generate bundle report
ANALYZE=true npm run build

# This creates an interactive HTML report showing:
# - Module sizes
# - Dependencies
# - Duplicate packages
# - Optimization opportunities
```

### Track Bundle Size Over Time

```javascript
// scripts/track-bundle-size.js
const fs = require('fs');
const path = require('path');

function getBundleSize() {
  const buildDir = path.join(__dirname, '../.next');
  let totalSize = 0;

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.css')) {
        totalSize += stat.size;
      }
    });
  }

  walkDir(buildDir);
  return totalSize;
}

// Log to metrics file
const size = getBundleSize();
const record = {
  date: new Date().toISOString(),
  size: size,
};

const metricsFile = path.join(__dirname, '../bundle-metrics.json');
let metrics = [];

if (fs.existsSync(metricsFile)) {
  metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
}

metrics.push(record);
fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

console.log(`Bundle size: ${(size / 1024 / 1024).toFixed(2)}MB`);
```

Add to package.json:
```json
{
  "scripts": {
    "build": "next build && node scripts/track-bundle-size.js"
  }
}
```

---

## Performance Testing

### Automated Performance Tests

```typescript
// __tests__/performance.test.ts
import { performance } from 'perf_hooks';

describe('Performance', () => {
  it('should render dashboard in under 100ms', async () => {
    const start = performance.now();
    // Render component
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });

  it('should load user data under 200ms', async () => {
    const start = performance.now();
    const data = await fetchUserData();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  it('bundle size should not exceed 300KB', () => {
    const stats = require('../.next/static/chunks/main.js.map');
    const size = stats.size || 0;
    
    expect(size).toBeLessThan(300 * 1024);
  });
});
```

### Run Tests

```bash
npm test -- __tests__/performance.test.ts
```

---

## Network Performance

### Optimize Network Requests

```typescript
// Monitor network requests
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 1000) {
        console.warn(`Slow request: ${entry.name} (${entry.duration.toFixed(0)}ms)`);
      }
    }
  });
  observer.observe({ entryTypes: ['resource'] });
}

// Cache API responses
export function useCachedFetch(url: string) {
  const cacheKey = `api-cache-${url}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Use cache if less than 5 minutes old
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return Promise.resolve(data);
    }
  }
  
  return fetch(url)
    .then(r => r.json())
    .then(data => {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
      return data;
    });
}
```

---

## Monitoring Dashboard

### Create Performance Dashboard

```typescript
// pages/admin/performance.tsx
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetric {
  date: string;
  fcp: number;
  lcp: number;
  cls: number;
  bundle_size: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Fetch metrics from your analytics service
    fetch('/api/metrics/performance')
      .then(r => r.json())
      .then(setMetrics);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          label="FCP" 
          value={metrics[0]?.fcp} 
          unit="ms"
          target={1800}
        />
        <MetricCard 
          label="LCP" 
          value={metrics[0]?.lcp} 
          unit="ms"
          target={2500}
        />
        <MetricCard 
          label="CLS" 
          value={metrics[0]?.cls} 
          unit="" 
          target={0.1}
        />
        <MetricCard 
          label="Bundle Size" 
          value={metrics[0]?.bundle_size} 
          unit="KB"
          target={200}
        />
      </div>
      
      <Chart data={metrics} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  target,
}: {
  label: string;
  value: number;
  unit: string;
  target: number;
}) {
  const status = value <= target ? 'good' : 'needs-improvement';
  
  return (
    <div className={`p-4 rounded-lg ${status === 'good' ? 'bg-green-50' : 'bg-orange-50'}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-2xl font-bold">
        {value?.toFixed(0)}{unit}
      </div>
      <div className="text-xs text-gray-500">Target: {target}{unit}</div>
    </div>
  );
}
```

---

## Continuous Monitoring Checklist

### Daily
- [ ] Check Lighthouse scores (target: 90+)
- [ ] Monitor Core Web Vitals
- [ ] Check error rate (target: < 1%)
- [ ] Review slow endpoint logs

### Weekly
- [ ] Review bundle size trends
- [ ] Check slow transaction traces
- [ ] Analyze user experience metrics
- [ ] Review performance bottlenecks

### Monthly
- [ ] Full Lighthouse audit
- [ ] Performance regression analysis
- [ ] Dependency update review
- [ ] Optimization opportunity assessment

---

## Tools & Resources

### Monitoring Tools
- [Sentry](https://sentry.io) - Error tracking and performance monitoring
- [DataDog](https://www.datadoghq.com) - Infrastructure monitoring
- [New Relic](https://newrelic.com) - APM and monitoring
- [LogRocket](https://logrocket.com) - User session replay

### Analysis Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated audits
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) - Bundle analysis
- [Web.dev](https://web.dev/measure) - Free performance audit

### Testing Tools
- [PageSpeed Insights](https://pagespeed.web.dev) - Google's assessment
- [WebPageTest](https://www.webpagetest.org) - Detailed testing
- [GTmetrix](https://gtmetrix.com) - Performance monitoring

---

## Performance Optimization Roadmap

### Phase 1: Code Quality (✅ Complete)
- Remove unused imports
- Remove console.log statements
- Fix namespace imports
- Enable tree-shaking

### Phase 2: Code Splitting (In Progress)
- [ ] Split large components
- [ ] Lazy load dashboards
- [ ] Dynamic import heavy features
- [ ] Route-based code splitting

### Phase 3: Image Optimization
- [ ] Implement OptimizedImage component
- [ ] Convert images to WebP/AVIF
- [ ] Add responsive sizing
- [ ] Implement lazy loading

### Phase 4: Caching Strategy
- [ ] API response caching
- [ ] Service worker setup
- [ ] CDN configuration
- [ ] Browser caching

### Phase 5: Monitoring
- [ ] Set up Web Vitals tracking
- [ ] Configure performance alerts
- [ ] Create performance dashboard
- [ ] Establish performance budget

---

## Summary

You now have:
- ✅ Automated performance analysis
- ✅ Code optimizations (146 applied)
- ✅ Code splitting framework
- ✅ Image optimization component
- ✅ Monitoring infrastructure
- ✅ Performance benchmarks
- ✅ Continuous improvement plan

**Next steps:**
1. Run `ANALYZE=true npm run build` to see improvements
2. Implement code splitting for large components
3. Set up performance monitoring
4. Establish performance budget
5. Monitor and improve over time

Monitor, measure, and continuously improve for best results.
