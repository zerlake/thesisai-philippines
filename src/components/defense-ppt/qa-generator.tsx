'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number;
  order: number;
}

interface QAGeneratorProps {
  slides: Slide[];
  defenseType: 'proposal' | 'final';
}

interface GeneratedQA {
  slideId: string;
  slideTitle: string;
  likelyQuestions: string[];
  suggestedAnswers: string[];
}

export function QAGenerator({ slides, defenseType }: QAGeneratorProps) {
  const [qaData, setQaData] = useState<GeneratedQA[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSlideId, setCopiedSlideId] = useState<string | null>(null);

  const generateQA = async () => {
    setIsGenerating(true);
    try {
      // In a real app, this would call an API endpoint that uses your AI service
      // For now, we'll generate mock Q&A based on slide content
      const mockQA = slides.map(slide => ({
        slideId: slide.id,
        slideTitle: slide.title,
        likelyQuestions: generateMockQuestions(slide),
        suggestedAnswers: generateMockAnswers(slide),
      }));
      setQaData(mockQA);
      toast.success('Q&A generated successfully');
    } catch (error) {
      toast.error('Failed to generate Q&A');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockQuestions = (slide: Slide): string[] => {
    const base = [
      `Can you elaborate on "${slide.title}"?`,
      `What is the significance of this slide in your ${defenseType} defense?`,
      `How does this relate to your overall thesis?`,
    ];

    // Add slide-specific questions
    if (slide.title.toLowerCase().includes('methodology')) {
      base.push('Why did you choose this methodology?');
      base.push('What are the limitations of your approach?');
    }
    if (slide.title.toLowerCase().includes('results') || slide.title.toLowerCase().includes('findings')) {
      base.push('What are the key findings from your research?');
      base.push('Did you encounter any unexpected results?');
    }
    if (slide.title.toLowerCase().includes('problem')) {
      base.push('What makes this a significant research problem?');
      base.push('Who would benefit from solving this problem?');
    }

    return base;
  };

  const generateMockAnswers = (slide: Slide): string[] => {
    const notes = slide.notes || '';
    return [
      notes || 'Based on the evidence presented in this slide, this aspect is important because...',
      'From the data shown, we can see that...',
      'This contributes to the overall thesis by...',
    ];
  };

  const copyToClipboard = (text: string, slideId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlideId(slideId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSlideId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle>Q&A Preparation</CardTitle>
          <CardDescription>
            Generate likely panel questions and suggested answers for each slide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateQA}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Q&A...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Q&A for All Slides
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Q&A Content */}
      {qaData.length > 0 && (
        <Tabs defaultValue={qaData[0].slideId} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(6, qaData.length)}, 1fr)` }}>
            {qaData.map((qa) => (
              <TabsTrigger key={qa.slideId} value={qa.slideId} className="text-xs truncate">
                #{qa.slideId.split('-')[1]}
              </TabsTrigger>
            ))}
          </TabsList>

          {qaData.map((qa) => (
            <TabsContent key={qa.slideId} value={qa.slideId} className="space-y-4 mt-6">
              {/* Slide Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{qa.slideTitle}</CardTitle>
                </CardHeader>
              </Card>

              {/* Likely Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Likely Panel Questions</CardTitle>
                  <CardDescription>
                    Questions your panel may ask about this slide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {qa.likelyQuestions.map((question, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge className="mb-2">Question {index + 1}</Badge>
                          <p className="text-sm leading-relaxed">{question}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(question, qa.slideId)}
                        >
                          {copiedSlideId === qa.slideId ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggested Answers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Answer Framework</CardTitle>
                  <CardDescription>
                    Structure your answers to address common concerns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {qa.suggestedAnswers.map((answer, index) => (
                    <div key={index} className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">Answer {index + 1}</Badge>
                          <p className="text-sm leading-relaxed text-blue-900">{answer}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(answer, qa.slideId)}
                        >
                          {copiedSlideId === qa.slideId ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Empty State */}
      {qaData.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No Q&A generated yet. Click the button above to generate questions and answers for your slides.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-base">Defense Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-green-900">
          <p>• <strong>Listen carefully</strong> to each question before answering</p>
          <p>• <strong>Pause</strong> for a moment to gather your thoughts</p>
          <p>• <strong>Answer directly</strong> what is asked, then provide context</p>
          <p>• <strong>Use data</strong> from your slides to support answers</p>
          <p>• <strong>If unsure</strong>, say "That's a great question. Let me think about it..." or "I'll need to verify that, but..."</p>
          <p>• <strong>Practice</strong> your answers out loud before the defense</p>
        </CardContent>
      </Card>
    </div>
  );
}
