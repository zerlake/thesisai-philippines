export const MAX_INPUT_LENGTH = 50000
export const MAX_TITLE_LENGTH = 500
export const MAX_FIELD_LENGTH = 200
export const MAX_SHORT_TEXT = 1000

export function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`)
  }
  
  return input.trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

export function isRateLimitExceeded(
  lastRequestTime: number | null,
  minInterval: number = 1000
): boolean {
  if (!lastRequestTime) return false
  return Date.now() - lastRequestTime < minInterval
}

export const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true }
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    }
  }
  
  record.count += 1
  return { allowed: true }
}

export function maskSensitiveData(data: string): string {
  return data.replace(/[a-zA-Z0-9]/g, '*')
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'development') {
      return error.message
    }
    return 'An error occurred. Please try again later.'
  }
  return 'An unknown error occurred.'
}
