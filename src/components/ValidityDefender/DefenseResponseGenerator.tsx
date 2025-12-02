'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { SAMPLE_DEFENSE_RESPONSES } from '@/lib/validity-defender-sample-data';

interface DefenseResponseGeneratorProps {
  thesisId: string;
  instrumentIds: string[];
}

interface DefenseResponse {
  success: boolean;
  responseId?: string;
  response?: {
    questionType: string;
    questionText: string;
    aiGeneratedResponse: string;
    keyPoints: string[];
    citations: string[];
  };
  error?: string;
}

const QUESTION_TYPES = [
  { value: 'content', label: 'Content Validity' },
  { value: 'construct', label: 'Construct Validity' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'validity', label: 'Overall Validity' },
  { value: 'methodology', label: 'Methodology' },
];

export default function DefenseResponseGenerator({
  thesisId,
  instrumentIds,
}: DefenseResponseGeneratorProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResponses, setGeneratedResponses] = useState<Array<Exclude<DefenseResponse['response'], undefined>>>([]);

  useEffect(() => {
    const handleLoadSampleData = () => {
      // Load sample responses when sample data is loaded
      if (instrumentIds.length > 0) {
        setGeneratedResponses(SAMPLE_DEFENSE_RESPONSES as Array<Exclude<DefenseResponse['response'], undefined>>);
      }
    };

    window.addEventListener('loadSampleData', handleLoadSampleData);
    return () => window.removeEventListener('loadSampleData', handleLoadSampleData);
  }, [instrumentIds]);

  const handleGenerate = async () => {
    if (!selectedInstrument || !questionType) {
      alert('Please select an instrument and question type');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/instruments/defense-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: selectedInstrument,
          questionType,
          questionText: customQuestion || undefined,
        }),
      });

      const data = (await response.json()) as DefenseResponse;

      if (!response.ok) {
        alert(data.error || 'Failed to generate response');
        return;
      }

      if (data.response) {
        setGeneratedResponses((prev) => [data.response as Exclude<DefenseResponse['response'], undefined>, ...prev]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Response</CardTitle>
          <CardDescription>Select an instrument and question type to generate a scripted response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Instrument</label>
              <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose instrument..." />
                </SelectTrigger>
                <SelectContent>
                  {instrumentIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      Instrument {id.slice(0, 8)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Question Type</label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose type..." />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Question (Optional)</label>
            <Textarea
              placeholder="Enter a specific question if you don't want the auto-generated one..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || !selectedInstrument || !questionType} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Response'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Responses */}
      {generatedResponses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generated Responses</h2>

          {generatedResponses.map((resp, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge className="mb-2">{resp.questionType}</Badge>
                    <CardTitle className="text-base">{resp.questionText}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(resp.aiGeneratedResponse)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Your Answer:</h4>
                  <div className="text-sm leading-relaxed text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
                    {resp.aiGeneratedResponse}
                  </div>
                </div>

                {/* Key Points */}
                {resp.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Points to Emphasize:</h4>
                    <ul className="space-y-1">
                      {resp.keyPoints.map((point, pidx) => (
                        <li key={pidx} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Citations */}
                {resp.citations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Supporting References:</h4>
                    <ul className="space-y-1">
                      {resp.citations.map((citation, cidx) => (
                        <li key={cidx} className="text-xs text-muted-foreground">
                          • {citation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {generatedResponses.length === 0 && (
        <Alert className="rounded-lg">
          <AlertDescription className="text-sm">Generate responses to get started. Create multiple responses for comprehensive defense prep.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
