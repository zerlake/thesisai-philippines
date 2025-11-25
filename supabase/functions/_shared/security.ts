/**
 * Shared security utilities for Supabase Functions
 * Provides validation, sanitization, and security checks
 */

/**
 * Validates URL to prevent SSRF attacks
 */
export function validateURL(
  url: string,
  allowedDomains: string[] = [Deno.env.get("SERPAPI_ENDPOINT") || 'serpapi.com']
): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes input to prevent injection attacks
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
 * Validates search query
 */
export function validateSearchQuery(query: string): string {
  const sanitized = sanitizeInput(query, 500);
  
  // Allow alphanumeric, spaces, and common punctuation
  if (!/^[a-zA-Z0-9\s\-.:()'"&%?]*$/.test(sanitized)) {
    throw new Error('Search query contains invalid characters');
  }

  return sanitized;
}

/**
 * Validates JWT token format
 */
export function validateJWT(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64urlRegex.test(part));
}

/**
 * Creates a safe error response
 */
export function createSafeErrorResponse(error: unknown, isDevelopment: boolean = false): string {
  let errorMessage = 'An unexpected error occurred';

  if (error instanceof Error) {
    if (isDevelopment) {
      errorMessage = error.message;
    } else {
      // Don't leak detailed error messages in production
      if (error.message.includes('JWT') || error.message.includes('auth')) {
        errorMessage = 'Authentication failed';
      } else if (error.message.includes('API')) {
        errorMessage = 'External service error';
      } else if (error.message.includes('validation') || error.message.includes('Input')) {
        errorMessage = 'Invalid input provided';
      } else {
        errorMessage = 'An error occurred processing your request';
      }
    }
  }

  return errorMessage;
}

/**
 * Validates metadata to prevent prototype pollution
 */
export function validateMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata must be an object');
  }

  const validated: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
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

/**
 * Validates user ID format
 */
export function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') {
    return false;
  }

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

/**
 * Validates plan name
 */
export function validatePlan(plan: string): string {
  if (!plan || typeof plan !== 'string') {
    throw new Error('Plan must be a string');
  }

  const validPlans = ['free', 'basic', 'pro', 'premium', 'enterprise'];
  const normalized = plan.toLowerCase().trim();

  if (!validPlans.includes(normalized)) {
    throw new Error(`Invalid plan. Allowed plans: ${validPlans.join(', ')}`);
  }

  return normalized;
}

/**
 * Validates numeric amount
 */
export function validateAmount(amount: unknown): number {
  const num = Number(amount);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Amount must be a valid number');
  }

  if (num < 0) {
    throw new Error('Amount must be non-negative');
  }

  return num;
}
