// src/app/api/ai-tools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Schema for getting AI tools
const getToolsSchema = z.object({
  category: z.enum(['writing', 'research', 'formatting', 'defense', 'analysis', 'editing']).optional(),
  featured: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

// Helper functions for standardized responses
function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json({ 
    success: true, 
    data, 
    ...(message && { message }) 
  }, { status });
}

function createErrorResponse(message: string, status: number, code?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        message, 
        code,
        ...(process.env.NODE_ENV === 'development' && { timestamp: new Date().toISOString() })
      } 
    },
    { status }
  );
}

// GET /api/ai-tools
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      // For non-authenticated users, we can still return public tools
      console.info('Unauthenticated request for AI tools list');
    }

    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as any || undefined;
    const featured = url.searchParams.get('featured') === 'true' || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));

    // Build query for AI tools
    let query = supabase
      .from('ai_tools')
      .select(`
        *,
        ai_tool_categories!ai_tools_category_id_fkey (
          id,
          name,
          description
        )
      `, { count: 'exact' })
      .eq('is_active', true) // Only show active tools
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching AI tools:', error);
      return createErrorResponse('Failed to fetch AI tools', 500, 'DATABASE_ERROR');
    }

    // Transform data to match expected format
    const transformedData = data.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.ai_tool_categories ? {
        id: tool.ai_tool_categories.id,
        name: tool.ai_tool_categories.name,
        description: tool.ai_tool_categories.description,
      } : null,
      icon: tool.icon,
      isFeatured: tool.is_featured,
      isPremium: tool.is_premium,
      creditsCost: tool.credits_cost,
      executionTimeEstimate: tool.execution_time_estimate,
      createdAt: tool.created_at,
      updatedAt: tool.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/ai-tools:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// POST /api/ai-tools (for creating new AI tool configurations)
export async function POST(request: NextRequest) {
  try {
    // Extract user ID from auth middleware (likely requires admin/privileged access)
    const userId = request.headers.get('x-user-id');
    
    // In a real implementation, we'd check for admin privileges here
    // For now, we'll just return a not implemented response
    return createErrorResponse('Creating AI tools requires admin privileges', 403, 'FORBIDDEN');
  } catch (error) {
    console.error('Error in POST /api/ai-tools:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}