// proxy.ts
// IMPORTANT: This file is a temporary solution for the Next.js 16 upgrade.
// The authentication logic should be moved closer to the data access layer.
// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#producing-a-response
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  
  // Add security headers to all responses
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy - strict by default
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://cdn.jsdelivr.net; " +
    "connect-src 'self' https: wss: *.supabase.co https://accounts.google.com; " +
    "frame-src 'self' https://accounts.google.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // HSTS header for HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get the session to verify user authentication
  let session = null;
  try {
    const { data: { session: retrievedSession }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn("[Middleware] Session retrieval error:", error.message);
      // If it's a token refresh error, treat as unauthenticated
      if (error.message?.includes("Refresh Token") || error.message?.includes("Invalid")) {
        console.warn("[Middleware] Invalid refresh token, user needs to re-authenticate");
        session = null;
      } else {
        // For other errors, still use the session if available
        session = retrievedSession;
      }
    } else {
      session = retrievedSession;
    }
  } catch (err) {
    console.error("[Middleware] Error getting session:", err);
    session = null;
  }

  // For certain protected routes, require authentication
  const protectedPaths = ['/admin', '/api/composio-mcp'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !session) {
    // Redirect to login for protected routes if not authenticated
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Continue with the request if everything is valid
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};