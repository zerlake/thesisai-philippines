// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, paginatedResponse } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/error-handler';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define schemas locally since we need to import them differently
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().max(50, 'Last name too long').optional(),
  role: z.enum(['student', 'advisor', 'critic', 'admin']).default('student'),
  universityId: z.string().uuid('Invalid university ID').optional(),
  academicLevel: z.enum(['undergraduate', 'master', 'doctoral', 'faculty']).optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
});

const updateUserSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  role: z.enum(['student', 'advisor', 'critic', 'admin']).optional(),
  universityId: z.string().uuid('Invalid university ID').optional(),
  academicLevel: z.enum(['undergraduate', 'master', 'doctoral', 'faculty']).optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/users/me
export async function GET(request: NextRequest) {
  try {
    // This would be handled by middleware which adds x-user-id to headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return errorResponse('Failed to fetch user profile', 500, 'DATABASE_ERROR');
    }

    if (!profile) {
      return errorResponse('User profile not found', 404, 'NOT_FOUND');
    }

    // Sanitize sensitive information before returning
    const sanitizedProfile = {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      role: profile.role,
      universityId: profile.universityId,
      college: profile.college,
      department: profile.department,
      academicLevel: profile.academicLevel,
      graduationYear: profile.graduationYear,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      timezone: profile.timezone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };

    return successResponse(sanitizedProfile, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/users/me:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// POST /api/users (for creating additional user data)
export async function POST(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Parse request body
    const requestBody = await request.json();
    
    // Validate input
    const validatedData = createUserSchema.parse(requestBody);

    // Prepare profile data with the authenticated user ID
    const profileData = {
      id: userId, // Use authenticated user ID
      email: validatedData.email,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName || '',
      role: validatedData.role,
      university_id: validatedData.universityId,
      academic_level: validatedData.academicLevel,
      graduation_year: validatedData.graduationYear,
      updated_at: new Date().toISOString()
    };

    // Upsert user profile (insert or update if exists)
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profileData], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating profile:', error);
      
      // Check if it's a constraint violation
      if (error.code === '23505') {
        return errorResponse('A user with this email already exists', 400, 'DUPLICATE_EMAIL');
      }
      
      return errorResponse('Failed to create user profile', 500, 'DATABASE_ERROR');
    }

    return successResponse(data, 'User profile created/updated successfully');
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Handle Zod validation errors
      return validationErrorResponse((error as any).issues);
    }
    
    console.error('Error in POST /api/users:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// PUT /api/users/me
export async function PUT(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Parse request body
    const requestBody = await request.json();
    
    // Add user ID to request body for validation
    const requestData = { id: userId, ...requestBody };
    
    // Validate input
    const validatedData = updateUserSchema.parse(requestData);

    // Prepare update data (exclude ID from update)
    const { id, ...updateData } = validatedData;
    
    // Convert field names to snake_case to match database
    const dbUpdateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      dbUpdateData[snakeKey] = value;
    }
    
    // Add updated_at timestamp
    dbUpdateData.updated_at = new Date().toISOString();

    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific error cases
      if (error.code === '23505') { // Unique violation
        return errorResponse('Email already in use', 400, 'EMAIL_DUPLICATE');
      }
      
      return errorResponse('Failed to update user profile', 500, 'DATABASE_ERROR');
    }

    // Sanitize response data
    const sanitizedUpdatedProfile = {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: data.full_name,
      role: data.role,
      universityId: data.university_id,
      college: data.college,
      department: data.department,
      academicLevel: data.academic_level,
      graduationYear: data.graduation_year,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      timezone: data.timezone,
      updatedAt: data.updated_at
    };

    return successResponse(sanitizedUpdatedProfile, 'User profile updated successfully');
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Handle Zod validation errors
      return validationErrorResponse((error as any).issues);
    }
    
    console.error('Error in PUT /api/users/me:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// DELETE /api/users/me (account deletion would be handled separately for security)
export async function DELETE(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return errorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // In a real implementation, we'd:
    // 1. Mark account as deleted instead of hard deleting
    // 2. Remove sensitive data while keeping audit trail
    // 3. Cancel any subscriptions
    // 4. Notify related parties
    
    // For now, we'll return a method not allowed since we don't want to implement
    // full account deletion in this example
    return errorResponse('Account deletion endpoint not implemented', 405, 'METHOD_NOT_ALLOWED');
  } catch (error) {
    console.error('Error in DELETE /api/users/me:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}