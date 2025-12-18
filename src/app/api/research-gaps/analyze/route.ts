/**
 * API Route: AI-Powered Research Gap Analysis
 * POST /api/research-gaps/analyze
 * 
 * Analyzes a research gap using advanced AI techniques
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ResearchGapAnalyzer, ResearchGapAnalysisRequest, AIGapAnalysis } from '@/lib/ai/research-gap-analyzer';
import { ResearchGap } from '@/types/researchGap';

interface AnalysisRequestBody extends ResearchGapAnalysisRequest {
  gap: ResearchGap;
  saveAnalysis?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AnalysisRequestBody = await request.json();
    
    if (!body.gap) {
      return NextResponse.json(
        { error: 'Missing required field: gap' },
        { status: 400 }
      );
    }

    // Create analyzer instance
    const analyzer = new ResearchGapAnalyzer();

    // Perform analysis
    const analysis = await analyzer.analyzeGap({
      gap: body.gap,
      literature: body.literature,
      context: body.context,
      analysisDepth: body.analysisDepth || 'standard'
    });

    // Save analysis if requested
    if (body.saveAnalysis) {
      const { error: saveError } = await supabase
        .from('research_gap_analyses')
        .insert({
          user_id: user.id,
          thesis_id: (body.gap as any).thesisId || null,
          gap_id: body.gap.id,
          analysis_type: 'comprehensive',
          analysis_depth: body.analysisDepth || 'standard',
          
          // SWOT Analysis
          strengths: analysis.analysis.strengths,
          weaknesses: analysis.analysis.weaknesses,
          opportunities: analysis.analysis.opportunities,
          threats: analysis.analysis.threats,
          overall_assessment: analysis.analysis.overallAssessment,
          
          // Dimension Scores
          specificity_score: analysis.dimensions.specificity.score,
          specificity_feedback: analysis.dimensions.specificity.feedback,
          novelty_score: analysis.dimensions.novelty.score,
          novelty_feedback: analysis.dimensions.novelty.feedback,
          feasibility_score: analysis.dimensions.feasibility.score,
          feasibility_feedback: analysis.dimensions.feasibility.feedback,
          significance_score: analysis.dimensions.significance.score,
          significance_feedback: analysis.dimensions.significance.feedback,
          literature_alignment_score: analysis.dimensions.literatureAlignment.score,
          literature_alignment_feedback: analysis.dimensions.literatureAlignment.feedback,
          
          // Depth Analysis
          literature_gaps: analysis.depthAnalysis.literatureGaps,
          methodological_gaps: analysis.depthAnalysis.methodologicalGaps,
          temporal_gaps: analysis.depthAnalysis.temporalGaps,
          geographic_gaps: analysis.depthAnalysis.geographicGaps,
          population_gaps: analysis.depthAnalysis.populationGaps,
          
          // Research Impact
          theoretical_contribution: analysis.researchImpact.theoreticalContribution,
          practical_application: analysis.researchImpact.practicalApplication,
          innovation_level: analysis.researchImpact.innovationLevel,
          beneficiaries: analysis.researchImpact.beneficiaries,
          scalability: analysis.researchImpact.scalability,
          
          // Defense Preparation
          defense_questions: analysis.defensePrep.keyQuestions,
          potential_challenges: analysis.defensePrep.potentialChallenges,
          preparation_strategy: analysis.defensePrep.preparationStrategy,
          defense_readiness_score: analysis.defensePrep.defenseReadinessScore,
          
          // Recommendations
          gap_refinements: analysis.recommendations.refinements,
          literature_sources: analysis.recommendations.literatureSources,
          methodology_advice: analysis.recommendations.methodologyAdvice,
          collaboration_opportunities: analysis.recommendations.collaborationOpportunities,
          
          // Confidence Metrics
          analysis_confidence: analysis.confidence.analysisConfidence,
          data_quality: analysis.confidence.dataQuality,
          completeness: analysis.confidence.completeness,
          
          // Context
          field_of_study: body.context?.fieldOfStudy,
          geographic_scope: body.context?.geographicScope,
          timeframe: body.context?.timeframe,
          target_population: body.context?.targetPopulation
        });

      if (saveError) {
        console.error('Error saving analysis:', saveError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing research gap:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze research gap',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve saved analysis for a gap
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get gap_id from query params
    const { searchParams } = new URL(request.url);
    const gapId = searchParams.get('gapId');

    if (!gapId) {
      return NextResponse.json(
        { error: 'Missing required parameter: gapId' },
        { status: 400 }
      );
    }

    // Retrieve analysis from database
    const { data, error } = await supabase
      .from('research_gap_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('gap_id', gapId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
