// src/app/api/learning/insights/route.ts

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

    // In a real implementation, this would analyze actual user data
    // For now, we'll generate realistic AI-powered insights
    const mockInsights = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Struggling with methodology questions',
        description: 'AI analysis shows difficulty with methodology defense questions. Consider more practice.',
        actionItems: [
          'Focus on methodology Q&A practice',
          'Review methodology literature',
          'Schedule focused practice session'
        ],
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'achievement',
        title: '7-day learning streak achieved!',
        description: 'You\'ve maintained consistent learning for 7 consecutive days.',
        actionItems: [
          'Keep up the consistency',
          'Consider setting a new streak record'
        ],
        priority: 'low',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 3,
        type: 'warning',
        title: 'Low retention on Chapter 4 concepts',
        description: 'AI analysis indicates retention rate for Chapter 4 is below 70%.',
        actionItems: [
          'Review Chapter 4 flashcards',
          'Schedule focused review session',
          'Focus on areas with lowest retention'
        ],
        priority: 'high',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 4,
        type: 'recommendation',
        title: 'Time to review Chapter 1 concepts',
        description: 'Based on spaced repetition algorithm, Chapter 1 is due for review.',
        actionItems: [
          'Review Chapter 1 flashcards',
          'Take practice quiz',
          'Apply concepts to current work'
        ],
        priority: 'medium',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
      {
        id: 5,
        type: 'opportunity',
        title: 'High performance in research findings',
        description: 'Your performance in findings-related questions is exceptional.',
        actionItems: [
          'Leverage this strength in defense',
          'Consider helping others in study group',
          'Focus on building on this strength'
        ],
        priority: 'medium',
        createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      }
    ];

    return NextResponse.json({ 
      success: true, 
      insights: mockInsights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

// POST endpoint to dismiss an insight
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { insightId, action } = await request.json();

    if (!insightId) {
      return NextResponse.json({ error: 'Missing insight ID' }, { status: 400 });
    }

    // In a real implementation, this would update the insight status in the database
    // For this mock implementation, we'll just return success
    return NextResponse.json({ 
      success: true,
      message: `Insight ${insightId} ${action === 'dismiss' ? 'dismissed' : 'handled'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling insight:', error);
    return NextResponse.json({ error: 'Failed to handle insight' }, { status: 500 });
  }
}