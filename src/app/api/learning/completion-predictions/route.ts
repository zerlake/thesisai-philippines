// src/app/api/learning/completion-predictions/route.ts

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { completionPredictor } from '@/lib/ai/predictive/completion-predictor';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get completion prediction from our AI engine
    const prediction = await completionPredictor.predictCompletion(userId);

    // Update the prediction trend in the database
    await completionPredictor.updatePredictionTrend(userId, prediction);

    return NextResponse.json({ 
      success: true, 
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Completion prediction fetch error:', error);
    return NextResponse.json({ error: 'Failed to generate completion prediction' }, { status: 500 });
  }
}

// POST endpoint to get prediction history
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { action } = await request.json();

    if (action === 'history') {
      // Get prediction history
      const history = await completionPredictor.getPredictionHistory(userId);
      
      return NextResponse.json({ 
        success: true, 
        history,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Completion prediction POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}