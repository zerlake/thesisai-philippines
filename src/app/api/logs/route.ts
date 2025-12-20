import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { logs } = await request.json();

    if (!Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs format' }, { status: 400 });
    }

    const supabaseForInsert = createServerSupabaseClient();

    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      context: log.context || null,
      user_id: log.userId || null,
      stack_trace: log.stackTrace || null,
      url: log.url || null,
      user_agent: log.userAgent || null,
    }));

    const { error } = await supabaseForInsert.from('logs').insert(formattedLogs);

    if (error) {
      console.error('[Logs API] Failed to insert logs:', error);
      return NextResponse.json({ error: 'Failed to save logs', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: logs.length });
  } catch (error) {
    console.error('[Logs API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify authentication
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Logs API] Failed to fetch logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    console.error('[Logs API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Verify authentication and admin role for log deletion
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete logs
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - only admins can delete logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const before = searchParams.get('before');

    if (!before) {
      return NextResponse.json({ error: 'Missing before parameter' }, { status: 400 });
    }

    const { error } = await supabase
      .from('logs')
      .delete()
      .lt('timestamp', before);

    if (error) {
      console.error('[Logs API] Failed to delete logs:', error);
      return NextResponse.json({ error: 'Failed to delete logs', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Logs API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
