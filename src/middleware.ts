import { NextRequest, NextResponse } from 'next/server';
import {
  generateAmpCacheHeaders,
  getOptimalRegion,
  DEFAULT_AMP_CONFIG,
} from '@/lib/amp-cache-optimizer';

/**
 * Middleware for AMP cache optimization and geographic routing
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Determine if this is an AMP page request
  const isAmpPage = request.nextUrl.searchParams.has('amp');

  // Get geolocation data from Cloudflare or other headers
  const cfCountry = request.headers.get('cf-ipcountry');
  const cfLat = request.headers.get('cf-latitude');
  const cfLon = request.headers.get('cf-longitude');

  // Determine optimal region for this request
  const region = getOptimalRegion(
    cfCountry || undefined,
    cfLat ? parseFloat(cfLat) : undefined,
    cfLon ? parseFloat(cfLon) : undefined
  );

  // Generate appropriate cache headers
  const cacheHeaders = generateAmpCacheHeaders(
    isAmpPage,
    !pathname.startsWith('/api')
  );

  // Apply cache headers
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add regional routing headers
  response.headers.set('X-Served-By-Region', region);
  response.headers.set('X-Client-Country', cfCountry || 'unknown');

  // Add AMP link header if not already AMP
  if (!isAmpPage && DEFAULT_AMP_CONFIG.enabled) {
    const ampUrl = new URL(request.url);
    ampUrl.searchParams.set('amp', '1');
    response.headers.set('Link', `<${ampUrl.toString()}>; rel="amphtml"`);
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add timing headers for monitoring
  response.headers.set('X-Response-Time', new Date().toISOString());

  return response;
}

/**
 * Configure which routes should use this middleware
 */
export const config = {
  matcher: [
    // Include all routes except:
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
