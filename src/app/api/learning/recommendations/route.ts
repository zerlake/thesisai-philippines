// src/app/api/learning/recommendations/route.ts

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/ai/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get recommendations from our AI engine
    const recommendations = await recommendationEngine.generateRecommendations(userId);

    return NextResponse.json({ 
      success: true, 
      recommendations,
      timestamp: new Date().toISOString(),
      count: recommendations.length
    });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

// POST endpoint to get recommendations with custom parameters
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { context, limit } = await request.json();

    // Get recommendations from our AI engine with specific context
    // In a real implementation, we would use the context to influence recommendations
    const recommendations = await recommendationEngine.generateRecommendations(userId);

    // Apply limit if specified
    const limitedRecommendations = limit ? recommendations.slice(0, limit) : recommendations;

    return NextResponse.json({ 
      success: true, 
      recommendations: limitedRecommendations,
      timestamp: new Date().toISOString(),
      count: limitedRecommendations.length
    });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}