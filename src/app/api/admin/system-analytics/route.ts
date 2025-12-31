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

    // Fetch system analytics data from Supabase
    const [
      usersResult,
      projectsResult,
      aiRequestsResult,
      completionResult,
      userDistributionResult
    ] = await Promise.all([
      // Total users count
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Active projects count
      supabase
        .from('thesis_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress'),

      // AI requests today
      supabase
        .from('ai_tool_usage')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

      // Completion rate calculation
      supabase
        .from('thesis_projects')
        .select('status'),

      // User distribution by role
      supabase
        .from('profiles')
        .select('role')
    ]);

    const { data: usersData, error: usersError, count: usersCount } = usersResult;
    const { data: projectsData, error: projectsError, count: projectsCount } = projectsResult;
    const { data: aiRequestsData, error: aiRequestsError, count: aiRequestsCount } = aiRequestsResult;
    const { data: completionData, error: completionError } = completionResult;
    const { data: userDistributionData, error: userDistributionError } = userDistributionResult;

    // Log errors for debugging but continue with available data
    if (usersError) {
      console.error('Error fetching users count:', usersError);
    }

    if (projectsError) {
      console.error('Error fetching projects count:', projectsError);
    }

    if (aiRequestsError) {
      console.error('Error fetching AI requests count:', aiRequestsError);
    }

    if (completionError) {
      console.error('Error fetching completion data:', completionError);
    }

    if (userDistributionError) {
      console.error('Error fetching user distribution:', userDistributionError);
    }

    // Calculate completion rate
    let completionRate = 0;
    if (completionData && completionData.length > 0) {
      const totalProjects = completionData.length;
      const completedProjects = completionData.filter(p => p.status === 'approved' || p.status === 'submitted' || p.status === 'published').length;
      completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    }

    // Calculate user distribution
    const userDistribution = userDistributionData?.reduce((acc, profile) => {
      const role = profile.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalUsers = usersCount || 0;
    const studentsCount = userDistribution.user || 0;
    const advisorsCount = userDistribution.advisor || 0;
    const criticsCount = userDistribution.critic || 0;
    const adminsCount = userDistribution.admin || 0;

    const response = {
      totalUsers: usersCount || 0,
      activeProjects: projectsCount || 0,
      aiRequestsToday: aiRequestsCount || 0,
      completionRate,
      studentsCount,
      advisorsCount,
      criticsCount,
      adminsCount,
      studentsPercentage: totalUsers > 0 ? Math.round((studentsCount / totalUsers) * 100) : 0,
      advisorsPercentage: totalUsers > 0 ? Math.round((advisorsCount / totalUsers) * 100) : 0,
      criticsPercentage: totalUsers > 0 ? Math.round((criticsCount / totalUsers) * 100) : 0,
      adminsPercentage: totalUsers > 0 ? Math.round((adminsCount / totalUsers) * 100) : 0,
      timestamp: new Date().toISOString()
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error in system analytics API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}