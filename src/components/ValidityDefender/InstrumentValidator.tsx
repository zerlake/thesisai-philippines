'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SAMPLE_VALIDATION_RESULT } from '@/lib/validity-defender-sample-data';

interface InstrumentValidatorProps {
  thesisId: string;
  onInstrumentSaved: (instrumentId: string) => void;
}

interface ValidationResult {
  success: boolean;
  instrumentId?: string;
  validation?: {
    validityGaps: string[];
    suggestions: string[];
    metrics: Record<string, unknown>;
    defensePoints: string[];
  };
  error?: string;
}

export default function InstrumentValidator({ thesisId, onInstrumentSaved }: InstrumentValidatorProps) {
  const [instrumentName, setInstrumentName] = useState('');
  const [instrumentType, setInstrumentType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    const handleLoadSampleData = (event: Event) => {
      const customEvent = event as CustomEvent;
      const sampleData = customEvent.detail;
      
      setInstrumentName(sampleData.instrumentName);
      setInstrumentType(sampleData.instrumentType);
      setDescription(sampleData.description);
      setContent(sampleData.content);
      
      // Simulate validation with sample result
      setTimeout(() => {
        setResult(SAMPLE_VALIDATION_RESULT);
        onInstrumentSaved(SAMPLE_VALIDATION_RESULT.instrumentId!);
      }, 1500);
    };

    window.addEventListener('loadSampleData', handleLoadSampleData);
    return () => window.removeEventListener('loadSampleData', handleLoadSampleData);
  }, [onInstrumentSaved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instrumentName || !instrumentType || !content) {
      setResult({
        success: false,
        error: 'Please fill in all required fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/instruments/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesisId,
          instrumentName,
          instrumentType,
          description,
          content,
        }),
      });

      const data = (await response.json()) as ValidationResult;

      if (!response.ok) {
        setResult({ success: false, error: data.error || 'Validation failed' });
        return;
      }

      setResult(data);
      if (data.instrumentId) {
        onInstrumentSaved(data.instrumentId);
      }

      // Reset form on success
      setInstrumentName('');
      setInstrumentType('');
      setDescription('');
      setContent('');
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Instrument Name *
            </label>
            <Input
              id="name"
              placeholder="e.g., Student Engagement Survey"
              value={instrumentName}
              onChange={(e) => setInstrumentName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Instrument Type *
            </label>
            <Select value={instrumentType} onValueChange={setInstrumentType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="questionnaire">Questionnaire</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="focus-group">Focus Group</SelectItem>
                <SelectItem value="observation">Observation Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            placeholder="e.g., Purpose, sample size, adaptation notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Instrument Content *
          </label>
          <Textarea
            id="content"
            placeholder="Paste your survey questions, interview protocol, or observation guide here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="resize-none font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">Include all questions, scales, and instructions</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Analyzing...' : 'Validate Instrument'}
          </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.success ? (
            <>
              <Alert className="border-green-200 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 font-semibold">Validation Complete</AlertTitle>
                <AlertDescription className="text-green-800 text-sm">
                  Your instrument has been analyzed and saved.
                </AlertDescription>
              </Alert>

              {result.validation && (
                <div className="space-y-4">
                  {/* Validity Gaps */}
                  {result.validation.validityGaps.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="pt-6">
                        <h3 className="mb-3 font-semibold text-amber-900">Identified Gaps</h3>
                        <ul className="space-y-2">
                          {result.validation.validityGaps.map((gap, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-amber-900">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggestions */}
                  {result.validation.suggestions.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-6">
                        <h3 className="mb-3 font-semibold text-blue-900">Recommendations</h3>
                        <ul className="space-y-2">
                          {result.validation.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-blue-900">
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Defense Points */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-6">
                      <h3 className="mb-3 font-semibold text-purple-900">Key Defense Points</h3>
                      <ul className="space-y-2">
                        {result.validation.defensePoints.map((point, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-purple-900">
                            <span className="inline-block h-2 w-2 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Failed</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
