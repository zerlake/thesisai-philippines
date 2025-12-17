// src/app/api/learning/defense/route.ts

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

    // In a real implementation, this would query the database for defense question analytics
    // For now, we'll return mock data based on realistic defense preparation metrics
    const mockDefenseData = {
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
      totalQuestions: Math.floor(Math.random() * 100) + 50,
      completedSessions: Math.floor(Math.random() * 20) + 5,
      avgScore: Math.floor(Math.random() * 30) + 70,
      hoursPracticed: Math.floor(Math.random() * 30) + 10,
      weakAreas: ['Methodology', 'Implications'].slice(0, Math.floor(Math.random() * 2) + 1),
    };

    return NextResponse.json({ 
      success: true, 
      data: mockDefenseData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching defense data:', error);
    return NextResponse.json({ error: 'Failed to fetch defense data' }, { status: 500 });
  }
}

// POST endpoint to update defense practice data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { action, setId, questionId, responseTime, score, feedback } = await request.json();

    // In a real implementation, this would update user defense practice data in the database
    // For now, we'll return mock success response
    if (action === 'practice-session') {
      // Log the practice session data
      console.log(`Practice session for set ${setId}, question ${questionId}, score ${score}`);
      
      return NextResponse.json({
        success: true,
        message: `Practice session recorded for question ${questionId}`,
        sessionRecorded: true,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'create-set') {
      // Create a new defense question set
      return NextResponse.json({
        success: true,
        message: 'Defense question set created successfully',
        setId: `set-${Date.now()}`,
        questionCount: 5, // Default number of questions
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating defense data:', error);
    return NextResponse.json({ error: 'Failed to update defense data' }, { status: 500 });
  }
}