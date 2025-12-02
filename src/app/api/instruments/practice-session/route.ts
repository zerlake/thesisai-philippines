// src/app/api/instruments/practice-session/route.ts
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

interface PracticeSessionRequest {
  thesisId: string;
  instrumentIds: string[];
  sessionDate?: string;
  durationSeconds?: number;
}

interface PracticeQuestion {
  id: string;
  questionText: string;
  questionType: string;
  expectedPoints: string[];
}

interface PracticeSessionResponse {
  sessionId: string;
  questions: PracticeQuestion[];
  totalQuestions: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body: PracticeSessionRequest = await request.json();

    if (!body.thesisId || !body.instrumentIds || body.instrumentIds.length === 0) {
      return Response.json(
        { error: 'Missing required fields: thesisId, instrumentIds' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch instruments to generate questions
    const { data: instruments, error: fetchError } = await supabase
      .from('instrument_validity')
      .select('*')
      .in('id', body.instrumentIds)
      .eq('user_id', user.id);

    if (fetchError || !instruments || instruments.length === 0) {
      return Response.json(
        { error: 'No instruments found' },
        { status: 404 }
      );
    }

    // Generate practice questions
    const questions = generatePracticeQuestions(instruments);

    // Create practice session record
    const { data: session, error: sessionError } = await supabase
      .from('defense_practice_sessions')
      .insert({
        user_id: user.id,
        thesis_id: body.thesisId,
        session_date: body.sessionDate || new Date().toISOString(),
        duration_seconds: body.durationSeconds,
        total_questions: questions.length,
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('Database error:', sessionError);
      return Response.json(
        { error: 'Failed to create practice session' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      sessionId: session.id,
      questions,
      totalQuestions: questions.length,
    } as PracticeSessionResponse);
  } catch (error) {
    console.error('Error creating practice session:', error);
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

function generatePracticeQuestions(
  instruments: Record<string, unknown>[]
): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  const questionTemplates = getQuestionTemplates();

  instruments.forEach((instrument, index) => {
    const instrumentType = instrument.instrument_type as string;
    const templates = questionTemplates[instrumentType] || questionTemplates.default;

    // Select 2-3 random questions per instrument
    const selectedTemplates = templates
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.random() > 0.5 ? 2 : 3);

    selectedTemplates.forEach((template) => {
      questions.push({
        id: `q_${index}_${Math.random().toString(36).substr(2, 9)}`,
        questionText: template.question,
        questionType: template.type,
        expectedPoints: template.expectedPoints,
      });
    });
  });

  return questions;
}

function getQuestionTemplates(): Record<string, Array<{
  question: string;
  type: string;
  expectedPoints: string[];
}>> {
  return {
    survey: [
      {
        question: 'How did you establish content validity for your survey?',
        type: 'content',
        expectedPoints: [
          'Literature review',
          'Expert panel review',
          'Pilot testing',
          'Item clarity verification',
        ],
      },
      {
        question: 'What is the Cronbach alpha coefficient of your instrument?',
        type: 'reliability',
        expectedPoints: [
          'Specific alpha value (≥0.70)',
          'Interpretation of value',
          'Sample size used',
          'Implications for reliability',
        ],
      },
      {
        question: 'How did you ensure construct validity?',
        type: 'construct',
        expectedPoints: [
          'Factor analysis results',
          'Convergent validity evidence',
          'Discriminant validity evidence',
          'Theoretical alignment',
        ],
      },
      {
        question: 'Describe your pilot testing process.',
        type: 'methodology',
        expectedPoints: [
          'Sample size',
          'Duration',
          'Modifications made',
          'Lessons learned',
        ],
      },
    ],
    interview: [
      {
        question: 'How did you establish credibility in your interview study?',
        type: 'validity',
        expectedPoints: [
          'Member checking',
          'Prolonged engagement',
          'Triangulation',
          'Reflexivity measures',
        ],
      },
      {
        question: 'What steps did you take to ensure dependability?',
        type: 'reliability',
        expectedPoints: [
          'Audit trail documentation',
          'Detailed methodology description',
          'Consistent data collection procedures',
          'Code-recode reliability',
        ],
      },
      {
        question: 'How did you design your interview protocol?',
        type: 'methodology',
        expectedPoints: [
          'Semi-structured approach',
          'Open-ended questions',
          'Probing questions included',
          'Piloting conducted',
        ],
      },
    ],
    default: [
      {
        question: 'Why did you choose this particular instrument for your research?',
        type: 'methodology',
        expectedPoints: [
          'Alignment with research questions',
          'Evidence of validity',
          'Appropriateness for sample',
          'Feasibility',
        ],
      },
      {
        question: 'What validity evidence did you gather?',
        type: 'validity',
        expectedPoints: [
          'Content validity',
          'Construct validity',
          'Criterion validity',
          'Multiple evidence types',
        ],
      },
      {
        question: 'How did you adapt the instrument for the Philippine context?',
        type: 'methodology',
        expectedPoints: [
          'Language adaptation (English/Tagalog)',
          'Cultural relevance adjustments',
          'Expert review for adaptation',
          'Pilot testing after adaptation',
        ],
      },
    ],
  };
}
