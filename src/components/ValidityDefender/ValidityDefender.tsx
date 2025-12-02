'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import InstrumentValidator from './InstrumentValidator';
import DefenseResponseGenerator from './DefenseResponseGenerator';
import PracticeMode from './PracticeMode';
import SlideIntegrator from './SlideIntegrator';
import { SAMPLE_INSTRUMENT_DATA } from '@/lib/validity-defender-sample-data';

interface ValidityDefenderProps {
  thesisId: string;
}

export default function ValidityDefender({ thesisId }: ValidityDefenderProps) {
  const [activeTab, setActiveTab] = useState('validator');
  const [savedInstruments, setSavedInstruments] = useState<string[]>([]);

  const handleInstrumentSaved = (instrumentId: string) => {
    setSavedInstruments((prev) => [...new Set([...prev, instrumentId])]);
  };

  const handleLoadSampleData = () => {
    // Pre-populate the form with sample data by triggering a custom event
    const event = new CustomEvent('loadSampleData', {
      detail: SAMPLE_INSTRUMENT_DATA,
    });
    window.dispatchEvent(event);
    
    // Add sample instrument to saved instruments
    const sampleInstrumentId = 'sample-inst-001';
    handleInstrumentSaved(sampleInstrumentId);
    
    // Switch to validator tab
    setActiveTab('validator');
    
    toast.success('Sample data loaded! Try the other tabs to explore all features.', {
      description: 'Student Engagement Survey example is ready to explore.',
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4 pb-4">
        <div className="space-y-3 flex-1">
          <h1 className="text-4xl font-bold tracking-tight">Validity Defender</h1>
          <p className="text-lg text-muted-foreground">
            Prepare compelling evidence for your thesis defense by validating your research instruments and
            practicing responses to common panel questions.
          </p>
        </div>
        <Button
          onClick={handleLoadSampleData}
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
        >
          <Zap className="h-4 w-4" />
          Sample Data
        </Button>
      </div>

      <Alert className="border-blue-200 bg-blue-50 rounded-lg">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          <strong className="font-semibold">Start here:</strong> Upload your survey, interview protocol, or observation guide to validate it. Then generate defense responses and practice with AI scoring.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-2">
          <TabsTrigger value="validator">Validate Instrument</TabsTrigger>
          <TabsTrigger value="responses" disabled={savedInstruments.length === 0}>
            Generate Responses
          </TabsTrigger>
          <TabsTrigger value="practice" disabled={savedInstruments.length === 0}>
            Practice Mode
          </TabsTrigger>
          <TabsTrigger value="slides" disabled={savedInstruments.length === 0}>
            PPT Slides
          </TabsTrigger>
        </TabsList>

        {/* Instrument Validator Tab */}
        <TabsContent value="validator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instrument Validator</CardTitle>
              <CardDescription>
                Upload your survey, interview questions, or observation guide to receive validity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstrumentValidator thesisId={thesisId} onInstrumentSaved={handleInstrumentSaved} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defense Response Generator Tab */}
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Defense Responses</CardTitle>
              <CardDescription>
                Create scripted responses to common validity-related questions from your thesis panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DefenseResponseGenerator
                thesisId={thesisId}
                instrumentIds={savedInstruments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Mode Tab */}
        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Defense Practice Session</CardTitle>
              <CardDescription>
                Simulate defense questions and receive AI-powered scoring on your responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PracticeMode thesisId={thesisId} instrumentIds={savedInstruments} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slide Integrator Tab */}
        <TabsContent value="slides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PPT Slide Generator</CardTitle>
              <CardDescription>
                Export validity metrics and defense scripts as presentation-ready slides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlideIntegrator thesisId={thesisId} instrumentIds={savedInstruments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
