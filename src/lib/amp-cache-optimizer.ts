/**
 * AMP Cache Optimization Module
 * Provides utilities for AMP cache compatibility and pre-rendering optimization
 */

export interface AmpCacheConfig {
  enabled: boolean;
  preRenderPaths: string[];
  cacheTTL: number;
  staleWhileRevalidate: number;
  regions: string[];
}

export const DEFAULT_AMP_CONFIG: AmpCacheConfig = {
  enabled: process.env.AMP_CACHE_ENABLED !== 'false',
  preRenderPaths: [
    '/',
    '/dashboard',
    '/help',
    '/privacy',
    '/terms',
  ],
  cacheTTL: 3600, // 1 hour
  staleWhileRevalidate: 604800, // 7 days
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
};

/**
 * Generate AMP cache headers for optimal distribution
 */
export function generateAmpCacheHeaders(
  isAmpPage: boolean = false,
  isCached: boolean = true
): Record<string, string> {
  const headers: Record<string, string> = {
    'Vary': 'Accept-Encoding, Accept',
    'X-Content-Type-Options': 'nosniff',
  };

  if (isAmpPage) {
    headers['X-Amp-Cache'] = 'true';
    headers['Cache-Control'] = isCached
      ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, max-age=0, must-revalidate';
  } else {
    headers['Cache-Control'] = isCached
      ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, max-age=0, must-revalidate';
  }

  return headers;
}

/**
 * Determine optimal CDN region based on geographic proximity
 */
export function getOptimalRegion(
  clientCountry?: string,
  clientLatitude?: number,
  clientLongitude?: number
): string {
  // Geolocation-based routing
  if (clientCountry) {
    const northAmericaCountries = ['US', 'CA', 'MX'];
    const europeCountries = ['GB', 'DE', 'FR', 'IE', 'ES', 'IT'];
    const asiaCountries = ['AU', 'SG', 'JP', 'IN', 'NZ', 'HK'];

    if (northAmericaCountries.includes(clientCountry)) {
      return 'us-east-1';
    }
    if (europeCountries.includes(clientCountry)) {
      return 'eu-west-1';
    }
    if (asiaCountries.includes(clientCountry)) {
      return 'ap-southeast-1';
    }
  }

  // Fallback to latency-based selection
  if (clientLatitude !== undefined && clientLongitude !== undefined) {
    const usLat = 38.9072; // Virginia
    const euLat = 52.5200; // Berlin
    const apLat = 1.3521; // Singapore

    const usDistance = Math.sqrt(
      Math.pow(clientLatitude - usLat, 2) + Math.pow(clientLongitude - (-77.0369), 2)
    );
    const euDistance = Math.sqrt(
      Math.pow(clientLatitude - euLat, 2) + Math.pow(clientLongitude - 13.4050, 2)
    );
    const apDistance = Math.sqrt(
      Math.pow(clientLatitude - apLat, 2) + Math.pow(clientLongitude - 103.8198, 2)
    );

    const distances = {
      'us-east-1': usDistance,
      'eu-west-1': euDistance,
      'ap-southeast-1': apDistance,
    };

    return Object.entries(distances).reduce((closest, [region, distance]) =>
      distance < distances[closest as keyof typeof distances] ? region : closest
    , 'us-east-1');
  }

  // Default fallback
  return 'us-east-1';
}

/**
 * Calculate optimal cache TTL based on content type
 */
export function calculateCacheTTL(
  contentType: string,
  isStatic: boolean = false
): number {
  if (isStatic) {
    // Static assets: 1 year
    return 31536000;
  }

  switch (contentType) {
    case 'text/html':
      // HTML pages: 1 hour
      return 3600;
    case 'application/json':
      // API responses: 5 minutes
      return 300;
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/avif':
      // Images: 1 month
      return 2592000;
    case 'text/css':
    case 'application/javascript':
    case 'application/wasm':
      // Scripts and styles: 1 month for hashed, 5 min for non-hashed
      return isStatic ? 2592000 : 300;
    default:
      // Default: 1 hour
      return 3600;
  }
}

/**
 * Check if a path should be pre-rendered for AMP caches
 */
export function shouldPreRender(
  path: string,
  config: AmpCacheConfig = DEFAULT_AMP_CONFIG
): boolean {
  if (!config.enabled) return false;

  return config.preRenderPaths.some(preRenderPath => {
    if (preRenderPath === '/') {
      return path === '/' || path.startsWith('/?');
    }
    return path === preRenderPath || path.startsWith(preRenderPath + '/');
  });
}

/**
 * Generate AMP-compatible sitemap URLs
 */
export function generateAmpSitemapUrl(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl);
  url.searchParams.set('amp', '1');
  return url.toString();
}

/**
 * Validate AMP cache headers
 */
export function validateAmpCacheHeaders(
  headers: Record<string, string>
): boolean {
  const cacheControl = headers['cache-control'] || '';
  const ampHeader = headers['x-amp-cache'];

  // Must have proper cache control
  if (!cacheControl.includes('max-age')) {
    return false;
  }

  // If marked as AMP, should have the AMP header
  if (ampHeader === 'true' && !cacheControl.includes('s-maxage')) {
    return false;
  }

  return true;
}

/**
 * Get CDN metrics for monitoring and optimization
 */
export interface CdnMetrics {
  region: string;
  latency: number;
  cacheHitRatio: number;
  bytesServed: number;
  requestCount: number;
}

export function initializeCdnMetrics(region: string): CdnMetrics {
  return {
    region,
    latency: 0,
    cacheHitRatio: 0,
    bytesServed: 0,
    requestCount: 0,
  };
}

/**
 * Update CDN metrics based on response
 */
export function updateCdnMetrics(
  metrics: CdnMetrics,
  responseTime: number,
  cacheHit: boolean,
  contentLength: number
): void {
  metrics.latency = (metrics.latency + responseTime) / 2; // Rolling average
  metrics.cacheHitRatio = cacheHit
    ? (metrics.cacheHitRatio * metrics.requestCount + 1) / (metrics.requestCount + 1)
    : (metrics.cacheHitRatio * metrics.requestCount) / (metrics.requestCount + 1);
  metrics.bytesServed += contentLength;
  metrics.requestCount++;
}

/**
 * Autotune configuration based on metrics
 */
export function autoTuneConfiguration(
  metrics: CdnMetrics[],
  currentConfig: AmpCacheConfig
): AmpCacheConfig {
  // Calculate average metrics across regions
  const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;
  const avgCacheHitRatio = metrics.reduce((sum, m) => sum + m.cacheHitRatio, 0) / metrics.length;

  const tuned = { ...currentConfig };

  // Adjust TTL based on cache hit ratio
  if (avgCacheHitRatio < 0.5) {
    // Low cache hit ratio - increase TTL
    tuned.cacheTTL = Math.min(tuned.cacheTTL * 2, 86400); // Max 24 hours
  } else if (avgCacheHitRatio > 0.9) {
    // High cache hit ratio - can decrease TTL slightly
    tuned.cacheTTL = Math.max(tuned.cacheTTL / 1.5, 600); // Min 10 minutes
  }

  // Adjust SWR based on latency
  if (avgLatency > 500) {
    // High latency - increase stale-while-revalidate
    tuned.staleWhileRevalidate = Math.min(tuned.staleWhileRevalidate * 1.5, 2592000);
  }

  return tuned;
}
