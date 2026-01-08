import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role') || 'student';
    const step = searchParams.get('step');
    const variant = searchParams.get('variant') || 'control';

    let query = supabase
      .from('onboarding_content')
      .select('*')
      .eq('role', role)
      .eq('active', true)
      .eq('variant', variant);

    if (step) {
      query = query.eq('step_number', parseInt(step));
    }

    const { data: content, error } = await query.order('step_number', {
      ascending: true,
    });

    if (error) {
      console.error('Error fetching onboarding content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: content || [],
    });
  } catch (error) {
    console.error('Onboarding content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
