'use client';

import { useCallback, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

type QuestionCategory = 'methodology' | 'findings' | 'implications' | 'limitations' | 'critique';
type DifficultyLevel = 'moderate' | 'challenging' | 'expert';

interface DefenseQuestion {
  question: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  answerFramework: string;
  followUpQuestions: string[];
}

interface DefenseQuestionsResponse {
  questions: DefenseQuestion[];
  totalCount: number;
  generatedAt: string;
}

const SAMPLE_DATA: DefenseQuestionsResponse = {
  questions: [
    {
      question:
        'If your methodology relies on quantitative analysis, how would you respond to critics who argue qualitative insights were missed?',
      category: 'methodology',
      difficulty: 'challenging',
      answerFramework:
        '1) Acknowledge validity of concern 2) Explain trade-offs of methodology 3) Present evidence of depth 4) Discuss future research directions',
      followUpQuestions: [
        'Can you provide an example from your research?',
        'What would a mixed-methods approach have revealed?',
      ],
    },
    {
      question: 'What are the limitations of your findings and how do they affect broader applicability?',
      category: 'limitations',
      difficulty: 'moderate',
      answerFramework:
        '1) List specific limitations 2) Explain their impact 3) Discuss scope boundaries 4) Suggest mitigation strategies',
      followUpQuestions: [
        'How would you address these limitations in future work?',
        'Do these limitations affect your conclusions?',
      ],
    },
    {
      question:
        'How do your findings challenge or support existing theories in the field, and what are the theoretical implications?',
      category: 'implications',
      difficulty: 'challenging',
      answerFramework:
        '1) Reference key theories 2) Explain alignment/divergence 3) Discuss paradigm implications 4) Suggest theoretical extensions',
      followUpQuestions: [
        'Could your findings reshape the field?',
        'What new questions do your results raise?',
      ],
    },
  ],
  totalCount: 3,
  generatedAt: new Date().toISOString(),
};

const categoryColors: Record<QuestionCategory, string> = {
  methodology: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100',
  findings: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100',
  implications: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100',
  limitations: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100',
  critique: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100',
};

const difficultyColors: Record<DifficultyLevel, string> = {
  moderate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100',
  challenging: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100',
};

export function DefenseQuestionGenerator() {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('challenging');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DefenseQuestionsResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [useSampleData, setUseSampleData] = useState(false);

  const generateQuestions = useCallback(async () => {
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
      const prompt = `Generate 8-12 challenging thesis defense questions based on the content provided.

Create questions in 5 categories:
- Methodology: About research approach and methods
- Findings: About results and data interpretation
- Implications: About impact and significance
- Limitations: About weaknesses and scope
- Critique: About validity and assumptions

Difficulty level: ${difficulty}

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "category": "methodology|findings|implications|limitations|critique",
      "difficulty": "${difficulty}",
      "answerFramework": "Key points to address: 1) ... 2) ... 3) ... 4) ...",
      "followUpQuestions": ["...", "..."]
    }
  ],
  "totalCount": number,
  "generatedAt": ISO_DATE
}

Thesis content:
${content}`;

      const result = await callPuterAI(prompt, {
        temperature: 0.6,
      });

      const parsed: DefenseQuestionsResponse = JSON.parse(result);
      setData(parsed);
      toast.success(`Generated ${parsed.totalCount} defense questions`);
    } catch (error) {
      console.error('Question generation failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate questions'
      );
    } finally {
      setLoading(false);
    }
  }, [content, difficulty, session]);

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
    a.download = `defense-questions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  }, [data]);

  const exportText = useCallback(() => {
    if (!data) return;
    const text = data.questions
      .map(
        (q) =>
          `Q: ${q.question}\n\nCategory: ${q.category.toUpperCase()}\nDifficulty: ${q.difficulty.toUpperCase()}\n\nAnswer Framework:\n${q.answerFramework}\n\nFollow-up Questions:\n${q.followUpQuestions.map((fq) => `- ${fq}`).join('\n')}`
      )
      .join('\n\n' + '='.repeat(80) + '\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defense-questions-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Text exported');
  }, [data]);

  const copyToClipboard = useCallback(async () => {
    if (!data) return;
    const text = data.questions
      .map((q) => `Q: ${q.question}\n\nA Framework: ${q.answerFramework}`)
      .join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [data]);

  const saveToDatabase = useCallback(async () => {
    if (!data) return;
    try {
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data,
          title: title || 'Defense Questions',
          type: 'educational_defense_questions',
          metadata: {
            tool: 'defense-question-generator',
            count: data.totalCount,
            difficulty,
            generatedAt: data.generatedAt,
          },
        }),
      });
      if (!response.ok) throw new Error('Save failed');
      toast.success('Saved to document library');
    } catch (error) {
      toast.error('Failed to save to database');
    }
  }, [data, title, difficulty]);

  const filteredQuestions =
    selectedCategory === 'all'
      ? data?.questions
      : data?.questions.filter((q) => q.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">Defense Question Generator</h2>
        <p className="mb-6 text-muted-foreground">
          Generate challenging thesis defense questions with answer frameworks. Get questions across 5 categories at your chosen difficulty level.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Defense Preparation - Methodology Focus"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Difficulty Level</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="challenging">Challenging</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="flex gap-2">
            <Button
              onClick={generateQuestions}
              disabled={loading || !session}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Questions'
              )}
            </Button>
            <Button onClick={loadSampleData} variant="outline">
              Load Sample
            </Button>
          </div>
        </div>
      </div>

      {data && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold">Defense Questions ({filteredQuestions?.length})</h3>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as QuestionCategory | 'all')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="methodology">Methodology</SelectItem>
                <SelectItem value="findings">Findings</SelectItem>
                <SelectItem value="implications">Implications</SelectItem>
                <SelectItem value="limitations">Limitations</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6 grid gap-4">
            {filteredQuestions?.map((q, idx) => (
              <div
                key={idx}
                className="rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <h4 className="flex-1 font-semibold">{q.question}</h4>
                  <div className="flex gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${categoryColors[q.category]}`}
                    >
                      {q.category}
                    </span>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${difficultyColors[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Answer Framework:</p>
                  <p className="text-sm">{q.answerFramework}</p>
                </div>
                {q.followUpQuestions.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">Follow-up Questions:</p>
                    <ul className="text-sm">
                      {q.followUpQuestions.map((fq, fIdx) => (
                        <li key={fIdx} className="list-inside list-disc">
                          {fq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={exportJSON} variant="outline">
              Export JSON
            </Button>
            <Button onClick={exportText} variant="outline">
              Export Text
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
          Please sign in to generate defense questions for your thesis.
        </div>
      )}
    </div>
  );
}
