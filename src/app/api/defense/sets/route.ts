import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { title, questions, difficulty } = await request.json();

    if (!title || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, questions' },
        { status: 400 }
      );
    }

    // Insert defense question set
    const { data: set, error: setError } = await supabase
      .from('defense_question_sets')
      .insert({
        user_id: userId,
        title,
        difficulty: difficulty || 'moderate',
        question_count: questions.length,
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating defense question set:', setError);
      return NextResponse.json({ error: 'Failed to create set: ' + setError.message }, { status: 500 });
    }

    // Insert individual questions
    const questionsWithSetId = questions.map((q: any) => ({
      set_id: set.id,
      question: q.question,
      category: q.category || 'general',
      difficulty: q.difficulty || 'moderate',
      answer_framework: q.answerFramework || '',
      follow_up_questions: q.followUpQuestions || [],
    }));

    const { error: questionsError } = await supabase
      .from('defense_questions')
      .insert(questionsWithSetId);

    if (questionsError) {
      console.error('Error inserting defense questions:', questionsError);
      return NextResponse.json({ error: 'Failed to save questions: ' + questionsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      setId: set.id,
      questionCount: questions.length,
      message: 'Defense question set saved successfully',
    });
  } catch (error) {
    console.error('Defense question set save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: sets, error } = await supabase
      .from('defense_question_sets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching defense question sets:', error);
      return NextResponse.json({ error: 'Failed to fetch sets: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sets });
  } catch (error) {
    console.error('Defense question sets fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}