// src/app/api/admin/referrals/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get referral dashboard data
    const { data, error } = await supabase
      .from('v_recruitment_dashboard')
      .select('*');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ dashboard: data });
  } catch (error) {
    console.error('Error in admin referrals API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { referralId, status } = await request.json();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (!referralId || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('referral_events')
      .update({ 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', referralId)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ referral: data });
  } catch (error) {
    console.error('Error updating referral status:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}