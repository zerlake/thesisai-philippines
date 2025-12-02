'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Presentation, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { DefenseWizard } from '@/components/defense-ppt/defense-wizard';
import { SlideEditor } from '@/components/defense-ppt/slide-editor';
import { SlidePreview } from '@/components/defense-ppt/slide-preview';
import { QAGenerator } from '@/components/defense-ppt/qa-generator';
import { PresentationMode } from '@/components/defense-ppt/presentation-mode';
import { sampleProposalDefense, sampleFinalDefense } from '@/lib/defense-ppt-samples';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number; // in seconds
  order: number;
}

interface DefensePlan {
  id: string;
  thesisId?: string;
  defenseType: 'proposal' | 'final';
  totalTime: number; // in minutes
  slideCount: number;
  chaptersToInclude: number[];
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
}

export default function DefensePPTCoachPage() {
  const [plan, setPlan] = useState<DefensePlan | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('wizard');
  const searchParams = useSearchParams();

  // Load sample data from URL parameters
  useEffect(() => {
    const sample = searchParams.get('sample');
    if (sample === 'proposal') {
      setPlan(sampleProposalDefense);
      setActiveTab('preview');
      if (sampleProposalDefense.slides.length > 0) {
        setSelectedSlideId(sampleProposalDefense.slides[0].id);
      }
    } else if (sample === 'final') {
      setPlan(sampleFinalDefense);
      setActiveTab('preview');
      if (sampleFinalDefense.slides.length > 0) {
        setSelectedSlideId(sampleFinalDefense.slides[0].id);
      }
    }
  }, [searchParams]);

  const handleWizardComplete = (newPlan: DefensePlan) => {
    setPlan(newPlan);
    setActiveTab('editor');
    if (newPlan.slides.length > 0) {
      setSelectedSlideId(newPlan.slides[0].id);
    }
  };

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    if (!plan) return;
    setPlan({
      ...plan,
      slides: plan.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      ),
      updatedAt: new Date(),
    });
  };

  const deleteSlide = (slideId: string) => {
    if (!plan) return;
    const newSlides = plan.slides.filter(s => s.id !== slideId);
    setPlan({
      ...plan,
      slides: newSlides.map((s, i) => ({ ...s, order: i })),
      slideCount: newSlides.length,
      updatedAt: new Date(),
    });
  };

  const addSlide = (afterSlideId?: string) => {
    if (!plan) return;
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      bullets: ['• '],
      notes: '',
      timeEstimate: 60,
      order: afterSlideId
        ? (plan.slides.findIndex(s => s.id === afterSlideId) ?? plan.slides.length - 1) + 1
        : plan.slides.length,
    };
    const newSlides = [...plan.slides];
    newSlides.splice(newSlide.order, 0, newSlide);
    setPlan({
      ...plan,
      slides: newSlides.map((s, i) => ({ ...s, order: i })),
      slideCount: newSlides.length,
      updatedAt: new Date(),
    });
    setSelectedSlideId(newSlide.id);
  };

  const selectedSlide = plan?.slides.find(s => s.id === selectedSlideId);
  const totalTime = plan?.slides.reduce((acc, s) => acc + s.timeEstimate, 0) ?? 0;
  const isTimeOverBudget = plan && totalTime > plan.totalTime * 60;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Presentation className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Defense PPT Coach</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Create a structured, time-aware presentation for your thesis defense
          </p>
        </div>

        {/* Quick Stats */}
        {plan && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{plan.slideCount}</div>
                  <div className="text-sm text-muted-foreground mt-1">Slides</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isTimeOverBudget ? 'text-red-500' : 'text-primary'}`}>
                    {Math.round(totalTime / 60)}m {totalTime % 60}s
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total Time</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{plan.totalTime}m</div>
                  <div className="text-sm text-muted-foreground mt-1">Budget</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {Math.round((totalTime / (plan.totalTime * 60)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Usage</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warnings */}
        {isTimeOverBudget && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">
              Your presentation exceeds the time budget by {Math.round((totalTime - (plan?.totalTime ?? 0) * 60) / 60)}m {(totalTime - (plan?.totalTime ?? 0) * 60) % 60}s.
              Consider removing slides or reducing content.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="wizard">Setup</TabsTrigger>
            <TabsTrigger value="editor" disabled={!plan}>
              Edit Slides
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!plan}>
              Preview
            </TabsTrigger>
            <TabsTrigger value="presentation" disabled={!plan}>
              Present
            </TabsTrigger>
            <TabsTrigger value="qa" disabled={!plan}>
              Q&A
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="wizard" className="mt-8">
            {plan ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Presentation Plan Created</CardTitle>
                    <CardDescription>
                      Defense Type: {plan.defenseType === 'proposal' ? 'Proposal Defense' : 'Final Defense'} •
                      Chapters: {plan.chaptersToInclude.join(', ')} • Time Budget: {plan.totalTime} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={() => { setPlan(null); setActiveTab('wizard'); }}>
                      Start Over
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <DefenseWizard onComplete={handleWizardComplete} />
            )}
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="mt-8">
            {plan && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {selectedSlide ? (
                    <SlideEditor
                      slide={selectedSlide}
                      onUpdate={updateSlide}
                      onAddSlide={addSlide}
                      onDelete={() => deleteSlide(selectedSlide.id)}
                      totalBudgetSeconds={plan.totalTime * 60}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground">No slides created yet.</p>
                        <Button onClick={() => addSlide()} className="mt-4">
                          Add First Slide
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Slide List Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Slides</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {plan.slides.map((slide) => (
                          <button
                            key={slide.id}
                            onClick={() => setSelectedSlideId(slide.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedSlideId === slide.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            <div className="font-semibold text-sm">{slide.order + 1}. {slide.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.floor(slide.timeEstimate / 60)}m {slide.timeEstimate % 60}s
                            </div>
                          </button>
                        ))}
                      </div>
                      <Button onClick={() => addSlide()} className="w-full mt-4" variant="outline">
                        Add Slide
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-8">
            {plan && selectedSlide && (
              <SlidePreview slide={selectedSlide} allSlides={plan.slides} />
            )}
          </TabsContent>

          {/* Presentation Tab */}
          <TabsContent value="presentation" className="mt-0 p-0 w-full h-[calc(100vh-100px)]">
            {plan && (
              <div className="w-full h-full">
                <PresentationMode plan={plan} />
              </div>
            )}
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="mt-8">
            {plan && (
              <QAGenerator slides={plan.slides} defenseType={plan.defenseType} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
