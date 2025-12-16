'use client';

import { useCallback, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

interface FlashcardData {
  question: string;
  answer: string;
  type: 'definition' | 'explanation' | 'application' | 'example';
}

interface FlashcardResponse {
  flashcards: FlashcardData[];
  count: number;
  generatedAt: string;
}

const SAMPLE_DATA = {
  flashcards: [
    {
      question: 'What is photosynthesis?',
      answer: 'The process by which plants convert light energy into chemical energy stored in glucose.',
      type: 'definition' as const,
    },
    {
      question: 'How does photosynthesis relate to cellular respiration?',
      answer:
        'Photosynthesis produces glucose and oxygen; cellular respiration breaks down glucose to release energy. They are complementary processes.',
      type: 'explanation' as const,
    },
    {
      question: 'How would you apply photosynthesis knowledge to improve crop yields?',
      answer:
        'By understanding light requirements, CO2 levels, and chlorophyll production, farmers can optimize conditions for increased yields.',
      type: 'application' as const,
    },
    {
      question: 'Provide an example of photosynthesis in nature.',
      answer: 'A maple tree using sunlight to convert water and CO2 into glucose and oxygen during spring growth.',
      type: 'example' as const,
    },
  ],
  count: 4,
  generatedAt: new Date().toISOString(),
};

export function FlashcardGenerator() {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FlashcardResponse | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);

  const generateFlashcards = useCallback(async () => {
    if (!session) {
      toast.error('Please sign in to use this tool');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter thesis content');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate 10-15 flashcard pairs from the following thesis content. 
      
Include 4 types of questions:
- Definition: Basic concept definitions
- Explanation: Deeper understanding questions
- Application: How to apply concepts
- Example: Concrete examples from the content

Format as JSON with this structure:
{
  "flashcards": [
    {"question": "...", "answer": "...", "type": "definition|explanation|application|example"},
    ...
  ],
  "count": number,
  "generatedAt": ISO_DATE
}

Content to process:
${content}`;

      const result = await callPuterAI(prompt, {
        temperature: 0.4,
      });

      const parsed: FlashcardResponse = JSON.parse(result);
      setData(parsed);
      toast.success(`Generated ${parsed.count} flashcard pairs`);
    } catch (error) {
      console.error('Flashcard generation failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate flashcards'
      );
    } finally {
      setLoading(false);
    }
  }, [content, session]);

  const loadSampleData = useCallback(() => {
    setData(SAMPLE_DATA);
    setUseSampleData(true);
    toast.success('Sample data loaded');
  }, []);

  const exportJSON = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  }, [data]);

  const exportCSV = useCallback(() => {
    if (!data) return;
    const headers = ['Question', 'Answer', 'Type'];
    const rows = data.flashcards.map((f) => [
      `"${f.question.replace(/"/g, '""')}"`,
      `"${f.answer.replace(/"/g, '""')}"`,
      f.type,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }, [data]);

  const copyToClipboard = useCallback(async () => {
    if (!data) return;
    const text = data.flashcards
      .map((f) => `Q: ${f.question}\nA: ${f.answer}\nType: ${f.type}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [data]);

  // Load existing decks
  const [decks, setDecks] = useState<any[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    if (!session) return;

    setLoadingDecks(true);
    try {
      const response = await fetch('/api/flashcards/decks');
      const result = await response.json();
      if (response.ok) {
        setDecks(result.decks);
      } else {
        throw new Error(result.error || 'Failed to load decks');
      }
    } catch (error) {
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoadingDecks(false);
    }
  }, [session]);

  // Load specific deck
  const loadDeck = useCallback(async (deckId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/flashcards/${deckId}/cards`);
      const result = await response.json();
      if (response.ok) {
        setData({
          flashcards: result.cards.map((card: any) => ({
            question: card.front,
            answer: card.back,
            type: card.card_type,
          })),
          count: result.cards.length,
          generatedAt: new Date().toISOString(),
        });
        setSelectedDeckId(deckId);
        toast.success('Deck loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load deck');
      }
    } catch (error) {
      toast.error('Failed to load flashcard deck');
    }
  }, [session]);

  const saveToDatabase = useCallback(async () => {
    if (!data) return;
    try {
      const response = await fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Flashcard Deck',
          description: 'Generated flashcards from thesis content',
          cards: data.flashcards,
          difficulty: 'medium'
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Save failed');
      toast.success(`Saved ${result.cardCount} flashcards to your library`);

      // Refresh the deck list after saving
      loadDecks();
    } catch (error) {
      toast.error('Failed to save flashcards to database');
    }
  }, [data, title, loadDecks]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">Flashcard Generator</h2>
        <p className="mb-6 text-muted-foreground">
          Auto-generate Q&A flashcard pairs from your thesis content. Creates 4 types: Definition, Explanation, Application, and Example.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 3 Flashcards"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Thesis Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your thesis content here..."
              rows={6}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateFlashcards}
              disabled={loading || !session}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Flashcards'
              )}
            </Button>
            <Button
              onClick={loadSampleData}
              variant="outline"
            >
              Load Sample
            </Button>
            <Button
              onClick={loadDecks}
              variant="outline"
              disabled={loadingDecks}
            >
              {loadingDecks ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Decks'
              )}
            </Button>
          </div>

          {decks.length > 0 && (
            <div className="mt-4">
              <label className="mb-2 block font-medium">Select Deck to Load</label>
              <div className="flex flex-wrap gap-2">
                {decks.map((deck) => (
                  <Button
                    key={deck.id}
                    variant={selectedDeckId === deck.id ? "default" : "outline"}
                    onClick={() => loadDeck(deck.id)}
                    size="sm"
                  >
                    {deck.title || 'Untitled Deck'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-xl font-bold">Generated Flashcards ({data.count})</h3>

          <div className="mb-6 grid gap-4">
            {data.flashcards.map((card, idx) => (
              <div
                key={idx}
                className="rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">Q: {card.question}</h4>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                    {card.type}
                  </span>
                </div>
                <p className="text-muted-foreground">A: {card.answer}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={exportJSON} variant="outline">
              Export JSON
            </Button>
            <Button onClick={exportCSV} variant="outline">
              Export CSV
            </Button>
            <Button onClick={copyToClipboard} variant="outline">
              Copy to Clipboard
            </Button>
            <Button onClick={saveToDatabase} variant="outline">
              Save to Library
            </Button>
          </div>

          {useSampleData && (
            <div className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-100">
              This is sample data for demonstration. Generate with real content for actual use.
            </div>
          )}
        </div>
      )}

      {!session && (
        <div className="rounded bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100">
          Please sign in to generate flashcards from your thesis content.
        </div>
      )}
    </div>
  );
}
