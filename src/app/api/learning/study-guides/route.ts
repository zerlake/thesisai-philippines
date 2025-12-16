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

    // Get study guide data for the user
    // In a real implementation, this would aggregate real data from study guide interactions
    const { data: guides, error: guideError } = await supabase
      .from('study_guides')
      .select('*')
      .eq('user_id', userId);

    if (guideError) {
      console.error('Error fetching study guides:', guideError);
    }

    // For now, return mock data that would realistically come from analytics calculations
    const mockData = {
      completionByGuide: [
        { guide: 'Research Methods', completion: Math.floor(Math.random() * 25) + 75 },
        { guide: 'Literature Review', completion: Math.floor(Math.random() * 25) + 75 },
        { guide: 'Analysis', completion: Math.floor(Math.random() * 25) + 75 },
        { guide: 'Conclusion', completion: Math.floor(Math.random() * 25) + 75 },
      ],
      pagesRead: Math.floor(Math.random() * 200) + 50,
      notesTaken: Math.floor(Math.random() * 100) + 10,
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Study guide data fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}