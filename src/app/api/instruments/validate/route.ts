// src/app/api/instruments/validate/route.ts
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

interface ValidateInstrumentRequest {
  thesisId: string;
  instrumentName: string;
  instrumentType: 'survey' | 'questionnaire' | 'interview' | 'focus-group' | 'observation';
  description?: string;
  content: string;
}

interface ValidationResponse {
  success: boolean;
  validityGaps: string[];
  suggestions: string[];
  metrics: Record<string, unknown>;
  defensePoints: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body: ValidateInstrumentRequest = await request.json();

    if (!body.thesisId || !body.instrumentName || !body.instrumentType || !body.content) {
      return Response.json(
        { error: 'Missing required fields: thesisId, instrumentName, instrumentType, content' },
        { status: 400 }
      );
    }

    // Simulate Puter AI validation (in production, call actual Puter AI service)
    const validationResult = generateValidationAnalysis(body);

    // Save to database
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('instrument_validity')
      .insert({
        thesis_id: body.thesisId,
        user_id: user.id,
        instrument_name: body.instrumentName,
        instrument_type: body.instrumentType,
        description: body.description || '',
        metrics_json: validationResult.metrics,
        validity_type: extractValidityTypes(validationResult),
        defense_scripts: generateDefenseScript(body, validationResult),
        validation_date: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { error: 'Failed to save instrument validity record' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      instrumentId: data.id,
      validation: validationResult,
    });
  } catch (error) {
    console.error('Error validating instrument:', error);
    if (error instanceof AuthenticationError) {
      return Response.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateValidationAnalysis(body: ValidateInstrumentRequest): ValidationResponse {
  const gaps: string[] = [];
  const suggestions: string[] = [];
  const metrics: Record<string, unknown> = {};
  const defensePoints: string[] = [];

  // Analyze instrument type-specific requirements
  if (body.instrumentType === 'survey' || body.instrumentType === 'questionnaire') {
    metrics.contentValidity = checkContentValidity(body.content);
    metrics.internalConsistency = 'pending_pilot_testing';
    metrics.constructValidity = 'pending_factor_analysis';

    if (!body.content.toLowerCase().includes('likert')) {
      gaps.push('Consider using Likert scale for better construct validity');
    }
    if (!body.content.toLowerCase().includes('demographic')) {
      suggestions.push('Add demographic questions for analysis');
    }

    defensePoints.push(
      'Instrument adapted from established literature',
      'Content validity established through expert review',
      'Cronbach alpha coefficient ≥ 0.70 required for internal consistency',
      'Pilot tested with minimum 30-50 respondents'
    );
  } else if (body.instrumentType === 'interview' || body.instrumentType === 'focus-group') {
    metrics.credibility = 'member_checking_recommended';
    metrics.dependability = 'detailed_audit_trail_required';
    metrics.transferability = 'thick_description_required';

    if (!body.content.toLowerCase().includes('semi-structured')) {
      suggestions.push('Consider semi-structured format for consistency');
    }
    if (!body.content.toLowerCase().includes('follow-up')) {
      gaps.push('Include probing/follow-up questions');
    }

    defensePoints.push(
      'Questions designed to explore participant perspectives',
      'Credibility established through member checking',
      'Dependability ensured via detailed audit trail',
      'Transferability enhanced through thick description'
    );
  }

  return {
    success: true,
    validityGaps: gaps,
    suggestions,
    metrics,
    defensePoints,
  };
}

function checkContentValidity(content: string): Record<string, unknown> {
  const itemCount = (content.match(/question|item|question \d+/gi) || []).length;
  return {
    estimatedItemCount: itemCount || 'unknown',
    requiresExpertReview: true,
    contentValidityIndexTarget: 0.78,
  };
}

function extractValidityTypes(result: ValidationResponse): string[] {
  const types: string[] = [];
  if (result.metrics.contentValidity) types.push('content');
  if (result.metrics.constructValidity) types.push('construct');
  if (result.metrics.internalConsistency) types.push('internal_consistency');
  if (result.metrics.credibility) types.push('credibility');
  if (result.metrics.dependability) types.push('dependability');
  return types.length > 0 ? types : ['content', 'construct'];
}

function generateDefenseScript(body: ValidateInstrumentRequest, result: ValidationResponse): string {
  const lines = [
    `**Defense Script for ${body.instrumentName}**`,
    '',
    '**Validity Claims:**',
  ];

  result.defensePoints.forEach((point) => {
    lines.push(`- ${point}`);
  });

  if (result.suggestions.length > 0) {
    lines.push('', '**Recommended Additions:**');
    result.suggestions.forEach((suggestion) => {
      lines.push(`- ${suggestion}`);
    });
  }

  lines.push(
    '',
    '**Key Metrics:**',
    JSON.stringify(result.metrics, null, 2)
  );

  return lines.join('\n');
}
