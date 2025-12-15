import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user preferences from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('dashboard_notifications')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        {
          dashboardNotifications: {
            enabled: true,
            emailOnSubmission: true,
            emailOnFeedback: true,
            emailOnMilestone: true,
            emailOnGroupActivity: true,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        dashboardNotifications: data?.dashboard_notifications || {
          enabled: true,
          emailOnSubmission: true,
          emailOnFeedback: true,
          emailOnMilestone: true,
          emailOnGroupActivity: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Notification preferences error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dashboardNotifications } = body;

    if (!dashboardNotifications) {
      return NextResponse.json(
        { message: 'Missing dashboardNotifications field' },
        { status: 400 }
      );
    }

    // Update user preferences
    const { data, error } = await supabase
      .from('profiles')
      .update({
        dashboard_notifications: dashboardNotifications,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { message: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Preferences updated successfully',
        dashboardNotifications: data.dashboard_notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
