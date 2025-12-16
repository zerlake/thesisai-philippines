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

    // Get AI insights for the user
    // In a real implementation, this would run AI algorithms on the user's data to generate insights
    const { data: insights, error: insightsError } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false });

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
    }

    // For now, return mock insights that would realistically come from AI analysis
    const mockInsights = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Struggling with methodology questions',
        description: 'Consider more defense practice in the methodology category',
        actionItems: ['Focus on methodology Q&A', 'Review examples', 'Schedule practice session'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'achievement',
        title: '7-day learning streak!',
        description: 'You\'ve maintained consistent learning for a full week',
        actionItems: ['Keep it up!', 'Set new streak record'],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 3,
        type: 'warning',
        title: 'Low retention on Chapter 4 concepts',
        description: 'Your retention rate for Chapter 4 is below average',
        actionItems: ['Review flashcards for Chapter 4', 'Schedule review session', 'Focus on weak areas'],
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 4,
        type: 'recommendation',
        title: 'Time to review Chapter 1 concepts',
        description: 'Based on spaced repetition algorithm, Chapter 1 needs review',
        actionItems: ['Review Chapter 1 flashcards', 'Take practice test', 'Apply concepts to thesis'],
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ];

    return NextResponse.json(mockInsights);
  } catch (error) {
    console.error('Insights fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { insightId, action } = await request.json();

    if (!insightId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle different actions (dismiss, implement, etc.)
    if (action === 'dismiss') {
      // In a real implementation, we would update the insight as dismissed in the database
      // const { error } = await supabase
      //   .from('learning_insights')
      //   .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      //   .eq('id', insightId)
      //   .eq('user_id', userId);
      
      // if (error) {
      //   console.error('Error dismissing insight:', error);
      //   return NextResponse.json({ error: 'Failed to dismiss insight' }, { status: 500 });
      // }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Insight action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}