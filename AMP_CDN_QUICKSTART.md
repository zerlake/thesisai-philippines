# AMP CDN Configuration - Quick Start

## What Was Configured

Your Next.js project now has:

✅ **Geographic CDN Distribution** - Automatic routing to US, EU, and APAC regions
✅ **AMP Cache Optimization** - Pre-rendering and caching for Accelerated Mobile Pages
✅ **Latency Reduction** - Smart regional failover with secondary CDN support
✅ **Auto-tuning** - Metrics-based configuration optimization
✅ **Monitoring** - Real-time performance tracking and health checks

## 3-Step Setup

### Step 1: Update Environment Variables

Edit `.env.local` and add your CDN endpoints:

```bash
# Regional CDN endpoints
CDN_US_PRIMARY=your-us-cdn-url.com
CDN_US_SECONDARY=your-us-backup-cdn.com
CDN_EU_PRIMARY=your-eu-cdn-url.com
CDN_EU_SECONDARY=your-eu-backup-cdn.com
CDN_APAC_PRIMARY=your-apac-cdn-url.com
CDN_APAC_SECONDARY=your-apac-backup-cdn.com

# Enable AMP caching
AMP_CACHE_ENABLED=true
```

### Step 2: Identify Pages to Pre-render

Edit pages that should be pre-rendered for AMP caches:

```typescript
// src/app/dashboard/page.tsx
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static'; // Pre-render at build time

export default function DashboardPage() {
  // Your content
}
```

### Step 3: Build and Deploy

```bash
# Verify configuration
npm run verify-amp

# Build project
npm run build

# Start production server
npm start
```

## Monitoring Your Setup

### Check Real-time Health Status

```bash
# Get current CDN health
curl http://localhost:3000/api/metrics/health

# Get detailed metrics report
curl http://localhost:3000/api/metrics

# Export metrics as CSV
curl "http://localhost:3000/api/metrics?format=csv"
```

### Record Metrics from Your App

```typescript
import { recordMetric } from '@/lib/cdn-metrics';

// After serving a request
const startTime = Date.now();
// ... serve content ...
const latency = Date.now() - startTime;

recordMetric(
  'us-east-1',           // region
  latency,               // milliseconds
  true,                  // cache hit?
  contentLength,         // bytes served
  false                  // error?
);
```

## Key Files Created

| File | Purpose |
|------|---------|
| `next.config.ts` | Enhanced with AMP cache headers and image optimization |
| `src/middleware.ts` | Geographic routing and header injection |
| `src/lib/amp-cache-optimizer.ts` | Core AMP caching logic and utilities |
| `src/lib/cdn-metrics.ts` | Metrics tracking and auto-tuning |
| `src/api/cdn-proxy.ts` | CDN failover and regional routing |
| `src/app/api/metrics/route.ts` | Performance metrics endpoint |
| `src/app/api/metrics/health/route.ts` | Health check endpoint |

## Cache Header Details

### For Static Assets (1 year)
```
Cache-Control: public, max-age=31536000, immutable
```

### For Pre-rendered Pages (1 hour + 7 days stale)
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
```

### For AMP Pages (Optimized)
```
X-Amp-Cache: true
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
```

## Testing the Configuration

### Test Geolocation Routing

```typescript
import { getOptimalRegion } from '@/lib/amp-cache-optimizer';

// Test routing for different countries
console.log(getOptimalRegion('US'));   // us-east-1
console.log(getOptimalRegion('DE'));   // eu-west-1
console.log(getOptimalRegion('SG'));   // ap-southeast-1
```

### Test Cache TTL Calculation

```typescript
import { calculateCacheTTL } from '@/lib/amp-cache-optimizer';

const htmlTTL = calculateCacheTTL('text/html');          // 3600
const imageTTL = calculateCacheTTL('image/jpeg', true);  // 2592000
const apiTTL = calculateCacheTTL('application/json');    // 300
```

### Test Pre-render Detection

```typescript
import { shouldPreRender } from '@/lib/amp-cache-optimizer';

if (shouldPreRender('/dashboard')) {
  // This path will be pre-rendered
  console.log('Page will be pre-rendered');
}
```

## Performance Metrics

After deploying, monitor these metrics:

1. **Cache Hit Ratio** - Target: > 80%
   - Increase TTL if < 50%
   - Decrease TTL if > 95%

2. **Latency** - Target: < 200ms
   - Check regional CDN health if > 500ms
   - Verify secondary CDN is configured

3. **Error Rate** - Target: < 1%
   - Monitor CDN endpoint health
   - Check for timeout issues

## Common Tasks

### Add a New Pre-render Path

1. Update `next.config.ts`:
   ```typescript
   const AMP_PRERENDER_PATHS = [
     "/",
     "/dashboard",
     "/help",
     "/my-new-page",  // Add here
   ];
   ```

2. Export from your page:
   ```typescript
   export const revalidate = 3600;
   export const dynamic = 'force-static';
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

### Change Cache TTL

Edit in `next.config.ts`:

```typescript
// For dynamic content (shorter TTL)
cacheTTL: 300, // 5 minutes

// For static content (longer TTL)
cacheTTL: 86400, // 1 day
```

### Add a New CDN Region

1. Update `next.config.ts`:
   ```typescript
   const CDN_REGIONS = {
     // ... existing regions ...
     my_region: {
       primary: "cdn-my-region.example.com",
       secondary: "cdn-my-region-backup.example.com",
       cache_ttl: 3600,
     },
   };
   ```

2. Update `src/api/cdn-proxy.ts`:
   ```typescript
   const CDN_CONFIG: Record<string, CDNConfig> = {
     // ... existing regions ...
     'my-region': {
       primary: process.env.CDN_MY_REGION_PRIMARY || 'cdn-my-region.example.com',
       secondary: process.env.CDN_MY_REGION_SECONDARY || 'cdn-my-region-backup.example.com',
       cache_ttl: 3600,
     },
   };
   ```

3. Add environment variables to `.env.local`

## Troubleshooting

### "CDN unreachable" errors

- Verify CDN URLs in `.env.local`
- Check network connectivity to CDN
- Ensure CDN authentication headers are correct

### Low cache hit ratio

- Increase `cacheTTL` in configuration
- Add more paths to pre-render list
- Check for dynamic query parameters

### High latency from specific regions

- Verify regional CDN endpoint is online
- Test secondary CDN failover
- Check network routing

## Next Steps

1. ✅ Configure environment variables (see Step 1)
2. ✅ Mark pages for pre-rendering (see Step 2)
3. ✅ Deploy and monitor (see Step 3)
4. Review [Full Configuration Guide](./AMP_CDN_CONFIGURATION_GUIDE.md)
5. Monitor with `/api/metrics/health`

## Support

For detailed configuration options, see [AMP_CDN_CONFIGURATION_GUIDE.md](./AMP_CDN_CONFIGURATION_GUIDE.md)

For metrics and monitoring, use:
- `GET /api/metrics` - Full performance report
- `GET /api/metrics/health` - Real-time health status
- `npm run verify-amp` - Configuration verification
