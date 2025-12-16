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

    // Get defense question data for the user
    // In a real implementation, this would aggregate real data from defense practice sessions
    const { data: sets, error: setError } = await supabase
      .from('defense_question_sets')
      .select('*')
      .eq('user_id', userId);

    if (setError) {
      console.error('Error fetching defense question sets:', setError);
    }

    // For now, return mock data that would realistically come from analytics calculations
    const mockData = {
      difficultyProgression: [
        { date: '2025-01-01', moderate: 80, challenging: 60, expert: 40 },
        { date: '2025-01-05', moderate: 85, challenging: 65, expert: 45 },
        { date: '2025-01-10', moderate: 90, challenging: 70, expert: 50 },
        { date: '2025-01-15', moderate: 92, challenging: 75, expert: 55 },
      ],
      avgResponseTime: [
        { category: 'Methodology', time: Math.floor(Math.random() * 20) + 35 },
        { category: 'Findings', time: Math.floor(Math.random() * 20) + 35 },
        { category: 'Implications', time: Math.floor(Math.random() * 20) + 35 },
        { category: 'Limitations', time: Math.floor(Math.random() * 20) + 35 },
      ],
      performanceByCategory: [
        { category: 'Methodology', score: Math.floor(Math.random() * 30) + 70 },
        { category: 'Findings', score: Math.floor(Math.random() * 30) + 70 },
        { category: 'Implications', score: Math.floor(Math.random() * 30) + 70 },
        { category: 'Limitations', score: Math.floor(Math.random() * 30) + 70 },
        { category: 'Critique', score: Math.floor(Math.random() * 30) + 70 },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Defense data fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}