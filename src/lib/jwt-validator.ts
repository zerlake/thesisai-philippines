/**
 * JWT Validation Middleware
 * Validates JWT tokens from Authorization headers
 * Used across API routes for authenticated requests
 */

import { jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * JWT payload structure
 */
export interface AuthPayload extends JWTPayload {
  sub: string; // User ID
  email: string;
  iat: number; // Issued at
  exp: number; // Expires at
}

/**
 * Extract JWT from Authorization header
 * Expected format: "Bearer <token>"
 */
function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Extract JWT from cookies (fallback method)
 * Looks for auth token in cookies
 */
async function extractTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return token || null;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT token signature and expiration
 * Returns payload if valid, null if invalid
 */
export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = process.env.JWT_SECRET || 'development-secret-key';
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    const verified = await jwtVerify(token, secretKey);
    return verified.payload as AuthPayload;
  } catch (error) {
    console.error('JWT verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Extract and validate auth token from request
 * Returns user ID if valid, null if invalid/missing
 */
export async function getAuthUserId(request: NextRequest): Promise<string | null> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader) || (await extractTokenFromCookies());

    if (!token) {
      return null;
    }

    const payload = await verifyAuthToken(token);
    return payload?.sub || null;
  } catch (error) {
    console.error('Auth extraction error:', error);
    return null;
  }
}

/**
 * Validate that request is authenticated
 * Used as middleware in API routes
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string } | null> {
  const userId = await getAuthUserId(request);
  
  if (!userId) {
    return null;
  }

  return { userId };
}

/**
 * Express-style middleware for API route protection
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const auth = await withAuth(req);
 *     if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *     // Use auth.userId
 *   }
 */
export async function withAuth(request: NextRequest): Promise<{ userId: string } | null> {
  return requireAuth(request);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: AuthPayload): boolean {
  if (!payload.exp) return true;
  return Date.now() > payload.exp * 1000;
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationSeconds(payload: AuthPayload): number {
  if (!payload.exp) return 0;
  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
}

/**
 * Validate JWT structure without verifying signature
 * Useful for debugging
 */
export function decodeToken(token: string): AuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return payload as AuthPayload;
  } catch (error) {
    return null;
  }
}
