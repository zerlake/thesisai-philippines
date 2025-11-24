# AMP CDN Configuration - Quick Reference Card

## Setup Commands

```bash
# Verify configuration
npm run verify-amp

# Build with AMP optimization
npm run build

# Start production server
npm start

# Check metrics
npm run amp-metrics
```

## Environment Variables

```bash
# Copy to .env.local and update with your URLs
CDN_US_PRIMARY=your-us-cdn.com
CDN_US_SECONDARY=your-us-backup-cdn.com
CDN_EU_PRIMARY=your-eu-cdn.com
CDN_EU_SECONDARY=your-eu-backup-cdn.com
CDN_APAC_PRIMARY=your-apac-cdn.com
CDN_APAC_SECONDARY=your-apac-backup-cdn.com
AMP_CACHE_ENABLED=true
```

## API Endpoints

```bash
# Get performance metrics
GET /api/metrics
GET /api/metrics?format=csv

# Check health status
GET /api/metrics/health

# Record a metric
POST /api/metrics
{
  "region": "us-east-1",
  "latency": 150,
  "cacheHit": true,
  "bytesServed": 1024,
  "error": false
}
```

## Page Configuration for Pre-rendering

```typescript
// Enable pre-rendering and ISR
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static'; // Build-time rendering

export default function MyPage() {
  return <div>Content</div>;
}
```

## Core Functions

### Check if Path Should Be Pre-rendered
```typescript
import { shouldPreRender } from '@/lib/amp-cache-optimizer';

if (shouldPreRender('/dashboard')) {
  console.log('Will be pre-rendered');
}
```

### Get Optimal Region
```typescript
import { getOptimalRegion } from '@/lib/amp-cache-optimizer';

const region = getOptimalRegion('US'); // 'us-east-1'
const region = getOptimalRegion('DE'); // 'eu-west-1'
const region = getOptimalRegion('SG'); // 'ap-southeast-1'
```

### Calculate Cache TTL
```typescript
import { calculateCacheTTL } from '@/lib/amp-cache-optimizer';

calculateCacheTTL('text/html');              // 3600
calculateCacheTTL('image/jpeg', true);       // 31536000
calculateCacheTTL('application/json');       // 300
calculateCacheTTL('text/css');               // 2592000
```

### Record Metrics
```typescript
import { recordMetric } from '@/lib/cdn-metrics';

recordMetric('us-east-1', 150, true, 2048, false);
// (region, latency_ms, cache_hit, bytes, error)
```

### Get Metrics Report
```typescript
import { getPerformanceReport } from '@/lib/cdn-metrics';

const report = getPerformanceReport();
console.log(report.regions);        // Per-region metrics
console.log(report.recommendations); // Auto-generated suggestions
```

## Cache Headers Reference

### For Static Assets
```
Cache-Control: public, max-age=31536000, immutable
```
**Use for**: Versioned CSS, JS, images

### For Pre-rendered Pages
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
Vary: Accept-Encoding
X-Cache-Status: HIT
```
**Use for**: HTML pages, SSG content

### For AMP Pages
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
X-Amp-Cache: true
Vary: Accept-Encoding, Accept, X-Accept-Encoding
```
**Use for**: AMP-optimized pages

### For Dynamic Content
```
Cache-Control: public, max-age=300, must-revalidate
```
**Use for**: API responses, frequently changing data

## Regional Routing

| Detected Country | Region | Primary CDN |
|---|---|---|
| US, CA, MX | us-east-1 | CDN_US_PRIMARY |
| GB, DE, FR, IE, ES, IT | eu-west-1 | CDN_EU_PRIMARY |
| AU, SG, JP, IN, NZ, HK | ap-southeast-1 | CDN_APAC_PRIMARY |
| Others | us-east-1 (default) | CDN_US_PRIMARY |

## Monitoring Checklist

```
Daily:
  [ ] Check /api/metrics/health status
  [ ] Review error rate (target: < 1%)
  
Weekly:
  [ ] Review /api/metrics report
  [ ] Check cache hit ratio (target: > 80%)
  [ ] Review latency by region (target: < 200ms)
  [ ] Read recommendations
  
Monthly:
  [ ] Analyze metrics trends
  [ ] Adjust TTL if needed
  [ ] Review pre-render paths
  [ ] Update documentation
```

