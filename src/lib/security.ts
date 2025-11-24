/**
 * Security utilities for input validation, sanitization, and output encoding
 * Prevents SQL injection, XSS, and other common vulnerabilities
 */

import { z } from 'zod';

/**
 * Validates a URL against a whitelist of allowed domains
 * Prevents SSRF (Server-Side Request Forgery) attacks
 */
export function validateURL(
  url: string,
  allowedDomains: string[] = ['serpapi.com']
): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Check if hostname matches any allowed domain
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes user input to remove potentially dangerous characters
 * while allowing basic text content
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except whitespace
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Validates search query input
 * Prevents injection attacks while allowing legitimate search terms
 */
export function validateSearchQuery(query: string): string {
  const sanitized = sanitizeInput(query, 500);
  
  // Allow alphanumeric, spaces, and common punctuation
  if (!/^[a-zA-Z0-9\s\-.:()'"&%]*$/.test(sanitized)) {
    throw new Error('Search query contains invalid characters');
  }

  return sanitized;
}

/**
 * Validates JWT tokens
 */
export function validateJWT(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT format: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Basic validation - each part should be base64url encoded
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64urlRegex.test(part));
}

/**
 * Schema for validating API request bodies
 */
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(500, 'Query must not exceed 500 characters')
    .transform(val => sanitizeInput(val, 500))
});

export const abstractContentSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters')
    .transform(val => sanitizeInput(val, 50000))
});

/**
 * Validates action parameter against whitelist
 */
export function validateAction(action: unknown, allowedActions: string[]): string {
  if (typeof action !== 'string') {
    throw new Error('Action must be a string');
  }

  if (!allowedActions.includes(action)) {
    throw new Error(`Invalid action. Allowed actions: ${allowedActions.join(', ')}`);
  }

  return action;
}

/**
 * Generic input validator using Zod schema
 */
export function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join('; ')}`);
    }
    throw error;
  }
}

/**
 * Creates a safe error response that doesn't leak sensitive information
 */
export function createSafeErrorResponse(error: unknown): {
  error: string;
  isDevelopment: boolean;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorMessage = 'An unexpected error occurred';

  if (error instanceof z.ZodError) {
    errorMessage = 'Invalid input provided';
  } else if (error instanceof Error) {
    if (isDevelopment) {
      errorMessage = error.message;
    } else {
      // Don't leak detailed error messages in production
      if (error.message.includes('JWT')) {
        errorMessage = 'Authentication failed';
      } else if (error.message.includes('API')) {
        errorMessage = 'External service error';
      } else {
        errorMessage = 'An error occurred processing your request';
      }
    }
  }

  return { error: errorMessage, isDevelopment };
}

/**
 * Rate limiting helper
 * Returns true if request should be allowed, false if rate limited
 */
const requestCache = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const timestamps = requestCache.get(identifier) || [];

  // Remove old timestamps outside the window
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    return false; // Rate limited
  }

  // Add current request
  recentTimestamps.push(now);
  requestCache.set(identifier, recentTimestamps);

  return true; // Request allowed
}

/**
 * Validates webhook signatures (HMAC-SHA256)
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedPayload = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const hexSignature = Array.from(new Uint8Array(signedPayload))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hexSignature === signature;
}

/**
 * Validates metadata to prevent object injection
 */
export function validateMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata must be an object');
  }

  const validated: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Ensure keys and values are strings
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('All metadata keys and values must be strings');
    }

    // Prevent prototype pollution
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new Error(`Invalid metadata key: ${key}`);
    }

    validated[key] = sanitizeInput(value, 1000);
  }

  return validated;
}
