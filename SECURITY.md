# Security Policy

## Overview

This document outlines the security measures implemented in the ThesisAI Philippines application and provides guidelines for maintaining security.

## Security Features Implemented

### 1. Authentication & Authorization

- **Supabase Authentication**: JWT-based authentication with secure session management
- **Role-Based Access Control (RBAC)**: Separate roles for students, advisors, critics, and admins
- **Protected Routes**: Middleware enforces authentication on non-public routes
- **Strong Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### 2. Security Headers

The application implements the following security headers:

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Content-Security-Policy` - Comprehensive CSP to prevent XSS attacks
- `Permissions-Policy` - Restricts browser features

### 3. Input Validation & Sanitization

- **Zod Schema Validation**: All forms use Zod for type-safe validation
- **Input Length Limits**: Maximum lengths enforced on all user inputs
- **Sanitization**: HTML and special characters are sanitized
- **UUID Validation**: Proper validation of UUID parameters

### 4. Rate Limiting

- **Edge Function Rate Limiting**: 10 requests per minute per user by default
- **429 Status Codes**: Proper rate limit responses with retry-after headers
- **Per-User Tracking**: Rate limits tracked by authenticated user ID

### 5. CORS Configuration

- **Strict Origin Validation**: Only whitelisted origins are allowed
- **No Fallback**: Rejects requests from unknown origins
- **Proper Headers**: Includes all necessary CORS headers

### 6. API Security

- **JWT Validation**: All edge functions validate JWT tokens
- **Service Role Key**: Used only on server-side for admin operations
- **Error Handling**: Generic error messages in production to prevent information leakage
- **Webhook Signature Verification**: Coinbase webhooks verify HMAC signatures

### 7. Sensitive Data Protection

- **Environment Variables**: All secrets stored in environment variables
- **Sentry Data Filtering**: Sensitive headers and cookies removed from error reports
- **No Hardcoded Secrets**: All API keys and secrets use environment variables

### 8. Monitoring & Logging

- **Sentry Integration**: Error tracking and performance monitoring
- **Reduced Sampling in Production**: 10% trace sampling to reduce costs
- **Console Logging**: Important security events logged for audit

## Environment Variables Required

The following environment variables must be set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Coinbase Commerce
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
COINBASE_COMMERCE_API_KEY=your_api_key

# SerpAPI (optional)
SERPAPI_API_KEY=your_serpapi_key
```

## Best Practices for Developers

### 1. Never Commit Secrets

- Always use environment variables for sensitive data
- Check `.gitignore` includes `.env*` files
- Use `.env.example` for documentation

### 2. Validate All Inputs

```typescript
import { sanitizeInput, MAX_INPUT_LENGTH } from '@/lib/security-utils'

const userInput = sanitizeInput(input, MAX_INPUT_LENGTH)
```

### 3. Use Proper Error Handling

```typescript
try {
  // Your code
} catch (error) {
  console.error("Detailed error for logs:", error)
  // Return generic error to user
  return { error: "An error occurred. Please try again." }
}
```

### 4. Implement Rate Limiting

```typescript
const rateLimit = checkRateLimit(user.id)
if (!rateLimit.allowed) {
  return { error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter }
}
```

### 5. Validate Authentication

```typescript
const { data: { user } } = await supabase.auth.getUser(jwt)
if (!user) {
  return { error: 'Authentication required' }
}
```

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to the development team
3. Include detailed information about the vulnerability
4. Allow reasonable time for the issue to be fixed before public disclosure

## Security Checklist for New Features

- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Authentication required
- [ ] Authorization checks in place
- [ ] Error messages are generic in production
- [ ] Sensitive data not logged
- [ ] CORS properly configured
- [ ] Environment variables used for secrets
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize user input)

## Known Security Considerations

### 1. Row Level Security (RLS)

Ensure Supabase RLS policies are properly configured for all tables:

- Profiles table: Users can only read/update their own profile
- Documents table: Users can only access their own documents
- Advisor assignments: Proper role checks in place

### 2. Client-Side Supabase Client

The Supabase client uses the ANON_KEY on the client side. This is secure as long as:

- RLS policies are properly configured
- Service role key is never exposed to the client
- JWT tokens are validated on the server

### 3. Third-Party APIs

When integrating third-party APIs:

- Always validate responses
- Never trust user input sent to APIs
- Implement timeouts to prevent hanging requests
- Monitor API usage to detect abuse

## Regular Security Maintenance

### Monthly Tasks

- Review and update dependencies
- Check for security advisories
- Review access logs for suspicious activity
- Update rate limit configurations if needed

### Quarterly Tasks

- Security audit of new features
- Review and update CSP policies
- Check RLS policies
- Update this security documentation

### Annual Tasks

- Full security penetration testing
- Review all authentication flows
- Update password policies if needed
- Review all third-party integrations

## Compliance

### Data Privacy

- User data is stored in Supabase (GDPR compliant)
- Passwords are hashed by Supabase Auth
- Personal data can be exported/deleted upon request

### Security Standards

- OWASP Top 10 considerations addressed
- HTTPS enforced on all connections
- Secure cookie flags enabled
- Session management follows best practices

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Last Updated

This security policy was last updated: 2024-11-17

## Version

Version: 1.0.0
