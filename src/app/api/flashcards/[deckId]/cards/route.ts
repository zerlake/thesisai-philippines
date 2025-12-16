import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { deckId } = await params;
    const { cards } = await request.json();

    // Verify that the deck belongs to the user
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: 'Deck not found or unauthorized' }, { status: 404 });
    }

    const cardsWithDeckId = cards.map((card: any) => ({
      deck_id: deckId,
      front: card.question,
      back: card.answer,
      card_type: card.type || 'definition',
      next_review: new Date().toISOString(),
    }));

    const { error: cardsError } = await supabase
      .from('flashcard_cards')
      .insert(cardsWithDeckId);

    if (cardsError) {
      console.error('Error inserting flashcards:', cardsError);
      return NextResponse.json({ error: 'Failed to save cards: ' + cardsError.message }, { status: 500 });
    }

    // Update card count in the deck
    const { error: updateError } = await supabase
      .from('flashcard_decks')
      .update({ card_count: cards.length })
      .eq('id', deckId);

    if (updateError) {
      console.error('Error updating deck card count:', updateError);
      // This is non-critical, so don't return an error
    }

    return NextResponse.json({
      success: true,
      cardCount: cards.length,
      message: 'Cards added to deck successfully',
    });
  } catch (error) {
    console.error('Flashcard cards save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { deckId } = await params;

    // Verify that the deck belongs to the user
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: 'Deck not found or unauthorized' }, { status: 404 });
    }

    const { data: cards, error } = await supabase
      .from('flashcard_cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching flashcard cards:', error);
      return NextResponse.json({ error: 'Failed to fetch cards: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Flashcard cards fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}