'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

interface StudyGuideTerm {
  term: string;
  definition: string;
}

interface StudyGuideSection {
  heading: string;
  content: string;
  keyPoints: string[];
  reviewQuestions: string[];
}

interface StudyGuide {
  title: string;
  executiveSummary: string;
  sections: StudyGuideSection[];
  keyTerms: StudyGuideTerm[];
  studyTips: string[];
  citationsList: string[];
  estimatedReadingTime: number;
  generatedAt: string;
}

const SAMPLE_DATA: StudyGuide = {
  title: 'Photosynthesis: A Comprehensive Study Guide',
  executiveSummary:
    'Photosynthesis is the fundamental biochemical process through which plants convert light energy into chemical energy stored in glucose molecules. This process occurs primarily in chloroplasts and involves two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle). Understanding photosynthesis is essential for comprehending energy flow in ecosystems and has practical applications in agriculture and renewable energy.',
  sections: [
    {
      heading: 'Light-Dependent Reactions',
      content:
        'The light-dependent reactions occur in the thylakoid membrane of chloroplasts. These reactions capture light energy and convert it into chemical energy in the form of ATP and NADPH. The process begins with light absorption by chlorophyll in Photosystem II, which triggers the splitting of water molecules and releases oxygen as a byproduct. Electrons move through an electron transport chain, creating a proton gradient that drives ATP synthesis.',
      keyPoints: [
        'Occurs in thylakoid membranes',
        'Requires light energy for activation',
        'Produces ATP and NADPH',
        'Results in oxygen release',
        'Drives electron transport chain',
      ],
      reviewQuestions: [
        'What are the main products of light reactions?',
        'Where do light reactions occur in the chloroplast?',
        'How does the electron transport chain contribute to ATP production?',
      ],
    },
    {
      heading: 'The Calvin Cycle',
      content:
        'The Calvin Cycle, also known as the light-independent reactions, occurs in the stroma of chloroplasts. This cycle uses the ATP and NADPH produced by the light reactions to convert CO2 into glucose through a series of enzymatic reactions. The cycle has three main phases: carbon fixation, reduction, and regeneration of ribulose-1,5-bisphosphate.',
      keyPoints: [
        'Occurs in the stroma',
        'Does not directly require light',
        'Uses ATP and NADPH from light reactions',
        'Fixes CO2 into organic molecules',
        'Produces glucose',
      ],
      reviewQuestions: [
        'What are the three phases of the Calvin Cycle?',
        'Why is the Calvin Cycle called light-independent?',
        'What would happen if light reactions stopped?',
      ],
    },
  ],
  keyTerms: [
    {
      term: 'Chloroplast',
      definition: 'Double-membrane bound organelle where photosynthesis occurs in plant cells',
    },
    {
      term: 'Photosystem',
      definition: 'Complex of proteins and pigments that captures light energy for electron excitation',
    },
    {
      term: 'Electron Transport Chain',
      definition: 'Series of protein complexes that move electrons and establish proton gradient',
    },
    {
      term: 'NADPH',
      definition: 'Electron carrier molecule produced in light reactions, used in Calvin Cycle',
    },
    {
      term: 'RuBisCO',
      definition: 'Most abundant enzyme on Earth, catalyzes CO2 fixation in Calvin Cycle',
    },
  ],
  studyTips: [
    'Create visual diagrams showing electron flow through the electron transport chain',
    'Use color coding to distinguish between light and dark reactions',
    'Memorize the overall equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2',
    'Practice explaining energy flow from light to chemical bonds',
    'Study the role of chlorophyll absorption spectra',
  ],
  citationsList: [
    'Taiz & Zeiger (2015). Plant Physiology and Development',
    'Buchanan et al. (2015). Biochemistry and Molecular Biology of Plants',
    'Campbell & Reece (2020). Biology: A Global Approach',
  ],
  estimatedReadingTime: 45,
  generatedAt: new Date().toISOString(),
};

