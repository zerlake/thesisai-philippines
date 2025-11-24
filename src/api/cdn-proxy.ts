import { NextRequest, NextResponse } from 'next/server';

interface CDNConfig {
  primary: string;
  secondary: string;
  cache_ttl: number;
}

// Regional CDN configuration
const CDN_CONFIG: Record<string, CDNConfig> = {
  'us-east-1': {
    primary: process.env.CDN_US_PRIMARY || 'cdn-us.example.com',
    secondary: process.env.CDN_US_SECONDARY || 'cdn-us-backup.example.com',
    cache_ttl: 3600,
  },
  'eu-west-1': {
    primary: process.env.CDN_EU_PRIMARY || 'cdn-eu.example.com',
    secondary: process.env.CDN_EU_SECONDARY || 'cdn-eu-backup.example.com',
    cache_ttl: 3600,
  },
  'ap-southeast-1': {
    primary: process.env.CDN_APAC_PRIMARY || 'cdn-apac.example.com',
    secondary: process.env.CDN_APAC_SECONDARY || 'cdn-apac-backup.example.com',
    cache_ttl: 3600,
  },
};

// Determine region from request headers
function getRegion(request: NextRequest): string {
  const cloudflareCountry = request.headers.get('cf-ipcountry');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  
  // Map country codes to CDN regions
  if (cloudflareCountry) {
    if (['US', 'CA', 'MX'].includes(cloudflareCountry)) return 'us-east-1';
    if (['GB', 'DE', 'FR', 'IE'].includes(cloudflareCountry)) return 'eu-west-1';
    if (['AU', 'SG', 'JP', 'IN'].includes(cloudflareCountry)) return 'ap-southeast-1';
  }
  
  // Default to US
  return 'us-east-1';
}

// Fetch from CDN with fallback
async function fetchFromCDN(
  path: string,
  region: string,
  request: NextRequest,
  attempt: number = 0
): Promise<Response | null> {
  const config = CDN_CONFIG[region];
  if (!config) return null;
  
  const cdnUrl = attempt === 0 ? config.primary : config.secondary;
  
  try {
    const response = await fetch(`https://${cdnUrl}${path}`, {
      headers: {
        'Cache-Control': `max-age=${config.cache_ttl}`,
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) return response;
    
    // Try fallback if primary fails and we haven't already
    if (attempt === 0 && config.secondary) {
      return fetchFromCDN(path, region, request, 1);
    }
    
    return null;
  } catch (error) {
    // Try secondary CDN on error
    if (attempt === 0 && config.secondary) {
      return fetchFromCDN(path, region, request, 1);
    }
    return null;
  }
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || '/';
  const region = getRegion(request);
  
  try {
    // Attempt to fetch from regional CDN
    const cdnResponse = await fetchFromCDN(path, region, request);
    
    if (cdnResponse) {
      const headers = new Headers(cdnResponse.headers);
      
      // Add AMP cache headers
      headers.set('X-Amp-Cache', 'true');
      headers.set('X-CDN-Region', region);
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
      
      return new NextResponse(cdnResponse.body, {
        status: cdnResponse.status,
        headers,
      });
    }
    
    // Return 404 if CDN is unreachable
    return NextResponse.json(
      { error: 'CDN unreachable' },
      { status: 503 }
    );
  } catch (error) {
    console.error('CDN proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const preferredRegion = 'auto';
