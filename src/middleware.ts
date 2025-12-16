// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for authentication
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rate limiting store (in production, use Redis or similar)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Rate limits configuration
const RATE_LIMITS = {
  'api/ai': { requests: 50, window: 60 * 60 * 1000 }, // 50 requests per hour
  'api/documents': { requests: 100, window: 60 * 60 * 1000 }, // 100 requests per hour
  'api/projects': { requests: 200, window: 60 * 60 * 1000 }, // 200 requests per hour
  'api/research': { requests: 30, window: 60 * 60 * 1000 }, // 30 requests per hour
  'api/feedback': { requests: 100, window: 60 * 60 * 1000 }, // 100 requests per hour
  'api/citations': { requests: 100, window: 60 * 60 * 1000 }, // 100 requests per hour
  'api/default': { requests: 1000, window: 60 * 60 * 1000 }, // 1000 requests per hour
};

export async function middleware(request: NextRequest) {
  // Get the user's identity (IP + User-Agent for anonymous users)
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  request.headers.get('x-real-ip') || 
                  request.ip || 
                  'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Construct rate limit key based on API endpoint
  const path = request.nextUrl.pathname;
  let rateLimitKey = 'api/default';
  
  // Determine which rate limit applies to this endpoint
  if (path.startsWith('/api/ai')) {
    rateLimitKey = 'api/ai';
  } else if (path.startsWith('/api/documents')) {
    rateLimitKey = 'api/documents';
  } else if (path.startsWith('/api/projects')) {
    rateLimitKey = 'api/projects';
  } else if (path.startsWith('/api/research')) {
    rateLimitKey = 'api/research';
  } else if (path.startsWith('/api/feedback')) {
    rateLimitKey = 'api/feedback';
  } else if (path.startsWith('/api/citations')) {
    rateLimitKey = 'api/citations';
  }

  const limitConfig = RATE_LIMITS[rateLimitKey];
  const identity = `${clientIP}:${userAgent}:${path}`;
  
  const currentTime = Date.now();
  const windowStart = Math.floor(currentTime / limitConfig.window) * limitConfig.window;
  
  // Reset counter if window has passed
  if (!rateLimitStore[identity] || rateLimitStore[identity].resetTime < currentTime) {
    rateLimitStore[identity] = {
      count: 0,
      resetTime: windowStart + limitConfig.window
    };
  }
  
  rateLimitStore[identity].count += 1;
  
  // Check if rate limit exceeded
  if (rateLimitStore[identity].count > limitConfig.requests) {
    return new NextResponse(
      JSON.stringify({ 
        error: { 
          message: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: Math.ceil((rateLimitStore[identity].resetTime - currentTime) / 1000)
          }
        } 
      }),
      { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitStore[identity].resetTime - currentTime) / 1000).toString()
        }
      }
    );
  }

  // Check for authentication if accessing protected API routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/api/') &&
                          !request.nextUrl.pathname.includes('auth') &&
                          !request.nextUrl.pathname.includes('public') &&
                          !request.nextUrl.pathname.includes('health');

  if (isProtectedRoute) {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ 
          error: { 
            message: 'Authentication required', 
            code: 'UNAUTHORIZED',
            details: 'Authorization header missing or invalid format' 
          } 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data?.user) {
        return new NextResponse(
          JSON.stringify({ 
            error: { 
              message: 'Invalid or expired token', 
              code: 'INVALID_TOKEN',
              details: error?.message 
            } 
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Add user info to request headers for downstream handlers
      request.headers.set('x-user-id', data.user.id);
      request.headers.set('x-user-email', data.user.email || '');
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ 
          error: { 
            message: 'Authentication service error', 
            code: 'AUTH_ERROR',
            details: (error as Error).message 
          } 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add API-specific headers
  response.headers.set('X-API-Version', '1.0.0');
  response.headers.set('X-Rate-Limit-Remaining', (limitConfig.requests - rateLimitStore[identity].count).toString());
  response.headers.set('X-Rate-Limit-Reset', Math.ceil(rateLimitStore[identity].resetTime / 1000).toString());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/api/:path*',
      has: [
        {
          type: 'header',
          key: 'content-type',
          value: 'application/json',
        },
      ],
    },
    {
      source: '/api/:path*',
      has: [
        {
          type: 'header',
          key: 'accept',
          value: 'application/json',
        },
      ],
    },
    '/api/:path*',
  ],
};