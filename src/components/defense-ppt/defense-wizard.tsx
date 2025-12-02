'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen } from 'lucide-react';
import { sampleProposalDefense, sampleFinalDefense } from '@/lib/defense-ppt-samples';

interface DefensePlan {
  id: string;
  thesisId?: string;
  defenseType: 'proposal' | 'final';
  totalTime: number;
  slideCount: number;
  chaptersToInclude: number[];
  slides: Array<{
    id: string;
    title: string;
    bullets: string[];
    notes: string;
    timeEstimate: number;
    order: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface DefenseWizardProps {
  onComplete: (plan: DefensePlan) => void;
}

const SLIDE_TEMPLATES = {
  proposal: [
    { title: 'Title Slide', timeEstimate: 30 },
    { title: 'Background & Significance', timeEstimate: 90 },
    { title: 'Research Problem', timeEstimate: 90 },
    { title: 'Research Questions/Objectives', timeEstimate: 60 },
    { title: 'Proposed Methodology', timeEstimate: 120 },
    { title: 'Expected Outcomes', timeEstimate: 60 },
    { title: 'Timeline', timeEstimate: 45 },
    { title: 'Q&A', timeEstimate: 60 },
  ],
  final: [
    { title: 'Title Slide', timeEstimate: 30 },
    { title: 'Introduction & Background', timeEstimate: 90 },
    { title: 'Problem Statement', timeEstimate: 90 },
    { title: 'Literature Review Summary', timeEstimate: 120 },
    { title: 'Methodology', timeEstimate: 120 },
    { title: 'Results & Findings', timeEstimate: 150 },
    { title: 'Discussion', timeEstimate: 120 },
    { title: 'Conclusions & Recommendations', timeEstimate: 90 },
    { title: 'Q&A', timeEstimate: 60 },
  ],
};

export function DefenseWizard({ onComplete }: DefenseWizardProps) {
  const [step, setStep] = useState(1);
  const [defenseType, setDefenseType] = useState<'proposal' | 'final'>('proposal');
  const [totalTime, setTotalTime] = useState(15);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2, 3]);

  const handleChapterToggle = (chapter: number) => {
    setSelectedChapters(prev =>
      prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]
    );
  };

  const generateSlideCount = () => {
    const baseSlides = defenseType === 'proposal' ? 8 : 9;
    return Math.max(baseSlides, Math.ceil((totalTime / 2) - 1));
  };

  const handleComplete = () => {
    const slideCount = generateSlideCount();
    const templates = SLIDE_TEMPLATES[defenseType].slice(0, slideCount);

    const slides = templates.map((template, index) => ({
      id: `slide-${index}`,
      title: template.title,
      bullets: ['• '],
      notes: '',
      timeEstimate: template.timeEstimate,
      order: index,
    }));

    const plan: DefensePlan = {
      id: `plan-${Date.now()}`,
      defenseType,
      totalTime,
      slideCount,
      chaptersToInclude: selectedChapters,
      slides,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onComplete(plan);
  };

  const totalTimeEstimate = SLIDE_TEMPLATES[defenseType]
    .slice(0, generateSlideCount())
    .reduce((acc, s) => acc + s.timeEstimate, 0) / 60;

  const handleLoadSample = (sample: 'proposal' | 'final') => {
    const sampleData = sample === 'proposal' ? sampleProposalDefense : sampleFinalDefense;
    onComplete(sampleData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Sample Data Section */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Quick Start with Samples</CardTitle>
            </div>
            <CardDescription>
              Learn from realistic examples or start from scratch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleLoadSample('proposal')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start justify-start hover:bg-accent"
              >
                <div className="font-semibold text-left">Proposal Defense</div>
                <div className="text-xs text-muted-foreground text-left mt-1">
                  8 slides • 15 min • Chapters 1-3
                </div>
              </Button>
              <Button
                onClick={() => handleLoadSample('final')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start justify-start hover:bg-accent"
              >
                <div className="font-semibold text-left">Final Defense</div>
                <div className="text-xs text-muted-foreground text-left mt-1">
                  10 slides • 25 min • All chapters
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Defense Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What type of defense are you preparing?</CardTitle>
            <CardDescription>
              Different defense types have different structures and time allocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => setDefenseType('proposal')}>
                <RadioGroup value={defenseType} onValueChange={(v: any) => setDefenseType(v)}>
                  <RadioGroupItem value="proposal" id="proposal" />
                </RadioGroup>
                <Label htmlFor="proposal" className="cursor-pointer flex-1">
                  <div className="font-semibold">Proposal Defense</div>
                  <div className="text-sm text-muted-foreground">Chapters 1-3: Problem, literature, methodology</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => setDefenseType('final')}>
                <RadioGroup value={defenseType} onValueChange={(v: any) => setDefenseType(v)}>
                  <RadioGroupItem value="final" id="final" />
                </RadioGroup>
                <Label htmlFor="final" className="cursor-pointer flex-1">
                  <div className="font-semibold">Final Defense</div>
                  <div className="text-sm text-muted-foreground">All chapters: Full thesis presentation</div>
                </Label>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Next: Set Time Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Time Budget */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>What is your defense time limit?</CardTitle>
            <CardDescription>
              This helps optimize slide count and content density
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="time">Time Budget (minutes)</Label>
              <Input
                id="time"
                type="number"
                min="5"
                max="60"
                value={totalTime}
                onChange={(e) => setTotalTime(Math.max(5, Math.min(60, parseInt(e.target.value) || 5)))}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Recommended slide count: <span className="font-semibold">{generateSlideCount()} slides</span> (~{totalTimeEstimate.toFixed(1)}m)
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aim for 1.5-2 minutes per slide including Q&A buffer
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next: Select Chapters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Chapter Coverage */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Which chapters will you cover?</CardTitle>
            <CardDescription>
              Select all chapters you plan to include in your defense
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((chapter) => (
                <div key={chapter} className="flex items-center space-x-2">
                  <Checkbox
                    id={`chapter-${chapter}`}
                    checked={selectedChapters.includes(chapter)}
                    onCheckedChange={() => handleChapterToggle(chapter)}
                  />
                  <Label htmlFor={`chapter-${chapter}`} className="cursor-pointer">
                    Chapter {chapter}: {
                      chapter === 1 ? 'Introduction' :
                      chapter === 2 ? 'Literature Review' :
                      chapter === 3 ? 'Methodology' :
                      chapter === 4 ? 'Results & Findings' :
                      'Conclusions'
                    }
                  </Label>
                </div>
              ))}
            </div>

            {selectedChapters.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one chapter
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={selectedChapters.length === 0}
                className="flex-1"
              >
                Create Presentation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