## Performance Targets

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Cache Hit Ratio | > 80% | Increase TTL or add pre-render paths |
| Latency (p50) | < 200ms | Check regional CDN health |
| Latency (p95) | < 500ms | Consider adding edge locations |
| Error Rate | < 1% | Check CDN endpoint health |

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "CDN unreachable" | Check .env.local URLs, verify connectivity |
| Low cache hit ratio | Increase cacheTTL, add paths to pre-render |
| High latency | Verify regional CDN endpoints, test failover |
| Config validation fails | Run `npm run verify-amp` to diagnose |
| Metrics not recording | Implement recordMetric() in request handlers |

## File Locations

| File | Purpose | Edit? |
|------|---------|-------|
| next.config.ts | Core config | Only if adding regions |
| src/middleware.ts | Header injection | No |
| src/lib/amp-cache-optimizer.ts | Core logic | No |
| src/lib/cdn-metrics.ts | Metrics tracking | No |
| src/api/cdn-proxy.ts | CDN routing | Only if adding regions |
| .env.local | Environment vars | YES - Add CDN URLs |

## Adding a Pre-render Path

### Step 1: Update next.config.ts
```typescript
const AMP_PRERENDER_PATHS = [
  "/",
  "/dashboard",
  "/my-new-page",  // Add here
];
```

### Step 2: Export from Page
```typescript
// src/app/my-new-page/page.tsx
export const revalidate = 3600;
export const dynamic = 'force-static';
```

### Step 3: Rebuild
```bash
npm run build
```

## Adding a CDN Region

### Step 1: next.config.ts
```typescript
const CDN_REGIONS = {
  my_region: {
    primary: "cdn-my.example.com",
    secondary: "cdn-my-backup.example.com",
    cache_ttl: 3600,
  },
};
```

### Step 2: src/api/cdn-proxy.ts
```typescript
const CDN_CONFIG: Record<string, CDNConfig> = {
  'my-region': {
    primary: process.env.CDN_MY_PRIMARY || 'cdn-my.example.com',
    secondary: process.env.CDN_MY_SECONDARY || 'cdn-my-backup.example.com',
    cache_ttl: 3600,
  },
};
```

### Step 3: .env.local
```
CDN_MY_PRIMARY=your-cdn-url
CDN_MY_SECONDARY=your-backup-cdn-url
```

## Health Status Indicators

### Healthy ✅
- Cache hit ratio > 80%
- Latency < 200ms (p50)
- Error rate < 1%

### Degraded ⚠️
- Cache hit ratio 50-80%
- Latency 200-500ms (p50)
- Error rate 1-5%

### Unhealthy ❌
- Cache hit ratio < 50%
- Latency > 500ms (p50)
- Error rate > 5%

## Auto-tuning Response

The system automatically adjusts:

```
Low Cache Hit Ratio (< 50%)
  → Increase cacheTTL
  → Increase stale-while-revalidate

High Cache Hit Ratio (> 90%)
  → Can decrease cacheTTL slightly
  → Optimize for freshness

High Latency (> 500ms)
  → Increase stale-while-revalidate window
  → Consider edge locations
```

## Integration Examples

### Next.js App Router
```typescript
// src/app/my-page/page.tsx
import { shouldPreRender } from '@/lib/amp-cache-optimizer';

export const revalidate = 3600;

export default function Page() {
  if (shouldPreRender('/my-page')) {
    // Pre-rendered at build time
  }
  return <div>Content</div>;
}
```

### API Route Metrics
```typescript
// src/app/api/my-endpoint/route.ts
import { recordMetric } from '@/lib/cdn-metrics';

export async function GET(req: Request) {
  const start = Date.now();
  const response = generateResponse();
  const latency = Date.now() - start;
  
  recordMetric('us-east-1', latency, true, 1024, false);
  return response;
}
```

### Custom Headers
```typescript
// src/app/my-page/page.tsx
import { generateAmpCacheHeaders } from '@/lib/amp-cache-optimizer';

export async function generateMetadata() {
  const headers = generateAmpCacheHeaders(true);
  // Use headers in your metadata
  return { headers };
}
```

## Documentation Files

- **Quick Start**: `AMP_CDN_QUICKSTART.md`
- **Full Guide**: `AMP_CDN_CONFIGURATION_GUIDE.md`
- **Implementation**: `AMP_CDN_IMPLEMENTATION_SUMMARY.md`
- **This File**: `AMP_CDN_REFERENCE_CARD.md`

## Support

For help:
1. Check troubleshooting in Quick Start
2. Review Full Configuration Guide
3. Run `npm run verify-amp`
4. Check `/api/metrics/health` for status
5. Review logs in deployment platform
