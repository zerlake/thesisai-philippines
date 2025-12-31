// src/app/api/referrals/code/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral code
    const { data, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ referralCode: data.referral_code });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}