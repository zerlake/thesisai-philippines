import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { title, description, cards, difficulty } = await request.json();

    if (!title || !cards) {
      return NextResponse.json(
        { error: 'Missing required fields: title, cards' },
        { status: 400 }
      );
    }

    // Insert flashcard deck
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: userId,
        title,
        description: description || '',
        difficulty: difficulty || 'medium',
        card_count: cards.length,
      })
      .select()
      .single();

    if (deckError) {
      console.error('Error creating flashcard deck:', deckError);
      return NextResponse.json({ error: 'Failed to create deck: ' + deckError.message }, { status: 500 });
    }

    // Insert individual cards
    const cardsWithDeckId = cards.map((card: any) => ({
      deck_id: deck.id,
      front: card.question,
      back: card.answer,
      card_type: card.type || 'definition',
      next_review: new Date().toISOString(), // Initially review right away
    }));

    const { error: cardsError } = await supabase
      .from('flashcard_cards')
      .insert(cardsWithDeckId);

    if (cardsError) {
      console.error('Error inserting flashcards:', cardsError);
      return NextResponse.json({ error: 'Failed to save cards: ' + cardsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deckId: deck.id,
      cardCount: cards.length,
      message: 'Flashcard deck saved successfully',
    });
  } catch (error) {
    console.error('Flashcard deck save error:', error);
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

    const { data: decks, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcard decks:', error);
      return NextResponse.json({ error: 'Failed to fetch decks: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, decks });
  } catch (error) {
    console.error('Flashcard decks fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}