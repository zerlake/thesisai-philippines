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

    const body = await req.json();
    const {
      role,
      thesis_title,
      institution,
      degree_level,
      field_of_study,
      target_defense_semester,
      language = 'en',
      guidance_intensity,
      help_topics = [],
      setupScore = 0,
    } = body;

    // Update onboarding record
    const { error: updateError } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        role,
        thesis_title,
        institution,
        degree_level,
        field_of_study,
        target_defense_semester,
        language,
        guidance_intensity,
        help_topics,
        setup_score: setupScore,
        completed_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('Error saving onboarding:', updateError);
      return NextResponse.json(
        { error: 'Failed to save onboarding' },
        { status: 500 }
      );
    }

    // Auto-create first thesis project if title provided
    if (thesis_title) {
      const { error: projectError } = await supabase
        .from('thesis_projects')
        .insert({
          user_id: user.id,
          title: thesis_title,
          institution,
          field_of_study,
          defense_semester: target_defense_semester,
          language,
          degree_level,
          status: 'in_progress',
        });

      if (projectError) {
        console.warn('Warning: Could not auto-create thesis project:', projectError);
        // Don't fail the onboarding completion if project creation fails
      }
    }

    // Award "Explorer" badge
    try {
      // Get badge ID for 'explorer'
      const { data: badge } = await supabase
        .from('achievement_badges')
        .select('id')
        .eq('code', 'explorer')
        .single();

      if (badge) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            badge_id: badge.id,
          })
          .select();
      }
    } catch (badgeError) {
      console.warn('Warning: Could not award badge:', badgeError);
      // Don't fail the onboarding if badge award fails
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