export function StudyGuideGenerator() {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudyGuide | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [useSampleData, setUseSampleData] = useState(false);

  const generateStudyGuide = useCallback(async () => {
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
      const prompt = `Create a comprehensive study guide from the following thesis content.

Structure the guide with:
1. Executive Summary (2-3 paragraphs)
2. 3-5 main sections, each with:
   - Detailed content explanation
   - Key points (as bullet list)
   - Review questions for each section
3. 8-12 key terms with definitions
4. 5-7 practical study tips
5. List of important citations
6. Estimated reading time in minutes

Format as JSON:
{
  "title": "...",
  "executiveSummary": "...",
  "sections": [
    {
      "heading": "...",
      "content": "...",
      "keyPoints": ["...", "..."],
      "reviewQuestions": ["...", "..."]
    }
  ],
  "keyTerms": [
    {"term": "...", "definition": "..."}
  ],
  "studyTips": ["...", "..."],
  "citationsList": ["...", "..."],
  "estimatedReadingTime": number,
  "generatedAt": ISO_DATE
}

Thesis content to process:
${content}`;

      const result = await callPuterAI(prompt, {
        temperature: 0.5,
      });

      const parsed: StudyGuide = JSON.parse(result);
      setData(parsed);
      setExpandedSections(new Set([0]));
      toast.success('Study guide generated successfully');
    } catch (error) {
      console.error('Study guide generation failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate study guide'
      );
    } finally {
      setLoading(false);
    }
  }, [content, session]);

  const loadSampleData = useCallback(() => {
    setData(SAMPLE_DATA);
    setExpandedSections(new Set([0]));
    setUseSampleData(true);
    toast.success('Sample data loaded');
  }, []);

  const toggleSection = useCallback((idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  const exportJSON = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-guide-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported');
  }, [data]);

  const exportHTML = useCallback(() => {
    if (!data) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    h3 { color: #777; }
    .summary { background: #f0f8ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .section { margin: 20px 0; page-break-inside: avoid; }
    .key-points { background: #f9f9f9; padding: 10px; margin: 10px 0; }
    .key-points li { margin: 5px 0; }
    .questions { background: #fff3cd; padding: 10px; margin: 10px 0; }
    .terms { columns: 2; }
    .term { margin: 10px 0; }
    .tips { background: #d4edda; padding: 10px; margin: 10px 0; }
    .citations { background: #e2e3e5; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <p><small>Reading Time: ${data.estimatedReadingTime} minutes</small></p>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>${data.executiveSummary}</p>
  </div>
  
  ${data.sections
    .map(
      (section) => `
    <div class="section">
      <h2>${section.heading}</h2>
      <p>${section.content}</p>
      <div class="key-points">
        <h3>Key Points:</h3>
        <ul>${section.keyPoints.map((kp) => `<li>${kp}</li>`).join('')}</ul>
      </div>
      <div class="questions">
        <h3>Review Questions:</h3>
        <ul>${section.reviewQuestions.map((q) => `<li>${q}</li>`).join('')}</ul>
      </div>
    </div>
  `
    )
    .join('')}
  
  <div class="terms">
    <h2>Key Terms</h2>
    ${data.keyTerms
      .map(
        (term) => `
      <div class="term">
        <strong>${term.term}:</strong> ${term.definition}
      </div>
    `
      )
      .join('')}
  </div>
  
  <div class="tips">
    <h2>Study Tips</h2>
    <ul>${data.studyTips.map((tip) => `<li>${tip}</li>`).join('')}</ul>
  </div>
  
  <div class="citations">
    <h2>Citations</h2>
    <ul>${data.citationsList.map((citation) => `<li>${citation}</li>`).join('')}</ul>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-guide-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported');
  }, [data]);

  const copyToClipboard = useCallback(async () => {
    if (!data) return;
    const text = `${data.title}\n\nExecutive Summary:\n${data.executiveSummary}\n\n${data.sections
      .map((s) => `${s.heading}\n${s.content}\n\nKey Points:\n${s.keyPoints.map((kp) => `- ${kp}`).join('\n')}`)
      .join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [data]);

  // Load existing study guides
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  const loadGuides = useCallback(async () => {
    if (!session) return;

    setLoadingGuides(true);
    try {
      const response = await fetch('/api/study-guides');
      const result = await response.json();
      if (response.ok) {
        setGuides(result.guides);
      } else {
        throw new Error(result.error || 'Failed to load guides');
      }
    } catch (error) {
      toast.error('Failed to load study guides');
    } finally {
      setLoadingGuides(false);
    }
  }, [session]);

  // Load specific guide
  const loadGuide = useCallback(async (guideId: string) => {
    if (!session) return;

    try {
      // For now, we'll implement this functionality later when we have the detailed API
      // For now, let's just show a message
      toast.info('Loading specific guides functionality coming soon');
    } catch (error) {
      toast.error('Failed to load study guide');
    }
  }, [session]);

  const saveToDatabase = useCallback(async () => {
    if (!data) return;
    try {
      const response = await fetch('/api/study-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || data.title,
          executiveSummary: data.executiveSummary,
          sections: data.sections,
          keyTerms: data.keyTerms,
          studyTips: data.studyTips,
          citationsList: data.citationsList,
          estimatedReadingTime: data.estimatedReadingTime
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Save failed');
      toast.success(`Saved study guide to your library`);

      // Refresh the guides list after saving
      loadGuides();
    } catch (error) {
      toast.error('Failed to save study guide to database');
    }
  }, [data, title, loadGuides]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">Study Guide Generator</h2>
        <p className="mb-6 text-muted-foreground">
          Create comprehensive, hierarchical study guides with executive summary, sections, key terms, study tips, and citations.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Photosynthesis Study Guide"
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
              onClick={generateStudyGuide}
              disabled={loading || !session}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Study Guide'
              )}
            </Button>
            <Button onClick={loadSampleData} variant="outline">
              Load Sample
            </Button>
            <Button
              onClick={loadGuides}
              variant="outline"
              disabled={loadingGuides}
            >
              {loadingGuides ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Guides'
              )}
            </Button>
          </div>

          {guides.length > 0 && (
            <div className="mt-4">
              <label className="mb-2 block font-medium">Select Guide to Load</label>
              <div className="flex flex-wrap gap-2">
                {guides.map((guide) => (
                  <Button
                    key={guide.id}
                    variant={selectedGuideId === guide.id ? "default" : "outline"}
                    onClick={() => loadGuide(guide.id)}
                    size="sm"
                  >
                    {guide.title || 'Untitled Guide'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">{data.title}</h1>
            <p className="text-sm text-muted-foreground">
              Estimated reading time: {data.estimatedReadingTime} minutes
            </p>
          </div>

          <div className="mb-6 rounded bg-blue-50 p-4 dark:bg-blue-900">
            <h3 className="mb-3 font-semibold">Executive Summary</h3>
            <p className="text-sm">{data.executiveSummary}</p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold">Content Sections</h3>
            <div className="space-y-2">
              {data.sections.map((section, idx) => (
                <div key={idx} className="rounded border">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="flex w-full items-center justify-between bg-slate-100 p-4 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <h4 className="font-semibold">{section.heading}</h4>
                    {expandedSections.has(idx) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  {expandedSections.has(idx) && (
                    <div className="space-y-4 p-4">
                      <div>
                        <p className="text-sm">{section.content}</p>
                      </div>
                      <div>
                        <h5 className="mb-2 font-medium">Key Points:</h5>
                        <ul className="space-y-1">
                          {section.keyPoints.map((kp, kIdx) => (
                            <li key={kIdx} className="text-sm">
                              • {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="mb-2 font-medium">Review Questions:</h5>
                        <ul className="space-y-1">
                          {section.reviewQuestions.map((q, qIdx) => (
                            <li key={qIdx} className="text-sm">
                              ◦ {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold">Key Terms ({data.keyTerms.length})</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {data.keyTerms.map((term, idx) => (
                <div key={idx} className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold">{term.term}</p>
                  <p className="text-sm text-muted-foreground">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold">Study Tips</h3>
            <ul className="space-y-2">
              {data.studyTips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="text-blue-600">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold">Citations</h3>
            <ul className="space-y-2">
              {data.citationsList.map((citation, idx) => (
                <li key={idx} className="text-sm">
                  {citation}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={exportJSON} variant="outline">
              Export JSON
            </Button>
            <Button onClick={exportHTML} variant="outline">
              Export HTML
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
          Please sign in to generate study guides for your thesis content.
        </div>
      )}
    </div>
  );
}
