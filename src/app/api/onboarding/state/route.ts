import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
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

    // Fetch existing onboarding state
    let { data: onboarding, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no record, create one
    if (error?.code === 'PGRST116') {
      const { data: newOnboarding, error: createError } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: user.id,
          role: 'student',
          current_step: 0,
          setup_score: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating onboarding record:', createError);
        return NextResponse.json(
          { error: 'Failed to create onboarding record' },
          { status: 500 }
        );
      }

      onboarding = newOnboarding;
    } else if (error) {
      console.error('Error fetching onboarding state:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding state' },
        { status: 500 }
      );
    }

    // Calculate if user should see the onboarding modal
    const shouldShow =
      !onboarding.completed_at &&
      (!onboarding.skipped_at ||
        new Date(onboarding.skipped_at).getTime() + 7 * 24 * 60 * 60 * 1000 < Date.now());

    return NextResponse.json({
      onboarding,
      shouldShowOnboarding: shouldShow,
    });
  } catch (error) {
    console.error('Onboarding state error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
