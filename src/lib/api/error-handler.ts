// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (err: any) => {
  console.error('API Error:', err);
  
  if (err instanceof ApiError) {
    return NextResponse.json(
      { 
        error: { 
          message: err.message,
          code: err.code,
          details: err.details 
        }
      },
      { status: err.statusCode }
    );
  }

  // Handle validation errors from Zod
  if (err?.name === 'ZodError') {
    return NextResponse.json(
      { 
        error: { 
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: err.errors 
        }
      },
      { status: 400 }
    );
  }

  // Handle database errors
  if (err?.code?.startsWith('23')) { // Integrity constraint violations
    return NextResponse.json(
      { 
        error: { 
          message: 'Data integrity error',
          code: 'INTEGRITY_ERROR',
          details: err.message 
        }
      },
      { status: 400 }
    );
  }

  // Handle authentication errors
  if (err?.statusCode === 401 || err?.message.includes('auth')) {
    return NextResponse.json(
      { 
        error: { 
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          details: err.message 
        }
      },
      { status: 401 }
    );
  }

  // Handle authorization errors
  if (err?.statusCode === 403 || err?.message.includes('permission')) {
    return NextResponse.json(
      { 
        error: { 
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          details: err.message 
        }
      },
      { status: 403 }
    );
  }

  // Handle not found errors
  if (err?.statusCode === 404) {
    return NextResponse.json(
      { 
        error: { 
          message: 'Resource not found',
          code: 'NOT_FOUND',
          details: err.message 
        }
      },
      { status: 404 }
    );
  }

  // Default error
  return NextResponse.json(
    { 
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    },
    { status: 500 }
  );
};