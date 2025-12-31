import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action') || undefined;
    const userId = searchParams.get('user_id') || undefined;

    // Query financial audit trail from the database
    let query = supabase
      .from('financial_audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action', action);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching financial audit trail from database:', error);
      return Response.json({ error: 'Failed to fetch audit trail from database' }, { status: 500 });
    }

    // Format the audit logs for the response
    const formattedLogs = data.map(log => ({
      id: log.id,
      action: log.action,
      user_id: log.user_id,
      target_user_id: log.target_user_id,
      timestamp: log.created_at,
      details: log.details ? JSON.stringify(log.details) : `Audit event for ${log.action}`,
      ip_address: log.ip_address || 'unknown',
      user_agent: log.user_agent || 'unknown',
      severity: log.severity,
      resource_type: log.resource_type || 'general',
      resource_id: log.resource_id || 'unknown'
    }));

    return Response.json({
      success: true,
      data: formattedLogs,
      count: formattedLogs.length
    });
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return Response.json({ error: 'Failed to fetch audit trail' }, { status: 500 });
  }
}