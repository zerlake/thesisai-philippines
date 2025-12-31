// src/app/api/referrals/history/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get referral history
    const { data, error } = await supabase
      .from('v_user_referral_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ referrals: data });
  } catch (error) {
    console.error('Error fetching referral history:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}