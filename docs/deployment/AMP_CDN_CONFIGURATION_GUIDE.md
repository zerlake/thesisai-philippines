# AMP Cache & CDN Distribution Configuration Guide

## Overview

This configuration enables automatic CDN distribution and pre-rendering optimization for AMP (Accelerated Mobile Pages) caches with geographic proximity routing and reduced latency.

## Architecture

### Geographic CDN Distribution

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  Geolocation Detection       │
│  (Cloudflare headers, etc.)  │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Route to Optimal Regional CDN          │
│  ├─ US East (us-east-1)                 │
│  ├─ EU West (eu-west-1)                 │
│  └─ AP Southeast (ap-southeast-1)       │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────┐
│  CDN Cache Layer     │
│  ├─ Primary CDN      │
│  └─ Secondary CDN    │
│     (fallback)       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Client Response     │
│  (Optimized + cached)│
└──────────────────────┘
```

### Components

1. **Next.js Configuration** (`next.config.ts`)
   - AMP cache optimization headers
   - Image optimization for CDN
   - ISR (Incremental Static Regeneration) with large memory cache
   - Experimental optimizations

2. **CDN Proxy API** (`src/api/cdn-proxy.ts`)
   - Regional routing based on geolocation
   - Automatic failover to secondary CDN
   - AMP cache headers injection
   - Request timeout handling

3. **AMP Cache Optimizer** (`src/lib/amp-cache-optimizer.ts`)
   - Cache TTL calculation
   - Pre-rendering path management
   - Metrics tracking and auto-tuning
   - AMP header validation

## Configuration Steps

### 1. Environment Variables

Create or update `.env.local`:

```bash
# CDN Configuration
CDN_US_PRIMARY=cdn-us.example.com
CDN_US_SECONDARY=cdn-us-backup.example.com
CDN_EU_PRIMARY=cdn-eu.example.com
CDN_EU_SECONDARY=cdn-eu-backup.example.com
CDN_APAC_PRIMARY=cdn-apac.example.com
CDN_APAC_SECONDARY=cdn-apac-backup.example.com

# AMP Cache Configuration
AMP_CACHE_ENABLED=true
AMP_PRERENDER_PATHS=/,/dashboard,/help,/privacy,/terms
```

### 2. Update Your Pages for AMP

Make sure pages you want to pre-render are configured with proper exports:

```typescript
// src/app/dashboard/page.tsx
export const revalidate = 3600; // ISR: revalidate every hour
export const dynamic = 'force-static'; // Pre-render at build time

export default function DashboardPage() {
  return (
    <div>
      {/* Your content */}
    </div>
  );
}
```

### 3. Add AMP Cache Headers Middleware

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateAmpCacheHeaders } from '@/lib/amp-cache-optimizer';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if this is an AMP page
  const isAmpPage = request.nextUrl.searchParams.has('amp');
  
  // Add cache headers
  const headers = generateAmpCacheHeaders(isAmpPage);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add region header for monitoring
  const region = request.headers.get('x-cdn-region') || 'default';
  response.headers.set('X-Served-By-Region', region);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 4. Cache Headers Breakdown

#### Static Assets (1 year)
```
Cache-Control: public, max-age=31536000, immutable
CDN-Cache-Control: max-age=31536000
```

#### Pre-rendered Pages (1 hour + 7 days stale)
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
X-Cache-Status: HIT
Vary: Accept-Encoding
```

#### AMP Pages (Optimized for AMP cache)
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
X-Amp-Cache: true
Vary: Accept-Encoding, Accept, X-Accept-Encoding
```

### 5. Regional Routing Logic

The CDN proxy automatically routes requests based on geolocation:

| Country Codes | Region | Primary CDN | Fallback |
|---|---|---|---|
| US, CA, MX | us-east-1 | cdn-us | cdn-us-backup |
| GB, DE, FR, IE, ES, IT | eu-west-1 | cdn-eu | cdn-eu-backup |
| AU, SG, JP, IN, NZ, HK | ap-southeast-1 | cdn-apac | cdn-apac-backup |

### 6. Image Optimization

Images are automatically optimized for CDN distribution:

- **Formats**: AVIF (modern browsers) → WebP → Original
- **Cache TTL**: 1 year (31536000 seconds) for versioned assets
- **Remote Patterns**: Support for all HTTPS image sources

### 7. Pre-rendering Configuration

Default pre-rendered paths:
```typescript
const AMP_PRERENDER_PATHS = [
  "/",           // Homepage
  "/dashboard",  // Dashboard
  "/help",       // Help page
  "/privacy",    // Privacy policy
  "/terms",      // Terms of service
];
```

Add more paths by editing `next.config.ts` and implementing proper `revalidate` exports in your pages.

## Usage Examples

### Check Geolocation-based Routing

```typescript
import { getOptimalRegion } from '@/lib/amp-cache-optimizer';

// Determine region based on country
const region = getOptimalRegion('SG'); // Returns 'ap-southeast-1'

// Or with coordinates
const region = getOptimalRegion(undefined, 1.3521, 103.8198); // Singapore coordinates
```

### Calculate Cache TTL

```typescript
import { calculateCacheTTL } from '@/lib/amp-cache-optimizer';

