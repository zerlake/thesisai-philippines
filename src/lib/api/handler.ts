// src/lib/api/handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { errorHandler, ApiError } from './error-handler';

// Base handler interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// HTTP methods enum
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

// Request context
export interface RequestContext {
  userId: string;
  userEmail: string;
  role: string;
  projectId?: string;
}

// API Handler function type
export type ApiHandler<T = any> = (
  req: NextRequest,
  ctx: { params: Record<string, string> },
  context: RequestContext
) => Promise<NextResponse<ApiResponse<T>>>;

// Higher-order function to create API endpoints with common functionality
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: {
    requireAuth?: boolean;
    requireRole?: string[];
    rateLimit?: {
      windowMs: number;
      max: number;
    };
  } = {}
) {
  return async (req: NextRequest, ctx: { params: Record<string, string> }) => {
    try {
      // Extract user context from middleware (added by our middleware)
      const userId = req.headers.get('x-user-id');
      const userEmail = req.headers.get('x-user-email');
      
      // If auth is required but not present, throw error
      if (options.requireAuth && (!userId || !userEmail)) {
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
      }

      // Create request context
      const context: RequestContext = {
        userId: userId || '',
        userEmail: userEmail || '',
        role: 'user', // This would be determined from the user profile in a real implementation
      };

      // Add project ID if present in params
      if (ctx.params.id) {
        context.projectId = ctx.params.id;
      }

      // Check role requirements if specified
      if (options.requireRole && options.requireRole.length > 0) {
        if (!options.requireRole.includes(context.role)) {
          throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN');
        }
      }

      // Call the actual handler
      const response = await handler(req, ctx, context);
      
      return response;
    } catch (error) {
      // Use our centralized error handler
      return errorHandler(error);
    }
  };
}

// Utility function to parse request body
export async function parseJsonBody(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    throw new ApiError('Invalid JSON in request body', 400, 'INVALID_JSON');
  }
}

// Utility function to get URL parameters
export function getUrlParams(req: NextRequest) {
  const params = new URLSearchParams(req.nextUrl.search);
  const result: Record<string, string | string[]> = {};
  
  for (const [key, value] of params.entries()) {
    const existing = result[key];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing as string, value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Success response helper
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    },
    { status: 200 }
  );
}

// Error response helper
export function errorResponse(
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details
      }
    },
    { status: statusCode }
  );
}

// Validation error response
export function validationErrorResponse(errors: any[]): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      }
    },
    { status: 400 }
  );
}

// Not found response
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'NOT_FOUND'
      }
    },
    { status: 404 }
  );
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'UNAUTHORIZED'
      }
    },
    { status: 401 }
  );
}

// Forbidden response
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'FORBIDDEN'
      }
    },
    { status: 403 }
  );
}

// Rate limit response
export function rateLimitResponse(message: string = 'Rate limit exceeded'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'RATE_LIMITED'
      }
    },
    { status: 429 }
  );
}

// Standard pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages
      }
    },
    { status: 200 }
  );
}

// Health check endpoint
export async function healthCheckHandler() {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
}

// Generic CRUD operation helpers
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Log the actual error for debugging (but don't expose internal details)
    console.error('API operation error:', error);
    
    throw new ApiError(errorMessage, 500, 'INTERNAL_ERROR');
  }
}

// Authorization helper
export function requireRole(requiredRoles: string[], userRole: string) {
  if (!requiredRoles.includes(userRole)) {
    throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN');
  }
}

// Resource ownership check helper
export function requireOwnership(resourceOwnerId: string, userId: string) {
  if (resourceOwnerId !== userId) {
    throw new ApiError('Resource ownership required', 403, 'FORBIDDEN');
  }
}