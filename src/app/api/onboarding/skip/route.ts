import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark onboarding as skipped (7 days from now)
    const { error } = await supabase
      .from('user_onboarding')
      .update({
        skipped_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error skipping onboarding:', error);
      return NextResponse.json(
        { error: 'Failed to skip onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding skipped for 7 days',
    });
  } catch (error) {
    console.error('Skip onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