const htmlTTL = calculateCacheTTL('text/html');           // 3600 (1 hour)
const imageTTL = calculateCacheTTL('image/jpeg', true);   // 2592000 (1 month)
const apiTTL = calculateCacheTTL('application/json');     // 300 (5 minutes)
```

### Check if Path Should Be Pre-rendered

```typescript
import { shouldPreRender } from '@/lib/amp-cache-optimizer';

if (shouldPreRender('/dashboard')) {
  // This path will be pre-rendered at build time
}
```

### Auto-tuning Based on Metrics

```typescript
import { autoTuneConfiguration, updateCdnMetrics } from '@/lib/amp-cache-optimizer';

// Update metrics after each request
updateCdnMetrics(metrics, responseTime, cacheHit, contentLength);

// Auto-tune configuration
const tuned = autoTuneConfiguration(allMetrics, currentConfig);
```

## Monitoring & Metrics

### Key Metrics to Track

1. **Cache Hit Ratio**: % of requests served from cache
   - Target: > 80%
   - If < 50%: Increase TTL
   - If > 90%: Can decrease TTL slightly

2. **Latency**: Average response time per region
   - Target: < 200ms
   - If > 500ms: Increase stale-while-revalidate window

3. **Bytes Served**: Total bandwidth consumption
   - Monitor per region for optimization

### Monitoring Endpoints

Add to your monitoring system:

```bash
# Cache hit ratio
GET /api/metrics/cache-hit-ratio?region=us-east-1

# Latency metrics
GET /api/metrics/latency?region=eu-west-1

# Regional CDN status
GET /api/metrics/cdn-status
```

## Performance Tuning

### For High Traffic Sites

```typescript
// Increase ISR cache
experimental: {
  isrMemoryCacheSize: 500 * 1024 * 1024, // 500MB
  staticGenerationRetryCount: 5, // More retries
}

// Increase stale-while-revalidate window
staleWhileRevalidate: 2592000 // 30 days
```

### For Dynamic Content

```typescript
// Decrease cache TTL
cacheTTL: 300, // 5 minutes

// Use revalidate in page exports
export const revalidate = 300;

// Implement background revalidation
export const dynamic = 'force-dynamic';
```

### For Static Content

```typescript
// Maximum cache time
export const revalidate = false; // Never revalidate
export const dynamic = 'force-static';

// With image optimization
minimumCacheTTL: 31536000, // 1 year
```

## Deployment Instructions

### Vercel Deployment

1. **Set Environment Variables** in Vercel project settings:
   ```
   CDN_US_PRIMARY=your-us-cdn
   CDN_EU_PRIMARY=your-eu-cdn
   CDN_APAC_PRIMARY=your-apac-cdn
   AMP_CACHE_ENABLED=true
   ```

2. **Enable Edge Runtime** for optimal regional distribution:
   ```typescript
   export const runtime = 'edge'; // In API routes
   ```

3. **Configure Vercel Caching** in `vercel.json`:
   ```json
   {
     "routes": [
       {
         "src": "/static/(.*)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         }
       }
     ]
   }
   ```

### Self-hosted / Docker

1. **Build with AMP optimization**:
   ```bash
   npm run build
   ```

2. **Set environment variables**:
   ```bash
   export CDN_US_PRIMARY=cdn-us.example.com
   export AMP_CACHE_ENABLED=true
   ```

3. **Deploy with proper CDN configuration**:
   ```bash
   npm start
   ```

## Troubleshooting

### CDN Proxy Returns 503

**Problem**: CDN servers are unreachable

**Solution**:
1. Check CDN endpoint URLs in environment variables
2. Verify network connectivity to CDN
3. Check CDN authentication headers
4. Review CDN access logs

### Low Cache Hit Ratio

**Problem**: Cache hit ratio below 50%

**Solution**:
1. Increase `cacheTTL` configuration
2. Review `Vary` headers - ensure they're not too broad
3. Check for Set-Cookie headers on static content
4. Implement cache warming for critical paths

### High Latency from Certain Regions

**Problem**: Specific regions experiencing delays

**Solution**:
1. Check regional CDN health
2. Verify secondary CDN is configured correctly
3. Review network routing rules
4. Consider additional CDN edge locations

### AMP Validation Errors

**Problem**: AMP pages failing validation

**Solution**:
1. Run pages through [AMP Validator](https://validator.ampproject.org/)
2. Remove non-AMP JavaScript
3. Ensure proper AMP library includes
4. Check for invalid custom elements

## Best Practices

1. **Always test pre-rendering**: Verify all critical paths are cached
2. **Monitor metrics continuously**: Use auto-tuning for optimization
3. **Implement cache purging**: Clear cache after content updates
4. **Use versioned assets**: Ensures long cache TTL is safe
5. **Implement health checks**: Monitor all CDN endpoints
6. **Document custom paths**: Keep pre-render path list updated
7. **Test failover**: Verify secondary CDN works correctly
8. **Security headers**: Include HSTS, X-Frame-Options, etc.

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [AMP Project Documentation](https://amp.dev/)
- [CDN Best Practices](https://developers.google.com/web/fundamentals/performance/content-delivery)
- [HTTP Caching Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
