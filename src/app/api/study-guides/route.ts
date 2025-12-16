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
    const { title, executiveSummary, sections, keyTerms, studyTips, citationsList, estimatedReadingTime } = await request.json();

    if (!title || !sections) {
      return NextResponse.json(
        { error: 'Missing required fields: title, sections' },
        { status: 400 }
      );
    }

    // Insert study guide
    const { data: guide, error: guideError } = await supabase
      .from('study_guides')
      .insert({
        user_id: userId,
        title,
        executive_summary: executiveSummary,
        estimated_reading_time: estimatedReadingTime,
        section_count: sections.length,
        term_count: keyTerms?.length || 0,
      })
      .select()
      .single();

    if (guideError) {
      console.error('Error creating study guide:', guideError);
      return NextResponse.json({ error: 'Failed to create guide: ' + guideError.message }, { status: 500 });
    }

    // Insert sections
    const sectionsWithGuideId = sections.map((section: any, index: number) => ({
      guide_id: guide.id,
      heading: section.heading,
      content: section.content,
      key_points: section.keyPoints || [],
      review_questions: section.reviewQuestions || [],
      section_order: index,
    }));

    const { error: sectionsError } = await supabase
      .from('study_guide_sections')
      .insert(sectionsWithGuideId);

    if (sectionsError) {
      console.error('Error inserting study guide sections:', sectionsError);
      return NextResponse.json({ error: 'Failed to save sections: ' + sectionsError.message }, { status: 500 });
    }

    // Insert key terms if provided
    if (keyTerms && keyTerms.length > 0) {
      const termsWithGuideId = keyTerms.map((term: any) => ({
        guide_id: guide.id,
        term: term.term,
        definition: term.definition,
      }));

      const { error: termsError } = await supabase
        .from('study_guide_terms')
        .insert(termsWithGuideId);

      if (termsError) {
        console.error('Error inserting study guide terms:', termsError);
        return NextResponse.json({ error: 'Failed to save terms: ' + termsError.message }, { status: 500 });
      }
    }

    // Insert study tips if provided
    if (studyTips && studyTips.length > 0) {
      const tipsWithGuideId = studyTips.map((tip: string, index: number) => ({
        guide_id: guide.id,
        tip_text: tip,
        tip_order: index,
      }));

      const { error: tipsError } = await supabase
        .from('study_guide_tips')
        .insert(tipsWithGuideId);

      if (tipsError) {
        console.error('Error inserting study guide tips:', tipsError);
        return NextResponse.json({ error: 'Failed to save tips: ' + tipsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      guideId: guide.id,
      sectionCount: sections.length,
      message: 'Study guide saved successfully',
    });
  } catch (error) {
    console.error('Study guide save error:', error);
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

    const { data: guides, error } = await supabase
      .from('study_guides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study guides:', error);
      return NextResponse.json({ error: 'Failed to fetch guides: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, guides });
  } catch (error) {
    console.error('Study guides fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}