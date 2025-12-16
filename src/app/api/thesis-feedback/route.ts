// src/app/api/thesis-feedback/route.ts

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { thesisFeedbackEngine } from '@/lib/ai/feedback/thesis-feedback-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { 
      documentId, 
      title, 
      content, 
      section, 
      wordCount,
      version = 1,
      criteria
    } = await request.json();

    if (!documentId || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: documentId, content' 
      }, { status: 400 });
    }

    // Validate content length
    if (content.length < 50) {
      return NextResponse.json({ 
        error: 'Content too short for meaningful analysis' 
      }, { status: 400 });
    }

    // Create thesis submission object
    const submission = {
      userId,
      documentId,
      title: title || 'Untitled Thesis Section',
      content,
      section: section || 'General',
      wordCount: wordCount || content.length,
      submissionDate: new Date(),
      version
    };

    // Generate feedback using the AI engine
    const feedback = await thesisFeedbackEngine.generateFeedback(submission, criteria);

    // Save feedback to database
    const { error: saveError } = await supabase
      .from('thesis_feedback')
      .insert({
        user_id: userId,
        document_id: documentId,
        section: section || 'General',
        feedback_data: feedback,
        overall_score: feedback.overallScore,
        generated_at: feedback.generatedAt.toISOString()
      });

    if (saveError) {
      console.error('Error saving feedback:', saveError);
      // Don't fail the request if saving to DB fails, just log it
    }

    return NextResponse.json({
      success: true,
      feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Thesis feedback generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate thesis feedback' 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve feedback history for a document
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const section = searchParams.get('section');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!documentId) {
      return NextResponse.json({ 
        error: 'Document ID is required' 
      }, { status: 400 });
    }

    // Build query based on parameters
    let query = supabase
      .from('thesis_feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .order('generated_at', { ascending: false });

    if (section) {
      query = query.eq('section', section);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback history:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch feedback history' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedbackHistory: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Thesis feedback history fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch thesis feedback history' 
    }, { status: 500 });
  }
}