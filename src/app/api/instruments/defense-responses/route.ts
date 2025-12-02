// src/app/api/instruments/defense-responses/route.ts
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth';
import { createClient } from '@/lib/supabase/server';

interface GenerateResponseRequest {
  instrumentId: string;
  questionType: 'content' | 'construct' | 'reliability' | 'validity' | 'methodology';
  questionText?: string;
  customInstructions?: string;
}

interface DefenseResponseData {
  questionType: string;
  questionText: string;
  aiGeneratedResponse: string;
  keyPoints: string[];
  citations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body: GenerateResponseRequest = await request.json();

    if (!body.instrumentId || !body.questionType) {
      return Response.json(
        { error: 'Missing required fields: instrumentId, questionType' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch instrument details
    const { data: instrument, error: fetchError } = await supabase
      .from('instrument_validity')
      .select('*')
      .eq('id', body.instrumentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !instrument) {
      return Response.json(
        { error: 'Instrument not found' },
        { status: 404 }
      );
    }

    // Generate question and response
    const questionText =
      body.questionText ||
      generateCommonQuestion(body.questionType, instrument.instrument_type);

    const responseData = generateDefenseResponse(
      body.questionType,
      questionText,
      instrument,
      body.customInstructions
    );

    // Save response to database
    const { data, error: saveError } = await supabase
      .from('defense_responses')
      .insert({
        instrument_id: body.instrumentId,
        user_id: user.id,
        question_type: body.questionType,
        question_text: questionText,
        ai_generated_response: responseData.aiGeneratedResponse,
        is_customized: !!body.customInstructions,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Database error:', saveError);
      return Response.json(
        { error: 'Failed to save defense response' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      responseId: data.id,
      response: responseData,
    });
  } catch (error) {
    console.error('Error generating defense response:', error);
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

function generateCommonQuestion(
  questionType: string,
  instrumentType: string
): string {
  const commonQuestions: Record<string, Record<string, string>> = {
    content: {
      survey:
        'How did you ensure content validity of your survey instrument?',
      interview:
        'How did you validate the relevance of your interview questions?',
      default:
        'How did you ensure content validity of your instrument?',
    },
    construct: {
      survey:
        'What measures did you take to establish construct validity?',
      interview:
        'How did you ensure your questions measure the intended constructs?',
      default: 'How did you establish construct validity?',
    },
    reliability: {
      survey:
        'What is the Cronbach alpha coefficient of your instrument?',
      interview:
        'How did you ensure dependability and consistency in your data collection?',
      default: 'How did you ensure reliability of your instrument?',
    },
    validity: {
      survey: 'Can you explain the different validity types you tested?',
      interview:
        'How did you address credibility, dependability, and transferability?',
      default: 'What is your overall validity approach?',
    },
    methodology: {
      survey: 'Why did you choose a survey methodology?',
      interview:
        'What are the advantages of using interviews for your research?',
      default: 'How does your instrument fit your research design?',
    },
  };

  return (
    commonQuestions[questionType]?.[instrumentType] ||
    commonQuestions[questionType]?.default ||
    'Tell us about your instrument design and validation process.'
  );
}

function generateDefenseResponse(
  questionType: string,
  questionText: string,
  instrument: Record<string, unknown>,
  customInstructions?: string
): DefenseResponseData {
  const basePrompt = `Question: ${questionText}

Instrument: ${instrument.instrument_name}
Type: ${instrument.instrument_type}
${customInstructions ? `\nAdditional context: ${customInstructions}` : ''}

Generate a confident, academically rigorous response that:
1. Directly addresses the question
2. Provides specific evidence (e.g., pilot test results, statistical measures)
3. References validated instruments or established methodologies
4. Anticipates follow-up questions`;

  // Simulate Puter AI response generation
  const responses: Record<string, Partial<DefenseResponseData>> = {
    content: {
      aiGeneratedResponse:
        'To ensure content validity, I conducted a systematic review of relevant literature to identify key constructs and items. I then had three subject matter experts review the instrument using a Content Validity Index (CVI) approach. Each expert rated the relevance of items on a 4-point scale. Items achieving a CVI of 0.78 or higher were retained. Additionally, I conducted a pilot study with 40 respondents to ensure clarity and comprehensibility of items. This multi-stage approach aligns with established validity frameworks in education research.',
      keyPoints: [
        'Literature-based item development',
        'Expert review using CVI methodology',
        'Pilot testing for clarity',
        'CVI threshold of 0.78',
      ],
      citations: [
        'Lawshe (1975) - Content Validity Ratio',
        'Davis (1992) - Content Validity Index',
      ],
    },
    construct: {
      aiGeneratedResponse:
        'Construct validity was established through multiple approaches. First, I performed exploratory factor analysis on pilot data to confirm the factor structure hypothesized from theory. Additionally, I calculated convergent validity by correlating my instrument with an established measure of the same construct (r = 0.73, p < 0.01). For discriminant validity, I verified low correlations with theoretically unrelated measures. These evidence points demonstrate that the instrument measures what it claims to measure.',
      keyPoints: [
        'Exploratory factor analysis conducted',
        'Convergent validity confirmed (r = 0.73)',
        'Discriminant validity verified',
        'Theoretical alignment verified',
      ],
      citations: [
        'Kline (2005) - Factor Analysis',
        'Campbell & Fiske (1959) - Convergent & Discriminant Validity',
      ],
    },
    reliability: {
      aiGeneratedResponse:
        'Internal consistency reliability was assessed using Cronbach alpha, which yielded a coefficient of 0.87 across the full scale, indicating strong internal consistency (α > 0.70 is acceptable). Test-retest reliability was examined by administering the instrument to a subset of 25 participants two weeks apart, yielding an intraclass correlation coefficient of 0.81. These values meet or exceed the recommended thresholds for social science research, ensuring that the instrument produces reliable measurements.',
      keyPoints: [
        "Cronbach's alpha = 0.87 (strong internal consistency)",
        'Test-retest ICC = 0.81 (good temporal stability)',
        'Both exceed recommended thresholds',
        'Reliable across multiple administrations',
      ],
      citations: [
        'Cronbach (1951) - Internal Consistency',
        'Koo & Li (2016) - ICC Interpretation',
      ],
    },
    validity: {
      aiGeneratedResponse:
        'I addressed validity through a comprehensive framework: (1) Content validity via expert review and pilot testing; (2) Construct validity via factor analysis and convergent/discriminant validity checks; (3) Criterion-related validity by correlating with performance measures; and (4) External validity by recruiting a diverse, representative sample. This multi-pronged approach aligns with contemporary validity frameworks that view validity as a unified concept rather than isolated components.',
      keyPoints: [
        'Comprehensive validity framework applied',
        'Multiple validity types addressed',
        'Sample diversity ensured external validity',
        'Aligned with modern validity theory',
      ],
      citations: [
        'Messick (1995) - Unified Validity Framework',
      ],
    },
    methodology: {
      aiGeneratedResponse:
        'I selected this instrument design because it aligns with my research paradigm and research questions. The instrument allows for systematic measurement of [construct], providing quantifiable data that answers my research questions efficiently. Furthermore, the instrument has established reliability and validity in similar contexts (Philippine education setting), reducing measurement error. The scalability of this approach also allows for a larger sample size compared to qualitative alternatives, strengthening generalizability.',
      keyPoints: [
        'Methodological alignment with research questions',
        'Established validity in similar contexts',
        'Efficiency and scalability advantages',
        'Reduces measurement error',
      ],
      citations: [
        'Adapted from [Original Author/Year]',
      ],
    },
  };

  return (
    responses[questionType] || {
      aiGeneratedResponse:
        'This response will be generated based on your specific instrument details when using Puter AI integration.',
      keyPoints: [],
      citations: [],
    }
  ) as DefenseResponseData;
}
