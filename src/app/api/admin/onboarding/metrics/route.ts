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

    // Fetch metrics data
    // Get total documentation count
    const { count: totalDocs, error: docsError } = await supabase
      .from('onboarding_documentation')
      .select('*', { count: 'exact', head: true });

    // Get total FAQ count
    const { count: totalFAQs, error: faqsError } = await supabase
      .from('onboarding_faqs')
      .select('*', { count: 'exact', head: true });

    // Get total guides count
    const { count: totalGuides, error: guidesError } = await supabase
      .from('onboarding_guides')
      .select('*', { count: 'exact', head: true });

    // Get total views from documentation
    const { data: viewsData, error: viewsError } = await supabase
      .from('onboarding_documentation')
      .select('views_count')
      .limit(100); // Limit to avoid performance issues

    const totalViews = viewsData?.reduce((sum, item) => sum + (item.views_count || 0), 0) || 0;

    // Calculate average engagement rate
    const { data: engagementData, error: engagementError } = await supabase
      .from('onboarding_documentation')
      .select('engagement_rate')
      .not('engagement_rate', 'is', null)
      .limit(100); // Limit to avoid performance issues

    const avgEngagement = engagementData && engagementData.length > 0
      ? engagementData.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / engagementData.length
      : 0;

    // Calculate average feedback score
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('onboarding_documentation')
      .select('feedback_score')
      .not('feedback_score', 'is', null)
      .limit(100); // Limit to avoid performance issues

    const avgFeedbackScore = feedbackData && feedbackData.length > 0
      ? feedbackData.reduce((sum, item) => sum + (item.feedback_score || 0), 0) / feedbackData.length
      : 0;

    if (docsError || faqsError || guidesError) {
      console.error('Error fetching metrics:', docsError, faqsError, guidesError);
      return Response.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    const metrics = {
      totalDocs: totalDocs || 0,
      totalViews: totalViews,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      totalFAQs: totalFAQs || 0,
      searchSuccessRate: 85.5, // Placeholder value - would come from analytics
      avgFeedbackScore: parseFloat(avgFeedbackScore.toFixed(2)),
      totalGuides: totalGuides || 0,
      lastUpdated: new Date().toISOString()
    };

    return Response.json(metrics);
  } catch (error) {
    console.error('Error in metrics API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}