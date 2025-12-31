import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies or headers
    const token = cookies().get('sb-access-token')?.value;
    
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch FAQ data
    const { data, error } = await supabase
      .from('onboarding_faqs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return Response.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }

    return Response.json({ items: data || [] });
  } catch (error) {
    console.error('Error in FAQ API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}