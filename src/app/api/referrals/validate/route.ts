// src/app/api/referrals/validate/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return Response.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Validate referral code
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role_type')
      .eq('referral_code', referralCode)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    return Response.json({ 
      valid: true, 
      referrer: {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        role: data.role_type
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}