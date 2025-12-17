// src/app/api/learning/progress/route.ts

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // In a real implementation, this would query actual progress data
    // For now, we'll return mock data that would be realistic
    const mockProgressData = {
      estimatedReadiness: Math.floor(Math.random() * 30) + 65, // 65-95%
      learningVelocity: parseFloat((Math.random() * 2 + 1.5).toFixed(1)), // 1.5-3.5%/week
      daysSinceStart: Math.floor(Math.random() * 30) + 10, // 10-40 days
      totalReviews: Math.floor(Math.random() * 100) + 20, // 20-120 reviews
      averageSuccess: Math.floor(Math.random() * 30) + 70, // 70-100%
      consistencyScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      sessionFrequency: parseFloat((Math.random() * 2 + 1.5).toFixed(1)), // 1.5-3.5 sessions/day
      avgSessionLength: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      topicsMastered: Math.floor(Math.random() * 15) + 5, // 5-20 topics
      areasNeedingWork: Math.floor(Math.random() * 5) + 1, // 1-5 areas
    };

    return NextResponse.json({ 
      success: true, 
      data: mockProgressData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
  }
}