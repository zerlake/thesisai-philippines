import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get session from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    // Call the Supabase function
    const { data: result, error: functionError } = await supabase
      .functions
      .invoke('manage-onboarding-content', {
        body: { action, data }
      });

    if (functionError) {
      console.error('Error calling Supabase function:', functionError);
      return Response.json({ error: functionError.message }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Error in manage-onboarding-content API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}